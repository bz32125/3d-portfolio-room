import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CHARACTER, ANIMATIONS } from '../config.js';
import { loadingManager } from '../materials/textures.js';

// Karakteri: lëvizja nëpër rrugë (path), gjendjet (idle, walking, sitting...)
// dhe animacionet. Rubrika "Animation" (Faza 8): GLTFLoader + AnimationMixer me
// crossfade mes klipeve, shpejtësia e ecjes e sinkronizuar me klipin (pa
// "rrëshqitje" të këmbëve), gjithçka me delta-kohë.
// Pa model (skedari mungon) mbetet kapsula: loja punon njësoj.

const TURN_SPEED = 8; // sa shpejt rrotullohet drejt drejtimit të ri

// Cili animacion (çelës në ANIMATIONS) luhet në cilën gjendje
const STATE_CLIP = {
  idle: 'idle',
  walking: 'walk',
  sitting: 'sitType', // në karrige: shtyp në kompjuter
  reading: 'read', // në kolltuk
  sleeping: 'sleep', // në shtrat
  atShelf: 'shelf', // para raftit me librin e portfolios
};

export class Character {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'character';

    // Kapsula (placeholder) me "hundë" që tregon nga shikon
    const material = new THREE.MeshStandardMaterial({ color: 0x4f7cac, roughness: 0.6 });
    // CapsuleGeometry(rrezja, gjatësia e pjesës së mesme): lartësia = 1.25 + 2 × 0.2 = 1.65 m
    this.body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.25, 6, 16), material);
    this.body.position.y = 0.825;
    this.body.castShadow = true;
    // Hunda është fëmijë i trupit: kur trupi shtrihet, hunda shkon me të.
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), material);
    nose.position.set(0, 0.625, 0.2); // përpara = +Z lokale, afër kokës
    this.body.add(nose);
    this.root.add(this.body);

    this.speed = CHARACTER.walkSpeed; // m/s; me model zëvendësohet me shpejtësinë e klipit
    this.state = 'idle'; // idle | walking | sitting | reading | atShelf | sleeping
    this.path = [];
    this.onArrive = null; // çfarë ndodh kur mbërrin (p.sh. ulet)
    this.spot = null; // vendi ku ndodhet tani (karrige, kolltuk...), ose null

    // Animacionet (vetëm kur ngarkohet modeli)
    this.model = null;
    this.mixer = null;
    this.actions = {}; // çelësi nga ANIMATIONS → AnimationAction
    this.current = null; // AnimationAction që po luhet
  }

  /**
   * Ngarkon modelin glTF. Nëse mungon ose s'lexohet, mbetet kapsula dhe
   * shkruajmë një paralajmërim të qartë (jo gabim): loja vazhdon.
   */
  async loadModel(url = `${import.meta.env.BASE_URL}${CHARACTER.modelUrl}`) {
    try {
      // Kontroll paraprak: serveri i Vite-s, për një skedar që s'ekziston,
      // kthen index.html me status 200, ndaj shikojmë edhe content-type.
      const head = await fetch(url, { method: 'HEAD' });
      const type = head.headers.get('content-type') ?? '';
      if (!head.ok || type.includes('text/html')) throw new Error('file not found');
      const gltf = await new GLTFLoader(loadingManager).loadAsync(url);
      this.useModel(gltf);
    } catch (err) {
      console.warn(
        `[character] ${url}: ${err.message}. Keeping the capsule placeholder. ` +
          'Put the Quaternius glTF at public/models/character.glb to get the animated character.',
      );
    }
  }

  /** Vendos modelin në vend të kapsulës dhe përgatit animacionet. */
  useModel(gltf) {
    const model = gltf.scene;

    // Shkallëzimi: modeli bëhet CHARACTER.height i lartë, me këmbët në dysheme
    const box = new THREE.Box3().setFromObject(model);
    const scale = CHARACTER.height / (box.max.y - box.min.y);
    model.scale.setScalar(scale);
    model.position.y = -box.min.y * scale;
    model.updateMatrixWorld(true);

    // Hijet: modeli i hedh dhe i merr. Frustum culling mbetet aktiv (default):
    // three.js nuk vizaton modelin kur ai është jashtë pamjes së kamerës.
    model.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });

    // Lista e klipeve, një herë, që emrat të vendosen në config.js → ANIMATIONS
    console.info('[character] animation clips:', gltf.animations.map((c) => c.name));

    // AnimationMixer: "luajtësi" i animacioneve për këtë model.
    // Për çdo veprim gjejmë klipin dhe krijojmë një AnimationAction.
    this.mixer = new THREE.AnimationMixer(model);
    for (const [key, names] of Object.entries(ANIMATIONS)) {
      const clip = findClip(gltf.animations, names);
      if (clip) this.actions[key] = this.mixer.clipAction(clip);
    }
    // Rezervat: nëse s'ka klip të veçantë, përdorim një të ngjashëm
    this.actions.sit ??= this.actions.idle;
    this.actions.sitType ??= this.actions.sit;
    this.actions.read ??= this.actions.sit;
    this.actions.sleep ??= this.actions.idle;
    this.actions.shelf ??= this.actions.idle;
    console.info(
      '[character] mapping:',
      Object.fromEntries(Object.entries(this.actions).map(([k, a]) => [k, a?.getClip().name])),
    );

    // Ecja pa rrëshqitje: shpejtësia e lëvizjes = shpejtësia e matur e klipit
    if (this.actions.walk) {
      const measured = measureWalkSpeed(model, this.actions.walk.getClip());
      if (measured) this.speed = measured;
      console.info(`[character] walk speed synced to clip: ${this.speed.toFixed(2)} m/s`);
    }

    this.body.visible = false; // kapsula fshihet, modeli zë vendin e saj
    this.root.add(model);
    this.model = model;
    this.current = null;
    this.animate(); // nis animacionin e gjendjes aktuale (p.sh. ecja e hyrjes)
  }

  /** Ndryshon gjendjen dhe animacionin përkatës. */
  setState(state) {
    this.state = state;
    this.animate();
  }

  /**
   * Crossfade: klipi i ri hyn gradualisht (fadeIn) ndërsa i vjetri del (fadeOut),
   * të dy në CHARACTER.fade sekonda. Pa këtë, poza do të "kërcente".
   */
  animate() {
    if (!this.mixer) return;
    const next = this.actions[STATE_CLIP[this.state]] ?? this.actions.idle;
    if (!next || next === this.current) return;
    next.reset().fadeIn(CHARACTER.fade).play();
    if (this.current) this.current.fadeOut(CHARACTER.fade);
    this.current = next;
  }

  /** Nis ecjen përgjatë një liste pikash. */
  walk(path, onArrive = null) {
    this.path = path.slice(1); // pika e parë është vetë pozicioni aktual
    this.onArrive = onArrive;
    this.setState(this.path.length ? 'walking' : 'idle');
    if (!this.path.length && onArrive) onArrive(this);
  }

  /** Vendos karakterin në një "spot" (karrige, kolltuk, raft). */
  placeAt(spot, state) {
    this.spot = spot;
    this.root.position.copy(spot.position);
    this.root.rotation.y = spot.rotationY;
    this.setState(state);
    if (this.model) return; // modeli e tregon veprimin me animacion
    // Kapsula: "ulja" tregohet duke e shkurtuar kapsulën
    if (state === 'sitting' || state === 'reading') this.body.scale.y = 0.65;
    // Kapsula: "gjumi" = shtrihet (-90° rreth X), koka drejt -Z lokale,
    // mbi dyshek (lartësia e spot-it jep sa lart).
    if (state === 'sleeping') {
      this.body.rotation.x = -Math.PI / 2;
      this.body.position.y = 0.2;
    }
  }

  /** Ngrihet: kthehet te pika ku kishte ardhur (approach), në këmbë. */
  standUp() {
    this.body.scale.y = 1;
    this.body.rotation.x = 0;
    this.body.position.y = 0.825;
    if (this.spot) this.root.position.copy(this.spot.approach);
    this.spot = null;
    this.setState('idle');
  }

  /** Thirret në çdo kuadër me delta-kohën (sekonda). */
  update(dt) {
    // Mixer-i përparon të gjitha animacionet aktive (edhe crossfade-t) me dt
    if (this.mixer) this.mixer.update(dt);
    if (this.state !== 'walking') return;

    const pos = this.root.position;

    // Rrotullimi drejt pikës së radhës: këndi i synuar me atan2, pastaj afrimi gradual
    const target = this.path[0];
    const desired = Math.atan2(target.x - pos.x, target.z - pos.z);
    let diff = desired - this.root.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // në intervalin [-π, π]
    this.root.rotation.y += diff * Math.min(1, TURN_SPEED * dt);

    // Distanca në këtë kuadër, e pavarur nga FPS. Pikat e rrugës janë çdo 10 cm,
    // ndaj në një kuadër mund të kalojmë disa prej tyre: pjesa që mbetet pas
    // një pike vazhdon drejt pikës tjetër (përndryshe karakteri do të ngadalësohej).
    let remaining = this.speed * dt;
    while (remaining > 0 && this.path.length) {
      const next = this.path[0];
      const dx = next.x - pos.x;
      const dz = next.z - pos.z;
      const dist = Math.hypot(dx, dz);
      if (dist <= remaining) {
        pos.set(next.x, 0, next.z);
        remaining -= dist;
        this.path.shift();
      } else {
        pos.x += (dx / dist) * remaining;
        pos.z += (dz / dist) * remaining;
        remaining = 0;
      }
    }

    if (!this.path.length) {
      this.setState('idle');
      if (this.onArrive) this.onArrive(this);
    }
  }
}

/** Gjen klipin: fillimisht emrin e saktë, pastaj emrin si pjesë (pa dallim shkronjash). */
function findClip(clips, names) {
  for (const name of names) {
    const clip = clips.find((c) => c.name === name);
    if (clip) return clip;
  }
  for (const name of names) {
    const clip = clips.find((c) => c.name.toLowerCase().includes(name.toLowerCase()));
    if (clip) return clip;
  }
  return null;
}

/**
 * Sa shpejt "ecën" klipi (m/s). Ideja: kur një këmbë prek dyshemenë, ajo s'duhet
 * të rrëshqasë; pra trupi lëviz përpara me të njëjtën shpejtësi me të cilën
 * këmba lëviz mbrapa (në hapësirën e modelit). E masim duke luajtur klipin në
 * 40 pika kohe dhe duke parë këmbën kur është në pikën e saj më të ulët.
 * Kthen null nëse s'gjen kockë këmbe ose vlera s'ka kuptim.
 */
function measureWalkSpeed(model, clip) {
  let foot = null;
  model.traverse((o) => {
    if (!foot && o.isBone && /foot|ankle/i.test(o.name)) foot = o;
  });
  if (!foot) return null;

  const mixer = new THREE.AnimationMixer(model);
  mixer.clipAction(clip).play();
  const samples = [];
  const p = new THREE.Vector3();
  const N = 40;
  for (let i = 0; i <= N; i++) {
    mixer.setTime((i / N) * clip.duration);
    model.updateMatrixWorld(true);
    foot.getWorldPosition(p); // modeli s'ka prind ende: "world" = hapësira e modelit
    samples.push({ y: p.y, z: p.z, t: (i / N) * clip.duration });
  }
  mixer.stopAllAction();
  mixer.uncacheRoot(model);

  // Këmba në tokë = brenda 2 cm nga lartësia minimale
  const minY = Math.min(...samples.map((s) => s.y));
  const speeds = [];
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i - 1];
    const b = samples[i];
    if (a.y < minY + 0.02 && b.y < minY + 0.02) speeds.push(Math.abs(b.z - a.z) / (b.t - a.t));
  }
  if (!speeds.length) return null;
  const speed = speeds.reduce((s, v) => s + v, 0) / speeds.length;
  return speed > 0.3 && speed < 3 ? speed : null; // vlera të pamundshme → rezerva
}

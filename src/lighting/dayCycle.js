import * as THREE from 'three';
import { DAY, WINDOW, BOUNDS, CORRIDOR, ROOM } from '../config.js';
import { sampleNumber, sampleColor, smoothstep } from './keyframes.js';
import { createRoomLights } from './roomLights.js';
import { createLightShafts } from './lightShafts.js';

// Cikli i ditës: një orë (0–24) → dielli, qielli, rrezet, dritat e dhomës, ekspozimi.
// Rubrika "Lighting": DirectionalLight me hije (bias / normalBias të rregulluara,
//   shadow camera e përshtatur ngushtë rreth dhomës) + HemisphereLight.
// Rubrika "Colour": ngjyra e diellit dhe e qiellit nga keyframe-t, ekspozimi i ACES.
// Rubrika "Animation": ora e shfaqur ndjek slider-in me easing të pavarur nga FPS.

const DEG = Math.PI / 180;

// Kutia që duhet të mbulojë hartën e hijeve: dhoma + korridori.
// Jashtë kësaj kutie three.js e konsideron çdo pikë "të ndriçuar".
const SHADOW_BOX = new THREE.Box3(
  new THREE.Vector3(CORRIDOR.minX, 0, BOUNDS.back),
  new THREE.Vector3(BOUNDS.right, ROOM.height, BOUNDS.front),
);

export class DayCycle {
  /**
   * @param {THREE.WebGLRenderer} renderer  për ekspozimin (toneMappingExposure)
   * @param {THREE.Scene} scene  për intensitetin e environment map
   * @param {THREE.Mesh} sky  plani me vertexColors prapa dritares (windowWall.js)
   */
  constructor(renderer, scene, sky) {
    this.renderer = renderer;
    this.scene = scene;
    this.sky = sky;
    this.group = new THREE.Group();
    this.group.name = 'day-cycle';

    // HemisphereLight: qielli lart, dyshemeja e ngrohtë poshtë (drita e reflektuar)
    this.hemi = new THREE.HemisphereLight(0xfff4e6, 0xd9cbb8, 1);
    this.hemiDay = new THREE.Color(0xfff4e6); // ditën: e ngrohtë-neutrale (drita e reflektuar nga muret)
    this.hemiNight = new THREE.Color(0x5a6a9a); // natën: blu e errët (drita e hënës)
    this.group.add(this.hemi);

    // Dielli: DirectionalLight = rreze paralele (dielli është shumë larg)
    this.sun = new THREE.DirectionalLight(0xffffff, 0);
    this.sun.castShadow = true;
    const shadow = this.sun.shadow;
    shadow.mapSize.set(DAY.shadowMapSize, DAY.shadowMapSize);
    // bias: e shtyn pak thellësinë, kundër "shadow acne" (vija në sipërfaqe).
    // normalBias: e zhvendos pikën përgjatë normales; më e mirë për kënde të ulëta.
    // Të dyja të vogla, që hija të mos "shkëputet" nga objekti (peter-panning).
    shadow.bias = -0.0004;
    shadow.normalBias = 0.02;
    // Drita shikon drejt qendrës së dritares në dysheme
    this.sun.target.position.set(0, 0, WINDOW.centerZ);
    this.group.add(this.sun, this.sun.target);

    this.roomLights = createRoomLights();
    this.shafts = createLightShafts();
    this.group.add(this.roomLights.group, this.shafts.group);

    // Kamera ndihmëse për të llogaritur kufijtë e shadow camera (shih fitShadowCamera)
    this.probe = new THREE.OrthographicCamera();

    // Gjendja publike: shader-i i perdeve (Faza 6) i lexon këto
    this.sunColor = new THREE.Color();
    this.sunIntensity = 0;
    this.night = 0;
    this.sunDirection = new THREE.Vector3(); // drejtimi i udhëtimit të dritës

    // Ora: `hour` = ç'shihet tani, `targetHour` = ç'kërkoi përdoruesi
    this.auto = false;
    this.targetHour = DAY.startHour;
    this.hour = DAY.startHour;
    this.setTime(this.hour);
  }

  /**
   * Thelbi i ciklit: vendos gjithçka për orën `hours` (0–24), menjëherë.
   */
  setTime(hours) {
    const h = ((hours % 24) + 24) % 24;
    this.hour = h;

    // 1. Pozicioni i diellit. t: 0 në lindje, 1 në perëndim.
    //    Lartësia (elevation) ndjek një hark sinus, me maksimum në mesditë.
    //    Azimuti lëviz nga -Z (mëngjes) në +Z (mbrëmje), gjithmonë nga +X (dritarja).
    const t = THREE.MathUtils.clamp((h - DAY.sunrise) / (DAY.sunset - DAY.sunrise), 0, 1);
    const elevation = (DAY.minElevation + (DAY.maxElevation - DAY.minElevation) * Math.sin(Math.PI * t)) * DEG;
    const azimuth = (t - 0.5) * 2 * DAY.azimuthSwing * DEG;
    const toSun = new THREE.Vector3(
      Math.cos(elevation) * Math.cos(azimuth),
      Math.sin(elevation),
      Math.cos(elevation) * Math.sin(azimuth),
    );
    this.sun.position.copy(this.sun.target.position).addScaledVector(toSun, 10);
    this.sunDirection.copy(toSun).negate();

    // 2. Intensiteti dhe ngjyra e diellit nga keyframe-t (config.js)
    this.sunIntensity = sampleNumber(DAY.sunIntensity, h);
    this.sun.intensity = this.sunIntensity;
    sampleColor(DAY.sunColor, h, this.sunColor);
    this.sun.color.copy(this.sunColor);
    // Natën s'ka nevojë të rivizatohet harta e hijeve (kursim i një render pass-i)
    this.sun.shadow.autoUpdate = this.sunIntensity > 0.001;
    this.fitShadowCamera();

    // 3. Qielli prapa dritares: 2 kulmet lart = zenith, 2 poshtë = horizont
    const colors = this.sky.geometry.attributes.color;
    const top = sampleColor(DAY.skyTop, h, new THREE.Color());
    const horizon = sampleColor(DAY.skyHorizon, h, new THREE.Color());
    // PlaneGeometry: kulmet 0,1 janë rreshti i sipërm, 2,3 i poshtmi
    colors.setXYZ(0, top.r, top.g, top.b);
    colors.setXYZ(1, top.r, top.g, top.b);
    colors.setXYZ(2, horizon.r, horizon.g, horizon.b);
    colors.setXYZ(3, horizon.r, horizon.g, horizon.b);
    colors.needsUpdate = true; // i thotë GPU-së t'i ringarkojë ngjyrat

    // 4. Faktori i natës (0 ditë → 1 natë), me kalim të butë në mbrëmje dhe mëngjes
    this.night = Math.max(
      smoothstep(DAY.nightFadeIn[0], DAY.nightFadeIn[1], h),
      1 - smoothstep(DAY.nightFadeOut[0], DAY.nightFadeOut[1], h),
    );
    this.roomLights.setNight(this.night);
    this.hemi.intensity = sampleNumber(DAY.hemiIntensity, h);
    this.hemi.color.lerpColors(this.hemiDay, this.hemiNight, this.night);

    // 5. Rrezet: më të forta kur dielli është i fortë, pak më të dukshme kur është i ulët
    const lowSun = 1 - (elevation - DAY.minElevation * DEG) / ((DAY.maxElevation - DAY.minElevation) * DEG);
    const strength = Math.min(1, this.sunIntensity / 1.2) * (0.5 + 0.5 * lowSun);
    this.shafts.update(this.sunDirection, this.sunColor, strength);

    // 6. Ekspozimi i ACES: natën pak më i lartë, që dhoma e ngrohtë të shihet
    this.renderer.toneMappingExposure = THREE.MathUtils.lerp(DAY.exposureDay, DAY.exposureNight, this.night);
    // 7. Environment map: reflektimet dhe drita e butë, më e dobët natën
    this.scene.environmentIntensity = THREE.MathUtils.lerp(DAY.envDay, DAY.envNight, this.night);
  }

  /**
   * Shadow camera e DirectionalLight është OrthographicCamera.
   * E përshtatim ngushtë: 8 këndet e kutisë së dhomës i kalojmë në hapësirën e
   * dritës (view space) dhe marrim min/max. Sa më e vogël zona, aq më shumë
   * piksel të hartës së hijeve për çdo metër, pra hije më të mprehta.
   */
  fitShadowCamera() {
    const probe = this.probe;
    probe.position.copy(this.sun.position);
    probe.lookAt(this.sun.target.position); // si shadow camera: shikon nga dielli te target
    probe.updateMatrixWorld();

    const min = new THREE.Vector3(Infinity, Infinity, Infinity);
    const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
    const corner = new THREE.Vector3();
    for (let i = 0; i < 8; i++) {
      corner.set(
        i & 1 ? SHADOW_BOX.max.x : SHADOW_BOX.min.x,
        i & 2 ? SHADOW_BOX.max.y : SHADOW_BOX.min.y,
        i & 4 ? SHADOW_BOX.max.z : SHADOW_BOX.min.z,
      );
      corner.applyMatrix4(probe.matrixWorldInverse); // botë → hapësira e dritës
      min.min(corner);
      max.max(corner);
    }
    const cam = this.sun.shadow.camera;
    cam.left = min.x;
    cam.right = max.x;
    cam.bottom = min.y;
    cam.top = max.y;
    // Kamera shikon nga -Z, ndaj "afër" = -max.z dhe "larg" = -min.z
    cam.near = Math.max(0.1, -max.z - 0.5);
    cam.far = -min.z + 0.5;
    cam.updateProjectionMatrix();
  }

  /** Slider-i: ora e re që duhet arritur (me lëvizje të butë). */
  setTarget(hours) {
    this.targetHour = hours;
  }

  /** Thirret në çdo kuadër me delta-kohën. */
  update(dt) {
    if (this.auto) this.targetHour = (this.targetHour + dt / DAY.secondsPerHour) % 24;

    // Diferenca më e shkurtër në rreth (23:50 → 00:10 = +20 min, jo -23 orë)
    const diff = ((this.targetHour - this.hour + 36) % 24) - 12;
    if (Math.abs(diff) < 0.001) return; // asgjë s'ndryshon: s'llogarisim kot
    // Easing eksponencial: çdo kuadër mbyllim një pjesë të diferencës.
    // 1 - e^(-k·dt) e bën lëvizjen njësoj në 30, 60 ose 144 FPS.
    const k = this.auto ? 1 : 1 - Math.exp(-DAY.smoothing * dt);
    this.setTime(this.hour + diff * k);
  }
}

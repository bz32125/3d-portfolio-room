import * as THREE from 'three';

// Karakteri i përkohshëm: një kapsulë me "hundë" që tregon nga shikon.
// Kur të vijë modeli me animacione, zëvendësohet vetëm `body`;
// lëvizja dhe gjendjet mbeten njësoj.

const SPEED = 1.3; // m/s, ritëm i qetë ecjeje
const TURN_SPEED = 8; // sa shpejt rrotullohet drejt drejtimit të ri

export class Character {
  constructor() {
    this.root = new THREE.Group();
    this.root.name = 'character';

    const material = new THREE.MeshStandardMaterial({ color: 0x4f7cac, roughness: 0.6 });
    // CapsuleGeometry(rrezja, gjatësia e pjesës së mesme): lartësia = 1.25 + 2 × 0.2 = 1.65 m
    this.body = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 1.25, 6, 16), material);
    this.body.position.y = 0.825;
    this.body.castShadow = true;
    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.12), material);
    nose.position.set(0, 1.45, 0.2); // përpara = +Z lokale
    this.root.add(this.body, nose);

    this.state = 'idle'; // idle | walking | sitting | reading | atShelf
    this.path = [];
    this.onArrive = null; // çfarë ndodh kur mbërrin (p.sh. ulet)
    this.spot = null; // vendi ku ndodhet tani (karrige, kolltuk...), ose null
  }

  /** Nis ecjen përgjatë një liste pikash. */
  walk(path, onArrive = null) {
    this.path = path.slice(1); // pika e parë është vetë pozicioni aktual
    this.onArrive = onArrive;
    this.state = this.path.length ? 'walking' : 'idle';
    if (!this.path.length && onArrive) onArrive(this);
  }

  /** Vendos karakterin në një "spot" (karrige, kolltuk, raft). */
  placeAt(spot, state) {
    this.spot = spot;
    this.root.position.copy(spot.position);
    this.root.rotation.y = spot.rotationY;
    this.state = state;
    // Placeholder: "ulja" tregohet duke e shkurtuar kapsulën
    if (state === 'sitting' || state === 'reading') this.body.scale.y = 0.65;
  }

  /** Ngrihet: kthehet te pika ku kishte ardhur (approach), në këmbë. */
  standUp() {
    this.body.scale.y = 1;
    if (this.spot) this.root.position.copy(this.spot.approach);
    this.spot = null;
    this.state = 'idle';
  }

  /** Thirret në çdo kuadër me delta-kohën (sekonda). */
  update(dt) {
    if (this.state !== 'walking') return;
    const target = this.path[0];
    const pos = this.root.position;
    const toTarget = new THREE.Vector3(target.x - pos.x, 0, target.z - pos.z);
    const dist = toTarget.length();
    const step = SPEED * dt; // distanca në këtë kuadër, e pavarur nga FPS

    // Rrotullimi drejt drejtimit: këndi i synuar me atan2, pastaj afrimi gradual
    const desired = Math.atan2(toTarget.x, toTarget.z);
    let diff = desired - this.root.rotation.y;
    diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // në intervalin [-π, π]
    this.root.rotation.y += diff * Math.min(1, TURN_SPEED * dt);

    if (dist <= step) {
      pos.set(target.x, 0, target.z);
      this.path.shift();
      if (!this.path.length) {
        this.state = 'idle';
        if (this.onArrive) this.onArrive(this);
      }
    } else {
      pos.addScaledVector(toTarget.normalize(), step);
    }
  }
}

import * as THREE from 'three';

// Lëvizje e butë e kamerës nga një pamje te një tjetër.
// Çdo kuadër: t rritet me dt / duration; ease(t) e bën fillimin dhe fundin
// të ngadalshëm (ease-in-out), pa kërcime. Ndalet nëse përdoruesi e kap kamerën.

const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export class CameraTween {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.active = null;
    // Nëse përdoruesi fillon të rrotullojë, tween-i ndalet (ai ka kontrollin)
    controls.addEventListener('start', () => (this.active = null));
  }

  to(position, target, duration = 2.5) {
    this.active = {
      fromPos: this.camera.position.clone(),
      fromTarget: this.controls.target.clone(),
      toPos: position.clone(),
      toTarget: target.clone(),
      t: 0,
      duration,
    };
  }

  update(dt) {
    const a = this.active;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.duration);
    const k = easeInOutCubic(a.t);
    this.camera.position.lerpVectors(a.fromPos, a.toPos, k);
    this.controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
    if (a.t === 1) this.active = null;
  }
}

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

import * as THREE from 'three';
import { ease } from './tween.js';

// Lëvizje e butë e kamerës nga një pamje te një tjetër.
// Çdo kuadër: t rritet me dt / duration; ease(t) e bën fillimin dhe fundin
// të ngadalshëm (ease-in-out), pa kërcime. Ndalet nëse përdoruesi e kap kamerën.
// to() kthen një Promise (Faza 9), që libri të presë kamerën me `await`.

export class CameraTween {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this.active = null;
    // Nëse përdoruesi fillon të rrotullojë, tween-i ndalet (ai ka kontrollin)
    controls.addEventListener('start', () => this.stop());
  }

  to(position, target, duration = 2.5, easing = ease.inOutCubic) {
    this.stop(); // një lëvizje e re zëvendëson të vjetrën
    return new Promise((resolve) => {
      this.active = {
        fromPos: this.camera.position.clone(),
        fromTarget: this.controls.target.clone(),
        toPos: position.clone(),
        toTarget: target.clone(),
        t: 0,
        duration,
        easing,
        resolve,
      };
    });
  }

  /** Ndalon lëvizjen aktuale (Promise-i i saj përfundon, që askush të mos presë përgjithmonë). */
  stop() {
    if (this.active) this.active.resolve();
    this.active = null;
  }

  update(dt) {
    const a = this.active;
    if (!a) return;
    a.t = Math.min(1, a.t + dt / a.duration);
    const k = a.easing(a.t);
    this.camera.position.lerpVectors(a.fromPos, a.toPos, k);
    this.controls.target.lerpVectors(a.fromTarget, a.toTarget, k);
    if (a.t === 1) {
      this.active = null;
      a.resolve();
    }
  }
}

export const V = (x, y, z) => new THREE.Vector3(x, y, z);

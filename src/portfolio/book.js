import * as THREE from 'three';
import { tween, ease } from '../core/tween.js';

// Hapja e librit të portfolios (Faza 9): libri del nga rafti, kthehet me
// kopertinë nga ne, kopertina hapet rreth menteshës dhe kamera "zhytet" në faqe;
// pastaj del faqja HTML (overlay.js). Mbyllja bën të njëjtat hapa mbrapsht.
// Rubrika "Animation": sekuencë tween-esh me easing, të vëna në radhë me await;
// "Interaction": kamera kthehet saktësisht te pamja e mëparshme.

const SLIDE = 0.33; // m: sa del libri nga rafti
const LIFT = 0.06; // m: sa ngrihet pasi del
const OPEN_ANGLE = -0.95 * Math.PI; // kopertina hapet ~171°, pothuajse e sheshtë

export class PortfolioBook {
  /**
   * @param {object} o  book (Group nga bookshelf.js), camera, controls, cameraTween,
   *                    overlay (overlay.js), onClosed() (thirret kur kthehemi në dhomë)
   */
  constructor({ book, camera, controls, cameraTween, overlay, onClosed }) {
    this.book = book;
    this.hinge = book.getObjectByName('hinge');
    this.camera = camera;
    this.controls = controls;
    this.cameraTween = cameraTween;
    this.overlay = overlay;
    this.onClosed = onClosed;
    this.home = book.position.clone(); // vendi i librit në raft
    this.state = 'closed'; // closed | opening | open | closing

    // Ku qëndron libri i hapur, dhe dy pamjet e kamerës (të llogaritura një herë).
    // Pas rrotullimit -90°, faqja e parë (+X lokale) shikon nga +Z, drejt dhomës;
    // kopertina hapet majtas (-X), ndaj qendra e dy faqeve është ~10 cm majtas.
    const present = this.home.clone().add(new THREE.Vector3(0, LIFT, SLIDE));
    const spread = present.clone().add(new THREE.Vector3(-0.08, 0, 0.02));
    const page = present.clone().add(new THREE.Vector3(0.0, 0, 0.03));
    this.closeUp = { pos: spread.clone().add(new THREE.Vector3(0.1, 0.12, 0.62)), target: spread };
    this.dive = { pos: page.clone().add(new THREE.Vector3(0, 0, 0.06)), target: page };

    overlay.onCloseRequest = () => this.close();
  }

  get busy() {
    return this.state !== 'closed';
  }

  async open() {
    if (this.state !== 'closed') return;
    this.state = 'opening';
    // Ruajmë pamjen aktuale, që "Back to the room" të kthehet saktësisht aty
    this.saved = { pos: this.camera.position.clone(), target: this.controls.target.clone() };
    this.controls.enabled = false; // gjatë animacionit kamera s'kapet nga përdoruesi
    // OrbitControls e mban kamerën të paktën minDistance (1 m) larg target-it,
    // edhe kur e lëvizim ne: pa këtë, afrimi dhe "zhytja" në faqe s'do të ndodhnin.
    this.savedMinDistance = this.controls.minDistance;
    this.controls.minDistance = 0.01;

    // 1. Kamera afrohet (1.5 s, ease-in-out) ndërsa libri rrëshqet jashtë raftit
    const z0 = this.home.z;
    await Promise.all([
      this.cameraTween.to(this.closeUp.pos, this.closeUp.target, 1.5),
      tween(0.8, (k) => (this.book.position.z = z0 + SLIDE * k)),
    ]);
    // 2. Kthehet me kopertinë nga ne (-90° rreth Y) dhe ngrihet pak
    await tween(0.6, (k) => {
      this.book.rotation.y = (-Math.PI / 2) * k;
      this.book.position.y = this.home.y + LIFT * k;
    });
    // 3. Kopertina hapet: rrotullojmë menteshën, jo kopertinën vetë
    await tween(0.8, (k) => (this.hinge.rotation.y = OPEN_ANGLE * k));
    // 4. "Zhytja": kamera përshpejton drejt faqes (ease-in); në gjysmë del faqja HTML
    const diving = this.cameraTween.to(this.dive.pos, this.dive.target, 0.9, ease.inCubic);
    await tween(0.45, () => {});
    this.overlay.show();
    await diving;
    this.state = 'open';
  }

  async close() {
    if (this.state !== 'open') return;
    this.state = 'closing';
    this.overlay.hide();
    // Hapat e hapjes, mbrapsht
    await this.cameraTween.to(this.closeUp.pos, this.closeUp.target, 0.9, ease.outCubic);
    await tween(0.7, (k) => (this.hinge.rotation.y = OPEN_ANGLE * (1 - k)));
    await tween(0.5, (k) => {
      this.book.rotation.y = (-Math.PI / 2) * (1 - k);
      this.book.position.y = this.home.y + LIFT * (1 - k);
    });
    const z0 = this.home.z;
    await Promise.all([
      tween(0.7, (k) => (this.book.position.z = z0 + SLIDE * (1 - k))),
      this.cameraTween.to(this.saved.pos, this.saved.target, 1.5),
    ]);
    this.controls.minDistance = this.savedMinDistance;
    this.controls.enabled = true;
    this.state = 'closed';
    this.onClosed?.();
  }
}

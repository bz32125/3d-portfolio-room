import * as THREE from 'three';

// Raycaster-i: nga pozicioni i miut (pixel) te objekti 3D poshtë tij.
//  1. pixel → NDC (Normalized Device Coordinates, nga -1 deri në +1)
//  2. NDC + kamera → një rreze në botën 3D
//  3. rrezja pret objektet; i pari në listë është më i afërti

const HIGHLIGHT = new THREE.Color(0xffc56b);

export class Picker {
  /**
   * @param {object} opts
   *  camera, canvas, floor (mesh-i i dyshemesë), interactive (objektet me userData.interactive)
   *  onFloorClick(point), onObjectClick(name)
   */
  constructor({ camera, canvas, floor, interactive, onFloorClick, onObjectClick }) {
    this.camera = camera;
    this.canvas = canvas;
    this.floor = floor;
    this.interactive = interactive;
    this.onFloorClick = onFloorClick;
    this.onObjectClick = onObjectClick;
    this.raycaster = new THREE.Raycaster();
    this.ndc = new THREE.Vector2();
    this.hovered = null;
    this.downAt = null;

    canvas.addEventListener('pointermove', (e) => this.onMove(e));
    canvas.addEventListener('pointerdown', (e) => (this.downAt = [e.clientX, e.clientY]));
    canvas.addEventListener('pointerup', (e) => this.onUp(e));
  }

  setFromEvent(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1; // Y në ekran zbret, në NDC ngjitet
    this.raycaster.setFromCamera(this.ndc, this.camera);
  }

  /** Objekti interaktiv nën mi: ngjitemi lart te prindi që ka userData.interactive. */
  pickInteractive() {
    const hit = this.raycaster.intersectObjects(this.interactive, true)[0];
    if (!hit) return null;
    let o = hit.object;
    while (o && !o.userData.interactive) o = o.parent;
    return o;
  }

  onMove(e) {
    this.setFromEvent(e);
    const target = this.pickInteractive();
    if (target !== this.hovered) {
      if (this.hovered) setHighlight(this.hovered, false);
      if (target) setHighlight(target, true);
      this.hovered = target;
      this.canvas.style.cursor = target ? 'pointer' : 'default';
    }
  }

  onUp(e) {
    // Nëse miu lëvizi shumë mes down dhe up, ishte rrotullim i kamerës, jo klik
    if (!this.downAt || Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) > 6) return;
    this.setFromEvent(e);
    const target = this.pickInteractive();
    if (target) return this.onObjectClick(target.userData.interactive);
    const floorHit = this.raycaster.intersectObject(this.floor)[0];
    if (floorHit) this.onFloorClick(floorHit.point);
  }
}

/**
 * Theksimi: materialet janë të përbashkëta (një ndryshim do të ndriçonte gjithë
 * drurin e dhomës), ndaj objekti i theksuar merr kopje të materialeve të veta
 * me emissive, dhe kthehet te origjinalet kur miu largohet.
 */
function setHighlight(object, on) {
  object.traverse((m) => {
    if (!m.isMesh) return;
    if (on) {
      m.userData.originalMaterial = m.material;
      m.material = m.material.clone();
      m.material.emissive = HIGHLIGHT;
      m.material.emissiveIntensity = 0.35;
    } else if (m.userData.originalMaterial) {
      m.material.dispose();
      m.material = m.userData.originalMaterial;
      delete m.userData.originalMaterial;
    }
  });
}

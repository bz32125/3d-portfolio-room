import * as THREE from 'three';
import { BOUNDS } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Pjesa e gjumit (fotot 08–15): shtrati me kokë lëkure të zezë te muri
// përballë rafteve, dy komodina nate dhe tri piktura mbi to.
// Përmasat: shtrat dopio standard 1.6 × 2.0 m (vlerësim).
export const BED = { x: 0.3, width: 1.6, length: 2.05, top: 0.5 };

export function createBed() {
  const g = new THREE.Group();
  g.name = 'bed';
  g.userData.interactive = 'bed'; // klik → karakteri shkon të flejë

  const { x, width, length, top } = BED;
  const back = BOUNDS.front; // koka e shtratit te muri z = +3.5
  const cz = back - 0.08 - length / 2;

  // Baza e zezë, pak më e ngushtë, që shtrati të duket "pezull" (foto 12)
  g.add(box(width - 0.1, 0.18, length - 0.1, MATERIALS.blackMatte, x, 0.09, cz));
  // Korniza e lëkurës
  g.add(box(width + 0.06, 0.14, length, MATERIALS.leatherBlack, x, 0.25, cz));
  // Dysheku dhe mbulesa jeshile që varet pak anash
  g.add(box(width - 0.04, 0.16, length - 0.06, MATERIALS.sheetWhite, x, 0.38, cz));
  g.add(box(width + 0.04, 0.05, length - 0.3, MATERIALS.quiltGreen, x, top - 0.02, cz + 0.12));
  g.add(box(width + 0.1, 0.25, 0.03, MATERIALS.quiltGreen, x, top - 0.14, cz - length / 2 + 0.29)); // fundi
  // Jastëkët
  for (const dx of [-0.38, 0.38]) {
    g.add(box(0.6, 0.12, 0.38, MATERIALS.sheetWhite, x + dx, top + 0.04, back - 0.35));
  }
  // Koka e shtratit: panel i lartë me shirita horizontalë (lëkurë e qepur)
  const headH = 1.15;
  g.add(box(width + 0.25, headH, 0.08, MATERIALS.leatherBlack, x, headH / 2, back - 0.04));
  for (let i = 1; i < 4; i++) {
    g.add(box(width + 0.25, 0.012, 0.01, MATERIALS.plinth, x, 0.55 + i * 0.15, back - 0.085));
  }
  return g;
}

/** Komodinat e natës, në të dy anët e shtratit, me një llambë të vogël. */
export function createNightstands() {
  const g = new THREE.Group();
  g.name = 'nightstands';
  const w = 0.45;
  const d = 0.38;
  const h = 0.45;
  const z = BOUNDS.front - d / 2 - 0.02;
  for (const side of [-1, 1]) {
    const x = BED.x + side * (BED.width / 2 + 0.2 + w / 2);
    g.add(box(w, 0.04, d, MATERIALS.walnut, x, h - 0.02, z)); // pllaka
    g.add(box(w - 0.04, 0.16, d - 0.02, MATERIALS.walnut, x, h - 0.12, z)); // sirtari
    g.add(box(w - 0.04, 0.008, 0.005, MATERIALS.walnutDark, x, h - 0.2, z - d / 2)); // vija
    g.add(box(w - 0.06, 0.02, d - 0.06, MATERIALS.walnutDark, x, 0.22, z)); // rafti poshtë
    for (const dx of [-1, 1]) g.add(box(0.03, h - 0.04, d - 0.04, MATERIALS.plinth, x + dx * (w / 2 - 0.03), (h - 0.04) / 2, z));
  }
  return g;
}

/** Tri pikturat në murin përballë, mes shtratit dhe dritares (foto 11–12). */
export function createPaintings() {
  const g = new THREE.Group();
  g.name = 'paintings';
  const z = BOUNDS.front - 0.015;
  const items = [
    { mat: MATERIALS.paintingOrange, x: 1.55, y: 1.45, w: 0.32, h: 0.45 },
    { mat: MATERIALS.paintingDark, x: 1.95, y: 1.55, w: 0.32, h: 0.5 },
    { mat: MATERIALS.paintingPink, x: 2.3, y: 1.6, w: 0.28, h: 0.45 },
  ];
  for (const p of items) {
    g.add(box(p.w + 0.03, p.h + 0.03, 0.02, MATERIALS.whiteTop, p.x, p.y, z)); // kanavaca
    g.add(box(p.w, p.h, 0.005, p.mat, p.x, p.y, z - 0.012));
  }
  return g;
}

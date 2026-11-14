import * as THREE from 'three';
import { BOUNDS } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Pjesa e gjumit (fotot 08–15): shtrati me kokë lëkure të zezë te muri
// përballë rafteve, dy komodina nate dhe tri piktura mbi to.
// Përmasat: shtrat dopio standard 1.6 × 2.0 m (vlerësim).
export const BED = { x: 0.3, width: 1.6, length: 2.05, top: 0.5 };

// Komodinat: përmasat dhe pozicionet (x) e tyre, të përbashkëta me dritat.
const STAND = { w: 0.45, d: 0.38, h: 0.45 };
const STAND_Z = BOUNDS.front - STAND.d / 2 - 0.02;
const STAND_X = [-1, 1].map((side) => BED.x + side * (BED.width / 2 + 0.2 + STAND.w / 2));

// Qendra e abazhurit të secilës llambë: roomLights.js vendos aty një PointLight.
// Llamba është vlerësim (s'duket qartë në foto): bazë 25 cm + abazhur 18 cm.
export const LAMPS = STAND_X.map((x) => new THREE.Vector3(x, STAND.h + 0.34, STAND_Z + 0.04));

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
  const { w, d, h } = STAND;
  const z = STAND_Z;
  for (const x of STAND_X) {
    g.add(box(w, 0.04, d, MATERIALS.walnut, x, h - 0.02, z)); // pllaka
    g.add(box(w - 0.04, 0.16, d - 0.02, MATERIALS.walnut, x, h - 0.12, z)); // sirtari
    g.add(box(w - 0.04, 0.008, 0.005, MATERIALS.walnutDark, x, h - 0.2, z - d / 2)); // vija
    g.add(box(w - 0.06, 0.02, d - 0.06, MATERIALS.walnutDark, x, 0.22, z)); // rafti poshtë
    for (const dx of [-1, 1]) g.add(box(0.03, h - 0.04, d - 0.04, MATERIALS.plinth, x + dx * (w / 2 - 0.03), (h - 0.04) / 2, z));
  }
  for (const p of LAMPS) g.add(createLamp(p));
  return g;
}

// Gjeometritë e llambës, të përbashkëta për të dyja llambat.
const LAMP_BASE = new THREE.CylinderGeometry(0.02, 0.06, 0.25, 16);
const LAMP_SHADE = new THREE.CylinderGeometry(0.1, 0.14, 0.18, 24, 1, true); // openEnded: tub pa kapak

/** Llamba e natës: këmbë e artë + abazhur pëlhure që shkëlqen natën. */
function createLamp(center) {
  const lamp = new THREE.Group();
  const base = new THREE.Mesh(LAMP_BASE, MATERIALS.gold);
  base.position.set(center.x, STAND.h + 0.125, center.z);
  base.castShadow = true;
  const shade = new THREE.Mesh(LAMP_SHADE, MATERIALS.lampShade);
  shade.position.copy(center);
  // Abazhuri nuk hedh hije: ai mban burimin e dritës brenda vetes
  lamp.add(base, shade);
  return lamp;
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

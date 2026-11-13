import * as THREE from 'three';
import { BOUNDS } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Gardëroba me dyer xhami të errët, në murin e majtë.
export function createWardrobe() {
  const g = new THREE.Group();
  g.name = 'wardrobe';

  const w = 1.8; // përgjatë murit (Z)
  const h = 2.2;
  const d = 0.6; // thellësia (X)
  const x = BOUNDS.left + d / 2;
  const z = 0.8;

  g.add(box(d, h, w, MATERIALS.blackMatte, x, h / 2, z)); // trupi
  // Dy dyer xhami, me një vijë të hollë mes tyre
  for (const dz of [-w / 4, w / 4]) {
    g.add(box(0.01, h - 0.06, w / 2 - 0.03, MATERIALS.darkGlass, x + d / 2 + 0.005, h / 2, z + dz));
  }
  return g;
}

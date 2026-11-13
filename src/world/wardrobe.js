import * as THREE from 'three';
import { BOUNDS } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Gardëroba (fotot 09, 10, 13, 14): trup i zi, dy dyer arre anash
// dhe dy dyer me pasqyrë në mes, te muri i majtë pranë shtratit.
export const WARDROBE = { width: 2.4, height: 2.45, depth: 0.6, centerZ: 2.2 };

export function createWardrobe() {
  const g = new THREE.Group();
  g.name = 'wardrobe';

  const { width: w, height: h, depth: d, centerZ: z } = WARDROBE;
  const x = BOUNDS.left + d / 2;
  const front = BOUNDS.left + d;

  g.add(box(d, h, w, MATERIALS.blackMatte, x, h / 2, z)); // trupi

  // 4 dyer: arrë, pasqyrë, pasqyrë, arrë
  const doorW = w / 4;
  const doors = [MATERIALS.walnut, MATERIALS.mirror, MATERIALS.mirror, MATERIALS.walnut];
  doors.forEach((mat, i) => {
    const dz = z - w / 2 + doorW * (i + 0.5);
    g.add(box(0.02, h - 0.1, doorW - 0.04, mat, front + 0.01, h / 2, dz));
    // doreza e gjatë vertikale, e zezë
    const hz = dz + (i % 2 === 0 ? 1 : -1) * (doorW / 2 - 0.06);
    g.add(box(0.02, 0.6, 0.02, MATERIALS.plinth, front + 0.03, 1.1, hz));
  });
  return g;
}

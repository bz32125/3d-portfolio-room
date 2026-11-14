import * as THREE from 'three';
import { Reflector } from 'three/examples/jsm/objects/Reflector.js';
import { BOUNDS, IS_MOBILE } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Gardëroba (fotot 09, 10, 13, 14): trup i zi, dy dyer arre anash
// dhe dy dyer me pasqyrë në mes, te muri i majtë pranë shtratit.
// Pasqyrat: në desktop një Reflector (pasqyrë e vërtetë: skena vizatohet sërish
// nga një kamerë e pasqyruar), në telefon materiali PBR "mirror" që reflekton
// vetëm environment map (shumë më lirë).
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
  const mirrorMat = IS_MOBILE ? MATERIALS.mirror : MATERIALS.blackMatte; // në desktop pasqyra = Reflector
  const doors = [MATERIALS.walnut, mirrorMat, mirrorMat, MATERIALS.walnut];
  doors.forEach((mat, i) => {
    const dz = z - w / 2 + doorW * (i + 0.5);
    g.add(box(0.02, h - 0.1, doorW - 0.04, mat, front + 0.01, h / 2, dz));
    // doreza e gjatë vertikale, e zezë
    const hz = dz + (i % 2 === 0 ? 1 : -1) * (doorW / 2 - 0.06);
    g.add(box(0.02, 0.6, 0.02, MATERIALS.plinth, front + 0.03, 1.1, hz));
  });

  if (!IS_MOBILE) g.add(createMirror(front + 0.022, h / 2, z, 2 * doorW - 0.04, h - 0.1));
  return g;
}

/**
 * Reflector: para çdo kuadri, kur pasqyra shihet, three.js e vizaton skenën nga
 * një kamerë e pasqyruar përtej rrafshit të pasqyrës në një render target, dhe
 * plani e shfaq atë si teksturë. Kosto: një vizatim shtesë i skenës (pa hijet:
 * Reflector e çaktivizon shadow map gjatë tij), prandaj e bëjmë me gjysmë rezolucioni.
 */
function createMirror(x, y, z, width, height) {
  const scale = 0.5 * Math.min(window.devicePixelRatio, 2);
  const mirror = new Reflector(new THREE.PlaneGeometry(width, height), {
    textureWidth: Math.round(window.innerWidth * scale),
    textureHeight: Math.round(window.innerHeight * scale),
    color: 0xb8c0c4, // pak gri-blu, si xhami i pasqyrës (jo 100% reflektim)
    clipBias: 0.003, // shmang "dridhjet" te skaji i rrafshit
  });
  mirror.position.set(x, y, z);
  mirror.rotation.y = Math.PI / 2; // plani shikon nga +X, drejt dhomës
  mirror.name = 'wardrobe-mirror';
  return mirror;
}

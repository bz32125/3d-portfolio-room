import * as THREE from 'three';
import { BOUNDS, SOFFIT } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Dritarja në murin e djathtë (x = +2.5) dhe perdet.
// Dritarja: rreth 4.0 × 2.0 m, qendra në z ≈ -0.6 (fotot 03, 08, 11).
// Poshtë saj, nga ana e shtratit, është radiatori.
export const WINDOW = { centerZ: -0.6, width: 4.0, height: 2.0, bottom: 0.55 };

/**
 * Një perde me rrudha: një PlaneGeometry me shumë ndarje horizontale,
 * ku çdo kulm zhvendoset me një valë sinus. Kjo është zhvendosje statike;
 * në Fazën 5 të njëjtën ide e kalojmë në vertex shader që perdet të lëvizin.
 */
function createCurtain(width, height, material, folds) {
  const geo = new THREE.PlaneGeometry(width, height, Math.round(width * 40), 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    pos.setZ(i, Math.sin((x / width) * Math.PI * 2 * folds) * 0.035);
  }
  geo.computeVertexNormals(); // normalet e reja, që drita të shfaqë rrudhat
  const mesh = new THREE.Mesh(geo, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createWindowWall() {
  const g = new THREE.Group();
  g.name = 'window-wall';

  const x = BOUNDS.right;
  const { centerZ, width, height, bottom } = WINDOW;
  const cy = bottom + height / 2;

  // "Qielli": një plan prapa murit. Muri është vetëm një sipërfaqe, ndaj
  // e vendosim planin pak brenda, me kornizë rreth tij.
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(width, height), MATERIALS.sky);
  sky.position.set(x - 0.01, cy, centerZ);
  sky.rotation.y = -Math.PI / 2; // faqja shikon nga brenda dhomës (-X)
  g.add(sky);
  const f = 0.06;
  g.add(box(0.05, f, width + f, MATERIALS.windowFrame, x - 0.03, bottom, centerZ));
  g.add(box(0.05, f, width + f, MATERIALS.windowFrame, x - 0.03, bottom + height, centerZ));
  for (const dz of [-width / 2, -width / 4, 0, width / 4, width / 2]) {
    g.add(box(0.05, height, f, MATERIALS.windowFrame, x - 0.03, cy, centerZ + dz));
  }

  // Perdet varen nga soffit-i deri në dysheme, të rrotulluara nga brenda.
  const curtainH = SOFFIT.bottom - 0.02;
  const place = (mesh, z, inset) => {
    mesh.position.set(x - inset, curtainH / 2, z);
    mesh.rotation.y = -Math.PI / 2;
    g.add(mesh);
  };
  // Perdja e bardhë (sheer) mbulon gjysmën e dritares
  place(createCurtain(2.4, curtainH, MATERIALS.curtainSheer, 13), centerZ + 0.6, 0.12);
  // Perdet gri, të mbledhura në të dy anët e dritares
  place(createCurtain(0.9, curtainH, MATERIALS.curtainGrey, 6), centerZ - width / 2 - 0.2, 0.2);
  place(createCurtain(0.9, curtainH, MATERIALS.curtainGrey, 6), centerZ + width / 2 + 0.2, 0.2);

  // Radiatori i bardhë poshtë dritares, nga ana e shtratit (foto 11–12)
  const radiator = new THREE.Group();
  radiator.name = 'radiator';
  const rz = centerZ + width / 2 - 0.9;
  radiator.add(box(0.1, 0.45, 1.2, MATERIALS.radiator, x - 0.3, 0.33, rz));
  for (let i = 0; i < 12; i++) {
    radiator.add(box(0.005, 0.4, 0.02, MATERIALS.windowFrame, x - 0.36, 0.33, rz - 0.55 + i * 0.1));
  }
  g.add(radiator);

  return g;
}

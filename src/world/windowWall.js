import * as THREE from 'three';
import { BOUNDS, SOFFIT, WINDOW } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';
import { createCurtainMaterial } from '../materials/curtainMaterial.js';

// Dritarja në murin e djathtë (x = +2.5) dhe perdet.
// Dritarja: rreth 4.0 × 2.0 m, qendra në z ≈ -0.6 (fotot 03, 08, 11).
// Poshtë saj, nga ana e shtratit, është radiatori. Përmasat: WINDOW në config.js.

/**
 * Një perde: PlaneGeometry e sheshtë me shumë ndarje (40 për metër në gjerësi,
 * 24 në lartësi). Rrudhat dhe era nuk llogariten këtu në CPU, por në vertex
 * shader (shaders/curtain.vert.glsl) në çdo kuadër, në GPU.
 * @param {object} look  color, opacity, translucency (shih curtainMaterial.js)
 */
function createCurtain(width, height, look, folds, castShadow = true) {
  const geo = new THREE.PlaneGeometry(width, height, Math.round(width * 40), 24);
  const material = createCurtainMaterial({ ...look, folds, width, height });
  const mesh = new THREE.Mesh(geo, material);
  // Hija llogaritet nga gjeometria e sheshtë (pa rrudhat e shader-it): ndryshimi
  // është 3-4 cm, s'duket, dhe na kursen një customDepthMaterial.
  mesh.castShadow = castShadow;
  return mesh;
}

// Pamja e dy llojeve të perdeve (ngjyrat nga fotot; translucency = vlerësim)
const SHEER = { color: 0xf3f1ec, opacity: 0.72, translucency: 0.55 };
const GREY = { color: 0x86837c, opacity: 1, translucency: 0.12 };

/**
 * Qielli prapa dritares: një plan me 4 kulme dhe ngjyrë për çdo kulm
 * (vertexColors). Dy kulmet e sipërme = ngjyra e zenitit, dy të poshtmet =
 * ngjyra e horizontit; GPU-ja i interpolon mes tyre, kështu del një gradient.
 * dayCycle.js i ndryshon këto ngjyra sipas orës.
 */
function createSky(width, height) {
  const geo = new THREE.PlaneGeometry(width, height);
  const colors = new Float32Array(geo.attributes.position.count * 3); // 4 kulme × RGB
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true }));
  sky.name = 'sky';
  return sky;
}

export function createWindowWall() {
  const g = new THREE.Group();
  g.name = 'window-wall';

  const x = BOUNDS.right;
  const { centerZ, width, height, bottom } = WINDOW;
  const cy = bottom + height / 2;

  // "Qielli": një plan prapa murit. Muri është vetëm një sipërfaqe, ndaj
  // e vendosim planin pak brenda, me kornizë rreth tij.
  // Tani muri ka hapje (room.js), ndaj qielli vendoset pak jashtë murit.
  const sky = createSky(width, height);
  sky.position.set(x + 0.05, cy, centerZ);
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
  // castShadow = false: perdja e hollë e lë diellin të kalojë (është e tejdukshme)
  place(createCurtain(2.4, curtainH, SHEER, 13, false), centerZ + 0.6, 0.12);
  // Perdet gri, të mbledhura në të dy anët e dritares
  place(createCurtain(0.9, curtainH, GREY, 6), centerZ - width / 2 - 0.2, 0.2);
  place(createCurtain(0.9, curtainH, GREY, 6), centerZ + width / 2 + 0.2, 0.2);

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

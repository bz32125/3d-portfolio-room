import * as THREE from 'three';
import { BOUNDS, WINDOW } from '../config.js';

// "Rrezet e diellit" (fake light shafts): plane të tejdukshme me AdditiveBlending,
// që nisin te dritarja dhe shtrihen në drejtimin e dritës. Nuk janë dritë e vërtetë,
// vetëm efekt vizual: shtojnë ngjyrën e diellit mbi atë që është prapa tyre.
// Rubrika "Lighting / Colour": blending aditiv, alpha nga një CanvasTexture.

const SHAFT_Z = [-2.15, -1.45, -0.35]; // ku kalojnë rrezet nëpër dritare (vlerësim)
const SHAFT_WIDTH = 0.55;
const MAX_OPACITY = 0.16;

/**
 * Teksturë 64×128 e vizatuar me Canvas 2D: e bardhë lart (te dritarja),
 * zbehet në 0 poshtë, dhe është e butë në të dy anët. Përdoret si `map`,
 * ndaj kanali alpha i saj i jep formën rrezes.
 */
function createShaftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const along = ctx.createLinearGradient(0, 0, 0, 128); // përgjatë rrezes
  along.addColorStop(0, 'rgba(255,255,255,1)');
  along.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = along;
  ctx.fillRect(0, 0, 64, 128);
  // destination-in: mban vetëm pjesën ku gradienti anësor ka alpha (anët e buta)
  ctx.globalCompositeOperation = 'destination-in';
  const across = ctx.createLinearGradient(0, 0, 64, 0);
  across.addColorStop(0, 'rgba(255,255,255,0)');
  across.addColorStop(0.5, 'rgba(255,255,255,1)');
  across.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = across;
  ctx.fillRect(0, 0, 64, 128);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; // është teksturë ngjyre
  return texture;
}

export function createLightShafts() {
  const group = new THREE.Group();
  group.name = 'light-shafts';

  const material = new THREE.MeshBasicMaterial({
    map: createShaftTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending, // ngjyra shtohet: vendi ndriçohet, kurrë s'errësohet
    depthWrite: false, // s'fsheh objektet prapa (është vetëm "ajër i ndriçuar")
    side: THREE.DoubleSide,
  });

  // Plani 1 × 1 me skajin e sipërm në origjinë: shtrihet nga y = 0 në y = -1.
  // Kështu, kur e shkallëzojmë në Y me gjatësinë L, fillon gjithmonë te dritarja.
  const geometry = new THREE.PlaneGeometry(SHAFT_WIDTH, 1).translate(0, -0.5, 0);

  const startY = WINDOW.bottom + WINDOW.height / 2; // mesi i dritares në lartësi
  const shafts = SHAFT_Z.map((z) => {
    const shaft = new THREE.Group();
    shaft.position.set(BOUNDS.right - 0.05, startY, z);
    // Dy plane të kryqëzuara (90°): rrezja duket nga çdo kënd i kamerës
    const a = new THREE.Mesh(geometry, material);
    const b = new THREE.Mesh(geometry, material);
    b.rotation.y = Math.PI / 2;
    shaft.add(a, b);
    group.add(shaft);
    return shaft;
  });

  const DOWN = new THREE.Vector3(0, -1, 0);

  /**
   * dir = drejtimi në të cilin udhëton drita (nga dielli drejt dhomës, normalizuar).
   * strength 0…1 = sa e dukshme është rrezja.
   */
  function update(dir, color, strength) {
    material.opacity = MAX_OPACITY * strength;
    material.color.copy(color);
    group.visible = strength > 0.01; // natën: asnjë draw call
    // Gjatësia deri te dyshemeja: lartësia / sin(këndi i rënies), max 6 m
    const length = Math.min(6, startY / Math.max(-dir.y, 0.1));
    for (const shaft of shafts) {
      // Rrotullimi: boshti -Y lokal i planit kthehet drejt `dir`
      shaft.quaternion.setFromUnitVectors(DOWN, dir);
      shaft.scale.set(1, length, 1);
    }
  }

  return { group, update };
}

import * as THREE from 'three';
import { BOUNDS, WINDOW } from '../config.js';

// "Rrezet e diellit" (fake light shafts): plane të tejdukshme me AdditiveBlending,
// që nisin te dritarja dhe shtrihen në drejtimin e dritës. Nuk janë dritë e vërtetë,
// vetëm efekt vizual: shtojnë ngjyrën e diellit mbi atë që është prapa tyre.
// Rubrika "Lighting / Colour": blending aditiv, alpha nga një CanvasTexture.
// Çdo rreze është një plan i vetëm që rrotullohet rreth boshtit të vet drejt
// kamerës (cylindrical billboarding), që të mos shihet kurrë "nga tehu".

const SHAFT_Z = [-2.15, -1.45, -0.35]; // ku kalojnë rrezet nëpër dritare (vlerësim)
const SHAFT_WIDTH = 0.55;
const MAX_OPACITY = 0.16;

/**
 * Teksturë 64×128 e vizatuar me Canvas 2D: e bardhë afër dritares,
 * zbehet në 0 poshtë, dhe është e butë në të dy anët. Përdoret si `map`,
 * ndaj kanali alpha i saj i jep formën rrezes.
 */
function createShaftTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const along = ctx.createLinearGradient(0, 0, 0, 128); // përgjatë rrezes
  along.addColorStop(0, 'rgba(255,255,255,0)'); // fillim i butë, pa vijë të prerë
  along.addColorStop(0.15, 'rgba(255,255,255,1)');
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
  });

  // Plani 1 × 1 me skajin e sipërm në origjinë: shtrihet nga y = 0 në y = -1.
  // Kështu, kur e shkallëzojmë në Y me gjatësinë L, fillon gjithmonë te dritarja.
  const geometry = new THREE.PlaneGeometry(SHAFT_WIDTH, 1).translate(0, -0.5, 0);

  const startY = WINDOW.bottom + WINDOW.height / 2; // mesi i dritares në lartësi
  const shafts = SHAFT_Z.map((z) => {
    const shaft = new THREE.Mesh(geometry, material);
    shaft.position.set(BOUNDS.right - 0.05, startY, z);
    group.add(shaft);
    return shaft;
  });

  const dir = new THREE.Vector3(-1, -1, 0).normalize(); // drejtimi i fundit i dritës
  let length = 1;

  /**
   * dir = drejtimi në të cilin udhëton drita (nga dielli drejt dhomës, normalizuar).
   * strength 0…1 = sa e dukshme është rrezja.
   */
  function update(sunDir, color, strength) {
    dir.copy(sunDir);
    material.opacity = MAX_OPACITY * strength;
    material.color.copy(color);
    group.visible = strength > 0.01; // natën: asnjë draw call
    // Gjatësia deri te dyshemeja: lartësia / sin(këndi i rënies), max 6 m
    length = Math.min(6, startY / Math.max(-dir.y, 0.1));
  }

  // Objekte ndihmëse, të krijuara një herë (jo në çdo kuadër)
  const xAxis = new THREE.Vector3();
  const yAxis = new THREE.Vector3();
  const zAxis = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  /**
   * Cylindrical billboarding, thirret në çdo kuadër.
   * Boshti Y i planit mbetet përgjatë rrezes (-dir); boshti Z (normalja e planit)
   * merr drejtimin drejt kamerës, pa pjesën përgjatë rrezes. X = Y × Z.
   * Me këto 3 boshte ndërtojmë matricën e rrotullimit (makeBasis).
   */
  function faceCamera(camera) {
    if (!group.visible) return;
    yAxis.copy(dir).negate();
    for (const shaft of shafts) {
      zAxis.subVectors(camera.position, shaft.position);
      zAxis.addScaledVector(yAxis, -zAxis.dot(yAxis)).normalize(); // heq pjesën përgjatë rrezes
      xAxis.crossVectors(yAxis, zAxis);
      basis.makeBasis(xAxis, yAxis, zAxis);
      shaft.quaternion.setFromRotationMatrix(basis);
      shaft.scale.set(1, length, 1);
    }
  }

  return { group, update, faceCamera };
}

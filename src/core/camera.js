import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { fitFov } from './resize.js';
import { ROOM, BOUNDS } from '../config.js';

export function createCamera() {
  // PerspectiveCamera(fov, aspect, near, far)
  //  fov 50°: afër syrit të njeriut, pa shtrembërim si lente "wide".
  //  near 0.1 / far 50: vizatohet vetëm ç'ka mes 10 cm dhe 50 m nga kamera.
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    50,
  );

  // Në telefon vertikal fov-i zmadhohet (shih resize.js).
  fitFov(camera);
  camera.updateProjectionMatrix();

  // Pozicioni fillestar (main.js e ndryshon: loja nis nga korridori).
  camera.position.set(0, 1.6, 3.0);

  return camera;
}

export function createControls(camera, canvas) {
  const controls = new OrbitControls(camera, canvas);

  // Pika rreth së cilës rrotullohet kamera: qendra e murit me rafte.
  controls.target.set(0, 1.2, -3.3);

  // Damping = lëvizje e butë që ngadalësohet, jo ndalim i menjëhershëm.
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  // Kufij, që kamera të mos dalë jashtë dhomës ose poshtë dyshemesë.
  controls.minDistance = 1.0;
  controls.maxDistance = 6.5;
  controls.maxPolarAngle = Math.PI * 0.55; // pak poshtë horizontit, jo nën dysheme
  controls.enablePan = false; // pa zhvendosje anash: kamera rrotullohet rreth karakterit/dhomës

  controls.update();
  return controls;
}

// Kamera s'del kurrë jashtë mureve (Faza 10). OrbitControls kufizon vetëm
// distancën dhe këndin, jo pozicionin, ndaj pas controls.update() e "shtrëngojmë"
// pozicionin brenda kutisë së dhomës, 15 cm larg mureve, dyshemesë dhe tavanit.
// Në kuadrin tjetër OrbitControls nis nga ky pozicion i korrigjuar.
const MARGIN = 0.15;
export function keepInsideRoom(camera) {
  const p = camera.position;
  p.x = THREE.MathUtils.clamp(p.x, BOUNDS.left + MARGIN, BOUNDS.right - MARGIN);
  p.y = THREE.MathUtils.clamp(p.y, 0.3, ROOM.height - MARGIN);
  p.z = THREE.MathUtils.clamp(p.z, BOUNDS.back + MARGIN, BOUNDS.front - MARGIN);
}

/**
 * "Follow": target-i i kamerës ndjek karakterin butësisht. Kamera zhvendoset
 * me të njëjtin vektor si target-i, pra pamja (këndi, distanca) mbetet e njëjtë.
 * 1 - e^(-k·dt): easing eksponencial, i njëjtë në çdo FPS.
 */
const goal = new THREE.Vector3();
const step = new THREE.Vector3();
export function followPoint(camera, controls, point, dt) {
  goal.set(point.x, point.y + 0.9, point.z); // rreth lartësisë së gjoksit
  step.subVectors(goal, controls.target).multiplyScalar(1 - Math.exp(-3 * dt));
  controls.target.add(step);
  camera.position.add(step);
}

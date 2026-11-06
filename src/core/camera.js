import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { fitFov } from './resize.js';

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

  // Pozicioni fillestar: afër murit të përparmë, në lartësinë e syve (1.6 m).
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
  controls.enablePan = false; // pa zhvendosje anash në Fazën 1

  controls.update();
  return controls;
}

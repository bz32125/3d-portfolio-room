import * as THREE from 'three';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Në ekranet "retina" pixelRatio mund të jetë 3, që e rëndon shumë telefonin.
  // E kufizojmë në 2: dallimi vizual është i vogël, fitimi në performancë i madh.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Hijet: i aktivizojmë qysh tani, edhe pse i përdorim seriozisht në Fazën 5.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Tone mapping e kthen dritën "fizike" në ngjyra që ekrani mund t'i shfaqë,
  // pa i djegur pjesët shumë të ndriçuara.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  return renderer;
}

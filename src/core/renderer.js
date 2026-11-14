import * as THREE from 'three';
import { MAX_PIXEL_RATIO } from '../config.js';

export function createRenderer(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });

  // Në ekranet "retina" pixelRatio mund të jetë 3, që e rëndon shumë telefonin.
  // E kufizojmë në 2 (1.5 në telefon): dallimi vizual është i vogël, fitimi i madh.
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Hijet: vetëm dielli i hedh (dayCycle.js). PCFSoft = skaje të buta.
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // Ngjyra (rubrika "Colour"): shader-at llogarisin dritën në hapësirë lineare,
  // dhe në fund ngjyra kthehet në sRGB, siç e pret ekrani. (Default që nga r152,
  // por e shkruajmë qartë.) Teksturat e ngjyrës duhet të kenë colorSpace = sRGB.
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  // Tone mapping e kthen dritën "fizike" në ngjyra që ekrani mund t'i shfaqë,
  // pa i djegur pjesët shumë të ndriçuara.
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  // Ekspozimi ndryshon me orën: dayCycle.js (më i lartë natën).
  renderer.toneMappingExposure = 1.0;

  return renderer;
}

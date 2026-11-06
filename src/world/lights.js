import * as THREE from 'three';
import { ROOM } from '../config.js';

// Ndriçim i thjeshtë për Fazën 1, vetëm sa të shihet dhoma.
// Dielli, LED-et e tavanit dhe slider-i i orës vijnë në Fazën 5.
export function createLights() {
  const lights = new THREE.Group();
  lights.name = 'lights';

  // HemisphereLight: dritë e butë nga lart (ngjyrë e ngrohtë) dhe nga poshtë
  // (ngjyrë e dyshemesë). Asnjë faqe nuk mbetet krejt e zezë.
  const hemi = new THREE.HemisphereLight(0xfff4e6, 0xd9cbb8, 1.2);
  lights.add(hemi);

  // Një dritë pikë afër tavanit, që muret të kenë pak gradient dhe thellësi.
  const ceilingLight = new THREE.PointLight(0xffe2b8, 8, 12, 2);
  ceilingLight.position.set(0, ROOM.height - 0.3, 0);
  lights.add(ceilingLight);

  return lights;
}

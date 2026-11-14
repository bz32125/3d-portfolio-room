import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

// Environment map (Faza 7). Rubrika "PBR": materialet metalike dhe të lëmuara
// kanë nevojë për diçka për të reflektuar. RoomEnvironment është një dhomë e
// thjeshtë me drita (skenë e gatshme e three.js); PMREMGenerator e kthen në një
// "Prefiltered Mipmapped Radiance Environment Map": një cubemap ku çdo nivel
// mipmap është i turbullt sa për një vlerë roughness. Pasqyra (roughness 0.02)
// lexon nivelin e mprehtë, druri (roughness ~0.6) një nivel të turbullt.

export function createEnvironment(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment();
  const texture = pmrem.fromScene(envScene, 0.04).texture; // 0.04 = pak blur
  // Pasi u krijua tekstura, gjeneratori dhe skena ndihmëse s'duhen më: lirojmë GPU-në
  pmrem.dispose();
  envScene.dispose();
  return texture;
}

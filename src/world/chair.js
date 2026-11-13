import * as THREE from 'three';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Karrigia e zyrës: ndenjëse dhe shpinore e zezë me rrjetë,
// këmbë krom në formë "sajë" (dy tuba që prekin dyshemenë), si në foto.
export function createChair() {
  const chair = new THREE.Group();
  chair.name = 'chair';

  const seatY = 0.47;
  chair.add(box(0.5, 0.06, 0.48, MATERIALS.blackMatte, 0, seatY, 0)); // ndenjësja
  chair.add(box(0.48, 0.5, 0.03, MATERIALS.meshBlack, 0, seatY + 0.33, 0.24)); // shpinorja

  // Këmbët: cilindra të hollë krom. Një CylinderGeometry krijohet vertikal
  // (përgjatë Y), ndaj për tubat horizontalë e rrotullojmë rreth X.
  const tube = new THREE.CylinderGeometry(0.012, 0.012, 1, 12);
  const addTube = (length, x, y, z, rotX = 0, rotZ = 0) => {
    const m = new THREE.Mesh(tube, MATERIALS.chrome);
    m.scale.y = length;
    m.position.set(x, y, z);
    m.rotation.set(rotX, 0, rotZ);
    m.castShadow = true;
    chair.add(m);
  };
  for (const side of [-1, 1]) {
    const x = side * 0.22;
    addTube(0.5, x, 0.012, 0, Math.PI / 2); // tubi në dysheme
    addTube(seatY, x, seatY / 2, -0.22); // këmba e përparme
    addTube(seatY, x, seatY / 2, 0.22); // këmba e pasme
    addTube(0.26, x, seatY + 0.13, 0.25, 0); // mbajtësja e shpinores
  }

  // Pozicioni para tavolinës. Pa rrotullim, ana "e përparme" e karriges
  // shikon nga -Z (te tavolina), sepse shpinorja është në +Z.
  chair.position.set(0.1, 0, -2.6);
  chair.userData.interactive = 'chair';
  return chair;
}

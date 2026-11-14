import * as THREE from 'three';
import { CORRIDOR } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box, metricPlane } from '../utils/box.js';

// Korridori i hyrjes (fotot 01, 02, 13): dyshemeja, tavani, tre muret,
// dera në fund dhe komodina e arrës me pasqyrën e rrumbullakët.
// Loja nis këtu: karakteri hyn nga dera dhe ecën drejt dhomës.
export function createCorridor() {
  const g = new THREE.Group();
  g.name = 'corridor';

  const { minX, maxX, minZ, maxZ, height } = CORRIDOR;
  const len = maxX - minX; // 2.5 m përgjatë X
  const wid = maxZ - minZ; // 1.3 m
  const cx = (minX + maxX) / 2;
  const cz = (minZ + maxZ) / 2;


  // Dyshemeja ka emrin e vet: Picker-i e pranon si dysheme për klik.
  const floor = new THREE.Mesh(metricPlane(len, wid), MATERIALS.floorTiles);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(cx, 0, cz);
  floor.receiveShadow = true;
  floor.name = 'floor-corridor';
  g.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(len, wid), MATERIALS.soffit);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(cx, height, cz);
  ceiling.castShadow = true; // që dielli të mos ndriçojë korridorin nga lart
  g.add(ceiling);

  // Muret, me faqen e dukshme nga brenda korridorit
  const walls = [
    { w: len, pos: [cx, height / 2, minZ], rotY: 0 }, // vazhdimi i murit me rafte
    { w: len, pos: [cx, height / 2, maxZ], rotY: Math.PI },
    { w: wid, pos: [minX, height / 2, cz], rotY: Math.PI / 2 }, // muri me derë
  ];
  for (const wall of walls) {
    const mesh = new THREE.Mesh(metricPlane(wall.w, height), MATERIALS.wallPlaster);
    mesh.position.set(...wall.pos);
    mesh.rotation.y = wall.rotY;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    g.add(mesh);
  }

  // Dera: kornizë + kanat + dorezë, pak e dalë nga muri
  const doorW = 0.9;
  const doorH = 2.05;
  const doorZ = cz + 0.1;
  g.add(box(0.04, doorH + 0.06, doorW + 0.12, MATERIALS.windowFrame, minX + 0.02, (doorH + 0.06) / 2, doorZ));
  g.add(box(0.04, doorH, doorW, MATERIALS.door, minX + 0.04, doorH / 2, doorZ));
  g.add(box(0.06, 0.02, 0.14, MATERIALS.chrome, minX + 0.08, 1.0, doorZ + doorW / 2 - 0.12));

  // Komodina e arrës përgjatë murit (foto 01, majtas): 3 sirtarë
  const dresser = new THREE.Group();
  dresser.name = 'dresser';
  const dW = 1.3;
  const dD = 0.4;
  const dH = 0.8;
  const dX = minX + 0.5 + dW / 2;
  const dZ = minZ + dD / 2;
  dresser.add(box(dW, dH - 0.06, dD, MATERIALS.walnut, dX, 0.06 + (dH - 0.06) / 2, dZ));
  dresser.add(box(dW - 0.04, 0.06, dD - 0.04, MATERIALS.plinth, dX, 0.03, dZ));
  for (let i = 1; i < 3; i++) {
    // vijat mes sirtarëve: një shirit i errët në faqen e përparme
    dresser.add(box(dW - 0.04, 0.008, 0.005, MATERIALS.walnutDark, dX, 0.06 + (i * (dH - 0.06)) / 3, minZ + dD + 0.002));
  }
  g.add(dresser);

  // Pasqyra e rrumbullakët mbi komodinë
  const mirror = new THREE.Mesh(new THREE.CircleGeometry(0.35, 48), MATERIALS.mirror);
  mirror.position.set(dX, 1.5, minZ + 0.01);
  g.add(mirror);

  return g;
}

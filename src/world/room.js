import * as THREE from 'three';
import { ROOM, BOUNDS, CORRIDOR } from '../config.js';

// Guaska e dhomës: dyshemeja, tavani dhe 4 muret.
// Çdo pjesë është një PlaneGeometry (sipërfaqe e sheshtë, pa trashësi).
export function createRoom() {
  const room = new THREE.Group();
  room.name = 'room';

  // Materiale të përkohshme me ngjyra nga fotot; teksturat vijnë në Fazën 5.
  const floorMat = new THREE.MeshStandardMaterial({ color: 0xe6ddd0, roughness: 0.6 });
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.9 });
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ef, roughness: 1 });

  // Dyshemeja. Një plane krijohet vertikal (në rrafshin XY),
  // ndaj e rrotullojmë -90° rreth X që të shtrihet horizontalisht.
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  room.add(floor);

  // Tavani: +90° rreth X, që faqja e dukshme të shohë poshtë.
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.height;
  ceiling.name = 'ceiling';
  room.add(ceiling);

  // Muret. Çdo mur vendoset në kufirin e vet dhe rrotullohet nga brenda dhomës.
  // Muri i majtë ka hapjen e korridorit pranë rafteve (z -3.5 … -2.2), ndaj
  // ndahet në dy pjesë: muri i plotë pas hapjes dhe një "tra" mbi hapje.
  const halfH = ROOM.height / 2;
  const leftLen = BOUNDS.front - CORRIDOR.maxZ; // 5.7 m
  const openW = CORRIDOR.maxZ - CORRIDOR.minZ; // 1.3 m
  const headerH = ROOM.height - CORRIDOR.height; // 0.55 m
  const walls = [
    { name: 'wall-back', w: ROOM.width, h: ROOM.height, pos: [0, halfH, BOUNDS.back], rotY: 0 },
    { name: 'wall-front', w: ROOM.width, h: ROOM.height, pos: [0, halfH, BOUNDS.front], rotY: Math.PI },
    {
      name: 'wall-left',
      w: leftLen,
      h: ROOM.height,
      pos: [BOUNDS.left, halfH, CORRIDOR.maxZ + leftLen / 2],
      rotY: Math.PI / 2,
    },
    {
      name: 'wall-left-header',
      w: openW,
      h: headerH,
      pos: [BOUNDS.left, CORRIDOR.height + headerH / 2, CORRIDOR.minZ + openW / 2],
      rotY: Math.PI / 2,
    },
    { name: 'wall-right', w: ROOM.depth, h: ROOM.height, pos: [BOUNDS.right, halfH, 0], rotY: -Math.PI / 2 },
  ];

  for (const wall of walls) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wall.w, wall.h), wallMat);
    mesh.position.set(...wall.pos);
    mesh.rotation.y = wall.rotY;
    mesh.receiveShadow = true;
    mesh.name = wall.name;
    room.add(mesh);
  }

  return room;
}

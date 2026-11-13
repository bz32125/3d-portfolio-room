import * as THREE from 'three';
import { ROOM, BOUNDS } from '../config.js';

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
  const halfH = ROOM.height / 2;
  const walls = [
    { name: 'wall-back', w: ROOM.width, pos: [0, halfH, BOUNDS.back], rotY: 0 },
    { name: 'wall-front', w: ROOM.width, pos: [0, halfH, BOUNDS.front], rotY: Math.PI },
    { name: 'wall-left', w: ROOM.depth, pos: [BOUNDS.left, halfH, 0], rotY: Math.PI / 2 },
    { name: 'wall-right', w: ROOM.depth, pos: [BOUNDS.right, halfH, 0], rotY: -Math.PI / 2 },
  ];

  for (const wall of walls) {
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(wall.w, ROOM.height), wallMat);
    mesh.position.set(...wall.pos);
    mesh.rotation.y = wall.rotY;
    mesh.receiveShadow = true;
    mesh.name = wall.name;
    room.add(mesh);
  }

  return room;
}

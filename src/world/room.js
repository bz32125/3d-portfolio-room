import * as THREE from 'three';
import { ROOM, BOUNDS, CORRIDOR, WINDOW } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { metricPlane } from '../utils/box.js';

// Guaska e dhomës: dyshemeja, tavani dhe 4 muret.
// Çdo pjesë është një PlaneGeometry (sipërfaqe e sheshtë, pa trashësi).
export function createRoom() {
  const room = new THREE.Group();
  room.name = 'room';

  // Materialet me tekstura (pllakat, suvaja) janë në materials.js, të përbashkëta
  // me korridorin. metricPlane = PlaneGeometry me UV në metra (utils/box.js).
  const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf5f3ef, roughness: 1 });

  // Dyshemeja. Një plane krijohet vertikal (në rrafshin XY),
  // ndaj e rrotullojmë -90° rreth X që të shtrihet horizontalisht.
  const floor = new THREE.Mesh(metricPlane(ROOM.width, ROOM.depth), MATERIALS.floorTiles);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  floor.name = 'floor';
  room.add(floor);

  // Tavani: +90° rreth X, që faqja e dukshme të shohë poshtë.
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.width, ROOM.depth), ceilingMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.height;
  ceiling.name = 'ceiling';
  // Tavani hedh hije: përndryshe dielli i lartë (Faza 5) do të "kalonte" nëpër të.
  ceiling.castShadow = true;
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
    // Muri i djathtë ka hapjen e dritares: 4 copa rreth saj (shih poshtë)
    ...rightWallAroundWindow(),
  ];

  for (const wall of walls) {
    const mesh = new THREE.Mesh(metricPlane(wall.w, wall.h), MATERIALS.wallPlaster);
    mesh.position.set(...wall.pos);
    mesh.rotation.y = wall.rotY;
    mesh.receiveShadow = true;
    // Muret hedhin hije, që dielli të hyjë VETËM nga hapja e dritares.
    // Shënim: për materiale me një faqe, three.js e vizaton hijen me faqen e
    // pasme (shadowSide), ndaj muri që e sheh diellin me faqen e përparme nuk
    // e hijëzon veten (pa shadow acne), kurse muri me shpinë nga dielli e bllokon.
    mesh.castShadow = true;
    mesh.name = wall.name;
    room.add(mesh);
  }

  return room;
}

/**
 * Muri i djathtë (x = +2.5) me hapje për dritaren: 4 copa rreth saj
 * (poshtë, sipër, para dhe pas dritares). Kështu drita e diellit kalon
 * vetëm nga hapja dhe vizaton në dysheme formën e dritares.
 */
function rightWallAroundWindow() {
  const { centerZ, width, height, bottom } = WINDOW;
  const top = bottom + height; // 2.55 m
  const z0 = centerZ - width / 2; // skaji i dritares nga raftet (-2.6)
  const z1 = centerZ + width / 2; // skaji nga shtrati (+1.4)
  const x = BOUNDS.right;
  const rotY = -Math.PI / 2; // faqja shikon nga brenda (-X)
  const piece = (name, zA, zB, yA, yB) => ({
    name,
    w: zB - zA,
    h: yB - yA,
    pos: [x, (yA + yB) / 2, (zA + zB) / 2],
    rotY,
  });
  return [
    piece('wall-right-back', BOUNDS.back, z0, 0, ROOM.height),
    piece('wall-right-front', z1, BOUNDS.front, 0, ROOM.height),
    piece('wall-right-below', z0, z1, 0, bottom),
    piece('wall-right-above', z0, z1, top, ROOM.height),
  ];
}

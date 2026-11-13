import * as THREE from 'three';
import './style.css';

import { createRenderer } from './core/renderer.js';
import { createCamera, createControls } from './core/camera.js';
import { handleResize } from './core/resize.js';
import { createRoom } from './world/room.js';
import { createLights } from './world/lights.js';
import { createSoffit } from './world/soffit.js';
import { createBookshelves } from './world/bookshelf.js';
import { createDesk } from './world/desk.js';
import { createChair } from './world/chair.js';
import { createLounge } from './world/lounge.js';
import { createWindowWall } from './world/windowWall.js';
import { createWardrobe } from './world/wardrobe.js';
import { Character } from './character/character.js';
import { NavGrid } from './character/navigation.js';
import { SPOTS } from './character/spots.js';
import { Picker } from './interaction/picker.js';

// 1. Canvas, renderer, skena, kamera
const canvas = document.querySelector('#scene');
const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1714);

const camera = createCamera();
const controls = createControls(camera, canvas);

// 2. Bota: dhoma, mobiljet dhe dritat
const room = createRoom();
const bookshelves = createBookshelves();
const desk = createDesk();
const chair = createChair();
const lounge = createLounge();
const windowWall = createWindowWall();
const wardrobe = createWardrobe();
scene.add(room, createSoffit(), bookshelves, desk, chair, lounge, windowWall, wardrobe, createLights());

// 3. Karakteri dhe navigimi.
// Pengesat: çdo mobilje që zë vend në dysheme (qilimat jo, mbi to ecet).
const obstacles = [
  bookshelves,
  desk,
  chair,
  wardrobe,
  windowWall,
  lounge.getObjectByName('coffee-table'),
  lounge.getObjectByName('armchair'),
];
scene.updateMatrixWorld(true); // Box3 ka nevojë për pozicionet përfundimtare
const nav = new NavGrid(obstacles);

const character = new Character();
character.root.position.set(-0.7, 0, -1.5); // mes qilimit dhe tavolinës
scene.add(character.root);

// HUD: udhëzimet në ekran dhe gjendja e karakterit
const status = document.querySelector('#status');
const setStatus = (text) => (status.textContent = text);

function goTo(point, onArrive) {
  character.standUp(); // nëse është ulur, ngrihet para se të ecë
  const path = nav.findPath(character.root.position, point);
  if (!path) return setStatus("Can't walk there");
  character.walk(path, onArrive);
  setStatus('Walking…');
}

// 4. Ndërveprimi: klik në dysheme = ec; klik në mobilje = shko dhe vepro
new Picker({
  camera,
  canvas,
  floor: room.getObjectByName('floor'),
  interactive: [chair, lounge.getObjectByName('armchair'), bookshelves.getObjectByName('portfolio-book')],
  onFloorClick: (point) => goTo(point, () => setStatus('Idle')),
  onObjectClick: (name) => {
    const spot = SPOTS[name];
    goTo(spot.approach, (c) => {
      c.placeAt(spot, spot.state);
      setStatus(spot.label);
    });
  },
});

// Vetëm për zhvillim: ?cam=x,y,z&target=x,y,z në URL vendos kamerën,
// p.sh. /?cam=-2,1.7,3&target=1.5,1,-1 për të parë dritaren.
const params = new URLSearchParams(window.location.search);
if (params.has('cam')) camera.position.set(...params.get('cam').split(',').map(Number));
if (params.has('target')) controls.target.set(...params.get('target').split(',').map(Number));
controls.update();

// 5. Responsive
handleResize(camera, renderer);

// 6. Render loop.
// Delta-kohë: sa sekonda kaluan nga kuadri i kaluar. Lëvizja = shpejtësi × dt,
// kështu që karakteri ecën njësoj në 60 Hz dhe në 144 Hz.
// Kufizimi në 0.05 s: kur skeda rikthehet në fokus pas shumë sekondash,
// karakteri nuk "kërcen" përpara.
const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  character.update(dt);
  controls.update(); // e nevojshme për damping
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Vetëm në `npm run dev`: qasje nga console e browser-it për debug.
if (import.meta.env.DEV) window.__app = { scene, camera, character, nav };

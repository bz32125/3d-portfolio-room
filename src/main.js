import * as THREE from 'three';
import './style.css';

import { createRenderer } from './core/renderer.js';
import { createCamera, createControls } from './core/camera.js';
import { handleResize } from './core/resize.js';
import { createRoom } from './world/room.js';
import { createSoffit } from './world/soffit.js';
import { createBookshelves } from './world/bookshelf.js';
import { createDesk } from './world/desk.js';
import { createChair } from './world/chair.js';
import { createLounge } from './world/lounge.js';
import { createWindowWall } from './world/windowWall.js';
import { createWardrobe } from './world/wardrobe.js';
import { createCorridor } from './world/corridor.js';
import { createBed, createNightstands, createPaintings } from './world/bedroom.js';
import { CameraTween, V } from './core/cameraTween.js';
import { Character } from './character/character.js';
import { NavGrid } from './character/navigation.js';
import { SPOTS } from './character/spots.js';
import { Picker } from './interaction/picker.js';
import { DayCycle } from './lighting/dayCycle.js';
import { createTimeControls } from './ui/timeControls.js';
import { updateCurtains, setWindowOpen } from './materials/curtainMaterial.js';

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
const corridor = createCorridor();
const bed = createBed();
const nightstands = createNightstands();
scene.add(
  room,
  corridor,
  createSoffit(),
  bookshelves,
  desk,
  chair,
  lounge,
  windowWall,
  wardrobe,
  bed,
  nightstands,
  createPaintings(),
);

// 2b. Drita: cikli i ditës (dielli, qielli, rrezet, dritat e natës) + slider-i i orës
const day = new DayCycle(renderer, windowWall.getObjectByName('sky'));
scene.add(day.group);
const timeControls = createTimeControls(day);

// Butoni "dritarja e hapur": era në shader-in e perdeve bëhet më e fortë
const windowBtn = document.querySelector('#window-open');
windowBtn.addEventListener('click', () => {
  const open = windowBtn.getAttribute('aria-pressed') !== 'true';
  windowBtn.setAttribute('aria-pressed', String(open));
  setWindowOpen(open);
});

// 3. Karakteri dhe navigimi.
// Pengesat: çdo mobilje që zë vend në dysheme (qilimat jo, mbi to ecet).
const obstacles = [
  bookshelves,
  desk,
  chair,
  wardrobe,
  windowWall,
  bed,
  nightstands,
  corridor.getObjectByName('dresser'),
  lounge.getObjectByName('coffee-table'),
  lounge.getObjectByName('armchair'),
];
scene.updateMatrixWorld(true); // Box3 ka nevojë për pozicionet përfundimtare
const nav = new NavGrid(obstacles);

// Loja nis te dera e korridorit (foto 01): karakteri shikon drejt dhomës (+X).
const character = new Character();
character.root.position.set(-3.8, 0, -2.75);
character.root.rotation.y = Math.PI / 2;
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
  floors: [room.getObjectByName('floor'), corridor.getObjectByName('floor-corridor')],
  interactive: [chair, lounge.getObjectByName('armchair'), bed, bookshelves.getObjectByName('portfolio-book')],
  onFloorClick: (point) => goTo(point, () => setStatus('Idle')),
  onObjectClick: (name) => {
    const spot = SPOTS[name];
    goTo(spot.approach, (c) => {
      c.placeAt(spot, spot.state);
      setStatus(spot.label);
    });
  },
});

// 5. Hyrja: kamera nis në korridor, prapa karakterit (si foto 01).
// Karakteri ecën brenda në dhomë dhe kamera e ndjek me një lëvizje të butë.
const ROOM_VIEW = { pos: V(-1.5, 2.4, 2.85), target: V(0.4, 0.6, -1.0) };
camera.position.set(-4.95, 2.4, -2.35);
controls.target.set(-1.5, 0.5, -2.7);
const cameraTween = new CameraTween(camera, controls);
const intro = !new URLSearchParams(window.location.search).has('cam');
if (intro) {
  setStatus('Welcome in');
  setTimeout(() => {
    goTo(V(-1.0, 0, -1.4), () => setStatus('Idle'));
    cameraTween.to(ROOM_VIEW.pos, ROOM_VIEW.target, 3.5);
  }, 600);
}

// Vetëm për zhvillim: ?cam=x,y,z&target=x,y,z në URL vendos kamerën,
// p.sh. /?cam=-2,1.7,3&target=1.5,1,-1 për të parë dritaren.
const params = new URLSearchParams(window.location.search);
if (params.has('t')) {
  // p.sh. ?t=21 për natën: kërcen direkt në atë orë, pa animacion
  day.setTarget(Number(params.get('t')));
  day.setTime(Number(params.get('t')));
}
if (params.has('cam')) camera.position.set(...params.get('cam').split(',').map(Number));
if (params.has('target')) controls.target.set(...params.get('target').split(',').map(Number));
controls.update();

// 6. Responsive
handleResize(camera, renderer);

// 7. Render loop.
// Delta-kohë: sa sekonda kaluan nga kuadri i kaluar. Lëvizja = shpejtësi × dt,
// kështu që karakteri ecën njësoj në 60 Hz dhe në 144 Hz.
// Kufizimi në 0.05 s: kur skeda rikthehet në fokus pas shumë sekondash,
// karakteri nuk "kërcen" përpara.
const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  day.update(dt);
  timeControls.update();
  updateCurtains(dt, day); // uTime, era dhe dielli për shader-in e perdeve
  day.shafts.faceCamera(camera); // rrezet e diellit kthehen drejt kamerës
  character.update(dt);
  cameraTween.update(dt);
  controls.update(); // e nevojshme për damping
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Vetëm në `npm run dev`: qasje nga console e browser-it për debug.
if (import.meta.env.DEV) window.__app = { scene, camera, controls, character, nav, day, renderer };

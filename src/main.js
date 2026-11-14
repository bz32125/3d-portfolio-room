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
import { Routine } from './character/routine.js';
import { Picker } from './interaction/picker.js';
import { DayCycle } from './lighting/dayCycle.js';
import { createTimeControls } from './ui/timeControls.js';
import { updateCurtains, setWindowOpen } from './materials/curtainMaterial.js';
import { applyAnisotropy } from './materials/textures.js';
import { createEnvironment } from './lighting/environment.js';
import { updateTweens } from './core/tween.js';
import { PortfolioBook } from './portfolio/book.js';
import { createOverlay, setupCvLinks } from './portfolio/overlay.js';

// 1. Canvas, renderer, skena, kamera
const canvas = document.querySelector('#scene');
const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1714);

// Environment map për reflektimet PBR (Faza 7) dhe anisotropy për teksturat
scene.environment = createEnvironment(renderer);
applyAnisotropy(renderer);

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
const day = new DayCycle(renderer, scene, windowWall.getObjectByName('sky'));
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
// Modeli glTF ngarkohet në sfond; deri atëherë (ose nëse mungon) shihet kapsula
character.loadModel();

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

/** Shko te një vend (karrige, kolltuk, shtrat, raft) dhe kryej veprimin. */
function doAction(name) {
  const spot = SPOTS[name];
  // Libri: kur karakteri mbërrin te rafti, hapet portfolio
  const after = name === 'portfolio' ? () => openPortfolio() : () => {};
  if (character.spot === spot) return after(); // është tashmë aty
  goTo(spot.approach, (c) => {
    c.placeAt(spot, spot.state);
    setStatus(spot.label);
    after();
  });
}

/** Ec drejt një pike të rastësishme të lirë në dhomë (rutina "wander"). */
function wander() {
  const p = nav.nearestFree(THREE.MathUtils.randFloat(-2, 2), THREE.MathUtils.randFloat(-2.5, 1.5));
  if (p) goTo(p, () => setStatus('Idle'));
}

// Rutina ditore: karakteri ndjek orën (butoni 🗓 në krye)
const routine = new Routine({ day, character, doAction, wander });
const routineBtn = document.querySelector('#routine');
routineBtn.addEventListener('click', () => {
  const on = !routine.enabled;
  routine.setEnabled(on);
  routineBtn.setAttribute('aria-pressed', String(on));
});

// 4. Ndërveprimi: klik në dysheme = ec; klik në mobilje = shko dhe vepro.
// Çdo klik i lojtarit e ndërpret rutinën deri te blloku tjetër i orarit.
const picker = new Picker({
  camera,
  canvas,
  floors: [room.getObjectByName('floor'), corridor.getObjectByName('floor-corridor')],
  interactive: [chair, lounge.getObjectByName('armchair'), bed, bookshelves.getObjectByName('portfolio-book')],
  onFloorClick: (point) => {
    routine.override();
    goTo(point, () => setStatus('Idle'));
  },
  onObjectClick: (name) => {
    routine.override();
    doAction(name);
  },
});

// 4b. Libri i portfolios (Faza 9): animacioni 3D + faqja HTML
const cameraTween = new CameraTween(camera, controls);
const toast = document.querySelector('#toast');
function showToast(text) {
  toast.textContent = text;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => (toast.hidden = true), 3500);
}
setupCvLinks(() => showToast('The CV file has not been added yet.'));

const portfolio = new PortfolioBook({
  book: bookshelves.getObjectByName('portfolio-book'),
  camera,
  controls,
  cameraTween,
  overlay: createOverlay(),
  onClosed: () => {
    picker.enabled = true;
    setStatus('Idle');
  },
});

function openPortfolio() {
  if (portfolio.busy) return;
  picker.enabled = false; // pa hover/klik gjatë animacionit
  picker.clearHover(); // libri s'duhet të mbetet i theksuar (portokalli) gjatë hapjes
  setStatus('Reading the portfolio');
  portfolio.open();
}

// 5. Hyrja: kamera nis në korridor, prapa karakterit (si foto 01).
// Karakteri ecën brenda në dhomë dhe kamera e ndjek me një lëvizje të butë.
const ROOM_VIEW = { pos: V(-1.5, 2.4, 2.85), target: V(0.4, 0.6, -1.0) };
camera.position.set(-4.95, 2.4, -2.35);
controls.target.set(-1.5, 0.5, -2.7);
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
  if (!portfolio.busy) routine.update(dt); // rutina pret sa është hapur libri
  character.update(dt);
  cameraTween.update(dt);
  updateTweens(dt); // animacionet e librit
  controls.update(); // e nevojshme për damping
  // Kur faqja e portfolios mbulon gjithë ekranin, skena s'shihet: s'e vizatojmë
  // (kursen bateri në telefon). Animacioni vazhdon, vetëm vizatimi ndalet.
  if (portfolio.state !== 'open') renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

// Vetëm në `npm run dev`: qasje nga console e browser-it për debug.
if (import.meta.env.DEV) window.__app = { scene, camera, controls, character, nav, day, renderer, routine, picker, portfolio };

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

// 1. Canvas, renderer, skena, kamera
const canvas = document.querySelector('#scene');
const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1714);

const camera = createCamera();
const controls = createControls(camera, canvas);

// 2. Bota: dhoma dhe dritat
scene.add(createRoom());
scene.add(createSoffit());
scene.add(createBookshelves());
scene.add(createDesk());
scene.add(createChair());
scene.add(createLounge());
scene.add(createWindowWall());
scene.add(createWardrobe());
scene.add(createLights());

// Ndihmës vetëm për zhvillim: boshtet X (e kuqe), Y (jeshile), Z (blu)
// në origjinë, 1 m të gjata. I heqim para deploy-t.
scene.add(new THREE.AxesHelper(1));

// Vetëm për zhvillim: ?cam=x,y,z&target=x,y,z në URL vendos kamerën,
// p.sh. /?cam=-2,1.7,3&target=1.5,1,-1 për të parë dritaren.
const params = new URLSearchParams(window.location.search);
if (params.has('cam')) camera.position.set(...params.get('cam').split(',').map(Number));
if (params.has('target')) controls.target.set(...params.get('target').split(',').map(Number));
controls.update();

// 3. Responsive
handleResize(camera, renderer);

// 4. Render loop: ~60 herë në sekondë
function tick() {
  controls.update(); // e nevojshme për damping
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

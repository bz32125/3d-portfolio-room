import * as THREE from 'three';
import './style.css';

import { createRenderer } from './core/renderer.js';
import { createCamera, createControls } from './core/camera.js';
import { handleResize } from './core/resize.js';
import { createRoom } from './world/room.js';
import { createLights } from './world/lights.js';

// 1. Canvas, renderer, skena, kamera
const canvas = document.querySelector('#scene');
const renderer = createRenderer(canvas);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1714);

const camera = createCamera();
const controls = createControls(camera, canvas);

// 2. Bota: dhoma dhe dritat
scene.add(createRoom());
scene.add(createLights());

// Ndihmës vetëm për zhvillim: boshtet X (e kuqe), Y (jeshile), Z (blu)
// në origjinë, 1 m të gjata. I heqim para deploy-t.
scene.add(new THREE.AxesHelper(1));

// 3. Responsive
handleResize(camera, renderer);

// 4. Render loop: ~60 herë në sekondë
function tick() {
  controls.update(); // e nevojshme për damping
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

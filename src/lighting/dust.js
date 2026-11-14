import * as THREE from 'three';
import { BOUNDS, WINDOW } from '../config.js';

// Pluhuri në rrezet e diellit (Faza 10, detaj): 300 pika (THREE.Points) që
// lundrojnë ngadalë pranë dritares. Duken vetëm kur ka diell, me ngjyrën e tij.
// Një BufferGeometry me 300 pozicione = 1 draw call.

const COUNT = 300;
// Zona ku lundron pluhuri: përpara dritares, ku hyn dielli
const MIN = new THREE.Vector3(0.6, 0.3, WINDOW.centerZ - WINDOW.width / 2);
const MAX = new THREE.Vector3(BOUNDS.right - 0.25, WINDOW.bottom + WINDOW.height, WINDOW.centerZ + WINDOW.width / 2);

/** Teksturë e rrumbullakët e butë (pa të, pikat do të ishin katrorë). */
function createDotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 32;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 32, 32);
  return new THREE.CanvasTexture(c);
}

export function createDust() {
  const positions = new Float32Array(COUNT * 3);
  const phases = new Float32Array(COUNT); // çdo grimcë lëkundet me fazën e vet
  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = THREE.MathUtils.randFloat(MIN.x, MAX.x);
    positions[i * 3 + 1] = THREE.MathUtils.randFloat(MIN.y, MAX.y);
    positions[i * 3 + 2] = THREE.MathUtils.randFloat(MIN.z, MAX.z);
    phases[i] = Math.random() * Math.PI * 2;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    size: 0.012, // m: sizeAttenuation e bën më të vogël kur është larg
    map: createDotTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geometry, material);
  points.name = 'dust';
  points.frustumCulled = false; // pozicionet ndryshojnë: s'llogarisim bounding sphere çdo kuadër

  let time = 0;
  return {
    points,
    /** @param {number} strength 0…1 sa e fortë është drita e diellit */
    update(dt, sunColor, strength) {
      material.opacity = 0.7 * strength;
      points.visible = strength > 0.02;
      if (!points.visible) return;
      material.color.copy(sunColor);
      time += dt;
      // Zbret shumë ngadalë dhe lëkundet anash; kur del poshtë, rikthehet lart
      for (let i = 0; i < COUNT; i++) {
        const k = i * 3;
        positions[k] += Math.sin(time * 0.3 + phases[i]) * 0.01 * dt;
        positions[k + 1] -= 0.015 * dt;
        positions[k + 2] += Math.cos(time * 0.25 + phases[i]) * 0.01 * dt;
        if (positions[k + 1] < MIN.y) positions[k + 1] = MAX.y;
      }
      geometry.attributes.position.needsUpdate = true;
    },
  };
}

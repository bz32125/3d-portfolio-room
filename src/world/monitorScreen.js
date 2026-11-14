import * as THREE from 'three';

// Ekrani i monitorit me kod që lëviz (Faza 10, detaj).
// CanvasTexture: vizatojmë tekst me Canvas 2D dhe e përdorim si teksturë.
// Çdo 0.1 s e rivizatojmë me një zhvendosje më lart dhe i themi three.js
// `needsUpdate = true`, që ta ridërgojë në GPU. 256 × 160 px: shumë i lirë.

// Rreshta "kodi" të përgjithshëm (vetëm dekor, nga ky projekt)
const LINES = [
  ['#c792ea', 'const ', '#82aaff', 'sun', '#eeffff', ' = new DirectionalLight();'],
  ['#eeffff', 'sun.', '#82aaff', 'castShadow', '#eeffff', ' = true;'],
  ['#c792ea', 'function ', '#82aaff', 'tick', '#eeffff', '() {'],
  ['#eeffff', '  const dt = ', '#82aaff', 'clock', '#eeffff', '.getDelta();'],
  ['#eeffff', '  day.', '#82aaff', 'update', '#eeffff', '(dt);'],
  ['#eeffff', '  character.', '#82aaff', 'update', '#eeffff', '(dt);'],
  ['#eeffff', '  renderer.', '#82aaff', 'render', '#eeffff', '(scene, camera);'],
  ['#eeffff', '}', '#546e7a', '', '#546e7a', ''],
  ['#546e7a', '// uniforms → GPU', '#546e7a', '', '#546e7a', ''],
  ['#eeffff', 'uTime.value += ', '#f78c6c', 'dt', '#eeffff', ';'],
  ['#c792ea', 'float ', '#eeffff', 'wave = ', '#82aaff', 'sin(uTime + p.y);'],
  ['#c792ea', 'vec3 ', '#eeffff', 'n = ', '#82aaff', 'normalize(vNormal);'],
  ['#eeffff', 'path = nav.', '#82aaff', 'findPath', '#eeffff', '(from, to);'],
  ['#eeffff', 'mixer.', '#82aaff', 'update', '#eeffff', '(dt);'],
];
const LINE_H = 16;

export function createMonitorScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  // Materiali i ekranit: e njëjta teksturë si ngjyrë dhe si dritë (emissive)
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0xffffff,
    emissiveMap: texture,
    emissiveIntensity: 0.9,
    roughness: 0.3,
  });

  let offset = 0; // sa piksel është ngjitur teksti
  let timer = 0;

  function draw() {
    ctx.fillStyle = '#0f1724';
    ctx.fillRect(0, 0, 256, 160);
    ctx.font = '12px Consolas, monospace';
    const first = Math.floor(offset / LINE_H);
    for (let i = 0; i < 12; i++) {
      const line = LINES[(first + i) % LINES.length];
      let x = 10;
      const y = 18 + i * LINE_H - (offset % LINE_H);
      for (let k = 0; k < line.length; k += 2) {
        ctx.fillStyle = line[k];
        ctx.fillText(line[k + 1], x, y);
        x += ctx.measureText(line[k + 1]).width;
      }
    }
    texture.needsUpdate = true; // ridërgo pikselët e rinj në GPU
  }
  draw();

  return {
    material,
    update(dt) {
      offset += dt * 14; // 14 px në sekondë
      timer += dt;
      if (timer < 0.1) return; // rivizatim 10 herë në sekondë mjafton
      timer = 0;
      draw();
    },
  };
}

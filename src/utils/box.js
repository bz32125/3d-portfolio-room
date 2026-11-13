import * as THREE from 'three';

// Gjeometritë e kutive ruhen në cache sipas përmasave:
// 60 rafte me të njëjtat përmasa ndajnë një BoxGeometry të vetme.
const geometryCache = new Map();

function boxGeometry(w, h, d) {
  const key = `${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}`;
  if (!geometryCache.has(key)) {
    geometryCache.set(key, new THREE.BoxGeometry(w, h, d));
  }
  return geometryCache.get(key);
}

/**
 * Krijon një kuti me përmasat w × h × d (metra) me qendër te (x, y, z).
 * Shumica e mobiljeve në këtë projekt janë kuti, ndaj ky funksion
 * na kursen shumë rreshta të përsëritur.
 */
export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(boxGeometry(w, h, d), material);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

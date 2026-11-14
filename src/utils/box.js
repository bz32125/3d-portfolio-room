import * as THREE from 'three';

// Gjeometritë e kutive ruhen në cache sipas përmasave:
// 60 rafte me të njëjtat përmasa ndajnë një BoxGeometry të vetme.
const geometryCache = new Map();

function boxGeometry(w, h, d) {
  const key = `${w.toFixed(4)}|${h.toFixed(4)}|${d.toFixed(4)}`;
  if (!geometryCache.has(key)) {
    const geo = new THREE.BoxGeometry(w, h, d);
    scaleBoxUvs(geo, w, h, d);
    geometryCache.set(key, geo);
  }
  return geometryCache.get(key);
}

/**
 * UV në metra. BoxGeometry i jep çdo faqeje UV nga 0 në 1, pavarësisht madhësisë:
 * tekstura e drurit do të shtrihej njësoj mbi një raft 40 cm dhe një panel 2.6 m.
 * Këtu çdo UV shumëzohet me përmasat e vërteta të faqes, ndaj 1 njësi UV = 1 m
 * dhe `texture.repeat` thotë sa metra mbulon tekstura (textures.js).
 *
 * BoxGeometry ka 6 faqe me nga 4 kulme, në rendin +x, -x, +y, -y, +z, -z.
 * Për secilën: [cila përmasë shkon përgjatë u, cila përgjatë v].
 */
function scaleBoxUvs(geo, w, h, d) {
  const faces = [
    [d, h], // +x
    [d, h], // -x
    [w, d], // +y
    [w, d], // -y
    [w, h], // +z
    [w, h], // -z
  ];
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const [su, sv] = faces[Math.floor(i / 4)];
    uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  }
}

/** E njëjta ide për një PlaneGeometry (dysheme, mure): UV × (gjerësia, lartësia). */
export function metricPlane(w, h) {
  const geo = new THREE.PlaneGeometry(w, h);
  const uv = geo.attributes.uv;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * w, uv.getY(i) * h);
  return geo;
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

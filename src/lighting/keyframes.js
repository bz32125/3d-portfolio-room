import * as THREE from 'three';

// Ndihmës për keyframe-t e orës: [[ora, vlera], ...] → vlera për çdo orë.
// Teknika: interpolim linear (lerp) mes dy pikave fqinje, si në animacion.
// Përdoret nga dayCycle.js për intensitetin dhe ngjyrën e diellit, qiellin etj.

/** Gjen dy keyframe-t rreth orës h dhe sa larg jemi mes tyre (t nga 0 në 1). */
function locate(keys, h) {
  if (h <= keys[0][0]) return [0, 0, 0];
  for (let i = 1; i < keys.length; i++) {
    if (h <= keys[i][0]) {
      const t = (h - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]);
      return [i - 1, i, t];
    }
  }
  const last = keys.length - 1; // pas keyframe-it të fundit: mbetet vlera e fundit
  return [last, last, 0];
}

/** Vlerë numerike në orën h. */
export function sampleNumber(keys, h) {
  const [a, b, t] = locate(keys, h);
  return THREE.MathUtils.lerp(keys[a][1], keys[b][1], t);
}

/**
 * Ngjyrë në orën h, e shkruar në `target`.
 * THREE.Color i ruan ngjyrat në hapësirë lineare, ndaj edhe përzierja bëhet
 * në hapësirë lineare (fizikisht e saktë), jo në sRGB.
 */
const _a = new THREE.Color();
const _b = new THREE.Color();
export function sampleColor(keys, h, target) {
  const [a, b, t] = locate(keys, h);
  return target.lerpColors(_a.set(keys[a][1]), _b.set(keys[b][1]), t);
}

/** Kalim i butë 0 → 1 mes edge0 dhe edge1 (si smoothstep në GLSL). */
export function smoothstep(edge0, edge1, x) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

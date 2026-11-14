import * as THREE from 'three';
import { WINDOW, ROOM_LIGHTS } from '../config.js';
// Vite: `?raw` e importon skedarin si tekst (string), pa e ekzekutuar.
import vertexShader from '../shaders/curtain.vert.glsl?raw';
import fragmentShader from '../shaders/curtain.frag.glsl?raw';

// ShaderMaterial i perdeve (Faza 6): lidh GLSL-in tonë me three.js.
// Rubrika "Own ShaderMaterial": uniforms (vlera nga JS → GPU, të njëjta për
// gjithë perden) dhe varyings (nga vertex → fragment, të interpoluara).

const WIND_CLOSED = 0.015; // m: dritarja e mbyllur, lëvizje shumë e lehtë
const WIND_OPEN = 0.06; // m: dritarja e hapur, era më e fortë

// Uniform-et e përbashkëta: të njëjtat objekte { value } futen në çdo perde,
// ndaj kur ndryshojmë një vlerë këtu, ndryshon për të gjitha perdet njëherësh.
const shared = {
  uTime: { value: 0 },
  uWind: { value: WIND_CLOSED },
  uSunIntensity: { value: 0 },
  uSunColor: { value: new THREE.Color() },
  uSunDir: { value: new THREE.Vector3(1, 0.5, 0).normalize() },
  uAmbient: { value: new THREE.Color() },
  // Drejtkëndëshi i dritares në (z, y): vetëm aty perdja ndriçohet nga prapa
  uWindowMin: { value: new THREE.Vector2(WINDOW.centerZ - WINDOW.width / 2, WINDOW.bottom) },
  uWindowMax: { value: new THREE.Vector2(WINDOW.centerZ + WINDOW.width / 2, WINDOW.bottom + WINDOW.height) },
};

let windTarget = WIND_CLOSED;
const warm = new THREE.Color(ROOM_LIGHTS.warm);
const nightWarm = new THREE.Color(); // objekt ndihmës, që të mos krijojmë Color të ri çdo kuadër

/**
 * @param {object} o
 *  color, opacity (1 = e trashë), translucency, folds, width, height
 */
export function createCurtainMaterial({ color, opacity, translucency, folds, width, height }) {
  return new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      ...shared, // referenca te objektet e përbashkëta (jo kopje)
      uBaseColor: { value: new THREE.Color(color) },
      uOpacity: { value: opacity },
      uTranslucency: { value: translucency },
      uFolds: { value: folds },
      uWidth: { value: width },
      uHeight: { value: height },
      uFoldDepth: { value: 0.035 },
    },
    side: THREE.DoubleSide, // perdja shihet nga të dyja anët
    transparent: opacity < 1,
    depthWrite: opacity >= 1, // perdja e hollë s'duhet të fshehë atë që është prapa saj
  });
}

/** Butoni "dritarja e hapur": era bëhet më e fortë (gradualisht, në update). */
export function setWindowOpen(open) {
  windTarget = open ? WIND_OPEN : WIND_CLOSED;
}

/**
 * Thirret në çdo kuadër: koha, era dhe dielli nga cikli i ditës.
 * @param {number} dt  delta-koha (e kufizuar në main.js)
 * @param {import('../lighting/dayCycle.js').DayCycle} day
 */
export function updateCurtains(dt, day) {
  // Koha rritet me dt (jo me orën e sistemit): pas një skede në sfond, pa kërcim.
  shared.uTime.value += dt;
  // Era i afrohet vlerës së synuar butësisht (easing eksponencial)
  shared.uWind.value += (windTarget - shared.uWind.value) * (1 - Math.exp(-2 * dt));

  shared.uSunIntensity.value = day.sunIntensity;
  shared.uSunColor.value.copy(day.sunColor);
  shared.uSunDir.value.copy(day.sunDirection).negate(); // nga perdja drejt diellit
  // Ambienti: drita e HemisphereLight + pak nga dritat e ngrohta të natës
  shared.uAmbient.value
    .copy(day.hemi.color)
    .multiplyScalar(day.hemi.intensity * 0.5)
    .add(nightWarm.copy(warm).multiplyScalar(0.35 * day.night));
}

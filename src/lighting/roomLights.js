import * as THREE from 'three';
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js';
import { BOUNDS, SOFFIT, ROOM_LIGHTS } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { LAMPS } from '../world/bedroom.js';

// Dritat e dhomës për natën: 2 PointLight te LED-et e tavanit (cove),
// 2 PointLight brenda llambave të komodinave dhe 1 RectAreaLight para monitorit.
// Rubrika "Lighting": bashkë me Hemisphere + Directional (dayCycle.js) janë 4 lloje dritash.
// Asnjëra nuk hedh hije (kursim): hijet i jep vetëm dielli.

export function createRoomLights() {
  const group = new THREE.Group();
  group.name = 'room-lights';
  const warm = new THREE.Color(ROOM_LIGHTS.warm);

  // LED-et e fshehura (cove): dy pika poshtë tavanit, në gjysmën e pasme dhe të
  // përparme të dhomës. distance = 8: drita s'llogaritet më larg se 8 m (kursim).
  const cove = [-1.6, 1.6].map((z) => {
    const light = new THREE.PointLight(warm, 0, 8, 2); // decay 2 = fizikisht e saktë
    light.position.set(0, SOFFIT.bottom + 0.3, z);
    group.add(light);
    return light;
  });

  // Llambat e natës: drita del nga qendra e abazhurit
  const lamps = LAMPS.map((p) => {
    const light = new THREE.PointLight(warm, 0, 4, 2);
    light.position.copy(p);
    group.add(light);
    return light;
  });

  // Shkëlqimi i monitorit: RectAreaLight = dritë nga një drejtkëndësh (si ekrani).
  // Kërkon init() një herë; punon vetëm me MeshStandard/PhysicalMaterial.
  RectAreaLightUniformsLib.init();
  const screen = new THREE.RectAreaLight(0x9fc4ff, ROOM_LIGHTS.screenGlow, 0.48, 0.29);
  screen.position.set(0.1, 1.09, BOUNDS.back + 0.24); // pak para ekranit (desk.js)
  screen.lookAt(0.1, 1.0, 0); // drita del drejt dhomës (+Z)
  group.add(screen);

  /**
   * night: 0 = ditë (dritat fikur), 1 = natë (plotësisht ndezur).
   * Intensitetet ndryshojnë gradualisht, kurrë s'i heqim dritat nga skena:
   * ndryshimi i numrit të dritave do ta detyronte three.js të rikompilonte
   * shader-at e të gjitha materialeve (një "ngecje" e dukshme).
   */
  function setNight(night) {
    for (const l of cove) l.intensity = ROOM_LIGHTS.coveIntensity * night;
    for (const l of lamps) l.intensity = ROOM_LIGHTS.lampIntensity * night;
    MATERIALS.led.emissiveIntensity = ROOM_LIGHTS.ledEmissive * night;
    MATERIALS.lampShade.emissiveIntensity = 1.5 * night;
    // Monitori është gjithmonë ndezur, por natën duket më shumë
    screen.intensity = ROOM_LIGHTS.screenGlow * (0.3 + 0.7 * night);
  }

  return { group, setNight };
}

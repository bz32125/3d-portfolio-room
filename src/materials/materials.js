import * as THREE from 'three';
import { loadTexture } from './textures.js';

// Materialet e përbashkëta të skenës, në një vend.
// Ngjyrat janë marrë nga fotot e dhomës.
// Rubrika "PBR" (Faza 7): MeshStandardMaterial / MeshPhysicalMaterial me vlera
// fizike: metalness (0 = dielektrik si druri, 1 = metal) dhe roughness
// (0 = pasqyrë, 1 = mat). Reflektimet vijnë nga scene.environment (PMREM).
//
// Pse të përbashkëta: 100 rafte me të njëjtin material = 1 material në GPU,
// jo 100. Ndryshon një ngjyrë këtu dhe ndryshon kudo.
// --- Teksturat (ambientCG, CC0). size = sa metra mbulon një kopje e teksturës.
const wood = {
  map: loadTexture('Wood049_Color', { color: true, size: 1.2 }),
  normalMap: loadTexture('Wood049_NormalGL', { size: 1.2 }),
  roughnessMap: loadTexture('Wood049_Roughness', { size: 1.2 }),
};
const fabricMaps = {
  map: loadTexture('Fabric062_Color', { color: true, size: 0.35 }),
  normalMap: loadTexture('Fabric062_NormalGL', { size: 0.35 }),
};
// Pllakat 60 × 60 cm: tekstura ka 8 × 8 pllaka, pra mbulon 8 × 0.6 = 4.8 m
const tiles = {
  map: loadTexture('Tiles107_Color', { color: true, size: 4.8 }),
  normalMap: loadTexture('Tiles107_NormalGL', { size: 4.8 }),
  roughnessMap: loadTexture('Tiles107_Roughness', { size: 4.8 }),
};

// Tekstura e drurit është kafe e hirtë (mesatarja sRGB ≈ 0.48, 0.39, 0.31); ngjyra
// e materialit e shumëzon atë. Me këtë "tint" (vlera lineare, pak > 1 te e kuqja)
// mesatarja bëhet ≈ 0.60, 0.45, 0.31: arra e ngrohtë e fotove.
const WALNUT_TINT = new THREE.Color().setRGB(1.6, 1.35, 1.05);

export const MATERIALS = {
  // Druri i arrës (raftet, tavolina, sirtarët): ngjyrë + normal + roughness map.
  // roughness shumëzohet me roughnessMap (mesatarja e saj ≈ 0.5),
  // ndaj 1.2 × 0.5 ≈ 0.6 = dru i lyer mat, si në foto.
  walnut: new THREE.MeshStandardMaterial({ ...wood, color: WALNUT_TINT, roughness: 1.2 }),
  // Pak më i errët, për pjesën e pasme të rafteve, që të ketë thellësi
  walnutDark: new THREE.MeshStandardMaterial({ ...wood, color: 0xb08f72, roughness: 1.4 }),
  // Dyshemeja: pllaka të bardha të lustruara, të ngjyrosura bezhë (si në foto).
  // roughnessMap ≈ 0.04 mesatarisht (pllaka) dhe më e lartë te fugat; × 6 ≈ 0.25.
  floorTiles: new THREE.MeshStandardMaterial({ ...tiles, color: 0xdccdb6, roughness: 6 }),
  // Muret: suva me normal map të lehtë (normalScale 0.35): s'duket "gungë", por
  // drita e ulët e diellit nxjerr pak strukturë.
  wallPlaster: new THREE.MeshStandardMaterial({
    color: 0xf2eee6,
    roughness: 0.92,
    normalMap: loadTexture('Plaster001_NormalGL', { size: 2 }),
    normalScale: new THREE.Vector2(0.35, 0.35),
  }),
  // Bazat e zeza poshtë rafteve dhe komodinave
  plinth: new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.8 }),
  // Pjesa e ulur e tavanit
  soffit: new THREE.MeshStandardMaterial({ color: 0xf5f2ec, roughness: 1 }),
  // Shiriti LED: emissive = ndriçon vetë, pa varur nga dritat e skenës.
  // emissiveIntensity ndryshon me orën (roomLights.js): 0 ditën, i ndezur natën.
  led: new THREE.MeshStandardMaterial({
    color: 0xfff1d6,
    emissive: 0xffc27a,
    emissiveIntensity: 0,
  }),
  // Abazhuri i llambave të natës: pëlhurë e çelët që "ndizet" natën
  lampShade: new THREE.MeshStandardMaterial({
    color: 0xf1e6d2,
    emissive: 0xffb06a,
    emissiveIntensity: 0,
    roughness: 0.9,
    side: THREE.DoubleSide, // abazhuri është tub i hapur: shihet edhe nga brenda
  }),
  // Pajisjet elektronike. TV: plastikë e zezë me shtresë llaku (clearcoat):
  // MeshPhysicalMaterial shton një shtresë të dytë reflektuese mbi bazën.
  blackGloss: new THREE.MeshPhysicalMaterial({
    color: 0x0c0c0e,
    roughness: 0.3,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
  }),
  blackMatte: new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.75 }),
  screenOn: new THREE.MeshStandardMaterial({
    color: 0x0b1a2e,
    emissive: 0x9fc4ff,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  }),
  aluminium: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.8 }),
  // Mobiljet e ndenjes. Pëlhura: MeshPhysicalMaterial me "sheen", shkëlqimi i
  // butë anash që kanë pëlhurat (fijet e vogla e kthejnë dritën mbrapsht).
  fabric: new THREE.MeshPhysicalMaterial({
    ...fabricMaps,
    color: 0xf2ece2,
    roughness: 0.95,
    sheen: 0.6,
    sheenRoughness: 0.8,
    sheenColor: 0xffffff,
  }),
  whiteTop: new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.25 }),
  // Metalet: metalness 1 = s'ka ngjyrë difuze, vetëm reflektim me ngjyrën e vet
  gold: new THREE.MeshStandardMaterial({ color: 0xd4a65a, roughness: 0.3, metalness: 1 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xe6e8ec, roughness: 0.2, metalness: 1 }),
  meshBlack: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.9 }),
  rugGreen: new THREE.MeshStandardMaterial({ ...fabricMaps, color: 0x3d4a36, roughness: 1 }),
  // Qilimi: modeli i mermerit si ngjyrë + normal map e pëlhurës (është qilim, jo gur)
  rugMarble: new THREE.MeshStandardMaterial({
    map: loadTexture('Marble014_Color', { color: true, size: 1.6 }),
    normalMap: fabricMaps.normalMap,
    color: 0xf6f2ec,
    roughness: 1,
  }),
  // Perdet kanë ShaderMaterial-in e tyre: materials/curtainMaterial.js
  windowFrame: new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.6 }),
  // Pasqyrat (gardëroba, korridori): metal i lëmuar plotësisht, reflekton
  // scene.environment. roughness 0.02 = reflektim i mprehtë.
  mirror: new THREE.MeshStandardMaterial({ color: 0xe8ecef, roughness: 0.02, metalness: 1 }),
  // Pjesa e gjumit: shtrati, mbulesa jeshile, radiatori, dera
  quiltGreen: new THREE.MeshPhysicalMaterial({
    ...fabricMaps,
    color: 0x6f7d50,
    roughness: 0.95,
    sheen: 0.5,
    sheenRoughness: 0.8,
    sheenColor: 0xc8d4a8,
  }),
  sheetWhite: new THREE.MeshStandardMaterial({ ...fabricMaps, color: 0xf4f0e8, roughness: 0.9 }),
  // Lëkura e kokës së shtratit: normal map me poret e lëkurës, roughness ≈ 0.45
  // (map ≈ 0.37 × 1.2) dhe pak clearcoat, si lëkurë e lustruar.
  leatherBlack: new THREE.MeshPhysicalMaterial({
    color: 0x1c1c1e,
    normalMap: loadTexture('Leather026_NormalGL', { size: 0.5 }),
    roughnessMap: loadTexture('Leather026_Roughness', { size: 0.5 }),
    roughness: 1.2,
    clearcoat: 0.3,
    clearcoatRoughness: 0.4,
  }),
  radiator: new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.4, metalness: 0.2 }),
  door: new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.5 }),
  // Tre pikturat mbi shtrat (ngjyrat kryesore nga fotot 11–12)
  paintingOrange: new THREE.MeshStandardMaterial({ color: 0xd8823e, roughness: 0.8 }),
  paintingDark: new THREE.MeshStandardMaterial({ color: 0x3b2a33, roughness: 0.8 }),
  paintingPink: new THREE.MeshStandardMaterial({ color: 0xc4566a, roughness: 0.8 }),
  // Doreza e sirtarëve
  handle: new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.4, metalness: 0.6 }),
};

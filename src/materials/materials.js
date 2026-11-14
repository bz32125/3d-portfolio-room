import * as THREE from 'three';

// Materialet e përbashkëta të skenës, në një vend.
// Ngjyrat janë marrë nga fotot e dhomës. Teksturat (Faza 3) dhe vlerat
// PBR përfundimtare (Faza 4) do të shtohen këtu, pa prekur modelet.
//
// Pse të përbashkëta: 100 rafte me të njëjtin material = 1 material në GPU,
// jo 100. Ndryshon një ngjyrë këtu dhe ndryshon kudo.
export const MATERIALS = {
  // Druri i arrës (raftet, tavolina, sirtarët)
  walnut: new THREE.MeshStandardMaterial({ color: 0x9a7350, roughness: 0.65 }),
  // Pak më i errët, për pjesën e pasme të rafteve, që të ketë thellësi
  walnutDark: new THREE.MeshStandardMaterial({ color: 0x6e5136, roughness: 0.7 }),
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
  // Pajisjet elektronike
  blackGloss: new THREE.MeshStandardMaterial({ color: 0x0c0c0e, roughness: 0.25, metalness: 0.2 }),
  blackMatte: new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.75 }),
  screenOn: new THREE.MeshStandardMaterial({
    color: 0x0b1a2e,
    emissive: 0x9fc4ff,
    emissiveIntensity: 0.6,
    roughness: 0.3,
  }),
  aluminium: new THREE.MeshStandardMaterial({ color: 0xb8bcc2, roughness: 0.35, metalness: 0.8 }),
  // Mobiljet e ndenjes
  fabric: new THREE.MeshStandardMaterial({ color: 0xd8d3ca, roughness: 0.95 }),
  whiteTop: new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xb8954a, roughness: 0.35, metalness: 0.9 }),
  chrome: new THREE.MeshStandardMaterial({ color: 0xd6d8dc, roughness: 0.2, metalness: 1 }),
  meshBlack: new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.9 }),
  rugGreen: new THREE.MeshStandardMaterial({ color: 0x2f3a2a, roughness: 1 }),
  rugMarble: new THREE.MeshStandardMaterial({ color: 0xd9d3c9, roughness: 1 }),
  // Perdet kanë ShaderMaterial-in e tyre: materials/curtainMaterial.js
  windowFrame: new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.6 }),
  // Gardëroba me xham të errët
  darkGlass: new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.08, metalness: 0.3 }),
  // Pasqyra e gardërobës (pa env map duket e errët; Faza 6 i jep reflektim)
  mirror: new THREE.MeshStandardMaterial({ color: 0xa9b1b8, roughness: 0.15, metalness: 0.5 }),
  // Pjesa e gjumit: shtrati, mbulesa jeshile, radiatori, dera
  quiltGreen: new THREE.MeshStandardMaterial({ color: 0x55603f, roughness: 0.95 }),
  sheetWhite: new THREE.MeshStandardMaterial({ color: 0xece8e0, roughness: 0.9 }),
  leatherBlack: new THREE.MeshStandardMaterial({ color: 0x1c1c1e, roughness: 0.55 }),
  radiator: new THREE.MeshStandardMaterial({ color: 0xf2f2ef, roughness: 0.4, metalness: 0.2 }),
  door: new THREE.MeshStandardMaterial({ color: 0xe9e4da, roughness: 0.5 }),
  // Tre pikturat mbi shtrat (ngjyrat kryesore nga fotot 11–12)
  paintingOrange: new THREE.MeshStandardMaterial({ color: 0xd8823e, roughness: 0.8 }),
  paintingDark: new THREE.MeshStandardMaterial({ color: 0x3b2a33, roughness: 0.8 }),
  paintingPink: new THREE.MeshStandardMaterial({ color: 0xc4566a, roughness: 0.8 }),
  // Doreza e sirtarëve
  handle: new THREE.MeshStandardMaterial({ color: 0x2a2018, roughness: 0.4, metalness: 0.6 }),
};

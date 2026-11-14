// Pajisje me prekje (telefon, tablet): aty ulim cilësinë që të mbajmë FPS-në.
// (pointer: coarse) = gishti është pajisja kryesore, jo miu.
export const IS_MOBILE = window.matchMedia('(pointer: coarse)').matches;

// Përmasat e dhomës në metra (1 unit = 1 m).
// Matje të përafërta nga besniku, 2026-11-06.
export const ROOM = {
  width: 5, // boshti X: përgjatë murit me rafte
  depth: 7, // boshti Z: përgjatë murit me dritare
  height: 3.15, // boshti Y: nga dyshemeja te tavani
};

// Tavani i ulur anash (soffit) me LED, si në foto.
export const SOFFIT = {
  bottom: 2.6, // lartësia e pjesës së poshtme; raftet arrijnë deri këtu
  band: 0.6, // sa del korniza nga muri
};

// Muri me rafte (i matur nga besniku): 3.85 × 2.60 × 0.36 m.
// Dy kulla me 3 kolona secila, me tavolinën në mes.
export const WALL_UNIT = {
  width: 3.85,
  height: 2.6,
  depth: 0.36,
  columnWidth: 0.4, // 3 kolona × 0.40 = 1.20 m për kullë
  plinth: 0.08, // baza e zezë
  board: 0.02, // trashësia e dërrasave
  shelfSpacing: 0.315, // distanca mes rafteve
  deskTop: 0.78, // qendra e pllakës së tavolinës
  deskThickness: 0.04,
  deskDepth: 0.6,
};

// Kufijtë e dhomës, të llogaritur një herë që të mos i përsërisim kudo.
// Origjina (0, 0, 0) është në qendër të dyshemesë.
export const BOUNDS = {
  left: -ROOM.width / 2, // x = -2.5  (gardëroba)
  right: ROOM.width / 2, // x = +2.5  (dritarja)
  back: -ROOM.depth / 2, // z = -3.5  (muri me rafte)
  front: ROOM.depth / 2, // z = +3.5  (nga u bë fotoja e gjerë)
};

// Korridori (fotot 01, 02, 13): vazhdon nga muri i majtë, pranë rafteve,
// drejt -X. Dera e hyrjes është në fund të tij; loja nis këtu.
// Matjet janë vlerësime nga fotot.
export const CORRIDOR = {
  minX: BOUNDS.left - 2.5, // x = -5.0 (dera)
  maxX: BOUNDS.left, // x = -2.5 (hapja në murin e dhomës)
  minZ: BOUNDS.back, // z = -3.5 (vazhdim i murit me rafte)
  maxZ: -2.2, // gjerësia 1.3 m
  height: 2.6, // tavan më i ulët se dhoma
};

// Zonat ku karakteri mund të ecë: dhoma dhe korridori.
// Korridori zgjatet 0.5 m brenda dhomës, që zonat të mbivendosen te hapja;
// përndryshe brezi i mureve (rrezja e karakterit) do ta mbyllte kalimin.
export const NAV_AREAS = [
  { minX: BOUNDS.left, maxX: BOUNDS.right, minZ: BOUNDS.back, maxZ: BOUNDS.front },
  { minX: CORRIDOR.minX, maxX: CORRIDOR.maxX + 0.5, minZ: CORRIDOR.minZ, maxZ: CORRIDOR.maxZ },
];

// Dritarja në murin e djathtë (x = +2.5), fotot 03, 08, 11.
// Rreth 4.0 × 2.0 m, qendra në z ≈ -0.6. Muri ka një hapje të vërtetë këtu,
// që dielli (DirectionalLight) të hyjë vetëm nga dritarja.
export const WINDOW = { centerZ: -0.6, width: 4.0, height: 2.0, bottom: 0.55 };

// ---------------------------------------------------------------------------
// Cikli i ditës (Faza 5). Çdo tabelë është listë keyframe-sh [ora, vlera];
// mes dy pikave vlera interpolohet linearisht (lerp).
// Vlerat janë vlerësime (shih listën në PR), ndryshoji këtu pa prekur kodin.
// ---------------------------------------------------------------------------
export const DAY = {
  startHour: 15, // ora me të cilën hapet loja (diell i ngrohtë pasdite)
  secondsPerHour: 10, // modaliteti "auto": 1 orë në lojë ≈ 10 s reale
  smoothing: 4, // sa shpejt ora e shfaqur ndjek slider-in (1/s), për lëvizje të butë

  sunrise: 6,
  sunset: 18.5,
  minElevation: 4, // gradë mbi horizont në lindje/perëndim
  maxElevation: 50, // gradë në mesditë; më lart dielli s'do të hynte thellë në dhomë
  azimuthSwing: 55, // gradë: në mëngjes dielli vjen nga -Z, në mbrëmje nga +Z
  shadowMapSize: 2048,

  // Intensiteti i diellit (DirectionalLight.intensity)
  sunIntensity: [
    [0, 0],
    [5.75, 0],
    [6, 0.4],
    [9, 1.2],
    [12, 2.5],
    [14, 2.5],
    [17, 0.6],
    [18.5, 0.2],
    [18.75, 0],
    [24, 0],
  ],
  // Ngjyra e diellit: portokalli në lindje/perëndim, e bardhë neutrale në mesditë
  sunColor: [
    [6, 0xff9a5a],
    [9, 0xffdcb8],
    [12, 0xfff8f0],
    [14, 0xfff8f0],
    [17, 0xffcf9a],
    [18.5, 0xff8448],
  ],
  // HemisphereLight: dritë ambienti, më e fortë ditën, e dobët natën
  hemiIntensity: [
    [0, 0.2],
    [5.5, 0.2],
    [7.5, 0.6],
    [12, 0.75],
    [17, 0.6],
    [19.5, 0.2],
    [24, 0.2],
  ],
  // Qielli prapa dritares: ngjyra lart (zenith) dhe afër horizontit
  skyTop: [
    [0, 0x05091a],
    [5, 0x0a1230],
    [6.25, 0x5c6fa3],
    [8, 0x7fb0e6],
    [12, 0x8cbcf0],
    [17, 0x7fa9dd],
    [18.5, 0x4a4f8a],
    [19.5, 0x141a3d],
    [24, 0x05091a],
  ],
  skyHorizon: [
    [0, 0x0d1430],
    [5, 0x1d2347],
    [6.25, 0xf0a070],
    [8, 0xd5e6f5],
    [12, 0xe6f0fa],
    [17, 0xf3d9b0],
    [18.5, 0xf07a45],
    [19.5, 0x3a2d52],
    [24, 0x0d1430],
  ],
  // Natën dritat e dhomës ndizen gradualisht (faktori "night" 0 → 1)
  nightFadeIn: [17.5, 19], // mbrëmje: nga 17:30 deri 19:00
  nightFadeOut: [5.5, 7], // mëngjes: nga 05:30 deri 07:00
  exposureDay: 0.85,
  exposureNight: 1.35, // natën pak më shumë ekspozim, që dhoma të mos jetë e zezë
  // scene.environmentIntensity: sa ndikon environment map (reflektimet + drita
  // e butë e ambientit). Natën shumë më pak, që dhoma të mbetet e ngrohtë.
  envDay: 0.35,
  envNight: 0.12,
};

// Dritat e dhomës për natën: ngjyrë e ngrohtë ~2700 K (llamba "warm white").
// Intensiteti i PointLight është në candela (physically correct lights në r155+).
export const ROOM_LIGHTS = {
  warm: 0xffb06a, // ≈ 2700 K
  coveIntensity: 5, // 2 PointLight pranë shiritave LED të tavanit
  lampIntensity: 1.6, // llamba mbi secilën komodinë (më shumë djeg murin pas saj)
  ledEmissive: 2.5, // shkëlqimi i shiritave LED kur janë ndezur plotësisht
  screenGlow: 4, // RectAreaLight para monitorit (nits)
};

// ---------------------------------------------------------------------------
// Karakteri (Faza 8). Modeli: Quaternius "Universal Base Characters" +
// "Universal Animation Library" (CC0), glTF, në public/models/character.glb.
// Nëse skedari mungon, mbetet kapsula (shih character.js).
// ---------------------------------------------------------------------------
export const CHARACTER = {
  modelUrl: 'models/character.glb',
  height: 1.75, // m: modeli shkallëzohet në këtë lartësi (vlerësim)
  walkSpeed: 1.3, // m/s për kapsulën, ose nëse shpejtësia e klipit s'matet dot
  fade: 0.3, // s: kohëzgjatja e crossfade mes animacioneve
};

// Emrat e klipeve të animacionit për çdo veprim. Për secilin: lista emrash që
// provohen me radhë (fillimisht emri i saktë, pastaj si pjesë e emrit, pa
// dallim shkronjash të mëdha/vogla). Emrat e saktë i shkruan console-a kur
// ngarkohet modeli: "[character] animation clips: [...]". Ndryshoji këtu.
export const ANIMATIONS = {
  idle: ['Idle_Loop', 'Idle'],
  walk: ['Walk_Loop', 'Walk', 'Walking'],
  sit: ['Sitting_Idle_Loop', 'Sitting_Idle', 'Sitting', 'Sit'],
  sitType: ['Sitting_Typing', 'Typing', 'Sitting_Talking_Loop'],
  read: ['Sitting_Reading', 'Reading', 'Sitting_Idle_Loop'],
  sleep: ['Lying_Idle', 'Laying', 'Lying', 'Sleep', 'Lie'],
  shelf: ['Interact', 'PickUp', 'Idle_Loop'], // në këmbë para raftit
};

// Rutina ditore (kur "Character follows the clock" është ndezur):
// [ora e fillimit, veprimi]. Veprimet = çelësat e SPOTS (chair, armchair, bed)
// ose 'wander' = ecën nëpër dhomë. Mbrëmjen e ndajmë në orë: lexon, ecën, lexon...
export const ROUTINE = [
  [0, 'bed'],
  [7, 'wander'],
  [9, 'chair'],
  [13, 'armchair'],
  [15, 'chair'],
  [18, 'armchair'],
  [19, 'wander'],
  [20, 'armchair'],
  [21, 'wander'],
  [22, 'armchair'],
  [23, 'bed'],
];

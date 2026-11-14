import * as THREE from 'three';
import { BOUNDS, WALL_UNIT as U } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Dy kullat e rafteve të murit të pasmë.
// Secila kullë ka 3 kolona. Kolona pranë tavolinës nuk zbret deri në
// dysheme: fillon mbi pllakën e tavolinës (poshtë saj është komodina).

const BACK_Z = BOUNDS.back + U.depth / 2; // qendra e thellësisë së rafteve
const DESK_SURFACE = U.deskTop + U.deskThickness / 2; // 0.80 m

/**
 * Ndërton një kullë rafti.
 * @param {number} leftX  skaji i majtë i kullës (x)
 * @param {number[]} starts  ku fillon secila kolonë nga poshtë (0 = dyshemeja)
 * @returns {{ group: THREE.Group, compartments: object[] }}
 *   compartments = hapësirat mes rafteve, ku më vonë vendosen librat
 */
function createTower(leftX, starts) {
  const group = new THREE.Group();
  const cw = U.columnWidth;
  const t = U.board;
  const compartments = [];

  starts.forEach((start, i) => {
    const x0 = leftX + i * cw;
    const cx = x0 + cw / 2;
    const onFloor = start === 0;
    // Ku fillon hapësira e përdorshme e kolonës
    const base = onFloor ? U.plinth : start;

    // Baza e zezë (vetëm për kolonat në dysheme), pak e futur brenda
    if (onFloor) {
      group.add(box(cw, U.plinth, U.depth - 0.04, MATERIALS.plinth, cx, U.plinth / 2, BACK_Z - 0.02));
    }

    // Paneli i pasëm, më i errët, që raftet të duken të thella
    const backH = U.height - base;
    group.add(box(cw, backH, t / 2, MATERIALS.walnutDark, cx, base + backH / 2, BOUNDS.back + t / 4));

    // Raftet horizontale: i pari në bazë, pastaj çdo 31.5 cm, i fundit në krye
    const levels = [];
    for (let y = base + t / 2; y < U.height - 0.15; y += U.shelfSpacing) levels.push(y);
    levels.push(U.height - t / 2);
    for (const y of levels) {
      // Kolonat mbi tavolinë nuk kanë raft në bazë: aty është vetë tavolina
      if (!onFloor && y === levels[0]) continue;
      group.add(box(cw, t, U.depth, MATERIALS.walnut, cx, y, BACK_Z));
    }

    for (let k = 0; k < levels.length - 1; k++) {
      compartments.push({ x0, x1: x0 + cw, y0: levels[k] + t / 2, y1: levels[k + 1] - t / 2 });
    }
  });

  // Panelet vertikale mes kolonave. Paneli në kufirin i shkon aq poshtë
  // sa kolona më e ulët nga dy anët e tij.
  for (let i = 0; i <= starts.length; i++) {
    const left = starts[i - 1] ?? Infinity;
    const right = starts[i] ?? Infinity;
    const bottom = Math.min(left, right);
    const h = U.height - bottom;
    group.add(box(t, h, U.depth, MATERIALS.walnut, leftX + i * U.columnWidth, bottom + h / 2, BACK_Z));
  }

  return { group, compartments };
}

// Gjenerator numrash "të rastësishëm" me farë fikse (mulberry32):
// librat dalin njësoj në çdo ngarkim, jo ndryshe çdo herë.
function seededRandom(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let r = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const BOOK_COLORS = [0x8c2f2f, 0x2f4a6b, 0xd9cfb8, 0x3e5e3a, 0xb8862d, 0x1f1f24, 0x6b3f5e, 0xe8e2d4, 0x9a5b2e];

// Tri lloje kopertinash: me shkëlqim, satin, mat. Roughness s'mund të ndryshojë
// për çdo instancë në një MeshStandardMaterial, ndaj librat ndahen në 3
// InstancedMesh, një për secilën roughness: 3 draw calls për qindra libra.
const BOOK_ROUGHNESS = [0.45, 0.65, 0.85];

/**
 * Mbush ndarjet me libra si InstancedMesh: qindra libra = pak draw calls.
 * Si në foto, raftet janë gjysmë-bosh: disa ndarje mbeten të zbrazëta.
 */
function createBooks(compartments, skip) {
  const rand = seededRandom(7);
  const books = []; // { matrix, color, kind }
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();

  compartments.forEach((c, index) => {
    if (index === skip || rand() < 0.45) return; // ndarje bosh
    const fill = 0.3 + rand() * 0.5; // sa përqind e ndarjes mbushet
    let x = c.x0 + U.board + 0.01;
    const end = c.x0 + (c.x1 - c.x0) * fill;
    while (x < end) {
      const w = 0.02 + rand() * 0.035;
      const h = Math.min(c.y1 - c.y0 - 0.02, 0.17 + rand() * 0.1);
      const d = 0.15 + rand() * 0.07;
      m.compose(
        new THREE.Vector3(x + w / 2, c.y0 + h / 2, BOUNDS.back + 0.03 + d / 2),
        q,
        new THREE.Vector3(w, h, d),
      );
      // Ngjyra bazë nga paleta + ndryshim i vogël (±5% nuancë/ndriçim) për çdo libër,
      // që dy libra "blu" të mos jenë identikë
      const color = new THREE.Color(BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)]);
      color.offsetHSL((rand() - 0.5) * 0.03, (rand() - 0.5) * 0.1, (rand() - 0.5) * 0.1);
      books.push({ matrix: m.clone(), color, kind: Math.floor(rand() * BOOK_ROUGHNESS.length) });
      x += w + 0.002;
    }
  });

  // Gjeometri 1×1×1 (e përbashkët) që shkallëzohet për çdo libër me matricën e tij
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const group = new THREE.Group();
  group.name = 'books';
  BOOK_ROUGHNESS.forEach((roughness, kind) => {
    const list = books.filter((b) => b.kind === kind);
    const mesh = new THREE.InstancedMesh(geometry, new THREE.MeshStandardMaterial({ roughness }), list.length);
    list.forEach((b, i) => {
      mesh.setMatrixAt(i, b.matrix); // pozicioni + madhësia e librit
      mesh.setColorAt(i, b.color); // ngjyra e kopertinës (instanceColor)
    });
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  });
  return group;
}

/**
 * Libri i portfolios: një objekt i veçantë (jo pjesë e InstancedMesh),
 * që raycaster-i ta gjejë veç dhe ta animojmë më vonë.
 */
function createPortfolioBook(c) {
  const w = 0.06;
  const h = Math.min(c.y1 - c.y0 - 0.03, 0.28);
  const d = 0.21;
  const book = box(w, h, d, new THREE.MeshStandardMaterial({ color: 0x7a1f2b, roughness: 0.5 }), 0, 0, 0);
  book.position.set((c.x0 + c.x1) / 2, c.y0 + h / 2, BOUNDS.back + 0.04 + d / 2);
  book.name = 'portfolio-book';
  book.userData.interactive = 'portfolio';
  return book;
}

export function createBookshelves() {
  const group = new THREE.Group();
  group.name = 'bookshelves';

  const half = U.width / 2; // 1.925
  const towerW = 3 * U.columnWidth; // 1.20

  // Kulla majtas: kolona e 3-të fillon mbi tavolinë.
  const left = createTower(-half, [0, 0, DESK_SURFACE]);
  // Kulla djathtas: kolona e 1-rë fillon mbi tavolinë.
  const right = createTower(half - towerW, [DESK_SURFACE, 0, 0]);
  group.add(left.group, right.group);

  // Libri i portfolios: kolona e mesme e kullës majtas, rreth lartësisë së syve.
  const all = [...left.compartments, ...right.compartments];
  const target = all.findIndex(
    (c) => c.x0 > -half + U.columnWidth - 0.01 && c.x0 < -half + U.columnWidth + 0.01 && c.y0 > 1.3,
  );
  group.add(createBooks(all, target));
  group.add(createPortfolioBook(all[target]));

  return group;
}

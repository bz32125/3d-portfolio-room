import * as THREE from 'three';
import { BOUNDS, WALL_UNIT as U } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

const SURFACE = U.deskTop + U.deskThickness / 2; // sipërfaqja e tavolinës: 0.80 m

// Komodinë me 3 sirtarë dhe bazë të zezë.
function createPedestal(cx) {
  const g = new THREE.Group();
  const w = U.columnWidth;
  const d = 0.55;
  const plinth = 0.06;
  const h = U.deskTop - U.deskThickness / 2 - plinth; // trupi deri poshtë pllakës
  const cz = BOUNDS.back + d / 2;

  g.add(box(w - 0.04, plinth, d - 0.04, MATERIALS.plinth, cx, plinth / 2, cz - 0.02));
  g.add(box(w, h, d, MATERIALS.walnut, cx, plinth + h / 2, cz));

  // 3 sirtarë: vija të holla mes tyre dhe një dorezë vertikale secili
  const front = BOUNDS.back + d;
  const drawerH = h / 3;
  for (let i = 0; i < 3; i++) {
    const y = plinth + drawerH * i + drawerH / 2;
    if (i > 0) g.add(box(w - 0.01, 0.004, 0.004, MATERIALS.walnutDark, cx, plinth + drawerH * i, front + 0.002));
    g.add(box(0.012, 0.09, 0.015, MATERIALS.handle, cx - w / 2 + 0.06, y, front + 0.008));
  }
  return g;
}

// Laptopi: ekrani rrotullohet rreth skajit të pasëm (pivot), si menteshë.
function createLaptop(x, z) {
  const g = new THREE.Group();
  const w = 0.33;
  const d = 0.23;
  g.add(box(w, 0.015, d, MATERIALS.aluminium, 0, 0.0075, 0));

  // Pivot-i vendoset te mentesha (skaji i pasëm i bazës). Ekrani është fëmijë
  // i tij, i zhvendosur lart me gjysmën e lartësisë, kështu që kur rrotullojmë
  // pivot-in, ekrani rrotullohet rreth menteshës dhe jo rreth qendrës së vet.
  const hinge = new THREE.Group();
  hinge.position.set(0, 0.015, -d / 2);
  hinge.rotation.x = -0.3; // rreth 17° prapa vertikales
  const lidH = 0.22;
  hinge.add(box(w, lidH, 0.008, MATERIALS.aluminium, 0, lidH / 2, 0));
  hinge.add(box(w - 0.03, lidH - 0.03, 0.002, MATERIALS.screenOn, 0, lidH / 2, 0.005));
  g.add(hinge);

  g.position.set(x, SURFACE, z);
  g.rotation.y = 0.25;
  return g;
}

function createMonitor(x, z) {
  const g = new THREE.Group();
  g.add(box(0.2, 0.012, 0.15, MATERIALS.blackMatte, 0, 0.006, 0)); // baza
  g.add(box(0.035, 0.13, 0.03, MATERIALS.blackMatte, 0, 0.075, -0.03)); // qafa
  g.add(box(0.5, 0.31, 0.03, MATERIALS.blackMatte, 0, 0.29, -0.02)); // korniza
  g.add(box(0.48, 0.29, 0.004, MATERIALS.screenOn, 0, 0.29, -0.004)); // ekrani
  g.position.set(x, SURFACE, z);
  return g;
}

export function createDesk() {
  const group = new THREE.Group();
  group.name = 'desk';

  // Pllaka "lundruese": nga kolona e 3-të e kullës majtas
  // deri te kolona e 1-rë e kullës djathtas.
  const half = U.width / 2 - 2 * U.columnWidth; // 1.125
  group.add(
    box(2 * half, U.deskThickness, U.deskDepth, MATERIALS.walnut, 0, U.deskTop, BOUNDS.back + U.deskDepth / 2),
  );

  // Komodinat nën kolonat që fillojnë mbi tavolinë
  group.add(createPedestal(-half + U.columnWidth / 2));
  group.add(createPedestal(half - U.columnWidth / 2));

  // TV në mur, mes dy kullave
  group.add(box(1.45, 0.83, 0.04, MATERIALS.blackGloss, 0, 1.45, BOUNDS.back + 0.03));

  // Pajisjet mbi tavolinë (pozicionet nga fotot)
  const z = BOUNDS.back + 0.22;
  group.add(createMonitor(0.1, z));
  group.add(createLaptop(-0.42, BOUNDS.back + 0.42));
  group.add(box(0.2, 0.45, 0.42, MATERIALS.blackMatte, 0.66, SURFACE + 0.225, BOUNDS.back + 0.24)); // PC
  group.add(box(0.08, 0.18, 0.1, MATERIALS.blackMatte, 0.45, SURFACE + 0.09, BOUNDS.back + 0.12)); // altoparlant
  group.add(box(0.42, 0.02, 0.13, MATERIALS.blackMatte, 0.12, SURFACE + 0.01, BOUNDS.back + 0.48)); // tastiera

  return group;
}

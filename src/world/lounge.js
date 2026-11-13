import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Zona e ndenjes: qilimat, tavolina e kafesë dhe kolltuku.

function rounded(w, h, d, radius, material) {
  const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, radius), material);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function createRugs() {
  const g = new THREE.Group();
  // Qilimat janë pak mbi dysheme (y > 0) që të mos "luftojnë" me të në
  // depth buffer (z-fighting). Mermeri pak më lart se tapeti jeshil.
  const green = box(1.0, 0.01, 0.6, MATERIALS.rugGreen, 0, 0.005, -2.7);
  const marble = box(2.4, 0.01, 1.7, MATERIALS.rugMarble, 0, 0.006, -0.8);
  for (const r of [green, marble]) {
    r.castShadow = false;
    g.add(r);
  }
  return g;
}

function createCoffeeTable() {
  const t = new THREE.Group();
  t.name = 'coffee-table';
  const w = 1.0;
  const d = 0.6;
  const h = 0.4;

  const top = rounded(w, 0.03, d, 0.015, MATERIALS.whiteTop);
  top.position.y = h;
  t.add(top);

  // Korniza e artë: 4 këmbë + një drejtkëndësh poshtë, me shufra të holla
  const s = 0.012;
  const lw = w - 0.12;
  const ld = d - 0.12;
  for (const x of [-lw / 2, lw / 2]) {
    for (const z of [-ld / 2, ld / 2]) t.add(box(s, h - 0.015, s, MATERIALS.gold, x, (h - 0.015) / 2, z));
    t.add(box(s, s, ld, MATERIALS.gold, x, s / 2, 0));
  }
  for (const z of [-ld / 2, ld / 2]) t.add(box(lw, s, s, MATERIALS.gold, 0, s / 2, z));

  t.position.set(0.3, 0, -0.9);
  t.rotation.y = -0.15;
  return t;
}

function createArmchair() {
  const a = new THREE.Group();
  a.name = 'armchair';

  // Anët prej druri (korniza), ndenjësja dhe shpinorja me pëlhurë të çelët
  for (const x of [-0.36, 0.36]) a.add(rounded(0.05, 0.6, 0.78, 0.02, MATERIALS.walnut).translateX(x).translateY(0.3));
  const seat = rounded(0.66, 0.16, 0.66, 0.05, MATERIALS.fabric);
  seat.position.set(0, 0.36, 0.03);
  const back = rounded(0.66, 0.5, 0.16, 0.06, MATERIALS.fabric);
  back.position.set(0, 0.62, -0.3);
  back.rotation.x = -0.18; // pak e pjerrët prapa
  a.add(seat, back);

  // Kolltuku shikon nga mesi i dhomës, nga dritarja drejt gardërobës
  a.position.set(1.6, 0, -0.4);
  a.rotation.y = -1.9;
  a.userData.interactive = 'armchair';
  return a;
}

export function createLounge() {
  const g = new THREE.Group();
  g.name = 'lounge';
  g.add(createRugs(), createCoffeeTable(), createArmchair());
  return g;
}

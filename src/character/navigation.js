import * as THREE from 'three';
import { NAV_AREAS } from '../config.js';

// Navigimi: dyshemeja ndahet në një rrjetë qelizash 10 × 10 cm.
// Rrjeta mbulon dhomën dhe korridorin (NAV_AREAS). Një qelizë është e lirë
// vetëm nëse karakteri (rrethi me rreze `radius`) futet plotësisht në një zonë
// dhe nuk prek asnjë mobilje. Rruga gjendet me A*, thjeshtohet në vija të drejta
// dhe pastaj zbutet me një kurbë Catmull-Rom (kapitulli i kurbave), që karakteri
// të ecë në harqe të buta, jo në zig-zag.

const CELL = 0.1;
// Drejtkëndëshi që përmban të gjitha zonat
const MIN_X = Math.min(...NAV_AREAS.map((a) => a.minX)); // -5.0
const MAX_X = Math.max(...NAV_AREAS.map((a) => a.maxX)); // +2.5
const MIN_Z = Math.min(...NAV_AREAS.map((a) => a.minZ)); // -3.5
const MAX_Z = Math.max(...NAV_AREAS.map((a) => a.maxZ)); // +3.5
const COLS = Math.round((MAX_X - MIN_X) / CELL); // 75
const ROWS = Math.round((MAX_Z - MIN_Z) / CELL); // 70

const toCol = (x) => Math.floor((x - MIN_X) / CELL);
const toRow = (z) => Math.floor((z - MIN_Z) / CELL);
const cellCenter = (c, r) => new THREE.Vector3(MIN_X + (c + 0.5) * CELL, 0, MIN_Z + (r + 0.5) * CELL);

export class NavGrid {
  /**
   * @param {THREE.Object3D[]} obstacles  objektet që karakteri nuk i kalon
   * @param {number} radius  "gjerësia" e karakterit (m); pengesat zgjerohen me kaq
   */
  constructor(obstacles, radius = 0.22) {
    this.blocked = new Uint8Array(COLS * ROWS);
    const box = new THREE.Box3();

    // Muret: qeliza është e lirë vetëm brenda një zone, larg mureve sa rrezja
    const inside = (p, a) =>
      p.x > a.minX + radius && p.x < a.maxX - radius && p.z > a.minZ + radius && p.z < a.maxZ - radius;
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS; r++) {
        const p = cellCenter(c, r);
        if (!NAV_AREAS.some((a) => inside(p, a))) this.blocked[r * COLS + c] = 1;
      }
    }

    // Mobiljet: kutia rrethuese (Box3) e secilit objekt, e projektuar në XZ
    for (const obj of obstacles) {
      box.setFromObject(obj);
      const c0 = Math.max(0, toCol(box.min.x - radius));
      const c1 = Math.min(COLS - 1, toCol(box.max.x + radius));
      const r0 = Math.max(0, toRow(box.min.z - radius));
      const r1 = Math.min(ROWS - 1, toRow(box.max.z + radius));
      for (let c = c0; c <= c1; c++) for (let r = r0; r <= r1; r++) this.blocked[r * COLS + c] = 1;
    }
  }

  isFree(x, z) {
    const c = toCol(x);
    const r = toRow(z);
    return c >= 0 && r >= 0 && c < COLS && r < ROWS && !this.blocked[r * COLS + c];
  }

  /** Qeliza e lirë më e afërt me (x, z), nëse pika vetë është e bllokuar. */
  nearestFree(x, z) {
    if (this.isFree(x, z)) return new THREE.Vector3(x, 0, z);
    for (let ring = 1; ring < 30; ring++) {
      for (let dc = -ring; dc <= ring; dc++) {
        for (const dr of [-ring, ring]) {
          for (const [px, pz] of [
            [x + dc * CELL, z + dr * CELL],
            [x + dr * CELL, z + dc * CELL],
          ]) {
            if (this.isFree(px, pz)) return new THREE.Vector3(px, 0, pz);
          }
        }
      }
    }
    return null;
  }

  /** A*: kthen listë pikash nga `from` te `to`, ose null nëse s'ka rrugë. */
  findPath(from, to) {
    const goal = this.nearestFree(to.x, to.z);
    if (!goal) return null;
    // Nëse karakteri ndodhet brenda një pengese (p.sh. ulur në karrige),
    // nisemi nga qeliza e lirë më e afërt.
    const startPoint = this.nearestFree(from.x, from.z) ?? from;
    const start = [toCol(startPoint.x), toRow(startPoint.z)];
    const end = [toCol(goal.x), toRow(goal.z)];
    const key = (c, r) => r * COLS + c;

    const g = new Float32Array(COLS * ROWS).fill(Infinity);
    const came = new Int32Array(COLS * ROWS).fill(-1);
    const closed = new Uint8Array(COLS * ROWS);
    const h = (c, r) => Math.hypot(c - end[0], r - end[1]); // heuristika: distanca e drejtë
    const open = [[h(...start), start[0], start[1]]];
    g[key(...start)] = 0;

    while (open.length) {
      // Lista e hapur është e vogël (dhoma është e vogël), ndaj mjafton sort-i
      open.sort((a, b) => a[0] - b[0]);
      const [, c, r] = open.shift();
      const k = key(c, r);
      if (closed[k]) continue;
      closed[k] = 1;
      if (c === end[0] && r === end[1]) break;

      for (let dc = -1; dc <= 1; dc++) {
        for (let dr = -1; dr <= 1; dr++) {
          if (!dc && !dr) continue;
          const nc = c + dc;
          const nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS) continue;
          const nk = key(nc, nr);
          if (this.blocked[nk] || closed[nk]) continue;
          const cost = g[k] + (dc && dr ? Math.SQRT2 : 1);
          if (cost < g[nk]) {
            g[nk] = cost;
            came[nk] = k;
            open.push([cost + h(nc, nr), nc, nr]);
          }
        }
      }
    }

    const endKey = key(...end);
    if (came[endKey] === -1 && endKey !== key(...start)) return null;

    // Rindërtojmë rrugën nga fundi te fillimi
    const cells = [];
    for (let k = endKey; k !== -1; k = came[k]) cells.push(cellCenter(k % COLS, Math.floor(k / COLS)));
    cells.reverse();
    cells[cells.length - 1] = goal;
    return this.smooth(this.simplify([from.clone().setY(0), ...cells]));
  }

  /**
   * CatmullRomCurve3 kalon nëpër të gjitha pikat e rrugës, me tangjente të buta
   * në kthesa. 'centripetal' është varianti që s'bën laqe as s'del shumë jashtë
   * kur pikat janë në distanca shumë të ndryshme. Pastaj marrim pika çdo 10 cm
   * (getSpacedPoints) që karakteri i ndjek njëra pas tjetrës.
   * Nëse kurba prek një pengesë (del jashtë rrugës së lirë), mbajmë vijat e drejta.
   */
  smooth(points) {
    if (points.length < 3) return points; // vijë e drejtë: s'ka ç'të zbutet
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const samples = curve.getSpacedPoints(Math.max(2, Math.ceil(curve.getLength() / CELL)));
    // Pika e parë dhe e fundit mund të jenë brenda një pengese (p.sh. karakteri
    // ngrihet nga karrigia), ndaj kontrollojmë vetëm pikat e ndërmjetme.
    const inner = samples.slice(1, -1);
    return inner.every((p) => this.isFree(p.x, p.z)) ? samples : points;
  }

  /** Heq pikat e panevojshme: nëse A shihet drejt nga C, B nuk duhet. */
  simplify(points) {
    const out = [points[0]];
    let i = 0;
    while (i < points.length - 1) {
      let j = points.length - 1;
      while (j > i + 1 && !this.lineFree(points[i], points[j])) j--;
      out.push(points[j]);
      i = j;
    }
    return out;
  }

  lineFree(a, b) {
    const steps = Math.ceil(a.distanceTo(b) / (CELL / 2));
    for (let s = 1; s < steps; s++) {
      const t = s / steps;
      if (!this.isFree(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
    }
    return true;
  }
}

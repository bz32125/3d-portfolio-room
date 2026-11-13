import * as THREE from 'three';
import { ROOM, BOUNDS, SOFFIT } from '../config.js';
import { MATERIALS } from '../materials/materials.js';
import { box } from '../utils/box.js';

// Tavani i ulur anash (soffit): një kornizë rreth mureve, nga lartësia 2.60 m
// deri te tavani 3.15 m. Në skajin e brendshëm ka një shirit LED që ndriçon
// lart drejt pjesës qendrore të tavanit (cove lighting), si në foto.
export function createSoffit() {
  const group = new THREE.Group();
  group.name = 'soffit';

  const h = ROOM.height - SOFFIT.bottom; // 0.55 m
  const y = SOFFIT.bottom + h / 2; // qendra vertikale e kornizës
  const b = SOFFIT.band; // gjerësia e kornizës nga muri

  // Katër shiritat e kornizës. Para dhe prapa zënë gjithë gjerësinë,
  // majtas dhe djathtas vetëm hapësirën mes tyre, që të mos mbivendosen.
  const innerDepth = ROOM.depth - 2 * b;
  group.add(box(ROOM.width, h, b, MATERIALS.soffit, 0, y, BOUNDS.back + b / 2));
  group.add(box(ROOM.width, h, b, MATERIALS.soffit, 0, y, BOUNDS.front - b / 2));
  group.add(box(b, h, innerDepth, MATERIALS.soffit, BOUNDS.left + b / 2, y, 0));
  group.add(box(b, h, innerDepth, MATERIALS.soffit, BOUNDS.right - b / 2, y, 0));

  // Shiritat LED: të hollë (2 cm), ngjitur me faqen e brendshme të kornizës,
  // pak poshtë tavanit. Nuk hedhin hije (janë burim drite).
  const t = 0.02;
  const ledY = ROOM.height - 0.12;
  const innerW = ROOM.width - 2 * b;
  const leds = [
    box(innerW, t, t, MATERIALS.led, 0, ledY, BOUNDS.back + b + t / 2),
    box(innerW, t, t, MATERIALS.led, 0, ledY, BOUNDS.front - b - t / 2),
    box(t, t, innerDepth, MATERIALS.led, BOUNDS.left + b + t / 2, ledY, 0),
    box(t, t, innerDepth, MATERIALS.led, BOUNDS.right - b - t / 2, ledY, 0),
  ];
  for (const led of leds) {
    led.castShadow = false;
    group.add(led);
  }

  return group;
}

import * as THREE from 'three';

// Vendet ku karakteri bën diçka. Për secilin:
//  approach  = ku ecën para veprimit (në dysheme, e lirë)
//  position / rotationY = ku vendoset dhe nga shikon gjatë veprimit
//  state = gjendja që merr
// Vlerat janë marrë nga pozicionet e mobiljeve në world/.
export const SPOTS = {
  chair: {
    approach: new THREE.Vector3(0.1, 0, -2.05),
    position: new THREE.Vector3(0.1, 0, -2.6),
    rotationY: Math.PI, // shikon nga -Z, te tavolina
    state: 'sitting',
    label: 'Working at the desk',
  },
  armchair: {
    approach: new THREE.Vector3(1.1, 0, 0.35),
    position: new THREE.Vector3(1.6, 0, -0.4),
    rotationY: -1.9, // si kolltuku
    state: 'reading',
    label: 'Reading in the armchair',
  },
  portfolio: {
    approach: new THREE.Vector3(-1.45, 0, -2.6),
    position: new THREE.Vector3(-1.45, 0, -2.6),
    rotationY: Math.PI, // shikon raftin
    state: 'atShelf',
    label: 'Opening the portfolio book',
  },
};

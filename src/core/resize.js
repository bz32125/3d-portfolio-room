import { MAX_PIXEL_RATIO } from '../config.js';

// fov i Three.js është vertikal. Në një telefon vertikal (ekran i ngushtë)
// kjo do të thotë që horizontalisht shihet shumë pak nga dhoma,
// ndaj e zmadhojmë fov-in kur ekrani është më i lartë se i gjerë.
export function fitFov(camera) {
  camera.fov = camera.aspect < 1 ? 75 : 50;
}

// Kur ndryshon madhësia e dritares (ose telefoni rrotullohet),
// duhet përditësuar edhe kamera, edhe renderer-i.
export function handleResize(camera, renderer) {
  window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Pa këtë, objektet do të dukeshin të shtypura ose të zgjatura.
    camera.aspect = width / height;
    fitFov(camera);
    camera.updateProjectionMatrix(); // rillogarit matricën e projeksionit

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, MAX_PIXEL_RATIO));
  });
}

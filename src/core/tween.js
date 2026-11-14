// Tween i thjeshtë (Faza 9): një vlerë k shkon nga 0 në 1 për `duration` sekonda,
// me easing, dhe në çdo kuadër thërret onUpdate(k). Kthen një Promise që
// përfundon në fund, ndaj animacionet mund të vihen në radhë me `await`:
//   await tween(0.6, (k) => (book.position.z = z0 + 0.3 * k));
// Rubrika "Animation": e drejtuar nga delta-koha (updateTweens(dt) në main.js),
// kështu që e njëjta kohëzgjatje në 30, 60 ose 144 FPS, pa kërcime.

export const ease = {
  // Ngadalë-shpejt-ngadalë: për lëvizje "natyrale" të kamerës dhe objekteve
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  // Vetëm përshpejtim: për "zhytjen" e kamerës në faqe
  inCubic: (t) => t * t * t,
  // Vetëm ngadalësim: për diçka që "ulet" butë
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
};

const active = new Set();

export function tween(duration, onUpdate, easing = ease.inOutCubic) {
  return new Promise((resolve) => {
    active.add({ t: 0, duration, onUpdate, easing, resolve });
  });
}

/** Thirret në çdo kuadër nga render loop-i. */
export function updateTweens(dt) {
  for (const tw of active) {
    tw.t = Math.min(1, tw.t + dt / tw.duration);
    tw.onUpdate(tw.easing(tw.t));
    if (tw.t === 1) {
      active.delete(tw);
      tw.resolve();
    }
  }
}

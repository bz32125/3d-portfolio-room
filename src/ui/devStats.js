// Vetëm në `npm run dev` (Faza 10, rubrika A4: performanca): FPS dhe draw calls.
// FPS = sa kuadra u vizatuan në gjysmë sekonde, × 2. Matet me kohën reale
// (performance.now), jo me dt, sepse dt është i kufizuar në 0.05 s.
// renderer.info.render.calls = sa herë GPU-së iu kërkua të vizatojë në kuadrin e fundit.

export function createDevStats(renderer) {
  if (!import.meta.env.DEV) return { update() {} }; // në build s'ka asgjë
  const el = document.querySelector('#dev-stats');
  el.hidden = false;
  let frames = 0;
  let last = performance.now();

  return {
    update() {
      frames++;
      const now = performance.now();
      if (now - last < 500) return;
      const fps = Math.round((frames * 1000) / (now - last));
      const { calls, triangles } = renderer.info.render;
      el.textContent = `${fps} fps · ${calls} draw calls · ${(triangles / 1000).toFixed(1)}k tris`;
      frames = 0;
      last = now;
    },
  };
}

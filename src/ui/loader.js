// Ekrani i ngarkimit dhe titulli "Cozy Room · Besnik Zeqiri" (Faza 10).
// LoadingManager-i (materials/textures.js) njofton për çdo skedar të ngarkuar:
// teksturat dhe modeli i karakterit. Kur mbaron gjithçka, aktivizohet "Enter",
// që nis hyrjen e karakterit (shtypja e butonit do të lejonte edhe audion,
// nëse do të kishim: browser-at e lejojnë zërin vetëm pas një veprimi të përdoruesit).

const FALLBACK_MS = 10000; // nëse diçka ngec, "Enter" aktivizohet gjithsesi pas 10 s

export function createLoader(manager, onEnter) {
  const root = document.querySelector('#loader');
  const bar = root.querySelector('.loader-bar');
  const fill = root.querySelector('.loader-fill');
  const text = root.querySelector('.loader-text');
  const enter = root.querySelector('#enter');

  function setProgress(percent) {
    fill.style.width = `${percent}%`;
    bar.setAttribute('aria-valuenow', String(percent));
    text.textContent = percent < 100 ? `Loading… ${percent}%` : 'Ready';
  }

  function ready() {
    setProgress(100);
    enter.disabled = false;
    enter.focus();
  }

  // onProgress: (url, sa skedarë mbaruan, sa gjithsej deri tani)
  manager.onProgress = (url, loaded, total) => setProgress(Math.round((loaded / total) * 100));
  manager.onLoad = ready;
  manager.onError = (url) => console.warn('[loader] could not load', url);
  const fallback = setTimeout(ready, FALLBACK_MS);

  function hide() {
    clearTimeout(fallback);
    root.classList.add('is-done'); // opacity → 0 me transition
    setTimeout(() => (root.hidden = true), 600);
  }

  enter.addEventListener('click', () => {
    hide();
    onEnter();
  });

  // skip(): për ?cam= në URL (zhvillim): pa ekran ngarkimi, pa hyrje
  return { skip: hide };
}

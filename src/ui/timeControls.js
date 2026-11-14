// Kontrolli i orës në krye të ekranit: slider 0–24 h, etiketa "14:30" dhe
// butoni "▶ auto" që e çon kohën përpara vetë (1 orë ≈ 10 s).
// Rubrika "Interaction / A4": UI e thjeshtë HTML mbi canvas, punon edhe me prekje
// (input type="range" është element i browser-it, e mbështet touch-in vetë).

/** 14.5 → "14:30" */
export function formatHour(h) {
  const total = Math.round(h * 60) % (24 * 60);
  const hh = String(Math.floor(total / 60)).padStart(2, '0');
  const mm = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/**
 * @param {import('../lighting/dayCycle.js').DayCycle} day
 * @returns {{ update(): void }}  thirret në çdo kuadër, që slider-i të ndjekë orën
 */
export function createTimeControls(day) {
  const slider = document.querySelector('#time');
  const label = document.querySelector('#time-label');
  const autoBtn = document.querySelector('#time-auto');

  slider.value = day.targetHour;

  // 'input' ndodh gjatë tërheqjes (jo vetëm në fund), ndaj ndryshimi shihet menjëherë
  slider.addEventListener('input', () => {
    setAuto(false); // nëse përdoruesi e kap slider-in, auto ndalet
    day.setTarget(Number(slider.value));
  });

  autoBtn.addEventListener('click', () => setAuto(!day.auto));

  function setAuto(on) {
    day.auto = on;
    autoBtn.setAttribute('aria-pressed', String(on)); // për lexuesit e ekranit
    autoBtn.textContent = on ? '❚❚ auto' : '▶ auto';
  }

  let lastLabel = '';
  return {
    update() {
      const text = formatHour(day.hour);
      if (text === lastLabel) return; // DOM-i preket vetëm kur ndryshon minuta
      lastLabel = text;
      label.textContent = text;
      // Slider-i tregon gjithmonë orën e synuar (lëviz vetë në auto ose me ?t= në URL)
      slider.value = day.targetHour;
    },
  };
}

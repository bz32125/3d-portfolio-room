// Paneli i ndihmës (Faza 10, rubrika A4: udhëzime në ekran).
// Hapet/mbyllet me butonin "?" ose me tastet H dhe ?.

export function createHelp() {
  const panel = document.querySelector('#help');
  const toggle = document.querySelector('#help-toggle');
  const close = document.querySelector('#help-close');

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => {
    // Mos e kap tastin kur përdoruesi shkruan diku ose kur është hapur libri
    if (e.target.closest('input, textarea') || !document.querySelector('#portfolio').hidden) return;
    if (e.key === 'h' || e.key === 'H' || e.key === '?') setOpen(panel.hidden);
  });

  return { setOpen };
}

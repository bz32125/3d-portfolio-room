import { CV } from '../data/cv.js';

// Faqja HTML e portfolios (Faza 9), e stiluar si libër i hapur.
// Përmbajtja vjen VETËM nga data/cv.js; fushat bosh tregojnë "to be added".
// Tekst HTML (jo tekst 3D): i mprehtë dhe i lexueshëm në telefon.
// Accessibility: role="dialog", butona të fokusueshëm, Esc mbyll, fokusi
// kthehet te elementi që e kishte para hapjes.

const CHAPTERS = ['About', 'Skills', 'Projects', 'Education', 'Contact'];
const EMPTY = 'To be added.';

/** Krijon një element me tekst (textContent: teksti s'interpretohet si HTML). */
function el(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}

function emptyNote() {
  return el('p', EMPTY, 'pf-empty');
}

/** Përmbajtja e çdo kapitulli: [faqja majtas, faqja djathtas]. */
function renderChapter(name) {
  const left = document.createElement('div');
  const right = document.createElement('div');
  left.append(el('p', `Chapter ${CHAPTERS.indexOf(name) + 1}`, 'pf-kicker'), el('h2', name));

  if (name === 'About') {
    left.append(el('p', CV.name, 'pf-name'));
    if (CV.title) left.append(el('p', CV.title, 'pf-title'));
    if (CV.about.length) for (const p of CV.about) right.append(el('p', p));
    else right.append(emptyNote());
  }

  if (name === 'Skills') {
    if (!CV.skills.length) right.append(emptyNote());
    for (const s of CV.skills) {
      right.append(el('h3', s.group));
      const ul = el('ul');
      for (const item of s.items ?? []) ul.append(el('li', item));
      right.append(ul);
    }
  }

  if (name === 'Projects') {
    if (!CV.projects.length) right.append(emptyNote());
    for (const p of CV.projects) {
      const item = el('section', '', 'pf-item');
      item.append(el('h3', p.name));
      if (p.description) item.append(el('p', p.description));
      if (p.tech?.length) item.append(el('p', p.tech.join(' · '), 'pf-meta'));
      if (p.link) {
        const a = el('a', 'View project');
        a.href = p.link;
        a.target = '_blank';
        a.rel = 'noopener';
        item.append(a);
      }
      right.append(item);
    }
  }

  if (name === 'Education') {
    if (!CV.education.length) right.append(emptyNote());
    for (const e of CV.education) {
      const item = el('section', '', 'pf-item');
      item.append(el('h3', e.school));
      if (e.degree) item.append(el('p', e.degree));
      if (e.years) item.append(el('p', e.years, 'pf-meta'));
      right.append(item);
    }
  }

  if (name === 'Contact') {
    const { email, github, linkedin } = CV.contact;
    const links = [
      email && ['Email', `mailto:${email}`, email],
      github && ['GitHub', github, github],
      linkedin && ['LinkedIn', linkedin, linkedin],
    ].filter(Boolean);
    if (!links.length) right.append(emptyNote());
    const ul = el('ul', '', 'pf-contact');
    for (const [label, href, text] of links) {
      const li = el('li');
      const a = el('a', text);
      a.href = href;
      if (!href.startsWith('mailto:')) {
        a.target = '_blank';
        a.rel = 'noopener';
      }
      li.append(el('span', `${label}: `), a);
      ul.append(li);
    }
    if (links.length) right.append(ul);
  }

  return [left, right];
}

/**
 * Butonat "Download CV" (në libër dhe në HUD): kontrollojmë që skedari ekziston
 * para shkarkimit. Nëse mungon (s'është shtuar ende), shfaqim një mesazh në vend
 * që browser-i të shkarkojë një faqe gabimi.
 */
export function setupCvLinks(onMissing) {
  for (const link of document.querySelectorAll('[data-cv-link]')) {
    link.href = `${import.meta.env.BASE_URL}${CV.cvFile}`;
    link.addEventListener('click', async (e) => {
      if (link.dataset.checked === 'ok') return; // u kontrollua: lëre browser-in të shkarkojë
      e.preventDefault();
      try {
        const res = await fetch(link.href, { method: 'HEAD' });
        const type = res.headers.get('content-type') ?? '';
        if (!res.ok || type.includes('text/html')) throw new Error('missing');
        link.dataset.checked = 'ok';
        link.click(); // tani shkarkimi vazhdon normalisht
      } catch {
        onMissing();
      }
    });
  }
}

export function createOverlay() {
  const root = document.querySelector('#portfolio');
  const tabs = root.querySelector('.pf-tabs');
  const leftPage = root.querySelector('.pf-left');
  const rightPage = root.querySelector('.pf-right');
  const closeBtn = root.querySelector('#pf-close');
  const tabButtons = [];

  function select(name) {
    const [left, right] = renderChapter(name);
    leftPage.replaceChildren(left);
    rightPage.replaceChildren(right);
    for (const b of tabButtons) b.setAttribute('aria-selected', String(b.dataset.chapter === name));
    rightPage.scrollTop = 0;
  }

  for (const name of CHAPTERS) {
    const b = el('button', name, 'pf-tab');
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.dataset.chapter = name;
    b.addEventListener('click', () => select(name));
    tabs.append(b);
    tabButtons.push(b);
  }
  select('About');

  let lastFocus = null;
  const overlay = {
    isOpen: false,
    onCloseRequest: null, // book.js e vendos: mbyllja kalon nëpër animacionin mbrapsht
    show() {
      overlay.isOpen = true;
      lastFocus = document.activeElement;
      root.hidden = false;
      // Një kuadër më vonë, që transition-i i CSS të nisë nga opacity 0
      requestAnimationFrame(() => root.classList.add('is-visible'));
      tabButtons[0].focus();
    },
    hide() {
      overlay.isOpen = false;
      root.classList.remove('is-visible');
      // Pas transition-it (0.4 s) e fshehim plotësisht, që të mos kapë klikime
      setTimeout(() => {
        if (!overlay.isOpen) root.hidden = true;
      }, 400);
      lastFocus?.focus?.();
    },
  };

  closeBtn.addEventListener('click', () => overlay.onCloseRequest?.());
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.isOpen) overlay.onCloseRequest?.();
  });
  return overlay;
}

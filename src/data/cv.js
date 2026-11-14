// Përmbajtja e portfolios (libri i kuq në raft). Faza 9.
// Faqja HTML (portfolio/overlay.js) tregon VETËM atë që është këtu.
// Fushat bosh shfaqen si "to be added", ndaj faqja punon edhe para se të plotësohen.
//
// TODO (besnik): plotëso të gjitha fushat me të dhënat e tua të vërteta.
// Teksti i faqes është në anglisht (si README). Mos shto asgjë që s'është e vërtetë.

export const CV = {
  name: 'Besnik Zeqiri',
  title: '', // TODO (besnik): p.sh. roli ose studimet, një rresht

  // TODO (besnik): 1–3 paragrafë të shkurtër për veten
  about: [],

  // TODO (besnik): aftësitë në grupe, p.sh.
  // { group: 'Languages', items: ['...', '...'] }
  skills: [],

  // TODO (besnik): projektet, p.sh.
  // { name: '...', description: '...', tech: ['...'], link: 'https://...' }
  projects: [],

  // TODO (besnik): shkollimi, p.sh.
  // { school: '...', degree: '...', years: '...' }
  education: [],

  // TODO (besnik): kontaktet që do t'i publikosh (lëre bosh atë që s'do ta shfaqësh)
  contact: {
    email: '',
    github: '',
    linkedin: '',
  },

  // CV-ja si PDF: vendose skedarin në public/cv.pdf. Butoni "Download CV"
  // punon sapo skedari ekziston; deri atëherë tregon një mesazh.
  cvFile: 'cv.pdf',
};

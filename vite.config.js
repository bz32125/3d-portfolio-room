import { defineConfig } from 'vite';

export default defineConfig({
  // Relative paths, so the build also works on GitHub Pages
  // (where the site lives under /3d-portfolio-room/, not at the root).
  base: './',
});

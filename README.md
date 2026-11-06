# 3D Portfolio Room

Portfolio interaktiv 3D: dhoma ime reale e rindërtuar me **Three.js**, ku CV-ja ndodhet brenda një libri në raft.
Projekt për lëndën Computer Graphics (SEEU).

## Si ta nisësh

```bash
npm install
npm run dev
```

Pastaj hap linkun që shfaq Vite (zakonisht http://localhost:5173).

## Struktura

```text
src/
├─ main.js          # pika hyrëse: skena + render loop
├─ config.js        # përmasat e dhomës (metra)
├─ style.css
├─ core/            # renderer, kamera + OrbitControls, resize
└─ world/           # dhoma, dritat (dhe më vonë mobiljet)
```

## Fazat

- [x] 1. Setup: Vite, skena, kamera, dhoma si kuti
- [ ] 2. Guaska e dhomës me soffit
- [ ] 3. Muri me rafte, tavolina, TV
- [ ] 4. Mobiljet e tjera
- [ ] 5. Dritat, hijet, slider-i i orës
- [ ] 6. Interaksioni: libri i CV-së
- [ ] 7. Përmbajtja e CV-së
- [ ] 8. Animacione, mobile, performancë
- [ ] 9. Deploy dhe prezantimi

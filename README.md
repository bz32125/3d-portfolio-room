# Cozy Room: An Interactive 3D Portfolio

A small interactive 3D scene built with **three.js**: a stylized rebuild of my real study room, where an animated character lives through the day. You move the character around, make it work at the desk, read or sleep, and change the time of day with a slider. One book on the shelf holds my developer portfolio.

Final project for **Computer Graphics (CCS-601)**, SEEU, 2026/27, Prof. Dr. Visar Shehu. Individual project by Besnik Zeqiri.

> Status: **Phase 1** (project setup, camera, empty room). Features below describe the planned final version.

## Run it

Requires Node.js 18+.

```bash
npm install
npm run dev      # development server, usually http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build
```

## Concept

| What you do | What happens |
| --- | --- |
| Click on the floor | The character walks there, around the furniture |
| Click the desk chair | The character sits down and types at the computer |
| Click the armchair | The character sits down and reads |
| Click the portfolio book on the shelf | The camera flies into the opened book, which shows my CV (about, skills, projects, education, contact) and a CV download button |
| Move the time slider (0–24 h) | The sun changes angle, strength and colour through the window; at night the warm room lights turn on |
| Drag / scroll | Orbit and zoom the camera |

Core features must be delivered; stretch features are dropped first if time runs short.

- **Core:** room, character with walk / sit-type / sit-read / sleep animations, click-to-move, clickable furniture, time-of-day lighting, portfolio book, desktop + phone, online deployment.
- **Stretch:** character follows the clock by itself (works by day, sleeps at night), reflections on the wardrobe glass, small details such as an animated monitor screen.

## The room

The scene is based on photos and measurements of my real room. Units are **metres** (1 three.js unit = 1 m).

**Coordinate system:** origin at the centre of the floor, Y up. The bookshelf wall is the back wall at `z = -3.5`, the window wall is on the right at `x = +2.5`, the wardrobe and the corridor opening are on the left at `x = -2.5`, and the bed stands against the front wall at `z = +3.5`.

| Object | Size w × h × d (m) | Centre x, y, z (m) |
| --- | --- | --- |
| Room | 5.0 × 3.15 × 7.0 | 0, 1.575, 0 |
| Lowered ceiling edge with hidden LEDs | height 2.60 | along the walls |
| Bookshelf wall (two walnut towers, 3 columns each) | 3.85 × 2.60 × 0.36 | 0, 1.30, -3.32 |
| Floating desk on two 3-drawer pedestals | 2.25 × 0.04 × 0.60 | 0, 0.76, -3.20 |
| Wall-mounted TV (~65") | 1.45 × 0.83 × 0.05 | 0, 1.45, -3.47 |
| Monitor, PC tower, laptop | small | on the desk |
| Office chair (black mesh) | 0.55 × 0.95 × 0.55 | 0.1, 0.48, -2.60 |
| Marble-pattern rug | 2.4 × 0.01 × 1.7 | 0, 0.005, -0.8 |
| White coffee table | 1.0 × 0.40 × 0.6 | 0.3, 0.2, -0.9 |
| Armchair (wooden frame) | 0.75 × 0.80 × 0.75 | 1.6, 0.4, -0.4 |
| Wardrobe (black body, walnut + mirror doors) | 0.6 × 2.45 × 2.4 | -2.2, 1.225, 2.2 |
| Window with grey + sheer curtains, radiator below | ~4.0 × 2.0 | on the right wall, centred at z ≈ -0.6 |
| Double bed with black leather headboard, green quilt | 1.6 × 0.5 × 2.05 | 0.3, 0.25, 2.4 |
| Two nightstands, three paintings above | 0.45 × 0.45 × 0.38 | either side of the bed |
| Entrance corridor (door, walnut dresser, round mirror) | 2.5 × 2.6 × 1.3 | x -5.0 … -2.5, z -3.5 … -2.2 |

Measurements of the bookshelf wall are real; room size and the rest are paced or estimated from photos. The game starts in the entrance corridor: the character walks in from the door and the camera eases into the room. Books on the shelves are stylized blocks with no real titles.

Reference photos of the room are kept locally, outside the repository (not published).

**Palette:** walnut wood, warm white walls, light beige floor tiles, grey curtains, gold and black accents.

## Computer Graphics techniques

Each project phase follows the chapter of that week. The table also shows where each of the seven required techniques (rubric A1) lives in the scene.

| Phase | Chapter | Technique | In the scene |
| --- | --- | --- | --- |
| 1 | 8 Lighting | Lighting | Hemisphere + directional sun + point/spot room lights; sun shadows on floor and furniture, tuned shadow bias |
| 2 | 9 Colour | Colour | sRGB output, correct `colorSpace` on every texture, ACES tone mapping for the bright day / dim night range; time slider interpolates sun colour between keyframes |
| 3 | 10 Textures | Textures | Colour + normal maps on wood, tiles and walls; `RepeatWrapping` on the floor; mipmaps and anisotropic filtering |
| 4 | 11 PBR | PBR materials | Wood (rough), gold legs (metal), wardrobe glass (smooth); PMREM environment map |
| 5 | 12 Shaders | Shader | Own `ShaderMaterial` for the curtains: vertex deformation (waving) + animated colour via uniforms and varyings |
| 6 | 13 Curves | — | Catmull–Rom paths for the character's walk and the camera flight into the book |
| 7 | 14 Animation | Animation | Delta time (clamped on tab refocus), GSAP easing for camera moves, skeletal clips with `AnimationMixer` cross-fades, a small state machine |
| 8 | 15 + final | Interaction | Raycaster hover highlight and click, OrbitControls, on-screen instructions; content, phone support, deployment, documentation |

Where each technique lives in the code will be listed here as the phases are built.

## Project structure

```text
index.html            canvas the scene is drawn into
src/
├─ main.js            entry point: creates the scene, starts the render loop
├─ config.js          room dimensions and wall positions
├─ style.css
├─ core/              renderer, camera + OrbitControls, window resize
└─ world/             room shell and lights (furniture and character follow)
docs/                 screenshots of each phase
```

## Design decisions

- **Furniture built in code from primitives**, not imported models: keeps the scene light and the geometry fully explainable; detail goes into lighting, materials and shaders instead.
- **Metres as units**: real measurements go straight into the code, and lights and shadows behave at a realistic scale.
- **Portfolio content as HTML over the canvas**, not 3D text: sharp and readable on a phone.

## Credits and licenses

| Asset | Source | License |
| --- | --- | --- |
| three.js | [threejs.org](https://threejs.org) | MIT |
| Character and animations | planned: [Quaternius](https://quaternius.com) | CC0 |
| Textures | planned: [ambientCG](https://ambientcg.com), [Poly Haven](https://polyhaven.com) | CC0 |

## AI use

AI tools are used as a pair programmer, as the course expects. Details per phase are in [AI-USE.md](AI-USE.md).

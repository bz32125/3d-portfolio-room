# AI-use statement

Filled in during the work, one block per significant part of the project (course template).
Tool for all phases: **Claude (Claude Code)**.

## Phase 1: project setup, camera, room shell

| Field | Notes |
| --- | --- |
| Tools | Claude (Claude Code) |
| What for | Planning the scene from room photos; first version of the Vite setup, renderer, camera, resize handling and room shell |
| What I verified | _to fill in by besnik_ |
| What I changed or rejected | _to fill in by besnik_ |
| What I learned | _to fill in by besnik_ |

## Phases 2–4 and the full room (bookshelf wall, furniture, movement, corridor/bed/wardrobe)

| Field | Notes |
| --- | --- |
| What AI did | _to fill in by besnik_ |
| What I verified | _to fill in by besnik_ |
| What I learned | _to fill in by besnik_ |

## Phases 5–10

| Phase | What AI did | What I checked / changed | What I learned |
| --- | --- | --- | --- |
| 5 Lighting + time of day | Wrote `lighting/dayCycle.js` (sun keyframes, shadow camera fitted to the room, sky gradient, night factor, exposure), `roomLights.js`, `lightShafts.js`, `keyframes.js`, the time slider UI; cut a real window opening into the right wall and made the shell cast shadows | _to fill in by besnik_ | _to fill in by besnik_ |
| 6 Curtain shader | Wrote the curtain vertex/fragment shaders (folds, wind, analytic normal, translucency, rim), the `ShaderMaterial` wrapper with shared uniforms, the window-open toggle; replaced crossed shaft planes with cylindrical billboards | _to fill in by besnik_ | _to fill in by besnik_ |
| 7 Textures + PBR | Picked and downloaded CC0 textures, re-encoded them, wrote `textures.js`, metric UVs in `utils/box.js`, the PBR material set, the PMREM environment and the desktop `Reflector` mirror; tuned walnut tint and roughness from measured map averages | _to fill in by besnik_ | _to fill in by besnik_ |
| 8 Character | Wrote the glTF loading with capsule fallback, `AnimationMixer` crossfades, walk-speed measurement from the clip, Catmull-Rom path smoothing and the daily routine; tested the model path with three.js's CC0 `RobotExpressive.glb` (not committed) | _to fill in by besnik_ | _to fill in by besnik_ |
| 9 Portfolio book | Built the book rig (hinge), the opening/closing sequence with Promise tweens, the HTML book page from `data/cv.js` (empty placeholders only, no invented content), the CV download check | _to fill in by besnik_ | _to fill in by besnik_ |
| 10 Finish | Loading screen + title card, help panel, camera clamp + follow, mobile settings, dev FPS counter, monitor code CanvasTexture, dust particles, GitHub Pages workflow, this README | _to fill in by besnik_ | _to fill in by besnik_ |

## What I verified / what I learned (overall)

_to fill in by besnik_

## A real AI mistake, and how it was found

**Phase 9: an invisible page blocked every click in the game.**
The AI styled the portfolio overlay with `.portfolio { display: flex; }` and hid it with the HTML `hidden` attribute. The browser hides `[hidden]` elements with a built-in `display: none`, but an author rule like `display: flex` wins over it. So the overlay was "hidden" only by `opacity: 0` and still covered the whole screen, catching every mouse click. Clicking the red book (or anything else) did nothing.

How it was found: the automated test clicked the book and the status line stayed "Idle". The AI first assumed the camera was still moving during the click, added a wait, and the test failed again (a wrong first guess). It then checked the `Raycaster` directly in the page: the book *was* hit, so picking worked and the problem had to be before the canvas got the event. Logging every status change showed the click never reached the game, which pointed to an element on top of the canvas. Fix: a global `[hidden] { display: none !important; }` rule in `src/style.css`.

Other mistakes the AI made and caught in testing during the same work:

- **Phase 5:** an automated edit to `room.js` silently did not apply (Windows line endings did not match), so the old solid right wall stayed and the sun could not enter. Found by casting a ray from the floor toward the sun: the first hit was `wall-right`.
- **Phase 8:** when the path was smoothed into points every 10 cm, the walking code threw away the rest of the step each time it reached a point, so the character walked noticeably slower (up to half speed at low FPS). Found because the timed walking tests started to fail.
- **Phase 9:** OrbitControls' `minDistance` kept the camera 1 m away from the book, so the "dive into the pages" never happened. Found by printing the camera position during the animation and comparing it with the planned close-up.

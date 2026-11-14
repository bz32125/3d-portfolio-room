import * as THREE from 'three';

// Ngarkimi i teksturave (Faza 7). Një TextureLoader i vetëm, me një
// LoadingManager që ekrani i ngarkimit (Faza 10) e përdor për përqindjen.
// Rubrika "Textures": colorSpace (vetëm hartat e ngjyrës janë sRGB), RepeatWrapping
// + repeat, mipmaps (automatike) dhe anisotropic filtering në maksimum.
// Burimi: ambientCG (CC0), 1K JPG, shih README → Credits.

export const loadingManager = new THREE.LoadingManager();
const loader = new THREE.TextureLoader(loadingManager);
const loaded = []; // të gjitha teksturat, që t'u vendosim anisotropy pasi të kemi renderer-in

/**
 * @param {string} file  emri në public/textures/ (pa .jpg), p.sh. 'Wood066_Color'
 * @param {object} o
 *  color: true vetëm për hartat e ngjyrës (albedo). Normal/roughness janë të
 *         dhëna, jo ngjyra: s'duhet t'i kthejmë nga sRGB në linear.
 *  size:  sa metra mbulon një kopje e teksturës (UV-të tona janë në metra, utils/box.js)
 */
export function loadTexture(file, { color = false, size = 1 } = {}) {
  // BASE_URL = './' (vite.config.js), që të punojë edhe në GitHub Pages
  const texture = loader.load(`${import.meta.env.BASE_URL}textures/${file}.jpg`);
  texture.colorSpace = color ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  // RepeatWrapping: jashtë intervalit 0…1 tekstura përsëritet (pllaka pas pllake)
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1 / size, 1 / size);
  // Mipmaps: three.js i gjeneron vetë (generateMipmaps = true) dhe përdor
  // LinearMipmapLinearFilter kur tekstura shihet nga larg: pa "dridhje" (aliasing).
  loaded.push(texture);
  return texture;
}

/**
 * Anisotropic filtering: dyshemeja e parë në kënd të ulët mbetet e mprehtë.
 * Vlera maksimale varet nga GPU-ja (zakonisht 16). Thirret një herë në main.js,
 * para kuadrit të parë (tekstura dërgohet në GPU vetëm kur vizatohet herën e parë).
 */
export function applyAnisotropy(renderer) {
  const max = renderer.capabilities.getMaxAnisotropy();
  for (const texture of loaded) texture.anisotropy = max;
}

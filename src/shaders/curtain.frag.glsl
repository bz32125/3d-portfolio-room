// Fragment shader i perdeve (Faza 6), i shkruar nga ne.
// Ndriçim i thjeshtë: lambert (drita e diellit para) + tejdukshmëri (dielli
// prapa perdes, vetëm aty ku është dritarja) + rim (skajet e ndriçuara)
// + një lëvizje e lehtë e ngjyrës në kohë. Perdja e hollë ka alpha < 1.

uniform float uTime;
uniform vec3 uBaseColor;      // gri ose e bardhë (lineare)
uniform float uOpacity;       // 1 = perde e trashë, < 1 = perde e hollë (sheer)
uniform float uTranslucency;  // sa dritë kalon nga prapa (sheer shumë, gri pak)
uniform vec3 uSunColor;       // nga dayCycle.js
uniform float uSunIntensity;  // nga dayCycle.js (0 natën, 2.5 në mesditë)
uniform vec3 uSunDir;         // drejtimi DREJT diellit (world space, normalizuar)
uniform vec3 uAmbient;        // dritë ambienti: hemisphere + dritat e natës
uniform vec2 uWindowMin;      // (z, y) këndi i poshtëm i dritares
uniform vec2 uWindowMax;      // (z, y) këndi i sipërm i dritares

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
  // Interpolimi mes kulmeve e shkurton normalen, ndaj e normalizojmë sërish.
  vec3 n = normalize(vNormal);
  // Materiali është DoubleSide: nga ana e pasme normalja kthehet mbrapsht.
  if (!gl_FrontFacing) n = -n;

  vec3 sun = uSunColor * uSunIntensity;

  // 1. Lambert: sa drejt e godet dielli faqen që shohim.
  float diffuse = max(dot(n, uSunDir), 0.0);

  // 2. Tejdukshmëria: dielli është PRAPA faqes (dot me -n), por vetëm brenda
  //    drejtkëndëshit të dritares (smoothstep jep skaje të buta, 10 cm).
  float back = max(dot(-n, uSunDir), 0.0);
  vec2 zy = vWorldPos.zy;
  vec2 inside = smoothstep(uWindowMin, uWindowMin + 0.1, zy) * (1.0 - smoothstep(uWindowMax - 0.1, uWindowMax, zy));
  float windowMask = inside.x * inside.y;

  // 3. Ndryshim i lehtë i ngjyrës në kohë (±4%), si dritë që lëviz mbi pëlhurë.
  float shift = 0.04 * sin(uTime * 0.5 + vWorldPos.z * 3.0 + vWorldPos.y * 2.0);
  vec3 base = uBaseColor * (1.0 + shift);

  // Drita e ambientit vjen kryesisht nga brenda dhomës (-X në botë): faqet e
  // rrudhave që shohin dhomën janë më të ndriçuara, luginat më të errëta.
  // Kështu rrudhat duken edhe natën, kur dielli s'ndriçon.
  float roomFacing = 0.55 + 0.45 * dot(n, vec3(-1.0, 0.0, 0.0));

  vec3 color = base * (uAmbient * roomFacing + sun * diffuse * 0.6);
  color += base * sun * back * windowMask * uTranslucency;

  // 4. Rim: skajet që shihen "anash" marrin pak dritë (pëlhura duket e butë).
  vec3 viewDir = normalize(cameraPosition - vWorldPos); // cameraPosition e jep three.js
  float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);
  color += rim * 0.15 * uAmbient;

  // Perdja e hollë shkëlqen pak më shumë (më pak e tejdukshme) aty ku e godet dielli.
  float alpha = min(1.0, uOpacity + 0.15 * back * windowMask * min(uSunIntensity, 1.0));
  gl_FragColor = vec4(color, alpha);

  // E njëjta rrugë dalëse si materialet e three.js: ACES tone mapping + kthim në sRGB.
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}

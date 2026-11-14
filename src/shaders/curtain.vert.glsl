// Vertex shader i perdeve (Faza 6), i shkruar nga ne.
// Rubrika "Own ShaderMaterial": deformim i kulmeve (rrudhat + era) dhe normalja
// e rillogaritur analitikisht, që drita të "kapë" rrudhat.
//
// Gjeometria është një PlaneGeometry e sheshtë në rrafshin XY (x = gjerësia,
// y = lartësia). Këtu e shtyjmë çdo kulm përgjatë Z: z = f(x, y).
// three.js na jep vetë: position, uv, modelMatrix, viewMatrix, projectionMatrix.

uniform float uTime;      // sekonda (rritet me dt, pa kërcime kur rikthehet skeda)
uniform float uWind;      // amplituda e erës në metra (më e madhe me dritare të hapur)
uniform float uFolds;     // sa rrudha ka perdja përgjatë gjerësisë
uniform float uWidth;     // gjerësia e perdes (m)
uniform float uHeight;    // lartësia e perdes (m)
uniform float uFoldDepth; // thellësia e rrudhave (m)

varying vec2 vUv;         // koordinatat e teksturës, për fragment shader-in
varying vec3 vNormal;     // normalja në hapësirën e botës (world space)
varying vec3 vWorldPos;   // pozicioni në botë, për maskën e dritares dhe rim-in

const float TAU = 6.2831853;

void main() {
  vUv = uv;
  vec3 p = position;

  // 0 lart te shina (perdja e fiksuar), 1 poshtë (lëviz më shumë).
  // Në PlaneGeometry uv.y = 1 lart dhe 0 poshtë.
  float hang = 1.0 - uv.y;
  float hang2 = hang * hang; // në katror: lart pothuajse s'lëviz fare

  // 1. Rrudhat: valë sinus përgjatë x. k = frekuenca (radian për metër).
  float k = TAU * uFolds / uWidth;
  float fold = sin(p.x * k) * uFoldDepth;

  // 2. Era: valë që lëviz në kohë dhe ndryshon me x dhe y,
  //    me amplitudë që rritet drejt fundit të perdes (hang2).
  float phase = uTime * 1.6 + p.y * 1.5 + p.x * 2.0;
  float sway = sin(phase) * uWind * hang2;

  p.z += fold + sway;

  // 3. Normalja analitike. Sipërfaqja është z = f(x, y), ndaj tangjentet janë
  //    (1, 0, df/dx) dhe (0, 1, df/dy); prodhimi vektorial i tyre jep
  //    normalen (-df/dx, -df/dy, 1). Derivatet i nxjerrim me dorë:
  //    d/dx sin(x·k)·D = cos(x·k)·k·D ;  d/dx sin(phase) = cos(phase)·2.0
  float dfdx = cos(p.x * k) * k * uFoldDepth + cos(phase) * 2.0 * uWind * hang2;
  //    hang = 1 - uv.y dhe uv.y = y / uHeight + 0.5, pra d(hang)/dy = -1 / uHeight
  //    d/dy [sin(phase)·W·hang²] = cos(phase)·1.5·W·hang² + sin(phase)·W·2·hang·(-1/uHeight)
  float dfdy = cos(phase) * 1.5 * uWind * hang2 - sin(phase) * uWind * 2.0 * hang / uHeight;
  vec3 n = normalize(vec3(-dfdx, -dfdy, 1.0));

  // Normalja në botë: vetëm rrotullimi i modelMatrix (mat3), pa zhvendosje.
  // (Perdja s'ka shkallëzim jo-uniform, ndaj s'duhet inverse-transpose.)
  vNormal = normalize(mat3(modelMatrix) * n);

  vec4 world = modelMatrix * vec4(p, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}

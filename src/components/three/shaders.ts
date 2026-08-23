/**
 * All GLSL for the robot and its rings lives here so the shaders can be read
 * as one piece. Every program is deliberately small — the look comes from layering
 * cheap terms (fresnel, domain-warped bands, additive rim), not from expensive
 * noise or post-processing.
 */

export const ENERGY_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;

  varying vec3 vLocal;
  varying vec3 vViewPos;

  void main() {
    vec3 p = position;

    // Domain-warped ripple across the surface — cheaper than 3D simplex and
    // reads as contained energy rather than as noise.
    float w =
      sin(p.x * 4.1 + uTime * 0.62) *
      cos(p.y * 3.3 - uTime * 0.47) *
      sin(p.z * 4.7 + uTime * 0.38);

    p += normalize(position) * w * (0.05 + uPulse * 0.05) * uEnergy;

    vLocal = p;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const ENERGY_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform vec3 uCyan;
  uniform vec3 uViolet;

  varying vec3 vLocal;
  varying vec3 vViewPos;

  void main() {
    // Flat, faceted normals straight from screen-space derivatives — turns a
    // low-poly icosahedron into a cut crystal with no extra geometry.
    vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
    vec3 v = normalize(-vViewPos);
    float fres = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 2.2);

    float bands = 0.5 + 0.5 * sin(
      vLocal.y * 8.5 - uTime * 1.05 + sin(vLocal.x * 4.6 + uTime * 0.5) * 1.5
    );

    vec3 col = mix(uViolet, uCyan, bands);
    col *= (0.20 + 0.62 * fres) * uEnergy;
    col += uCyan * pow(fres, 3.0) * (0.85 + uPulse * 1.6);
    col += uViolet * uPulse * 0.35;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export const PARTICLE_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uSpread;
  uniform float uAttract;
  uniform float uPixelRatio;

  attribute float aSeed;
  attribute float aScale;

  varying float vFade;
  varying float vSeed;

  void main() {
    vec3 p = position;

    // Slow independent drift so the field never looks like a static texture.
    float t = uTime * 0.055 + aSeed * 6.2831;
    p.x += sin(t * 1.3) * 0.36;
    p.y += cos(t * 1.07) * 0.30;
    p.z += sin(t * 0.86) * 0.36;

    p *= uSpread;

    // Contact chapter: points gather toward the core.
    p = mix(p, normalize(p) * (1.9 + aSeed * 1.4), uAttract);

    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Fade with distance so the field dissolves into the background instead of
    // ending abruptly at the far plane.
    float dist = length(mv.xyz);
    vFade = (1.0 - smoothstep(9.0, 34.0, dist)) * smoothstep(1.4, 4.0, dist);
    vSeed = aSeed;

    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * uPixelRatio * (14.0 / max(dist, 0.001));
  }
`;

export const PARTICLE_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uCyan;
  uniform vec3 uViolet;
  uniform float uOpacity;

  varying float vFade;
  varying float vSeed;

  void main() {
    // Square-ish digital point with a soft core — a spatial data point, not a
    // star. The tiny centre hotspot keeps it legible at 1px.
    vec2 uv = gl_PointCoord - 0.5;
    float d = max(abs(uv.x), abs(uv.y));
    float shape = 1.0 - smoothstep(0.24, 0.5, d);
    float hot = 1.0 - smoothstep(0.0, 0.22, length(uv));

    float alpha = (shape * 0.55 + hot * 0.45) * vFade * uOpacity;
    if (alpha < 0.004) discard;

    vec3 col = mix(uViolet, uCyan, step(0.42, vSeed));
    col = mix(vec3(0.78, 0.83, 0.95), col, 0.72);

    gl_FragColor = vec4(col, alpha);
    #include <colorspace_fragment>
  }
`;

export const RING_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vViewPos;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewPos = mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`;

export const RING_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform vec3 uColor;
  uniform float uOffset;

  varying vec2 vUv;
  varying vec3 vViewPos;

  void main() {
    // A single travelling highlight around the ring reads as light moving
    // through a conductor. Everything else stays near-black.
    float head = fract(vUv.x - uTime * 0.045 + uOffset);
    float trail = pow(1.0 - head, 9.0);
    float base = 0.10;

    vec3 v = normalize(-vViewPos);
    vec3 n = normalize(cross(dFdx(vViewPos), dFdy(vViewPos)));
    float rim = pow(1.0 - clamp(abs(dot(n, v)), 0.0, 1.0), 2.0);

    float i = (base + trail * 1.35 + rim * 0.28) * uEnergy + uPulse * 0.45;
    gl_FragColor = vec4(uColor * i, 1.0);
    #include <colorspace_fragment>
  }
`;

export const SHELL_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    vLocal = position;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalW = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const SHELL_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform vec3 uCyan;
  uniform vec3 uViolet;

  varying vec3 vNormalW;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  void main() {
    // A physical transmission material renders an extra full-scene pass and,
    // against an almost-black backdrop, only ever reads as a grey ball. A
    // fresnel shell is both cheaper and truer: invisible where you look
    // straight through it, bright only at the grazing edge.
    float f = 1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir)));
    float rim = pow(f, 3.2);
    float sheen = pow(f, 1.4) * 0.16;

    // A slow band of light travelling over the surface — the only motion.
    float sweep = pow(
      0.5 + 0.5 * sin(vLocal.y * 5.5 + vLocal.x * 2.4 - uTime * 0.42),
      6.0
    ) * 0.16;

    vec3 col = mix(uCyan, uViolet, clamp(vLocal.y * 0.9 + 0.5, 0.0, 1.0));
    col = mix(vec3(0.86, 0.93, 1.0), col, 0.62);

    float a = (rim * 0.62 + sheen + sweep) * (0.55 + uEnergy * 0.5);
    a += uPulse * rim * 0.5;

    gl_FragColor = vec4(col * (0.8 + uPulse * 0.6), a);
    #include <colorspace_fragment>
  }
`;

/* ==========================================================================
   ROBOT VISOR
   --------------------------------------------------------------------------
   The face plate, and the only part of the robot that emits. Three cheap
   terms layered: a vertical gradient for the glass, a scan line travelling
   down it, and a bright fresnel edge where the plate curves away. The scan is
   the same instrument-readout cue the DOM uses (`.planet-scan`, `.scan-light`),
   so the robot reads as part of the same interface.
   ========================================================================== */

export const VISOR_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalW = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const VISOR_FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uEnergy;
  uniform float uPulse;
  uniform vec3 uCyan;
  uniform vec3 uViolet;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    // Glass body: darkest at the top of the plate, brightening downward, so
    // the visor has a direction and does not read as a flat lit rectangle.
    float grad = smoothstep(0.0, 1.0, vUv.y);

    // One scan line sweeping down, plus a much fainter second at double rate.
    float sweep = fract(uTime * 0.22);
    float scan  = exp(-pow((vUv.y - sweep) * 14.0, 2.0));
    scan += exp(-pow((vUv.y - fract(sweep + 0.5)) * 26.0, 2.0)) * 0.35;

    // Fine horizontal ruling — the readout texture, kept near-invisible.
    float rule = 0.5 + 0.5 * sin(vUv.y * 190.0);

    // Bright where the plate turns away from the eye.
    float f = 1.0 - abs(dot(normalize(vNormalW), normalize(vViewDir)));
    float rim = pow(f, 2.4);

    vec3 col = mix(uViolet, uCyan, 0.30 + grad * 0.55);
    float a =
        0.13 + grad * 0.16          // the plate itself
      + scan * 0.55                 // the travelling line
      + rule * 0.035                // ruling
      + rim  * 0.60;                // curved edge

    col += uCyan * scan * 0.7;
    col += uCyan * rim * 0.5;

    // Energy dims the visor through the quiet middle chapters; a timeline
    // pulse flashes it.
    a *= 0.45 + uEnergy * 0.55;
    a += uPulse * (0.25 + rim * 0.4);
    col *= 0.85 + uPulse * 0.9;

    gl_FragColor = vec4(col, clamp(a, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

/* ==========================================================================
   GLOW
   --------------------------------------------------------------------------
   Light on nothing — used for the robot's hover plume. An INVERSE fresnel:
   brightest where the surface faces the eye and falling to nothing at the
   silhouette, which is what makes a sphere read as a soft volume of light
   rather than as a solid lozenge. A plain basic material has no falloff at
   all, and a normal fresnel would light exactly the wrong half.
   ========================================================================== */

export const GLOW_VERT = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormalW = normalize(normalMatrix * normal);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const GLOW_FRAG = /* glsl */ `
  precision highp float;

  uniform float uEnergy;
  uniform float uPulse;
  uniform vec3 uCyan;

  varying vec3 vNormalW;
  varying vec3 vViewDir;

  void main() {
    float face = clamp(dot(normalize(vNormalW), normalize(vViewDir)), 0.0, 1.0);
    float a = pow(face, 2.6) * (0.35 + uEnergy * 0.45) + uPulse * 0.3;
    gl_FragColor = vec4(uCyan * (0.75 + uPulse * 0.8), a);
    #include <colorspace_fragment>
  }
`;

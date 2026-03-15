import type { ShaderStyleId } from "@/features/shader/types";

export const FLOW_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amplitude * noise(p);
    p *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

mat2 rotate2D(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * u_speed;
  vec2 mouse = u_mouse - 0.5;
  mouse.x *= u_resolution.x / u_resolution.y;

  float mField = exp(-length(p - mouse) * 5.5) * u_mouseStrength;
  vec2 flow = rotate2D(u_direction) * (p * u_scale);

  float n1 = fbm(flow + vec2(t * 0.25, -t * 0.18) + mField * 0.35);
  float n2 = fbm(flow * 1.4 + vec2(-t * 0.17, t * 0.21));
  float band = smoothstep(0.12, 0.88, n1 + n2 * u_noiseAmount);
  float ridge = sin((flow.y + n1 * 0.7) * (8.0 + u_spread * 24.0) + t * 1.2);
  ridge = smoothstep(-0.35, 0.45, ridge + mField * 0.6);

  vec3 gradient = mix(u_colorA, u_colorB, band);
  gradient = mix(gradient, u_colorC, ridge * 0.75);

  float glowMask = pow(max(0.0, 1.0 - length(p) * 1.35), 2.0);
  vec3 glow = gradient * glowMask * u_glow * 0.65;

  float grain = (noise(gl_FragCoord.xy * 0.12 + t * 0.45) - 0.5) * u_grain;
  vec3 color = gradient + glow + grain;

  color = pow(max(color, 0.0), vec3(0.92));
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export const PLASMA_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * (0.7 + u_speed * 1.4);
  vec2 mouse = u_mouse - 0.5;
  float wave1 = sin((p.x * (9.0 + u_scale * 4.0)) + t * 2.1 + mouse.x * 3.0 * u_mouseStrength);
  float wave2 = cos((p.y * (10.0 + u_scale * 3.2)) - t * 1.7 + mouse.y * 3.0 * u_mouseStrength);
  float wave3 = sin((p.x + p.y) * (8.0 + u_spread * 18.0) + t * 1.3);

  float energy = (wave1 + wave2 + wave3) / 3.0;
  float mask = smoothstep(-0.65, 0.8, energy + u_noiseAmount * 0.35);

  vec3 base = mix(u_colorA, u_colorB, mask);
  base = mix(base, u_colorC, smoothstep(0.2, 0.95, energy));

  float glow = exp(-length(p) * (2.2 - u_glow * 0.4)) * (0.45 + u_glow * 0.45);
  float grain = (hash(gl_FragCoord.xy + t * 17.0) - 0.5) * u_grain;
  vec3 color = base + base * glow + grain;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export const AURORA_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), u.x), u.y);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * (0.45 + u_speed);
  float arc = sin((p.x * (3.0 + u_scale * 1.7)) + t * 0.9 + sin(p.y * 6.0));
  float curtain = smoothstep(-0.9, 0.95, arc + p.y * (1.5 + u_spread));

  vec2 drift = vec2(t * 0.15 + u_direction * 0.2, -t * 0.08);
  float fog = noise((p + drift) * (2.8 + u_noiseAmount * 3.5));
  float veil = smoothstep(0.2, 1.0, fog * curtain + 0.12);

  vec3 col = mix(u_colorA, u_colorB, veil);
  col = mix(col, u_colorC, smoothstep(0.55, 1.0, veil + fog * 0.25));

  float mouseLift = exp(-length((u_mouse - 0.5) - p) * 4.0) * u_mouseStrength;
  float glow = pow(veil, 2.0) * (0.35 + u_glow) + mouseLift * 0.7;
  float grain = (hash(gl_FragCoord.xy + t * 13.0) - 0.5) * u_grain;

  vec3 color = col * (0.3 + veil * 0.9) + col * glow + grain;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export const CRT_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float stripe(vec2 uv, float density) {
  float s = sin(uv.x * density * 6.2831853);
  return smoothstep(-0.2, 0.9, s);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;
  float t = u_time * (0.5 + u_speed * 0.8);

  float radial = length(p);
  float warp = radial * radial * (0.08 + u_spread * 0.18);
  vec2 wuv = uv + p * warp;

  float baseField = sin((wuv.x + wuv.y * 0.7) * (9.0 + u_scale * 2.0) + t * 1.2);
  float pulses = cos((wuv.y - wuv.x * 0.6) * (7.0 + u_scale * 2.2) - t * 1.5);
  float energy = (baseField + pulses) * 0.5;

  vec3 base = mix(u_colorA, u_colorB, smoothstep(-1.0, 1.0, energy));
  base = mix(base, u_colorC, smoothstep(0.2, 1.0, energy + 0.25));

  float density = 130.0 + u_scale * 90.0;
  float rMask = stripe(wuv + vec2(0.0025, 0.0), density);
  float gMask = stripe(wuv, density);
  float bMask = stripe(wuv - vec2(0.0025, 0.0), density);

  vec3 mask = vec3(rMask, gMask, bMask);
  vec3 crt = base * mask;

  float vignette = smoothstep(1.25, 0.2, radial);
  float bloom = pow(max(0.0, 1.0 - radial * 1.35), 2.0) * (0.3 + u_glow);
  float noise = (hash(gl_FragCoord.xy + t * 91.0) - 0.5) * (u_grain * 1.3 + u_noiseAmount * 0.05);

  vec3 color = crt * vignette + base * bloom + noise;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export const MESH_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;
  float t = u_time * (0.35 + u_speed * 0.9);

  float gx = abs(fract((p.x + t * 0.08) * (8.0 + u_scale * 4.0)) - 0.5);
  float gy = abs(fract((p.y - t * 0.1) * (8.0 + u_scale * 4.0)) - 0.5);
  float mesh = smoothstep(0.28, 0.02, min(gx, gy));

  float radial = smoothstep(1.15, 0.05, length(p));
  float noise = (hash(gl_FragCoord.xy + t * 47.0) - 0.5) * u_grain;

  vec3 base = mix(u_colorA, u_colorB, radial);
  base = mix(base, u_colorC, mesh * (0.35 + u_glow * 0.4));
  vec3 color = base + base * mesh * (0.2 + u_glow * 0.45) + noise;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export const HOLO_FRAGMENT_SHADER = `
precision mediump float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform vec3 u_colorA;
uniform vec3 u_colorB;
uniform vec3 u_colorC;
uniform float u_speed;
uniform float u_scale;
uniform float u_noiseAmount;
uniform float u_glow;
uniform float u_grain;
uniform float u_spread;
uniform float u_direction;
uniform float u_opacity;
uniform float u_mouseStrength;

varying vec2 v_uv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;
  float t = u_time * (0.6 + u_speed);

  float bands = sin((p.x * (15.0 + u_scale * 4.0)) + t * 2.0) * 0.5 + 0.5;
  float wave = cos((p.y * (11.0 + u_scale * 2.0)) - t * 1.4) * 0.5 + 0.5;
  float prism = smoothstep(0.1, 0.9, bands * 0.65 + wave * 0.35);

  vec3 color = mix(u_colorA, u_colorB, prism);
  color = mix(color, u_colorC, smoothstep(0.45, 1.0, wave + bands * 0.2));

  float fringe = sin((p.x + p.y) * 40.0 + t * 3.0) * 0.015;
  color += vec3(fringe, -fringe * 0.4, fringe * 0.7);

  float vignette = smoothstep(1.2, 0.12, length(p));
  float grain = (hash(gl_FragCoord.xy + t * 77.0) - 0.5) * u_grain;
  color = color * vignette + grain;

  gl_FragColor = vec4(clamp(color, 0.0, 1.0), clamp(u_opacity, 0.0, 1.0));
}
`;

export function getFragmentShaderByStyle(styleId: ShaderStyleId) {
  if (styleId === "plasma") return PLASMA_FRAGMENT_SHADER;
  if (styleId === "aurora") return AURORA_FRAGMENT_SHADER;
  if (styleId === "crt") return CRT_FRAGMENT_SHADER;
  if (styleId === "mesh") return MESH_FRAGMENT_SHADER;
  if (styleId === "holo") return HOLO_FRAGMENT_SHADER;
  return FLOW_FRAGMENT_SHADER;
}

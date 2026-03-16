export const FULLSCREEN_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

export const ANIMATED_GRADIENT_FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;

uniform vec2 u_resolution;
uniform float u_time;

uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;

uniform float u_speed;
uniform float u_scale;
uniform float u_flow;
uniform float u_softness;
uniform float u_contrast;
uniform float u_direction;
uniform float u_opacity;
uniform float u_warpStrength;
uniform float u_grainAmount;
uniform float u_ditherAmount;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x) +
         (c - a) * u.y * (1.0 - u.x) +
         (d - b) * u.x * u.y;
}

vec2 warpUV(vec2 uv, float strength) {
  float t = u_time * u_speed;
  float n1 = noise(uv * u_scale + vec2(t * 0.15, t * 0.10));
  float n2 = noise(uv * u_scale + vec2(-t * 0.12, t * 0.18));
  uv += vec2(n1 - 0.5, n2 - 0.5) * strength;
  return uv;
}

vec3 animatedGradient(vec2 uv) {
  float t = u_time * u_speed;
  uv += vec2(cos(u_direction), sin(u_direction)) * u_flow * 0.08;

  float g1 = sin((uv.x + t * 0.25) * 6.28318) * 0.5 + 0.5;
  float g2 = sin((uv.y + t * 0.18) * 6.28318 + 1.2) * 0.5 + 0.5;
  float g3 = sin((uv.x + uv.y + t * 0.12) * 6.28318 + 2.4) * 0.5 + 0.5;

  vec3 color = vec3(0.0);
  color += u_color1 * g1;
  color += u_color2 * g2;
  color += u_color3 * g3;

  color /= (g1 + g2 + g3 + 0.0001);
  vec3 avg = vec3((color.r + color.g + color.b) / 3.0);
  color = mix(avg, color, 0.4 + u_softness * 0.6);
  return color;
}

vec3 applyGrain(vec3 color, vec2 uv, float amount) {
  float n = hash(uv * u_resolution + u_time * 10.0) - 0.5;
  return color + n * amount;
}

float bayer4(vec2 p) {
  vec2 f = mod(p, 4.0);

  if (f.x < 1.0 && f.y < 1.0) return 0.0 / 16.0;
  if (f.x < 2.0 && f.y < 1.0) return 8.0 / 16.0;
  if (f.x < 3.0 && f.y < 1.0) return 2.0 / 16.0;
  if (f.y < 1.0) return 10.0 / 16.0;

  if (f.x < 1.0 && f.y < 2.0) return 12.0 / 16.0;
  if (f.x < 2.0 && f.y < 2.0) return 4.0 / 16.0;
  if (f.x < 3.0 && f.y < 2.0) return 14.0 / 16.0;
  if (f.y < 2.0) return 6.0 / 16.0;

  if (f.x < 1.0 && f.y < 3.0) return 3.0 / 16.0;
  if (f.x < 2.0 && f.y < 3.0) return 11.0 / 16.0;
  if (f.x < 3.0 && f.y < 3.0) return 1.0 / 16.0;
  if (f.y < 3.0) return 9.0 / 16.0;

  if (f.x < 1.0) return 15.0 / 16.0;
  if (f.x < 2.0) return 7.0 / 16.0;
  if (f.x < 3.0) return 13.0 / 16.0;
  return 5.0 / 16.0;
}

vec3 applyBayerDither(vec3 color, vec2 fragCoord, float amount) {
  float threshold = bayer4(fragCoord) - 0.5;
  return color + threshold * amount;
}

void main() {
  vec2 uv = v_uv;

  uv = warpUV(uv, u_warpStrength);

  vec3 color = animatedGradient(uv);
  color = applyGrain(color, uv, u_grainAmount);
  color = applyBayerDither(color, gl_FragCoord.xy, u_ditherAmount);

  color = (color - 0.5) * (1.0 + u_contrast) + 0.5;
  color = clamp(color, 0.0, 1.0);

  gl_FragColor = vec4(color, u_opacity);
}
`;

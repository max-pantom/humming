import { createEffectInstance } from "@/features/shader/effectRegistry";
import type { EffectLayer, GradientConfig, SceneElement, SceneElementKind, ShaderStyleId, RainbowConfig } from "@/features/shader/types";

export type SurfacePreset = {
  id: string;
  name: string;
  category: "ambient" | "distortion" | "particles";
  styleId: ShaderStyleId;
  description: string;
  config: Partial<RainbowConfig>;
};

export const flowPreset: RainbowConfig = {
  paletteA: "#ff4d6d",
  paletteB: "#ffbe0b",
  paletteC: "#3a86ff",
  speed: 0.4,
  scale: 2.2,
  noiseAmount: 0.6,
  glow: 0.8,
  grain: 0.04,
  spread: 0.45,
  direction: 0.35,
  opacity: 1,
  mouseStrength: 0.18,
};

const plasmaPreset: RainbowConfig = {
  paletteA: "#ff0054",
  paletteB: "#7b2cbf",
  paletteC: "#00f5d4",
  speed: 0.7,
  scale: 2.6,
  noiseAmount: 0.55,
  glow: 0.95,
  grain: 0.025,
  spread: 0.62,
  direction: 0.35,
  opacity: 1,
  mouseStrength: 0.2,
};

const auroraPreset: RainbowConfig = {
  paletteA: "#80ffdb",
  paletteB: "#5390d9",
  paletteC: "#6930c3",
  speed: 0.34,
  scale: 1.6,
  noiseAmount: 0.42,
  glow: 0.72,
  grain: 0.018,
  spread: 0.5,
  direction: -0.22,
  opacity: 1,
  mouseStrength: 0.12,
};

const crtPreset: RainbowConfig = {
  paletteA: "#0011ff",
  paletteB: "#00f7ff",
  paletteC: "#ff0054",
  speed: 0.22,
  scale: 2,
  noiseAmount: 0.28,
  glow: 1.35,
  grain: 0.065,
  spread: 0.7,
  direction: 0.12,
  opacity: 1,
  mouseStrength: 0.08,
};

const meshPreset: RainbowConfig = {
  paletteA: "#9b5cff",
  paletteB: "#37d7ff",
  paletteC: "#f8f7ff",
  speed: 0.38,
  scale: 2.7,
  noiseAmount: 0.52,
  glow: 1.05,
  grain: 0.022,
  spread: 0.58,
  direction: 0.26,
  opacity: 1,
  mouseStrength: 0.12,
};

const holoPreset: RainbowConfig = {
  paletteA: "#00ffd0",
  paletteB: "#5da8ff",
  paletteC: "#ff5ec7",
  speed: 0.46,
  scale: 2.15,
  noiseAmount: 0.44,
  glow: 1.22,
  grain: 0.03,
  spread: 0.64,
  direction: -0.14,
  opacity: 1,
  mouseStrength: 0.1,
};

export const stylePresets: Record<ShaderStyleId, RainbowConfig> = {
  flow: flowPreset,
  plasma: plasmaPreset,
  aurora: auroraPreset,
  crt: crtPreset,
  mesh: meshPreset,
  holo: holoPreset,
};

export const styleLabels: Record<ShaderStyleId, string> = {
  flow: "Flow",
  plasma: "Plasma",
  aurora: "Aurora",
  crt: "CRT",
  mesh: "Mesh",
  holo: "Holo",
};

export const surfacePresets: SurfacePreset[] = [
  {
    id: "ambient-gradient",
    name: "Ambient Gradient",
    category: "ambient",
    styleId: "flow",
    description: "Soft motion for hero backgrounds",
    config: { speed: 0.28, scale: 1.8, glow: 0.6, noiseAmount: 0.35, mouseStrength: 0.06 },
  },
  {
    id: "liquid-blob",
    name: "Liquid Blob",
    category: "distortion",
    styleId: "flow",
    description: "Organic fluid movement",
    config: { speed: 0.52, scale: 2.6, spread: 0.68, noiseAmount: 0.72, mouseStrength: 0.18 },
  },
  {
    id: "noise-field",
    name: "Noise Field",
    category: "ambient",
    styleId: "aurora",
    description: "Textured background for section fills",
    config: { noiseAmount: 0.9, grain: 0.08, glow: 0.45, speed: 0.2 },
  },
  {
    id: "mesh-glow",
    name: "Mesh Glow",
    category: "ambient",
    styleId: "plasma",
    description: "Bright mesh gradients",
    config: { glow: 1.35, scale: 2.2, spread: 0.48, speed: 0.34 },
  },
  {
    id: "aurora-ribbon",
    name: "Aurora",
    category: "ambient",
    styleId: "aurora",
    description: "Calm colored ribbons",
    config: { speed: 0.24, scale: 1.45, noiseAmount: 0.4, spread: 0.52 },
  },
  {
    id: "ripple-surface",
    name: "Ripple",
    category: "distortion",
    styleId: "flow",
    description: "Interactive water-like ripples",
    config: { speed: 0.65, direction: 0.8, spread: 0.72, mouseStrength: 0.34 },
  },
  {
    id: "chrome-wave",
    name: "Chrome Wave",
    category: "distortion",
    styleId: "crt",
    description: "Iridescent CRT-inspired wave",
    config: { glow: 1.55, grain: 0.07, scale: 2.5, noiseAmount: 0.3 },
  },
  {
    id: "heat-distortion",
    name: "Heat Distortion",
    category: "distortion",
    styleId: "plasma",
    description: "Shimmering atmospheric distortion",
    config: { speed: 0.58, spread: 0.74, direction: 1.2, opacity: 0.85 },
  },
  {
    id: "particle-drift",
    name: "Particle Drift",
    category: "particles",
    styleId: "aurora",
    description: "Fine drifting texture",
    config: { grain: 0.12, noiseAmount: 0.62, speed: 0.4, glow: 0.42 },
  },
  {
    id: "holographic-wash",
    name: "Holographic Wash",
    category: "ambient",
    styleId: "crt",
    description: "Shiny prismatic wash",
    config: { glow: 1.7, spread: 0.82, speed: 0.36, scale: 1.9 },
  },
];

export function configForStyle(styleId: ShaderStyleId): RainbowConfig {
  return stylePresets[styleId] ?? flowPreset;
}

export function normalizeStyleId(value: unknown): ShaderStyleId {
  if (value === "flow" || value === "plasma" || value === "aurora" || value === "crt" || value === "mesh" || value === "holo") return value;
  if (value === "rainbow") return "flow";
  if (value === "sunset") return "plasma";
  if (value === "ice") return "aurora";
  if (value === "mono") return "crt";
  return "flow";
}

export const defaultEffects: EffectLayer[] = [createEffectInstance("animatedGradient", 0), createEffectInstance("grain", 1), createEffectInstance("vignette", 2)];

export const defaultGradient: GradientConfig = {
  mode: "linear",
  angle: 120,
  stops: [
    { id: "stop-1", color: "#ff4d6d", position: 0 },
    { id: "stop-2", color: "#ffbe0b", position: 0.5 },
    { id: "stop-3", color: "#3a86ff", position: 1 },
  ],
};

export function createSceneElement(kind: SceneElementKind, index: number): SceneElement {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const offset = index * 20;

  if (kind === "text") {
    return {
      id,
      kind,
      x: 12 + offset,
      y: 12 + offset,
      width: 220,
      height: 64,
      opacity: 1,
      visible: true,
      text: "New Text",
      color: "#ffffff",
      fontSize: 28,
    };
  }

  if (kind === "image") {
    return {
      id,
      kind,
      x: 16 + offset,
      y: 16 + offset,
      width: 240,
      height: 140,
      opacity: 1,
      visible: true,
      src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      alt: "Scene image",
      fit: "cover",
    };
  }

  return {
    id,
    kind,
    x: 20 + offset,
    y: 20 + offset,
    width: 180,
    height: 180,
    opacity: 1,
    visible: true,
    svgMarkup:
      '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><path d="M60 6 L112 34 L112 86 L60 114 L8 86 L8 34 Z" fill="none" stroke="#ffffff" stroke-width="8"/></svg>',
  };
}

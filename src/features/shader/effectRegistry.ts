import type { BlendMode, EffectCategory, EffectLayer, EffectQuality, EffectType } from "@/features/shader/types";

export type EffectControl = {
  id: string;
  label: string;
  kind: "range" | "toggle" | "select";
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: string }>;
};

export type EffectDefinition = {
  type: EffectType;
  label: string;
  category: EffectCategory;
  gpuCost: "low" | "medium" | "high";
  defaultParams: Record<string, number | boolean | string | string[]>;
  controls: EffectControl[];
};

export const effectRegistry: Record<EffectType, EffectDefinition> = {
  animatedGradient: {
    type: "animatedGradient",
    label: "Animated Gradient",
    category: "base",
    gpuCost: "low",
    defaultParams: { speed: 0.35, scale: 1.2, softness: 0.8, direction: 45 },
    controls: [
      { id: "speed", label: "Speed", kind: "range", min: 0, max: 1.2, step: 0.01 },
      { id: "scale", label: "Scale", kind: "range", min: 0.5, max: 3.5, step: 0.01 },
      { id: "softness", label: "Softness", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "direction", label: "Direction", kind: "range", min: -180, max: 180, step: 1 },
    ],
  },
  warp: {
    type: "warp",
    label: "Warp",
    category: "distortion",
    gpuCost: "medium",
    defaultParams: { strength: 0.12, frequency: 2, speed: 0.4, detail: 0.5 },
    controls: [
      { id: "strength", label: "Strength", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "frequency", label: "Frequency", kind: "range", min: 0.5, max: 6, step: 0.01 },
      { id: "speed", label: "Speed", kind: "range", min: 0, max: 1.2, step: 0.01 },
      { id: "detail", label: "Detail", kind: "range", min: 0, max: 1, step: 0.01 },
    ],
  },
  grain: {
    type: "grain",
    label: "Grain",
    category: "texture",
    gpuCost: "low",
    defaultParams: { amount: 0.08, size: 1, animated: true, colored: false },
    controls: [
      { id: "amount", label: "Amount", kind: "range", min: 0, max: 0.2, step: 0.005 },
      { id: "size", label: "Size", kind: "range", min: 0.5, max: 3, step: 0.01 },
      { id: "animated", label: "Animated", kind: "toggle" },
      { id: "colored", label: "Colored", kind: "toggle" },
    ],
  },
  bayerDither: {
    type: "bayerDither",
    label: "Bayer Dithering",
    category: "texture",
    gpuCost: "low",
    defaultParams: { amount: 0.15, scale: 2, contrastBoost: 0 },
    controls: [
      { id: "amount", label: "Amount", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "scale", label: "Scale", kind: "range", min: 1, max: 8, step: 0.1 },
      { id: "contrastBoost", label: "Contrast", kind: "range", min: 0, max: 1, step: 0.01 },
    ],
  },
  godRays: {
    type: "godRays",
    label: "God Rays",
    category: "lighting",
    gpuCost: "high",
    defaultParams: { positionX: 0.5, positionY: 0.3, intensity: 0.4, spread: 0.6, decay: 0.92 },
    controls: [
      { id: "positionX", label: "Light X", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "positionY", label: "Light Y", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "intensity", label: "Intensity", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "spread", label: "Spread", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "decay", label: "Decay", kind: "range", min: 0.7, max: 0.99, step: 0.01 },
    ],
  },
  blur: {
    type: "blur",
    label: "Blur",
    category: "post",
    gpuCost: "medium",
    defaultParams: { radius: 0.2 },
    controls: [{ id: "radius", label: "Radius", kind: "range", min: 0, max: 1, step: 0.01 }],
  },
  vignette: {
    type: "vignette",
    label: "Vignette",
    category: "post",
    gpuCost: "low",
    defaultParams: { amount: 0.25, softness: 0.55 },
    controls: [
      { id: "amount", label: "Amount", kind: "range", min: 0, max: 1, step: 0.01 },
      { id: "softness", label: "Softness", kind: "range", min: 0, max: 1, step: 0.01 },
    ],
  },
};

function nextId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createEffectInstance(type: EffectType, order: number): EffectLayer {
  const def = effectRegistry[type];
  return {
    id: nextId(),
    type,
    label: def.label,
    category: def.category,
    enabled: true,
    order,
    intensity: 0.5,
    opacity: 1,
    blendMode: "normal" as BlendMode,
    quality: "medium" as EffectQuality,
    gpuCost: def.gpuCost,
    params: def.defaultParams,
    target: { scope: "scene" },
  };
}

export const effectTypesByCategory: Record<EffectCategory, EffectType[]> = {
  base: ["animatedGradient"],
  distortion: ["warp"],
  texture: ["grain", "bayerDither"],
  lighting: ["godRays"],
  post: ["blur", "vignette"],
};

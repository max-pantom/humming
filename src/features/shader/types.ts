export type RainbowConfig = {
  paletteA: string;
  paletteB: string;
  paletteC: string;
  speed: number;
  scale: number;
  noiseAmount: number;
  glow: number;
  grain: number;
  spread: number;
  direction: number;
  opacity: number;
  mouseStrength: number;
};

export type ShaderStyleId = "flow" | "plasma" | "aurora" | "crt" | "mesh" | "holo";

export type GradientMode = "linear" | "radial";

export type GradientStop = {
  id: string;
  color: string;
  position: number;
};

export type GradientConfig = {
  mode: GradientMode;
  angle: number;
  stops: GradientStop[];
};

export type SceneElementKind = "text" | "image" | "svg";

type SceneElementBase = {
  id: string;
  kind: SceneElementKind;
  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
};

export type SceneTextElement = SceneElementBase & {
  kind: "text";
  text: string;
  color: string;
  fontSize: number;
};

export type SceneImageElement = SceneElementBase & {
  kind: "image";
  src: string;
  alt: string;
  fit: "cover" | "contain";
};

export type SceneSvgElement = SceneElementBase & {
  kind: "svg";
  svgMarkup: string;
};

export type SceneElement = SceneTextElement | SceneImageElement | SceneSvgElement;

export type EffectType = "animatedGradient" | "warp" | "grain" | "bayerDither" | "godRays" | "blur" | "vignette";

export type BlendMode = "normal" | "add" | "screen" | "multiply" | "overlay" | "softLight";

export type EffectCategory = "base" | "distortion" | "texture" | "lighting" | "post";

export type EffectQuality = "low" | "medium" | "high";

export type EffectTarget = {
  scope: "scene" | "shader";
};

export type EffectLayer = {
  id: string;
  type: EffectType;
  label: string;
  category: EffectCategory;
  enabled: boolean;
  order: number;
  intensity: number;
  opacity: number;
  blendMode: BlendMode;
  quality: EffectQuality;
  gpuCost: "low" | "medium" | "high";
  params: Record<string, number | boolean | string | string[]>;
  target: EffectTarget;
};

export type ShaderEffect = EffectLayer;

export type SavedVariant = {
  id: string;
  name: string;
  createdAt: number;
  styleId?: ShaderStyleId;
  config: RainbowConfig;
  effects?: EffectLayer[];
  gradient?: GradientConfig;
  sceneElements?: SceneElement[];
};

export type MainEffectType = "animatedGradient" | "godRays" | "noiseFlow" | "liquidBlur" | "meshGlow" | "holoWave" | "custom";

export type ModifierType = "warp" | "grain" | "bayerDither" | "vignette" | "blur";

export type MainEffectInstance = {
  type: MainEffectType;
  params: Record<string, number | boolean | string | string[]>;
};

export type ModifierInstance = {
  type: ModifierType;
  enabled: boolean;
  params: Record<string, number | boolean | string | string[]>;
};

export type ViewportMode = "hero" | "full" | "transparent" | "card";

export type ExportSettings = {
  pauseOffscreen: boolean;
  reducedMotion: boolean;
  mobileSafeMode: boolean;
};

export type EffectProject = {
  id: string;
  name: string;
  effect: MainEffectInstance;
  modifiers: ModifierInstance[];
  viewport: ViewportMode;
  export: ExportSettings;
};

export type GradientEffectControls = {
  color1: string;
  color2: string;
  color3: string;
  speed: number;
  scale: number;
  flow: number;
  softness: number;
  contrast: number;
  direction: number;
  intensity: number;
  spread: number;
  decay: number;
  opacity: number;
  mouseStrength: number;
  warpStrength: number;
  grainAmount: number;
  ditherAmount: number;
};

export type ModifierToggles = {
  warp: boolean;
  grain: boolean;
  bayerDither: boolean;
};

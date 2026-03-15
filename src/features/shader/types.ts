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

export type ShaderStyleId = "flow" | "plasma" | "aurora" | "crt";

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

export type EffectKind = "wave" | "noise" | "glow" | "drift" | "pulse" | "scanline" | "chromatic" | "vignette";

export type EffectTarget = {
  scope: "scene" | "shader" | "element";
  elementId?: string;
};

export type EffectLayer = {
  id: string;
  name: string;
  kind: EffectKind;
  enabled: boolean;
  intensity: number;
  opacity: number;
  blendMode: "normal" | "screen" | "overlay" | "multiply";
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

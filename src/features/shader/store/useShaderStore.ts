"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { configForStyle, createEffect, createSceneElement, defaultEffects, defaultGradient, normalizeStyleId } from "@/features/shader/presets";
import type {
  EffectKind,
  EffectLayer,
  GradientConfig,
  GradientStop,
  RainbowConfig,
  SavedVariant,
  SceneElement,
  SceneElementKind,
  ShaderStyleId,
} from "@/features/shader/types";

type ShaderStore = {
  styleId: ShaderStyleId;
  config: RainbowConfig;
  effects: EffectLayer[];
  gradient: GradientConfig;
  sceneElements: SceneElement[];
  selectedSceneElementId: string | null;
  savedVariants: SavedVariant[];
  setStyleId: (styleId: ShaderStyleId) => void;
  setConfig: (next: Partial<RainbowConfig>) => void;
  addEffect: (kind: EffectKind) => void;
  patchEffect: (id: string, next: Partial<Omit<EffectLayer, "id" | "kind">>) => void;
  moveEffect: (id: string, direction: "up" | "down") => void;
  removeEffect: (id: string) => void;
  addGradientStop: () => void;
  patchGradientStop: (id: string, next: Partial<GradientStop>) => void;
  removeGradientStop: (id: string) => void;
  setGradientMode: (mode: GradientConfig["mode"]) => void;
  setGradientAngle: (angle: number) => void;
  addSceneElement: (kind: SceneElementKind) => void;
  patchSceneElement: (id: string, next: Record<string, unknown>) => void;
  selectSceneElement: (id: string | null) => void;
  removeSceneElement: (id: string) => void;
  resetConfig: () => void;
  saveVariant: (name: string) => void;
  loadVariant: (id: string) => void;
  deleteVariant: (id: string) => void;
  importConfig: (json: string) => { ok: boolean; message: string };
};

function isValidConfig(value: unknown): value is RainbowConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const stringKeys = ["paletteA", "paletteB", "paletteC"];
  const numberKeys = ["speed", "scale", "noiseAmount", "glow", "grain", "spread", "direction", "opacity", "mouseStrength"];
  return stringKeys.every((k) => typeof v[k] === "string") && numberKeys.every((k) => typeof v[k] === "number");
}

function isValidGradientStop(value: unknown): value is GradientStop {
  if (!value || typeof value !== "object") return false;
  const stop = value as Record<string, unknown>;
  return typeof stop.id === "string" && typeof stop.color === "string" && typeof stop.position === "number";
}

function normalizeGradient(input: unknown): GradientConfig {
  if (!input || typeof input !== "object") return defaultGradient;
  const grad = input as Record<string, unknown>;
  const mode = grad.mode === "radial" ? "radial" : "linear";
  const angle = typeof grad.angle === "number" ? grad.angle : defaultGradient.angle;
  const stops = Array.isArray(grad.stops) ? grad.stops.filter(isValidGradientStop) : [];
  return {
    mode,
    angle,
    stops: stops.length > 1 ? stops.sort((a, b) => a.position - b.position) : defaultGradient.stops,
  };
}

function coerceEffect(value: unknown): EffectLayer | null {
  if (!value || typeof value !== "object") return null;
  const effect = value as Record<string, unknown>;

  const validKind =
    effect.kind === "wave" ||
    effect.kind === "noise" ||
    effect.kind === "glow" ||
    effect.kind === "drift" ||
    effect.kind === "pulse" ||
    effect.kind === "scanline" ||
    effect.kind === "chromatic" ||
    effect.kind === "vignette";

  if (!validKind) return null;

  const id = typeof effect.id === "string" ? effect.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const name = typeof effect.name === "string" ? effect.name : "Effect";
  const kind = effect.kind as EffectKind;
  const enabled = typeof effect.enabled === "boolean" ? effect.enabled : true;
  const intensity = typeof effect.intensity === "number" ? clamp01(effect.intensity) : 0.35;
  const opacity = typeof effect.opacity === "number" ? clamp01(effect.opacity) : 1;
  const blendMode =
    effect.blendMode === "screen" || effect.blendMode === "overlay" || effect.blendMode === "multiply" || effect.blendMode === "normal"
      ? effect.blendMode
      : "normal";

  const targetRaw = effect.target;
  const targetScope =
    targetRaw && typeof targetRaw === "object" && ((targetRaw as Record<string, unknown>).scope === "scene" || (targetRaw as Record<string, unknown>).scope === "shader" || (targetRaw as Record<string, unknown>).scope === "element")
      ? ((targetRaw as Record<string, unknown>).scope as "scene" | "shader" | "element")
      : "scene";
  const elementId =
    targetRaw && typeof targetRaw === "object" && typeof (targetRaw as Record<string, unknown>).elementId === "string"
      ? ((targetRaw as Record<string, unknown>).elementId as string)
      : undefined;

  return {
    id,
    name,
    kind,
    enabled,
    intensity,
    opacity,
    blendMode,
    target: targetScope === "element" ? { scope: "element", elementId } : { scope: targetScope },
  };
}

function normalizeEffects(input: unknown): EffectLayer[] {
  if (!Array.isArray(input)) return defaultEffects;
  const effects = input.map(coerceEffect).filter((item): item is EffectLayer => !!item);
  return effects.length > 0 ? effects : defaultEffects;
}

function isValidSceneElement(value: unknown): value is SceneElement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const hasBase =
    typeof item.id === "string" &&
    typeof item.x === "number" &&
    typeof item.y === "number" &&
    typeof item.width === "number" &&
    typeof item.height === "number" &&
    typeof item.opacity === "number" &&
    typeof item.visible === "boolean";
  if (!hasBase) return false;
  if (item.kind === "text") return typeof item.text === "string" && typeof item.color === "string" && typeof item.fontSize === "number";
  if (item.kind === "image") return typeof item.src === "string" && typeof item.alt === "string" && (item.fit === "cover" || item.fit === "contain");
  if (item.kind === "svg") return typeof item.svgMarkup === "string";
  return false;
}

function normalizeSceneElements(input: unknown): SceneElement[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isValidSceneElement);
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

export const useShaderStore = create<ShaderStore>()(
  persist(
    (set, get) => ({
      styleId: "flow",
      config: configForStyle("flow"),
      effects: defaultEffects,
      gradient: defaultGradient,
      sceneElements: [],
      selectedSceneElementId: null,
      savedVariants: [],
      setStyleId: (styleId) => set({ styleId, config: configForStyle(styleId) }),
      setConfig: (next) => set((state) => ({ config: { ...state.config, ...next } })),
      addEffect: (kind) => set((state) => ({ effects: [...state.effects, createEffect(kind)] })),
      patchEffect: (id, next) =>
        set((state) => ({
          effects: state.effects.map((effect) => (effect.id === id ? { ...effect, ...next } : effect)),
        })),
      moveEffect: (id, direction) =>
        set((state) => {
          const index = state.effects.findIndex((effect) => effect.id === id);
          if (index < 0) return state;
          const target = direction === "up" ? index - 1 : index + 1;
          if (target < 0 || target >= state.effects.length) return state;
          const next = [...state.effects];
          const item = next[index];
          next[index] = next[target];
          next[target] = item;
          return { effects: next };
        }),
      removeEffect: (id) => set((state) => ({ effects: state.effects.filter((effect) => effect.id !== id) })),
      addGradientStop: () =>
        set((state) => ({
          gradient: {
            ...state.gradient,
            stops: [...state.gradient.stops, { id: `${Date.now()}`, color: "#ffffff", position: 0.5 }].sort((a, b) => a.position - b.position),
          },
        })),
      patchGradientStop: (id, next) =>
        set((state) => ({
          gradient: {
            ...state.gradient,
            stops: state.gradient.stops
              .map((stop) =>
                stop.id === id
                  ? {
                      ...stop,
                      ...next,
                      position: typeof next.position === "number" ? clamp01(next.position) : stop.position,
                    }
                  : stop,
              )
              .sort((a, b) => a.position - b.position),
          },
        })),
      removeGradientStop: (id) =>
        set((state) => {
          const nextStops = state.gradient.stops.filter((stop) => stop.id !== id);
          if (nextStops.length < 2) return state;
          return { gradient: { ...state.gradient, stops: nextStops } };
        }),
      setGradientMode: (mode) => set((state) => ({ gradient: { ...state.gradient, mode } })),
      setGradientAngle: (angle) => set((state) => ({ gradient: { ...state.gradient, angle } })),
      addSceneElement: (kind) =>
        set((state) => {
          const next = createSceneElement(kind, state.sceneElements.length);
          return { sceneElements: [...state.sceneElements, next], selectedSceneElementId: next.id };
        }),
      patchSceneElement: (id, next) =>
        set((state) => ({
          sceneElements: state.sceneElements.map((item) => (item.id === id ? ({ ...item, ...next } as SceneElement) : item)),
        })),
      selectSceneElement: (id) => set({ selectedSceneElementId: id }),
      removeSceneElement: (id) =>
        set((state) => ({
          sceneElements: state.sceneElements.filter((item) => item.id !== id),
          selectedSceneElementId: state.selectedSceneElementId === id ? null : state.selectedSceneElementId,
        })),
      resetConfig: () => set({ styleId: "flow", config: configForStyle("flow"), effects: defaultEffects, gradient: defaultGradient, sceneElements: [], selectedSceneElementId: null }),
      saveVariant: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        const record: SavedVariant = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: trimmed,
          createdAt: Date.now(),
          styleId: get().styleId,
          config: get().config,
          effects: get().effects,
          gradient: get().gradient,
          sceneElements: get().sceneElements,
        };
        set((state) => ({ savedVariants: [record, ...state.savedVariants].slice(0, 40) }));
      },
      loadVariant: (id) => {
        const item = get().savedVariants.find((v) => v.id === id);
        if (!item) return;
        set({
          styleId: normalizeStyleId(item.styleId),
          config: item.config,
          effects: normalizeEffects(item.effects),
          gradient: normalizeGradient(item.gradient),
          sceneElements: normalizeSceneElements(item.sceneElements),
          selectedSceneElementId: null,
        });
      },
      deleteVariant: (id) => set((state) => ({ savedVariants: state.savedVariants.filter((v) => v.id !== id) })),
      importConfig: (json) => {
        try {
          const parsed = JSON.parse(json);
          const configCandidate = parsed?.preset ? { ...parsed, preset: undefined } : parsed;
          const normalized = {
            ...configCandidate,
            speed: Number(configCandidate.speed),
            scale: Number(configCandidate.scale),
            noiseAmount: Number(configCandidate.noiseAmount),
            glow: Number(configCandidate.glow),
            grain: Number(configCandidate.grain),
            spread: Number(configCandidate.spread),
            direction: Number(configCandidate.direction),
            opacity: Number(configCandidate.opacity),
            mouseStrength: Number(configCandidate.mouseStrength),
          };
          if (!isValidConfig(normalized)) {
            return { ok: false, message: "JSON is valid but does not match shader config fields." };
          }
          set({
            styleId: normalizeStyleId(parsed?.styleId),
            config: normalized,
            effects: normalizeEffects(parsed?.effects),
            gradient: normalizeGradient(parsed?.gradient),
            sceneElements: normalizeSceneElements(parsed?.sceneElements),
            selectedSceneElementId: null,
          });
          return { ok: true, message: "Config imported." };
        } catch {
          return { ok: false, message: "Unable to parse JSON." };
        }
      },
    }),
    {
      name: "shader-tool-v0",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") return persistedState;
        const state = persistedState as Record<string, unknown>;
        return {
          ...state,
          styleId: normalizeStyleId(state.styleId),
          effects: normalizeEffects(state.effects),
          gradient: normalizeGradient(state.gradient),
          sceneElements: normalizeSceneElements(state.sceneElements),
          savedVariants: Array.isArray(state.savedVariants)
            ? state.savedVariants.map((variant) => {
                if (!variant || typeof variant !== "object") return variant;
                const item = variant as Record<string, unknown>;
                return {
                  ...item,
                  styleId: normalizeStyleId(item.styleId),
                  effects: normalizeEffects(item.effects),
                  gradient: normalizeGradient(item.gradient),
                  sceneElements: normalizeSceneElements(item.sceneElements),
                };
              })
            : [],
        };
      },
      partialize: (state) => ({
        styleId: state.styleId,
        config: state.config,
        effects: state.effects,
        gradient: state.gradient,
        sceneElements: state.sceneElements,
        savedVariants: state.savedVariants,
      }),
    }
  )
);

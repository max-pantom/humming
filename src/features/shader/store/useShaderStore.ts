"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createEffectInstance, effectRegistry } from "@/features/shader/effectRegistry";
import { configForStyle, createSceneElement, defaultEffects, defaultGradient, normalizeStyleId } from "@/features/shader/presets";
import type { EffectLayer, EffectType, GradientConfig, GradientStop, RainbowConfig, SavedVariant, SceneElement, SceneElementKind, ShaderStyleId } from "@/features/shader/types";

type ShaderStore = {
  styleId: ShaderStyleId;
  config: RainbowConfig;
  gradient: GradientConfig;
  effects: EffectLayer[];
  selectedEffectId: string | null;
  sceneElements: SceneElement[];
  selectedSceneElementId: string | null;
  savedVariants: SavedVariant[];
  setStyleId: (styleId: ShaderStyleId) => void;
  setConfig: (next: Partial<RainbowConfig>) => void;
  addEffect: (type: EffectType) => void;
  selectEffect: (id: string | null) => void;
  patchEffect: (id: string, next: Partial<Omit<EffectLayer, "id" | "type" | "params">>) => void;
  patchEffectParam: (id: string, key: string, value: string | number | boolean | string[]) => void;
  moveEffect: (id: string, direction: "up" | "down") => void;
  removeEffect: (id: string) => void;
  addGradientStop: () => void;
  patchGradientStop: (id: string, next: Partial<GradientStop>) => void;
  removeGradientStop: (id: string) => void;
  addSceneElement: (kind: SceneElementKind) => void;
  patchSceneElement: (id: string, next: Record<string, unknown>) => void;
  selectSceneElement: (id: string | null) => void;
  removeSceneElement: (id: string) => void;
  resetConfig: () => void;
  saveVariant: (name: string) => void;
  loadVariant: (id: string) => void;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

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
  return { mode, angle, stops: stops.length > 1 ? stops.sort((a, b) => a.position - b.position) : defaultGradient.stops };
}

const legacyKindMap: Record<string, EffectType> = {
  wave: "warp",
  noise: "grain",
  glow: "godRays",
  drift: "animatedGradient",
  pulse: "vignette",
  scanline: "bayerDither",
  chromatic: "blur",
  vignette: "vignette",
};

function coerceEffect(input: unknown, index: number): EffectLayer | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  const typeRaw = typeof raw.type === "string" ? raw.type : typeof raw.kind === "string" ? legacyKindMap[raw.kind] : undefined;
  if (!typeRaw || !(typeRaw in effectRegistry)) return null;
  const type = typeRaw as EffectType;
  const base = createEffectInstance(type, index);

  return {
    ...base,
    id: typeof raw.id === "string" ? raw.id : base.id,
    label: typeof raw.label === "string" ? raw.label : typeof raw.name === "string" ? raw.name : base.label,
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : base.enabled,
    order: typeof raw.order === "number" ? raw.order : index,
    intensity: typeof raw.intensity === "number" ? clamp01(raw.intensity) : base.intensity,
    opacity: typeof raw.opacity === "number" ? clamp01(raw.opacity) : base.opacity,
    blendMode:
      raw.blendMode === "add" ||
      raw.blendMode === "screen" ||
      raw.blendMode === "multiply" ||
      raw.blendMode === "overlay" ||
      raw.blendMode === "softLight" ||
      raw.blendMode === "normal"
        ? raw.blendMode
        : base.blendMode,
    quality: raw.quality === "low" || raw.quality === "medium" || raw.quality === "high" ? raw.quality : base.quality,
    target: raw.target && typeof raw.target === "object" && (raw.target as Record<string, unknown>).scope === "shader" ? { scope: "shader" } : { scope: "scene" },
    params: raw.params && typeof raw.params === "object" ? { ...base.params, ...(raw.params as Record<string, number | boolean | string | string[]>) } : base.params,
  };
}

function normalizeEffects(input: unknown): EffectLayer[] {
  if (!Array.isArray(input)) return defaultEffects;
  const normalized = input.map((item, index) => coerceEffect(item, index)).filter((item): item is EffectLayer => !!item);
  return normalized.length > 0 ? normalized.sort((a, b) => a.order - b.order).map((item, index) => ({ ...item, order: index })) : defaultEffects;
}

function isValidSceneElement(value: unknown): value is SceneElement {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  const hasBase = typeof item.id === "string" && typeof item.x === "number" && typeof item.y === "number" && typeof item.width === "number" && typeof item.height === "number";
  return hasBase;
}

function normalizeSceneElements(input: unknown): SceneElement[] {
  if (!Array.isArray(input)) return [];
  return input.filter(isValidSceneElement);
}

export const useShaderStore = create<ShaderStore>()(
  persist(
    (set, get) => ({
      styleId: "flow",
      config: configForStyle("flow"),
      gradient: defaultGradient,
      effects: defaultEffects,
      selectedEffectId: defaultEffects[0]?.id ?? null,
      sceneElements: [],
      selectedSceneElementId: null,
      savedVariants: [],

      setStyleId: (styleId) => set({ styleId, config: configForStyle(styleId) }),
      setConfig: (next) => set((state) => ({ config: { ...state.config, ...next } })),

      addEffect: (type) =>
        set((state) => {
          const next = createEffectInstance(type, state.effects.length);
          return { effects: [...state.effects, next], selectedEffectId: next.id };
        }),
      selectEffect: (id) => set({ selectedEffectId: id }),
      patchEffect: (id, next) => set((state) => ({ effects: state.effects.map((effect) => (effect.id === id ? { ...effect, ...next } : effect)) })),
      patchEffectParam: (id, key, value) =>
        set((state) => ({
          effects: state.effects.map((effect) => (effect.id === id ? { ...effect, params: { ...effect.params, [key]: value } } : effect)),
        })),
      moveEffect: (id, direction) =>
        set((state) => {
          const index = state.effects.findIndex((effect) => effect.id === id);
          if (index < 0) return state;
          const target = direction === "up" ? index - 1 : index + 1;
          if (target < 0 || target >= state.effects.length) return state;
          const next = [...state.effects];
          const tmp = next[index];
          next[index] = next[target];
          next[target] = tmp;
          return { effects: next.map((item, i) => ({ ...item, order: i })) };
        }),
      removeEffect: (id) =>
        set((state) => {
          const next = state.effects.filter((effect) => effect.id !== id).map((item, index) => ({ ...item, order: index }));
          return { effects: next, selectedEffectId: state.selectedEffectId === id ? next[0]?.id ?? null : state.selectedEffectId };
        }),

      addGradientStop: () =>
        set((state) => ({
          gradient: { ...state.gradient, stops: [...state.gradient.stops, { id: `${Date.now()}`, color: "#ffffff", position: 0.5 }] },
        })),
      patchGradientStop: (id, next) =>
        set((state) => ({
          gradient: {
            ...state.gradient,
            stops: state.gradient.stops.map((stop) => (stop.id === id ? { ...stop, ...next, position: typeof next.position === "number" ? clamp01(next.position) : stop.position } : stop)),
          },
        })),
      removeGradientStop: (id) =>
        set((state) => {
          const nextStops = state.gradient.stops.filter((stop) => stop.id !== id);
          if (nextStops.length < 2) return state;
          return { gradient: { ...state.gradient, stops: nextStops } };
        }),

      addSceneElement: (kind) =>
        set((state) => {
          const next = createSceneElement(kind, state.sceneElements.length);
          return { sceneElements: [...state.sceneElements, next], selectedSceneElementId: next.id };
        }),
      patchSceneElement: (id, next) => set((state) => ({ sceneElements: state.sceneElements.map((item) => (item.id === id ? ({ ...item, ...next } as SceneElement) : item)) })),
      selectSceneElement: (id) => set({ selectedSceneElementId: id }),
      removeSceneElement: (id) => set((state) => ({ sceneElements: state.sceneElements.filter((item) => item.id !== id), selectedSceneElementId: state.selectedSceneElementId === id ? null : state.selectedSceneElementId })),

      resetConfig: () => set({ styleId: "flow", config: configForStyle("flow"), gradient: defaultGradient, effects: defaultEffects, selectedEffectId: defaultEffects[0]?.id ?? null, sceneElements: [], selectedSceneElementId: null }),

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
        const item = get().savedVariants.find((variant) => variant.id === id);
        if (!item) return;
        const effects = normalizeEffects(item.effects);
        set({
          styleId: normalizeStyleId(item.styleId),
          config: isValidConfig(item.config) ? item.config : configForStyle("flow"),
          gradient: normalizeGradient(item.gradient),
          effects,
          selectedEffectId: effects[0]?.id ?? null,
          sceneElements: normalizeSceneElements(item.sceneElements),
          selectedSceneElementId: null,
        });
      },
    }),
    {
      name: "shader-tool-v0",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") return persistedState;
        const state = persistedState as Record<string, unknown>;
        const effects = normalizeEffects(state.effects);
        return {
          ...state,
          styleId: normalizeStyleId(state.styleId),
          config: isValidConfig(state.config) ? state.config : configForStyle("flow"),
          gradient: normalizeGradient(state.gradient),
          effects,
          selectedEffectId: typeof state.selectedEffectId === "string" ? state.selectedEffectId : effects[0]?.id ?? null,
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
        gradient: state.gradient,
        effects: state.effects,
        selectedEffectId: state.selectedEffectId,
        sceneElements: state.sceneElements,
        savedVariants: state.savedVariants,
      }),
    }
  )
);

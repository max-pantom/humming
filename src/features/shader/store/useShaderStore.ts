"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ExportSettings, GradientEffectControls, MainEffectType, ModifierToggles, ViewportMode } from "@/features/shader/types";

const DEFAULT_CUSTOM_FRAGMENT = `precision highp float;

varying vec2 v_uv;

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

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  float t = u_time * (0.6 + u_speed);
  float wave = sin((p.x + p.y * 0.7) * (8.0 + u_scale * 2.0) + t * 1.8);
  float radial = smoothstep(1.2, 0.1, length(p));

  vec3 color = mix(u_colorA, u_colorB, wave * 0.5 + 0.5);
  color = mix(color, u_colorC, radial * 0.6);

  float noise = (hash(gl_FragCoord.xy + t * 25.0) - 0.5) * u_grain;
  color += noise;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), u_opacity);
}`;

type SavedConfig = {
  id: string;
  name: string;
  createdAt: number;
  effectType: MainEffectType;
  controls: GradientEffectControls;
  modifiers: ModifierToggles;
  viewport: ViewportMode;
  customFragmentSource: string;
  exportSettings: ExportSettings;
};

type Store = {
  projectName: string;
  effectType: MainEffectType;
  controls: GradientEffectControls;
  modifiers: ModifierToggles;
  viewport: ViewportMode;
  customFragmentSource: string;
  exportSettings: ExportSettings;
  saved: SavedConfig[];
  setProjectName: (name: string) => void;
  setEffectType: (effectType: MainEffectType) => void;
  patchControls: (next: Partial<GradientEffectControls>) => void;
  toggleModifier: (key: keyof ModifierToggles, enabled: boolean) => void;
  setViewport: (mode: ViewportMode) => void;
  setCustomFragmentSource: (source: string) => void;
  patchExportSettings: (next: Partial<ExportSettings>) => void;
  saveCurrent: (name?: string) => void;
  loadSaved: (id: string) => void;
  reset: () => void;
};

const defaults = {
  projectName: "Untitled Web Surface",
  effectType: "animatedGradient" as MainEffectType,
  controls: {
    color1: "#6d5ef4",
    color2: "#ff4ecd",
    color3: "#4de2c5",
    speed: 0.4,
    scale: 2,
    warpStrength: 0.12,
    grainAmount: 0.04,
    ditherAmount: 0.06,
  } satisfies GradientEffectControls,
  modifiers: {
    warp: true,
    grain: true,
    bayerDither: false,
  } satisfies ModifierToggles,
  viewport: "hero" as ViewportMode,
  customFragmentSource: DEFAULT_CUSTOM_FRAGMENT,
  exportSettings: {
    pauseOffscreen: true,
    reducedMotion: true,
    mobileSafeMode: true,
  } satisfies ExportSettings,
};

export const useShaderStore = create<Store>()(
  persist(
    (set, get) => ({
      ...defaults,
      saved: [],
      setProjectName: (name) => set({ projectName: name }),
      setEffectType: (effectType) => set({ effectType }),
      patchControls: (next) => set((state) => ({ controls: { ...state.controls, ...next } })),
      toggleModifier: (key, enabled) => set((state) => ({ modifiers: { ...state.modifiers, [key]: enabled } })),
      setViewport: (mode) => set({ viewport: mode }),
      setCustomFragmentSource: (source) => set({ customFragmentSource: source }),
      patchExportSettings: (next) => set((state) => ({ exportSettings: { ...state.exportSettings, ...next } })),
      saveCurrent: (name) => {
        const label = name?.trim() || get().projectName;
        const item: SavedConfig = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: label,
          createdAt: Date.now(),
          effectType: get().effectType,
          controls: get().controls,
          modifiers: get().modifiers,
          viewport: get().viewport,
          customFragmentSource: get().customFragmentSource,
          exportSettings: get().exportSettings,
        };
        set((state) => ({ saved: [item, ...state.saved].slice(0, 30) }));
      },
      loadSaved: (id) => {
        const item = get().saved.find((entry) => entry.id === id);
        if (!item) return;
        set({
          projectName: item.name,
          effectType: item.effectType,
          controls: item.controls,
          modifiers: item.modifiers,
          viewport: item.viewport,
          customFragmentSource: item.customFragmentSource || DEFAULT_CUSTOM_FRAGMENT,
          exportSettings: item.exportSettings,
        });
      },
      reset: () => set({ ...defaults }),
    }),
    {
      name: "web-surface-editor-v2",
      storage: createJSONStorage(() => localStorage),
      migrate: (persistedState) => {
        if (!persistedState || typeof persistedState !== "object") return persistedState;
        const state = persistedState as Record<string, unknown>;
        const effectType =
          state.effectType === "animatedGradient" || state.effectType === "godRays" || state.effectType === "noiseFlow" || state.effectType === "liquidBlur" || state.effectType === "meshGlow" || state.effectType === "holoWave" || state.effectType === "custom"
            ? state.effectType
            : "animatedGradient";
        return {
          ...state,
          effectType,
          customFragmentSource: typeof state.customFragmentSource === "string" ? state.customFragmentSource : DEFAULT_CUSTOM_FRAGMENT,
        };
      },
      partialize: (state) => ({
        projectName: state.projectName,
        effectType: state.effectType,
        controls: state.controls,
        modifiers: state.modifiers,
        viewport: state.viewport,
        customFragmentSource: state.customFragmentSource,
        exportSettings: state.exportSettings,
        saved: state.saved,
      }),
    },
  ),
);

"use client";

import { useState } from "react";
import type { EffectKind, EffectLayer } from "@/features/shader/types";
import { cn } from "@/lib/utils";

type Props = {
  effects: EffectLayer[];
  selectedElementId: string | null;
  onAdd: (kind: EffectKind) => void;
  onPatch: (id: string, next: Partial<Omit<EffectLayer, "id" | "kind">>) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
};

const effectKinds: EffectKind[] = ["wave", "noise", "glow", "drift", "pulse", "scanline", "chromatic", "vignette"];

const effectLabels: Record<EffectKind, string> = {
  wave: "Wave Warp",
  noise: "Noise Drift",
  glow: "Glow Boost",
  drift: "Directional Drift",
  pulse: "Opacity Pulse",
  scanline: "Scanline",
  chromatic: "Chromatic",
  vignette: "Vignette",
};

export function EffectsPanel({ effects, selectedElementId, onAdd, onPatch, onMove, onRemove }: Props) {
  const [newEffect, setNewEffect] = useState<EffectKind>("wave");

  return (
    <section className="grid gap-3 rounded-xl border border-white/10 bg-panel/90 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-medium">Effect Layers</h2>
          <p className="text-xs text-white/55">Stack effects and target scene, shader, or selected element.</p>
        </div>
        <div className="flex items-center gap-1">
          <select
            value={newEffect}
            onChange={(event) => setNewEffect(event.target.value as EffectKind)}
            className="rounded-md border border-white/15 bg-black/20 px-2 py-1.5 text-xs"
          >
            {effectKinds.map((kind) => (
              <option key={kind} value={kind}>
                {effectLabels[kind]}
              </option>
            ))}
          </select>
          <button onClick={() => onAdd(newEffect)} className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 text-xs hover:bg-white/10">
            Add
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        {effects.length === 0 ? <p className="rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-white/60">No effect layers yet.</p> : null}

        {effects.map((effect, index) => (
          (() => {
            const intensity = typeof effect.intensity === "number" ? effect.intensity : 0.35;
            const opacity = typeof effect.opacity === "number" ? effect.opacity : 1;
            const target = effect.target ?? { scope: "scene" as const };

            return (
          <article key={effect.id} className="grid gap-2 rounded-lg border border-white/10 bg-panelSoft/60 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <input checked={effect.enabled} onChange={(event) => onPatch(effect.id, { enabled: event.target.checked })} type="checkbox" className="size-4" />
                <span className="text-xs text-white/90">{effect.name}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onMove(effect.id, "up")}
                  disabled={index === 0}
                  className={cn("rounded-md border border-white/15 px-2 py-1 text-xs", index === 0 ? "cursor-not-allowed text-white/30" : "text-white/80 hover:bg-white/10")}
                >
                  Up
                </button>
                <button
                  onClick={() => onMove(effect.id, "down")}
                  disabled={index === effects.length - 1}
                  className={cn(
                    "rounded-md border border-white/15 px-2 py-1 text-xs",
                    index === effects.length - 1 ? "cursor-not-allowed text-white/30" : "text-white/80 hover:bg-white/10",
                  )}
                >
                  Down
                </button>
                <button onClick={() => onRemove(effect.id)} className="rounded-md border border-white/15 px-2 py-1 text-xs text-white/80 hover:bg-white/10">
                  Remove
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-white/70">
                <span>Intensity {intensity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={intensity}
                  onChange={(event) => onPatch(effect.id, { intensity: Number.parseFloat(event.target.value) })}
                />
              </label>
              <label className="grid gap-1 text-xs text-white/70">
                <span>Opacity {opacity.toFixed(2)}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={opacity}
                  onChange={(event) => onPatch(effect.id, { opacity: Number.parseFloat(event.target.value) })}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="grid gap-1 text-xs text-white/70">
                <span>Blend</span>
                <select
                  value={effect.blendMode}
                  onChange={(event) => onPatch(effect.id, { blendMode: event.target.value as EffectLayer["blendMode"] })}
                  className="rounded-md border border-white/15 bg-black/20 px-2 py-1.5 text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="screen">Screen</option>
                  <option value="overlay">Overlay</option>
                  <option value="multiply">Multiply</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs text-white/70">
                <span>Target</span>
                <select
                  value={target.scope}
                  onChange={(event) => {
                    const scope = event.target.value as EffectLayer["target"]["scope"];
                    if (scope === "element") {
                      onPatch(effect.id, { target: { scope: "element", elementId: selectedElementId ?? undefined } });
                      return;
                    }
                    onPatch(effect.id, { target: { scope } });
                  }}
                  className="rounded-md border border-white/15 bg-black/20 px-2 py-1.5 text-xs"
                >
                  <option value="scene">Scene</option>
                  <option value="shader">Shader</option>
                  <option value="element">Selected Element</option>
                </select>
              </label>
            </div>
            {target.scope === "element" && !target.elementId ? <p className="text-xs text-amber-300">Select an element first to bind this layer.</p> : null}
          </article>
            );
          })()
        ))}
      </div>
    </section>
  );
}

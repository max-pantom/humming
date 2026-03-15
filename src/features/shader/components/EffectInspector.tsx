"use client";

import { effectRegistry } from "@/features/shader/effectRegistry";
import type { EffectLayer } from "@/features/shader/types";

type Props = {
  effect: EffectLayer | null;
  onPatch: (id: string, next: Partial<Omit<EffectLayer, "id" | "type" | "params">>) => void;
  onPatchParam: (id: string, key: string, value: string | number | boolean | string[]) => void;
};

export function EffectInspector({ effect, onPatch, onPatchParam }: Props) {
  if (!effect) {
    return (
      <section className="grid gap-2 rounded-md border border-white/10 bg-panel/90 p-3">
        <h3 className="text-sm font-medium">Inspector</h3>
        <p className="text-xs text-white/55">Select an effect layer to edit controls.</p>
      </section>
    );
  }

  const definition = effectRegistry[effect.type];

  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-panel/90 p-3">
      <div>
        <h3 className="text-sm font-medium">{effect.label}</h3>
        <p className="text-xs text-white/55">{definition.category} effect</p>
      </div>

      <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-2">
        <label className="grid gap-1 text-xs text-white/70">
          <span>Opacity {effect.opacity.toFixed(2)}</span>
          <input type="range" min={0} max={1} step={0.01} value={effect.opacity} onChange={(event) => onPatch(effect.id, { opacity: Number.parseFloat(event.target.value) })} />
        </label>
        <label className="grid gap-1 text-xs text-white/70">
          <span>Influence {effect.intensity.toFixed(2)}</span>
          <input type="range" min={0} max={1} step={0.01} value={effect.intensity} onChange={(event) => onPatch(effect.id, { intensity: Number.parseFloat(event.target.value) })} />
        </label>
        <label className="grid gap-1 text-xs text-white/70">
          <span>Blend</span>
          <select value={effect.blendMode} onChange={(event) => onPatch(effect.id, { blendMode: event.target.value as EffectLayer["blendMode"] })} className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5">
            <option value="normal">Normal</option>
            <option value="add">Add</option>
            <option value="screen">Screen</option>
            <option value="multiply">Multiply</option>
            <option value="overlay">Overlay</option>
            <option value="softLight">Soft Light</option>
          </select>
        </label>
        <label className="grid gap-1 text-xs text-white/70">
          <span>Quality</span>
          <select value={effect.quality} onChange={(event) => onPatch(effect.id, { quality: event.target.value as EffectLayer["quality"] })} className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>
      </div>

      <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-2">
        <p className="text-xs uppercase text-white/45">Effect controls</p>
        {definition.controls.map((control) => {
          const value = effect.params[control.id];

          if (control.kind === "toggle") {
            return (
              <label key={control.id} className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={Boolean(value)} onChange={(event) => onPatchParam(effect.id, control.id, event.target.checked)} />
                {control.label}
              </label>
            );
          }

          if (control.kind === "select") {
            return (
              <label key={control.id} className="grid gap-1 text-xs text-white/70">
                <span>{control.label}</span>
                <select value={String(value ?? "")} onChange={(event) => onPatchParam(effect.id, control.id, event.target.value)} className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5">
                  {(control.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            );
          }

          return (
            <label key={control.id} className="grid gap-1 text-xs text-white/70">
              <span>
                {control.label} {typeof value === "number" ? value.toFixed(2) : String(value ?? "")}
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step ?? 0.01}
                value={typeof value === "number" ? value : Number(control.min ?? 0)}
                onChange={(event) => onPatchParam(effect.id, control.id, Number.parseFloat(event.target.value))}
              />
            </label>
          );
        })}
      </div>
    </section>
  );
}

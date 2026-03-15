"use client";

import { effectRegistry, effectTypesByCategory } from "@/features/shader/effectRegistry";
import type { EffectLayer, EffectType } from "@/features/shader/types";
import { cn } from "@/lib/utils";

type Props = {
  effects: EffectLayer[];
  selectedEffectId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (type: EffectType) => void;
  onPatch: (id: string, next: Partial<Omit<EffectLayer, "id" | "type" | "params">>) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onRemove: (id: string) => void;
};

export function EffectsPanel({ effects, selectedEffectId, onSelect, onAdd, onPatch, onMove, onRemove }: Props) {
  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-panel/90 p-3">
      <div>
        <h3 className="text-sm font-medium">Scene Effects</h3>
        <p className="text-xs text-white/55">Add blocks and reorder the stack.</p>
      </div>

      <div className="grid gap-2">
        {(Object.keys(effectTypesByCategory) as Array<keyof typeof effectTypesByCategory>).map((category) => (
          <div key={category} className="grid gap-1">
            <p className="text-[11px] uppercase text-white/45">{category}</p>
            <div className="flex flex-wrap gap-1">
              {effectTypesByCategory[category].map((type) => (
                <button key={type} onClick={() => onAdd(type)} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
                  + {effectRegistry[type].label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-2">
        {effects.map((effect, index) => (
          <article
            key={effect.id}
            className={cn(
              "grid gap-2 rounded-md border p-2",
              selectedEffectId === effect.id ? "border-white/30 bg-white/10" : "border-white/10 bg-black/20",
            )}
          >
            <button onClick={() => onSelect(effect.id)} className="flex items-center justify-between text-left">
              <span className="text-xs text-white/90">{effect.label}</span>
              <span className="text-[11px] text-white/50">{effect.gpuCost}</span>
            </button>

            <div className="flex items-center gap-1">
              <input type="checkbox" checked={effect.enabled} onChange={(event) => onPatch(effect.id, { enabled: event.target.checked })} className="size-4" />
              <span className="text-[11px] text-white/60">Enabled</span>
              <button onClick={() => onMove(effect.id, "up")} disabled={index === 0} className="ml-auto rounded-md border border-white/15 px-2 py-0.5 text-[11px] disabled:opacity-40">
                Up
              </button>
              <button onClick={() => onMove(effect.id, "down")} disabled={index === effects.length - 1} className="rounded-md border border-white/15 px-2 py-0.5 text-[11px] disabled:opacity-40">
                Down
              </button>
              <button onClick={() => onRemove(effect.id)} className="rounded-md border border-white/15 px-2 py-0.5 text-[11px]">
                Remove
              </button>
            </div>
          </article>
        ))}

        {effects.length === 0 ? <p className="text-xs text-white/55">No effects yet. Add an Animated Gradient to start.</p> : null}
      </div>
    </section>
  );
}

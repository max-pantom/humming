"use client";

import type { EffectLayer, RainbowConfig } from "@/features/shader/types";

type Props = {
  config: RainbowConfig;
  effects: EffectLayer[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PerformancePanel({ config, effects }: Props) {
  const activeEffects = effects.filter((effect) => effect.enabled).length;
  const interactionWeight = config.mouseStrength * 30 + config.speed * 12;
  const shaderWeight = config.noiseAmount * 24 + config.glow * 10 + config.grain * 120 + config.scale * 4;
  const effectWeight = activeEffects * 8;
  const gpuCost = clamp(Math.round(shaderWeight + interactionWeight + effectWeight), 8, 99);

  const frameStability = gpuCost < 35 ? "Stable" : gpuCost < 58 ? "Monitor" : "Risky";
  const mobileSafety = gpuCost < 38 ? "Safe" : gpuCost < 55 ? "Use balanced mode" : "Needs simplified mode";
  const heroSafety = gpuCost < 52 ? "Hero-safe" : "Small-area recommended";

  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-panel/90 p-4">
      <div>
        <h3 className="text-sm font-medium">Performance Guardrails</h3>
        <p className="text-xs text-white/55">Use these checks before exporting to production.</p>
      </div>

      <div className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-white/70">Estimated GPU cost</span>
          <span className="tabular-nums text-white">{gpuCost}/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white/70" style={{ width: `${gpuCost}%` }} />
        </div>
      </div>

      <div className="grid gap-2 text-xs">
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <span className="text-white/65">Frame stability</span>
          <span className="text-white/90">{frameStability}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <span className="text-white/65">Mobile safety</span>
          <span className="text-white/90">{mobileSafety}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <span className="text-white/65">Surface fit</span>
          <span className="text-white/90">{heroSafety}</span>
        </div>
      </div>
    </section>
  );
}

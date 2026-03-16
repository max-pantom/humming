"use client";

import type { ExportSettings, GradientEffectControls, ModifierToggles } from "@/features/shader/types";

type Props = {
  controls: GradientEffectControls;
  modifiers: ModifierToggles;
  exportSettings: ExportSettings;
  onPatchExport: (next: Partial<ExportSettings>) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function PerformancePanel({ controls, modifiers, exportSettings, onPatchExport }: Props) {
  const effectCost = 18 + controls.scale * 6 + controls.speed * 10 + controls.softness * 6 + controls.contrast * 5;
  const modifierCost = (modifiers.warp ? controls.warpStrength * 50 : 0) + (modifiers.grain ? controls.grainAmount * 220 : 0) + (modifiers.bayerDither ? controls.ditherAmount * 180 : 0);
  const safetyAdjust = (exportSettings.mobileSafeMode ? -8 : 0) + (exportSettings.pauseOffscreen ? -4 : 0);
  const gpuCost = clamp(Math.round(effectCost + modifierCost + safetyAdjust), 6, 98);

  const frame = gpuCost < 35 ? "Stable" : gpuCost < 56 ? "Monitor" : "Heavy";
  const mobile = gpuCost < 42 ? "Safe" : gpuCost < 58 ? "Balanced" : "Simplify for mobile";
  const fit = gpuCost < 50 ? "Hero-safe" : "Use for section/card";

  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-panel/90 p-4">
      <div>
        <h3 className="text-sm font-medium">Performance</h3>
        <p className="text-xs text-white/55">Check this before deployment.</p>
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
          <span>{frame}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <span className="text-white/65">Mobile safety</span>
          <span>{mobile}</span>
        </div>
        <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <span className="text-white/65">Best use</span>
          <span>{fit}</span>
        </div>
      </div>

      <div className="grid gap-2 text-xs">
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <input type="checkbox" checked={exportSettings.pauseOffscreen} onChange={(event) => onPatchExport({ pauseOffscreen: event.target.checked })} />
          Pause offscreen
        </label>
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <input type="checkbox" checked={exportSettings.reducedMotion} onChange={(event) => onPatchExport({ reducedMotion: event.target.checked })} />
          Reduced motion fallback
        </label>
        <label className="flex items-center gap-2 rounded-md border border-white/10 bg-black/20 px-2 py-2">
          <input type="checkbox" checked={exportSettings.mobileSafeMode} onChange={(event) => onPatchExport({ mobileSafeMode: event.target.checked })} />
          Mobile safe mode
        </label>
      </div>
    </section>
  );
}

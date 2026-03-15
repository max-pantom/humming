"use client";

import type { GradientConfig, RainbowConfig } from "@/features/shader/types";

type Props = {
  config: RainbowConfig;
  gradient: GradientConfig;
  onPatch: (next: Partial<RainbowConfig>) => void;
  onAddGradientStop: () => void;
  onPatchGradientStop: (id: string, next: { color?: string }) => void;
  onRemoveGradientStop: (id: string) => void;
  onReset: () => void;
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
};

function SliderRow({ label, value, min, max, step = 0.01, onChange }: SliderProps) {
  return (
    <label className="grid gap-2">
      <span className="flex items-center justify-between text-xs text-white/70">
        <span>{label}</span>
        <code className="text-white/45">{value.toFixed(2)}</code>
      </span>
      <input
        className="w-full accent-white"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number.parseFloat(event.target.value))}
      />
    </label>
  );
}

export function ControlPanel({
  config,
  gradient,
  onPatch,
  onAddGradientStop,
  onPatchGradientStop,
  onRemoveGradientStop,
  onReset,
}: Props) {
  return (
    <aside className="grid gap-4 rounded-xl border border-white/10 bg-panel/90 p-4">
      <div>
        <h2 className="text-lg font-medium">Controls</h2>
        <p className="text-sm text-white/55">Curated ranges for clean visual output.</p>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-panelSoft/70 p-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm text-white/80">Scene Colors</h3>
          <button onClick={onAddGradientStop} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
            Add color
          </button>
        </div>

        <div className="grid gap-2">
          {gradient.stops.map((stop, index) => (
            <div key={stop.id} className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-2">
              <input type="color" value={stop.color} onChange={(event) => onPatchGradientStop(stop.id, { color: event.target.value })} className="h-8 w-14" />
              <p className="text-xs text-white/65">Color {index + 1}</p>
              <button onClick={() => onRemoveGradientStop(stop.id)} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10">
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-panelSoft/70 p-3">
        <h3 className="text-sm text-white/80">Motion</h3>
        <SliderRow label="Speed" value={config.speed} min={0} max={1.4} onChange={(value) => onPatch({ speed: value })} />
        <SliderRow label="Scale" value={config.scale} min={0.6} max={4.5} onChange={(value) => onPatch({ scale: value })} />
        <SliderRow label="Direction" value={config.direction} min={-3.14} max={3.14} onChange={(value) => onPatch({ direction: value })} />
        <SliderRow label="Spread" value={config.spread} min={0.1} max={1} onChange={(value) => onPatch({ spread: value })} />
      </div>

      <div className="grid gap-3 rounded-lg border border-white/10 bg-panelSoft/70 p-3">
        <h3 className="text-sm text-white/80">Look</h3>
        <SliderRow label="Noise" value={config.noiseAmount} min={0} max={1.2} onChange={(value) => onPatch({ noiseAmount: value })} />
        <SliderRow label="Glow" value={config.glow} min={0} max={2} onChange={(value) => onPatch({ glow: value })} />
        <SliderRow label="Grain" value={config.grain} min={0} max={0.14} step={0.005} onChange={(value) => onPatch({ grain: value })} />
        <SliderRow label="Opacity" value={config.opacity} min={0.1} max={1} onChange={(value) => onPatch({ opacity: value })} />
        <SliderRow label="Mouse Strength" value={config.mouseStrength} min={0} max={1} onChange={(value) => onPatch({ mouseStrength: value })} />
      </div>

      <button onClick={onReset} className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
        Reset Scene
      </button>
    </aside>
  );
}

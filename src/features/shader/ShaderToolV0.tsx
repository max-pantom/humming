"use client";

import { useState } from "react";
import { ExportPanel } from "@/features/shader/components/ExportPanel";
import { PerformancePanel } from "@/features/shader/components/PerformancePanel";
import { ShaderCanvas } from "@/features/shader/components/ShaderCanvas";
import { AURORA_FRAGMENT_SHADER, CRT_FRAGMENT_SHADER, FLOW_FRAGMENT_SHADER, HOLO_FRAGMENT_SHADER, MESH_FRAGMENT_SHADER, PLASMA_FRAGMENT_SHADER } from "@/features/shader/shaderStyles";
import { useShaderStore } from "@/features/shader/store/useShaderStore";
import type { MainEffectType } from "@/features/shader/types";
import { cn } from "@/lib/utils";

const effectOptions: Array<{ type: MainEffectType; label: string; hint: string }> = [
  { type: "animatedGradient", label: "Gradient Dither", hint: "Default" },
  { type: "godRays", label: "Godray Wash", hint: "Light" },
  { type: "noiseFlow", label: "Noise Flow", hint: "Texture" },
  { type: "liquidBlur", label: "Liquid Blur", hint: "Soft" },
  { type: "meshGlow", label: "Mesh Glow", hint: "Grid" },
  { type: "holoWave", label: "Holo Wave", hint: "Iridescent" },
  { type: "custom", label: "Custom GLSL", hint: "Editor" },
];

export default function ShaderToolV0() {
  const {
    projectName,
    effectType,
    controls,
    modifiers,
    viewport,
    customFragmentSource,
    exportSettings,
    saved,
    setProjectName,
    setEffectType,
    patchControls,
    toggleModifier,
    setViewport,
    setCustomFragmentSource,
    patchExportSettings,
    saveCurrent,
    loadSaved,
    reset,
  } = useShaderStore();
  const [shaderError, setShaderError] = useState<string | null>(null);

  const flow = typeof controls.flow === "number" ? controls.flow : 0.5;
  const softness = typeof controls.softness === "number" ? controls.softness : 0.8;
  const contrast = typeof controls.contrast === "number" ? controls.contrast : 0.15;
  const direction = typeof controls.direction === "number" ? controls.direction : 0;
  const intensity = typeof controls.intensity === "number" ? controls.intensity : 0.45;
  const spread = typeof controls.spread === "number" ? controls.spread : 0.6;
  const decay = typeof controls.decay === "number" ? controls.decay : 0.92;
  const opacity = typeof controls.opacity === "number" ? controls.opacity : 1;
  const mouseStrength = typeof controls.mouseStrength === "number" ? controls.mouseStrength : 0.12;

  const takeSnapshot = () => {
    const canvas = document.getElementById("web-surface-canvas") as HTMLCanvasElement | null;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `web-surface-${Date.now()}.png`;
    a.click();
  };

  return (
    <main className="h-dvh w-full overflow-hidden bg-[#090a0d] p-2">
      <section className="relative grid h-full min-h-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="relative min-h-0 overflow-hidden rounded-md border border-white/10 bg-black/20 p-2">
          <div className="pointer-events-auto absolute right-4 top-4 z-20 flex items-center gap-1 rounded-md border border-white/10 bg-black/45 p-1.5 backdrop-blur-sm">
            <button onClick={() => saveCurrent()} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10">
              Share
            </button>
            <button onClick={takeSnapshot} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10">
              Snapshot
            </button>
            <button onClick={reset} className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] hover:bg-white/10">
              Reset
            </button>
          </div>

          <div className="pointer-events-auto absolute left-4 top-4 z-20 flex items-center gap-1 rounded-md border border-white/10 bg-black/45 p-1.5 backdrop-blur-sm">
            {([
              { id: "hero", label: "Hero" },
              { id: "full", label: "Full" },
              { id: "transparent", label: "Transparent" },
              { id: "card", label: "Card" },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setViewport(item.id)}
                className={cn("rounded-md border px-2 py-1 text-[11px]", viewport === item.id ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="h-full w-full pt-12">
            <ShaderCanvas effectType={effectType} controls={controls} modifiers={modifiers} viewport={viewport} customFragmentSource={customFragmentSource} onShaderError={setShaderError} />
          </div>
        </div>

        <aside className="grid min-h-0 gap-2 overflow-auto rounded-md border border-white/10 bg-black/30 p-2">
          <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
            <p className="text-[11px] text-white/55">Project</p>
            <input
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              className="w-full rounded-md border border-white/15 bg-white/5 px-2 py-1 text-sm"
            />

            <label className="grid gap-1 text-xs text-white/65">
              <span>Effect</span>
              <select value={effectType} onChange={(event) => setEffectType(event.target.value as MainEffectType)} className="rounded-md border border-white/15 bg-black/30 px-2 py-1.5 text-xs">
                {effectOptions.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.label} - {item.hint}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/70">Wave</p>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Speed {controls.speed.toFixed(2)}</span>
              <input type="range" min={0} max={1.2} step={0.01} value={controls.speed} onChange={(event) => patchControls({ speed: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Scale {controls.scale.toFixed(2)}</span>
              <input type="range" min={0.5} max={3.5} step={0.01} value={controls.scale} onChange={(event) => patchControls({ scale: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Flow {flow.toFixed(2)}</span>
              <input type="range" min={0} max={1} step={0.01} value={flow} onChange={(event) => patchControls({ flow: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Direction {direction.toFixed(2)}</span>
              <input type="range" min={-3.14} max={3.14} step={0.01} value={direction} onChange={(event) => patchControls({ direction: Number.parseFloat(event.target.value) })} />
            </label>
          </section>

          <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/70">Look</p>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Softness {softness.toFixed(2)}</span>
              <input type="range" min={0} max={1} step={0.01} value={softness} onChange={(event) => patchControls({ softness: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Contrast {contrast.toFixed(2)}</span>
              <input type="range" min={0} max={1} step={0.01} value={contrast} onChange={(event) => patchControls({ contrast: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Opacity {opacity.toFixed(2)}</span>
              <input type="range" min={0.1} max={1} step={0.01} value={opacity} onChange={(event) => patchControls({ opacity: Number.parseFloat(event.target.value) })} />
            </label>
            <label className="grid gap-1 text-xs text-white/65">
              <span>Mouse {mouseStrength.toFixed(2)}</span>
              <input type="range" min={0} max={1} step={0.01} value={mouseStrength} onChange={(event) => patchControls({ mouseStrength: Number.parseFloat(event.target.value) })} />
            </label>
          </section>

          {effectType !== "animatedGradient" ? (
            <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
              <p className="text-xs text-white/70">Effect</p>
              <label className="grid gap-1 text-xs text-white/65">
                <span>Intensity {intensity.toFixed(2)}</span>
                <input type="range" min={0} max={1.5} step={0.01} value={intensity} onChange={(event) => patchControls({ intensity: Number.parseFloat(event.target.value) })} />
              </label>
              <label className="grid gap-1 text-xs text-white/65">
                <span>Spread {spread.toFixed(2)}</span>
                <input type="range" min={0.1} max={1} step={0.01} value={spread} onChange={(event) => patchControls({ spread: Number.parseFloat(event.target.value) })} />
              </label>
              <label className="grid gap-1 text-xs text-white/65">
                <span>Decay {decay.toFixed(2)}</span>
                <input type="range" min={0.6} max={1} step={0.01} value={decay} onChange={(event) => patchControls({ decay: Number.parseFloat(event.target.value) })} />
              </label>
            </section>
          ) : null}

          {effectType === "custom" ? (
            <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-white/70">Shader Editor</p>
                <select
                  defaultValue=""
                  onChange={(event) => {
                    const next = event.target.value;
                    if (next === "flow") setCustomFragmentSource(FLOW_FRAGMENT_SHADER);
                    if (next === "plasma") setCustomFragmentSource(PLASMA_FRAGMENT_SHADER);
                    if (next === "aurora") setCustomFragmentSource(AURORA_FRAGMENT_SHADER);
                    if (next === "crt") setCustomFragmentSource(CRT_FRAGMENT_SHADER);
                    if (next === "mesh") setCustomFragmentSource(MESH_FRAGMENT_SHADER);
                    if (next === "holo") setCustomFragmentSource(HOLO_FRAGMENT_SHADER);
                    event.currentTarget.value = "";
                  }}
                  className="rounded-md border border-white/15 bg-black/30 px-2 py-1 text-[11px]"
                >
                  <option value="" disabled>
                    Load template
                  </option>
                  <option value="flow">Flow</option>
                  <option value="plasma">Plasma</option>
                  <option value="aurora">Aurora</option>
                  <option value="crt">CRT</option>
                  <option value="mesh">Mesh</option>
                  <option value="holo">Holo</option>
                </select>
              </div>
              <textarea
                value={customFragmentSource}
                onChange={(event) => setCustomFragmentSource(event.target.value)}
                rows={14}
                className="w-full rounded-md border border-white/15 bg-black/40 p-2 font-mono text-[11px]"
              />
              {shaderError ? <p className="text-[11px] text-rose-300">{shaderError}</p> : <p className="text-[11px] text-emerald-300">Shader compiled</p>}
            </section>
          ) : null}

          <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/70">Gradient</p>
            <div className="grid grid-cols-3 gap-2">
              <input type="color" value={controls.color1} onChange={(event) => patchControls({ color1: event.target.value })} className="h-9 w-full" />
              <input type="color" value={controls.color2} onChange={(event) => patchControls({ color2: event.target.value })} className="h-9 w-full" />
              <input type="color" value={controls.color3} onChange={(event) => patchControls({ color3: event.target.value })} className="h-9 w-full" />
            </div>
          </section>

          <section className="grid gap-2 rounded-md border border-white/10 bg-black/25 p-3">
            <p className="text-xs text-white/70">Modifiers</p>
            <label className="flex items-center gap-2 text-xs text-white/75">
              <input type="checkbox" checked={modifiers.warp} onChange={(event) => toggleModifier("warp", event.target.checked)} /> Warp
            </label>
            {modifiers.warp ? (
              <label className="grid gap-1 text-xs text-white/65">
                <span>Warp {controls.warpStrength.toFixed(2)}</span>
                <input type="range" min={0} max={0.5} step={0.01} value={controls.warpStrength} onChange={(event) => patchControls({ warpStrength: Number.parseFloat(event.target.value) })} />
              </label>
            ) : null}

            <label className="flex items-center gap-2 text-xs text-white/75">
              <input type="checkbox" checked={modifiers.grain} onChange={(event) => toggleModifier("grain", event.target.checked)} /> Grain
            </label>
            {modifiers.grain ? (
              <label className="grid gap-1 text-xs text-white/65">
                <span>Grain {controls.grainAmount.toFixed(2)}</span>
                <input type="range" min={0} max={0.15} step={0.005} value={controls.grainAmount} onChange={(event) => patchControls({ grainAmount: Number.parseFloat(event.target.value) })} />
              </label>
            ) : null}

            <label className="flex items-center gap-2 text-xs text-white/75">
              <input type="checkbox" checked={modifiers.bayerDither} onChange={(event) => toggleModifier("bayerDither", event.target.checked)} /> Bayer
            </label>
            {modifiers.bayerDither ? (
              <label className="grid gap-1 text-xs text-white/65">
                <span>Dither {controls.ditherAmount.toFixed(2)}</span>
                <input type="range" min={0} max={0.2} step={0.005} value={controls.ditherAmount} onChange={(event) => patchControls({ ditherAmount: Number.parseFloat(event.target.value) })} />
              </label>
            ) : null}
          </section>

          <PerformancePanel controls={controls} modifiers={modifiers} exportSettings={exportSettings} onPatchExport={patchExportSettings} />

          <ExportPanel effectType={effectType} controls={controls} modifiers={modifiers} exportSettings={exportSettings} />

          <details className="rounded-md border border-white/10 bg-black/25 p-3">
            <summary className="cursor-pointer text-xs text-white/70">Saved states</summary>
            <div className="mt-2 grid gap-2">
              {saved.slice(0, 10).map((item) => (
                <button key={item.id} onClick={() => loadSaved(item.id)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-left text-xs hover:bg-white/10">
                  {item.name}
                </button>
              ))}
            </div>
          </details>
        </aside>
      </section>
    </main>
  );
}

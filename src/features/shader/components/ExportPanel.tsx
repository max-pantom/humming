"use client";

import { useMemo, useState } from "react";
import type { ExportSettings, GradientEffectControls, MainEffectType, ModifierToggles } from "@/features/shader/types";

type Props = {
  effectType: MainEffectType;
  controls: GradientEffectControls;
  modifiers: ModifierToggles;
  exportSettings: ExportSettings;
};

type ExportMode = "react" | "html" | "json";

function reactSnippet(controls: GradientEffectControls, modifiers: ModifierToggles, exportSettings: ExportSettings) {
  return `<WebGLEffect
  color1="${controls.color1}"
  color2="${controls.color2}"
  color3="${controls.color3}"
  speed={${controls.speed}}
  scale={${controls.scale}}
  flow={${controls.flow}}
  softness={${controls.softness}}
  contrast={${controls.contrast}}
  direction={${controls.direction}}
  intensity={${controls.intensity}}
  spread={${controls.spread}}
  decay={${controls.decay}}
  opacity={${controls.opacity}}
  mouseStrength={${controls.mouseStrength}}
  warpStrength={${modifiers.warp ? controls.warpStrength : 0}}
  grainAmount={${modifiers.grain ? controls.grainAmount : 0}}
  ditherAmount={${modifiers.bayerDither ? controls.ditherAmount : 0}}
  pauseOffscreen={${exportSettings.pauseOffscreen}}
  reducedMotion={${exportSettings.reducedMotion}}
  mobileSafeMode={${exportSettings.mobileSafeMode}}
/>`;
}

function htmlSnippet(controls: GradientEffectControls, modifiers: ModifierToggles, exportSettings: ExportSettings) {
  return `<div id="web-surface"></div>
<script>
  window.createWebSurface?.("#web-surface", {
    color1: "${controls.color1}",
    color2: "${controls.color2}",
    color3: "${controls.color3}",
    speed: ${controls.speed},
    scale: ${controls.scale},
    flow: ${controls.flow},
    softness: ${controls.softness},
    contrast: ${controls.contrast},
    direction: ${controls.direction},
    intensity: ${controls.intensity},
    spread: ${controls.spread},
    decay: ${controls.decay},
    opacity: ${controls.opacity},
    mouseStrength: ${controls.mouseStrength},
    warpStrength: ${modifiers.warp ? controls.warpStrength : 0},
    grainAmount: ${modifiers.grain ? controls.grainAmount : 0},
    ditherAmount: ${modifiers.bayerDither ? controls.ditherAmount : 0},
    pauseOffscreen: ${exportSettings.pauseOffscreen},
    reducedMotion: ${exportSettings.reducedMotion},
    mobileSafeMode: ${exportSettings.mobileSafeMode}
  });
</script>`;
}

export function ExportPanel({ effectType, controls, modifiers, exportSettings }: Props) {
  const [mode, setMode] = useState<ExportMode>("react");
  const [copied, setCopied] = useState(false);

  const jsonPayload = useMemo(
    () =>
      JSON.stringify(
        {
          effect: "animatedGradient",
          effectType,
          controls,
          modifiers,
          export: exportSettings,
        },
        null,
        2,
      ),
    [controls, effectType, exportSettings, modifiers],
  );

  const text = useMemo(() => {
    if (mode === "react") return reactSnippet(controls, modifiers, exportSettings);
    if (mode === "html") return htmlSnippet(controls, modifiers, exportSettings);
    return jsonPayload;
  }, [controls, exportSettings, jsonPayload, mode, modifiers]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <section className="grid gap-3 rounded-md border border-white/10 bg-panel/90 p-4">
      <div>
        <h3 className="text-sm font-medium">Export</h3>
        <p className="text-xs text-white/55">Copy production-ready code.</p>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {(["react", "html", "json"] as ExportMode[]).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`rounded-md border px-2 py-1 text-xs ${mode === item ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5"}`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <button onClick={copy} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
        {copied ? "Copied" : "Copy code"}
      </button>

      <pre className="max-h-[320px] overflow-auto rounded-md border border-white/10 bg-black/35 p-3 text-xs text-white/75">
        <code>{text}</code>
      </pre>
    </section>
  );
}

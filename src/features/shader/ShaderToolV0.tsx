"use client";

import { useMemo, useState } from "react";
import { ControlPanel } from "@/features/shader/components/ControlPanel";
import { EffectInspector } from "@/features/shader/components/EffectInspector";
import { EffectsPanel } from "@/features/shader/components/EffectsPanel";
import { ExportPanel } from "@/features/shader/components/ExportPanel";
import { PerformancePanel } from "@/features/shader/components/PerformancePanel";
import { ShaderCanvas } from "@/features/shader/components/ShaderCanvas";
import { exportConfigJSON } from "@/features/shader/lib/exporters";
import { useShaderStore } from "@/features/shader/store/useShaderStore";
import { cn } from "@/lib/utils";

type PreviewContext = "hero" | "card" | "section" | "background";
type RightSection = "design" | "effects" | "performance" | "export";

export default function ShaderToolV0() {
  const {
    config,
    styleId,
    effects,
    selectedEffectId,
    gradient,
    sceneElements,
    savedVariants,
    setConfig,
    addEffect,
    selectEffect,
    patchEffect,
    patchEffectParam,
    moveEffect,
    removeEffect,
    addGradientStop,
    patchGradientStop,
    removeGradientStop,
    saveVariant,
    loadVariant,
    resetConfig,
  } = useShaderStore();

  const [previewContext, setPreviewContext] = useState<PreviewContext>("hero");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [rightSection, setRightSection] = useState<RightSection>("design");

  const selectedEffect = useMemo(() => effects.find((item) => item.id === selectedEffectId) ?? null, [effects, selectedEffectId]);

  const previewCanvas = (
    <div className={cn("h-full w-full", viewport === "mobile" && "mx-auto max-w-[390px]")}>
      <ShaderCanvas
        styleId={styleId}
        config={config}
        gradient={gradient}
        effects={effects}
        sceneElements={sceneElements}
        selectedSceneElementId={null}
        onSelectSceneElement={() => {
          // Deployment-focused mode: disable layer selection interactions in main workflow.
        }}
      />
    </div>
  );

  return (
    <main className="h-dvh w-full overflow-hidden p-3">
      <section className="mb-2 flex items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2">
        <div>
          <p className="text-xs text-white/55">Website Surface Editor</p>
          <h1 className="text-sm font-medium text-white">Untitled Surface</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => saveVariant(`Surface ${new Date().toLocaleTimeString()}`)}
            className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 hover:bg-white/10"
          >
            Duplicate
          </button>
          <button
            onClick={async () => {
              const json = exportConfigJSON(config, gradient, effects, styleId, sceneElements);
              await navigator.clipboard.writeText(json);
            }}
            className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 hover:bg-white/10"
          >
            Share
          </button>
          <button onClick={resetConfig} className="rounded-md border border-white/15 bg-white/5 px-2 py-1.5 hover:bg-white/10">
            Reset
          </button>
          <button onClick={() => setRightSection("export")} className="rounded-md border border-white/25 bg-white/15 px-2 py-1.5 text-white">
            Export
          </button>
        </div>
      </section>

      <section className="grid h-[calc(100dvh-76px)] min-h-0 grid-cols-1 gap-3 xl:grid-cols-[260px_minmax(0,1fr)_390px]">
        <aside className="grid min-h-0 gap-3 overflow-auto rounded-md border border-white/10 bg-black/20 p-3">
          <EffectsPanel
            effects={effects}
            selectedEffectId={selectedEffectId}
            onSelect={selectEffect}
            onAdd={addEffect}
            onPatch={patchEffect}
            onMove={moveEffect}
            onRemove={removeEffect}
          />

          <div className="grid gap-2 rounded-md border border-white/10 bg-panel/90 p-3">
            <p className="text-xs text-white/60">Saved Versions</p>
            {savedVariants.slice(0, 6).map((variant) => (
              <button key={variant.id} onClick={() => loadVariant(variant.id)} className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-left text-xs hover:bg-white/10">
                {variant.name}
              </button>
            ))}
          </div>
        </aside>

        <section className="grid min-h-0 gap-2 rounded-md border border-white/10 bg-black/20 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {(["hero", "card", "section", "background"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setPreviewContext(item)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-xs capitalize",
                    previewContext === item ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="ml-auto flex gap-1">
              <button onClick={() => setViewport("desktop")} className={cn("rounded-md border px-2 py-1 text-xs", viewport === "desktop" ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}>
                Desktop
              </button>
              <button onClick={() => setViewport("mobile")} className={cn("rounded-md border px-2 py-1 text-xs", viewport === "mobile" ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}>
                Mobile
              </button>
            </div>
          </div>

          <div className="min-h-0 overflow-hidden rounded-md border border-white/10 bg-[#0b0c0f] p-2">
            {previewContext === "hero" ? <div className="h-full">{previewCanvas}</div> : null}

            {previewContext === "background" ? <div className="h-full">{previewCanvas}</div> : null}

            {previewContext === "card" ? (
              <div className="grid h-full place-items-center">
                <div className="h-[72%] w-full max-w-[760px] rounded-lg border border-white/10 p-2">{previewCanvas}</div>
              </div>
            ) : null}

            {previewContext === "section" ? (
              <div className="grid h-full grid-cols-1 gap-3 lg:grid-cols-[1fr_1.2fr]">
                <div className="rounded-md border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg text-balance">Landing Section Preview</h3>
                  <p className="mt-2 text-sm text-white/60 text-pretty">Check contrast and movement with real content beside your WebGL surface.</p>
                </div>
                <div className="h-full">{previewCanvas}</div>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="grid min-h-0 gap-2 overflow-auto rounded-md border border-white/10 bg-black/20 p-3">
          <EffectInspector effect={selectedEffect} onPatch={patchEffect} onPatchParam={patchEffectParam} />

          <div className="flex gap-1">
            {([
              { id: "design", label: "Design" },
              { id: "effects", label: "Effects" },
              { id: "performance", label: "Performance" },
              { id: "export", label: "Export" },
            ] as const).map((item) => (
              <button
                key={item.id}
                onClick={() => setRightSection(item.id)}
                className={cn("rounded-md border px-2 py-1 text-xs", rightSection === item.id ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}
              >
                {item.label}
              </button>
            ))}
          </div>

          {rightSection === "design" ? (
            <ControlPanel
              config={config}
              gradient={gradient}
              onPatch={setConfig}
              onAddGradientStop={addGradientStop}
              onPatchGradientStop={patchGradientStop}
              onRemoveGradientStop={removeGradientStop}
              onReset={resetConfig}
            />
          ) : null}

          {rightSection === "effects" ? <PerformancePanel config={config} effects={effects} /> : null}

          {rightSection === "performance" ? <PerformancePanel config={config} effects={effects} /> : null}

          {rightSection === "export" ? <ExportPanel styleId={styleId} config={config} gradient={gradient} effects={effects} sceneElements={sceneElements} /> : null}
        </aside>
      </section>
    </main>
  );
}

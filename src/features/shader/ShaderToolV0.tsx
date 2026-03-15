"use client";

import { useState } from "react";
import { ControlPanel } from "@/features/shader/components/ControlPanel";
import { EffectsPanel } from "@/features/shader/components/EffectsPanel";
import { ExportPanel } from "@/features/shader/components/ExportPanel";
import { LibraryPanel } from "@/features/shader/components/LibraryPanel";
import { SceneToolbar, type SceneTool } from "@/features/shader/components/SceneToolbar";
import { ShaderCanvas } from "@/features/shader/components/ShaderCanvas";
import { useShaderStore } from "@/features/shader/store/useShaderStore";
import { cn } from "@/lib/utils";

type SidebarSection = "effects" | "style" | "layers" | "library" | "export";

export default function ShaderToolV0() {
  const {
    config,
    styleId,
    effects,
    gradient,
    sceneElements,
    selectedSceneElementId,
    savedVariants,
    setStyleId,
    setConfig,
    addEffect,
    patchEffect,
    moveEffect,
    removeEffect,
    addGradientStop,
    patchGradientStop,
    removeGradientStop,
    addSceneElement,
    patchSceneElement,
    selectSceneElement,
    removeSceneElement,
    resetConfig,
    saveVariant,
    loadVariant,
    deleteVariant,
    importConfig,
  } = useShaderStore();

  const [view, setView] = useState<"desktop" | "mobile">("desktop");
  const [activeTool, setActiveTool] = useState<SceneTool>("select");
  const [sidebarSection, setSidebarSection] = useState<SidebarSection>("layers");
  const selectedSceneElement = sceneElements.find((item) => item.id === selectedSceneElementId) ?? null;

  return (
    <main className="h-dvh w-full overflow-hidden p-2 md:p-3">
      <section className="grid h-full min-h-0 grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className={cn("relative h-full w-full", view === "mobile" && "mx-auto max-w-[390px]")}>
          <SceneToolbar
            styleId={styleId}
            activeTool={activeTool}
            onToolChange={setActiveTool}
            onStyleChange={setStyleId}
            onAddText={() => addSceneElement("text")}
            onAddImage={() => addSceneElement("image")}
            onAddSvg={() => addSceneElement("svg")}
          />
          <ShaderCanvas
            styleId={styleId}
            config={config}
            gradient={gradient}
            effects={effects}
            sceneElements={sceneElements}
            selectedSceneElementId={selectedSceneElementId}
            onSelectSceneElement={selectSceneElement}
          />
        </div>

        <aside className="grid self-start gap-2 rounded-lg border border-white/10 bg-[#0f0f11] p-2">
          <div className="flex h-8 flex-nowrap items-center gap-1 overflow-hidden border-b border-white/10 pb-1">
            <label className="flex min-w-0 flex-1 items-center gap-1 text-[11px] text-white/60">
              <select
                value={sidebarSection}
                onChange={(event) => setSidebarSection(event.target.value as SidebarSection)}
                className="h-6 min-w-0 w-full rounded-md border border-white/15 bg-white/5 px-2 text-[11px] text-white"
              >
                <option value="layers">Layers</option>
                <option value="effects">Effects</option>
                <option value="style">Style</option>
                <option value="library">Library</option>
                <option value="export">Export</option>
              </select>
            </label>

            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => setView("desktop")}
                className={cn("h-6 rounded-md border px-2 text-[11px]", view === "desktop" ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}
              >
                Desk
              </button>
              <button
                onClick={() => setView("mobile")}
                className={cn("h-6 rounded-md border px-2 text-[11px]", view === "mobile" ? "border-white/35 bg-white/15" : "border-white/10 bg-white/5")}
              >
                Mob
              </button>
            </div>
          </div>

            {sidebarSection === "effects" ? (
              <EffectsPanel
                effects={effects}
                selectedElementId={selectedSceneElementId}
                onAdd={addEffect}
                onPatch={patchEffect}
                onMove={moveEffect}
                onRemove={removeEffect}
              />
            ) : null}

            {sidebarSection === "style" ? (
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

            {sidebarSection === "layers" ? (
              <section className="grid gap-3 rounded-md border border-white/10 bg-black/25 p-3">
                <div>
                  <h2 className="text-sm font-medium">Inspector</h2>
                  <p className="text-[11px] text-white/55">Select a layer to edit.</p>
                </div>

                <div className="grid gap-2">
                  {sceneElements.length === 0 ? <p className="text-xs text-white/60">Use toolbar to add text, image, or SVG.</p> : null}

                  {sceneElements.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => selectSceneElement(item.id)}
                      className={cn(
                        "flex items-center justify-between rounded-md border px-2 py-1.5 text-xs",
                        selectedSceneElementId === item.id ? "border-white/35 bg-white/10" : "border-white/15 bg-white/5",
                      )}
                    >
                      <span className="capitalize">{item.kind}</span>
                      <span className="text-white/60">{item.visible ? "Visible" : "Hidden"}</span>
                    </button>
                  ))}

                  {selectedSceneElement ? (
                    <div className="mt-1 grid gap-3 rounded-md border border-white/10 bg-black/35 p-2">
                      <div className="border-b border-white/10 pb-2">
                        <p className="mb-2 text-[11px] uppercase text-white/55">Position</p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>X</span>
                            <input
                              type="number"
                              value={selectedSceneElement.x}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { x: Number.parseFloat(event.target.value) || 0 })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>Y</span>
                            <input
                              type="number"
                              value={selectedSceneElement.y}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { y: Number.parseFloat(event.target.value) || 0 })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="border-b border-white/10 pb-2">
                        <p className="mb-2 text-[11px] uppercase text-white/55">Size</p>
                        <div className="grid grid-cols-2 gap-2">
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>Width</span>
                            <input
                              type="number"
                              value={selectedSceneElement.width}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { width: Math.max(24, Number.parseFloat(event.target.value) || 24) })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>Height</span>
                            <input
                              type="number"
                              value={selectedSceneElement.height}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { height: Math.max(24, Number.parseFloat(event.target.value) || 24) })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <p className="mb-2 text-[11px] uppercase text-white/55">Content</p>
                        {selectedSceneElement.kind === "text" ? (
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>Text</span>
                            <input
                              value={selectedSceneElement.text}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { text: event.target.value })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                        ) : null}

                        {selectedSceneElement.kind === "image" ? (
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>Image URL</span>
                            <input
                              value={selectedSceneElement.src}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { src: event.target.value })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                        ) : null}

                        {selectedSceneElement.kind === "svg" ? (
                          <label className="grid gap-1 text-xs text-white/70">
                            <span>SVG markup</span>
                            <textarea
                              rows={3}
                              value={selectedSceneElement.svgMarkup}
                              onChange={(event) => patchSceneElement(selectedSceneElement.id, { svgMarkup: event.target.value })}
                              className="rounded-md border border-white/15 bg-black/50 px-2 py-1"
                            />
                          </label>
                        ) : null}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => patchSceneElement(selectedSceneElement.id, { visible: !selectedSceneElement.visible })}
                          className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                        >
                          {selectedSceneElement.visible ? "Hide" : "Show"}
                        </button>
                        <button
                          onClick={() => removeSceneElement(selectedSceneElement.id)}
                          className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs hover:bg-white/10"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {sidebarSection === "library" ? (
              <LibraryPanel
                styleId={styleId}
                config={config}
                gradient={gradient}
                effects={effects}
                sceneElements={sceneElements}
                variants={savedVariants}
                onSave={saveVariant}
                onLoad={loadVariant}
                onDelete={deleteVariant}
                onImport={importConfig}
              />
            ) : null}

            {sidebarSection === "export" ? <ExportPanel styleId={styleId} config={config} gradient={gradient} effects={effects} sceneElements={sceneElements} /> : null}
        </aside>
      </section>
    </main>
  );
}

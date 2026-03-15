"use client";

import { useMemo, useState } from "react";
import { exportConfigJSON } from "@/features/shader/lib/exporters";
import type { EffectLayer, GradientConfig, RainbowConfig, SavedVariant, SceneElement, ShaderStyleId } from "@/features/shader/types";

type Props = {
  styleId: ShaderStyleId;
  config: RainbowConfig;
  gradient: GradientConfig;
  effects: EffectLayer[];
  sceneElements: SceneElement[];
  variants: SavedVariant[];
  onSave: (name: string) => void;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onImport: (json: string) => { ok: boolean; message: string };
};

export function LibraryPanel({ styleId, config, gradient, effects, sceneElements, variants, onSave, onLoad, onDelete, onImport }: Props) {
  const [name, setName] = useState("My Rainbow Variant");
  const [importText, setImportText] = useState("");
  const [message, setMessage] = useState("");
  const configJson = useMemo(() => exportConfigJSON(config, gradient, effects, styleId, sceneElements), [config, gradient, effects, sceneElements, styleId]);

  return (
    <section className="grid gap-3 rounded-xl border border-white/10 bg-panel/90 p-4">
      <div>
        <h2 className="text-lg font-medium">Save and Reuse</h2>
        <p className="text-sm text-white/55">Local library, duplicate variants, import/export JSON.</p>
      </div>

      <div className="grid gap-2">
        <label className="text-xs text-white/70" htmlFor="variant-name">
          Variant Name
        </label>
        <div className="flex gap-2">
          <input
            id="variant-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              onSave(name);
              setMessage("Saved to your local library.");
            }}
            className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            Save
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <h3 className="text-sm text-white/80">Saved Variants</h3>
        <div className="max-h-44 overflow-auto rounded-lg border border-white/10 bg-black/20 p-2">
          {variants.length === 0 ? (
            <p className="px-2 py-1 text-xs text-white/50">No variants saved yet.</p>
          ) : (
            variants.map((item) => (
              <div key={item.id} className="mb-2 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-2 py-2 text-xs">
                <button onClick={() => onLoad(item.id)} className="text-left text-white/85 hover:text-white">
                  {item.name}
                </button>
                <button onClick={() => onDelete(item.id)} className="rounded-md border border-white/15 px-2 py-1 text-white/75 hover:bg-white/10">
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <details className="rounded-lg border border-white/10 bg-black/20 p-2">
        <summary className="cursor-pointer text-sm text-white/80">Copy config JSON</summary>
        <pre className="mt-2 max-h-44 overflow-auto rounded-md bg-black/35 p-2 text-xs text-white/70">
          <code>{configJson}</code>
        </pre>
      </details>

      <div className="grid gap-2">
        <label className="text-xs text-white/70" htmlFor="import-json">
          Import Config JSON
        </label>
        <textarea
          id="import-json"
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
          rows={6}
          className="w-full rounded-md border border-white/15 bg-black/25 px-3 py-2 text-xs"
          placeholder='Paste JSON here, then click "Import"'
        />
        <button
          onClick={() => {
            const result = onImport(importText);
            setMessage(result.message);
          }}
          className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
        >
          Import
        </button>
      </div>

      {message ? <p className="text-xs text-white/80">{message}</p> : null}
    </section>
  );
}

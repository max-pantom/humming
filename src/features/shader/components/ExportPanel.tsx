"use client";

import { useMemo, useState } from "react";
import { exportConfigJSON, exportHtmlCode, exportReactCode } from "@/features/shader/lib/exporters";
import type { EffectLayer, GradientConfig, RainbowConfig, SceneElement, ShaderStyleId } from "@/features/shader/types";

type Props = {
  styleId: ShaderStyleId;
  config: RainbowConfig;
  gradient: GradientConfig;
  effects: EffectLayer[];
  sceneElements: SceneElement[];
};

type ExportMode = "react" | "html" | "json";

export function ExportPanel({ styleId, config, gradient, effects, sceneElements }: Props) {
  const [mode, setMode] = useState<ExportMode>("react");
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    if (mode === "react") return exportReactCode(config, styleId);
    if (mode === "html") return exportHtmlCode(config, styleId);
    return exportConfigJSON(config, gradient, effects, styleId, sceneElements);
  }, [config, gradient, effects, mode, sceneElements, styleId]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  const download = () => {
    const ext = mode === "json" ? "json" : mode === "html" ? "html" : "tsx";
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rainbow-flow.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="grid gap-3 rounded-xl border border-white/10 bg-panel/90 p-4">
      <div>
        <h2 className="text-lg font-medium">Export</h2>
        <p className="text-sm text-white/55">React component, HTML embed, or config JSON.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["react", "html", "json"] as ExportMode[]).map((item) => (
          <button
            key={item}
            onClick={() => setMode(item)}
            className={`rounded-md border px-3 py-1.5 text-sm ${mode === item ? "border-white/30 bg-white/15" : "border-white/15 bg-white/5"}`}
          >
            {item.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={copy} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
          {copied ? "Copied" : "Copy"}
        </button>
        <button onClick={download} className="rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">
          Download
        </button>
      </div>

      <pre className="max-h-[320px] overflow-auto rounded-lg border border-white/10 bg-black/35 p-3 text-xs text-white/75">
        <code>{text}</code>
      </pre>
    </section>
  );
}

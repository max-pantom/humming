"use client";

import { styleLabels } from "@/features/shader/presets";
import type { ShaderStyleId } from "@/features/shader/types";
import { cn } from "@/lib/utils";

export type SceneTool = "select" | "text" | "image" | "svg";

type Props = {
  styleId: ShaderStyleId;
  activeTool: SceneTool;
  onToolChange: (tool: SceneTool) => void;
  onStyleChange: (styleId: ShaderStyleId) => void;
  onAddText: () => void;
  onAddImage: () => void;
  onAddSvg: () => void;
};

const styleOptions = Object.keys(styleLabels) as ShaderStyleId[];

export function SceneToolbar({ styleId, activeTool, onToolChange, onStyleChange, onAddText, onAddImage, onAddSvg }: Props) {
  return (
    <>
      <div className="absolute left-3 top-16 z-20 grid gap-1 rounded-lg border border-white/15 bg-black/55 p-1.5 backdrop-blur-sm">
        <button
          onClick={() => onToolChange("select")}
          className={cn("rounded-md border px-2 py-1 text-xs", activeTool === "select" ? "border-white/40 bg-white/15" : "border-white/15 bg-white/5")}
        >
          Move
        </button>
        <button
          onClick={() => {
            onToolChange("text");
            onAddText();
          }}
          className={cn("rounded-md border px-2 py-1 text-xs", activeTool === "text" ? "border-white/40 bg-white/15" : "border-white/15 bg-white/5")}
        >
          Text
        </button>
        <button
          onClick={() => {
            onToolChange("image");
            onAddImage();
          }}
          className={cn("rounded-md border px-2 py-1 text-xs", activeTool === "image" ? "border-white/40 bg-white/15" : "border-white/15 bg-white/5")}
        >
          Image
        </button>
        <button
          onClick={() => {
            onToolChange("svg");
            onAddSvg();
          }}
          className={cn("rounded-md border px-2 py-1 text-xs", activeTool === "svg" ? "border-white/40 bg-white/15" : "border-white/15 bg-white/5")}
        >
          SVG
        </button>
      </div>

      <div className="absolute left-16 right-3 top-3 z-20 flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-black/55 px-2 py-2 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/65">Tool</span>
          <span className="rounded-md border border-white/15 bg-white/5 px-2 py-1 text-xs capitalize text-white/85">{activeTool}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs text-white/70">
            <span>Shader Style</span>
            <select
              value={styleId}
              onChange={(event) => onStyleChange(event.target.value as ShaderStyleId)}
              className="rounded-md border border-white/15 bg-black/20 px-2 py-1 text-xs text-white"
            >
              {styleOptions.map((item) => (
                <option key={item} value={item}>
                  {styleLabels[item]}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
    </>
  );
}

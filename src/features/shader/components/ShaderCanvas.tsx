"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import { compileShader } from "@/features/shader/lib/webgl";
import { getFragmentShaderByStyle } from "@/features/shader/shaderStyles";
import { VERTEX_SHADER } from "@/features/shader/shaders";
import type { EffectLayer, GradientConfig, RainbowConfig, SceneElement, ShaderStyleId } from "@/features/shader/types";

type Props = {
  styleId: ShaderStyleId;
  config: RainbowConfig;
  gradient: GradientConfig;
  effects: EffectLayer[];
  sceneElements: SceneElement[];
  selectedSceneElementId: string | null;
  onSelectSceneElement: (id: string | null) => void;
};

type RuntimeInputs = {
  timeSeconds: number;
  mouse: { x: number; y: number };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean;
  const value = Number.parseInt(full, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function rgbToHex(color: [number, number, number]) {
  const toHex = (n: number) => {
    const value = clamp(Math.round(n * 255), 0, 255);
    return value.toString(16).padStart(2, "0");
  };
  return `#${toHex(color[0])}${toHex(color[1])}${toHex(color[2])}`;
}

function sampleGradientColor(gradient: GradientConfig, t: number) {
  const stops = [...gradient.stops].sort((a, b) => a.position - b.position);
  if (stops.length === 0) return "#ffffff";
  if (stops.length === 1) return stops[0].color;
  if (t <= stops[0].position) return stops[0].color;
  if (t >= stops[stops.length - 1].position) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i += 1) {
    const a = stops[i];
    const b = stops[i + 1];
    if (t >= a.position && t <= b.position) {
      const span = Math.max(0.0001, b.position - a.position);
      const localT = (t - a.position) / span;
      const aRgb = hexToRgb(a.color);
      const bRgb = hexToRgb(b.color);
      return rgbToHex([
        aRgb[0] + (bRgb[0] - aRgb[0]) * localT,
        aRgb[1] + (bRgb[1] - aRgb[1]) * localT,
        aRgb[2] + (bRgb[2] - aRgb[2]) * localT,
      ]);
    }
  }

  return stops[0].color;
}

function effectSignal(effect: EffectLayer, inputs: RuntimeInputs) {
  if (effect.type === "animatedGradient") {
    return (Math.sin(inputs.timeSeconds * 1.3 + inputs.mouse.x * 3) + 1) * 0.5;
  }
  if (effect.type === "warp") {
    return (Math.cos(inputs.timeSeconds * 0.7 + inputs.mouse.y * 2) + 1) * 0.5;
  }
  return effect.intensity;
}

function effectScope(effect: EffectLayer) {
  return effect.target?.scope ?? "scene";
}

function effectOpacity(effect: EffectLayer) {
  return typeof effect.opacity === "number" ? effect.opacity : 1;
}

function effectIntensity(effect: EffectLayer) {
  return typeof effect.intensity === "number" ? effect.intensity : 0.35;
}

function applyEffectLayers(base: RainbowConfig, effects: EffectLayer[], inputs: RuntimeInputs): RainbowConfig {
  const next = { ...base };

  const sorted = [...effects].sort((a, b) => a.order - b.order);

  for (const effect of sorted) {
    if (!effect.enabled) continue;
    const amount = effectSignal(effect, inputs) * effectIntensity(effect) * effectOpacity(effect);

    const num = (key: string, fallback: number) => {
      const value = effect.params?.[key];
      return typeof value === "number" ? value : fallback;
    };

    if (effect.type === "animatedGradient") {
      next.speed += num("speed", 0.35) * 0.35 * amount;
      next.scale += num("scale", 1.2) * 0.2 * amount;
      next.direction += (num("direction", 45) / 180) * 0.3 * amount;
      next.glow += num("softness", 0.8) * 0.2 * amount;
      continue;
    }
    if (effect.type === "warp") {
      next.direction += num("frequency", 2) * 0.04 * amount;
      next.spread += num("detail", 0.5) * 0.15 * amount;
      next.scale += num("strength", 0.12) * 0.4 * amount;
      continue;
    }
    if (effect.type === "grain") {
      next.grain += num("amount", 0.08) * 0.7 * amount;
      next.noiseAmount += num("size", 1) * 0.1 * amount;
      continue;
    }
    if (effect.type === "bayerDither") {
      next.grain += num("amount", 0.15) * 0.25 * amount;
      next.noiseAmount += num("contrastBoost", 0) * 0.3 * amount;
      continue;
    }
    if (effect.type === "godRays") {
      next.glow += num("intensity", 0.4) * 0.8 * amount;
      next.spread += num("spread", 0.6) * 0.2 * amount;
      continue;
    }
    if (effect.type === "blur") {
      next.spread += num("radius", 0.2) * 0.18 * amount;
      next.scale -= num("radius", 0.2) * 0.08 * amount;
      continue;
    }

    if (effect.type === "vignette") {
      next.opacity -= num("amount", 0.25) * 0.14 * amount;
      next.glow -= num("softness", 0.55) * 0.08 * amount;
      continue;
    }
  }

  next.speed = clamp(next.speed, 0, 1.4);
  next.scale = clamp(next.scale, 0.6, 4.5);
  next.noiseAmount = clamp(next.noiseAmount, 0, 1.2);
  next.glow = clamp(next.glow, 0, 2);
  next.grain = clamp(next.grain, 0, 0.14);
  next.spread = clamp(next.spread, 0.1, 1);
  next.direction = clamp(next.direction, -3.14, 3.14);
  next.opacity = clamp(next.opacity, 0.1, 1);

  return next;
}

function cssBlend(mode: EffectLayer["blendMode"]) {
  if (mode === "screen") return "screen";
  if (mode === "overlay") return "overlay";
  if (mode === "multiply") return "multiply";
  return "normal";
}

function elementLayerStyles(effects: EffectLayer[]) {
  const applied = effects.filter((effect) => effect.enabled && effectScope(effect) === "scene");
  let blur = 0;
  let saturate = 1;
  let contrast = 1;
  let brightness = 1;
  let opacity = 1;

  for (const effect of applied) {
    const amount = effectIntensity(effect) * effectOpacity(effect);
    if (effect.type === "godRays") brightness += amount * 0.22;
    if (effect.type === "grain") contrast += amount * 0.08;
    if (effect.type === "animatedGradient") saturate += amount * 0.12;
    if (effect.type === "vignette") brightness -= amount * 0.12;
    if (effect.type === "blur") blur += amount * 1.8;
    if (effect.type === "warp") opacity -= amount * 0.06;
  }

  return {
    filter: `blur(${blur.toFixed(2)}px) saturate(${saturate.toFixed(2)}) contrast(${contrast.toFixed(2)}) brightness(${brightness.toFixed(2)})`,
    opacity: clamp(opacity, 0.2, 1),
    mixBlendMode: cssBlend(applied[applied.length - 1]?.blendMode ?? "normal"),
  } as const;
}

export function ShaderCanvas({ styleId, config, gradient, effects, sceneElements, selectedSceneElementId, onSelectSceneElement }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const configRef = useRef(config);
  const gradientRef = useRef(gradient);
  const effectsRef = useRef(effects);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  useEffect(() => {
    gradientRef.current = gradient;
  }, [gradient]);

  useEffect(() => {
    effectsRef.current = effects;
  }, [effects]);

  const hasBayer = useMemo(() => effects.some((effect) => effect.enabled && effect.type === "bayerDither" && effectScope(effect) === "scene"), [effects]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, getFragmentShaderByStyle(styleId)));
    gl.linkProgram(program);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uniforms = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      colorA: gl.getUniformLocation(program, "u_colorA"),
      colorB: gl.getUniformLocation(program, "u_colorB"),
      colorC: gl.getUniformLocation(program, "u_colorC"),
      speed: gl.getUniformLocation(program, "u_speed"),
      scale: gl.getUniformLocation(program, "u_scale"),
      noiseAmount: gl.getUniformLocation(program, "u_noiseAmount"),
      glow: gl.getUniformLocation(program, "u_glow"),
      grain: gl.getUniformLocation(program, "u_grain"),
      spread: gl.getUniformLocation(program, "u_spread"),
      direction: gl.getUniformLocation(program, "u_direction"),
      opacity: gl.getUniformLocation(program, "u_opacity"),
      mouseStrength: gl.getUniformLocation(program, "u_mouseStrength"),
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(canvas.clientWidth * dpr);
      canvas.height = Math.floor(canvas.clientHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const c = applyEffectLayers(configRef.current, effectsRef.current, {
        timeSeconds: (now - start) / 1000,
        mouse: mouseRef.current,
      });
      const g = gradientRef.current;
      const colorA = sampleGradientColor(g, 0);
      const colorB = sampleGradientColor(g, 0.5);
      const colorC = sampleGradientColor(g, 1);

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, (now - start) / 1000);
      gl.uniform2f(uniforms.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform3fv(uniforms.colorA, new Float32Array(hexToRgb(colorA)));
      gl.uniform3fv(uniforms.colorB, new Float32Array(hexToRgb(colorB)));
      gl.uniform3fv(uniforms.colorC, new Float32Array(hexToRgb(colorC)));
      gl.uniform1f(uniforms.speed, c.speed);
      gl.uniform1f(uniforms.scale, c.scale);
      gl.uniform1f(uniforms.noiseAmount, c.noiseAmount);
      gl.uniform1f(uniforms.glow, c.glow);
      gl.uniform1f(uniforms.grain, c.grain);
      gl.uniform1f(uniforms.spread, c.spread);
      gl.uniform1f(uniforms.direction, c.direction);
      gl.uniform1f(uniforms.opacity, c.opacity);
      gl.uniform1f(uniforms.mouseStrength, c.mouseStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [styleId]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-stage" onPointerDown={() => onSelectSceneElement(null)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        onPointerMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          mouseRef.current = {
            x: (event.clientX - rect.left) / rect.width,
            y: 1 - (event.clientY - rect.top) / rect.height,
          };
        }}
      />

      {hasBayer ? (
        <div className="pointer-events-none absolute inset-0 z-10 opacity-60" style={{ backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 1px, transparent 1px, transparent 3px)" }} />
      ) : null}

      <div className="absolute inset-0 z-20">
        {sceneElements.map((item) => {
          if (!item.visible) return null;

          const shell = `absolute overflow-hidden border ${selectedSceneElementId === item.id ? "border-white/60" : "border-white/20"}`;
          const layerStyle = elementLayerStyles(effects);
          const style = {
            left: `${item.x}%`,
            top: `${item.y}%`,
            width: `${item.width}px`,
            height: `${item.height}px`,
            opacity: item.opacity * layerStyle.opacity,
            filter: layerStyle.filter,
            mixBlendMode: layerStyle.mixBlendMode,
          };

          if (item.kind === "text") {
            return (
              <div
                key={item.id}
                className={`${shell} flex items-center rounded-md bg-black/20 px-3`}
                style={style}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelectSceneElement(item.id);
                }}
              >
                <p style={{ color: item.color, fontSize: `${item.fontSize}px` }} className="truncate text-pretty">
                  {item.text}
                </p>
              </div>
            );
          }

          if (item.kind === "image") {
            return (
              <div
                key={item.id}
                className={`${shell} rounded-md bg-black/20`}
                style={style}
                onPointerDown={(event) => {
                  event.stopPropagation();
                  onSelectSceneElement(item.id);
                }}
              >
                <Image src={item.src} alt={item.alt} fill sizes="(max-width: 768px) 100vw, 50vw" className={item.fit === "cover" ? "object-cover" : "object-contain"} unoptimized />
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className={`${shell} rounded-md bg-black/20 p-2`}
              style={style}
              onPointerDown={(event) => {
                event.stopPropagation();
                onSelectSceneElement(item.id);
              }}
            >
              <div className="h-full w-full" dangerouslySetInnerHTML={{ __html: item.svgMarkup }} />
            </div>
          );
        })}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between bg-black/60 px-4 py-2 text-xs text-white/70">
        <span>WebGL Scene</span>
        <span>{sceneElements.length} overlays</span>
      </div>
    </div>
  );
}

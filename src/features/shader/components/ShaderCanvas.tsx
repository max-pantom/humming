"use client";

import { useEffect, useMemo, useRef } from "react";
import { compileShader } from "@/features/shader/lib/webgl";
import { ANIMATED_GRADIENT_FRAGMENT_SHADER, FULLSCREEN_VERTEX_SHADER } from "@/features/shader/shaders/animatedGradient";
import { getFragmentShaderByStyle } from "@/features/shader/shaderStyles";
import type { GradientEffectControls, MainEffectType, ModifierToggles, ViewportMode } from "@/features/shader/types";

type Props = {
  effectType: MainEffectType;
  controls: GradientEffectControls;
  modifiers: ModifierToggles;
  viewport: ViewportMode;
  customFragmentSource?: string;
  onShaderError?: (message: string | null) => void;
};

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean;
  const value = Number.parseInt(full, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function styleForEffect(effectType: MainEffectType) {
  if (effectType === "godRays") return "aurora" as const;
  if (effectType === "noiseFlow") return "plasma" as const;
  if (effectType === "meshGlow") return "mesh" as const;
  if (effectType === "holoWave") return "holo" as const;
  if (effectType === "liquidBlur") return "flow" as const;
  return "flow" as const;
}

export function ShaderCanvas({ effectType, controls, modifiers, viewport, customFragmentSource, onShaderError }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const controlsRef = useRef(controls);
  const modifiersRef = useRef(modifiers);

  useEffect(() => {
    controlsRef.current = controls;
  }, [controls]);

  useEffect(() => {
    modifiersRef.current = modifiers;
  }, [modifiers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const isAnimated = effectType === "animatedGradient";
    const isCustom = effectType === "custom";
    const fragmentShader = isAnimated ? ANIMATED_GRADIENT_FRAGMENT_SHADER : isCustom ? customFragmentSource || ANIMATED_GRADIENT_FRAGMENT_SHADER : getFragmentShaderByStyle(styleForEffect(effectType));

    const program = gl.createProgram();
    if (!program) return;
    try {
      gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, FULLSCREEN_VERTEX_SHADER));
      gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Shader compile failed";
      onShaderError?.(message);
      return;
    }
    gl.linkProgram(program);
    onShaderError?.(null);

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, "a_position");
    const uniforms = isAnimated
      ? {
          resolution: gl.getUniformLocation(program, "u_resolution"),
          time: gl.getUniformLocation(program, "u_time"),
          color1: gl.getUniformLocation(program, "u_color1"),
          color2: gl.getUniformLocation(program, "u_color2"),
          color3: gl.getUniformLocation(program, "u_color3"),
          speed: gl.getUniformLocation(program, "u_speed"),
          scale: gl.getUniformLocation(program, "u_scale"),
          warpStrength: gl.getUniformLocation(program, "u_warpStrength"),
          grainAmount: gl.getUniformLocation(program, "u_grainAmount"),
          ditherAmount: gl.getUniformLocation(program, "u_ditherAmount"),
        }
      : {
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

    const draw = (now: number) => {
      const u = uniforms as unknown as Record<string, WebGLUniformLocation | null>;
      const c = controlsRef.current;
      const m = modifiersRef.current;

      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(u.resolution ?? null, canvas.width, canvas.height);
      gl.uniform1f(u.time ?? null, (now - start) / 1000);

      if (isAnimated) {
        gl.uniform3fv(u.color1 ?? null, new Float32Array(hexToRgb(c.color1)));
        gl.uniform3fv(u.color2 ?? null, new Float32Array(hexToRgb(c.color2)));
        gl.uniform3fv(u.color3 ?? null, new Float32Array(hexToRgb(c.color3)));
        gl.uniform1f(u.speed ?? null, c.speed);
        gl.uniform1f(u.scale ?? null, c.scale);
        gl.uniform1f(u.warpStrength ?? null, m.warp ? c.warpStrength : 0);
        gl.uniform1f(u.grainAmount ?? null, m.grain ? c.grainAmount : 0);
        gl.uniform1f(u.ditherAmount ?? null, m.bayerDither ? c.ditherAmount : 0);
      } else {
        const t = (now - start) / 1000;
        gl.uniform2f(u.mouse ?? null, 0.5 + Math.sin(t * 0.23) * 0.15, 0.5 + Math.cos(t * 0.18) * 0.15);
        gl.uniform3fv(u.colorA ?? null, new Float32Array(hexToRgb(c.color1)));
        gl.uniform3fv(u.colorB ?? null, new Float32Array(hexToRgb(c.color2)));
        gl.uniform3fv(u.colorC ?? null, new Float32Array(hexToRgb(c.color3)));
        gl.uniform1f(u.speed ?? null, c.speed);
        gl.uniform1f(u.scale ?? null, c.scale);
        gl.uniform1f(u.noiseAmount ?? null, 0.35 + (m.bayerDither ? c.ditherAmount * 1.8 : 0));
        gl.uniform1f(u.glow ?? null, effectType === "godRays" ? 1.15 : effectType === "liquidBlur" ? 0.95 : 0.65);
        gl.uniform1f(u.grain ?? null, m.grain ? c.grainAmount : 0.01);
        gl.uniform1f(u.spread ?? null, 0.45 + (m.warp ? c.warpStrength * 0.9 : 0));
        gl.uniform1f(u.direction ?? null, m.warp ? c.warpStrength * 2.6 : 0.2);
        gl.uniform1f(u.opacity ?? null, 1);
        gl.uniform1f(u.mouseStrength ?? null, effectType === "godRays" ? 0.16 : 0.08);
      }

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [customFragmentSource, effectType, onShaderError]);

  const wrapperClass = useMemo(() => {
    if (viewport === "card") return "mx-auto h-[70%] w-full max-w-[760px]";
    return "h-full w-full";
  }, [viewport]);

  return (
    <div className={wrapperClass}>
      <canvas id="web-surface-canvas" ref={canvasRef} className="h-full w-full rounded-md border border-white/10 bg-black" />
    </div>
  );
}

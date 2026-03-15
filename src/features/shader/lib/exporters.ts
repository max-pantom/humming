import { getFragmentShaderByStyle } from "@/features/shader/shaderStyles";
import { VERTEX_SHADER } from "@/features/shader/shaders";
import type { EffectLayer, GradientConfig, RainbowConfig, SceneElement, ShaderStyleId } from "@/features/shader/types";

export function exportConfigJSON(
  config: RainbowConfig,
  gradient: GradientConfig,
  effects: EffectLayer[] = [],
  styleId: ShaderStyleId = "flow",
  sceneElements: SceneElement[] = [],
) {
  return JSON.stringify({ preset: "shader-scene", styleId, ...config, gradient, effects, sceneElements }, null, 2);
}

export function exportReactCode(config: RainbowConfig, styleId: ShaderStyleId) {
  const fragmentShader = getFragmentShaderByStyle(styleId);

  return `import React, { useEffect, useRef } from "react";

const VERTEX_SHADER = ${JSON.stringify(VERTEX_SHADER)};
const FRAGMENT_SHADER = ${JSON.stringify(fragmentShader)};
const CONFIG = ${JSON.stringify(config, null, 2)};

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean;
  const value = Number.parseInt(full, 16);
  return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
  }
  return shader;
}

export default function RainbowShader({ className = "" }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
    if (!gl) return;

    const program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
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

    const mouse = { x: 0.5, y: 0.5 };
    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      mouse.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    canvas.addEventListener("pointermove", onPointerMove);

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

    function render(now) {
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, (now - start) / 1000);
      gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
      gl.uniform3fv(uniforms.colorA, new Float32Array(hexToRgb(CONFIG.paletteA)));
      gl.uniform3fv(uniforms.colorB, new Float32Array(hexToRgb(CONFIG.paletteB)));
      gl.uniform3fv(uniforms.colorC, new Float32Array(hexToRgb(CONFIG.paletteC)));
      gl.uniform1f(uniforms.speed, CONFIG.speed);
      gl.uniform1f(uniforms.scale, CONFIG.scale);
      gl.uniform1f(uniforms.noiseAmount, CONFIG.noiseAmount);
      gl.uniform1f(uniforms.glow, CONFIG.glow);
      gl.uniform1f(uniforms.grain, CONFIG.grain);
      gl.uniform1f(uniforms.spread, CONFIG.spread);
      gl.uniform1f(uniforms.direction, CONFIG.direction);
      gl.uniform1f(uniforms.opacity, CONFIG.opacity);
      gl.uniform1f(uniforms.mouseStrength, CONFIG.mouseStrength);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    }

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} style={{ width: "100%", height: "100%", display: "block" }} />;
}
`;
}

export function exportHtmlCode(config: RainbowConfig, styleId: ShaderStyleId) {
  const fragmentShader = getFragmentShaderByStyle(styleId);

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Rainbow Shader Export</title>
    <style>
      html, body { height: 100%; margin: 0; background: #090b10; }
      #root { width: 100%; height: 100%; min-height: 340px; }
      canvas { display: block; width: 100%; height: 100%; }
    </style>
  </head>
  <body>
    <div id="root"><canvas id="shader"></canvas></div>
    <script>
      const VERTEX_SHADER = ${JSON.stringify(VERTEX_SHADER)};
      const FRAGMENT_SHADER = ${JSON.stringify(fragmentShader)};
      const CONFIG = ${JSON.stringify(config, null, 2)};

      function hexToRgb(hex) {
        const clean = hex.replace("#", "");
        const full = clean.length === 3 ? clean.split("").map((x) => x + x).join("") : clean;
        const value = Number.parseInt(full, 16);
        return [((value >> 16) & 255) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
      }

      function compile(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
        }
        return shader;
      }

      (function init() {
        const canvas = document.getElementById("shader");
        const gl = canvas.getContext("webgl", { antialias: true, alpha: true });
        if (!gl) return;

        const program = gl.createProgram();
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER));
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

        const mouse = { x: 0.5, y: 0.5 };
        canvas.addEventListener("pointermove", (e) => {
          const rect = canvas.getBoundingClientRect();
          mouse.x = (e.clientX - rect.left) / rect.width;
          mouse.y = 1 - (e.clientY - rect.top) / rect.height;
        });

        const resize = () => {
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas.width = Math.floor(canvas.clientWidth * dpr);
          canvas.height = Math.floor(canvas.clientHeight * dpr);
          gl.viewport(0, 0, canvas.width, canvas.height);
        };

        resize();
        window.addEventListener("resize", resize);
        const start = performance.now();

        function frame(now) {
          gl.useProgram(program);
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
          gl.enableVertexAttribArray(aPosition);
          gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

          gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
          gl.uniform1f(uniforms.time, (now - start) / 1000);
          gl.uniform2f(uniforms.mouse, mouse.x, mouse.y);
          gl.uniform3fv(uniforms.colorA, new Float32Array(hexToRgb(CONFIG.paletteA)));
          gl.uniform3fv(uniforms.colorB, new Float32Array(hexToRgb(CONFIG.paletteB)));
          gl.uniform3fv(uniforms.colorC, new Float32Array(hexToRgb(CONFIG.paletteC)));
          gl.uniform1f(uniforms.speed, CONFIG.speed);
          gl.uniform1f(uniforms.scale, CONFIG.scale);
          gl.uniform1f(uniforms.noiseAmount, CONFIG.noiseAmount);
          gl.uniform1f(uniforms.glow, CONFIG.glow);
          gl.uniform1f(uniforms.grain, CONFIG.grain);
          gl.uniform1f(uniforms.spread, CONFIG.spread);
          gl.uniform1f(uniforms.direction, CONFIG.direction);
          gl.uniform1f(uniforms.opacity, CONFIG.opacity);
          gl.uniform1f(uniforms.mouseStrength, CONFIG.mouseStrength);

          gl.drawArrays(gl.TRIANGLES, 0, 6);
          requestAnimationFrame(frame);
        }

        requestAnimationFrame(frame);
      })();
    </script>
  </body>
</html>
`;
}

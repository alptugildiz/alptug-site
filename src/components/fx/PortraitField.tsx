"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/gsap";

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

// Bayer-dithered flow field behind a pixel sprite that resolves from a coarse
// mosaic into full resolution, with pointer-driven glitch bands.
const FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;
uniform float uReveal;
uniform float uDpr;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}
// ordered-dither thresholds: 2x2 Bayer, recursed to 4x4
float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }

void main() {
  vec2 frag = vUv * uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 m = vec2(uMouse.x * aspect, uMouse.y);

  // ── dithered flow field
  float cell = 3.0 * uDpr;
  vec2 cellId = floor(frag / cell);
  vec2 cp = (cellId * cell + 0.5 * cell) / uRes.y;
  float d = distance(cp, m);
  vec2 warp = vec2(fbm(cp * 2.2 + uTime * 0.05), fbm(cp * 2.2 - uTime * 0.04 + 9.0));
  float field = fbm(cp * 3.0 + warp * 1.6 + vec2(0.0, uTime * 0.03));
  field += uHover * 0.35 * smoothstep(0.35, 0.0, d);
  field = smoothstep(0.35, 0.95, field) * 0.55 + (1.0 - vUv.y) * 0.12;
  float dotOn = step(bayer4(cellId), field);
  vec3 ink = vec3(0.106);
  vec3 cream = vec3(1.0, 0.972, 0.875);
  vec3 col = mix(ink, cream * 0.42, dotOn);

  // ── sprite placement (square, bottom-anchored)
  float size = 0.98;
  vec2 origin = vec2(aspect * 0.5 - size * 0.5, 0.0);
  vec2 suv = (p - origin) / size;

  // glitch bands: sparse over time, dense near the pointer
  float band = floor(suv.y * 48.0);
  float t = floor(uTime * 12.0);
  float gRand = hash(vec2(band, t));
  float nearPointer = uHover * smoothstep(0.12, 0.0, abs(p.y - m.y));
  float glitch = step(0.985 - nearPointer * 0.25, gRand);
  suv.x += glitch * (hash(vec2(t, band)) - 0.5) * 0.08;

  // pixel resolve: coarse mosaic -> native 500px sprite grid
  float blocks = mix(10.0, 125.0, uReveal * uReveal);
  vec2 quv = (floor(suv * blocks) + 0.5) / blocks;
  vec4 s = vec4(0.0);
  if (quv.x > 0.0 && quv.x < 1.0 && quv.y > 0.0 && quv.y < 1.0) {
    s = texture2D(uTex, vec2(quv.x, 1.0 - quv.y));
  }
  // chromatic split on glitched rows
  if (glitch > 0.5 && s.a > 0.0) {
    float r = texture2D(uTex, vec2(quv.x + 0.012, 1.0 - quv.y)).r;
    s.rgb = vec3(r, s.g * 0.9, s.b * 1.1);
  }
  col = mix(col, s.rgb, s.a * smoothstep(0.0, 0.25, uReveal));

  // scanlines + vignette
  col *= 0.9 + 0.1 * sin(frag.y * 3.14159 / uDpr);
  col *= 1.0 - 0.35 * pow(distance(vUv, vec2(0.5)), 2.0);

  gl_FragColor = vec4(col, 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh) ?? "shader");
  return sh;
}

type Props = { src: string; alt: string; className?: string };

export default function PortraitField({ src, alt, className = "" }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) return;

    let program: WebGLProgram;
    try {
      program = gl.createProgram()!;
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "link");
    } catch (err) {
      console.warn("[PortraitField] falling back to static image", err);
      return;
    }
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = (name: string) => gl.getUniformLocation(program, name);
    const uRes = u("uRes"), uTime = u("uTime"), uMouse = u("uMouse"), uHover = u("uHover"), uReveal = u("uReveal"), uDpr = u("uDpr");

    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, hover: 0, thover: 0 };
    let reveal = reduced ? 1 : 0;
    let raf = 0;
    let visible = true;
    let loaded = false;
    const start = performance.now();

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uDpr, dpr);
      if (reduced && loaded) draw(0);
    };

    const draw = (now: number) => {
      const t = (now - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.hover += (mouse.thover - mouse.hover) * 0.06;
      if (!reduced) reveal = Math.min(1, reveal + 0.012);
      gl.uniform1f(uTime, reduced ? 4 : t);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uHover, mouse.hover);
      gl.uniform1f(uReveal, reveal);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const loop = (now: number) => {
      if (visible) draw(now);
      raf = requestAnimationFrame(loop);
    };

    const img = new Image();
    img.src = src;
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      loaded = true;
      resize();
      setReady(true);
      if (reduced) draw(0);
      else raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      const r = wrap.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.thover = 1;
    };
    const onLeave = () => (mouse.thover = 0);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(wrap);
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
  }, [src]);

  return (
    <div ref={wrapRef} className={`isolate overflow-hidden bg-ink ${className}`}>
      {/* static fallback: visible until WebGL is ready or if it never is */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`pixelated absolute inset-x-0 bottom-0 mx-auto h-[98%] w-auto transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      />
      <canvas
        ref={canvasRef}
        aria-hidden
        className={`absolute inset-0 size-full transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { MAP_COLS, MAP_DATA, MAP_ROWS } from "./istanbul-bitmap";

// Geo frame of the bitmap: z11 slippy tiles x 1186.., y 764.. cropped 132px from the top, 12px per cell.
const Z = 11;
const ORIGIN_PX = { x: 1186 * 256, y: 764 * 256 + 132 };
const CELL_PX = 12;

function cellToLatLon(cx: number, cy: number) {
  const n = 256 * 2 ** Z;
  const px = ORIGIN_PX.x + cx * CELL_PX;
  const py = ORIGIN_PX.y + cy * CELL_PX;
  const lon = (px / n) * 360 - 180;
  const lat = (Math.atan(Math.sinh(Math.PI * (1 - (2 * py) / n))) * 180) / Math.PI;
  return { lat, lon };
}

let decoded: Uint8Array | null = null;
function classes() {
  if (decoded) return decoded;
  const bytes = Uint8Array.from(atob(MAP_DATA), (c) => c.charCodeAt(0));
  decoded = new Uint8Array(MAP_COLS * MAP_ROWS);
  for (let i = 0; i < decoded.length; i++) decoded[i] = (bytes[i >> 2] >> ((i & 3) * 2)) & 3;
  return decoded;
}

// water, green, urban
const DOT = [
  { r: 0.14, a: 0.16 },
  { r: 0.26, a: 0.42 },
  { r: 0.38, a: 0.9 },
];

/** Dot-matrix Istanbul rasterized from OpenStreetMap data, with a live lat/lon readout on hover. */
export default function IstanbulMap({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [readout, setReadout] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const data = classes();
    let hover: { x: number; y: number } | null = null;

    const draw = () => {
      const { width: w, height: h } = canvas;
      const cw = w / MAP_COLS;
      const ch = h / MAP_ROWS;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff8df";
      for (const cls of [0, 1, 2]) {
        const { r, a } = DOT[cls];
        ctx.globalAlpha = a;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
          if (data[i] !== cls) continue;
          const x = (i % MAP_COLS) + 0.5;
          const y = ((i / MAP_COLS) | 0) + 0.5;
          ctx.moveTo(x * cw + r * cw, y * ch);
          ctx.arc(x * cw, y * ch, r * cw, 0, Math.PI * 2);
        }
        ctx.fill();
      }
      if (hover) {
        ctx.globalAlpha = 0.5;
        ctx.fillRect(0, (hover.y + 0.5) * ch - 0.5, w, 1);
        ctx.fillRect((hover.x + 0.5) * cw - 0.5, 0, 1, h);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = "#c6ff3d";
        ctx.lineWidth = Math.max(1, cw * 0.15);
        ctx.strokeRect(hover.x * cw - cw, hover.y * ch - ch, cw * 3, ch * 3);
      }
      ctx.globalAlpha = 1;
    };

    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(r.width * dpr);
      canvas.height = Math.round(r.height * dpr);
      draw();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const x = Math.floor(((e.clientX - r.left) / r.width) * MAP_COLS);
      const y = Math.floor(((e.clientY - r.top) / r.height) * MAP_ROWS);
      if (hover && hover.x === x && hover.y === y) return;
      hover = { x, y };
      const { lat, lon } = cellToLatLon(x + 0.5, y + 0.5);
      const kind = ["water", "green", "urban"][data[y * MAP_COLS + x]] ?? "";
      setReadout(`${lat.toFixed(4)}°N ${lon.toFixed(4)}°E · ${kind}`);
      draw();
    };
    const onLeave = () => {
      hover = null;
      setReadout(null);
      draw();
    };

    const ro = new ResizeObserver(size);
    ro.observe(canvas);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    return () => {
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <figure className={className}>
      <canvas
        ref={canvasRef}
        className="block w-full cursor-crosshair"
        style={{ aspectRatio: `${MAP_COLS} / ${MAP_ROWS}` }}
        role="img"
        aria-label="Dot map of Istanbul: the Bosphorus, Golden Horn, Princes' Islands and the Marmara coast"
      />
      <figcaption className="hud-label mt-2 flex flex-wrap justify-between gap-x-4 gap-y-1 text-[11px] text-cream-mute">
        <span className="font-mono tabular-nums text-cream-dim">{readout ?? "Istanbul · hover to read coordinates"}</span>
        <span>Map data © OpenStreetMap contributors</span>
      </figcaption>
    </figure>
  );
}

export const CREAM = "#fff8df";
export const INK = "#1b1b1b";
export const SIGNAL = "#c6ff3d";

export type Mode = "demo" | "play" | "over";

export type Hud = { left: string; right: string; mode: Mode };

export type GameApi = {
  setHud: (hud: Hud) => void;
  /** CSS font-family lists resolved from the next/font variables. */
  fonts: { pixel: string; dot: string };
  best: { get: () => number; set: (score: number) => void };
};

/** A game works in CSS pixels; the host handles DPR, the loop, visibility and input routing. */
export type Game = {
  resize: (w: number, h: number) => void;
  update: (dt: number) => void;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  /** Return true when the key was consumed (the host then prevents page scrolling). */
  key?: (e: KeyboardEvent, down: boolean) => boolean;
  pointer?: (kind: "down" | "move" | "up", x: number, y: number) => void;
  /** While true the canvas captures touch gestures instead of letting the page scroll. */
  capturesTouch?: () => boolean;
};

export type GameFactory = (api: GameApi) => Game;

export const pad = (n: number, len: number) => String(Math.max(0, Math.floor(n))).padStart(len, "0");

export function centerText(
  ctx: CanvasRenderingContext2D,
  lines: [string, number, number?][],
  w: number,
  y: number,
  font: string,
) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let yy = y;
  for (const [text, size, alpha = 1] of lines) {
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px ${font}`;
    ctx.fillText(text, w / 2, yy);
    yy += size * 1.5;
  }
  ctx.globalAlpha = 1;
}

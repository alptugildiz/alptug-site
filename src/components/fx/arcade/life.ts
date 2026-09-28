import { CREAM, pad, type GameFactory } from "./types";

const CELL = 8;
const TICK = 0.085;
const HISTORY = 12; // detects still lifes and oscillators up to period 12
const STALE_LIMIT = 36; // generations of repetition before something new is injected

type Cells = [number, number][];

const GLIDER_GUN: Cells = [
  [1, 5], [1, 6], [2, 5], [2, 6], [11, 5], [11, 6], [11, 7], [12, 4], [12, 8], [13, 3], [13, 9], [14, 3],
  [14, 9], [15, 6], [16, 4], [16, 8], [17, 5], [17, 6], [17, 7], [18, 6], [21, 3], [21, 4], [21, 5], [22, 3],
  [22, 4], [22, 5], [23, 2], [23, 6], [25, 1], [25, 2], [25, 6], [25, 7], [35, 3], [35, 4], [36, 3], [36, 4],
];

// long-lived "methuselahs" and a glider, dropped in whenever the board settles
const INJECT: Cells[] = [
  [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]], // R-pentomino
  [[1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2]], // acorn
  [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]], // glider
];

/** Conway's Game of Life with stagnation detection and pointer drawing. */
export const life: GameFactory = (api) => {
  let cols = 0, rows = 0;
  let cells = new Uint8Array(0);
  let next = new Uint8Array(0);
  let glow = new Float32Array(0);
  const history: number[] = [];
  let gen = 0, stale = 0, acc = 0;
  let seeded = false;
  let drawing = false;

  const place = (pattern: Cells, ox: number, oy: number) => {
    for (const [x, y] of pattern) {
      const cx = x + ox, cy = y + oy;
      if (cx >= 0 && cx < cols && cy >= 0 && cy < rows) cells[cy * cols + cx] = 1;
    }
  };
  const count = () => cells.reduce((s, v) => s + v, 0);
  const inject = () => {
    const pattern = INJECT[(Math.random() * INJECT.length) | 0];
    const m = Math.min(6, Math.floor(Math.min(cols, rows) / 4));
    place(pattern, m + ((Math.random() * Math.max(1, cols - 2 * m - 7)) | 0), m + ((Math.random() * Math.max(1, rows - 2 * m - 3)) | 0));
    history.length = 0;
    stale = 0;
  };
  // FNV-1a over the board; identical boards hash identically
  const hash = () => {
    let h = 2166136261;
    for (let i = 0; i < cells.length; i++) h = Math.imul(h ^ cells[i], 16777619);
    return h >>> 0;
  };
  const report = () =>
    api.setHud({ left: `gen ${pad(gen, 5)}  pop ${pad(count(), 4)}`, right: "drag to draw", mode: "demo" });

  const step = () => {
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        let n = 0;
        // dead boundary: gliders leave the board instead of wrapping back into the gun
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= rows) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if ((dx || dy) && xx >= 0 && xx < cols) n += cells[yy * cols + xx];
          }
        }
        const i = y * cols + x;
        next[i] = n === 3 || (n === 2 && cells[i]) ? 1 : 0;
      }
    [cells, next] = [next, cells];
    gen++;
    const h = hash();
    stale = history.includes(h) ? stale + 1 : 0;
    history.push(h);
    if (history.length > HISTORY) history.shift();
    if (stale >= STALE_LIMIT || count() === 0) inject();
  };

  const paint = (px: number, py: number) => {
    const x = Math.floor(px / CELL), y = Math.floor(py / CELL);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && xx < cols && yy >= 0 && yy < rows && Math.random() > 0.4) cells[yy * cols + xx] = 1;
      }
    history.length = 0;
    stale = 0;
  };

  return {
    // resize keeps whatever overlaps the previous board
    resize(w, h) {
      const nc = Math.max(8, Math.floor(w / CELL));
      const nr = Math.max(8, Math.floor(h / CELL));
      if (nc === cols && nr === rows) return;
      const nextCells = new Uint8Array(nc * nr);
      const nextGlow = new Float32Array(nc * nr);
      for (let y = 0; y < Math.min(rows, nr); y++)
        for (let x = 0; x < Math.min(cols, nc); x++) {
          nextCells[y * nc + x] = cells[y * cols + x];
          nextGlow[y * nc + x] = glow[y * cols + x];
        }
      cols = nc;
      rows = nr;
      cells = nextCells;
      glow = nextGlow;
      next = new Uint8Array(nc * nr);
      history.length = 0;
      if (!seeded) {
        seeded = true;
        if (cols >= 40 && rows >= 12) place(GLIDER_GUN, 3, 3);
        else inject();
        report();
      }
    },
    update(dt) {
      acc += dt;
      while (acc >= TICK) {
        acc -= TICK;
        step();
        if (gen % 4 === 0) report();
      }
    },
    draw(ctx, w, h) {
      const cw = w / cols, ch = h / rows;
      ctx.fillStyle = CREAM;
      for (let i = 0; i < cells.length; i++) {
        const alive = cells[i];
        glow[i] = alive ? 1 : glow[i] * 0.84; // afterglow trail
        if (glow[i] < 0.04) continue;
        ctx.globalAlpha = alive ? 1 : glow[i] * 0.32;
        const x = i % cols, y = (i / cols) | 0;
        ctx.fillRect(x * cw + cw * 0.12, y * ch + ch * 0.12, cw * 0.76, ch * 0.76);
      }
      ctx.globalAlpha = 1;
    },
    pointer(kind, x, y) {
      if (kind === "down") drawing = true;
      if (kind === "up") drawing = false;
      if (drawing && kind !== "up") paint(x, y);
    },
    capturesTouch: () => true,
  };
};

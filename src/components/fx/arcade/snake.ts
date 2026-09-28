import { centerText, CREAM, pad, SIGNAL, type GameFactory, type Mode } from "./types";

const CELL = 12;
type P = { x: number; y: number };

const DIRS: Record<string, P> = {
  ArrowUp: { x: 0, y: -1 }, KeyW: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 }, KeyS: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 }, KeyA: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 }, KeyD: { x: 1, y: 0 },
};
const ALL: P[] = [{ x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }];

/** Snake. Plays itself (greedy + flood-fill safety) until someone presses a direction. */
export const snake: GameFactory = (api) => {
  let cols = 0, rows = 0;
  let body: P[] = [];
  let dir: P = { x: 1, y: 0 };
  let queued: P[] = [];
  let food: P = { x: 0, y: 0 };
  let mode: Mode = "demo";
  let acc = 0, overTimer = 0, score = 0;
  let best = api.best.get();
  let swipe: P | null = null;

  const occupied = (x: number, y: number, ignoreTail = true) => {
    const n = ignoreTail ? body.length - 1 : body.length;
    for (let i = 0; i < n; i++) if (body[i].x === x && body[i].y === y) return true;
    return false;
  };
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows;

  const placeFood = () => {
    for (let tries = 0; tries < 500; tries++) {
      const x = (Math.random() * cols) | 0, y = (Math.random() * rows) | 0;
      if (!occupied(x, y, false)) {
        food = { x, y };
        return;
      }
    }
  };

  const reset = (m: Mode) => {
    mode = m;
    const cx = (cols / 2) | 0, cy = (rows / 2) | 0;
    body = [0, 1, 2, 3].map((i) => ({ x: cx - i, y: cy }));
    dir = { x: 1, y: 0 };
    queued = [];
    score = 0;
    placeFood();
    report();
  };

  const report = () =>
    api.setHud({
      left: `score ${pad(score, 3)}  best ${pad(best, 3)}`,
      right: mode === "demo" ? "demo · press an arrow key or swipe" : mode === "play" ? "playing" : "game over",
      mode,
    });

  // cells reachable from (sx, sy) without crossing the body, capped at `limit`
  const space = (sx: number, sy: number, limit: number) => {
    const seen = new Uint8Array(cols * rows);
    for (let i = 0; i < body.length - 1; i++) seen[body[i].y * cols + body[i].x] = 1;
    const stack = [sy * cols + sx];
    seen[stack[0]] = 1;
    let n = 0;
    while (stack.length && n < limit) {
      const c = stack.pop()!;
      n++;
      const x = c % cols, y = (c / cols) | 0;
      for (const d of ALL) {
        const nx = x + d.x, ny = y + d.y;
        if (!inside(nx, ny)) continue;
        const k = ny * cols + nx;
        if (!seen[k]) {
          seen[k] = 1;
          stack.push(k);
        }
      }
    }
    return n;
  };

  const aiDir = () => {
    const head = body[0];
    let bestD = dir, bestScore = -Infinity;
    for (const d of ALL) {
      if (d.x === -dir.x && d.y === -dir.y) continue;
      const nx = head.x + d.x, ny = head.y + d.y;
      if (!inside(nx, ny) || occupied(nx, ny)) continue;
      const room = space(nx, ny, body.length * 3);
      const s = -(Math.abs(nx - food.x) + Math.abs(ny - food.y)) + (room < body.length + 2 ? -1000 : 0) + room * 0.01;
      if (s > bestScore) {
        bestScore = s;
        bestD = d;
      }
    }
    return bestD;
  };

  const tick = () => {
    if (mode === "demo") dir = aiDir();
    else if (queued.length) dir = queued.shift()!;
    const head = { x: body[0].x + dir.x, y: body[0].y + dir.y };
    if (!inside(head.x, head.y) || occupied(head.x, head.y)) {
      if (mode === "play") {
        mode = "over";
        overTimer = 2.4;
        if (score > best) {
          best = score;
          api.best.set(best);
        }
        report();
      } else reset("demo");
      return;
    }
    body.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score++;
      placeFood();
      report();
      if (mode === "demo" && body.length > (cols * rows) / 4) reset("demo");
    } else body.pop();
  };

  const input = (d: P) => {
    if (mode !== "play") {
      reset("play");
      dir = d.x === -1 ? { x: 1, y: 0 } : d; // never start by reversing into the body
      return;
    }
    const last = queued[queued.length - 1] ?? dir;
    if (d.x === -last.x && d.y === -last.y) return;
    if (d.x === last.x && d.y === last.y) return;
    if (queued.length < 3) queued.push(d);
  };

  return {
    resize(w, h) {
      const nc = Math.max(10, Math.floor(w / CELL)), nr = Math.max(10, Math.floor(h / CELL));
      if (nc === cols && nr === rows) return;
      cols = nc;
      rows = nr;
      reset(mode === "play" ? "play" : "demo");
    },
    update(dt) {
      if (mode === "over") {
        overTimer -= dt;
        if (overTimer <= 0) reset("demo");
        return;
      }
      acc += dt;
      const speed = mode === "play" ? Math.max(0.055, 0.1 - score * 0.002) : 0.06;
      while (acc >= speed) {
        acc -= speed;
        tick();
      }
    },
    draw(ctx, w, h, t) {
      const cw = w / cols, ch = h / rows;
      // board lattice
      ctx.fillStyle = CREAM;
      ctx.globalAlpha = 0.06;
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) ctx.fillRect(x * cw + cw / 2 - 0.5, y * ch + ch / 2 - 0.5, 1, 1);
      // food
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(t * 8);
      ctx.fillStyle = SIGNAL;
      ctx.fillRect(food.x * cw + cw * 0.15, food.y * ch + ch * 0.15, cw * 0.7, ch * 0.7);
      // body fades toward the tail
      ctx.fillStyle = CREAM;
      body.forEach((p, i) => {
        ctx.globalAlpha = i === 0 ? 1 : Math.max(0.35, 0.9 - (i / body.length) * 0.55);
        ctx.fillRect(p.x * cw + cw * 0.08, p.y * ch + ch * 0.08, cw * 0.84, ch * 0.84);
      });
      ctx.globalAlpha = 1;
      if (mode === "over") {
        ctx.fillStyle = CREAM;
        centerText(ctx, [["GAME OVER", 22], [`score ${score} · best ${best}`, 13, 0.7]], w, h / 2 - 12, api.fonts.pixel);
      } else if (mode === "demo" && Math.floor(t * 1.5) % 2 === 0) {
        ctx.fillStyle = CREAM;
        centerText(ctx, [["PRESS ← ↑ → ↓ OR SWIPE", 13, 0.8]], w, h - 48, api.fonts.pixel);
      }
    },
    key(e, down) {
      const d = DIRS[e.code];
      if (!d) return false;
      if (down) input(d);
      return true;
    },
    pointer(kind, x, y) {
      if (kind === "down") swipe = { x, y };
      if (kind === "up" && swipe) {
        const dx = x - swipe.x, dy = y - swipe.y;
        swipe = null;
        if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) {
          if (mode !== "play") input({ x: 1, y: 0 }); // tap starts a game
          return;
        }
        input(Math.abs(dx) > Math.abs(dy) ? { x: Math.sign(dx), y: 0 } : { x: 0, y: Math.sign(dy) });
      }
    },
    capturesTouch: () => mode === "play",
  };
};

import { centerText, CREAM, pad, SIGNAL, type GameFactory, type Mode } from "./types";

const ROWS = 5;
const GAP = 3;
const TOP = 18;
const BALL = 7;

type Brick = { x: number; y: number; w: number; h: number; row: number; alive: boolean };

/** Breakout. The paddle tracks the ball on its own until someone clicks, taps or presses Space. */
export const breakout: GameFactory = (api) => {
  let W = 0, H = 0;
  let bricks: Brick[] = [];
  const paddle = { x: 0, w: 80, h: 8, target: 0 };
  const ball = { x: 0, y: 0, vx: 0, vy: 0, stuck: true };
  let mode: Mode = "demo";
  let score = 0, lives = 3, level = 1, overTimer = 0;
  let best = api.best.get();
  const held = { left: false, right: false };

  const paddleY = () => H - 46;
  const speed = () => Math.min(520, (Math.max(240, H * 0.75)) * (1 + (level - 1) * 0.08));

  const build = () => {
    const cols = Math.max(6, Math.floor((W - 24) / 46));
    const bw = (W - 24 - GAP * (cols - 1)) / cols;
    bricks = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < cols; c++) bricks.push({ x: 12 + c * (bw + GAP), y: TOP + r * (10 + GAP), w: bw, h: 10, row: r, alive: true });
  };

  const serve = () => {
    ball.stuck = true;
    ball.x = paddle.x + paddle.w / 2;
    ball.y = paddleY() - BALL;
    ball.vx = 0;
    ball.vy = 0;
  };
  const launch = () => {
    if (!ball.stuck) return;
    ball.stuck = false;
    const a = (-Math.PI / 2) + (Math.random() - 0.5) * 0.9;
    ball.vx = Math.cos(a) * speed();
    ball.vy = Math.sin(a) * speed();
  };

  const report = () =>
    api.setHud({
      left: `score ${pad(score, 4)}  best ${pad(best, 4)}`,
      right:
        mode === "demo" ? "demo · click, tap or press space" : mode === "play" ? `lives ${"■".repeat(lives)}` : "game over",
      mode,
    });

  const reset = (m: Mode) => {
    mode = m;
    score = 0;
    lives = 3;
    level = 1;
    paddle.w = Math.max(56, Math.min(110, W * 0.18));
    paddle.x = paddle.target = (W - paddle.w) / 2;
    build();
    serve();
    if (m === "demo") launch();
    report();
  };

  const lose = () => {
    if (mode === "demo") return reset("demo");
    lives--;
    if (lives <= 0) {
      mode = "over";
      overTimer = 2.4;
      if (score > best) {
        best = score;
        api.best.set(best);
      }
    } else serve();
    report();
  };

  const hitBricks = () => {
    for (const b of bricks) {
      if (!b.alive) continue;
      if (ball.x + BALL / 2 < b.x || ball.x - BALL / 2 > b.x + b.w || ball.y + BALL / 2 < b.y || ball.y - BALL / 2 > b.y + b.h) continue;
      b.alive = false;
      score += (ROWS - b.row) * 10;
      // reflect on the axis with the smaller overlap
      const ox = Math.min(ball.x + BALL / 2 - b.x, b.x + b.w - (ball.x - BALL / 2));
      const oy = Math.min(ball.y + BALL / 2 - b.y, b.y + b.h - (ball.y - BALL / 2));
      if (ox < oy) ball.vx *= -1;
      else ball.vy *= -1;
      report();
      if (bricks.every((x) => !x.alive)) {
        level++;
        build();
        serve();
        if (mode === "demo") launch();
      }
      return;
    }
  };

  return {
    resize(w, h) {
      const first = W === 0;
      W = w;
      H = h;
      if (first || mode !== "play") reset(mode === "over" ? "demo" : mode);
      else build();
    },
    update(dt) {
      if (mode === "over") {
        overTimer -= dt;
        if (overTimer <= 0) reset("demo");
        return;
      }
      // paddle
      if (mode === "demo") paddle.target = ball.x - paddle.w / 2 + Math.sin(performance.now() / 700) * paddle.w * 0.3;
      else if (held.left || held.right) paddle.target = paddle.x + (held.right ? 1 : -1) * 520 * dt;
      paddle.target = Math.max(0, Math.min(W - paddle.w, paddle.target));
      paddle.x += (paddle.target - paddle.x) * Math.min(1, dt * (mode === "demo" ? 9 : 22));

      if (ball.stuck) {
        ball.x = paddle.x + paddle.w / 2;
        ball.y = paddleY() - BALL;
        return;
      }
      // sub-step so a fast ball can't tunnel through a brick
      const steps = Math.ceil((Math.hypot(ball.vx, ball.vy) * dt) / 4);
      for (let s = 0; s < steps; s++) {
        ball.x += (ball.vx * dt) / steps;
        ball.y += (ball.vy * dt) / steps;
        if (ball.x < BALL / 2 || ball.x > W - BALL / 2) {
          ball.vx *= -1;
          ball.x = Math.max(BALL / 2, Math.min(W - BALL / 2, ball.x));
        }
        if (ball.y < BALL / 2) {
          ball.vy = Math.abs(ball.vy);
        }
        const py = paddleY();
        if (ball.vy > 0 && ball.y + BALL / 2 >= py && ball.y + BALL / 2 <= py + paddle.h + 4 && ball.x >= paddle.x - 4 && ball.x <= paddle.x + paddle.w + 4) {
          // hit position steers the bounce angle
          const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2);
          const a = -Math.PI / 2 + hit * 1.05;
          const v = speed();
          ball.vx = Math.cos(a) * v;
          ball.vy = Math.sin(a) * v;
          ball.y = py - BALL / 2;
        }
        hitBricks();
        if (ball.y > H + BALL) {
          lose();
          return;
        }
      }
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = CREAM;
      for (const b of bricks) {
        if (!b.alive) continue;
        ctx.globalAlpha = 1 - b.row * 0.14;
        ctx.fillRect(b.x, b.y, b.w, b.h);
      }
      ctx.globalAlpha = 1;
      ctx.fillRect(paddle.x, paddleY(), paddle.w, paddle.h);
      ctx.fillStyle = SIGNAL;
      ctx.fillRect(ball.x - BALL / 2, ball.y - BALL / 2, BALL, BALL);
      ctx.fillStyle = CREAM;
      if (mode === "over") {
        centerText(ctx, [["GAME OVER", 22], [`score ${score} · best ${best}`, 13, 0.7]], w, h / 2, api.fonts.pixel);
      } else if (mode === "demo" && Math.floor(t * 1.5) % 2 === 0) {
        centerText(ctx, [["CLICK OR PRESS SPACE TO PLAY", 13, 0.8]], w, h / 2 + 20, api.fonts.pixel);
      } else if (mode === "play" && ball.stuck) {
        centerText(ctx, [["CLICK OR SPACE TO LAUNCH", 12, 0.6]], w, h / 2 + 20, api.fonts.pixel);
      }
    },
    key(e, down) {
      if (e.code === "ArrowLeft" || e.code === "KeyA") held.left = down;
      else if (e.code === "ArrowRight" || e.code === "KeyD") held.right = down;
      else if (e.code === "Space") {
        if (down) {
          if (mode !== "play") reset("play");
          else launch();
        }
      } else return false;
      if (down && mode !== "play" && e.code !== "Space") reset("play");
      return true;
    },
    pointer(kind, x) {
      if (mode === "play") paddle.target = x - paddle.w / 2;
      if (kind === "down") {
        if (mode !== "play") {
          reset("play");
          paddle.target = x - paddle.w / 2;
        } else launch();
      }
    },
    capturesTouch: () => mode === "play",
  };
};

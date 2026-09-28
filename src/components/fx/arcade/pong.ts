import { centerText, CREAM, SIGNAL, type GameFactory, type Mode } from "./types";

const PW = 8;
const BALL = 8;
const WIN = 7;

/** Pong against a CPU with a speed cap. Two CPUs rally until someone moves the left paddle. */
export const pong: GameFactory = (api) => {
  let W = 0, H = 0;
  let mode: Mode = "demo";
  let ph = 60;
  const left = { y: 0, target: 0 };
  const right = { y: 0 };
  const ball = { x: 0, y: 0, vx: 0, vy: 0 };
  let you = 0, cpu = 0, serveTimer = 0, overTimer = 0;
  let best = api.best.get();
  const held = { up: false, down: false };

  const baseSpeed = () => Math.max(260, W * 0.55);

  const report = () =>
    api.setHud({
      left: mode === "demo" ? `cpu ${you} : ${cpu} cpu` : `you ${you} : ${cpu} cpu`,
      right: mode === "demo" ? "demo · click or press ↑ ↓ to play" : mode === "play" ? `first to ${WIN} · best ${best}` : you === WIN ? "you win" : "cpu wins",
      mode,
    });

  const serve = (towards: 1 | -1) => {
    ball.x = W / 2;
    ball.y = H / 2;
    const a = (Math.random() - 0.5) * 0.8;
    ball.vx = Math.cos(a) * baseSpeed() * towards;
    ball.vy = Math.sin(a) * baseSpeed();
    serveTimer = 0.6;
  };

  const reset = (m: Mode) => {
    mode = m;
    you = cpu = 0;
    left.y = left.target = right.y = (H - ph) / 2;
    serve(Math.random() < 0.5 ? 1 : -1);
    report();
  };

  const cpuMove = (p: { y: number }, dt: number, maxSpeed: number, towardsMe: boolean) => {
    const target = towardsMe ? ball.y - ph / 2 : (H - ph) / 2;
    const d = target - p.y;
    p.y += Math.sign(d) * Math.min(Math.abs(d), maxSpeed * dt);
    p.y = Math.max(0, Math.min(H - ph, p.y));
  };

  const point = (toYou: boolean) => {
    if (toYou) you++;
    else cpu++;
    if (mode === "play" && (you >= WIN || cpu >= WIN)) {
      mode = "over";
      overTimer = 2.6;
      if (you > best) {
        best = you;
        api.best.set(best);
      }
    } else if (mode === "demo" && (you >= WIN || cpu >= WIN)) {
      you = cpu = 0;
    }
    report();
    serve(toYou ? 1 : -1);
  };

  const takeOver = () => {
    if (mode !== "play") reset("play");
  };

  return {
    resize(w, h) {
      const first = W === 0;
      W = w;
      H = h;
      ph = Math.max(40, Math.min(90, h * 0.2));
      if (first) reset("demo");
    },
    update(dt) {
      if (mode === "over") {
        overTimer -= dt;
        if (overTimer <= 0) reset("demo");
        return;
      }
      // left paddle: player or cpu
      if (mode === "play") {
        if (held.up || held.down) left.target = left.y + (held.down ? 1 : -1) * 420 * dt;
        left.target = Math.max(0, Math.min(H - ph, left.target));
        left.y += (left.target - left.y) * Math.min(1, dt * 20);
      } else cpuMove(left, dt, 300, ball.vx < 0);
      cpuMove(right, dt, mode === "play" ? 250 : 300, ball.vx > 0);

      if (serveTimer > 0) {
        serveTimer -= dt;
        return;
      }
      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;
      if (ball.y < BALL / 2 || ball.y > H - BALL / 2) {
        ball.vy *= -1;
        ball.y = Math.max(BALL / 2, Math.min(H - BALL / 2, ball.y));
      }
      const lx = 16 + PW, rx = W - 16 - PW;
      const bounce = (py: number, dirX: 1 | -1) => {
        const hit = (ball.y - (py + ph / 2)) / (ph / 2);
        const v = Math.min(Math.hypot(ball.vx, ball.vy) * 1.05, baseSpeed() * 2);
        const a = hit * 0.9;
        ball.vx = Math.cos(a) * v * dirX;
        ball.vy = Math.sin(a) * v;
      };
      if (ball.vx < 0 && ball.x - BALL / 2 <= lx && ball.x > 16 && ball.y >= left.y - 4 && ball.y <= left.y + ph + 4) {
        ball.x = lx + BALL / 2;
        bounce(left.y, 1);
      }
      if (ball.vx > 0 && ball.x + BALL / 2 >= rx && ball.x < W - 16 && ball.y >= right.y - 4 && ball.y <= right.y + ph + 4) {
        ball.x = rx - BALL / 2;
        bounce(right.y, -1);
      }
      if (ball.x < -BALL) point(false);
      if (ball.x > W + BALL) point(true);
    },
    draw(ctx, w, h, t) {
      ctx.fillStyle = CREAM;
      // center net
      ctx.globalAlpha = 0.25;
      for (let y = 6; y < h; y += 16) ctx.fillRect(w / 2 - 1, y, 2, 8);
      // scores
      ctx.globalAlpha = 0.18;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.font = `900 ${Math.round(Math.min(72, h * 0.22))}px ${api.fonts.dot}`;
      ctx.fillText(String(you), w * 0.3, 16);
      ctx.fillText(String(cpu), w * 0.7, 16);
      ctx.globalAlpha = 1;
      ctx.fillRect(16, left.y, PW, ph);
      ctx.fillRect(w - 16 - PW, right.y, PW, ph);
      ctx.fillStyle = SIGNAL;
      ctx.fillRect(ball.x - BALL / 2, ball.y - BALL / 2, BALL, BALL);
      ctx.fillStyle = CREAM;
      if (mode === "over") {
        centerText(ctx, [[you >= WIN ? "YOU WIN" : "CPU WINS", 22], [`${you} : ${cpu}`, 13, 0.7]], w, h / 2, api.fonts.pixel);
      } else if (mode === "demo" && Math.floor(t * 1.5) % 2 === 0) {
        centerText(ctx, [["CLICK OR PRESS ↑ ↓ TO PLAY", 13, 0.8]], w, h - 48, api.fonts.pixel);
      }
    },
    key(e, down) {
      if (e.code === "ArrowUp" || e.code === "KeyW") held.up = down;
      else if (e.code === "ArrowDown" || e.code === "KeyS") held.down = down;
      else return false;
      if (down) takeOver();
      return true;
    },
    pointer(kind, _x, y) {
      if (kind === "down") takeOver();
      if (mode === "play") left.target = y - ph / 2;
    },
    capturesTouch: () => mode === "play",
  };
};

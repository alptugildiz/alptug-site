"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ARCADE_SELECT } from "@/components/hud/CommandPalette";
import { prefersReducedMotion } from "@/lib/gsap";
import { breakout } from "./breakout";
import { life } from "./life";
import { pong } from "./pong";
import { snake } from "./snake";
import type { Game, GameFactory, Hud } from "./types";

type GameDef = {
  id: string;
  label: string;
  factory: GameFactory;
  title: string;
  about: string;
  controls: [string, string][];
};

const GAMES: GameDef[] = [
  {
    id: "life",
    label: "Life",
    factory: life,
    title: "Game of Life · John Conway, 1970",
    about:
      "A zero-player simulation. Each cell checks its eight neighbours: fewer than 2 dies, 2–3 survives, more than 3 dies, exactly 3 around an empty cell is born. It reseeds itself when the board settles.",
    controls: [["drag", "draw live cells"]],
  },
  {
    id: "snake",
    label: "Snake",
    factory: snake,
    title: "Snake",
    about:
      "Eat the green pixel, don't hit the walls or yourself. While idle it plays itself: greedy toward the food, with a flood-fill check so it doesn't trap itself.",
    controls: [
      ["← ↑ → ↓ / WASD", "steer"],
      ["swipe", "steer on touch"],
    ],
  },
  {
    id: "breakout",
    label: "Breakout",
    factory: breakout,
    title: "Breakout",
    about:
      "Clear the wall. Where the ball hits the paddle sets its bounce angle; each cleared wall speeds things up. Idle, the paddle chases the ball on its own.",
    controls: [
      ["mouse / touch", "move paddle"],
      ["← → / A D", "move paddle"],
      ["click / space", "start, launch"],
    ],
  },
  {
    id: "pong",
    label: "Pong",
    factory: pong,
    title: "Pong",
    about:
      "First to 7 against a CPU with a speed cap, so it's beatable. The ball speeds up on every hit. Idle, two CPUs rally.",
    controls: [
      ["mouse / touch", "move left paddle"],
      ["↑ ↓ / W S", "move left paddle"],
    ],
  },
];

function cssFont(variable: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v || fallback;
}

function bestStore(id: string) {
  const key = `arcade:best:${id}`;
  return {
    get: () => {
      try {
        return Number(localStorage.getItem(key)) || 0;
      } catch {
        return 0;
      }
    },
    set: (n: number) => {
      try {
        localStorage.setItem(key, String(n));
      } catch {}
    },
  };
}

/** Hosts the mini games: one canvas, one loop, input routed to whichever game is active. */
export default function Arcade({ className = "" }: { className?: string }) {
  const [active, setActive] = useState(0);
  const [hud, setHud] = useState<Hud>({ left: "", right: "", mode: "demo" });
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const infoId = useId();
  const def = GAMES[active];

  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = prefersReducedMotion();
    let lastHud = "";
    const game: Game = GAMES[active].factory({
      setHud: (h) => {
        const k = `${h.left}|${h.right}|${h.mode}`;
        if (k === lastHud) return;
        lastHud = k;
        setHud(h);
      },
      fonts: {
        pixel: cssFont("--font-pixelify", "monospace"),
        dot: cssFont("--font-doto", "monospace"),
      },
      best: bestStore(GAMES[active].id),
    });

    let w = 0, h = 0, dpr = 1;
    const size = () => {
      const r = wrap.getBoundingClientRect();
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      game.resize(w, h);
    };
    const render = (t: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      game.draw(ctx, w, h, t);
    };

    let visible = true;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      // reduced motion: only advance while the visitor is actually playing
      const run = visible && (!reduced || game.capturesTouch?.());
      if (run) game.update(dt);
      if (visible) render(now / 1000);
      canvas.style.touchAction = game.capturesTouch?.() ? "none" : "pan-y";
      raf = requestAnimationFrame(loop);
    };

    const local = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top] as const;
    };
    const onDown = (e: PointerEvent) => {
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(e.pointerId);
      game.pointer?.("down", ...local(e));
    };
    const onMove = (e: PointerEvent) => game.pointer?.("move", ...local(e));
    const onUp = (e: PointerEvent) => game.pointer?.("up", ...local(e));
    // keys only reach the game while the canvas has focus, so arrows still scroll the page otherwise
    const onKey = (down: boolean) => (e: KeyboardEvent) => {
      if (game.key?.(e, down)) e.preventDefault();
    };
    const keyDown = onKey(true);
    const keyUp = onKey(false);

    size();
    render(0);
    raf = requestAnimationFrame(loop);
    const ro = new ResizeObserver(size);
    ro.observe(wrap);
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(wrap);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    canvas.addEventListener("keydown", keyDown);
    canvas.addEventListener("keyup", keyUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      canvas.removeEventListener("keydown", keyDown);
      canvas.removeEventListener("keyup", keyUp);
    };
  }, [active]);

  // the command palette can switch games and hand focus to the canvas
  useEffect(() => {
    const onSelect = (e: Event) => {
      const i = GAMES.findIndex((g) => g.id === (e as CustomEvent<string>).detail);
      if (i === -1) return;
      setActive(i);
      requestAnimationFrame(() => canvasRef.current?.focus({ preventScroll: true }));
    };
    window.addEventListener(ARCADE_SELECT, onSelect);
    return () => window.removeEventListener(ARCADE_SELECT, onSelect);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className={`isolate flex flex-col ${className}`}>
      <div className="flex items-stretch border-b border-line">
        <div role="tablist" aria-label="Mini games" className="flex flex-1 items-stretch divide-x divide-line-soft overflow-x-auto [scrollbar-width:none]">
          {GAMES.map((g, i) => (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-controls={`${infoId}-panel`}
              onClick={() => setActive(i)}
              className={`hud-label px-3 text-[11px] transition-colors sm:px-4 ${
                i === active ? "bg-cream text-ink" : "text-cream-dim hover:bg-cream/10 hover:text-cream"
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
          <button
            type="button"
            aria-label={`About ${def.label}`}
            aria-expanded={open}
            aria-controls={infoId}
            // open-only: hover already opened it on desktop, a toggle would close it again;
            // on touch, tapping elsewhere blurs the button and closes it
            onClick={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            className="grid size-10 place-items-center bg-signal font-display text-base font-black text-ink transition-colors hover:bg-cream"
          >
            ?
          </button>
          <div
            id={infoId}
            role="tooltip"
            className={`absolute top-full right-0 z-20 w-[min(320px,80vw)] border border-signal bg-ink p-4 text-left shadow-[0_12px_40px_rgb(0_0_0/0.5)] transition-[opacity,translate] duration-200 ${
              open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
            }`}
          >
            <p className="hud-label text-[11px] text-signal">arcade.exe · {String(active + 1).padStart(2, "0")}/{String(GAMES.length).padStart(2, "0")}</p>
            <p className="mt-1.5 font-display text-sm font-black tracking-tight uppercase">{def.title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-cream-dim">{def.about}</p>
            <ul className="mt-3 divide-y divide-line-soft border-y border-line-soft">
              {def.controls.map(([k, v]) => (
                <li key={k} className="flex gap-3 py-1.5 text-[12px] text-cream-dim">
                  <span className="w-28 shrink-0 font-mono text-cream">{k}</span>
                  {v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div ref={wrapRef} id={`${infoId}-panel`} role="tabpanel" className="relative min-h-0 flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          tabIndex={0}
          className="absolute inset-0 size-full cursor-crosshair outline-none focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-signal"
          role="application"
          aria-label={`${def.title}. ${def.about} Controls: ${def.controls.map(([k, v]) => `${k} to ${v}`).join(", ")}.`}
        />
        <div className="hud-label pointer-events-none absolute inset-x-0 bottom-0 flex justify-between gap-4 bg-gradient-to-t from-ink via-ink/80 to-transparent px-4 pt-6 pb-3 text-[11px] text-cream-mute">
          <span className="font-mono tabular-nums text-cream-dim">{hud.left}</span>
          <span className={`truncate ${hud.mode === "play" ? "text-signal" : ""}`}>{hud.right}</span>
        </div>
      </div>
    </div>
  );
}

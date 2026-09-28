"use client";

import { useEffect, useRef, useState } from "react";
import { BOOT_KEY as KEY } from "@/lib/boot";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const LINES = [
  "BIOS v2.026 // ALPTUG.SYS",
  "MOUNTING /experience ........ OK",
  "LOADING react@19 next@16 ts@5 . OK",
  "CALIBRATING TASTE ............ OK",
  "COMPILING SHADERS ............ OK",
];

export function onBootDone(cb: () => void) {
  if (document.documentElement.dataset.boot === "done") {
    cb();
    return () => {};
  }
  window.addEventListener("boot:done", cb, { once: true });
  return () => window.removeEventListener("boot:done", cb);
}

export default function BootSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = rootRef.current!;
    const html = document.documentElement;
    const finish = () => {
      html.dataset.boot = "done";
      try {
        sessionStorage.setItem(KEY, "1");
      } catch {}
      window.dispatchEvent(new Event("boot:done"));
    };

    if (html.dataset.boot === "done" || prefersReducedMotion()) {
      finish(); // CSS hides the overlay once data-boot is set
      return;
    }

    const lines = root.querySelectorAll<HTMLElement>("[data-line]");
    const bar = root.querySelector<HTMLElement>("[data-bar]")!;
    const pct = root.querySelector<HTMLElement>("[data-pct]")!;
    const progress = { v: 0 };

    const tl = gsap.timeline({
      onComplete: () => setGone(true),
    });
    tl.set(lines, { autoAlpha: 0 })
      .to(lines, { autoAlpha: 1, duration: 0.01, stagger: 0.17 })
      .to(
        progress,
        {
          v: 100,
          duration: 1.1,
          ease: "steps(20)",
          onUpdate: () => {
            bar.style.transform = `scaleX(${progress.v / 100})`;
            pct.textContent = String(Math.round(progress.v)).padStart(3, "0");
          },
        },
        0,
      )
      .add(finish, "+=0.1")
      .to(root, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "expo.inOut" });

    const skip = () => tl.progress(1);
    window.addEventListener("keydown", skip, { once: true });
    root.addEventListener("pointerdown", skip, { once: true });
    return () => {
      tl.kill();
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={rootRef}
      className="boot fixed inset-0 z-70 flex cursor-pointer flex-col justify-end bg-ink p-(--gutter) [clip-path:inset(0_0_0_0)]"
      role="status"
      aria-label="Loading"
    >
      <div className="font-mono text-[11px] leading-6 text-cream-dim sm:text-sm">
        {LINES.map((l) => (
          <p key={l} data-line className="whitespace-pre">
            <span className="text-cream-mute">&gt; </span>
            {l}
          </p>
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between gap-6">
        <p className="font-dot text-[clamp(64px,14vw,200px)] leading-[0.8] font-black text-cream" data-pct>
          000
        </p>
        <p className="hud-label pb-2 text-right text-xs text-cream-mute">
          Boot sequence initiated
          <br />
          Press any key to skip
        </p>
      </div>
      <div className="mt-4 h-2 w-full border border-line p-px">
        <div data-bar className="checker size-full origin-left scale-x-0 text-cream" />
      </div>
    </div>
  );
}

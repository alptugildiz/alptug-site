"use client";

import { useEffect, useRef, useState } from "react";

// Classic 8-bit arrow cursor (9 × 13)
const ARROW = [
  [1,1,0,0,0,0,0,0,0],
  [1,1,1,0,0,0,0,0,0],
  [1,1,1,1,0,0,0,0,0],
  [1,1,1,1,1,0,0,0,0],
  [1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,0,0,0],
  [1,1,1,1,1,1,0,0,0],
  [1,1,0,0,1,1,0,0,0],
  [0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,1,1,0,0],
  [0,0,0,0,0,0,0,0,0],
];

const PX = 2;
const W = ARROW[0].length * PX;
const H = ARROW.length * PX;

export default function PixelCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isDark, setIsDark] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (!visible) setVisible(true);
    };
    const hide = () => setVisible(false);

    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseleave", hide);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", hide);
    };
  }, [visible]);


  const neonColor = isDark ? "#00ffff" : "#e040fb";

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[99999]"
      style={{
        willChange: "transform",
        transform: "translate(-999px, -999px)",
        opacity: visible ? 1 : 0,
      }}
    >
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          imageRendering: "pixelated",
          filter: `drop-shadow(0 0 3px ${neonColor}) drop-shadow(0 0 6px ${neonColor}88)`,
        }}
      >
        {ARROW.map((row, y) =>
          row.map((cell, x) =>
            cell ? (
              <rect
                key={`${x}-${y}`}
                x={x * PX}
                y={y * PX}
                width={PX}
                height={PX}
                fill={neonColor}
              />
            ) : null
          )
        )}
      </svg>
    </div>
  );
}

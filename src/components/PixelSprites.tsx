"use client";

// Space Invader
const INVADER = [
  [0,0,1,0,0,0,0,0,1,0,0],
  [0,0,0,1,0,0,0,1,0,0,0],
  [0,0,1,1,1,1,1,1,1,0,0],
  [0,1,1,0,1,1,1,0,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,1],
  [0,0,0,1,1,0,1,1,0,0,0],
];

// Pixel spaceship
const SHIP = [
  [0,0,0,0,1,0,0,0,0],
  [0,0,0,1,1,1,0,0,0],
  [0,0,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,1,1],
  [0,0,1,0,1,0,1,0,0],
];

// Pixel ghost
const GHOST = [
  [0,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1],
  [1,0,1,1,1,1,0,1],
  [1,0,1,1,1,1,0,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1],
  [1,0,1,0,1,0,1,0],
];

type Pattern = number[][];

function PixelArt({ pattern, color, size = 3 }: { pattern: Pattern; color: string; size?: number }) {
  const cols = pattern[0].length;
  const rows = pattern.length;
  return (
    <svg
      width={cols * size}
      height={rows * size}
      viewBox={`0 0 ${cols * size} ${rows * size}`}
      style={{ imageRendering: "pixelated" }}
    >
      {pattern.map((row, y) =>
        row.map((cell, x) =>
          cell ? (
            <rect key={`${x}-${y}`} x={x * size} y={y * size} width={size} height={size} fill={color} />
          ) : null
        )
      )}
    </svg>
  );
}

const sprites = [
  { id: 1, top: 12, delay: 0,  dur: 26, dir: "ltr", pattern: INVADER, size: 3 },
  { id: 2, top: 28, delay: 9,  dur: 33, dir: "rtl", pattern: SHIP,    size: 3 },
  { id: 3, top: 48, delay: 4,  dur: 21, dir: "ltr", pattern: GHOST,   size: 2 },
  { id: 4, top: 65, delay: 15, dur: 29, dir: "rtl", pattern: INVADER, size: 2 },
  { id: 5, top: 78, delay: 7,  dur: 36, dir: "ltr", pattern: SHIP,    size: 3 },
  { id: 6, top: 90, delay: 18, dur: 24, dir: "rtl", pattern: GHOST,   size: 3 },
] as const;

export default function PixelSprites({ neonColor }: { neonColor: string }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {sprites.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            top: `${s.top}%`,
            animation: `${s.dir === "ltr" ? "bird" : "bird-reverse"} ${s.dur}s linear ${s.delay}s infinite`,
            animationFillMode: "both",
            filter: `drop-shadow(0 0 4px ${neonColor}) drop-shadow(0 0 10px ${neonColor}88)`,
            opacity: 0.55,
          }}
        >
          <PixelArt pattern={s.pattern} color={neonColor} size={s.size} />
        </div>
      ))}
    </div>
  );
}

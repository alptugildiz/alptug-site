const icons = {
  heart: [
    ".XX...XX.",
    "XXXX.XXXX",
    "XXXXXXXXX",
    "XXXXXXXXX",
    ".XXXXXXX.",
    "..XXXXX..",
    "...XXX...",
    "....X....",
  ],
  person: [
    "...XXX...",
    "...XXX...",
    "....X....",
    ".XXXXXXX.",
    "X..XXX..X",
    "X..XXX..X",
    "...X.X...",
    "...X.X...",
    "..XX.XX..",
  ],
  arrow: [
    "....X....",
    "....XX...",
    "XXXXXXX..",
    "XXXXXXXX.",
    "XXXXXXX..",
    "....XX...",
    "....X....",
  ],
  download: [
    "...XXX...",
    "...XXX...",
    "...XXX...",
    ".XXXXXXX.",
    "..XXXXX..",
    "...XXX...",
    "....X....",
    ".........",
    "XXXXXXXXX",
  ],
  spark: [
    "....X....",
    "....X....",
    "...XXX...",
    "XXXXXXXXX",
    "...XXX...",
    "....X....",
    "....X....",
  ],
  code: [
    "..X...X..",
    ".X....X.X",
    "X....X..X",
    ".X..X..X.",
    "..XX...X.",
  ].map((r) => r.padEnd(9, ".")),
  mail: [
    "XXXXXXXXX",
    "XX.....XX",
    "X.X...X.X",
    "X..XXX..X",
    "X.......X",
    "XXXXXXXXX",
  ],
} as const;

export type PixelIconName = keyof typeof icons;

type Props = {
  name: PixelIconName;
  className?: string;
  title?: string;
};

export default function PixelIcon({ name, className, title }: Props) {
  const rows = icons[name];
  const w = Math.max(...rows.map((r) => r.length));
  const h = rows.length;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      shapeRendering="crispEdges"
      fill="currentColor"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={rows.flatMap((row, y) => [...row].map((c, x) => (c === "X" ? `M${x} ${y}h1v1h-1z` : ""))).join("")} />
    </svg>
  );
}

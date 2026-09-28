/** Eight-spoke pixel spinner that ticks in discrete steps, like a boot loader. */
export default function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={`animate-spin-step ${className}`} aria-hidden shapeRendering="crispEdges">
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="7"
          y="0"
          width="2"
          height="5"
          fill="currentColor"
          opacity={0.25 + (i / 7) * 0.75}
          transform={`rotate(${i * 45} 8 8)`}
        />
      ))}
    </svg>
  );
}

export default function ArrowLine({ count = 28, className = "" }: { count?: number; className?: string }) {
  return (
    <span aria-hidden className={`block overflow-hidden whitespace-nowrap font-mono tracking-[-0.05em] ${className}`}>
      {">".repeat(count)}
    </span>
  );
}

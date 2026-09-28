type Props = { index: string; label: string; className?: string };

export default function SectionTag({ index, label, className = "" }: Props) {
  return (
    <p className={`hud-label text-sm text-cream-dim ${className}`}>
      <span className="text-cream">{index}</span> <span className="text-cream-mute">{"//"}</span> {label}
    </p>
  );
}

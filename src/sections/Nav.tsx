import Clock from "@/components/hud/Clock";
import CommandPalette from "@/components/hud/CommandPalette";
import NavLinks from "@/components/hud/NavLinks";
import { profile } from "@/content/resume";

export default function Nav() {
  return (
    <header className="sticky top-2 z-50 px-(--gutter) pt-2">
      <nav
        aria-label="Primary"
        className="panel flex items-stretch divide-x divide-line overflow-hidden bg-ink/85 backdrop-blur-md"
      >
        <a href="#top" className="hud-label flex items-center gap-2 px-4 py-3 text-sm hover:bg-cream hover:text-ink">
          <span className="font-display text-xs font-black tracking-tight normal-case">ai</span>
          <span className="hidden sm:inline">{profile.firstName}.sys</span>
        </a>
        <NavLinks />
        <CommandPalette />
        <div className="hud-label hidden items-center gap-2 px-4 text-xs text-cream-dim sm:flex">
          IST <Clock className="font-mono text-cream" />
        </div>
      </nav>
    </header>
  );
}

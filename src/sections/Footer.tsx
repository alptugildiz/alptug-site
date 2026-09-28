import Marquee from "@/components/hud/Marquee";
import { profile } from "@/content/resume";

const build = process.env.NEXT_PUBLIC_BUILD_SHA?.slice(0, 7) ?? "dev";

export default function Footer() {
  return (
    <footer className="px-(--gutter) pb-(--gutter)">
      <div className="panel grid overflow-hidden sm:grid-cols-[auto_1fr_auto] sm:divide-x sm:divide-line">
        <p className="hud-label px-5 py-4 text-xs text-cream-dim">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <Marquee
          duration={30}
          reverse
          className="border-y border-line py-4 sm:border-y-0"
          itemClassName="hud-label text-xs text-cream-mute"
          items={["Built with Next.js", "Self-hosted", "No templates", "Hand-written shaders", "Istanbul"]}
          separator={<span className="text-cream-mute">▪</span>}
        />
        <p className="hud-label px-5 py-4 text-xs text-cream-mute">
          build <span className="font-mono text-cream-dim">{build}</span>
        </p>
      </div>
    </footer>
  );
}

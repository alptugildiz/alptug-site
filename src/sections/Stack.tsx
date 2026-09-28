import Marquee from "@/components/hud/Marquee";
import PixelIcon, { type PixelIconName } from "@/components/hud/PixelIcon";
import SectionTag from "@/components/hud/SectionTag";
import { skills } from "@/content/resume";

const ticker: { top: string; bottom?: string; style: "fill" | "outline" | "dim"; icon: PixelIconName }[] = [
  { top: "React", bottom: "server + client", style: "fill", icon: "code" },
  { top: "Next.js", style: "outline", icon: "spark" },
  { top: "TypeScript", bottom: "strict mode", style: "fill", icon: "heart" },
  { top: "GSAP", bottom: "motion", style: "dim", icon: "arrow" },
  { top: "WebGL", style: "outline", icon: "spark" },
  { top: "Vue", bottom: "& Angular too", style: "fill", icon: "code" },
];

const styles = {
  fill: "text-cream",
  outline: "text-outline",
  dim: "text-cream-mute",
};

export default function Stack() {
  return (
    <section id="stack" aria-labelledby="stack-title" className="scroll-mt-20 px-(--gutter)">
      <h2 id="stack-title" className="sr-only">
        Stack
      </h2>
      <div data-reveal className="panel overflow-hidden">
        <Marquee
          duration={48}
          className="py-6"
          items={ticker.map((t) => (
            <span key={t.top} className="flex items-center gap-[clamp(20px,3vw,48px)]">
              <span className="flex flex-col">
                <span
                  className={`font-display text-[clamp(40px,6vw,96px)] leading-[0.9] font-black tracking-[-0.03em] uppercase ${styles[t.style]}`}
                >
                  {t.top}
                </span>
                {t.bottom && <span className="hud-label mt-2 text-sm text-cream-dim">{t.bottom}</span>}
              </span>
              <PixelIcon name={t.icon} className="w-[clamp(36px,4vw,64px)] text-cream-2" />
            </span>
          ))}
        />
      </div>

      <div data-reveal className="panel mt-3 grid overflow-hidden sm:grid-cols-2 xl:grid-cols-5">
        {Object.entries(skills).map(([group, list], i) => (
          <div
            key={group}
            data-row
            className="flex flex-col gap-6 border-line p-6 max-xl:not-last:border-b sm:max-xl:odd:border-r xl:not-last:border-r"
          >
            <div className="flex items-center justify-between">
              <p className="hud-label text-sm text-cream">{group}</p>
              <p className="font-mono text-xs text-cream-mute">0{i + 1}</p>
            </div>
            <ul className="flex flex-wrap gap-x-4 gap-y-2">
              {list.map((s) => (
                <li key={s} className="text-lg text-cream-dim transition-colors hover:text-cream">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-end px-1">
        <SectionTag index="003" label="Stack" />
      </div>
    </section>
  );
}

import PixelIcon from "@/components/hud/PixelIcon";
import SectionTag from "@/components/hud/SectionTag";
import { education, profile } from "@/content/resume";

const stackWords = ["Frontend", "Engineer", "Frontend", "Engineer", "Frontend"];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="scroll-mt-20 px-(--gutter)">
      <div data-reveal className="panel grid overflow-hidden lg:grid-cols-[1.3fr_1fr_auto]">
        <div className="flex flex-col justify-between border-b border-line lg:border-r lg:border-b-0">
          <div className="p-6 sm:p-10">
            <h2 id="about-title" className="sr-only">
              About
            </h2>
            <p className="max-w-[26ch] font-display text-[clamp(24px,2.7vw,44px)] leading-[1.08] font-bold tracking-tight">
              {profile.intro[0]}
            </p>
            <p className="mt-8 max-w-[58ch] text-base leading-relaxed text-cream-dim sm:text-lg">{profile.intro[1]}</p>
            <p className="mt-4 max-w-[58ch] text-base leading-relaxed text-cream-dim sm:text-lg">{profile.summary}</p>
          </div>
          <div className="grid grid-cols-[auto_auto_1fr] divide-x divide-line border-t border-line">
            <div className="flex items-center px-5 py-4">
              <span className="checker block h-6 w-14 text-cream/80" />
            </div>
            <div className="flex items-center px-5">
              <PixelIcon name="person" className="w-6 text-cream" />
            </div>
            <div className="flex items-center justify-between gap-4 px-5">
              <SectionTag index="001" label="About" />
              <p className="hud-label hidden text-xs text-cream-mute sm:block">
                {education.degree} — {education.school}
              </p>
            </div>
          </div>
        </div>

        {/* stacked outline/fill typography, filled progressively on scroll */}
        <div
          aria-hidden
          data-type-stack
          className="flex flex-col items-center justify-center gap-1 overflow-hidden border-b border-line py-10 lg:border-b-0"
        >
          {stackWords.map((w, i) => (
            <span
              key={i}
              data-type-word
              className="text-outline font-display text-[clamp(34px,5vw,84px)] leading-[0.95] font-black tracking-[-0.03em] uppercase"
            >
              {w}
            </span>
          ))}
        </div>

        <div className="hidden items-center border-l border-line p-6 lg:flex">
          <div className="relative flex h-full min-h-[360px] w-24 flex-col items-center justify-between rounded-[10px] border border-line py-5">
            <span className="hud-label text-[11px] text-cream-mute">Scroll</span>
            <div className="relative h-full w-px bg-line-soft">
              <span data-scroll-meter className="absolute inset-x-[-1px] top-0 h-full origin-top scale-y-0 bg-cream" />
            </div>
            <span className="hud-label text-[11px] text-cream">Signal</span>
          </div>
        </div>
      </div>
    </section>
  );
}

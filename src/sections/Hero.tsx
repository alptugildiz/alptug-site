import PortraitField from "@/components/fx/PortraitField";
import ArrowLine from "@/components/hud/ArrowLine";
import Arcade from "@/components/fx/arcade/Arcade";
import Clock from "@/components/hud/Clock";
import Marquee from "@/components/hud/Marquee";
import PixelIcon from "@/components/hud/PixelIcon";
import Spinner from "@/components/hud/Spinner";
import { experience, profile, yearsOfExperience } from "@/content/resume";

const ticker = [
  "Portfolio v2026",
  "Boot sequence complete",
  profile.role,
  "React / Next.js / TypeScript",
  "Hand-written WebGL",
  "Motion with GSAP",
  "Pixel-perfect or it didn't ship",
];

export default function Hero() {
  const years = yearsOfExperience();

  return (
    <section id="top" aria-labelledby="hero-title" className="flex flex-col gap-3 px-(--gutter) pt-3">
      <h1 id="hero-title" className="sr-only">
        {profile.name}, {profile.role}
      </h1>

      {/* giant name */}
      <div aria-hidden className="@container select-none">
        <p
          data-hero-line
          className="font-display text-[calc(100cqw/5.12)] whitespace-nowrap leading-[0.82] font-black tracking-[-0.045em] text-cream uppercase"
        >
          {profile.firstName}
        </p>
        <div className="flex items-end justify-between gap-4">
          <p
            data-hero-line
            className="text-halftone font-display text-[calc(100cqw/5.12)] whitespace-nowrap leading-[0.82] font-black tracking-[-0.045em] uppercase"
          >
            {profile.lastName}
          </p>
          <p data-hero-fade className="hud-label hidden pb-[1.4cqw] text-right text-[clamp(12px,1.1cqw,18px)] text-cream-dim md:block">
            {profile.role}
            <br />
            React / Next.js / TS
            <br />
            <span className="text-cream">{years}+ yrs shipping UI</span>
          </p>
        </div>
      </div>

      <div data-hero-fade className="panel">
        <Marquee
          items={ticker}
          duration={36}
          className="py-3.5"
          itemClassName="hud-label text-sm sm:text-base"
          separator={<span className="checker inline-block h-4 w-8 align-middle text-cream/80" />}
        />
      </div>

      {/* main HUD console */}
      <div id="console" data-hero-fade className="panel grid overflow-hidden lg:grid-cols-[1.05fr_1fr]">
        <div className="relative min-h-[420px] border-b border-line lg:min-h-[640px] lg:border-r lg:border-b-0">
          <PortraitField src="/me.png" alt={`Pixel-art portrait of ${profile.name}`} className="absolute inset-0" />
          <a
            href="#work"
            className="group absolute bottom-0 left-0 flex items-stretch divide-x divide-ink/25 rounded-tr-[var(--radius-panel)] bg-cream text-ink"
          >
            <span className="flex items-center px-4">
              <PixelIcon name="spark" className="w-6 transition-transform group-hover:rotate-45" />
            </span>
            <span className="font-display px-5 py-4 text-sm font-black tracking-tight uppercase sm:text-lg">View work</span>
            <span className="flex items-center px-4">
              <PixelIcon name="arrow" className="w-5 rotate-90 transition-transform group-hover:translate-y-1" />
            </span>
          </a>
          <p className="hud-label absolute top-4 left-4 text-xs text-cream-dim">
            REC <span className="animate-blink text-[#ff5b3d]">●</span> portrait.feed
          </p>
          <p className="hud-label absolute top-4 right-4 hidden text-xs text-cream-mute sm:block">hover to glitch</p>
        </div>

        <div className="flex flex-col">
          <div className="grid grid-cols-[1fr_auto_1fr] divide-x divide-line border-b border-line sm:grid-cols-[auto_auto_1fr_auto_auto]">
            <div className="hud-label flex items-center justify-center px-4 py-4 text-sm">System 001</div>
            <div className="flex items-center justify-center px-4">
              <Spinner className="size-5 text-cream" />
            </div>
            <div className="hud-label flex items-center justify-center px-4 text-sm text-cream-dim">{profile.firstName}.sys</div>
            <div className="hidden items-center px-4 sm:flex">
              <span className="checker block h-6 w-12 text-cream" />
            </div>
            <div className="hidden items-center justify-center px-4 font-mono text-sm text-cream-dim sm:flex">
              <Clock />
            </div>
          </div>

          <div className="grid flex-1 sm:grid-cols-[1fr_1fr]">
            <div className="relative min-h-[320px] border-b border-line sm:border-r sm:border-b-0">
              <Arcade className="absolute inset-0" />
            </div>
            <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
              <div>
                <p className="font-display text-[clamp(26px,3vw,48px)] leading-[0.95] font-black tracking-tight uppercase">
                  Frontend
                  <br />
                  that ships.
                </p>
                <ArrowLine className="mt-4 text-cream-dim" />
              </div>
              <p className="max-w-[38ch] text-[15px] leading-relaxed text-cream-dim">{profile.intro[0]}</p>
              <dl className="grid grid-cols-3 divide-x divide-line-soft border-t border-line-soft pt-4">
                <Stat label="Years" value={`${years}+`} />
                <Stat label="Companies" value={String(experience.length).padStart(2, "0")} />
                <Stat label="Now at" value="Odeon" small />
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="px-3 first:pl-0">
      <dt className="hud-label text-[11px] text-cream-mute">{label}</dt>
      <dd className={`mt-1 font-dot font-black text-cream ${small ? "text-2xl" : "text-4xl"}`}>{value}</dd>
    </div>
  );
}


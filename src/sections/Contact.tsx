import Clock from "@/components/hud/Clock";
import IstanbulMap from "@/components/hud/IstanbulMap";
import PixelIcon from "@/components/hud/PixelIcon";
import SectionTag from "@/components/hud/SectionTag";
import { profile } from "@/content/resume";

const links = [
  { label: "LinkedIn", href: profile.linkedin, handle: "in/alptugildiz" },
  { label: "GitHub", href: profile.github, handle: "@alptugildiz" },
  { label: "Email", href: `mailto:${profile.email}`, handle: profile.email },
];

export default function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-20 px-(--gutter) pt-10">
      <div data-reveal className="panel overflow-hidden">
        <header className="grid grid-cols-[1fr_auto] divide-x divide-line border-b border-line">
          <div className="px-5 py-4">
            <SectionTag index="005" label="Contact" />
          </div>
          <p className="hud-label flex items-center gap-2 px-5 text-xs text-cream-dim">
            IST <Clock className="font-mono text-cream" />
          </p>
        </header>

        <div className="overflow-hidden border-b border-line py-8">
          <h2
            id="contact-title"
            data-contact-slide
            className="w-max px-6 font-display text-[clamp(56px,13vw,240px)] leading-[0.85] font-black tracking-[-0.045em] whitespace-nowrap uppercase sm:px-10"
          >
            Let&apos;s build <span className="text-halftone">something</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          <div className="flex flex-col justify-between gap-10 border-b border-line p-6 sm:p-10 lg:border-r lg:border-b-0">
            <p className="max-w-[40ch] text-lg leading-relaxed text-cream-dim">
              Have an interface that needs to feel fast, precise and a little unexpected? Email is the quickest way to reach me.
            </p>
            <a
              href={`mailto:${profile.email}`}
              className="group w-fit font-display text-[clamp(20px,3.2vw,52px)] leading-none font-bold tracking-tight break-all"
            >
              {profile.email}
              <span className="mt-3 block h-px origin-left scale-x-25 bg-cream transition-transform duration-500 group-hover:scale-x-100" />
            </a>
            <IstanbulMap className="max-w-[720px]" />
          </div>

          <ul className="divide-y divide-line">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 px-6 py-6 transition-colors hover:bg-cream hover:text-ink sm:px-8"
                >
                  <span className="font-display text-2xl font-bold tracking-tight uppercase sm:text-3xl">{l.label}</span>
                  <span className="flex items-center gap-3">
                    <span className="hud-label hidden text-xs text-cream-dim group-hover:text-ink/70 sm:inline">{l.handle}</span>
                    <PixelIcon name="arrow" className="w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

import ArrowLine from "@/components/hud/ArrowLine";
import PixelIcon from "@/components/hud/PixelIcon";
import SectionTag from "@/components/hud/SectionTag";
import { projects, type Project } from "@/content/resume";

export default function Work() {
  return (
    <section id="work" aria-labelledby="work-title" className="scroll-mt-20 px-(--gutter)">
      <div className="flex flex-wrap items-end justify-between gap-4 px-1 pt-10 pb-4">
        <h2 id="work-title" className="font-display text-[clamp(40px,7vw,120px)] leading-[0.9] font-black tracking-[-0.04em] uppercase">
          Selected
          <br />
          <span className="text-halftone">work</span>
        </h2>
        <SectionTag index="004" label="Selected work" className="pb-2" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.code} project={p} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ project: p }: { project: Project }) {
  const Tag = p.href ? "a" : "article";
  return (
    <Tag
      data-reveal
      {...(p.href ? { href: p.href, target: "_blank", rel: "noreferrer" } : {})}
      className="panel group flex flex-col overflow-hidden"
    >
      <div className="grid grid-cols-[auto_1fr_auto] divide-x divide-line border-b border-line transition-colors duration-300 group-hover:bg-cream group-hover:text-ink">
        <p className="hud-label px-4 py-3.5 text-sm">{p.code}</p>
        <p className="hud-label truncate px-4 py-3.5 text-sm text-cream-dim group-hover:text-ink/70">{p.context}</p>
        <p className="px-4 py-3.5 font-mono text-sm">{p.year}</p>
      </div>

      <div className="relative flex flex-1 flex-col gap-6 p-6 sm:p-8">
        <p
          aria-hidden
          className="pointer-events-none absolute -top-2 right-4 font-dot text-[clamp(90px,11vw,170px)] leading-none font-black text-cream/[0.07] transition-colors duration-500 group-hover:text-cream/[0.14]"
        >
          {p.code.slice(-2)}
        </p>
        <h3 className="relative font-display text-[clamp(26px,2.8vw,44px)] leading-[1] font-black tracking-tight uppercase">
          {p.title}
        </h3>
        <p className="relative max-w-[48ch] leading-relaxed text-cream-dim">{p.summary}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <ul className="flex flex-wrap gap-1.5">
            {p.stack.map((s) => (
              <li key={s} className="hud-label rounded-md border border-line px-2 py-1 text-[11px]">
                {s}
              </li>
            ))}
          </ul>
          {p.href && (
            <span className="hud-label flex items-center gap-2 text-xs text-cream">
              View source <PixelIcon name="arrow" className="w-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          )}
        </div>
      </div>
      <ArrowLine
        count={120}
        className="border-t border-line px-6 py-2 text-xs text-cream-mute transition-colors group-hover:text-cream"
      />
    </Tag>
  );
}

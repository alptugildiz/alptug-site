import ArrowLine from "@/components/hud/ArrowLine";
import SectionTag from "@/components/hud/SectionTag";
import { experience } from "@/content/resume";

export default function Experience() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-20 px-(--gutter)">
      <div data-reveal className="panel overflow-hidden">
        <header className="grid grid-cols-[1fr_auto] items-center divide-x divide-line border-b border-line sm:grid-cols-[auto_1fr_auto]">
          <div className="px-5 py-4">
            <SectionTag index="002" label="Career log" />
          </div>
          <ArrowLine count={80} className="hidden px-5 text-cream-mute sm:block" />
          <p className="hud-label px-5 text-xs text-cream-dim">{experience.length} entries</p>
        </header>

        <h2 id="experience-title" className="px-5 pt-8 pb-6 font-display text-[clamp(40px,7vw,120px)] leading-[0.9] font-black tracking-[-0.04em] uppercase sm:px-8">
          Experience
        </h2>

        <ol className="border-t border-line">
          {experience.map((job, i) => (
            <li
              key={job.company}
              data-row
              className="group grid gap-x-8 gap-y-4 border-b border-line px-5 py-7 transition-colors duration-300 last:border-b-0 hover:bg-cream hover:text-ink sm:px-8 lg:grid-cols-[140px_1.1fr_1.4fr]"
            >
              <div className="flex items-start justify-between gap-4 lg:flex-col">
                <p className="font-dot text-4xl leading-none font-black">{String(i + 1).padStart(2, "0")}</p>
                <p className="hud-label text-right text-xs text-cream-dim group-hover:text-ink/70 lg:text-left">
                  {job.start}
                  <br className="hidden lg:block" /> <span className="lg:hidden">—</span> {job.end}
                </p>
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-display text-[clamp(22px,2.2vw,34px)] leading-tight font-bold tracking-tight">{job.role}</h3>
                  {job.end === "Present" && (
                    <span className="hud-label rounded-full border border-current px-2.5 py-1 text-[10px]">Now</span>
                  )}
                </div>
                <p className="mt-1 text-cream-dim group-hover:text-ink/70">
                  {job.company}
                  {job.companyNote && <span className="text-cream-mute group-hover:text-ink/50"> · {job.companyNote}</span>}
                  <span className="text-cream-mute group-hover:text-ink/50"> · {job.location}</span>
                </p>
                <ul className="mt-4 flex flex-wrap gap-1.5">
                  {job.stack.map((s) => (
                    <li key={s} className="hud-label rounded-md border border-line px-2 py-1 text-[11px] group-hover:border-ink/30">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <ul className="space-y-2.5 text-[15px] leading-relaxed text-cream-dim group-hover:text-ink/80">
                {job.highlights.map((h) => (
                  <li key={h} className="flex gap-3">
                    <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 bg-current" />
                    {h}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

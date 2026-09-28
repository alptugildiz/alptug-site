"use client";

import { useEffect, useRef, useState } from "react";
import { sections } from "@/content/nav";
import { scrollToSection } from "@/lib/scroll";

/** Section links with scroll-spy: a sliding highlight on the active section and a per-section progress bar. */
export default function NavLinks() {
  const [active, setActive] = useState(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // progress bars are written straight to the DOM; React only hears about active-section changes
  useEffect(() => {
    let current = -1;
    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = window.innerHeight * 0.35;
      let next = -1;
      sections.forEach((s, i) => {
        const el = document.getElementById(s.id);
        const bar = barRefs.current[i];
        if (!el || !bar) return;
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (probe - r.top) / r.height));
        bar.style.transform = `scaleX(${p})`;
        if (r.top <= probe && r.bottom > probe) next = i;
      });
      // the footer sits below the last section; keep Contact lit there
      const last = document.getElementById(sections[sections.length - 1].id);
      if (next === -1 && last && last.getBoundingClientRect().bottom <= probe) next = sections.length - 1;
      if (next !== current) {
        current = next;
        setActive(next);
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  // slide the highlight under the active link and keep it in view on narrow screens
  useEffect(() => {
    const place = () => {
      const indicator = indicatorRef.current;
      const link = linkRefs.current[active];
      if (!indicator) return;
      if (!link) {
        indicator.style.opacity = "0";
        return;
      }
      indicator.style.opacity = "1";
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.style.width = `${link.offsetWidth}px`;
      const list = listRef.current;
      if (list && list.scrollWidth > list.clientWidth) {
        list.scrollTo({ left: link.offsetLeft - list.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
      }
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [active]);

  return (
    <ul
      ref={listRef}
      className="relative flex flex-1 items-stretch divide-x divide-line-soft overflow-x-auto [scrollbar-width:none]"
    >
      <span
        ref={indicatorRef}
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 bg-cream opacity-0 transition-[transform,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
      />
      {sections.map((s, i) => {
        const on = i === active;
        return (
          // no `relative` here: the link's offsetParent must be the list so offsetLeft positions the highlight
          <li key={s.id} className="flex">
            <a
              ref={(el) => {
                linkRefs.current[i] = el;
              }}
              href={`#${s.id}`}
              aria-current={on ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(s.id);
              }}
              className={`hud-label group relative flex items-center gap-1.5 px-3 py-3 text-xs transition-colors duration-300 sm:px-4 sm:text-sm ${
                on ? "text-ink" : "text-cream-dim hover:text-cream"
              }`}
            >
              <span className={`hidden lg:inline ${on ? "text-ink/55" : "text-cream-mute"}`}>{s.index}</span>
              {s.label}
              <span
                ref={(el) => {
                  barRefs.current[i] = el;
                }}
                aria-hidden
                className={`absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 ${on ? "bg-ink/40" : "bg-cream/70"}`}
              />
            </a>
          </li>
        );
      })}
    </ul>
  );
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { SectionEnum } from "@/enums/SectionEnum";
import { useIsDark } from "@/app/hooks/useIsDark";

type SectionExperienceProps = {
  onEnterSection: (section: SectionEnum) => void;
};

export default function SectionExperience({ onEnterSection }: SectionExperienceProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("experience");
  const isDark = useIsDark();

  const neonColor     = isDark ? "#00ffff" : "#e040fb";
  const neonDim       = isDark ? "rgba(0,255,255,0.15)" : "rgba(224,64,251,0.15)";
  const neonDimBorder = isDark ? "rgba(0,255,255,0.2)"  : "rgba(224,64,251,0.2)";
  const neonHover     = isDark ? "rgba(0,255,255,0.35)" : "rgba(224,64,251,0.35)";

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) onEnterSection(SectionEnum.Experience);
      },
      { threshold: 0.5 }
    );
    const el = sectionRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [onEnterSection]);

  const items = t.raw("items") as {
    title: string;
    company: string;
    period: string;
    description: string;
  }[];

  return (
    <section
      ref={sectionRef}
      id={SectionEnum.Experience}
      className="relative z-20 min-h-screen w-full flex items-start justify-center px-4 sm:px-8"
    >
      <div className="max-w-4xl w-full space-y-8 text-center pb-10 md:pb-10 md:pt-40 relative">

        {/* section label */}
        <div
          className="text-[8px] font-arcade mb-4"
          style={{ color: isDark ? "rgba(0,255,255,0.5)" : "rgba(224,64,251,0.5)" }}
        >
          &gt; LOADING EXPERIENCE.DAT...
        </div>

        <h2
          className="text-xl sm:text-2xl font-arcade"
          style={{
            color: neonColor,
            textShadow: isDark
              ? "0 0 10px rgba(0,255,255,0.7), 0 0 30px rgba(0,255,255,0.3)"
              : "0 0 10px rgba(224,64,251,0.7), 0 0 30px rgba(224,64,251,0.3)",
          }}
        >
          {t("title")}
        </h2>

        <ul className="space-y-4 relative z-20 px-0.5">
          {items.map((item, index) => (
            <li
              key={index}
              className="group border bg-black/80 p-6 text-left transition-all duration-300 relative"
              style={{ borderColor: neonDimBorder }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = neonColor;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 15px ${neonHover}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = neonDimBorder;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* index badge */}
              <span
                className="absolute top-3 right-4 text-[10px] font-mono tracking-widest"
                style={{ color: neonDim }}
              >
                [{String(index + 1).padStart(2, "0")}]
              </span>

              <h3
                className="font-arcade text-xs sm:text-sm leading-relaxed"
                style={{ color: neonColor }}
              >
                {item.title}
              </h3>
              <p className="text-sm font-mono mt-1" style={{ color: isDark ? "rgba(0,255,255,0.5)" : "rgba(224,64,251,0.5)" }}>
                {item.company} &nbsp;/&nbsp; {item.period}
              </p>
              <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

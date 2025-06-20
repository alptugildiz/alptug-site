/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { SectionEnum } from "@/enums/SectionEnum";
import BirdSet from "@/components/Birds/BirdSet";
import { useIsDark } from "@/app/hooks/useIsDark";
import PlaneSet from "@/components/Planes/PlaneSet";

type SectionExperienceProps = {
  onEnterSection: (section: SectionEnum) => void;
};

export default function SectionExperience({
  onEnterSection,
}: SectionExperienceProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("experience");

  const isDark = useIsDark();
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnterSection(SectionEnum.Experience);
        }
      },
      {
        threshold: 0.5,
      }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
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
      {!isDark ? <BirdSet /> : <PlaneSet />}

      <div className="experience-content max-w-4xl w-full space-y-8 text-center relative overflow-hidden rounded-xl pb-10 md:pb-10 md:pt-60 ">
        <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white relative z-10">
          {t("title")}
        </h2>

        <ul className="space-y-6 relative z-20  px-0.5 md:py-4">
          {items.map((item, index) => (
            <li
              key={index}
              className="bg-white/10 hover:bg-white/20  dark:bg-white/5 p-6 rounded-xl shadow-md hover:shadow-lg  ring-1 ring-white/10 text-left backdrop-blur-xs transition-colors duration-400"
              // style={{
              //   boxShadow: "10px 0px 20px rgba(255, 255, 255, 0.109) inset",
              // }}
            >
              <h3 className="font-medium text-xl text-black dark:text-white">
                {item.title}
              </h3>
              <p className="text-sm text-zinc-700 dark:text-zinc-400">
                {item.company} ・ {item.period}
              </p>
              <p className="mt-2 text-zinc-800 dark:text-zinc-300">
                {item.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef } from "react";

import CharacterCard from "@/components/CharacterCard";
import { SectionEnum } from "@/enums/SectionEnum";
import CloudSet from "@/components/Clouds/CloudSet";

type SectionHeroProps = {
  onEnterSection: (section: SectionEnum) => void;
};

export default function SectionHero({ onEnterSection }: SectionHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onEnterSection(SectionEnum.Hero);
        }
      },
      {
        threshold: 0.5, // %50si görünüyorsa tetikler
      }
    );

    const el = sectionRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [onEnterSection]);

  return (
    <section
      ref={sectionRef}
      id={SectionEnum.Hero}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden transition-colors"
    >
      <CloudSet />
      <div className="card z-10 px-4 w-full -translate-y-10 md:-translate-y-20 transition-transform">
        <CharacterCard />
      </div>
    </section>
  );
}

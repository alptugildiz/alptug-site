"use client";

import { useEffect, useState, useMemo } from "react";
import SectionHero from "@/sections/SectionHero";
import SectionExperience from "@/sections/SectionExperience";
import BackgroundLayer from "@/components/BackgroundLayer";
import { SectionEnum } from "@/enums/SectionEnum";
import Footer from "@/components/Footer";
import LocaleSwitcher from "@/components/LocalSwitcher";

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionEnum>(
    SectionEnum.Hero
  );

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("activeSection");
    if (saved) {
      setActiveSection(saved as SectionEnum);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  const activeSectionMemo = useMemo(() => activeSection, [activeSection]);

  if (!mounted) return null;

  return (
    <>
      <BackgroundLayer activeSection={activeSectionMemo} />

      <main className="h-screen w-screen overflow-y-scroll transition-colors pt-20 pb-20">
        <div className="space-y-16">
          <SectionHero onEnterSection={setActiveSection} />
          <SectionExperience onEnterSection={setActiveSection} />
        </div>
        <div className="relative bg-transparent w-20 -bottom-10 left-4 z-50">
          <LocaleSwitcher />
        </div>
        <Footer />
      </main>
    </>
  );
}

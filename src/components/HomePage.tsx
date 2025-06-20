"use client";

import { useEffect, useState } from "react";
import SectionHero from "@/sections/SectionHero";
import SectionExperience from "@/sections/SectionExperience";
import LocaleSwitcher from "@/components/LocalSwitcher";
import BackgroundLayer from "@/components/BackgroundLayer";
import { SectionEnum } from "@/enums/SectionEnum";
import Footer from "@/components/Footer";

export default function MyHomePage() {
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionEnum>(
    SectionEnum.Hero
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    console.log("Aktif section:", activeSection);
  }, [activeSection]);

  if (!mounted) return null;

  return (
    <>
      <BackgroundLayer activeSection={activeSection} />

      <main className="h-screen w-screen overflow-y-scroll scroll-smooth transition-colors pt-20">
        <SectionHero onEnterSection={setActiveSection} />
        <SectionExperience onEnterSection={setActiveSection} />
        <div className="relative bg-transparent w-20 -bottom-10 left-4 z-50  ">
          <LocaleSwitcher />
        </div>
        <Footer />
      </main>
    </>
  );
}

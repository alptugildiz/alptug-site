/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SectionEnum } from "@/enums/SectionEnum";
import { useEffect, useState, memo } from "react";
import PixelSprites from "./PixelSprites";

type BackgroundLayerProps = {
  activeSection: SectionEnum | null;
};

const BackgroundLayerContent = memo(function BackgroundLayerContent({
  isDark,
  background,
  prevBackground,
  fadeKey,
}: {
  isDark: boolean;
  background: string;
  prevBackground: string;
  fadeKey: number;
}) {
  const neonColor = isDark ? "#00ffff" : "#e040fb";

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* base bg */}
      <div className="absolute inset-0" style={{ background: prevBackground }} />
      <div
        key={fadeKey}
        className="absolute inset-0 transition-opacity duration-1000 opacity-0 animate-fadeIn"
        style={{ background }}
      />

      {/* dot grid */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(circle, rgba(0,255,255,0.3) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(224,64,251,0.3) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* flying pixel sprites */}
      <PixelSprites neonColor={neonColor} />

      {/* CRT scanlines */}
      <div className="absolute inset-0 crt-scanlines opacity-60" />

      {/* subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
});

const BackgroundLayer = memo(function BackgroundLayer({
  activeSection,
}: BackgroundLayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [background, setBackground] = useState("");
  const [prevBackground, setPrevBackground] = useState("");
  const [fadeKey, setFadeKey] = useState(0);

  useEffect(() => {
    setMounted(true);
    const html = document.documentElement;
    setIsDark(html.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let newBackground = "";

    if (isDark) {
      // CRT Terminal — dark navy, not pure black
      switch (activeSection) {
        case SectionEnum.Hero:
          newBackground = "radial-gradient(ellipse at 30% 30%, #0d1f2d 0%, #071018 70%)";
          break;
        case SectionEnum.Experience:
          newBackground = "radial-gradient(ellipse at 70% 70%, #0d1f2d 0%, #071018 70%)";
          break;
        default:
          newBackground = "#071018";
      }
    } else {
      // Synthwave — dark purple with magenta tint shift
      switch (activeSection) {
        case SectionEnum.Hero:
          newBackground = "radial-gradient(ellipse at 30% 30%, #1a0030 0%, #0d001a 70%)";
          break;
        case SectionEnum.Experience:
          newBackground = "radial-gradient(ellipse at 70% 70%, #200040 0%, #0d001a 70%)";
          break;
        default:
          newBackground = "#0d001a";
      }
    }

    setPrevBackground(background);
    setBackground(newBackground);
    setFadeKey((k) => k + 1);
  }, [activeSection, isDark]);

  if (!mounted) return null;

  return (
    <BackgroundLayerContent
      isDark={isDark}
      background={background}
      prevBackground={prevBackground}
      fadeKey={fadeKey}
    />
  );
});

export default BackgroundLayer;

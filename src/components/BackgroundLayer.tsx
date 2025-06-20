/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { SectionEnum } from "@/enums/SectionEnum";
import { useEffect, useState } from "react";
import SunGlow from "./SunGlow";

type Star = {
  top: number;
  left: number;
  delay: number;
};

type BackgroundLayerProps = {
  activeSection: SectionEnum;
};

export default function BackgroundLayer({
  activeSection,
}: BackgroundLayerProps) {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
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

    const generated = Array.from({ length: 30 }, () => ({
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setStars(generated);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let newBackground = "";

    if (isDark) {
      switch (activeSection) {
        case SectionEnum.Hero:
          newBackground =
            "radial-gradient(circle at 20% 40%, #0c033f, #171226, #000000)";

          break;
        case SectionEnum.Experience:
          newBackground =
            "radial-gradient(circle at 80% 80%, #0c033f, #171226, #000000)";
          break;
        default:
          newBackground = "#000";
      }
    } else {
      switch (activeSection) {
        case SectionEnum.Hero:
          newBackground =
            "radial-gradient(circle at 50% 20%, #f7ead9, #f0dfc9, #f3cc95)";
          break;
        case SectionEnum.Experience:
          newBackground =
            "radial-gradient(circle at 50% 120%, #f3cc95, #7546c2, #330877)";
          break;
        default:
          newBackground = "#fff";
      }
    }

    setPrevBackground(background);
    setBackground(newBackground);
    setFadeKey((k) => k + 1);
  }, [activeSection, isDark]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      <div
        className="absolute inset-0"
        style={{ background: prevBackground }}
      />
      <div
        key={fadeKey}
        className="absolute inset-0 transition-opacity duration-1000 opacity-0 animate-fadeIn"
        style={{ background }}
      />
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        aria-hidden="true"
        style={{
          position: "fixed",
          pointerEvents: "none",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          opacity: 1,
          backgroundRepeat: "repeat",
          backgroundPosition: "top left",
          backgroundImage: "url('/images/bg-axtra.png')",
        }}
      />

      {!isDark && <SunGlow />}
      {isDark &&
        stars.map((star, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              opacity: 0,
              animation: `starfall ${6 + Math.random() * 10}s linear ${
                star.delay
              }s infinite forwards`,
            }}
          >
            <div className="relative w-2 h-2">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[1px] h-2 bg-white rounded-full drop-shadow-sm" />
              <div className="absolute top-1/2 left-0 -translate-y-1/2 h-[1px] w-2 bg-white rounded-full drop-shadow-sm" />
            </div>
          </div>
        ))}
    </div>
  );
}

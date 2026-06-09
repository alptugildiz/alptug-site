"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import TechMarquee from "./TechMarquee";
import Image from "next/image";

export default function CharacterCard() {
  const [isDark, setIsDark] = useState(false);
  const t = useTranslations("character");

  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => setIsDark(html.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const neonColor = isDark ? "#00ffff" : "#e040fb";
  const neonGlow = isDark
    ? "0 0 20px rgba(0,255,255,0.35), inset 0 0 20px rgba(0,255,255,0.04)"
    : "0 0 20px rgba(224,64,251,0.35), inset 0 0 20px rgba(224,64,251,0.04)";
  const cornerBorder = isDark ? "border-cyan-400" : "border-fuchsia-400";
  const dimColor = isDark ? "rgba(0,255,255,0.45)" : "rgba(224,64,251,0.45)";

  const socials = [
    { name: "GitHub",   href: "https://github.com/alptugildiz",           icon: "/icons/github.svg" },
    { name: "LinkedIn", href: "https://www.linkedin.com/in/alptugildiz/", icon: "/icons/linkedin.svg" },
    { name: "E-posta",  href: "mailto:alptugildiz@gmail.com",             icon: "/icons/mail.svg" },
  ];

  return (
    <div
      className="z-20 w-[85%] md:w-[58%] mx-auto border-2 relative flex flex-col"
      style={{ borderColor: neonColor, boxShadow: neonGlow, background: "rgba(3,10,20,0.65)" }}
    >
      {/* corner brackets */}
      <span className={`absolute top-[-1px] left-[-1px] w-5 h-5 border-t-2 border-l-2 ${cornerBorder}`} />
      <span className={`absolute top-[-1px] right-[-1px] w-5 h-5 border-t-2 border-r-2 ${cornerBorder}`} />
      <span className={`absolute bottom-[-1px] left-[-1px] w-5 h-5 border-b-2 border-l-2 ${cornerBorder}`} />
      <span className={`absolute bottom-[-1px] right-[-1px] w-5 h-5 border-b-2 border-r-2 ${cornerBorder}`} />

      {/* top bar */}
      <div
        className="flex items-center justify-between px-4 py-1.5 border-b text-[8px] font-arcade"
        style={{ borderColor: dimColor, color: dimColor }}
      >
        <span>CRT_PORTFOLIO.EXE</span>
        <span className="animate-blink-cursor">PLAYER_ONE</span>
        <span>v2.0</span>
      </div>

      {/* main content */}
      <div className="flex flex-col md:flex-row">

        {/* left — character sprite */}
        <div
          className="flex items-center justify-center p-4 md:p-6 border-b md:border-b-0 md:border-r"
          style={{ borderColor: dimColor }}
        >
          <div className="relative" style={{ width: 280, height: 280 }}>
            {/* main */}
            <Image
              src="/me_transparent.png"
              alt="Character"
              width={280}
              height={280}
              className="relative z-10 animate-glitch-char-main object-contain"
              style={{
                imageRendering: "pixelated",
                filter: `drop-shadow(0 0 8px ${neonColor}66)`,
              }}
              priority
            />
            {/* red channel */}
            <Image
              src="/me_transparent.png"
              alt="" aria-hidden
              width={280} height={280}
              className="absolute inset-0 object-contain animate-glitch-char-r"
              style={{
                imageRendering: "pixelated",
                filter: "brightness(3) sepia(1) saturate(500%) hue-rotate(300deg)",
              }}
            />
            {/* green channel */}
            <Image
              src="/me_transparent.png"
              alt="" aria-hidden
              width={280} height={280}
              className="absolute inset-0 object-contain animate-glitch-char-g"
              style={{
                imageRendering: "pixelated",
                filter: "brightness(3) sepia(1) saturate(500%) hue-rotate(100deg)",
              }}
            />
            {/* blue channel */}
            <Image
              src="/me_transparent.png"
              alt="" aria-hidden
              width={280} height={280}
              className="absolute inset-0 object-contain animate-glitch-char-b"
              style={{
                imageRendering: "pixelated",
                filter: "brightness(3) sepia(1) saturate(500%) hue-rotate(200deg)",
              }}
            />
          </div>
        </div>

        {/* right — stats */}
        <div className="flex flex-col gap-5 px-6 py-5 flex-1 text-left">

          {/* name */}
          <div className="relative">
            <h1
              className="font-arcade text-sm sm:text-base md:text-lg leading-loose animate-glitch"
              style={{
                color: neonColor,
                textShadow: isDark
                  ? "0 0 10px rgba(0,255,255,0.9), 0 0 30px rgba(0,255,255,0.4)"
                  : "0 0 10px rgba(224,64,251,0.9), 0 0 30px rgba(224,64,251,0.4)",
              }}
            >
              {t("name")}
              <span className="animate-blink-cursor">_</span>
            </h1>
            {/* colour-split glitch overlay */}
            <h1
              aria-hidden
              className="font-arcade text-sm sm:text-base md:text-lg leading-loose absolute inset-0 animate-glitch-layer pointer-events-none select-none"
              style={{ color: isDark ? "#ff00ff" : "#00ffff" }}
            >
              {t("name")}_
            </h1>
          </div>

          {/* description */}
          <p className="text-xs sm:text-sm leading-relaxed text-gray-400 font-mono max-w-md">
            {t("description")}
          </p>

          {/* socials */}
          <div className="flex gap-3">
            {socials.map(({ name, href, icon }) => (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 flex items-center justify-center border bg-black/50 transition-all duration-300"
                style={{ borderColor: isDark ? "rgba(0,255,255,0.3)" : "rgba(224,64,251,0.3)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = neonColor;
                  (e.currentTarget as HTMLElement).style.boxShadow = `0 0 10px ${neonColor}66`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = isDark
                    ? "rgba(0,255,255,0.3)"
                    : "rgba(224,64,251,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <Image src={icon} alt={name} width={18} height={18} style={{ filter: "invert(1)" }} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* bottom — marquee */}
      <div
        className="border-t"
        style={{ borderColor: dimColor }}
      >
        <TechMarquee />
      </div>
    </div>
  );
}

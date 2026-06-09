"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function Header() {
  const [isDark, setIsDark] = useState(false);
  const t = useTranslations("header");

  useEffect(() => {
    const html = document.documentElement;
    const updateTheme = () => setIsDark(html.classList.contains("dark"));
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const neonColor  = isDark ? "#00ffff" : "#e040fb";
  const borderGlow = isDark
    ? "0 1px 0 0 rgba(0,255,255,0.4), 0 2px 12px rgba(0,255,255,0.15)"
    : "0 1px 0 0 rgba(224,64,251,0.4), 0 2px 12px rgba(224,64,251,0.15)";

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 flex items-center justify-between p-4 sm:px-8 bg-black/80 backdrop-blur-md"
      style={{ boxShadow: borderGlow }}
    >
      <div className="flex items-center">
        <Link href="/" prefetch={false} className="inline-flex items-center">
          <Image
            src="/icons/ailogo.png"
            alt="Logo"
            width={28}
            height={28}
            style={{ filter: `drop-shadow(0 0 4px ${neonColor}) invert(1)` }}
            className="cursor-pointer select-none"
          />
        </Link>
      </div>

      <div
        className="absolute left-1/2 transform -translate-x-1/2 text-[8px] font-arcade"
        style={{ color: neonColor }}
      >
        {t("greeting")}
      </div>

      <div className="flex items-center">
        <ThemeToggle />
      </div>
    </header>
  );
}

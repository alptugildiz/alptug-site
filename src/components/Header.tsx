"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useTranslations } from "next-intl";

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

  const backgroundColor = isDark ? "rgba(76, 76, 187, 0.049)" : "#e6c5842b";

  const logoFilter = isDark ? "invert(1) brightness(2) contrast(1.2)" : "none";

  return (
    <header
      style={{ backgroundColor }}
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.1)] flex items-center p-4 sm:px-8"
    >
      <div className="flex items-center">
        <Image
          src="/icons/ailogo.png" 
          alt="Logo"
          width={32}
          height={32}
          style={{ filter: logoFilter }}
        />
      </div>

      {/* MERKEZ */}
      <div
        className="flex-1 flex justify-center gap-4"
        style={{ color: isDark ? "#fff" : "#000" }}
      >
        {/* <div>selam</div> */}
        <div> {t("greeting")}</div>
        {/* <div>selam</div> */}
      </div>

      {/* SAĞDA TEMA */}
      <div className="ml-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}

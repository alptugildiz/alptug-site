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

  const socials = [
    {
      name: "GitHub",
      href: "https://github.com/alptugildiz",
      icon: "/icons/github.svg",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/in/alptugildiz/",
      icon: "/icons/linkedin.svg",
    },
    {
      name: "E-posta",
      href: "mailto:alptugildiz@gmail.com",
      icon: "/icons/mail.svg",
    },
  ];

  return (
    <div
      className="z-20 w-[90%] h-[60vh] md:w-[60%] md:h-[70vh] mx-auto
                 px-6 md:px-12 py-1 md:py-20 rounded-3xl
                 backdrop-blur-sm
                 bg-white/10 dark:bg-white/2
                 shadow-[0_12px_48px_rgba(0,0,0,0.2)]
                 ring-1 ring-white/30 dark:ring-white/10
                 relative flex flex-col justify-between space-y-4 md:space-y-8 text-center"
    >
      <div className="flex flex-col items-between justify-center h-[100%] space-y-10">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: isDark ? "#e0e0e0" : "#1e1e1e" }}
        >
          {t("name")}
        </h1>

        <p
          className="text-sm sm:text-base md:text-lg leading-relaxed max-w-prose mx-auto"
          style={{ color: isDark ? "#d0d0d0" : "#444" }}
        >
          {t("description")}
        </p>

        <div className="flex justify-center pt-4">
          {socials.map(({ name, href, icon }) => (
            <a
              key={name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-3 md:mx-7 w-16 h-16 flex items-center justify-center
                       rounded-2xl shrink-0
                       bg-white/30 dark:bg-white/10
                       backdrop-blur-md
                       ring-1 ring-white/30 dark:ring-white/10
                       shadow-lg"
            >
              <Image
                src={icon}
                alt={name}
                width={24}
                height={24}
                style={{ filter: isDark ? "invert(1)" : "none" }}
                className="invert dark:invert-0"
              />
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 md:mt-10">
        <TechMarquee />
      </div>
    </div>
  );
}

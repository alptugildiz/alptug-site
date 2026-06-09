"use client";

import Marquee from "react-fast-marquee";
import Image from "next/image";
import { useEffect, useState } from "react";

const techs = [
  { name: "React",      src: "/icons/react.svg" },
  { name: "Vue",        src: "/icons/vuejs.svg" },
  { name: "Next.js",    src: "/icons/nextjs.svg" },
  { name: "TypeScript", src: "/icons/typescript.svg" },
  { name: "JS",         src: "/icons/js.svg" },
  { name: "Tailwind",   src: "/icons/tailwindcss.svg" },
  { name: "Node.js",    src: "/icons/nodejs.svg" },
  { name: "PHP",        src: "/icons/php.svg" },
  { name: "Firebase",   src: "/icons/firebase.svg" },
  { name: "Git",        src: "/icons/git.svg" },
];

// duplicate so content always exceeds container width → seamless loop
const allTechs = [...techs, ...techs];

export default function TechMarquee() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const neonColor  = isDark ? "#00ffff" : "#e040fb";
  const borderDim  = isDark ? "rgba(0,255,255,0.2)"  : "rgba(224,64,251,0.2)";
  const borderHover = neonColor;

  return (
    <div className="w-full pb-4">
      <div
        className="text-[9px] tracking-[0.3em] font-arcade text-center mb-3 uppercase"
        style={{ color: isDark ? "rgba(0,255,255,0.4)" : "rgba(224,64,251,0.4)" }}
      >
        TECH_STACK.INI
      </div>
      <Marquee gradient={false} speed={18}>
        {allTechs.map((tech, i) => (
          <div
            key={i}
            className="mx-8 w-14 h-14 flex items-center justify-center border bg-black transition-all duration-300 group"
            style={{ borderColor: borderDim }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = borderHover;
              el.style.boxShadow = `0 0 10px ${neonColor}55`;
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLElement;
              el.style.borderColor = borderDim;
              el.style.boxShadow = "none";
            }}
          >
            <Image
              src={tech.src}
              alt={tech.name}
              width={36}
              height={36}
              title={tech.name}
              className="object-contain"
              style={{ filter: "invert(1) brightness(0.9)" }}
            />
          </div>
        ))}
      </Marquee>
    </div>
  );
}

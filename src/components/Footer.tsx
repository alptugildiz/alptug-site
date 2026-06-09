"use client";

import { useEffect, useState } from "react";
import LocaleSwitcher from "./LocalSwitcher";

export default function Footer() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    const update = () => setIsDark(html.classList.contains("dark"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const neonColor = isDark ? "rgba(0,255,255,0.4)" : "rgba(224,64,251,0.4)";

  return (
    <footer className="w-full flex items-center justify-between px-4 py-3 z-10 relative">
      <LocaleSwitcher />

      <p
        className="text-[10px] font-arcade tracking-widest uppercase"
        style={{ color: neonColor }}
      >
        &copy; 2025 &mdash;{" "}
        <a
          href="https://alptugildiz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 hover:brightness-150 transition-all duration-200"
          style={{ color: neonColor }}
        >
          alptugildiz.com
        </a>
      </p>
    </footer>
  );
}

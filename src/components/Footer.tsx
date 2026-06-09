"use client";

import { useEffect, useState } from "react";

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
    <footer
      className="py-4 px-4 sm:px-8 text-right z-10 relative bg-transparent"
      style={{ width: "280px", float: "right" }}
    >
      <p className="text-[10px] font-mono tracking-widest uppercase" style={{ color: neonColor }}>
        &copy; 2025 &mdash;{" "}
        <a
          href="https://alptugildiz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4 transition-all duration-200 hover:brightness-150"
          style={{ color: neonColor }}
        >
          alptugildiz.com
        </a>
      </p>
    </footer>
  );
}

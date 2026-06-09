"use client";

import { useLayoutEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const activeDark = storedTheme === "dark" || (!storedTheme && systemPrefersDark);
    setIsDark(activeDark);
    document.documentElement.classList.toggle("dark", activeDark);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark", !isDark);
    localStorage.setItem("theme", newTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-7 border transition-all duration-300 flex items-center px-1"
      style={{
        borderColor: isDark ? "#00ffff" : "#e040fb",
        boxShadow: isDark
          ? "0 0 8px rgba(0,255,255,0.4)"
          : "0 0 8px rgba(224,64,251,0.4)",
        background: "black",
      }}
      title={isDark ? "Switch to Synthwave" : "Switch to CRT"}
    >
      {/* thumb */}
      <span
        className="relative z-10 w-5 h-5 flex items-center justify-center transition-transform duration-300 border"
        style={{
          transform: isDark ? "translateX(28px)" : "translateX(0)",
          background: "black",
          borderColor: isDark ? "#00ffff" : "#e040fb",
          boxShadow: isDark
            ? "0 0 6px rgba(0,255,255,0.8)"
            : "0 0 6px rgba(224,64,251,0.8)",
        }}
      />
      {/* label — left of the button */}
      <span
        className="absolute left-[-40px] text-[8px] font-arcade whitespace-nowrap"
        style={{ color: isDark ? "#00ffff" : "#e040fb" }}
      >
        {isDark ? "CRT" : "SYN"}
      </span>
    </button>
  );
}

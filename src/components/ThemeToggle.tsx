"use client";

import { useLayoutEffect, useState } from "react";

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Dark mod ayarını hydration'dan önce uygula
  useLayoutEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const activeDark =
      storedTheme === "dark" || (!storedTheme && systemPrefersDark);

    setIsDark(activeDark);
    document.documentElement.classList.toggle("dark", activeDark);
    setMounted(true); // mount işlemi burada
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
      className={`w-10 h-6 flex items-center rounded-full px-0.5 transition-colors duration-300
        ${isDark ? "bg-yellow-400" : "bg-gray-700"}
      `}
    >
      <div
        className={`w-5 h-5 flex items-center justify-center text-xs rounded-full shadow-md transform duration-300 ease-in-out bg-white
          ${isDark ? "translate-x-4.5" : "translate-x-0"}
        `}
      >
        {isDark ? "☀️" : "🌙"}
      </div>
    </button>
  );
}

"use client";

import { useIsDark } from "@/app/hooks/useIsDark";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition, useCallback } from "react";
import ReactCountryFlag from "react-country-flag";

const locales = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const isDark = useIsDark();

  const handleChange = useCallback(
    (locale: string) => {
      startTransition(() => {
        router.replace(pathname, { locale });
      });
    },
    [router, pathname]
  );

  return (
    <div className="flex gap-2 fixed z-50" style={{ bottom: 20, left: 20 }}>
      {locales.map(({ code }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          disabled={isPending}
          className="p-1 cursor-pointer transition-opacity disabled:opacity-50"
          aria-label={`Switch to ${code}`}
        >
          <span style={{ color: isDark ? "#cbd5e1" : "#000" }}>
            <ReactCountryFlag countryCode={code === "tr" ? code : "gb"} svg />
          </span>
        </button>
      ))}
    </div>
  );
}

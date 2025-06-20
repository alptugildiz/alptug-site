"use client";

import { useIsDark } from "@/app/hooks/useIsDark";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTransition } from "react";
import ReactCountryFlag from "react-country-flag";

const locales = [
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
];

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleChange = (locale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale });
    });
  };
  const isDark = useIsDark();

  return (
    <div className="flex gap-2">
      {locales.map(({ code }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          disabled={isPending}
          className="p-1 cursor-pointer "
        >
          <span
            className="sm:inline"
            style={{ color: isDark ? "#cbd5e1" : "#000" }}
          >
            <ReactCountryFlag countryCode={code === "tr" ? code : "gb"} svg />
          </span>
        </button>
      ))}
    </div>
  );
}

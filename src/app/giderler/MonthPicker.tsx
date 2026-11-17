"use client";

import { useRouter } from "next/navigation";
import { select } from "./ui";

const monthFormat = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric", timeZone: "UTC" });
const formatMonth = (month: string) => monthFormat.format(new Date(`${month}-01T00:00:00Z`));

export default function MonthPicker({ months, value }: { months: string[]; value: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Ay</span>
      <select
        value={value}
        onChange={(e) => router.push(`/giderler?ay=${e.target.value}`)}
        className={`${select} w-auto capitalize`}
      >
        {months.map((m) => (
          <option key={m} value={m}>
            {formatMonth(m)}
          </option>
        ))}
      </select>
    </label>
  );
}

"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { USERS } from "@/lib/giderler/categories.ts";
import { reportHref, type Person, type Range } from "@/lib/giderler/report.ts";
import DatePicker from "../DatePicker";
import { label, select } from "../ui";

type Props = {
  range: Range;
  person: Person;
  presets: { id: string; label: string; range: Range }[];
};

const chip = "hud-label rounded-md border px-3 py-2 text-[11px] transition-colors";

export default function ReportFilters({ range, person, presets }: Props) {
  const router = useRouter();
  const go = (next: Partial<Range>, nextPerson = person) => router.replace(reportHref({ ...range, ...next }, nextPerson));

  return (
    <div className="panel flex flex-wrap items-end gap-4 p-4 print:hidden sm:p-5">
      {/* keyed by value so a preset click re-seeds the pickers */}
      <div className="w-40">
        <DatePicker key={`s-${range.start}`} id="rapor-bas" name="bas" label="Başlangıç" defaultValue={range.start} onChange={(start) => go({ start })} />
      </div>
      <div className="w-40">
        <DatePicker key={`e-${range.end}`} id="rapor-bit" name="bit" label="Bitiş" defaultValue={range.end} onChange={(end) => go({ end })} />
      </div>
      <div className="w-36">
        <label htmlFor="rapor-kisi" className={label}>
          Kişi
        </label>
        <select
          id="rapor-kisi"
          value={person}
          onChange={(e) => go({}, e.target.value as Person)}
          className={select}
        >
          <option value="ikimiz">İkimiz</option>
          {Object.entries(USERS).map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
      </div>
      <nav aria-label="Hazır aralıklar" className="flex flex-wrap gap-2">
        {presets.map((p) => {
          const current = p.range.start === range.start && p.range.end === range.end;
          return (
            <Link
              key={p.id}
              href={reportHref(p.range, person)}
              replace
              aria-current={current ? "true" : undefined}
              className={`${chip} ${current ? "border-signal text-signal" : "border-line-soft text-cream-dim hover:border-line hover:text-cream"}`}
            >
              {p.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

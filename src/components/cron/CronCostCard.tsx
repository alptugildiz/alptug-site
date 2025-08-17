"use client";
import React from "react";

// Reusable collapsible card in your translucent style
function InfoCard({
  title,
  children,
  defaultOpen,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details
      className="bg-white/30 dark:bg-white/10 backdrop-blur-md rounded-2xl shadow text-neutral-900 dark:text-neutral-50"
      open={defaultOpen}
    >
      <summary className="list-none select-none cursor-pointer px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-wide uppercase opacity-80">
          {title}
        </span>
        <span className="text-xs opacity-60">(aç/kapat)</span>
      </summary>
      <div className="p-4">{children}</div>
    </details>
  );
}

const LEVELS = [
  "BASE",
  "PRI",
  "DUO",
  "TRI",
  "TET",
  "PEN",
  "HEX",
  "SEP",
  "OCT",
  "NOV",
] as const;

type Level = (typeof LEVELS)[number];

type Row = {
  name: string;
  values: Partial<Record<Level, number | null>>;
};

// === Sabit veri (senin verdiğin listeye göre) ===
const DATA: Row[] = [
  {
    name: "Zirhlar",
    values: { BASE: null, PRI: 1500, DUO: 2100, TRI: 2700, TET: 4000 },
  },
  {
    name: "Sovereign",
    values: {
      BASE: null,
      PRI: 320,
      DUO: 560,
      TRI: 780,
      TET: 970,
      PEN: 1350,
      HEX: 1550,
      SEP: 2250,
      OCT: 2760,
      NOV: 3920,
    },
  },
  {
    name: "Kharazad",
    values: {
      BASE: null,
      PRI: 120,
      DUO: 280,
      TRI: 540,
      TET: 840,
      PEN: 1090,
      HEX: 1480,
      SEP: 1880,
      OCT: 2850,
      NOV: 3650,
    },
  },
  {
    name: "Blackstar",
    values: { BASE: 25, PRI: 80, DUO: 275, TRI: 1100, TET: 2200 },
  },
  {
    name: "Blackstar Subweapon",
    values: { BASE: null, PRI: null, DUO: 100, TRI: 591, TET: 3670 },
  },
  {
    name: "Deboreka",
    values: { BASE: 95, PRI: 288, DUO: 865, TRI: 2405, TET: 11548 },
  },
  {
    name: "Manos taki",
    values: { BASE: 25, PRI: 80, DUO: 275, TRI: 1100, TET: 2200 },
  },
  {
    name: "Manos Kiyafet",
    values: { BASE: null, PRI: null, DUO: 60, TRI: 355, TET: 1680 },
  },
];

function fmt(v: number | null | undefined) {
  if (v == null) return "—";
  return v.toLocaleString("tr-TR");
}

export default function CronCostCard() {
  return (
    <InfoCard title="Cron Maliyeti Tablosu" defaultOpen={false}>
      <div className="space-y-3">
        <p className="text-xs opacity-70">
          Değerler tek deneme için tahmini cron taşı maliyetleridir. Boş olan
          hücreler ilgili seviyede veri olmadığını gösterir.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-black/5 dark:border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/40 dark:bg-white/10">
              <tr>
                <th className="px-3 py-2 text-left font-semibold">Item</th>
                {LEVELS.map((lv) => (
                  <th key={lv} className="px-3 py-2 text-center font-semibold">
                    {lv}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {DATA.map((row) => (
                <tr
                  key={row.name}
                  className="hover:bg-white/40 dark:hover:bg-white/5"
                >
                  <td className="px-3 py-2 font-medium whitespace-nowrap">
                    {row.name}
                  </td>
                  {LEVELS.map((lv) => (
                    <td key={lv} className="px-3 py-2 text-center align-middle">
                      {fmt(row.values[lv])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </InfoCard>
  );
}

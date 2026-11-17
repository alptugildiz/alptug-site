import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { USERS, type UserId } from "@/lib/giderler/categories.ts";
import { formatTRY } from "@/lib/giderler/money.ts";
import {
  compareMonths,
  parsePerson,
  parseRange,
  presets,
  rangeSummary,
  type Change,
  type Person,
  type Range,
} from "@/lib/giderler/report.ts";
import { getUser } from "@/lib/giderler/session.ts";
import { getStore } from "@/lib/giderler/store.ts";
import { button } from "../ui";
import PrintButton from "./PrintButton";
import ReportFilters from "./ReportFilters";
import "../giderler.css";

const utc = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("tr-TR", { ...opts, timeZone: "UTC" });
const shortDate = utc({ day: "numeric", month: "short", year: "numeric" });
const monthName = utc({ month: "long" });
const monthShort = utc({ month: "short" });
const asDate = (iso: string) => new Date(`${iso}T00:00:00Z`);

const personLabel = (p: Person) => (p === "ikimiz" ? "İkimiz" : USERS[p]);
const rangeLabel = (r: Range) => `${shortDate.format(asDate(r.start))} – ${shortDate.format(asDate(r.end))}`;

// spending colours: Alptuğ signal green, Gamze cream; print styles map them to ink tones
const PERSON_BAR: Record<UserId, string> = { alptug: "bar-alptug bg-signal", gamze: "bar-gamze bg-cream-dim" };

async function readParams(searchParams: PageProps<"/giderler/rapor">["searchParams"]) {
  const { bas, bit, kisi } = await searchParams;
  return { range: parseRange(bas, bit), person: parsePerson(kisi) };
}

export async function generateMetadata({ searchParams }: PageProps<"/giderler/rapor">): Promise<Metadata> {
  const { range } = await readParams(searchParams);
  // the browser suggests this as the PDF file name
  return { title: { absolute: `Giderler raporu ${rangeLabel(range)}` }, robots: { index: false, follow: false } };
}

function ChangeBadge({ change, amount }: { change: Change; amount: number }) {
  // nothing spent this month or last: a "=" would just be noise
  if (change.kind === "none" || (change.kind === "same" && amount === 0)) return null;
  const text = { same: "=", new: "yeni", up: "▲", down: "▼" }[change.kind] + ("pct" in change ? `${change.pct}%` : "");
  const tone =
    change.kind === "up" ? "text-[#ff8a7a]" : change.kind === "down" ? "text-signal" : "text-cream-mute";
  return <span className={`change ml-1.5 font-mono text-[10px] ${tone}`}>{text}</span>;
}

export default async function RaporPage({ searchParams }: PageProps<"/giderler/rapor">) {
  if (!(await getUser())) redirect("/giderler");

  const { range, person } = await readParams(searchParams);
  const expenses = await getStore().list();
  const summary = rangeSummary(expenses, range, person);
  const comparison = compareMonths(expenses, range, person);
  const maxMonth = Math.max(1, ...comparison.months.map((m) => m.total));
  const multiYear = range.start.slice(0, 4) !== range.end.slice(0, 4);
  const people = person === "ikimiz" ? (Object.keys(USERS) as UserId[]) : [person];

  return (
    <main className="report mx-auto flex min-h-svh max-w-[1920px] flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="hud-label text-xl text-cream">Giderler raporu</h1>
          <p className="mt-2 font-mono text-sm text-cream-dim">
            {rangeLabel(range)} · {personLabel(person)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <Link href="/giderler" className={button}>
            ← Giderler
          </Link>
          <PrintButton />
        </div>
      </header>

      <ReportFilters range={range} person={person} presets={[...presets()]} />

      {summary.total === 0 ? (
        <p className="panel p-6 font-mono text-sm text-cream-mute">Bu aralıkta kayıt yok.</p>
      ) : (
        <>
          <section aria-labelledby="ozet" className="panel avoid-break grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
            <div>
              <h2 id="ozet" className="hud-label text-[11px] text-cream-mute">
                Toplam
              </h2>
              <p className="mt-2 font-mono text-4xl text-signal tabular-nums">{formatTRY(summary.total)}</p>
              {person === "ikimiz" && (
                <ul className="mt-4 flex flex-col gap-1.5 font-mono text-sm">
                  {people.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span aria-hidden className={`size-2 rounded-full ${PERSON_BAR[p]}`} />
                      <span className="text-cream-dim">{USERS[p]}</span>
                      <span className="ml-auto text-cream tabular-nums">{formatTRY(summary.byPerson[p])}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <ul aria-label="Kategori toplamları" className="flex flex-col gap-2.5">
              {summary.byCategory.map((c) => (
                <li key={c.id}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-cream-dim">{c.label}</span>
                    <span className="font-mono text-cream tabular-nums">
                      {formatTRY(c.total)}
                      <span className="ml-2 text-xs text-cream-mute">%{Math.round((c.total / summary.total) * 100)}</span>
                    </span>
                  </div>
                  <div className="track mt-1 h-1 rounded-full bg-line-soft" aria-hidden>
                    <div className="bar-total h-full rounded-full bg-cream-dim" style={{ width: `${(c.total / summary.total) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="ay-ay" className="panel flex flex-col gap-6 p-5 sm:p-6">
            <h2 id="ay-ay" className="hud-label text-sm text-cream">
              Ay ay
            </h2>

            <div className="avoid-break flex h-40 items-end gap-3 sm:gap-6" aria-hidden>
              {comparison.months.map((m) => (
                <div key={m.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className="font-mono text-[11px] text-cream-dim tabular-nums">{formatTRY(m.total)}</span>
                  <div className="flex w-full max-w-16 flex-col-reverse overflow-hidden rounded-t-md" style={{ height: `${(m.total / maxMonth) * 100}%` }}>
                    {people.map((p) => (
                      <div key={p} className={PERSON_BAR[p]} style={{ height: `${m.total ? (m.byPerson[p] / m.total) * 100 : 0}%` }} />
                    ))}
                  </div>
                  <span className="hud-label text-[10px] text-cream-mute capitalize">{monthShort.format(asDate(`${m.month}-01`))}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="hud-label py-2 pr-4 text-left text-[11px] text-cream-mute">
                      Kategori
                    </th>
                    {comparison.months.map((m) => (
                      <th key={m.month} scope="col" className="py-2 pl-4 text-right align-bottom">
                        <span className="hud-label block text-[11px] text-cream capitalize">
                          {monthName.format(asDate(`${m.month}-01`))}
                          {multiYear && ` ${m.month.slice(0, 4)}`}
                        </span>
                        {(m.ongoing || m.partial) && (
                          <span className="block font-mono text-[10px] font-normal text-cream-mute">
                            {m.ongoing ? "devam ediyor" : "kısmi"}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparison.rows.map((row) => (
                    <tr key={row.id} className="border-b border-line-soft">
                      <th scope="row" className="py-2 pr-4 text-left font-normal text-cream-dim">
                        {row.label}
                      </th>
                      {row.cells.map((cell, i) => (
                        <td key={comparison.months[i].month} className="py-2 pl-4 text-right font-mono whitespace-nowrap text-cream tabular-nums">
                          {cell.amount ? formatTRY(cell.amount) : <span className="text-cream-mute">–</span>}
                          <ChangeBadge change={cell.change} amount={cell.amount} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th scope="row" className="hud-label py-3 pr-4 text-left text-[11px] text-cream">
                      Toplam
                    </th>
                    {comparison.totals.map((cell, i) => (
                      <td key={comparison.months[i].month} className="py-3 pl-4 text-right font-mono whitespace-nowrap text-signal tabular-nums">
                        {formatTRY(cell.amount)}
                        <ChangeBadge change={cell.change} amount={cell.amount} />
                      </td>
                    ))}
                  </tr>
                </tfoot>
              </table>
            </div>
            <p className="font-mono text-[11px] text-cream-mute">
              Değişim bir önceki aya göre. ▲ artış, ▼ azalış. Devam eden ve kısmi aylar tam ay değildir.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

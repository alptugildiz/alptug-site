import { USERS, type UserId } from "@/lib/giderler/categories.ts";
import { formatTRY } from "@/lib/giderler/money.ts";
import type { Summary } from "@/lib/giderler/summary.ts";
import ExpenseForm from "./ExpenseForm";
import ExpenseRow from "./ExpenseRow";

type Props = { owner: UserId; summary: Summary; editable: boolean; defaultDate: string };

export default function OwnerSection({ owner, summary, editable, defaultDate }: Props) {
  const headingId = `giderler-${owner}`;

  return (
    <section aria-labelledby={headingId} className="panel flex flex-col gap-6 p-5 sm:p-6">
      <header className="flex items-end justify-between gap-4">
        <h2 id={headingId} className="hud-label text-base text-cream">
          {USERS[owner]}
          {editable && <span className="ml-2 text-cream-mute">(sen)</span>}
        </h2>
        <p className="text-right">
          <span className="hud-label block text-[11px] text-cream-mute">Toplam</span>
          <span className="font-mono text-2xl text-signal tabular-nums">{formatTRY(summary.total)}</span>
        </p>
      </header>

      {editable && <ExpenseForm defaultDate={defaultDate} />}

      {summary.byCategory.length > 0 && (
        <ul aria-label="Kategori toplamları" className="flex flex-col gap-2.5">
          {summary.byCategory.map((c) => (
            <li key={c.id}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-cream-dim">{c.label}</span>
                <span className="font-mono text-cream tabular-nums">{formatTRY(c.total)}</span>
              </div>
              <div className="mt-1 h-1 rounded-full bg-line-soft" aria-hidden>
                <div className="h-full rounded-full bg-cream-dim" style={{ width: `${(c.total / summary.total) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {summary.items.length > 0 ? (
        <ul aria-label="Kayıtlar">
          {summary.items.map((e) => (
            <ExpenseRow key={e.id} expense={e} editable={editable} />
          ))}
        </ul>
      ) : (
        <p className="font-mono text-sm text-cream-mute">Bu ayda kayıt yok.</p>
      )}
    </section>
  );
}

"use client";

import { useActionState, useState } from "react";
import { categoryLabel } from "@/lib/giderler/categories.ts";
import { formatTRY } from "@/lib/giderler/money.ts";
import type { Expense } from "@/lib/giderler/store.ts";
import { deleteExpense, type FormState } from "./actions";
import ExpenseForm from "./ExpenseForm";
import { errorText } from "./ui";

const dayFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
const formatDay = (date: string) => dayFormat.format(new Date(`${date}T00:00:00Z`));

const linkButton = "hud-label text-[11px] text-cream-mute transition-colors hover:text-cream disabled:opacity-50";

export default function ExpenseRow({ expense, editable }: { expense: Expense; editable: boolean }) {
  const [editing, setEditing] = useState(false);
  const [state, remove, removing] = useActionState<FormState, FormData>(deleteExpense, {});

  if (editing) {
    return (
      <li className="border-t border-line-soft py-4">
        <ExpenseForm defaultDate={expense.date} expense={expense} onDone={() => setEditing(false)} />
      </li>
    );
  }

  return (
    <li className={`border-t border-line-soft py-3 ${removing ? "opacity-40" : ""}`}>
      <div className="flex items-baseline gap-3">
        <span className="w-14 shrink-0 font-mono text-xs text-cream-mute">{formatDay(expense.date)}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm text-cream">{categoryLabel(expense.category)}</span>
          {expense.note && <span className="block truncate text-xs text-cream-dim">{expense.note}</span>}
        </span>
        <span className="shrink-0 font-mono text-sm text-cream tabular-nums">{formatTRY(expense.amount)}</span>
      </div>
      {editable && (
        <div className="mt-1.5 flex items-center justify-end gap-4">
          {state.error && (
            <p role="alert" className={errorText}>
              {state.error}
            </p>
          )}
          <button type="button" onClick={() => setEditing(true)} className={linkButton}>
            Düzenle
          </button>
          <form action={remove}>
            <input type="hidden" name="id" value={expense.id} />
            <button type="submit" disabled={removing} className={linkButton}>
              Sil
            </button>
          </form>
        </div>
      )}
    </li>
  );
}

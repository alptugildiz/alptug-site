"use client";

import { useActionState, useId } from "react";
import { CATEGORIES } from "@/lib/giderler/categories.ts";
import type { Expense } from "@/lib/giderler/store.ts";
import { saveExpense, type FormState } from "./actions";
import { button, errorText, field, label, primaryButton } from "./ui";

type Props = {
  /** YYYY-MM-DD used for new expenses */
  defaultDate: string;
  /** edit mode when set */
  expense?: Expense;
  onDone?: () => void;
};

const kurusToInput = (kurus: number) => (kurus / 100).toFixed(2).replace(".", ",");

export default function ExpenseForm({ defaultDate, expense, onDone }: Props) {
  // `n` remounts the form after every result: React applies a <select>'s defaultValue only on mount,
  // so a failed save would otherwise lose the chosen category
  const [state, action, pending] = useActionState<FormState & { n?: number }, FormData>(async (prev, formData) => {
    const next = await saveExpense(prev, formData);
    if (!next.error) onDone?.();
    return { ...next, n: (prev.n ?? 0) + 1 };
  }, {});
  const id = useId();
  const v = state.values;

  return (
    <form key={state.n} action={action} className="grid grid-cols-2 gap-3 sm:grid-cols-[1fr_1fr_1.3fr]">
      {expense && <input type="hidden" name="id" value={expense.id} />}
      <div>
        <label htmlFor={`${id}-amount`} className={label}>
          Tutar (₺)
        </label>
        <input
          id={`${id}-amount`}
          name="amount"
          inputMode="decimal"
          required
          placeholder="89,90"
          autoComplete="off"
          defaultValue={v?.amount ?? (expense ? kurusToInput(expense.amount) : "")}
          className={field}
        />
      </div>
      <div>
        <label htmlFor={`${id}-date`} className={label}>
          Tarih
        </label>
        <input
          id={`${id}-date`}
          name="date"
          type="date"
          required
          defaultValue={v?.date ?? expense?.date ?? defaultDate}
          className={field}
        />
      </div>
      <div className="col-span-2 sm:col-span-1">
        <label htmlFor={`${id}-category`} className={label}>
          Kategori
        </label>
        <select
          id={`${id}-category`}
          name="category"
          required
          defaultValue={v?.category ?? expense?.category ?? ""}
          className={field}
        >
          <option value="" disabled>
            Seç…
          </option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </div>
      <div className="col-span-2 sm:col-span-3">
        <label htmlFor={`${id}-note`} className={label}>
          Not
        </label>
        <input
          id={`${id}-note`}
          name="note"
          maxLength={200}
          autoComplete="off"
          placeholder="İsteğe bağlı"
          defaultValue={v?.note ?? expense?.note ?? ""}
          className={field}
        />
      </div>
      <div className="col-span-2 flex flex-wrap items-center gap-3 sm:col-span-3">
        <button type="submit" disabled={pending} className={primaryButton}>
          {pending ? "Kaydediliyor…" : expense ? "Kaydet" : "Ekle"}
        </button>
        {onDone && expense && (
          <button type="button" onClick={onDone} className={button}>
            Vazgeç
          </button>
        )}
        {state.error && (
          <p role="alert" className={errorText}>
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}

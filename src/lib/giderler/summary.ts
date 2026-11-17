import { CATEGORIES, type CategoryId, type UserId } from "./categories.ts";
import type { Expense } from "./store.ts";

// en-CA formats as YYYY-MM-DD
const istanbulDate = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" });

/** YYYY-MM-DD in Istanbul. */
export function today(now = new Date()): string {
  return istanbulDate.format(now);
}

/** YYYY-MM in Istanbul. */
export function currentMonth(now = new Date()): string {
  return today(now).slice(0, 7);
}

export function isMonth(x: unknown): x is string {
  return typeof x === "string" && /^\d{4}-(0[1-9]|1[0-2])$/.test(x);
}

export type Summary = {
  items: Expense[];
  byCategory: { id: CategoryId; label: string; total: number }[];
  total: number;
};

export function summarize(expenses: Expense[], owner: UserId, month: string): Summary {
  const items = expenses
    .filter((e) => e.owner === owner && e.date.startsWith(`${month}-`))
    .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt));

  const byCategory = CATEGORIES.map(({ id, label }) => ({
    id,
    label,
    total: items.reduce((sum, e) => (e.category === id ? sum + e.amount : sum), 0),
  }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  return { items, byCategory, total: items.reduce((sum, e) => sum + e.amount, 0) };
}

export function availableMonths(expenses: Expense[], now = new Date()): string[] {
  const months = new Set([currentMonth(now), ...expenses.map((e) => e.date.slice(0, 7))]);
  return [...months].sort().reverse();
}

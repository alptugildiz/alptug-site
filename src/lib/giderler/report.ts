import { shiftMonth } from "./calendar.ts";
import { CATEGORIES, isUser, type CategoryId, type UserId } from "./categories.ts";
import type { Expense } from "./store.ts";
import { currentMonth, today } from "./summary.ts";

export type Person = UserId | "ikimiz";
export type Range = { start: string; end: string };
export type Change = { kind: "none" } | { kind: "same" } | { kind: "new" } | { kind: "up" | "down"; pct: number };

type CategoryTotal = { id: CategoryId; label: string; total: number };

export function isIsoDate(x: unknown): x is string {
  if (typeof x !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(x)) return false;
  const d = new Date(`${x}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().startsWith(x);
}

/** From the first day of the month `monthsBack` months ago up to today. */
const lastMonths = (monthsBack: number, now: Date): Range => ({
  start: `${shiftMonth(currentMonth(now), -monthsBack)}-01`,
  end: today(now),
});

export function presets(now = new Date()) {
  return [
    { id: "bu-ay", label: "Bu ay", range: lastMonths(0, now) },
    { id: "son-3", label: "Son 3 ay", range: lastMonths(2, now) },
    { id: "son-6", label: "Son 6 ay", range: lastMonths(5, now) },
    { id: "bu-yil", label: "Bu yıl", range: { start: `${today(now).slice(0, 4)}-01-01`, end: today(now) } },
  ] as const satisfies readonly { id: string; label: string; range: Range }[];
}

export function parseRange(bas: unknown, bit: unknown, now = new Date()): Range {
  if (!isIsoDate(bas) || !isIsoDate(bit)) return lastMonths(2, now);
  return bas <= bit ? { start: bas, end: bit } : { start: bit, end: bas };
}

export function parsePerson(x: unknown): Person {
  return isUser(x) ? x : "ikimiz";
}

export function filterExpenses(expenses: Expense[], range: Range, person: Person): Expense[] {
  return expenses
    .filter((e) => e.date >= range.start && e.date <= range.end && (person === "ikimiz" || e.owner === person))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const sum = (items: Expense[]) => items.reduce((total, e) => total + e.amount, 0);
const byPerson = (items: Expense[]): Record<UserId, number> => ({
  alptug: sum(items.filter((e) => e.owner === "alptug")),
  gamze: sum(items.filter((e) => e.owner === "gamze")),
});

function categoryTotals(items: Expense[]): CategoryTotal[] {
  return CATEGORIES.map(({ id, label }) => ({ id, label, total: sum(items.filter((e) => e.category === id)) }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

export function rangeSummary(expenses: Expense[], range: Range, person: Person) {
  const items = filterExpenses(expenses, range, person);
  return { total: sum(items), byPerson: byPerson(items), byCategory: categoryTotals(items) };
}

export function monthsInRange(range: Range): string[] {
  const months: string[] = [];
  for (let m = range.start.slice(0, 7); m <= range.end.slice(0, 7); m = shiftMonth(m, 1)) months.push(m);
  return months;
}

export function change(prev: number | undefined, cur: number): Change {
  if (prev === undefined) return { kind: "none" };
  if (prev === cur) return { kind: "same" };
  if (prev === 0) return { kind: "new" };
  const pct = Math.round((Math.abs(cur - prev) / prev) * 100);
  return { kind: cur > prev ? "up" : "down", pct };
}

const lastDay = (month: string) => {
  const [y, m] = month.split("-").map(Number);
  return `${month}-${String(new Date(Date.UTC(y, m, 0)).getUTCDate()).padStart(2, "0")}`;
};

export function compareMonths(expenses: Expense[], range: Range, person: Person, now = new Date()) {
  const items = filterExpenses(expenses, range, person);
  const monthIds = monthsInRange(range);
  const inMonth = (month: string) => items.filter((e) => e.date.startsWith(`${month}-`));

  const months = monthIds.map((month) => {
    const list = inMonth(month);
    return {
      month,
      partial: range.start > `${month}-01` || range.end < lastDay(month),
      ongoing: month === currentMonth(now),
      total: sum(list),
      byPerson: byPerson(list),
    };
  });

  const withChanges = (amounts: number[]) => amounts.map((amount, i) => ({ amount, change: change(amounts[i - 1], amount) }));

  const rows = categoryTotals(items).map(({ id, label }) => ({
    id,
    label,
    cells: withChanges(monthIds.map((month) => sum(inMonth(month).filter((e) => e.category === id)))),
  }));

  return { months, rows, totals: withChanges(months.map((m) => m.total)) };
}

export const reportHref = (range: Range, person: Person) =>
  `/giderler/rapor?${new URLSearchParams({ bas: range.start, bit: range.end, kisi: person })}`;

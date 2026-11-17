import { test } from "node:test";
import assert from "node:assert/strict";
import type { Expense } from "./store.ts";
import { availableMonths, currentMonth, isMonth, summarize, today } from "./summary.ts";

let n = 0;
const e = (owner: Expense["owner"], date: string, amount: number, category: Expense["category"]): Expense => ({
  id: String(++n),
  owner,
  date,
  amount,
  category,
  createdAt: `2026-11-01T00:00:${String(n).padStart(2, "0")}Z`,
});

const expenses = [
  e("alptug", "2026-11-03", 1000, "yemek"),
  e("alptug", "2026-11-10", 2500, "ulasim"),
  e("alptug", "2026-11-10", 500, "yemek"),
  e("alptug", "2026-10-28", 9999, "giyim"),
  e("gamze", "2026-11-05", 4000, "kozmetik"),
  e("gamze", "2026-12-01", 100, "spor"),
];

test("summarize keeps only the owner's expenses for that month, newest first", () => {
  const s = summarize(expenses, "alptug", "2026-11");
  assert.deepEqual(s.items.map((x) => x.id), ["3", "2", "1"]);
  assert.equal(s.total, 4000);
});

test("summarize totals by category, largest first, skipping empty categories", () => {
  assert.deepEqual(summarize(expenses, "alptug", "2026-11").byCategory, [
    { id: "ulasim", label: "Ulaşım", total: 2500 },
    { id: "yemek", label: "Yemek", total: 1500 },
  ]);
});

test("summarize of an empty month is empty", () => {
  assert.deepEqual(summarize(expenses, "gamze", "2026-01"), { items: [], byCategory: [], total: 0 });
});

test("currentMonth uses Istanbul time", () => {
  assert.equal(currentMonth(new Date("2026-11-30T22:30:00Z")), "2026-12");
  assert.equal(currentMonth(new Date("2026-11-30T20:30:00Z")), "2026-11");
});

test("isMonth accepts YYYY-MM only", () => {
  assert.equal(isMonth("2026-11"), true);
  for (const x of ["2026-13", "2026-00", "2026-1", "x", undefined, 202611]) assert.equal(isMonth(x), false, String(x));
});

test("availableMonths lists recorded months plus the current one, newest first, once each", () => {
  assert.deepEqual(availableMonths(expenses, new Date("2027-02-10T12:00:00Z")), [
    "2027-02",
    "2026-12",
    "2026-11",
    "2026-10",
  ]);
  assert.deepEqual(availableMonths([], new Date("2026-11-17T12:00:00Z")), ["2026-11"]);
});

test("today uses Istanbul time", () => {
  assert.equal(today(new Date("2026-11-30T22:30:00Z")), "2026-12-01");
});

test("availableMonths includes the month being viewed even with no expenses in it", () => {
  assert.deepEqual(availableMonths([], new Date("2026-11-17T12:00:00Z"), "2026-08"), ["2026-11", "2026-08"]);
});

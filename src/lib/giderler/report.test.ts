import { test } from "node:test";
import assert from "node:assert/strict";
import type { Expense } from "./store.ts";
import {
  change,
  compareMonths,
  filterExpenses,
  monthsInRange,
  parsePerson,
  parseRange,
  presets,
  rangeSummary,
} from "./report.ts";

const NOW = new Date("2026-11-17T12:00:00Z");

let n = 0;
const e = (owner: Expense["owner"], date: string, amount: number, category: Expense["category"]): Expense => ({
  id: String(++n),
  owner,
  date,
  amount,
  category,
  createdAt: "2026-11-01T00:00:00Z",
});

const expenses = [
  e("alptug", "2026-08-31", 999, "yemek"), // outside the Sep–Nov ranges below
  e("alptug", "2026-09-01", 1000, "yemek"),
  e("gamze", "2026-09-20", 500, "kozmetik"),
  e("alptug", "2026-10-05", 1500, "yemek"),
  e("alptug", "2026-10-10", 7000, "kira"),
  e("gamze", "2026-11-02", 500, "kozmetik"),
  e("alptug", "2026-11-17", 7000, "kira"),
  e("gamze", "2026-11-18", 123, "spor"), // after the 17 Nov end
];

test("parseRange defaults to the last three months up to today", () => {
  assert.deepEqual(parseRange(undefined, undefined, NOW), { start: "2026-09-01", end: "2026-11-17" });
});

test("parseRange falls back to the default on garbage and swaps a reversed range", () => {
  assert.deepEqual(parseRange("abc", "2026-02-31", NOW), { start: "2026-09-01", end: "2026-11-17" });
  assert.deepEqual(parseRange("2026-11-10", "2026-10-01", NOW), { start: "2026-10-01", end: "2026-11-10" });
  assert.deepEqual(parseRange("2026-10-01", "2026-10-01", NOW), { start: "2026-10-01", end: "2026-10-01" });
});

test("parsePerson accepts the two users and defaults to both", () => {
  assert.equal(parsePerson("gamze"), "gamze");
  assert.equal(parsePerson("ikimiz"), "ikimiz");
  assert.equal(parsePerson("admin"), "ikimiz");
  assert.equal(parsePerson(undefined), "ikimiz");
});

test("presets are relative to today in Istanbul", () => {
  assert.deepEqual(
    presets(NOW).map((p) => [p.id, p.range.start, p.range.end]),
    [
      ["bu-ay", "2026-11-01", "2026-11-17"],
      ["son-3", "2026-09-01", "2026-11-17"],
      ["son-6", "2026-06-01", "2026-11-17"],
      ["bu-yil", "2026-01-01", "2026-11-17"],
    ],
  );
});

test("monthsInRange crosses year boundaries in order", () => {
  assert.deepEqual(monthsInRange({ start: "2026-11-20", end: "2027-02-03" }), ["2026-11", "2026-12", "2027-01", "2027-02"]);
  assert.deepEqual(monthsInRange({ start: "2026-10-01", end: "2026-10-31" }), ["2026-10"]);
});

test("filterExpenses includes both edge days and respects the person", () => {
  const range = { start: "2026-09-01", end: "2026-11-17" };
  assert.deepEqual(filterExpenses(expenses, range, "ikimiz").map((x) => x.date), [
    "2026-09-01",
    "2026-09-20",
    "2026-10-05",
    "2026-10-10",
    "2026-11-02",
    "2026-11-17",
  ]);
  assert.equal(filterExpenses(expenses, range, "gamze").length, 2);
});

test("rangeSummary totals by person and by category, largest first", () => {
  const s = rangeSummary(expenses, { start: "2026-09-01", end: "2026-11-17" }, "ikimiz");
  assert.equal(s.total, 17500);
  assert.deepEqual(s.byPerson, { alptug: 16500, gamze: 1000 });
  assert.deepEqual(s.byCategory.map((c) => [c.id, c.total]), [
    ["kira", 14000],
    ["yemek", 2500],
    ["kozmetik", 1000],
  ]);
});

test("change describes the move from the previous month", () => {
  assert.deepEqual(change(undefined, 500), { kind: "none" });
  assert.deepEqual(change(500, 500), { kind: "same" });
  assert.deepEqual(change(0, 500), { kind: "new" });
  assert.deepEqual(change(0, 0), { kind: "same" });
  assert.deepEqual(change(1000, 1540), { kind: "up", pct: 54 });
  assert.deepEqual(change(1000, 910), { kind: "down", pct: 9 });
  assert.deepEqual(change(1000, 0), { kind: "down", pct: 100 });
});

test("compareMonths builds month columns, category rows and totals", () => {
  const c = compareMonths(expenses, { start: "2026-09-01", end: "2026-11-17" }, "ikimiz", NOW);

  assert.deepEqual(
    c.months.map((m) => [m.month, m.partial, m.ongoing, m.total]),
    [
      ["2026-09", false, false, 1500],
      ["2026-10", false, false, 8500],
      ["2026-11", true, true, 7500],
    ],
  );
  assert.deepEqual(c.months[0].byPerson, { alptug: 1000, gamze: 500 });

  assert.deepEqual(
    c.rows.map((r) => [r.id, r.cells.map((x) => x.amount)]),
    [
      ["kira", [0, 7000, 7000]],
      ["yemek", [1000, 1500, 0]],
      ["kozmetik", [500, 0, 500]],
    ],
  );
  assert.deepEqual(c.rows[0].cells.map((x) => x.change.kind), ["none", "new", "same"]);
  assert.deepEqual(c.totals.map((x) => x.amount), [1500, 8500, 7500]);
});

test("compareMonths marks partial edge months and only counts days inside the range", () => {
  const c = compareMonths(expenses, { start: "2026-08-15", end: "2026-09-10" }, "alptug", NOW);
  assert.deepEqual(
    c.months.map((m) => [m.month, m.partial, m.ongoing, m.total]),
    [
      ["2026-08", true, false, 999],
      ["2026-09", true, false, 1000],
    ],
  );
});

test("compareMonths of an empty range has no rows", () => {
  const c = compareMonths(expenses, { start: "2026-01-01", end: "2026-02-28" }, "ikimiz", NOW);
  assert.deepEqual(c.rows, []);
  assert.deepEqual(c.totals.map((x) => x.amount), [0, 0]);
});

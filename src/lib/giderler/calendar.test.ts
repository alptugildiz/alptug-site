import { test } from "node:test";
import assert from "node:assert/strict";
import { calendarDays, shiftMonth } from "./calendar.ts";

test("calendarDays pads to a Monday-first grid", () => {
  // 1 Nov 2026 is a Sunday → six blanks before it
  const days = calendarDays("2026-11");
  assert.deepEqual(days.slice(0, 7), [null, null, null, null, null, null, "2026-11-01"]);
  assert.equal(days.at(-1), "2026-11-30");
  assert.equal(days.filter(Boolean).length, 30);
});

test("calendarDays needs no padding when the month starts on Monday", () => {
  // 1 Jun 2026 is a Monday
  assert.equal(calendarDays("2026-06")[0], "2026-06-01");
});

test("calendarDays knows leap years", () => {
  assert.equal(calendarDays("2028-02").at(-1), "2028-02-29");
  assert.equal(calendarDays("2026-02").at(-1), "2026-02-28");
});

test("shiftMonth moves across year boundaries", () => {
  assert.equal(shiftMonth("2026-12", 1), "2027-01");
  assert.equal(shiftMonth("2026-01", -1), "2025-12");
  assert.equal(shiftMonth("2026-11", 0), "2026-11");
});

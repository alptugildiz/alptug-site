import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTRY, parseAmount } from "./money.ts";

test("parseAmount reads Turkish and plain number formats as kuruş", () => {
  assert.equal(parseAmount("45"), 4500);
  assert.equal(parseAmount("89,90"), 8990);
  assert.equal(parseAmount("1.250,50"), 125050);
  assert.equal(parseAmount("1250.5"), 125050);
  assert.equal(parseAmount(" 12,5 "), 1250);
});

test("parseAmount rejects zero, negative, garbage and over-precise input", () => {
  for (const input of ["0", "-5", "abc", "", "1,234,5", "12,345"]) {
    assert.equal(parseAmount(input), null, input);
  }
});

test("formatTRY renders kuruş as Turkish lira", () => {
  const out = formatTRY(125050);
  assert.ok(out.includes("1.250,50"), out);
  assert.ok(out.includes("₺"), out);
});

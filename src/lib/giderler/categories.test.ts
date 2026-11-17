import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIES, categoryLabel, isCategory } from "./categories.ts";

test("rent is a category of its own", () => {
  assert.equal(isCategory("kira"), true);
  assert.equal(categoryLabel("kira"), "Kira");
});

test("category ids are unique and 'diğer' stays last", () => {
  const ids = CATEGORIES.map((c) => c.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(ids.at(-1), "diger");
});

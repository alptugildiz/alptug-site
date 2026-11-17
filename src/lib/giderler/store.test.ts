import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createStore, type ExpenseInput } from "./store.ts";

const tempDir = () => mkdtemp(path.join(tmpdir(), "giderler-"));
const input: ExpenseInput = { date: "2026-11-17", amount: 8990, category: "yemek", note: "  döner  " };

test("an empty directory lists no expenses", async () => {
  assert.deepEqual(await createStore(await tempDir()).list(), []);
});

test("a nested data dir that does not exist yet is created on first add", async () => {
  const dir = path.join(await tempDir(), "data");
  await createStore(dir).add("alptug", input);
  assert.equal((await createStore(dir).list()).length, 1);
});

test("added expenses are persisted to disk with id, createdAt and a trimmed note", async () => {
  const dir = await tempDir();
  const added = await createStore(dir).add("alptug", input);

  const [read] = await createStore(dir).list();
  assert.deepEqual(read, added);
  assert.ok(read.id);
  assert.ok(read.createdAt);
  assert.equal(read.owner, "alptug");
  assert.equal(read.note, "döner");
});

test("an empty note is dropped and long notes are capped at 200 chars", async () => {
  const store = createStore(await tempDir());
  const a = await store.add("gamze", { ...input, note: "   " });
  const b = await store.add("gamze", { ...input, note: "x".repeat(300) });
  assert.equal("note" in a, false);
  assert.equal(b.note?.length, 200);
});

test("concurrent adds all survive", async () => {
  const dir = await tempDir();
  const store = createStore(dir);
  await Promise.all(Array.from({ length: 20 }, (_, i) => store.add(i % 2 ? "alptug" : "gamze", input)));
  assert.equal((await createStore(dir).list()).length, 20);
});

test("owner mismatch: another user cannot update or remove an expense", async () => {
  const store = createStore(await tempDir());
  const added = await store.add("alptug", input);

  assert.equal(await store.update("gamze", added.id, { ...input, amount: 1 }), false);
  assert.equal(await store.remove("gamze", added.id), false);
  assert.deepEqual(await store.list(), [added]);
});

test("unknown ids are not updated or removed", async () => {
  const store = createStore(await tempDir());
  assert.equal(await store.update("alptug", "nope", input), false);
  assert.equal(await store.remove("alptug", "nope"), false);
});

test("the owner can update and remove their expense", async () => {
  const store = createStore(await tempDir());
  const added = await store.add("alptug", input);

  assert.equal(await store.update("alptug", added.id, { date: "2026-11-01", amount: 500, category: "spor" }), true);
  const [updated] = await store.list();
  assert.equal(updated.amount, 500);
  assert.equal(updated.category, "spor");
  assert.equal(updated.date, "2026-11-01");
  assert.equal("note" in updated, false);
  assert.equal(updated.createdAt, added.createdAt);

  assert.equal(await store.remove("alptug", added.id), true);
  assert.deepEqual(await store.list(), []);
});

test("no temp files are left behind", async () => {
  const dir = await tempDir();
  const store = createStore(dir);
  await Promise.all([store.add("alptug", input), store.add("gamze", input)]);
  assert.deepEqual(await readdir(dir), ["expenses.json"]);
});

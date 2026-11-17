import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  attemptLogin,
  createLoginLimiter,
  hashPassword,
  SESSION_MAX_AGE_S,
  signSession,
  verifyPassword,
  verifySession,
} from "./auth.ts";

const SECRET = "test-secret-that-is-long-enough-1234";

test("verifyPassword accepts the right password and rejects the wrong one", () => {
  const stored = hashPassword("gizli");
  assert.equal(verifyPassword("gizli", stored), true);
  assert.equal(verifyPassword("gizl", stored), false);
});

test("verifyPassword is false for missing or malformed hashes", () => {
  for (const stored of [undefined, "", "garbage", "scrypt:zz:zz", "scrypt:abcd", "scrypt$ab$cd"]) {
    assert.equal(verifyPassword("gizli", stored), false, String(stored));
  }
});

test("hashPassword salts every hash", () => {
  assert.notEqual(hashPassword("x"), hashPassword("x"));
});

test("verifySession round-trips a signed session", () => {
  assert.equal(verifySession(signSession("gamze", SECRET), SECRET), "gamze");
});

test("verifySession rejects a different secret, a tampered token and garbage", () => {
  const token = signSession("alptug", SECRET);
  assert.equal(verifySession(token, SECRET + "x"), null);
  const flipped = (token[0] === "a" ? "b" : "a") + token.slice(1);
  assert.equal(verifySession(flipped, SECRET), null);
  assert.equal(verifySession(undefined, SECRET), null);
  assert.equal(verifySession(token, undefined), null);
  assert.equal(verifySession("not.a-token", SECRET), null);
  assert.equal(verifySession("", SECRET), null);
});

test("verifySession rejects expired sessions", () => {
  const now = Date.UTC(2026, 10, 1);
  const token = signSession("alptug", SECRET, now);
  assert.equal(verifySession(token, SECRET, now + (SESSION_MAX_AGE_S - 60) * 1000), "alptug");
  assert.equal(verifySession(token, SECRET, now + 31 * 24 * 3600 * 1000), null);
});

test("verifySession rejects a validly signed payload for an unknown user", async () => {
  const { createHmac } = await import("node:crypto");
  const payload = Buffer.from(JSON.stringify({ u: "admin", exp: Date.now() + 60_000 })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  assert.equal(verifySession(`${payload}.${sig}`, SECRET), null);
});

test("login limiter blocks after 5 failures until the window passes or reset", () => {
  const limiter = createLoginLimiter();
  const t0 = 1_000_000;
  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.check("k", t0), true);
    limiter.fail("k", t0);
  }
  assert.equal(limiter.check("k", t0), false);
  assert.equal(limiter.check("other", t0), true);
  assert.equal(limiter.check("k", t0 + 15 * 60_000 + 1), true);

  for (let i = 0; i < 5; i++) limiter.fail("k", t0);
  limiter.reset("k");
  assert.equal(limiter.check("k", t0), true);
});

test("scripts/gider-hash.mjs prints a hash verifyPassword accepts", () => {
  const out = execFileSync(process.execPath, ["scripts/gider-hash.mjs", "deneme"], { encoding: "utf8" }).trim();
  assert.match(out, /^scrypt:[0-9a-f]+:[0-9a-f]+$/);
  assert.equal(verifyPassword("deneme", out), true);
});

test("hashes contain no $ so .env files don't expand them", () => {
  assert.equal(hashPassword("x").includes("$"), false);
});

const hashes = { alptug: hashPassword("a-pass"), gamze: hashPassword("g-pass") };

test("attemptLogin accepts the right user and password", () => {
  assert.equal(attemptLogin("alptug", "a-pass", hashes, createLoginLimiter()), "ok");
});

test("attemptLogin rate-limits per user, so nothing the client sends gets around it", () => {
  const limiter = createLoginLimiter();
  for (let i = 0; i < 5; i++) assert.equal(attemptLogin("alptug", "guess", hashes, limiter), "invalid");
  assert.equal(attemptLogin("alptug", "a-pass", hashes, limiter), "limited");
  assert.equal(attemptLogin("gamze", "g-pass", hashes, limiter), "ok");
});

test("attemptLogin rejects unknown users without counting them against anyone", () => {
  const limiter = createLoginLimiter();
  for (let i = 0; i < 20; i++) assert.equal(attemptLogin(`spoof-${i}`, "x", hashes, limiter), "invalid");
  assert.equal(attemptLogin("alptug", "a-pass", hashes, limiter), "ok");
});

test("attemptLogin is invalid when the user's hash is not configured", () => {
  assert.equal(attemptLogin("gamze", "g-pass", { alptug: hashes.alptug, gamze: undefined }, createLoginLimiter()), "invalid");
});

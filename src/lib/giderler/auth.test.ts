import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  attemptLogin,
  checkPassword,
  createLoginLimiter,
  deriveSessionSecret,
  SESSION_MAX_AGE_S,
  signSession,
  verifySession,
} from "./auth.ts";

const SECRET = "test-secret-that-is-long-enough-1234";

test("checkPassword accepts the exact password and rejects anything else", () => {
  assert.equal(checkPassword("gizli", "gizli"), true);
  assert.equal(checkPassword("gizl", "gizli"), false);
  assert.equal(checkPassword("gizli ", "gizli"), false);
  assert.equal(checkPassword("Gizli", "gizli"), false);
});

test("checkPassword is false when no password is configured", () => {
  assert.equal(checkPassword("", undefined), false);
  assert.equal(checkPassword("", ""), false);
  assert.equal(checkPassword("x", undefined), false);
});

test("deriveSessionSecret needs both passwords", () => {
  assert.equal(deriveSessionSecret({ alptug: "a", gamze: undefined }), undefined);
  assert.equal(deriveSessionSecret({ alptug: "", gamze: "g" }), undefined);
});

test("deriveSessionSecret is stable for the same passwords and changes when one changes", () => {
  const a = deriveSessionSecret({ alptug: "a-pass", gamze: "g-pass" });
  assert.ok(a && a.length >= 32);
  assert.equal(deriveSessionSecret({ alptug: "a-pass", gamze: "g-pass" }), a);
  assert.notEqual(deriveSessionSecret({ alptug: "a-pass2", gamze: "g-pass" }), a);
  // swapping or re-splitting the two passwords must not collide
  assert.notEqual(deriveSessionSecret({ alptug: "g-pass", gamze: "a-pass" }), a);
  assert.notEqual(deriveSessionSecret({ alptug: "a-passg", gamze: "-pass" }), a);
});

test("a password change logs existing sessions out", () => {
  const before = deriveSessionSecret({ alptug: "a-pass", gamze: "g-pass" });
  const after = deriveSessionSecret({ alptug: "new", gamze: "g-pass" });
  assert.equal(verifySession(signSession("gamze", before!), after), null);
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

test("verifySession rejects a validly signed payload for an unknown user", () => {
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

const passwords = { alptug: "a-pass", gamze: "g-pass" };

test("attemptLogin accepts the right user and password", () => {
  assert.equal(attemptLogin("alptug", "a-pass", passwords, createLoginLimiter()), "ok");
});

test("attemptLogin rejects another user's password", () => {
  assert.equal(attemptLogin("alptug", "g-pass", passwords, createLoginLimiter()), "invalid");
});

test("attemptLogin rate-limits per user, so nothing the client sends gets around it", () => {
  const limiter = createLoginLimiter();
  for (let i = 0; i < 5; i++) assert.equal(attemptLogin("alptug", "guess", passwords, limiter), "invalid");
  assert.equal(attemptLogin("alptug", "a-pass", passwords, limiter), "limited");
  assert.equal(attemptLogin("gamze", "g-pass", passwords, limiter), "ok");
});

test("attemptLogin rejects unknown users without counting them against anyone", () => {
  const limiter = createLoginLimiter();
  for (let i = 0; i < 20; i++) assert.equal(attemptLogin(`spoof-${i}`, "x", passwords, limiter), "invalid");
  assert.equal(attemptLogin("alptug", "a-pass", passwords, limiter), "ok");
});

test("attemptLogin is invalid when the user's password is not configured", () => {
  assert.equal(attemptLogin("gamze", "", { alptug: "a-pass", gamze: undefined }, createLoginLimiter()), "invalid");
});

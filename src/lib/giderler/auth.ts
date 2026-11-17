import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { isUser, type UserId } from "./categories.ts";

export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;

export type Passwords = Record<UserId, string | undefined>;

const digest = (s: string) => createHash("sha256").update(s).digest();

/** Plain passwords live in server env (GIDER_*_PASSWORD); comparing digests keeps it constant-time. */
export function checkPassword(input: string, expected: string | undefined): boolean {
  if (!expected) return false;
  return timingSafeEqual(digest(input), digest(expected));
}

/** Cookie signing key derived from both passwords, so changing either one logs everyone out. */
export function deriveSessionSecret(passwords: Passwords): string | undefined {
  if (!passwords.alptug || !passwords.gamze) return undefined;
  return createHmac("sha256", "giderler-session-v1")
    .update(JSON.stringify([passwords.alptug, passwords.gamze]))
    .digest("hex");
}

function sign(payload: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(payload).digest();
}

/** → "<base64url payload>.<base64url hmac>", payload { u, exp }. */
export function signSession(user: UserId, secret: string, now = Date.now()): string {
  const payload = Buffer.from(JSON.stringify({ u: user, exp: now + SESSION_MAX_AGE_S * 1000 })).toString("base64url");
  return `${payload}.${sign(payload, secret).toString("base64url")}`;
}

/** Never throws: anything unsigned, expired or malformed is simply no session. */
export function verifySession(token: string | undefined, secret: string | undefined, now = Date.now()): UserId | null {
  if (!token || !secret) return null;
  try {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;

    const expected = sign(payload, secret);
    const actual = Buffer.from(sig, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

    const { u, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return isUser(u) && typeof exp === "number" && exp > now ? u : null;
  } catch {
    return null;
  }
}

/** In-memory fixed-window limiter for login attempts; fine for a single container. */
export function createLoginLimiter(max = 5, windowMs = 15 * 60_000) {
  const failures = new Map<string, { count: number; since: number }>();

  return {
    check(key: string, now = Date.now()): boolean {
      const entry = failures.get(key);
      if (!entry || now - entry.since > windowMs) return true;
      return entry.count < max;
    },
    fail(key: string, now = Date.now()): void {
      const entry = failures.get(key);
      if (!entry || now - entry.since > windowMs) failures.set(key, { count: 1, since: now });
      else entry.count++;
    },
    reset(key: string): void {
      failures.delete(key);
    },
  };
}

export type LoginLimiter = ReturnType<typeof createLoginLimiter>;

/**
 * Keyed by user, not by IP: X-Forwarded-For is client-controlled, and with only two accounts
 * the limiter map stays bounded and made-up user names never reach the password check.
 */
export function attemptLogin(
  user: unknown,
  password: string,
  passwords: Passwords,
  limiter: LoginLimiter,
  now = Date.now(),
): "ok" | "invalid" | "limited" {
  if (!isUser(user)) return "invalid";
  if (!limiter.check(user, now)) return "limited";
  if (!checkPassword(password, passwords[user])) {
    limiter.fail(user, now);
    return "invalid";
  }
  limiter.reset(user);
  return "ok";
}

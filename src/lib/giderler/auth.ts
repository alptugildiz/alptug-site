import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { isUser, type UserId } from "./categories.ts";

// keep in sync with scripts/gider-hash.mjs
const SALT_BYTES = 16;
const KEY_BYTES = 64;

export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30;

/** → "scrypt:<saltHex>:<hashHex>" (no "$", which .env files would expand), the format stored in GIDER_*_PASSWORD_HASH. */
export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_BYTES);
  const hash = scryptSync(password, salt, KEY_BYTES);
  return `scrypt:${salt.toString("hex")}:${hash.toString("hex")}`;
}

export function verifyPassword(password: string, stored: string | undefined): boolean {
  const [scheme, saltHex, hashHex] = stored?.split(":") ?? [];
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, "hex");
  if (expected.length !== KEY_BYTES) return false;
  const actual = scryptSync(password, Buffer.from(saltHex, "hex"), KEY_BYTES);
  return timingSafeEqual(actual, expected);
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

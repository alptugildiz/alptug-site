import "server-only";
import { cookies } from "next/headers";
import {
  createLoginLimiter,
  deriveSessionSecret,
  SESSION_MAX_AGE_S,
  signSession,
  verifySession,
  type Passwords,
} from "./auth.ts";
import type { UserId } from "./categories.ts";

const COOKIE = "gider_session";

// lives here, not in actions.ts: a "use server" module may only export async functions
export const loginLimiter = createLoginLimiter();

export function configuredPasswords(): Passwords {
  return { alptug: process.env.GIDER_ALPTUG_PASSWORD, gamze: process.env.GIDER_GAMZE_PASSWORD };
}

export function sessionSecret(): string | undefined {
  return deriveSessionSecret(configuredPasswords());
}

export async function getUser(): Promise<UserId | null> {
  return verifySession((await cookies()).get(COOKIE)?.value, sessionSecret());
}

export async function startSession(user: UserId): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("GIDER_ALPTUG_PASSWORD / GIDER_GAMZE_PASSWORD are not configured");
  (await cookies()).set(COOKIE, signSession(user, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/giderler",
    maxAge: SESSION_MAX_AGE_S,
  });
}

export async function endSession(): Promise<void> {
  (await cookies()).delete({ name: COOKIE, path: "/giderler" });
}

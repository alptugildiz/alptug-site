import "server-only";
import { cookies } from "next/headers";
import { createLoginLimiter, SESSION_MAX_AGE_S, signSession, verifySession } from "./auth.ts";
import type { UserId } from "./categories.ts";

const COOKIE = "gider_session";

// lives here, not in actions.ts: a "use server" module may only export async functions
export const loginLimiter = createLoginLimiter();

export function sessionSecret(): string | undefined {
  const secret = process.env.GIDER_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : undefined;
}

export async function getUser(): Promise<UserId | null> {
  return verifySession((await cookies()).get(COOKIE)?.value, sessionSecret());
}

export async function startSession(user: UserId): Promise<void> {
  const secret = sessionSecret();
  if (!secret) throw new Error("GIDER_SESSION_SECRET is not configured");
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

// src/lib/session.ts
// The backend's JWT lives in an httpOnly cookie, so browser JavaScript can never read it.
import "server-only";
import { cookies } from "next/headers";

const TOKEN_COOKIE = "blog_token";

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(TOKEN_COOKIE)?.value;
}

// Only callable from Server Actions / Route Handlers
export async function setSession(token: string, expiresAt: string) {
  (await cookies()).set(TOKEN_COOKIE, token, {
    httpOnly: true,
    // HTTPS-only in production; set COOKIE_SECURE=false to serve a production build over plain HTTP
    secure: process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === "true" : process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // Expire together with the token so a stale token is never sent
    expires: new Date(expiresAt),
  });
}

// Only callable from Server Actions / Route Handlers
export async function clearSession() {
  (await cookies()).delete(TOKEN_COOKIE);
}

// src/lib/auth.ts
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getMe } from "@/lib/api";
import type { User } from "@/lib/api";
import { getToken } from "@/lib/session";

// The logged-in user, or null. Cached so the layout and page share one /auth/me call per request.
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await getMe(token);
  } catch {
    // Expired/invalid token, or the API is down: treat as logged out
    return null;
  }
});

// For pages that need a login; sends the visitor to /login and back afterwards
export async function requireUser(returnTo: string): Promise<{ user: User; token: string }> {
  const [user, token] = await Promise.all([getCurrentUser(), getToken()]);
  if (!user || !token) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return { user, token };
}

// Only allow redirects to paths on this site (no "//evil.com" or absolute URLs)
export function safeRedirectPath(value: FormDataEntryValue | string | null | undefined): string {
  const path = typeof value === "string" ? value : "";
  return path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/\\") ? path : "/";
}

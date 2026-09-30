"use server";
// src/app/actions/auth.ts
import { redirect } from "next/navigation";
import * as api from "@/lib/api";
import { safeRedirectPath } from "@/lib/auth";
import { toFormState } from "@/lib/form";
import type { FormState } from "@/lib/form";
import { clearSession, setSession } from "@/lib/session";

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let auth: api.AuthResponse;
  try {
    auth = await api.login({ email, password });
  } catch (err) {
    return toFormState(err, { email });
  }

  await setSession(auth.token, auth.expiresAt);
  redirect(safeRedirectPath(formData.get("next")));
}

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "");
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  let auth: api.AuthResponse;
  try {
    auth = await api.register({ name, email, password });
  } catch (err) {
    return toFormState(err, { name, email });
  }

  await setSession(auth.token, auth.expiresAt);
  redirect(safeRedirectPath(formData.get("next")));
}

export async function logout() {
  await clearSession();
  redirect("/");
}

"use client";
// src/components/AuthForm.tsx
import Link from "next/link";
import { useActionState } from "react";
import { login, register } from "@/app/actions/auth";
import ErrorBanner from "./ErrorBanner";
import FormField, { inputClass } from "./FormField";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const isRegister = mode === "register";
  const [state, action, pending] = useActionState(isRegister ? register : login, undefined);
  const otherHref = `${isRegister ? "/login" : "/register"}${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-1">
          {isRegister ? "Create an account" : "Log in"}
        </h1>
        <p className="text-sm text-muted mb-6">
          {isRegister ? "Start writing and publishing posts." : "Welcome back."}
        </p>

        {state?.message && (
          <div className="mb-5">
            <ErrorBanner message={state.message} />
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="next" value={next} />

          {isRegister && (
            <FormField id="name" label="Name" error={state?.errors?.name}>
              <input
                id="name"
                name="name"
                autoComplete="name"
                required
                defaultValue={state?.values?.name}
                aria-invalid={!!state?.errors?.name}
                className={inputClass}
              />
            </FormField>
          )}

          <FormField id="email" label="Email" error={state?.errors?.email}>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              defaultValue={state?.values?.email}
              aria-invalid={!!state?.errors?.email}
              className={inputClass}
            />
          </FormField>

          <FormField
            id="password"
            label="Password"
            error={state?.errors?.password}
            hint={isRegister ? "At least 8 characters." : undefined}
          >
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? "new-password" : "current-password"}
              required
              minLength={isRegister ? 8 : undefined}
              aria-invalid={!!state?.errors?.password}
              className={inputClass}
            />
          </FormField>

          <button
            type="submit"
            disabled={pending}
            className="w-full px-5 py-2.5 rounded-xl bg-accent hover:bg-blue-700 disabled:opacity-60 text-sm font-medium text-white transition-colors"
          >
            {pending ? "Please wait…" : isRegister ? "Create account" : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted text-center">
          {isRegister ? "Already have an account? " : "New here? "}
          <Link href={otherHref} className="text-accent hover:underline">
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </div>
  );
}

// src/app/register/page.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getCurrentUser, safeRedirectPath } from "@/lib/auth";

export const metadata: Metadata = { title: "Create an account | Blog Platform" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeRedirectPath((await searchParams).next);
  if (await getCurrentUser()) {
    redirect(next);
  }
  return <AuthForm mode="register" next={next} />;
}

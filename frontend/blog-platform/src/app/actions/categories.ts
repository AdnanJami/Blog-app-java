"use server";
// src/app/actions/categories.ts
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import * as api from "@/lib/api";
import { toFormState } from "@/lib/form";
import type { FormState } from "@/lib/form";
import { getToken } from "@/lib/session";

export async function createCategory(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get("name") ?? "");

  const token = await getToken();
  if (!token) {
    redirect("/login?next=/categories");
  }

  try {
    await api.createCategory(name, token);
  } catch (err) {
    return toFormState(err, { name });
  }

  revalidatePath("/categories");
  return { success: true };
}

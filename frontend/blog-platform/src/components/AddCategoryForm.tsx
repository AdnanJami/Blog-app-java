"use client";
// src/components/AddCategoryForm.tsx
import { useActionState } from "react";
import { createCategory } from "@/app/actions/categories";
import { inputClass } from "./FormField";

export default function AddCategoryForm() {
  const [state, action, pending] = useActionState(createCategory, undefined);
  const error = state?.errors?.name ?? state?.message;

  return (
    <form action={action} className="mb-8">
      <div className="flex gap-2 max-w-md">
        <label htmlFor="new-category" className="sr-only">
          New category name
        </label>
        <input
          id="new-category"
          name="name"
          placeholder="New category name"
          required
          maxLength={50}
          defaultValue={state?.success ? "" : state?.values?.name}
          aria-invalid={!!error}
          className={inputClass}
        />
        <button
          type="submit"
          disabled={pending}
          className="px-5 py-2 rounded-xl bg-accent hover:bg-blue-700 disabled:opacity-60 text-sm font-medium text-white whitespace-nowrap transition-colors"
        >
          {pending ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-xs text-error-text">{error}</p>}
    </form>
  );
}

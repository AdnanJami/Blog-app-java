// src/lib/form.ts
import { ApiError } from "@/lib/api";

// What a Server Action returns to its form (via useActionState)
export type FormState =
  | {
      // General error shown above the form
      message?: string;
      // Field -> error message
      errors?: Record<string, string>;
      // Submitted values, so the form can show them again after an error
      values?: Record<string, string>;
      // Set when the action succeeded without redirecting
      success?: boolean;
    }
  | undefined;

// Turns a failed API call into form errors
export function toFormState(err: unknown, values?: Record<string, string>): FormState {
  if (err instanceof ApiError) {
    return err.errors
      ? { message: "Please fix the highlighted fields.", errors: err.errors, values }
      : { message: err.message, values };
  }
  return { message: "Can't reach the server. Please try again later.", values };
}

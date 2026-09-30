"use client";
// src/components/DeletePostButton.tsx
import { useActionState } from "react";
import { deletePost } from "@/app/actions/posts";

export default function DeletePostButton({ postId }: { postId: string }) {
  const [state, action, pending] = useActionState(deletePost.bind(null, postId), undefined);

  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this post? This can't be undone.")) e.preventDefault();
      }}
      className="inline-flex items-center gap-2"
    >
      <button
        type="submit"
        disabled={pending}
        className="px-4 py-1.5 rounded-lg text-sm font-medium text-error-text hover:bg-error-bg disabled:opacity-60 transition-colors"
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state?.message && <span className="text-xs text-error-text">{state.message}</span>}
    </form>
  );
}

"use client";
// src/components/PostEditor.tsx
import Link from "next/link";
import { useActionState } from "react";
import { savePost } from "@/app/actions/posts";
import type { Category, Post } from "@/lib/api";
import ErrorBanner from "./ErrorBanner";
import FormField, { inputClass } from "./FormField";

export default function PostEditor({ post, categories }: { post?: Post; categories: Category[] }) {
  // Editing binds the post id; creating passes null
  const [state, action, pending] = useActionState(savePost.bind(null, post?.id ?? null), undefined);

  // After a failed save show what was submitted, otherwise the post being edited
  const values = state?.values ?? {
    title: post?.title ?? "",
    content: post?.content ?? "",
    categoryId: post?.category.id ?? "",
    tags: post?.tags.map((t) => t.name).join(", ") ?? "",
  };
  const errors = state?.errors ?? {};

  return (
    <form action={action} className="space-y-5">
      {state?.message && <ErrorBanner message={state.message} />}

      <FormField id="title" label="Title" error={errors.title}>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          defaultValue={values.title}
          aria-invalid={!!errors.title}
          className={`${inputClass} text-base font-medium`}
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <FormField id="categoryId" label="Category" error={errors.categoryId}>
          {categories.length > 0 ? (
            // key: re-mount so the default selection updates after a failed save
            <select
              key={values.categoryId}
              id="categoryId"
              name="categoryId"
              required
              defaultValue={values.categoryId}
              aria-invalid={!!errors.categoryId}
              className={inputClass}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-muted py-2.5">
              No categories yet.{" "}
              <Link href="/categories" className="text-accent hover:underline">
                Create one first
              </Link>
              .
            </p>
          )}
        </FormField>

        <FormField id="tags" label="Tags" error={errors.tags} hint="Comma-separated, e.g. java, spring">
          <input
            id="tags"
            name="tags"
            defaultValue={values.tags}
            aria-invalid={!!errors.tags}
            className={inputClass}
          />
        </FormField>
      </div>

      <FormField id="content" label="Content" error={errors.content}>
        <textarea
          id="content"
          name="content"
          required
          rows={16}
          defaultValue={values.content}
          aria-invalid={!!errors.content}
          className={`${inputClass} leading-relaxed resize-y`}
        />
      </FormField>

      <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
        <Link
          href={post ? `/posts/${post.id}` : "/"}
          className="px-5 py-2 rounded-xl text-sm font-medium text-muted hover:text-ink transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          name="status"
          value="DRAFT"
          disabled={pending || categories.length === 0}
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-sm font-medium text-ink transition-colors"
        >
          {post?.status === "PUBLISHED" ? "Unpublish to draft" : "Save draft"}
        </button>
        <button
          type="submit"
          name="status"
          value="PUBLISHED"
          disabled={pending || categories.length === 0}
          className="px-5 py-2 rounded-xl bg-accent hover:bg-blue-700 disabled:opacity-60 text-sm font-medium text-white transition-colors"
        >
          {pending ? "Saving…" : post?.status === "PUBLISHED" ? "Update" : "Publish"}
        </button>
      </div>
    </form>
  );
}

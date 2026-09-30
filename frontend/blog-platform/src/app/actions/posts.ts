"use server";
// src/app/actions/posts.ts
import { redirect } from "next/navigation";
import * as api from "@/lib/api";
import type { PostStatus } from "@/lib/api";
import { toFormState } from "@/lib/form";
import type { FormState } from "@/lib/form";
import { clearSession, getToken } from "@/lib/session";

// "java, Spring Boot ,java" -> ["java", "spring boot"]
function parseTagNames(value: string): string[] {
  const names = value
    .split(",")
    .map((name) => name.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(names)];
}

// Creates the post, or updates it when postId is given (bound by the edit page)
export async function savePost(postId: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  const values = {
    title: String(formData.get("title") ?? ""),
    content: String(formData.get("content") ?? ""),
    categoryId: String(formData.get("categoryId") ?? ""),
    tags: String(formData.get("tags") ?? ""),
  };
  // Set by whichever submit button was clicked ("Save draft" or "Publish")
  const status: PostStatus = formData.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

  const token = await getToken();
  if (!token) {
    redirect(`/login?next=${encodeURIComponent(postId ? `/posts/${postId}/edit` : "/posts/new")}`);
  }

  let tagIds: string[] = [];
  const tagNames = parseTagNames(values.tags);
  if (tagNames.length > 0) {
    try {
      tagIds = (await api.createTags(tagNames, token)).map((tag) => tag.id);
    } catch (err) {
      const state = toFormState(err, values);
      // Tag validation errors are keyed like "names[]"; show them on the tags field
      return state?.errors ? { ...state, errors: { tags: Object.values(state.errors)[0] } } : state;
    }
  }

  const input = {
    title: values.title,
    content: values.content,
    categoryId: values.categoryId,
    tagIds,
    status,
  };

  let saved: api.Post;
  try {
    saved = postId ? await api.updatePost(postId, input, token) : await api.createPost(input, token);
  } catch (err) {
    if (err instanceof api.ApiError && err.status === 401) {
      await clearSession();
      redirect("/login");
    }
    return toFormState(err, values);
  }

  redirect(`/posts/${saved.id}`);
}

export async function deletePost(postId: string): Promise<FormState> {
  const token = await getToken();
  if (!token) {
    redirect("/login");
  }

  try {
    await api.deletePost(postId, token);
  } catch (err) {
    return toFormState(err);
  }

  redirect("/");
}

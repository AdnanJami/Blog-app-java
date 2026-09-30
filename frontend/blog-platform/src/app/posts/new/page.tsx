// src/app/posts/new/page.tsx
import type { Metadata } from "next";
import PostEditor from "@/components/PostEditor";
import ErrorBanner from "@/components/ErrorBanner";
import { getCategories } from "@/lib/api";
import type { Category } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New post | Blog Platform" };

export default async function NewPostPage() {
  await requireUser("/posts/new");

  let categories: Category[] | null = null;
  try {
    categories = await getCategories();
  } catch {
    // Shown below
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">New post</h1>
        {categories ? (
          <PostEditor categories={categories} />
        ) : (
          <ErrorBanner message="Failed to load categories. Please try again later." />
        )}
      </div>
    </div>
  );
}

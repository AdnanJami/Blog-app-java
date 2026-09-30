// src/app/posts/[id]/edit/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostEditor from "@/components/PostEditor";
import ErrorBanner from "@/components/ErrorBanner";
import { ApiError, getCategories, getPost } from "@/lib/api";
import type { Category, Post } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Edit post | Blog Platform" };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user, token } = await requireUser(`/posts/${id}/edit`);

  let post: Post;
  let categories: Category[];
  try {
    [post, categories] = await Promise.all([getPost(id, token), getCategories()]);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      notFound();
    }
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <ErrorBanner message="Failed to load this post. Please try again later." />
      </div>
    );
  }

  // Only the author may edit; the API enforces this too
  if (post.author.id !== user.id) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">Edit post</h1>
        <PostEditor post={post} categories={categories} />
      </div>
    </div>
  );
}

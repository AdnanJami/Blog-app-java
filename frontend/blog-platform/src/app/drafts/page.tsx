// src/app/drafts/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import ErrorBanner from "@/components/ErrorBanner";
import { getDrafts } from "@/lib/api";
import type { Post } from "@/lib/api";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Drafts | Blog Platform" };

export default async function DraftsPage() {
  const { token } = await requireUser("/drafts");

  let drafts: Post[] = [];
  let error = false;
  try {
    drafts = await getDrafts(token);
  } catch {
    error = true;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <h1 className="font-display font-bold text-2xl text-ink">Your drafts</h1>
          <Link
            href="/posts/new"
            className="px-4 py-2 rounded-xl bg-accent hover:bg-blue-700 text-sm font-medium text-white transition-colors"
          >
            New post
          </Link>
        </div>

        {error ? (
          <ErrorBanner message="Failed to load your drafts. Please try again later." />
        ) : drafts.length === 0 ? (
          <p className="text-center py-16 text-muted text-sm">
            No drafts. Posts you save as a draft show up here, visible only to you.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drafts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

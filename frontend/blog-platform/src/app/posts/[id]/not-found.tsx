// src/app/posts/[id]/not-found.tsx
import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-10 text-center">
        <h1 className="font-display font-bold text-2xl text-ink mb-2">Post not found</h1>
        <p className="text-sm text-muted mb-6">
          This post doesn&apos;t exist or is no longer available.
        </p>
        <Link
          href="/"
          className="inline-block px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
        >
          Back to all posts
        </Link>
      </div>
    </div>
  );
}

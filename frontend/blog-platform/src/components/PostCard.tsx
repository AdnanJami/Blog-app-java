// src/components/PostCard.tsx
import Link from "next/link";
import type { Post } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  "Next.js":    "bg-blue-100 text-blue-700",
  React:        "bg-cyan-100 text-cyan-700",
  TypeScript:   "bg-indigo-100 text-indigo-700",
  CSS:          "bg-pink-100 text-pink-700",
  Backend:      "bg-emerald-100 text-emerald-700",
  Database:     "bg-amber-100 text-amber-700",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PostCard({ post }: { post: Post }) {
  const colorClass =
    CATEGORY_COLORS[post.category] ?? "bg-gray-100 text-gray-700";

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 animate-fade-up"
    >
      {/* Category badge */}
      <span
        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${colorClass}`}
      >
        {post.category}
      </span>

      {/* Title */}
      <h2 className="font-display font-semibold text-lg text-ink leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </h2>

      {/* Excerpt */}
      <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
        {post.excerpt}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-mono"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-4 border-t border-border">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {initials(post.author.name)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink truncate">
            {post.author.name}
          </p>
          <p className="text-xs text-muted">
            {formatDate(post.publishedAt)} · {post.readTime} min read
          </p>
        </div>
      </div>
    </Link>
  );
}

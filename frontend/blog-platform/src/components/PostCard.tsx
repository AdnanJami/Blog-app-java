// src/components/PostCard.tsx
import Link from "next/link";
import type { Post } from "@/lib/api";
import { categoryColor, excerpt, formatDate, initials } from "@/lib/format";

export default function PostCard({ post }: { post: Post }) {
  const colorClass = categoryColor(post.category.name);

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5 animate-fade-up"
    >
      {/* Category badge */}
      <span
        className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${colorClass}`}
      >
        {post.category.name}
      </span>

      {/* Title */}
      <h2 className="font-display font-semibold text-lg text-ink leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
        {post.title}
      </h2>

      {/* Excerpt */}
      <p className="text-sm text-muted leading-relaxed line-clamp-3 mb-4">
        {excerpt(post.content)}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {post.tags.slice(0, 3).map((tag) => (
          <span
            key={tag.id}
            className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 font-mono"
          >
            #{tag.name}
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
            {formatDate(post.createdAt)} · {post.readingTime} min read
          </p>
        </div>
      </div>
    </Link>
  );
}

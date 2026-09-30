// src/app/tags/page.tsx
import { getTags } from "@/lib/api";
import Link from "next/link";
import type { Tag } from "@/lib/api";

export default async function TagsPage() {
  let tags: Tag[] = [];
  let error = false;

  try {
    tags = await getTags();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-8">Tags</h1>

        {error ? (
          <div className="rounded-2xl border border-error-border bg-error-bg px-6 py-4">
            <p className="text-sm text-error-text">
              Failed to load tags. Please try again later.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tagId=${tag.id}`}
                className="group flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-gray-50 hover:border-accent hover:bg-blue-50 transition-all"
              >
                <span className="font-mono text-sm text-gray-600 group-hover:text-accent transition-colors">
                  #{tag.name}
                </span>
                <span className="text-xs text-muted bg-white rounded-full px-2 py-0.5 border border-border">
                  {tag.postCount}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// src/app/categories/page.tsx
import { getCategories } from "@/lib/api";
import Link from "next/link";
import type { Tag } from "@/lib/api";
export default async function CategoriesPage() {
  let categories: Tag[] = [];
  let error = false;

  try {
    categories = await getCategories();
  } catch {
    error = true;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="bg-white rounded-2xl shadow-card p-8">
        <h1 className="font-display font-bold text-2xl text-ink mb-8">
          Categories
        </h1>

        {error ? (
          <div className="rounded-2xl border border-error-border bg-error-bg px-6 py-4">
            <p className="text-sm text-error-text">
              Failed to load categories. Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/?category=${cat.slug}`}
                className="group p-5 rounded-xl border border-border hover:border-accent hover:shadow-card-hover transition-all"
              >
                <h2 className="font-semibold text-ink group-hover:text-accent transition-colors mb-1">
                  {cat.name}
                </h2>
                <p className="text-sm text-muted">{cat.postCount} posts</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

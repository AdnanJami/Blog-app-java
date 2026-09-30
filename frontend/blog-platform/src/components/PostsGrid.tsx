"use client";
// src/components/PostsGrid.tsx
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPosts, getCategories } from "@/lib/api";
import type { Post, Category } from "@/lib/api";
import PostCard from "./PostCard";
import SkeletonCard from "./SkeletonCard";
import ErrorBanner from "./ErrorBanner";

const PAGE_SIZE = 9;

// Posts loaded for one combination of filters; `key` records which one
interface Feed {
  key: string;
  posts: Post[];
  page: number;
  totalPages: number;
  error: string | null;
}

function postsHref(categoryId: string | null, tagId: string | null) {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  if (tagId) params.set("tagId", tagId);
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

export default function PostsGrid() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const categoryId   = searchParams.get("categoryId");
  const tagId        = searchParams.get("tagId");
  const filterKey    = `${categoryId ?? ""}|${tagId ?? ""}`;

  const [categories, setCategories]   = useState<Category[]>([]);
  const [feed, setFeed]               = useState<Feed | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Still loading until the feed matches the filters in the URL
  const loading = feed?.key !== filterKey;

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Load the first page whenever the filters change
  useEffect(() => {
    let ignore = false;
    getPosts({
      categoryId: categoryId ?? undefined,
      tagId: tagId ?? undefined,
      page: 0,
      size: PAGE_SIZE,
    })
      .then((res) => {
        if (!ignore) {
          setFeed({ key: filterKey, posts: res.content, page: 0, totalPages: res.page.totalPages, error: null });
        }
      })
      .catch(() => {
        if (!ignore) {
          setFeed({ key: filterKey, posts: [], page: 0, totalPages: 0, error: "Failed to load content. Please try again later." });
        }
      });
    return () => {
      ignore = true;
    };
  }, [categoryId, tagId, filterKey]);

  async function loadMore() {
    if (!feed || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await getPosts({
        categoryId: categoryId ?? undefined,
        tagId: tagId ?? undefined,
        page: feed.page + 1,
        size: PAGE_SIZE,
      });
      // Ignore the result if the filters changed while it was loading
      setFeed((current) =>
        current && current.key === feed.key
          ? { ...current, posts: [...current.posts, ...res.content], page: res.page.number, totalPages: res.page.totalPages }
          : current,
      );
    } catch {
      setFeed((current) =>
        current && current.key === feed.key
          ? { ...current, error: "Failed to load more posts. Please try again later." }
          : current,
      );
    } finally {
      setLoadingMore(false);
    }
  }

  const tabs = [{ id: null, label: "All Posts" }, ...categories.map((c) => ({ id: c.id, label: c.name }))];

  // Name of the active tag filter, taken from the loaded posts
  const tagName = tagId
    ? feed?.posts.flatMap((p) => p.tags).find((t) => t.id === tagId)?.name
    : undefined;

  const posts   = loading ? [] : feed.posts;
  const hasMore = !loading && feed.page + 1 < feed.totalPages;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-8 pt-8 pb-0">
        <h1 className="font-display font-bold text-2xl text-ink mb-6">
          Blog Posts
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto border-b border-border pb-0 -mb-px scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id ?? "all"}
              onClick={() => router.replace(postsHref(tab.id, tagId), { scroll: false })}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                categoryId === tab.id
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {tagId && (
          <div className="flex items-center gap-2 mb-6 text-sm text-muted">
            <span>Tagged</span>
            <span className="font-mono px-2 py-0.5 rounded-md bg-blue-50 text-accent">
              #{tagName ?? "tag"}
            </span>
            <button
              onClick={() => router.replace(postsHref(categoryId, null), { scroll: false })}
              className="text-xs underline hover:text-ink"
            >
              Clear
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : feed.error && posts.length === 0 ? (
          <ErrorBanner message={feed.error} />
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No posts found here yet.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, i) => (
                <div key={post.id} style={{ animationDelay: `${(i % PAGE_SIZE) * 60}ms` }}>
                  <PostCard post={post} />
                </div>
              ))}
            </div>

            {feed.error && (
              <div className="mt-6">
                <ErrorBanner message={feed.error} />
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-60 text-sm font-medium text-ink transition-colors"
                >
                  {loadingMore ? "Loading…" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

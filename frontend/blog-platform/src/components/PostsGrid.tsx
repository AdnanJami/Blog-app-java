"use client";
// src/components/PostsGrid.tsx
import { useState, useEffect } from "react";
import { getPosts, getCategories } from "@/lib/api";
import type { Post, Category } from "@/lib/api";
import PostCard from "./PostCard";
import SkeletonCard from "./SkeletonCard";
import ErrorBanner from "./ErrorBanner";

export default function PostsGrid() {
  const [posts, setPosts]           = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab]   = useState<string>("all");
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  // Load categories once
  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // Load posts when tab changes
  useEffect(() => {
    setLoading(true);
    setError(null);
    const cat = activeTab === "all" ? undefined : activeTab;
    getPosts(cat)
      .then(setPosts)
      .catch(() => setError("Failed to load content. Please try again later."))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const tabs = [{ id: "all", label: "All Posts" }, ...categories.map((c) => ({ id: c.name, label: c.name }))];

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
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
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
        {error ? (
          <ErrorBanner message={error} />
        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm">
            No posts found in this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, i) => (
              <div key={post.id} style={{ animationDelay: `${i * 60}ms` }}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

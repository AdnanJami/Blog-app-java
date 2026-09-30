// src/app/page.tsx
import { Suspense } from "react";
import PostsGrid from "@/components/PostsGrid";
import SkeletonCard from "@/components/SkeletonCard";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* PostsGrid reads the filters from the URL, which needs a Suspense boundary */}
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        }
      >
        <PostsGrid />
      </Suspense>
    </div>
  );
}

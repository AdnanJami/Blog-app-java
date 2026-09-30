// src/app/page.tsx
import PostsGrid from "@/components/PostsGrid";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PostsGrid />
    </div>
  );
}

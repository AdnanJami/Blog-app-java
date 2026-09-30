// src/app/posts/[id]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApiError, getPost } from "@/lib/api";
import type { Post } from "@/lib/api";
import { categoryColor, excerpt, formatDate, initials } from "@/lib/format";
import ErrorBanner from "@/components/ErrorBanner";

type Props = { params: Promise<{ id: string }> };

// Missing posts and malformed ids both come back as null; other failures throw
async function loadPost(id: string): Promise<Post | null> {
  try {
    return await getPost(id);
  } catch (err) {
    if (err instanceof ApiError && (err.status === 404 || err.status === 400)) {
      return null;
    }
    throw err;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const post = await loadPost(id);
    if (post) {
      return { title: `${post.title} | Blog Platform`, description: excerpt(post.content) };
    }
  } catch {
    // The page itself shows the error
  }
  return { title: "Blog Platform" };
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;

  let post: Post | null;
  try {
    post = await loadPost(id);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <ErrorBanner message="Failed to load this post. Please try again later." />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const edited = post.updatedAt.slice(0, 16) !== post.createdAt.slice(0, 16);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link href="/" className="inline-block text-sm text-muted hover:text-ink mb-6">
        ← All posts
      </Link>

      <article className="bg-white rounded-2xl shadow-card p-8 md:p-10 animate-fade-up">
        <Link
          href={`/?categoryId=${post.category.id}`}
          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-4 hover:opacity-80 ${categoryColor(post.category.name)}`}
        >
          {post.category.name}
        </Link>

        <h1 className="font-display font-bold text-3xl text-ink leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-3 pb-6 mb-8 border-b border-border">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {initials(post.author.name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{post.author.name}</p>
            <p className="text-xs text-muted">
              {formatDate(post.createdAt)} · {post.readingTime} min read
              {edited && <> · Updated {formatDate(post.updatedAt)}</>}
            </p>
          </div>
        </div>

        <div className="text-ink leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </div>

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-10 pt-6 border-t border-border">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/?tagId=${tag.id}`}
                className="text-xs px-2.5 py-1 rounded-md bg-gray-100 text-gray-500 font-mono hover:bg-blue-50 hover:text-accent transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

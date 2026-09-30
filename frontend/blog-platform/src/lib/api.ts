// src/lib/api.ts
// Replace these mock functions with real API calls to your backend

export interface Post {
  id: string;
  title: string;
  excerpt: string;
  author: { name: string; avatar?: string };
  category: string;
  tags: string[];
  publishedAt: string;
  readTime: number;
  coverImage?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_POSTS: Post[] = [
  {
    id: "1",
    title: "Getting Started with Next.js 14 App Router",
    excerpt:
      "Explore the new App Router in Next.js 14, learn about Server Components, and understand how to build performant React applications.",
    author: { name: "Alex Chen" },
    category: "Next.js",
    tags: ["nextjs", "react", "webdev"],
    publishedAt: "2024-03-15",
    readTime: 8,
  },
  {
    id: "2",
    title: "Mastering TypeScript Generics",
    excerpt:
      "A deep dive into TypeScript generics — from basic usage to advanced patterns that will make your code more reusable and type-safe.",
    author: { name: "Sarah Kim" },
    category: "TypeScript",
    tags: ["typescript", "javascript"],
    publishedAt: "2024-03-10",
    readTime: 12,
  },
  {
    id: "3",
    title: "Tailwind CSS Best Practices in 2024",
    excerpt:
      "Tips, tricks, and patterns for writing maintainable Tailwind CSS at scale. Learn how to avoid common pitfalls and keep your styles clean.",
    author: { name: "Marco Rossi" },
    category: "CSS",
    tags: ["tailwindcss", "css", "frontend"],
    publishedAt: "2024-03-05",
    readTime: 6,
  },
  {
    id: "4",
    title: "Building Real-Time Apps with WebSockets",
    excerpt:
      "Learn how to integrate WebSockets into your Next.js application to build live dashboards, chat features, and collaborative tools.",
    author: { name: "Priya Patel" },
    category: "Backend",
    tags: ["websockets", "nodejs", "realtime"],
    publishedAt: "2024-02-28",
    readTime: 10,
  },
  {
    id: "5",
    title: "React Server Components Explained",
    excerpt:
      "Understand the mental model behind React Server Components, when to use them, and how they change the way we think about data fetching.",
    author: { name: "Alex Chen" },
    category: "React",
    tags: ["react", "rsc", "nextjs"],
    publishedAt: "2024-02-20",
    readTime: 9,
  },
  {
    id: "6",
    title: "Database Design Patterns for SaaS",
    excerpt:
      "Explore multi-tenancy strategies, schema design patterns, and indexing techniques for building scalable SaaS applications.",
    author: { name: "Jordan Lee" },
    category: "Database",
    tags: ["postgres", "database", "saas"],
    publishedAt: "2024-02-15",
    readTime: 14,
  },
];

const MOCK_CATEGORIES: Category[] = [
  { id: "1", name: "Next.js",    slug: "nextjs",     postCount: 12 },
  { id: "2", name: "React",      slug: "react",      postCount: 24 },
  { id: "3", name: "TypeScript", slug: "typescript", postCount: 18 },
  { id: "4", name: "CSS",        slug: "css",        postCount: 9  },
  { id: "5", name: "Backend",    slug: "backend",    postCount: 15 },
  { id: "6", name: "Database",   slug: "database",   postCount: 7  },
];

const MOCK_TAGS: Tag[] = [
  { id: "1",  name: "nextjs",      slug: "nextjs",      postCount: 14 },
  { id: "2",  name: "react",       slug: "react",       postCount: 30 },
  { id: "3",  name: "typescript",  slug: "typescript",  postCount: 20 },
  { id: "4",  name: "webdev",      slug: "webdev",      postCount: 45 },
  { id: "5",  name: "javascript",  slug: "javascript",  postCount: 38 },
  { id: "6",  name: "css",         slug: "css",         postCount: 11 },
  { id: "7",  name: "tailwindcss", slug: "tailwindcss", postCount: 8  },
  { id: "8",  name: "nodejs",      slug: "nodejs",      postCount: 17 },
  { id: "9",  name: "postgres",    slug: "postgres",    postCount: 6  },
  { id: "10", name: "frontend",    slug: "frontend",    postCount: 22 },
  { id: "11", name: "saas",        slug: "saas",        postCount: 9  },
  { id: "12", name: "rsc",         slug: "rsc",         postCount: 5  },
];

// ─── Simulated fetch helpers ──────────────────────────────────────────────────
// Swap these out for real fetch() / axios / prisma calls as needed.

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function getPosts(category?: string): Promise<Post[]> {
  await delay(600); // simulate network
  if (category) {
    return MOCK_POSTS.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }
  return MOCK_POSTS;
}

export async function getCategories(): Promise<Category[]> {
  await delay(400);
  return MOCK_CATEGORIES;
}

export async function getTags(): Promise<Tag[]> {
  await delay(400);
  return MOCK_TAGS;
}

// src/lib/api.ts
// Typed client for the Spring Boot API. Types mirror the backend DTOs.

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1";

export interface Author {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  // Only present in the category listing, not when nested in a post
  postCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  // Only present in the tag listing, not when nested in a post
  postCount?: number;
}

export type PostStatus = "DRAFT" | "PUBLISHED";

export interface Post {
  id: string;
  title: string;
  content: string;
  author: Author;
  category: Category;
  tags: Tag[];
  readingTime: number;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  page: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  // no-store: always show current data instead of a copy frozen at build time
  const res = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    // Errors are RFC 7807 problem details: { status, title, detail, ... }
    let detail: string | undefined;
    try {
      detail = (await res.json()).detail;
    } catch {
      // Body wasn't JSON; fall back to the status code
    }
    throw new ApiError(res.status, detail ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface PostFilters {
  categoryId?: string;
  tagId?: string;
  page?: number;
  size?: number;
}

export function getPosts(filters: PostFilters = {}): Promise<Page<Post>> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  const query = params.toString();
  return request<Page<Post>>(`/posts${query ? `?${query}` : ""}`);
}

export function getPost(id: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`);
}

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function getTags(): Promise<Tag[]> {
  return request<Tag[]>("/tags");
}

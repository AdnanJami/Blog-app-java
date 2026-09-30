// src/lib/api.ts
// Typed client for the Spring Boot API. Types mirror the backend DTOs.
// Calls that need a login take the JWT as `token`; only server code has it (see lib/session.ts).

// The browser uses NEXT_PUBLIC_API_URL (fixed at build time). Server code can use API_URL instead,
// read at runtime, for when the API has a different address from inside the server (e.g. in Docker).
const API_URL =
  (typeof window === "undefined" ? process.env.API_URL : undefined) ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8081/api/v1";

export interface Author {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: User;
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

export interface PostInput {
  title: string;
  content: string;
  categoryId: string;
  tagIds: string[];
  status: PostStatus;
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
    // Field -> message, present on validation failures
    public readonly errors?: Record<string, string>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
}

async function request<T>(path: string, { method = "GET", body, token }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  // no-store: always show current data instead of a copy frozen at build time
  const res = await fetch(`${API_URL}${path}`, {
    method,
    cache: "no-store",
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!res.ok) {
    // Errors are RFC 7807 problem details: { status, title, detail, errors? }
    let problem: { detail?: string; errors?: Record<string, string> } = {};
    try {
      problem = await res.json();
    } catch {
      // Body wasn't JSON; fall back to the status code
    }
    throw new ApiError(res.status, problem.detail ?? `Request failed with status ${res.status}`, problem.errors);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export function register(input: { name: string; email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", { method: "POST", body: input });
}

export function login(input: { email: string; password: string }): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", { method: "POST", body: input });
}

export function getMe(token: string): Promise<User> {
  return request<User>("/auth/me", { token });
}

// ─── Posts ────────────────────────────────────────────────────────────────────

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

// With a token, the author can also load their own drafts
export function getPost(id: string, token?: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`, { token });
}

export function getDrafts(token: string): Promise<Post[]> {
  return request<Post[]>("/posts/drafts", { token });
}

export function createPost(input: PostInput, token: string): Promise<Post> {
  return request<Post>("/posts", { method: "POST", body: input, token });
}

export function updatePost(id: string, input: PostInput, token: string): Promise<Post> {
  return request<Post>(`/posts/${encodeURIComponent(id)}`, { method: "PUT", body: input, token });
}

export function deletePost(id: string, token: string): Promise<void> {
  return request<void>(`/posts/${encodeURIComponent(id)}`, { method: "DELETE", token });
}

// ─── Categories & tags ────────────────────────────────────────────────────────

export function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export function createCategory(name: string, token: string): Promise<Category> {
  return request<Category>("/categories", { method: "POST", body: { name }, token });
}

export function getTags(): Promise<Tag[]> {
  return request<Tag[]>("/tags");
}

// Returns existing tags as-is and creates the rest
export function createTags(names: string[], token: string): Promise<Tag[]> {
  return request<Tag[]>("/tags", { method: "POST", body: { names }, token });
}

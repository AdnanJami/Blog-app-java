// src/lib/format.ts

const CATEGORY_COLORS: Record<string, string> = {
  "Next.js":    "bg-blue-100 text-blue-700",
  React:        "bg-cyan-100 text-cyan-700",
  TypeScript:   "bg-indigo-100 text-indigo-700",
  CSS:          "bg-pink-100 text-pink-700",
  Backend:      "bg-emerald-100 text-emerald-700",
  Database:     "bg-amber-100 text-amber-700",
};

export function categoryColor(name: string) {
  return CATEGORY_COLORS[name] ?? "bg-gray-100 text-gray-700";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Plain-text preview of a post, cut at a word boundary
export function excerpt(content: string, maxLength = 160) {
  const text = content.replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
}

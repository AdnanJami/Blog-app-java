"use client";
// src/components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions/auth";
import type { User } from "@/lib/api";

const NAV_LINKS = [
  { href: "/",           label: "Home"       },
  { href: "/categories", label: "Categories" },
  { href: "/tags",       label: "Tags"       },
];

export default function Navbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const links = user ? [...NAV_LINKS, { href: "/drafts", label: "Drafts" }] : NAV_LINKS;

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-bold text-xl text-ink tracking-tight hover:opacity-80 transition-opacity"
        >
          Blog Platform
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "text-accent bg-blue-50"
                    : "text-gray-600 hover:text-ink hover:bg-gray-100"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {user ? (
          <div className="flex items-center gap-3">
            <Link
              href="/posts/new"
              className="px-4 py-2 rounded-xl bg-accent hover:bg-blue-700 text-sm font-medium text-white transition-colors"
            >
              Write
            </Link>
            <span className="hidden md:inline text-sm text-muted truncate max-w-[10rem]" title={user.email}>
              {user.name}
            </span>
            <form action={logout}>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
              >
                Log out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href={`/login${pathname !== "/" && pathname !== "/login" && pathname !== "/register" ? `?next=${encodeURIComponent(pathname)}` : ""}`}
            className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
          >
            Log In
          </Link>
        )}
      </div>
    </header>
  );
}

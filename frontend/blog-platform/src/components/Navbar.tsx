"use client";
// src/components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/",           label: "Home"       },
  { href: "/categories", label: "Categories" },
  { href: "/tags",       label: "Tags"       },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="font-display font-bold text-xl text-ink tracking-tight hover:opacity-80 transition-opacity"
        >
          Blog Platform
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => {
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

        {/* Log In */}
        <Link
          href="/login"
          className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-medium text-ink transition-colors"
        >
          Log In
        </Link>
      </div>
    </header>
  );
}

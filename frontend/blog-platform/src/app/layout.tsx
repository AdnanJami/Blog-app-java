// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Blog Platform",
  description: "A modern developer blog platform built with Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <Navbar user={user} />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}

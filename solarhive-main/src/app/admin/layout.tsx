"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return <div className="mx-10 mt-16 mb-16 text-center text-sm text-black/50">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="mx-10 mt-16 mb-16 rounded-3xl bg-black/5 py-16 text-center">
        <h1 className="text-xl font-semibold">Sign in required</h1>
        <p className="mt-2 text-sm text-black/60">
          You need to sign in with an admin account to access this page.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="mx-10 mt-16 mb-16 rounded-3xl bg-black/5 py-16 text-center">
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-black/60">This area is for administrators only.</p>
      </div>
    );
  }

  return (
    <div className="mx-10 mt-8 mb-16">
      <h1 className="text-2xl font-semibold">Admin Panel</h1>

      <div className="mt-6 flex gap-2 border-b border-black/10 pb-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              pathname === link.href ? "bg-gold text-black" : "text-black/60 hover:text-gold"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <div className="mt-8">{children}</div>
    </div>
  );
}

"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Heart, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import type { ApiCategory } from "@/types/api";
import { groupCategories } from "@/lib/categories";

const links = [
  { name: "Home", href: "/" },
  { name: "Contact", href: "/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const submitSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
    setOpen(false);
  };

  useEffect(() => {
    let cancelled = false;

    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCategories(data.categories ?? []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryGroups = groupCategories(categories);
  const isFlatCatalog = categoryGroups.every((group) => group.children.length === 0);

  return (
    <div>
      <div className="flex items-center justify-between gap-6 border-b border-black/10 bg-black/5 px-4 py-2 text-xs text-black/60 md:px-10">
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-16">
            <p className="whitespace-nowrap">
              Buy Now Pay Later + Save to Buy | WhatsApp us for a free consultation
            </p>
            <p className="whitespace-nowrap">
              Buy Now Pay Later + Save to Buy | WhatsApp us for a free consultation
            </p>
          </div>
        </div>
        {user ? (
          <div className="flex shrink-0 items-center gap-4">
            {user.role === "admin" && (
              <Link href="/admin" className="hover:text-gold">
                Admin Panel
              </Link>
            )}
            <Link href="/account" className="hover:text-gold">
              My Account
            </Link>
            <span className="hidden text-black/40 sm:inline">Hi, {user.name.split(" ")[0]}</span>
            <button onClick={() => logout()} className="cursor-pointer hover:text-gold">
              Sign Out
            </button>
          </div>
        ) : (
          <div className="flex shrink-0 items-center gap-4">
            <Link href="/login" className="hover:text-gold">
              Sign In
            </Link>
            <Link href="/signup" className="hover:text-gold">
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* mobile row */}
      <div className="grid grid-cols-3 items-center px-4 py-4 md:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="justify-self-start text-black/80"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <Logo className="justify-self-center" />

        <Link href="/cart" className="relative justify-self-end text-black/80">
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-black">
              {itemCount}
            </span>
          )}
        </Link>
      </div>

      {open && (
        <div className="flex flex-col gap-1 border-t border-black/10 bg-white px-4 py-4 md:hidden">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              pathname === "/" ? "text-gold" : "text-black/80"
            }`}
          >
            Home
          </Link>

          {isFlatCatalog
            ? categoryGroups.map(({ parent }) => (
                <Link
                  key={parent.slug}
                  href={`/shop?category=${parent.slug}`}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm text-black/80 hover:text-gold"
                >
                  {parent.name}
                </Link>
              ))
            : categoryGroups.map(({ parent, children }) => (
                <div key={parent.slug}>
                  <Link
                    href={`/shop?category=${parent.slug}`}
                    onClick={() => setOpen(false)}
                    className="block px-3 pt-2 text-xs font-semibold tracking-wide text-black/40 uppercase hover:text-gold"
                  >
                    {parent.name}
                  </Link>
                  {children.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/shop?category=${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="rounded-lg px-3 py-2 text-sm text-black/70 hover:text-gold"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              ))}

          {links.slice(1).map((link) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`mt-1 rounded-lg px-3 py-2 text-sm font-medium ${
                pathname === link.href && link.href !== "/" ? "text-gold" : "text-black/80"
              }`}
            >
              {link.name}
            </Link>
          ))}

          <form onSubmit={submitSearch} className="mt-2 flex gap-2 border-t border-black/10 px-3 pt-4">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex shrink-0 items-center justify-center rounded-md bg-gold px-3 text-black"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            href="/wishlist"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center gap-2 px-3 py-2 text-sm text-black/80 hover:text-gold"
          >
            <Heart className="h-5 w-5" /> Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
          </Link>

          {user ? (
            <div className="mt-3 flex flex-col gap-1 border-t border-black/10 px-3 pt-4">
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-lg py-2 text-sm text-black/70 hover:text-gold"
                >
                  Admin Panel
                </Link>
              )}
              <Link
                href="/account"
                onClick={() => setOpen(false)}
                className="rounded-lg py-2 text-sm text-black/70 hover:text-gold"
              >
                My Account
              </Link>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="rounded-lg py-2 text-left text-sm text-black/70 hover:text-gold"
              >
                Sign Out ({user.name.split(" ")[0]})
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-4 border-t border-black/10 px-3 pt-4 text-sm">
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="text-black/70 hover:text-gold"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="text-black/70 hover:text-gold"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      {/* desktop row */}
      <div className="hidden items-center justify-between px-10 py-4 md:flex">
        <Logo />

        <div className="flex items-center gap-10 rounded-full bg-black/5 px-8 py-3 text-sm font-medium tracking-wide">
          <Link
            href="/"
            className={`cursor-pointer transition hover:text-gold ${
              pathname === "/" ? "text-gold" : "text-black/80"
            }`}
          >
            Home
          </Link>

          <div className="group relative">
            <Link
              href="/shop"
              className="flex cursor-pointer items-center gap-1 text-black/80 transition hover:text-gold"
            >
              Shop
              <ChevronDown className="h-3.5 w-3.5" />
            </Link>

            <div
              className={`invisible absolute top-full left-1/2 z-20 -translate-x-1/2 pt-3 opacity-0 transition group-hover:visible group-hover:opacity-100 ${
                isFlatCatalog ? "w-48" : "w-80"
              }`}
            >
              <div
                className={`rounded-2xl border border-black/10 bg-white p-3 shadow-lg ${
                  isFlatCatalog ? "flex flex-col gap-1" : "grid grid-cols-2 gap-2"
                }`}
              >
                {isFlatCatalog
                  ? categoryGroups.map(({ parent }) => (
                      <Link
                        key={parent.slug}
                        href={`/shop?category=${parent.slug}`}
                        className="block rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-gold"
                      >
                        {parent.name}
                      </Link>
                    ))
                  : categoryGroups.map(({ parent, children }) => (
                      <div key={parent.slug}>
                        <Link
                          href={`/shop?category=${parent.slug}`}
                          className="block rounded-lg px-3 py-2 text-xs font-semibold tracking-wide text-black/50 uppercase transition hover:text-gold"
                        >
                          {parent.name}
                        </Link>
                        {children.map((category) => (
                          <Link
                            key={category.slug}
                            href={`/shop?category=${category.slug}`}
                            className="block rounded-lg px-3 py-2 text-sm text-black/70 transition hover:bg-black/5 hover:text-gold"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    ))}
              </div>
            </div>
          </div>

          {links.slice(1).map((link) => {
            const isActive = pathname === link.href && link.href !== "/";

            return (
              <Link
                key={link.name}
                href={link.href}
                className={`cursor-pointer transition hover:text-gold ${
                  isActive ? "text-gold" : "text-black/80"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-5 text-black/80">
          <div className="relative">
            <button
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Search"
              className="cursor-pointer transition hover:text-gold"
            >
              <Search className="h-5 w-5" />
            </button>

            {searchOpen && (
              <form
                onSubmit={submitSearch}
                className="absolute top-full right-0 z-20 mt-3 flex w-64 gap-2 rounded-2xl border border-black/10 bg-white p-2 shadow-lg"
              >
                <input
                  autoFocus
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products…"
                  className="w-full rounded-lg border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/40 focus:border-gold focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="shrink-0 rounded-lg bg-gold px-3 text-black"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <Link href="/wishlist" className="relative">
            <Heart className="h-5 w-5 cursor-pointer transition hover:text-gold" />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-black">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative">
            <ShoppingCart className="h-5 w-5 cursor-pointer transition hover:text-gold" />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-semibold text-black">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

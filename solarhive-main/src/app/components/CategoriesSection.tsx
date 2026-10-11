"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { ApiCategory } from "@/types/api";
import { groupCategories } from "@/lib/categories";

const CategoriesSection = () => {
  const [categories, setCategories] = useState<ApiCategory[]>([]);

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

  const groups = groupCategories(categories);
  const isFlatCatalog = groups.every((group) => group.children.length === 0);

  return (
    <div className="mx-10 mt-16">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold">Shop by Category</h2>
        <p className="mt-2 text-sm text-black/50">
          Complete solar packages, plus the inverters, batteries, charge controllers, panels,
          and accessories to build your own system.
        </p>
      </div>

      {isFlatCatalog ? (
        <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-5">
          {groups.map(({ parent }) => (
            <Link key={parent.slug} href={`/shop?category=${parent.slug}`} className="text-center">
              <div className="relative aspect-square overflow-hidden rounded-full border border-black/10">
                {parent.image && (
                  <Image src={parent.image} alt={parent.name} fill className="object-cover" />
                )}
              </div>
              <p className="mt-3 text-xs font-medium tracking-wide text-black/70 uppercase">
                {parent.name}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
          {groups.map(({ parent, children }) => (
            <div key={parent.slug}>
              <Link
                href={`/shop?category=${parent.slug}`}
                className="text-sm font-semibold tracking-wide text-gold uppercase hover:underline"
              >
                {parent.name}
              </Link>

              <div className="mt-4 grid grid-cols-3 gap-4">
                {children.map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop?category=${category.slug}`}
                    className="text-center"
                  >
                    <div className="relative aspect-square overflow-hidden rounded-full border border-black/10">
                      {category.image && (
                        <Image src={category.image} alt={category.name} fill className="object-cover" />
                      )}
                    </div>
                    <p className="mt-2 text-xs font-medium tracking-wide text-black/70 uppercase">
                      {category.name}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesSection;

"use client";

import { Star } from "lucide-react";
import type { ApiCategory } from "@/types/api";
import { groupCategories } from "@/lib/categories";

type ShopSidebarProps = {
  categories: ApiCategory[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  minPrice: string;
  maxPrice: string;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  minRating: number | null;
  onMinRatingChange: (value: number | null) => void;
};

const ShopSidebar = ({
  categories,
  selectedCategory,
  onSelectCategory,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  minRating,
  onMinRatingChange,
}: ShopSidebarProps) => {
  const categoryGroups = groupCategories(categories);

  return (
    <aside className="w-full shrink-0 md:w-64">
      <div>
        <h3 className="text-sm font-semibold tracking-wide uppercase">Categories</h3>
        <div className="mt-4 flex flex-col gap-3 text-sm">
          <p
            onClick={() => onSelectCategory(null)}
            className={`w-fit cursor-pointer transition hover:text-gold ${
              selectedCategory === null ? "font-medium text-gold" : "text-black/60"
            }`}
          >
            All Products
          </p>
          {categoryGroups.map(({ parent, children }) => (
            <div key={parent.slug}>
              <p
                onClick={() => onSelectCategory(parent.slug)}
                className={`w-fit cursor-pointer text-xs font-semibold tracking-wide uppercase transition hover:text-gold ${
                  selectedCategory === parent.slug ? "text-gold" : "text-black/50"
                }`}
              >
                {parent.name}
              </p>
              <div className="mt-2 flex flex-col gap-2 pl-3">
                {children.map((category) => (
                  <p
                    key={category.slug}
                    onClick={() => onSelectCategory(category.slug)}
                    className={`w-fit cursor-pointer transition hover:text-gold ${
                      selectedCategory === category.slug ? "font-medium text-gold" : "text-black/60"
                    }`}
                  >
                    {category.name}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Price (₦)</h3>
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder="Min"
            className="w-full rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/40 focus:outline-none"
          />
          <span className="text-black/40">-</span>
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder="Max"
            className="w-full rounded-md border border-black/10 bg-black/5 px-3 py-2 text-sm placeholder:text-black/40 focus:outline-none"
          />
        </div>
      </div>

      <div className="mt-8 border-t border-black/10 pt-8">
        <h3 className="text-sm font-semibold tracking-wide uppercase">Customer Rating</h3>
        <div className="mt-4 flex flex-col gap-3 text-sm text-black/70">
          {[5, 4, 3].map((rating) => (
            <label key={rating} className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={minRating === rating}
                onChange={() => onMinRatingChange(minRating === rating ? null : rating)}
                className="accent-gold"
              />
              <span className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < rating ? "fill-gold text-gold" : "text-black/20"
                    }`}
                  />
                ))}
              </span>
              <span>& Up</span>
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ShopSidebar;

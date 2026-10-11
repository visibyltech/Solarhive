"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type WishlistItem = {
  id: number;
  name: string;
  image: string;
  price: number;
};

type WishlistContextType = {
  items: WishlistItem[];
  isWishlisted: (id: number) => boolean;
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: number) => void;
  itemCount: number;
};

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const STORAGE_KEY = "solarhive-wishlist";

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) setItems(JSON.parse(stored));
      } catch {
        // ignore corrupted storage
      } finally {
        setHydrated(true);
      }
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage failures (e.g. private browsing quota)
    }
  }, [items, hydrated]);

  const isWishlisted = (id: number) => items.some((item) => item.id === id);

  const toggleWishlist: WishlistContextType["toggleWishlist"] = (item) => {
    setItems((prev) =>
      prev.some((existing) => existing.id === item.id)
        ? prev.filter((existing) => existing.id !== item.id)
        : [...prev, item]
    );
  };

  const removeFromWishlist = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <WishlistContext.Provider
      value={{ items, isWishlisted, toggleWishlist, removeFromWishlist, itemCount: items.length }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
};

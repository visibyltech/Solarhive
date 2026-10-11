"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type CartItem = {
  id: number;
  name: string;
  image: string;
  price: number;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "rtd-cart";

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
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

  const addToCart: CartContextType["addToCart"] = (product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
      }
      return [...prev, { ...product, qty }];
    });
  };

  const removeFromCart = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id: number, qty: number) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)));
  };

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQty, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

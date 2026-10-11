"use client";

import { ReactNode } from "react";
import { CartProvider } from "../context/CartContext";
import { AuthProvider } from "../context/AuthContext";
import { WishlistProvider } from "../context/WishlistContext";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default Providers;

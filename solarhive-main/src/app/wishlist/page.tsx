"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

export default function WishlistPage() {
  const { items, removeFromWishlist, itemCount } = useWishlist();
  const { addToCart } = useCart();

  return (
    <div className="mx-10 mt-8 mb-16">
      <div className="flex items-center gap-3">
        <Heart className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-semibold">
          Wishlist <span className="text-black/40">({itemCount} items)</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-black/5 py-24 text-center">
          <Heart className="h-14 w-14 text-black/20" />
          <p className="mt-6 text-lg font-semibold">Your wishlist is empty</p>
          <p className="mt-2 text-sm text-black/50">
            Tap the heart on any item to save it here for later.
          </p>
          <Link
            href="/shop"
            className="mt-6 flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-2xl bg-black/5 p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>

              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="mt-1 text-sm text-gold">₦{item.price.toLocaleString()}</p>
              </div>

              <button
                onClick={() => addToCart(item)}
                className="flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-xs font-semibold text-black transition hover:bg-gold/90"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
              </button>

              <button
                onClick={() => removeFromWishlist(item.id)}
                className="text-black/40 transition hover:text-red-500"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

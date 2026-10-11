"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import OrderSummary from "../components/checkout/OrderSummary";

export default function CartPage() {
  const { items, updateQty, removeFromCart, itemCount } = useCart();

  return (
    <div className="mx-10 mt-8 mb-16">
      <div className="flex items-center gap-3">
        <ShoppingCart className="h-6 w-6 text-gold" />
        <h1 className="text-2xl font-semibold">
          Shopping Cart <span className="text-black/40">({itemCount} items)</span>
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl bg-black/5 py-24 text-center">
          <ShoppingCart className="h-14 w-14 text-black/20" />
          <p className="mt-6 text-lg font-semibold">Your cart is empty</p>
          <p className="mt-2 text-sm text-black/50">
            Browse our shop and add items to get started!
          </p>
          <Link
            href="/shop"
            className="mt-6 flex items-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-2xl bg-black/5 p-4"
              >
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold">{item.name}</p>
                  <p className="mt-1 text-sm text-gold">₦{item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center gap-3 rounded-full bg-black/10 px-3 py-1.5">
                  <button
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    className="text-black/70 transition hover:text-gold"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-4 text-center text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    className="text-black/70 transition hover:text-gold"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="w-24 text-right font-semibold">
                  ₦{(item.price * item.qty).toLocaleString()}
                </p>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-black/40 transition hover:text-red-500"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>

          <div className="md:w-80">
            <OrderSummary />
            <Link
              href="/checkout"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
            >
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

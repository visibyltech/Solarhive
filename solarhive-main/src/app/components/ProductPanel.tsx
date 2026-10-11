"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, ShoppingCart } from "lucide-react";
import { useCart } from "../context/CartContext";

export type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type ProductPanelProps = {
  heading: string;
  subtitle: string;
  products: Product[];
  ctaLabel?: string;
  showDots?: boolean;
};

const ProductCard = ({ product }: { product: Product }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, image: product.image, price: product.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden rounded-2xl">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
        />
      </Link>
      <Link href={`/product/${product.id}`}>
        <p className="mt-3 text-xs font-medium tracking-wide text-black/70 uppercase hover:text-gold">
          {product.name}
        </p>
      </Link>
      <p className="mt-1 text-sm font-semibold text-gold">
        ₦{product.price.toLocaleString()}
      </p>

      <button
        onClick={handleAddToCart}
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold uppercase transition ${
          added ? "bg-green-500 text-black" : "bg-gold text-black hover:bg-gold/90"
        }`}
      >
        {added ? (
          <>
            <Check className="h-3.5 w-3.5" /> Added
          </>
        ) : (
          <>
            <ShoppingCart className="h-3.5 w-3.5" /> Add to Cart
          </>
        )}
      </button>
    </div>
  );
};

const ProductPanel = ({ heading, subtitle, products, ctaLabel, showDots }: ProductPanelProps) => {
  return (
    <div className="mx-10 mt-16 rounded-3xl bg-black/4 px-6 py-10 md:px-10">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold">{heading}</h2>
        <p className="mt-2 text-sm text-black/50">{subtitle}</p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {ctaLabel && (
        <div className="mt-10 flex justify-center">
          <Link
            href="/shop"
            className="rounded-md bg-gold px-8 py-3 text-sm font-semibold tracking-wide text-black uppercase transition hover:bg-gold/90"
          >
            {ctaLabel}
          </Link>
        </div>
      )}

      {showDots && (
        <div className="mt-10 flex justify-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${i === 0 ? "bg-gold" : "bg-black/20"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductPanel;

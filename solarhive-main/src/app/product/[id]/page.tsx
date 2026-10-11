"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart, Check, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

type ProductDetail = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  price: number;
  old_price: number | null;
  rating: string;
  reviews_count: number;
  stock: number;
  category: string | null;
  category_name: string | null;
};

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  // Reset state during render (not in an effect) when navigating to a
  // different product id while this route stays mounted.
  if (params.id !== loadedId) {
    setLoadedId(params.id);
    setProduct(null);
    setNotFound(false);
  }

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (data?.product) setProduct(data.product);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true));
  }, [params.id]);

  const loading = !product && !notFound;

  if (loading) {
    return <p className="mx-10 mt-16 text-center text-sm text-black/50">Loading…</p>;
  }

  if (notFound || !product) {
    return (
      <div className="mx-10 mt-16 mb-16 flex flex-col items-center rounded-3xl bg-black/5 py-24 text-center">
        <h1 className="text-2xl font-semibold">Product not found</h1>
        <p className="mt-2 text-sm text-black/60">
          This product may have been removed or is no longer available.
        </p>
        <Link
          href="/shop"
          className="mt-6 rounded-md bg-gold px-6 py-3 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          Back to Shop
        </Link>
      </div>
    );
  }

  const rating = Math.round(Number(product.rating));
  const discount = product.old_price
    ? Math.round(((product.old_price - product.price) / product.old_price) * 100)
    : 0;
  const inStock = product.stock > 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addToCart(
      { id: product.id, name: product.name, image: product.image ?? "", price: product.price },
      qty
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = () =>
    toggleWishlist({ id: product.id, name: product.name, image: product.image ?? "", price: product.price });

  return (
    <div className="mx-10 mt-8 mb-16">
      <p className="text-sm text-black/50">
        <Link href="/shop" className="hover:text-gold">
          Shop
        </Link>{" "}
        <span className="text-gold">/</span>{" "}
        {product.category && (
          <>
            <Link href={`/shop?category=${product.category}`} className="hover:text-gold">
              {product.category_name}
            </Link>{" "}
            <span className="text-gold">/</span>{" "}
          </>
        )}
        <span className="text-black/70">{product.name}</span>
      </p>

      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl border border-black/5 bg-white">
          {discount > 0 && (
            <span className="absolute top-4 left-4 z-10 rounded-md bg-gold px-2 py-1 text-xs font-semibold text-black uppercase">
              -{discount}%
            </span>
          )}
          {product.image && (
            <Image src={product.image} alt={product.name} fill priority className="object-cover" />
          )}
        </div>

        <div>
          <p className="text-xs tracking-wide text-black/40 uppercase">{product.category_name}</p>
          <h1 className="font-display mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{product.name}</h1>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-gold text-gold" : "text-black/20"}`} />
              ))}
            </div>
            <span className="text-sm text-black/40">({product.reviews_count} reviews)</span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            {product.old_price && (
              <span className="text-lg text-black/40 line-through">
                ₦{product.old_price.toLocaleString()}
              </span>
            )}
            <span className="text-2xl font-semibold text-gold">₦{product.price.toLocaleString()}</span>
          </div>

          <p className="mt-2 text-sm font-medium">
            {inStock ? (
              <span className="text-green-600">In Stock ({product.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of Stock</span>
            )}
          </p>

          {product.description && (
            <p className="mt-6 text-sm leading-relaxed text-black/70">{product.description}</p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full bg-black/5 px-4 py-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
                className="text-black/70 transition hover:text-gold"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm font-medium">{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                aria-label="Increase quantity"
                className="text-black/70 transition hover:text-gold"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <button
              onClick={handleToggleWishlist}
              aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition ${
                wishlisted ? "bg-gold text-black" : "bg-black/5 text-black/60 hover:bg-gold hover:text-black"
              }`}
            >
              <Heart className={`h-5 w-5 ${wishlisted ? "fill-black" : ""}`} />
            </button>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={!inStock}
            className={`mt-4 flex w-full max-w-sm items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold uppercase transition disabled:cursor-not-allowed disabled:opacity-40 ${
              added ? "bg-green-500 text-black" : "bg-gold text-black hover:bg-gold/90"
            }`}
          >
            {added ? (
              <>
                <Check className="h-4 w-4" /> Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-4 w-4" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingCart, Check } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";

export type ShopProduct = {
  id: number;
  category: string;
  name: string;
  image: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
};

const RatingStars = ({ rating, reviews }: { rating: number; reviews: number }) => (
  <div className="flex items-center gap-1">
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3 w-3 ${i < rating ? "fill-gold text-gold" : "text-black/20"}`} />
      ))}
    </div>
    <span className="text-xs text-black/40">({reviews})</span>
  </div>
);

const ShopProductCard = ({
  product,
  layout = "grid",
}: {
  product: ShopProduct;
  layout?: "grid" | "list";
}) => {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.id);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({ id: product.id, name: product.name, image: product.image, price: product.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleToggleWishlist = () =>
    toggleWishlist({ id: product.id, name: product.name, image: product.image, price: product.price });

  const priceRow = (
    <div className="flex items-center gap-2">
      {product.oldPrice && (
        <span className="text-xs text-black/40 line-through">
          ₦{product.oldPrice.toLocaleString()}
        </span>
      )}
      <span className="text-sm font-semibold text-gold">₦{product.price.toLocaleString()}</span>
      {discount > 0 && <span className="text-xs font-medium text-green-600">-{discount}%</span>}
    </div>
  );

  const addToCartButton = (
    <button
      onClick={handleAddToCart}
      className={`flex items-center justify-center gap-2 rounded-md py-2 text-xs font-semibold uppercase transition ${
        added ? "bg-green-500 text-black" : "bg-gold text-black hover:bg-gold/90"
      } ${layout === "list" ? "shrink-0 px-4" : "mt-3 w-full"}`}
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
  );

  if (layout === "list") {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-3">
        <Link
          href={`/product/${product.id}`}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
        >
          {discount > 0 && (
            <span className="absolute top-1.5 left-1.5 z-10 rounded-md bg-gold px-1.5 py-0.5 text-[9px] font-semibold text-black uppercase">
              Sale
            </span>
          )}
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </Link>

        <Link href={`/product/${product.id}`} className="min-w-0 flex-1">
          <p className="text-xs tracking-wide text-black/40 uppercase">{product.category}</p>
          <h4 className="mt-0.5 truncate text-sm font-semibold hover:text-gold">{product.name}</h4>
          <div className="mt-1">
            <RatingStars rating={product.rating} reviews={product.reviews} />
          </div>
          <div className="mt-1">{priceRow}</div>
        </Link>

        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            wishlisted ? "bg-gold text-black" : "bg-black/5 text-black/60 hover:bg-gold hover:text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-black" : ""}`} />
        </button>

        {addToCartButton}
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/5 bg-white">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 rounded-md bg-gold px-2 py-1 text-[10px] font-semibold text-black uppercase">
            Sale
          </span>
        )}
        <button
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-sm transition ${
            wishlisted ? "bg-gold text-black" : "bg-black/50 text-white hover:bg-gold hover:text-black"
          }`}
        >
          <Heart className={`h-4 w-4 ${wishlisted ? "fill-black" : ""}`} />
        </button>
        <Link href={`/product/${product.id}`}>
          <Image src={product.image} alt={product.name} fill className="object-cover" />
        </Link>
      </div>

      <Link href={`/product/${product.id}`}>
        <p className="mt-3 text-xs tracking-wide text-black/40 uppercase">{product.category}</p>
        <h4 className="mt-0.5 text-sm font-semibold hover:text-gold">{product.name}</h4>

        <div className="mt-1">
          <RatingStars rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-1">{priceRow}</div>
      </Link>

      {addToCartButton}
    </div>
  );
};

export default ShopProductCard;

"use client";

import { useEffect, useState } from "react";
import ProductPanel, { Product } from "./ProductPanel";
import type { ApiProduct } from "@/types/api";

const SpecialOffersSection = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/products?onSale=true&limit=4")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const items: ApiProduct[] = data.products ?? [];
        setProducts(
          items.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            image: p.image ?? "",
          }))
        );
      })
      .catch(() => {
        if (!cancelled) setProducts([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <ProductPanel
      heading="Special Offers"
      subtitle="Selected solar systems and equipment at a discount, while stock lasts."
      products={products}
      showDots
    />
  );
};

export default SpecialOffersSection;

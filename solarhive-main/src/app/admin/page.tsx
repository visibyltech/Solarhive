"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [counts, setCounts] = useState<{
    products: number;
    categories: number;
    orders: number;
    pendingOrders: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products").then((res) => res.json()),
      fetch("/api/admin/categories").then((res) => res.json()),
      fetch("/api/admin/orders").then((res) => res.json()),
    ]).then(([products, categories, orders]) => {
      const orderList: { status: string }[] = orders.orders ?? [];
      setCounts({
        products: products.products?.length ?? 0,
        categories: categories.categories?.length ?? 0,
        orders: orderList.length,
        pendingOrders: orderList.filter((o) => o.status === "pending").length,
      });
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Link href="/admin/orders" className="rounded-2xl bg-black/5 p-6 transition hover:bg-black/10">
        <p className="text-xs font-semibold tracking-wide text-black/50 uppercase">Orders</p>
        <p className="mt-2 text-3xl font-semibold text-gold">{counts?.orders ?? "…"}</p>
        <p className="mt-4 text-sm text-black/60">
          {counts ? `${counts.pendingOrders} pending → ` : "Manage orders →"}
        </p>
      </Link>

      <Link href="/admin/products" className="rounded-2xl bg-black/5 p-6 transition hover:bg-black/10">
        <p className="text-xs font-semibold tracking-wide text-black/50 uppercase">Products</p>
        <p className="mt-2 text-3xl font-semibold text-gold">{counts?.products ?? "…"}</p>
        <p className="mt-4 text-sm text-black/60">Manage products →</p>
      </Link>

      <Link href="/admin/categories" className="rounded-2xl bg-black/5 p-6 transition hover:bg-black/10">
        <p className="text-xs font-semibold tracking-wide text-black/50 uppercase">Categories</p>
        <p className="mt-2 text-3xl font-semibold text-gold">{counts?.categories ?? "…"}</p>
        <p className="mt-4 text-sm text-black/60">Manage categories →</p>
      </Link>
    </div>
  );
}

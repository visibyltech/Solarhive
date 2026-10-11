"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

type AdminProduct = {
  id: number;
  name: string;
  price: number;
  stock: number;
  is_active: boolean;
  category_name: string;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/products")
      .then((res) => res.json())
      .then((data) => setProducts(data.products ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Products ({products.length})</h2>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-gold px-4 py-2 text-sm font-semibold text-black transition hover:bg-gold/90"
        >
          + New Product
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-sm text-black/50">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-black/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs tracking-wide text-black/50 uppercase">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium">{product.name}</td>
                  <td className="px-4 py-3 text-black/60">{product.category_name}</td>
                  <td className="px-4 py-3 text-gold">₦{product.price.toLocaleString()}</td>
                  <td className="px-4 py-3 text-black/60">{product.stock}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        product.is_active
                          ? "bg-green-500/10 text-green-600"
                          : "bg-black/10 text-black/40"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="text-black/60 hover:text-gold"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-black/60 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

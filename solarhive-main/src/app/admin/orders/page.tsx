"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

type AdminOrder = {
  id: number;
  status: "pending" | "completed";
  payment_method: "bank-transfer" | "installments" | "klump";
  full_name: string;
  email: string;
  city: string;
  total: number;
  has_receipt: boolean;
  created_at: string;
};

const PAYMENT_LABELS: Record<AdminOrder["payment_method"], string> = {
  "bank-transfer": "Bank Transfer",
  installments: "Installments",
  klump: "Klump BNPL",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders ?? []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold">Orders ({orders.length})</h2>

      {loading ? (
        <p className="mt-8 text-sm text-black/50">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-sm text-black/50">No orders yet.</p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl bg-black/5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 text-xs tracking-wide text-black/50 uppercase">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-black/5 last:border-0">
                  <td className="px-4 py-3 font-medium">SH-{order.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-black">{order.full_name}</p>
                    <p className="text-xs text-black/50">{order.email}</p>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {PAYMENT_LABELS[order.payment_method]}
                  </td>
                  <td className="px-4 py-3 text-gold">₦{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        order.status === "completed"
                          ? "bg-green-500/10 text-green-600"
                          : "bg-gold/10 text-gold"
                      }`}
                    >
                      {order.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-black/60">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="flex items-center justify-end text-black/60 hover:text-gold"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
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

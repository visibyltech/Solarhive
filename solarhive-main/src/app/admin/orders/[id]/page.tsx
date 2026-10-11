"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

type OrderDetail = {
  id: number;
  user_id: number | null;
  status: "pending" | "completed";
  payment_method: "bank-transfer" | "installments" | "klump";
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  installment_weeks: number | null;
  installment_interest_rate: number | null;
  installment_deposit: number | null;
  receipt_filename: string | null;
  has_receipt: boolean;
  created_at: string;
};

type OrderItem = {
  id: number;
  product_id: number | null;
  name: string;
  image: string | null;
  price: number;
  qty: number;
};

const PAYMENT_LABELS: Record<OrderDetail["payment_method"], string> = {
  "bank-transfer": "Bank Transfer",
  installments: "Installments",
  klump: "Klump BNPL",
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const applyOrder = (data: { order?: OrderDetail | null; items?: OrderItem[] }) => {
    setOrder(data.order ?? null);
    setItems(data.items ?? []);
  };

  const load = () => {
    setLoading(true);
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => res.json())
      .then(applyOrder)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((res) => res.json())
      .then(applyOrder)
      .finally(() => setLoading(false));
  }, [params.id]);

  const toggleStatus = async () => {
    if (!order) return;
    setUpdating(true);
    const nextStatus = order.status === "completed" ? "pending" : "completed";
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    setUpdating(false);
    if (res.ok) load();
  };

  if (loading) {
    return <p className="text-sm text-black/50">Loading…</p>;
  }

  if (!order) {
    return <p className="text-sm text-black/50">Order not found.</p>;
  }

  return (
    <div>
      <Link
        href="/admin/orders"
        className="flex w-fit items-center gap-2 text-sm text-black/60 hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Orders
      </Link>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">Order SH-{order.id}</h2>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                order.status === "completed"
                  ? "bg-green-500/10 text-green-600"
                  : "bg-gold/10 text-gold"
              }`}
            >
              {order.status === "completed" ? "Completed" : "Pending"}
            </span>
          </div>
          <p className="mt-1 text-sm text-black/50">
            Placed {new Date(order.created_at).toLocaleString()}
          </p>
        </div>
        <button
          onClick={toggleStatus}
          disabled={updating}
          className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
            order.status === "completed"
              ? "bg-black/10 text-black hover:bg-black/15"
              : "bg-gold text-black hover:bg-gold/90"
          }`}
        >
          <CheckCircle2 className="h-4 w-4" />
          {order.status === "completed" ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl bg-black/5 p-6">
          <h3 className="text-sm font-semibold tracking-wide text-black/70 uppercase">
            Customer
          </h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Name</span>
              <span className="font-semibold">{order.full_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Email</span>
              <span className="font-semibold">{order.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Phone</span>
              <span className="font-semibold">{order.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Address</span>
              <span className="text-right font-semibold">
                {order.address}, {order.city}
              </span>
            </div>
            {order.user_id && (
              <div className="flex justify-between">
                <span className="text-black/50">Account</span>
                <span className="font-semibold">Registered user (#{order.user_id})</span>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-black/5 p-6">
          <h3 className="text-sm font-semibold tracking-wide text-black/70 uppercase">Payment</h3>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-black/50">Method</span>
              <span className="font-semibold">{PAYMENT_LABELS[order.payment_method]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Subtotal</span>
              <span className="font-semibold">₦{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-black/50">Delivery</span>
              <span className="font-semibold">₦{order.delivery_fee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-black/10 pt-2">
              <span className="font-semibold text-black/70">Total</span>
              <span className="font-semibold text-gold">₦{order.total.toLocaleString()}</span>
            </div>
            {order.payment_method === "installments" && (
              <>
                <div className="flex justify-between">
                  <span className="text-black/50">Plan</span>
                  <span className="font-semibold">
                    {order.installment_weeks} weeks ({order.installment_interest_rate}% interest)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Deposit Required</span>
                  <span className="font-semibold text-green-600">
                    ₦{order.installment_deposit?.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-black/5 p-6">
        <h3 className="text-sm font-semibold tracking-wide text-black/70 uppercase">Items</h3>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <span>
                {item.name} <span className="text-black/40">× {item.qty}</span>
              </span>
              <span className="font-semibold">₦{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>

      {order.has_receipt && (
        <div className="mt-4 rounded-2xl bg-black/5 p-6">
          <h3 className="text-sm font-semibold tracking-wide text-black/70 uppercase">
            Payment Receipt
          </h3>
          {order.receipt_filename && (
            <p className="mt-1 text-xs text-black/50">{order.receipt_filename}</p>
          )}
          <div className="mt-3 overflow-hidden rounded-lg border border-black/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/admin/orders/${order.id}/receipt`}
              alt="Payment receipt"
              className="max-h-[600px] w-full object-contain bg-black/5"
            />
          </div>
        </div>
      )}
    </div>
  );
}

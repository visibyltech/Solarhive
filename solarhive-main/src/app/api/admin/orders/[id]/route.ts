import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const doc = await getDb().collection("orders").doc(String(orderId)).get();
  const o = doc.data();
  if (!o) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const order = {
    id: o.id,
    user_id: o.user_id,
    status: o.status,
    payment_method: o.payment_method,
    full_name: o.full_name,
    email: o.email,
    phone: o.phone,
    address: o.address,
    city: o.city,
    subtotal: o.subtotal,
    delivery_fee: o.delivery_fee,
    total: o.total,
    installment_weeks: o.installment_weeks,
    installment_interest_rate: o.installment_interest_rate,
    installment_deposit: o.installment_deposit,
    receipt_filename: o.receipt_filename,
    has_receipt: o.receipt_data != null,
    created_at: o.created_at,
  };
  const items = [...(o.items ?? [])].sort((a, b) => a.id - b.id);

  return NextResponse.json({ order, items });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const orderId = Number(id);
  if (!Number.isInteger(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (status !== "pending" && status !== "completed") {
    return NextResponse.json({ error: "status must be 'pending' or 'completed'" }, { status: 400 });
  }

  const ref = getDb().collection("orders").doc(String(orderId));
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  await ref.update({ status });

  return NextResponse.json({ order: { id: orderId, status } });
}

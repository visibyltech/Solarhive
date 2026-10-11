import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const snap = await getDb().collection("orders").get();
  const orders = snap.docs
    .map((doc) => {
      const o = doc.data();
      return {
        id: o.id,
        user_id: o.user_id,
        status: o.status,
        payment_method: o.payment_method,
        full_name: o.full_name,
        email: o.email,
        phone: o.phone,
        city: o.city,
        total: o.total,
        has_receipt: o.receipt_data != null,
        created_at: o.created_at,
      };
    })
    .sort((a, b) => b.id - a.id);

  return NextResponse.json({ orders });
}

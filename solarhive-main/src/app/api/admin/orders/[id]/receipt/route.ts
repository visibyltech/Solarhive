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
  const order = doc.data();
  if (!order?.receipt_data) {
    return NextResponse.json({ error: "No receipt for this order" }, { status: 404 });
  }

  const buffer = Buffer.from(order.receipt_data, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": order.receipt_mime_type || "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}

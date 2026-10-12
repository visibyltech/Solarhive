import { NextRequest, NextResponse } from "next/server";
import { getDb, nextId } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { normalizeNigerianPhone, validateDelivery } from "@/lib/validation";

const PAYMENT_METHODS = ["bank-transfer", "installments", "klump"];
const MAX_RECEIPT_BYTES = 5 * 1024 * 1024;

type OrderItemInput = {
  id?: number;
  name?: string;
  image?: string;
  price?: number;
  qty?: number;
};

// Signed-in users only — the order is linked to the session user.
export async function POST(request: NextRequest) {
  const sessionUser = await getSessionUser(request);
  if (!sessionUser) {
    return NextResponse.json({ error: "Please sign in to place an order" }, { status: 401 });
  }

  const formData = await request.formData();

  const paymentMethod = String(formData.get("paymentMethod") ?? "");
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return NextResponse.json({ error: "Invalid payment method" }, { status: 400 });
  }

  const delivery = {
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    phone: String(formData.get("phone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    city: String(formData.get("city") ?? "").trim(),
  };
  const deliveryErrors = validateDelivery(delivery);
  const firstError = Object.values(deliveryErrors)[0];
  if (firstError) {
    return NextResponse.json({ error: firstError, fields: deliveryErrors }, { status: 400 });
  }
  const { fullName, email, address, city } = delivery;
  const phone = normalizeNigerianPhone(delivery.phone)!;

  const subtotal = Number(formData.get("subtotal"));
  const deliveryFee = Number(formData.get("deliveryFee"));
  const total = Number(formData.get("total"));
  if (!Number.isFinite(subtotal) || !Number.isFinite(deliveryFee) || !Number.isFinite(total)) {
    return NextResponse.json({ error: "Invalid order totals" }, { status: 400 });
  }

  let itemInputs: OrderItemInput[];
  try {
    itemInputs = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return NextResponse.json({ error: "Invalid items" }, { status: 400 });
  }
  if (!Array.isArray(itemInputs) || itemInputs.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }
  for (const item of itemInputs) {
    if (!item.name || !Number.isFinite(item.price) || !Number.isFinite(item.qty)) {
      return NextResponse.json({ error: "Invalid item in cart" }, { status: 400 });
    }
  }

  const installmentWeeksRaw = formData.get("installmentWeeks");
  const installmentInterestRateRaw = formData.get("installmentInterestRate");
  const installmentDepositRaw = formData.get("installmentDeposit");
  const installmentWeeks = installmentWeeksRaw != null ? Number(installmentWeeksRaw) : null;
  const installmentInterestRate =
    installmentInterestRateRaw != null ? Number(installmentInterestRateRaw) : null;
  const installmentDeposit = installmentDepositRaw != null ? Number(installmentDepositRaw) : null;

  let receiptFilename: string | null = null;
  let receiptMimeType: string | null = null;
  let receiptData: string | null = null;

  const receiptFile = formData.get("receipt");
  if (receiptFile instanceof File && receiptFile.size > 0) {
    if (receiptFile.size > MAX_RECEIPT_BYTES) {
      return NextResponse.json({ error: "Receipt file is too large (max 5MB)" }, { status: 400 });
    }
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    receiptFilename = receiptFile.name;
    receiptMimeType = receiptFile.type || "application/octet-stream";
    receiptData = buffer.toString("base64");
  }

  if ((paymentMethod === "bank-transfer" || paymentMethod === "installments") && !receiptData) {
    return NextResponse.json({ error: "A payment receipt is required" }, { status: 400 });
  }

  const db = getDb();
  const orderId = await nextId("orders");

  const items = [];
  for (const item of itemInputs) {
    const itemId = await nextId("order_items");
    items.push({
      id: itemId,
      product_id: item.id ?? null,
      name: item.name,
      image: item.image ?? null,
      price: item.price,
      qty: item.qty,
    });
  }

  await db
    .collection("orders")
    .doc(String(orderId))
    .set({
      id: orderId,
      user_id: sessionUser?.id ?? null,
      status: "pending",
      payment_method: paymentMethod,
      full_name: fullName,
      email,
      phone,
      address,
      city,
      subtotal,
      delivery_fee: deliveryFee,
      total,
      installment_weeks: installmentWeeks,
      installment_interest_rate: installmentInterestRate,
      installment_deposit: installmentDeposit,
      receipt_filename: receiptFilename,
      receipt_mime_type: receiptMimeType,
      receipt_data: receiptData,
      items,
      created_at: new Date().toISOString(),
    });

  return NextResponse.json(
    { order: { id: orderId, orderNumber: `SH-${orderId}` } },
    { status: 201 }
  );
}

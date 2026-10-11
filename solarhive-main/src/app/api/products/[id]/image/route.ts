import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// Public — anyone browsing the shop needs to see product images. Only
// products where an admin uploaded a file directly (rather than linking to
// an external image) have image_data set.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const doc = await getDb().collection("products").doc(String(productId)).get();
  const product = doc.data();
  if (!product?.image_data) {
    return NextResponse.json({ error: "No image for this product" }, { status: 404 });
  }

  const buffer = Buffer.from(product.image_data, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": product.image_mime_type || "application/octet-stream",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

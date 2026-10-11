import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const db = getDb();
  const doc = await db.collection("products").doc(String(productId)).get();
  const p = doc.data();
  if (!p || !p.is_active) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const categoryDoc = await db.collection("categories").doc(String(p.category_id)).get();
  const category = categoryDoc.data();

  return NextResponse.json({
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      image: p.image,
      price: p.price,
      old_price: p.old_price,
      rating: p.rating,
      reviews_count: p.reviews_count,
      stock: p.stock,
      category: category?.slug ?? null,
      category_name: category?.name ?? null,
    },
  });
}

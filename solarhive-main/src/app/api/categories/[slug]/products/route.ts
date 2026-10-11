import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDb();

  const categorySnap = await db.collection("categories").where("slug", "==", slug).limit(1).get();
  if (categorySnap.empty) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  const category = categorySnap.docs[0].data();

  // A top-level category (e.g. "New Shoes") has no products of its own —
  // its leaf categories (e.g. "Women") do. Pull products from every leaf
  // under it as well as the category itself, so linking to a parent slug
  // shows everything beneath it.
  const [ownSnap, childrenSnap] = await Promise.all([
    db.collection("products").where("category_id", "==", category.id).where("is_active", "==", true).get(),
    db.collection("categories").where("parent_id", "==", category.id).get(),
  ]);

  const childIds = childrenSnap.docs.map((doc) => doc.data().id);
  const childSnaps = childIds.length
    ? await Promise.all(
        childIds.map((id) =>
          db.collection("products").where("category_id", "==", id).where("is_active", "==", true).get()
        )
      )
    : [];

  const products = [...ownSnap.docs, ...childSnaps.flatMap((s) => s.docs)]
    .map((doc) => {
      const p = doc.data();
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.image,
        price: p.price,
        old_price: p.old_price,
        rating: p.rating,
        reviews_count: p.reviews_count,
      };
    })
    .sort((a, b) => b.id - a.id);

  return NextResponse.json({ category, products });
}

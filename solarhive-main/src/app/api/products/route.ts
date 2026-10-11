import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

type SortKey = "newest" | "price_asc" | "price_desc" | "rating";

const SORTERS: Record<SortKey, (a: Record<string, unknown>, b: Record<string, unknown>) => number> = {
  newest: (a, b) => (b.id as number) - (a.id as number),
  price_asc: (a, b) => (a.price as number) - (b.price as number),
  price_desc: (a, b) => (b.price as number) - (a.price as number),
  rating: (a, b) => (b.rating as number) - (a.rating as number),
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const category = searchParams.get("category");
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const onSale = searchParams.get("onSale");
  const sort = (searchParams.get("sort") as SortKey) ?? "newest";
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = (page - 1) * limit;

  const db = getDb();
  const [productsSnap, categoriesSnap] = await Promise.all([
    db.collection("products").where("is_active", "==", true).get(),
    db.collection("categories").get(),
  ]);

  const categoriesById = new Map(categoriesSnap.docs.map((doc) => [doc.data().id, doc.data()]));

  // Matches either the exact (leaf) category, or any leaf category whose
  // parent has this slug — so filtering by a top-level slug shows products
  // from all of its subcategories too.
  let matchingCategoryIds: Set<number> | null = null;
  if (category) {
    const target = [...categoriesById.values()].find((c) => c.slug === category);
    matchingCategoryIds = new Set(
      [...categoriesById.values()]
        .filter((c) => c.slug === category || (target && c.parent_id === target.id))
        .map((c) => c.id)
    );
  }

  const products = productsSnap.docs
    .map((doc) => doc.data())
    .filter((p) => !matchingCategoryIds || matchingCategoryIds.has(p.category_id))
    .filter((p) => !search || (p.name as string).toLowerCase().includes(search))
    .filter((p) => !minPrice || !Number.isFinite(Number(minPrice)) || p.price >= Number(minPrice))
    .filter((p) => !maxPrice || !Number.isFinite(Number(maxPrice)) || p.price <= Number(maxPrice))
    .filter((p) => onSale !== "true" || p.old_price != null);

  products.sort(SORTERS[sort] ?? SORTERS.newest);

  const paged = products.slice(offset, offset + limit).map((p) => {
    const category = categoriesById.get(p.category_id);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.image,
      price: p.price,
      old_price: p.old_price,
      rating: p.rating,
      reviews_count: p.reviews_count,
      category: category?.slug ?? null,
      category_name: category?.name ?? null,
    };
  });

  return NextResponse.json({ products: paged, page, limit });
}

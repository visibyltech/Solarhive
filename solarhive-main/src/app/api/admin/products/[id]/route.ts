import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";
import { readImageFile } from "@/lib/image-upload";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const doc = await getDb().collection("products").doc(String(productId)).get();
  const p = doc.data();
  if (!p) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({
    product: {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      image: p.image,
      price: p.price,
      old_price: p.old_price,
      stock: p.stock,
      is_active: p.is_active,
      category_id: p.category_id,
    },
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const db = getDb();
  const ref = db.collection("products").doc(String(productId));
  const existingDoc = await ref.get();
  if (!existingDoc.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  const existing = existingDoc.data()!;

  const formData = await request.formData();

  const categoryIdRaw = formData.get("categoryId");
  if (categoryIdRaw != null && String(categoryIdRaw).trim()) {
    const categoryId = Number(categoryIdRaw);
    if (!Number.isInteger(categoryId)) {
      return NextResponse.json({ error: "Invalid categoryId" }, { status: 400 });
    }
    const categoryDoc = await db.collection("categories").doc(String(categoryId)).get();
    if (!categoryDoc.exists) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
  }

  const nameRaw = String(formData.get("name") ?? "").trim();
  const name = nameRaw || existing.name;
  const categoryId = categoryIdRaw != null && String(categoryIdRaw).trim() ? Number(categoryIdRaw) : existing.category_id;
  const slugRaw = String(formData.get("slug") ?? "").trim();
  const slug = slugRaw ? slugify(slugRaw) : existing.slug;
  const descriptionRaw = formData.get("description");
  const description =
    typeof descriptionRaw === "string" && descriptionRaw.trim() ? descriptionRaw : existing.description;
  const priceRaw = formData.get("price");
  const price =
    priceRaw != null && Number.isFinite(Number(priceRaw)) ? Number(priceRaw) : existing.price;
  const oldPriceRaw = formData.get("oldPrice");
  const oldPrice =
    oldPriceRaw != null && String(oldPriceRaw).trim()
      ? Number.isFinite(Number(oldPriceRaw))
        ? Number(oldPriceRaw)
        : existing.old_price
      : existing.old_price;
  const stockRaw = formData.get("stock");
  const stock = stockRaw != null && Number.isInteger(Number(stockRaw)) ? Number(stockRaw) : existing.stock;
  const isActiveRaw = formData.get("isActive");
  const isActive = isActiveRaw != null ? isActiveRaw === "true" : existing.is_active;

  let image = existing.image;
  let imageData = existing.image_data;
  let imageMimeType = existing.image_mime_type;

  const imageFile = formData.get("imageFile");
  if (imageFile instanceof File && imageFile.size > 0) {
    const result = await readImageFile(imageFile);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    imageData = result.data;
    imageMimeType = result.mimeType;
    image = `/api/products/${productId}/image`;
  } else {
    const imageUrlRaw = formData.get("imageUrl");
    if (typeof imageUrlRaw === "string" && imageUrlRaw.trim()) {
      image = imageUrlRaw.trim();
      imageData = null;
      imageMimeType = null;
    }
  }

  if (slug !== existing.slug) {
    const slugTakenSnap = await db.collection("products").where("slug", "==", slug).limit(1).get();
    if (!slugTakenSnap.empty && slugTakenSnap.docs[0].id !== String(productId)) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }
  }

  const updated = {
    id: productId,
    category_id: categoryId,
    name,
    slug,
    description,
    image,
    image_data: imageData,
    image_mime_type: imageMimeType,
    price,
    old_price: oldPrice,
    stock,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };
  await ref.update(updated);

  return NextResponse.json({
    product: {
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      image: updated.image,
      price: updated.price,
      old_price: updated.old_price,
      stock: updated.stock,
      is_active: updated.is_active,
      category_id: updated.category_id,
    },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const productId = Number(id);
  if (!Number.isInteger(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 });
  }

  const ref = getDb().collection("products").doc(String(productId));
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  await ref.delete();
  return NextResponse.json({ ok: true });
}

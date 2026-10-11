import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const db = getDb();
  const ref = db.collection("categories").doc(String(categoryId));
  const existingDoc = await ref.get();
  if (!existingDoc.exists) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  const existing = existingDoc.data()!;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim() : existing.name;
  const slug =
    typeof body?.slug === "string" && body.slug.trim() ? slugify(body.slug) : existing.slug;
  const image = typeof body?.image === "string" ? body.image : existing.image;
  const parentId =
    body?.parent_id === undefined
      ? existing.parent_id
      : body.parent_id === null
        ? null
        : Number(body.parent_id);

  if (parentId !== null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: "Invalid parent_id" }, { status: 400 });
  }
  if (parentId === categoryId) {
    return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
  }

  if (parentId !== null && parentId !== existing.parent_id) {
    const hasChildrenSnap = await db
      .collection("categories")
      .where("parent_id", "==", categoryId)
      .limit(1)
      .get();
    if (!hasChildrenSnap.empty) {
      return NextResponse.json(
        { error: "This category already has subcategories — only two levels are supported" },
        { status: 400 }
      );
    }
    const parentDoc = await db.collection("categories").doc(String(parentId)).get();
    if (!parentDoc.exists) {
      return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
    }
    if (parentDoc.data()!.parent_id !== null) {
      return NextResponse.json(
        { error: "Only two levels of categories are supported — pick a top-level parent" },
        { status: 400 }
      );
    }
  }

  if (slug !== existing.slug) {
    const slugTakenSnap = await db.collection("categories").where("slug", "==", slug).limit(1).get();
    if (!slugTakenSnap.empty && slugTakenSnap.docs[0].id !== String(categoryId)) {
      return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
    }
  }

  const category = { id: categoryId, name, slug, image, parent_id: parentId };
  await ref.update(category);
  return NextResponse.json({ category });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const categoryId = Number(id);
  if (!Number.isInteger(categoryId)) {
    return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
  }

  const db = getDb();
  const hasChildrenSnap = await db
    .collection("categories")
    .where("parent_id", "==", categoryId)
    .limit(1)
    .get();
  if (!hasChildrenSnap.empty) {
    return NextResponse.json({ error: "Delete its subcategories first" }, { status: 409 });
  }

  const inUseSnap = await db.collection("products").where("category_id", "==", categoryId).limit(1).get();
  if (!inUseSnap.empty) {
    return NextResponse.json(
      { error: "Cannot delete a category that still has products" },
      { status: 409 }
    );
  }

  const ref = db.collection("categories").doc(String(categoryId));
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }
  await ref.delete();
  return NextResponse.json({ ok: true });
}

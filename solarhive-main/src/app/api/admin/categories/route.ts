import { NextRequest, NextResponse } from "next/server";
import { getDb, nextId } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const snap = await getDb().collection("categories").get();
  const categories = snap.docs.map((doc) => doc.data()).sort((a, b) => b.id - a.id);
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const image = typeof body?.image === "string" ? body.image : null;
  const slug = typeof body?.slug === "string" && body.slug.trim() ? slugify(body.slug) : slugify(name);
  const parentId =
    body?.parent_id === null || body?.parent_id === undefined ? null : Number(body.parent_id);

  if (!name || !slug) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  if (parentId !== null && !Number.isInteger(parentId)) {
    return NextResponse.json({ error: "Invalid parent_id" }, { status: 400 });
  }

  const db = getDb();

  if (parentId !== null) {
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

  const existingSnap = await db.collection("categories").where("slug", "==", slug).limit(1).get();
  if (!existingSnap.empty) {
    return NextResponse.json({ error: "A category with this slug already exists" }, { status: 409 });
  }

  const id = await nextId("categories");
  const category = {
    id,
    name,
    slug,
    image,
    parent_id: parentId,
    created_at: new Date().toISOString(),
  };
  await db.collection("categories").doc(String(id)).set(category);

  return NextResponse.json({ category }, { status: 201 });
}

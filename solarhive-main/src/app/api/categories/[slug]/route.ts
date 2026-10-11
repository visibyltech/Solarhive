import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const snap = await getDb().collection("categories").where("slug", "==", slug).limit(1).get();
  if (snap.empty) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ category: snap.docs[0].data() });
}

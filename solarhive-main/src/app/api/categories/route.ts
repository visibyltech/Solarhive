import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  const snap = await getDb().collection("categories").get();
  const categories = snap.docs
    .map((doc) => doc.data())
    .sort((a, b) => {
      if ((a.parent_id === null) !== (b.parent_id === null)) {
        return a.parent_id === null ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  return NextResponse.json({ categories });
}

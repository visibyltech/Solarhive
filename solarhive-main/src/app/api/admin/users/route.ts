import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const snap = await getDb().collection("users").get();
  const users = snap.docs
    .map((doc) => {
      const u = doc.data();
      return { id: u.id, name: u.name, email: u.email, role: u.role, created_at: u.created_at };
    })
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));

  return NextResponse.json({ users });
}

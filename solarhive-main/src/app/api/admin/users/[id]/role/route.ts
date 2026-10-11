import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

// The only way a user's role can ever become "admin": an existing admin
// calling this route. There is no public signup path to it.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user, response } = await requireAdmin(request);
  if (!user) return response;

  const { id } = await params;
  const userId = Number(id);
  if (!Number.isInteger(userId)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const role = body?.role;
  if (role !== "user" && role !== "admin") {
    return NextResponse.json({ error: "role must be 'user' or 'admin'" }, { status: 400 });
  }

  if (userId === user.id && role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
  }

  const ref = getDb().collection("users").doc(String(userId));
  const doc = await ref.get();
  if (!doc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  await ref.update({ role });
  const existing = doc.data()!;

  return NextResponse.json({
    user: { id: existing.id, name: existing.name, email: existing.email, role },
  });
}

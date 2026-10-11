import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { hashPassword, requireUser, verifyPassword } from "@/lib/auth";

// Requires the caller's current password — there is no email-based "forgot
// password" flow. A logged-in user proves identity with the old password,
// same as any other authenticated action.
export async function POST(request: NextRequest) {
  const { user, response } = await requireUser(request);
  if (!user) return response;

  const body = await request.json().catch(() => null);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!currentPassword || !newPassword) {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 }
    );
  }
  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const ref = getDb().collection("users").doc(String(user.id));
  const doc = await ref.get();
  const row = doc.data();
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await ref.update({ password_hash: newHash });

  return NextResponse.json({ ok: true });
}

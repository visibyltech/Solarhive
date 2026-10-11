import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { createSessionToken, setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const snap = await getDb().collection("users").where("email", "==", email).limit(1).get();
  const user = snap.empty ? null : snap.docs[0].data();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
  setSessionCookie(response, token);
  return response;
}

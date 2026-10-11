import { NextRequest, NextResponse } from "next/server";
import { getDb, nextId } from "@/lib/db";
import { createSessionToken, hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json({ error: "name, email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const db = getDb();

  const existingSnap = await db.collection("users").where("email", "==", email).limit(1).get();
  if (!existingSnap.empty) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  // Every account created here is a plain "user" — there is no field a
  // client can send to become an admin.
  const id = await nextId("users");
  const user = {
    id,
    name,
    email,
    password_hash: passwordHash,
    role: "user" as const,
    created_at: new Date().toISOString(),
  };
  await db.collection("users").doc(String(id)).set(user);

  const token = await createSessionToken(user.id);
  const response = NextResponse.json(
    { user: { id: user.id, name: user.name, email: user.email, role: user.role } },
    { status: 201 }
  );
  setSessionCookie(response, token);
  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  // Doc ID = email gives free uniqueness; .create() throws if it already
  // exists, which we treat as a no-op — matching ON CONFLICT DO NOTHING.
  try {
    await getDb()
      .collection("newsletter_subscribers")
      .doc(email)
      .create({ email, created_at: new Date().toISOString() });
  } catch (err) {
    const code = (err as { code?: number })?.code;
    if (code !== 6 /* ALREADY_EXISTS */) throw err;
  }

  return NextResponse.json({ ok: true });
}

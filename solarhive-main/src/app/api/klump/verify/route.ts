import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get("reference");

  if (!reference) {
    return NextResponse.json({ error: "Missing transaction reference" }, { status: 400 });
  }

  const secretKey = process.env.KLUMP_SECRET_KEY;
  if (!secretKey) {
    return NextResponse.json({ error: "Klump is not configured on the server" }, { status: 500 });
  }

  const response = await fetch(
    `https://api.useklump.com/v1/transactions/${reference}/verify`,
    {
      headers: {
        "Content-Type": "application/json",
        "klump-secret-key": secretKey,
      },
    }
  );

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
}

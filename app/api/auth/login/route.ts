import { NextRequest, NextResponse } from "next/server";

async function getExpectedToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET ?? "change-me";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode("authenticated"));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password.trim() !== process.env.AUTH_PASSWORD?.trim()) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = await getExpectedToken();
  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}

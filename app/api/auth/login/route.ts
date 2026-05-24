import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function expectedToken() {
  const secret = process.env.AUTH_SECRET ?? "change-me";
  return crypto.createHmac("sha256", secret).update("authenticated").digest("hex");
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password !== process.env.AUTH_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set("auth", expectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });

  return response;
}

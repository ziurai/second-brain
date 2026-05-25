import { NextRequest, NextResponse } from "next/server";

async function getExpectedToken(): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is required");

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isSplash = pathname === "/splash";

  const cookie = request.cookies.get("auth");
  const expected = await getExpectedToken();
  const authenticated = cookie?.value === expected;

  if (isAuthRoute) return NextResponse.next();

  if (authenticated && isSplash) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (!authenticated && !isSplash) {
    return NextResponse.redirect(new URL("/splash", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

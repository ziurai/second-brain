import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function getExpectedToken(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is required");
  return crypto.createHmac("sha256", secret).update("authenticated").digest("hex");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/api/auth");
  const isSplash = pathname === "/splash";

  const cookie = request.cookies.get("auth");
  const authenticated = cookie?.value === getExpectedToken();

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

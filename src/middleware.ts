import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_SECRET = process.env.AUTH_SECRET;
const secret = new TextEncoder().encode(AUTH_SECRET ?? "");
const PUBLIC_FILE = /\.(.*)$/;

function parseCookie(cookie: string, name: string): string | null {
  for (const part of cookie.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return part.slice(eq + 1).trim();
    }
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/data/") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const cookieHeader = request.headers.get("cookie") ?? "";
  const sessionCookie = parseCookie(cookieHeader, "session");

  let isValid = false;
  if (sessionCookie && AUTH_SECRET) {
    try {
      const { payload } = await jwtVerify(sessionCookie, secret, {
        algorithms: ["HS256"],
      });
      isValid = typeof payload.sub === "string";
    } catch {
      isValid = false;
    }
  }

  // Auth pages - redirect to dashboard if already signed in
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // All other routes require authentication
  if (!isValid) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|$).*)"],
};

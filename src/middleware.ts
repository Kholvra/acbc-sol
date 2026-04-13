import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Check for session cookie presence (edge runtime cannot verify JWT signature)
  const token = request.cookies.get("next-auth.session-token")?.value
    ?? request.cookies.get("__Secure-next-auth.session-token")?.value;

  // No token means unauthenticated - redirect to sign-in
  if (!token) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // Token present - pass to server component for full validation
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/kyc/:path*",
    "/profile/:path*",
    "/activity/:path*",
    "/live/:path*",
    "/explore/:path*",
    "/campaigns/:path*",
  ],
};

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "~/server/auth";

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false });
  }

  const payload = await verifyToken(sessionCookie.value);
  if (!payload) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    address: payload.address,
    role: payload.role,
  });
}

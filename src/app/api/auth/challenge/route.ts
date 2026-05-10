import { NextResponse } from "next/server";
import { createAuthMessage, generateNonce } from "~/server/auth";

export async function GET() {
  const nonce = generateNonce();
  const message = createAuthMessage(nonce);
  return NextResponse.json({ nonce, message });
}

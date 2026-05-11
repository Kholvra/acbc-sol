import { type NextRequest, NextResponse } from "next/server";
import { db } from "~/server/db";
import {
  verifySignature,
  consumeNonce,
  createAuthMessage,
  signToken,
} from "~/server/auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      message: string;
      signature: number[];
      publicKey: string;
      nonce: string;
    };
    const { message, signature, publicKey, nonce } = body;

    if (!message || !signature || !publicKey || !nonce) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (message !== createAuthMessage(nonce)) {
      return NextResponse.json(
        { error: "Message does not match the issued challenge" },
        { status: 401 },
      );
    }

    let isValidSignature = false;
    try {
      const sigBytes = new Uint8Array(signature);
      isValidSignature = verifySignature(message, sigBytes, publicKey);
    } catch {
      isValidSignature = false;
    }

    if (!isValidSignature) {
      return NextResponse.json(
        { error: "Signature verification failed" },
        { status: 401 },
      );
    }

    if (!consumeNonce(nonce)) {
      return NextResponse.json(
        { error: "Nonce already used or expired" },
        { status: 401 },
      );
    }

    const user = await db.user.upsert({
      where: { address: publicKey },
      update: {},
      create: { address: publicKey },
    });

    const token = await signToken({ address: publicKey, role: user.role });

    const response = NextResponse.json({
      success: true,
      address: publicKey,
      role: user.role,
    });

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 },
    );
  }
}

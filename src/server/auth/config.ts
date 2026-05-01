import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthConfig } from "next-auth";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";

import { db } from "~/server/db";

// crash early if AUTH_SECRET is missing — NextAuth v5 needs it for JWT signing
if (!process.env.AUTH_SECRET) {
  throw new Error("Missing AUTH_SECRET environment variable. Set it in Vercel: Settings > Environment Variables.");
}

/**
 * Timestamp nonce validity window: 5 min.
 */
const NONCE_EXPIRY_MS = 5 * 60 * 1000;

/**
 * Expected message format for wallet signature verification.
 *
 * Example:
 * ```
 * AidBeacon Authentication
 *
 * Sign this message to authenticate.
 * Wallet: Abc123...xyz
 * Timestamp: 1709571234567
 * ```
 *
 * The frontend must construct this exact format before requesting
 * the wallet to sign it.
 */
function buildExpectedMessage(address: string, timestamp: number): string {
  return [
    "AidBeacon Authentication",
    "",
    "Sign this message to authenticate.",
    `Wallet: ${address}`,
    `Timestamp: ${timestamp}`,
  ].join("\n");
}

function extractTimestamp(message: string): number | null {
  const match = /Timestamp:\s*(\d+)/.exec(message);
  if (!match?.[1]) return null;
  return Number(match[1]);
}

function verifySolanaSignature(
  message: string,
  signatureBase64: string,
  publicKeyBase58: string
): boolean {
  try {
    const publicKey = new PublicKey(publicKeyBase58);
    const messageBytes = new TextEncoder().encode(message);
    const signature = Buffer.from(signatureBase64, "base64");
    return nacl.sign.detached.verify(messageBytes, signature, publicKey.toBytes());
  } catch {
    return false;
  }
}

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "Solana Wallet",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Wallet Address", type: "text" },
      },

      /**
       * authorize() called when the frontend sends a POST to /api/auth/callback/credentials.
       *
       * Flow:
       * 1. Validate that all required fields are present
       * 2. Extract and validate the timestamp nonce from the message
       * 3. Rebuild the expected message and compare with the received message
       * 4. Use tweetnacl to verify the Solana signature
       * 5. Look up or create the user in the database (Solana addresses are case-sensitive, keep as-is)
       * 6. Return the user object (NextAuth serializes it into the JWT)
       */
      async authorize(credentials) {
        const message = credentials?.message as string | undefined;
        const signature = credentials?.signature as string | undefined;
        const address = credentials?.address as string | undefined;

        console.log("[auth] authorize called", {
          hasMessage: !!message,
          hasSignature: !!signature,
          hasAddress: !!address,
          address: address?.slice(0, 8),
        });

        if (
          typeof message !== "string" ||
          typeof signature !== "string" ||
          typeof address !== "string"
        ) {
          console.log("[auth] FAIL: missing credentials (types)");
          return null;
        }

        const timestamp = extractTimestamp(message);
        if (timestamp === null) {
          console.log("[auth] FAIL: no timestamp in message");
          return null;
        }

        const now = Date.now();
        const ageMs = Math.abs(now - timestamp);
        console.log("[auth] timestamp age:", ageMs, "ms");
        if (ageMs > NONCE_EXPIRY_MS) {
          console.log("[auth] FAIL: timestamp expired (age:", ageMs, "ms, max:", NONCE_EXPIRY_MS, "ms)");
          return null;
        }

        const expectedMessage = buildExpectedMessage(address, timestamp);
        if (message !== expectedMessage) {
          console.log("[auth] FAIL: message mismatch. Expected length:", expectedMessage.length, "Got:", message.length);
          return null;
        }

        console.log("[auth] verifying signature...");
        const isValid = verifySolanaSignature(message, signature, address);
        if (!isValid) {
          console.log("[auth] FAIL: signature verification failed. Sig length:", signature.length);
          return null;
        }

        console.log("[auth] signature valid, querying DB...");
        try {
          let user: { id: string; address: string; role: string | null } | null = await db.user.findUnique({
            where: { address },
          });

          user ??= await db.user.create({
              data: { address },
            });

          console.log("[auth] SUCCESS: user", user.id, "role:", user.role ?? "null");
          return {
            id: user.id,
            address: user.address,
            role: user.role ?? null,
          } as const;
        } catch (dbError) {
          console.error("[auth] FAIL: database error:", dbError);
          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // refresh every hour if active
  },

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.address = user.address ?? '';
        token.role = user.role ?? null;
      }

      // Refresh token data when session is updated
      if (trigger === "update" && session) {
        const updateSession = session as { user?: { id?: string; address?: string; role?: string | null } };
        if (updateSession.user) {
          token.id = updateSession.user.id ?? token.id;
          token.address = updateSession.user.address ?? token.address ?? '';
          token.role = updateSession.user.role ?? token.role ?? null;
        }
      }

      return token;
    },

    session({ session, token }) {
      session.user.id = token.id as string;
      session.user.address = token.address as string;
      session.user.role = token.role as string | null;
      return session;
    },
  },
} satisfies NextAuthConfig;

import CredentialsProvider from "next-auth/providers/credentials";
import { type NextAuthConfig } from "next-auth";
import { verifyMessage } from "viem";

import { db } from "~/server/db";

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
 * Wallet: 0x1234...abcd
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

export const authConfig = {
  providers: [
    CredentialsProvider({
      name: "Web3 Wallet",
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
       * 4. Use viem's verifyMessage to recover the signer from the signature
       *    and verify it matches the claimed address
       * 5. Look up or create the user in the database
       * 6. Return the user object (NextAuth serializes it into the JWT)
       */
      async authorize(credentials) {
        const message = credentials?.message as string | undefined;
        const signature = credentials?.signature as string | undefined;
        const address = credentials?.address as string | undefined;

        if (
          typeof message !== "string" ||
          typeof signature !== "string" ||
          typeof address !== "string"
        ) {
          return null;
        }

        const timestamp = extractTimestamp(message);
        if (timestamp === null) return null;

        const now = Date.now();
        if (Math.abs(now - timestamp) > NONCE_EXPIRY_MS) {
          return null;
        }

        const expectedMessage = buildExpectedMessage(address, timestamp);
        if (message !== expectedMessage) {
          return null;
        }

        try {
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });

          if (!isValid) return null;
        } catch {
          return null;
        }

        const normalizedAddress = address.toLowerCase();

        let user: { id: string; address: string; role: string | null } | null = await db.user.findUnique({
          where: { address: normalizedAddress },
        });

        user ??= await db.user.create({
            data: { address: normalizedAddress },
          });

        return {
          id: user.id,
          address: user.address,
          role: user.role ?? null,
        } as const;
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/sign-in",
  },

  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.address = user.address ?? '';
        token.role = user.role ?? null;
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

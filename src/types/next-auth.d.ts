import { type DefaultSession } from "next-auth";

/**
 * Module augmentation for NextAuth types.
 *
 * Extends the default Session and JWT types to include Web3 wallet
 * fields (id, address, role) that are injected by our custom
 * jwt() and session() callbacks in the auth config.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      address: string;
      role: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    address: string;
    role: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    address: string;
    role: string | null;
  }
}

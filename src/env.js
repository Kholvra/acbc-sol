import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET: z.string(),
    DATABASE_URL: z.string().optional(),
    DIRECT_URL: z.string().optional(),
    GROQ_API_KEY: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    VIDEOSDK_SECRET_KEY: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_PINATA_JWT: z.string().optional(),
    NEXT_PUBLIC_GATEWAY_URL: z.string().default("https://gateway.pinata.cloud"),
    NEXT_PUBLIC_VIDEOSDK_API_KEY: z.string().optional(),
    NEXT_PUBLIC_PROGRAM_ID: z.string(),
    NEXT_PUBLIC_IDRX_MINT: z.string(),
    NEXT_PUBLIC_SOLANA_RPC_URL: z.string().default("https://api.devnet.solana.com"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NODE_ENV: process.env.NODE_ENV,
    VIDEOSDK_SECRET_KEY: process.env.VIDEOSDK_SECRET_KEY,
    NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT,
    NEXT_PUBLIC_GATEWAY_URL: process.env.NEXT_PUBLIC_GATEWAY_URL,
    NEXT_PUBLIC_VIDEOSDK_API_KEY: process.env.NEXT_PUBLIC_VIDEOSDK_API_KEY,
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
    NEXT_PUBLIC_IDRX_MINT: process.env.NEXT_PUBLIC_IDRX_MINT,
    NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
  onValidationError: (errors) => {
    const messages = Object.entries(errors).map(
      ([key, error]) => `  ${key}: ${error}`
    );
    const msg =
      "Environment variable validation failed:\n" + messages.join("\n");
    console.error(msg);
    throw new Error(msg);
  },
});

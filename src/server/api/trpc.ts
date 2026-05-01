import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db } from "~/server/db";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const walletAddress = opts.headers.get("x-wallet-address") ?? null;

  return {
    db,
    walletAddress,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

export const publicProcedure = t.procedure.use(timingMiddleware);

export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (!ctx.walletAddress) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        walletAddress: ctx.walletAddress,
      },
    });
  });

export const adminProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const user = await ctx.db.user.findUnique({
      where: { address: ctx.walletAddress },
    });
    if (user?.role !== "ADMIN") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Admin access required",
      });
    }
    return next();
  }
);

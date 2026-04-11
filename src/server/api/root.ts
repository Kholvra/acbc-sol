import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { campaignRouter } from "~/server/api/routers/campaign";
import { kycRouter } from "~/server/api/routers/kyc";
import { userRouter } from "./routers/user";
import { agreementRouter } from "./routers/agreement";
import { invoiceRouter } from "./routers/invoice";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  campaign: campaignRouter,
  kyc: kycRouter,
  user: userRouter,
  agreement: agreementRouter,
  invoice: invoiceRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

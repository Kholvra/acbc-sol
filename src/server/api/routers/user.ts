import { updateProfileSchema } from "~/server/api/schemas/user.schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.update({
        where: { address: ctx.walletAddress },
        data: input,
      });
      return user;
    }),

  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { address: ctx.walletAddress },
      select: {
        id: true,
        name: true,
        role: true,
        address: true,
        kycDocument: {
          select: {
            id: true,
            documentType: true,
            extractedName: true,
            extractedNik: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return null;

    return {
      hasRole: !!user.role,
      hasKyc: !!user.kycDocument,
      role: user.role,
      kycStatus: user.kycDocument
        ? {
            hasDocument: true,
            document: user.kycDocument,
          }
        : null,
    };
  }),
});

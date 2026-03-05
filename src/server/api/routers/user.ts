import { updateProfileSchema } from "~/server/api/schemas/user.schema";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import type { User } from "@prisma/client";

export const userRouter = createTRPCRouter({
  updateProfile: protectedProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }): Promise<User> => {
      const user = await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      }) as User;
      return user;
    }),
});

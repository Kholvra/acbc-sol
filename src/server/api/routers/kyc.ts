import { TRPCError } from "@trpc/server";
import { Prisma } from "generated/prisma";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { extractKtpData } from "~/lib/ai/ktp-extractor";
import {
  uploadKtpSchema,
  ktpExtractedSchema,
} from "~/server/api/schemas/kyc.schema";

export const kycRouter = createTRPCRouter({
  uploadKtp: protectedProcedure
    .input(uploadKtpSchema)
    .mutation(async ({ ctx, input }) => {
      const extracted = await extractKtpData(input.imageBase64);

      const validated = ktpExtractedSchema.safeParse(extracted);

      if (!validated.success) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "KTP data could not be extracted",
        });
      }

      const { name: extractedName, nik: extractedNik } = validated.data;

      try {
        await ctx.db.kycDocument.create({
          data: {
            userId: ctx.session.user.id,
            documentType: "KTP",
            extractedName,
            extractedNik,
          },
        });
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "This NIK is already registered",
          });
        }
        throw error;
      }

      return {
        success: true as const,
        name: extractedName,
        nik: extractedNik,
      };
    }),
});

import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { extractKtpData } from "~/lib/ai/ktp-extractor";
import {
  uploadKtpSchema,
  ktpExtractedSchema,
} from "~/server/api/schemas/kyc.schema";
import { Prisma } from "@prisma/client";

export const kycRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({ where: { address: ctx.session.address }, select: { id: true } });
    if (!user) return { hasDocument: false, document: null };

    const document = await ctx.db.kycDocument.findUnique({
      where: { userId: user.id },
    });

    return {
      hasDocument: !!document,
      document: document
        ? {
            id: document.id,
            extractedName: document.extractedName,
            extractedNik: document.extractedNik,
            createdAt: document.createdAt,
          }
        : null,
    };
  }),

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
        const user = await ctx.db.user.findUnique({ where: { address: ctx.session.address }, select: { id: true } });
        if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });

        await ctx.db.kycDocument.create({
          data: {
            userId: user.id,
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

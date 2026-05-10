import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import {
  createAgreementSchema,
  updateAgreementSchema,
  submitAgreementSchema,
  approveAgreementSchema,
  rejectAgreementSchema,
  listAgreementsSchema,
  listPendingSchema,
} from "~/server/api/schemas/agreement.schema";

// Helper to calculate total from items
function calculateTotal(
  items: Array<{ unitPrice: number; quantity: number }>
): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export const agreementRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createAgreementSchema)
    .mutation(async ({ ctx, input }) => {
      // Calculate total
      const totalAmount = calculateTotal(input.items);

      // Create agreement with items
      const agreement = await ctx.db.purchaseAgreement.create({
        data: {
          campaignAddress: input.campaignAddress,
          vendorName: input.vendorName,
          vendorAddress: input.vendorAddress,
          category: input.category,
          startDate: input.startDate,
          endDate: input.endDate,
          paymentTerms: input.paymentTerms,
          totalAmount,
          items: {
            create: input.items.map((item) => ({
              itemName: item.itemName,
              specifications: item.specifications,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.unitPrice * item.quantity,
            })),
          },
        },
        include: { items: true },
      });

      return agreement;
    }),

  update: protectedProcedure
    .input(updateAgreementSchema)
    .mutation(async ({ ctx, input }) => {
      const { agreementId, ...data } = input;

      // Check status
      const existing = await ctx.db.purchaseAgreement.findUnique({
        where: { id: agreementId },
        select: { status: true },
      });

      if (existing?.status !== "DRAFT" && existing?.status !== "REJECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot update agreement in ${existing?.status} status`,
        });
      }

      // Calculate new total if items provided
      const totalAmount = data.items ? calculateTotal(data.items) : undefined;

      // Update
      const updateData: Record<string, unknown> = { ...data };
      if (totalAmount !== undefined) updateData.totalAmount = totalAmount;
      if (data.items) {
        updateData.items = {
          deleteMany: {},
          create: data.items.map((item) => ({
            itemName: item.itemName,
            specifications: item.specifications,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
            subtotal: item.unitPrice * item.quantity,
          })),
        };
      }

      const agreement = await ctx.db.purchaseAgreement.update({
        where: { id: agreementId },
        data: updateData,
        include: { items: true },
      });

      return agreement;
    }),

  submit: protectedProcedure
    .input(submitAgreementSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.purchaseAgreement.findUnique({
        where: { id: input.agreementId },
        select: { status: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });
      }

      if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot submit agreement in ${existing.status} status`,
        });
      }

      const agreement = await ctx.db.purchaseAgreement.update({
        where: { id: input.agreementId },
        data: {
          status: "PENDING_APPROVAL",
          submittedAt: new Date(),
        },
        include: { items: true },
      });

      return agreement;
    }),

  list: protectedProcedure
    .input(listAgreementsSchema)
    .query(async ({ ctx, input }) => {
      const agreements = await ctx.db.purchaseAgreement.findMany({
        where: {
          campaignAddress: input.campaignAddress,
          ...(input.status && { status: input.status }),
        },
        include: { items: true, invoice: true },
        orderBy: { createdAt: "desc" },
      });

      return agreements;
    }),

  detail: protectedProcedure
    .input(submitAgreementSchema)
    .query(async ({ ctx, input }) => {
      const agreement = await ctx.db.purchaseAgreement.findUnique({
        where: { id: input.agreementId },
        include: {
          items: true,
          invoice: { include: { attachments: true } },
        },
      });

      if (!agreement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agreement not found",
        });
      }

      return agreement;
    }),

  listPending: adminProcedure
    .input(listPendingSchema)
    .query(async ({ ctx, input }) => {
      const agreements = await ctx.db.purchaseAgreement.findMany({
        where: { status: "PENDING_APPROVAL" },
        include: {
          items: true,
        },
        orderBy: { submittedAt: "asc" },
        take: input.limit,
        skip: input.offset,
      });

      return agreements;
    }),

  approve: adminProcedure
    .input(approveAgreementSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.purchaseAgreement.findUnique({
        where: { id: input.agreementId },
        select: { status: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });
      }

      if (existing.status !== "PENDING_APPROVAL") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot approve agreement in ${existing.status} status`,
        });
      }

      const user = await ctx.db.user.findUnique({ where: { address: ctx.session.address }, select: { id: true } });
      if (!user) throw new TRPCError({ code: "UNAUTHORIZED" });
      const approvedBy = user.id;

      const agreement = await ctx.db.purchaseAgreement.update({
        where: { id: input.agreementId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy,
        },
        include: { items: true },
      });

      return agreement;
    }),

  reject: adminProcedure
    .input(rejectAgreementSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.purchaseAgreement.findUnique({
        where: { id: input.agreementId },
        select: { status: true },
      });

      if (!existing) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });
      }

      if (existing.status !== "PENDING_APPROVAL") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reject agreement in ${existing.status} status`,
        });
      }

      const agreement = await ctx.db.purchaseAgreement.update({
        where: { id: input.agreementId },
        data: {
          status: "REJECTED",
          rejectionReason: input.reason,
        },
        include: { items: true },
      });

      return agreement;
    }),
});

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

// Helper to check if user owns the agreement's campaign
async function verifyAgreementOwnership(
  prismaDb: { purchaseAgreement: { findUnique: (args: { where: { id: string }; include: { campaign: { select: { creatorId: true } } } }) => Promise<{ campaign: { creatorId: string } } | null> } },
  agreementId: string,
  userId: string
): Promise<boolean> {
  const agreement = await prismaDb.purchaseAgreement.findUnique({
    where: { id: agreementId },
    include: { campaign: { select: { creatorId: true } } },
  });

  if (!agreement) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Agreement not found" });
  }

  return agreement.campaign.creatorId === userId;
}

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
      // Verify user owns the campaign
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
        select: { creatorId: true },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      if (campaign.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your campaign",
        });
      }

      // Calculate total
      const totalAmount = calculateTotal(input.items);

      // Create agreement with items
      const agreement = await ctx.db.purchaseAgreement.create({
        data: {
          campaignId: input.campaignId,
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

      // Verify ownership
      const isOwner = await verifyAgreementOwnership(
        ctx.db,
        agreementId,
        ctx.session.user.id
      );
      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your agreement",
        });
      }

      // Check status
      const existing = await ctx.db.purchaseAgreement.findUnique({
        where: { id: agreementId },
        select: { status: true },
      });

      // Only DRAFT or REJECTED agreements can be edited.
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
      // Verify ownership
      const isOwner = await verifyAgreementOwnership(
        ctx.db,
        input.agreementId,
        ctx.session.user.id
      );
      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your agreement",
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
      // Verify user has access to campaign
      const campaign = await ctx.db.campaign.findUnique({
        where: { id: input.campaignId },
        select: { creatorId: true },
      });

      if (!campaign) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Campaign not found",
        });
      }

      // Only campaign creator can see their agreements
      if (campaign.creatorId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your campaign",
        });
      }

      const agreements = await ctx.db.purchaseAgreement.findMany({
        where: {
          campaignId: input.campaignId,
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
          campaign: { select: { creatorId: true } },
        },
      });

      if (!agreement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agreement not found",
        });
      }

      // Check access (owner or admin)
      const isOwner = agreement.campaign.creatorId === ctx.session.user.id;
      const isAdmin = ctx.session.user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not your agreement",
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
          campaign: { select: { title: true, creatorId: true } },
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
      const agreement = await ctx.db.purchaseAgreement.update({
        where: { id: input.agreementId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedBy: ctx.session.user.id,
        },
        include: { items: true },
      });

      return agreement;
    }),

  reject: adminProcedure
    .input(rejectAgreementSchema)
    .mutation(async ({ ctx, input }) => {
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

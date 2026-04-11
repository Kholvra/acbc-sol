import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "~/server/api/trpc";
import {
  submitInvoiceSchema,
  verifyInvoiceSchema,
  rejectInvoiceSchema,
  listPendingInvoicesSchema,
  invoiceIdSchema,
} from "~/server/api/schemas/invoice.schema";

export const invoiceRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(submitInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      // Get agreement to check status
      const agreement = await ctx.db.purchaseAgreement.findUnique({
        where: { id: input.agreementId },
        select: { status: true, totalAmount: true },
      });

      if (!agreement) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agreement not found",
        });
      }

      // Check agreement is approved
      if (agreement.status !== "APPROVED") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Agreement must be approved before submitting invoice",
        });
      }

      // Check for existing invoice
      const existingInvoice = await ctx.db.invoice.findUnique({
        where: { agreementId: input.agreementId },
      });

      if (existingInvoice) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Invoice already exists for this agreement",
        });
      }

      // Check 110% tolerance
      const maxAllowed = Number(agreement.totalAmount) * 1.1;
      if (input.totalAmount > maxAllowed) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Invoice exceeds 110% of agreement amount (max: ${maxAllowed})`,
        });
      }

      // Create invoice
      const invoice = await ctx.db.invoice.create({
        data: {
          agreementId: input.agreementId,
          invoiceNumber: input.invoiceNumber,
          invoiceDate: input.invoiceDate,
          totalAmount: input.totalAmount,
          attachments: {
            create: input.attachments,
          },
        },
        include: { attachments: true },
      });

      return invoice;
    }),

  listPending: adminProcedure
    .input(listPendingInvoicesSchema)
    .query(async ({ ctx, input }) => {
      const invoices = await ctx.db.invoice.findMany({
        where: { status: "PENDING_VERIFICATION" },
        include: {
          agreement: {
            include: {
              items: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: "asc" },
        take: input.limit,
        skip: input.offset,
      });

      return invoices;
    }),

  detail: protectedProcedure
    .input(invoiceIdSchema)
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        include: {
          attachments: true,
          agreement: {
            include: {
              items: true,
            },
          },
        },
      });

      if (!invoice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invoice not found",
        });
      }

      return invoice;
    }),

  verify: adminProcedure
    .input(verifyInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        select: { status: true },
      });

      if (existing?.status !== "PENDING_VERIFICATION") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot verify invoice in ${existing?.status} status`,
        });
      }

      const invoice = await ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: "VERIFIED",
          verifiedAt: new Date(),
          verifiedBy: ctx.session.user.id,
          notes: input.notes,
        },
        include: { attachments: true },
      });

      return invoice;
    }),

  reject: adminProcedure
    .input(rejectInvoiceSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.invoice.findUnique({
        where: { id: input.invoiceId },
        select: { status: true },
      });

      if (existing?.status !== "PENDING_VERIFICATION") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Cannot reject invoice in ${existing?.status} status`,
        });
      }

      const invoice = await ctx.db.invoice.update({
        where: { id: input.invoiceId },
        data: {
          status: "REJECTED",
          notes: input.reason,
        },
        include: { attachments: true },
      });

      return invoice;
    }),
});

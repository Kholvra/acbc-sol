import { z } from "zod";

export const invoiceStatusSchema = z.enum([
  "PENDING_VERIFICATION",
  "VERIFIED",
  "REJECTED",
]);

export const invoiceAttachmentSchema = z.object({
  fileName: z.string(),
  fileUrl: z.string().url(),
  fileType: z.string(),
  fileSize: z.number().int().nonnegative(),
});

export const submitInvoiceSchema = z.object({
  agreementId: z.string(),
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  invoiceDate: z.date(),
  totalAmount: z.number().min(0),
  attachments: z
    .array(invoiceAttachmentSchema)
    .min(1, "At least 1 attachment is required"),
});

export const invoiceIdSchema = z.object({
  invoiceId: z.string(),
});

export const verifyInvoiceSchema = z.object({
  invoiceId: z.string(),
  notes: z.string().optional(),
});

export const rejectInvoiceSchema = z.object({
  invoiceId: z.string(),
  reason: z.string().min(1, "Rejection reason is required"),
});

export const listPendingInvoicesSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

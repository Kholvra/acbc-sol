import { z } from "zod";

// Enums
export const expenseCategorySchema = z.enum([
  "MEDICAL",
  "CONSTRUCTION",
  "GROCERIES",
  "TRANSPORTATION",
  "UTILITIES",
  "OTHER",
]);

export const paymentTermsSchema = z.enum(["FULL_PAYMENT", "INSTALLMENT"]);

export const agreementStatusSchema = z.enum([
  "DRAFT",
  "PENDING_APPROVAL",
  "APPROVED",
  "REJECTED",
]);

// Item schema
export const agreementItemSchema = z.object({
  itemName: z.string().min(1, "Item name is required"),
  specifications: z.string().optional(),
  unitPrice: z.number().min(0, "Price must be non-negative"),
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

// Create agreement
export const createAgreementSchema = z.object({
  campaignAddress: z.string(),
  vendorName: z.string().min(1, "Vendor name is required"),
  vendorAddress: z.string().optional(),
  category: expenseCategorySchema,
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  paymentTerms: paymentTermsSchema,
  items: z.array(agreementItemSchema).min(1, "At least 1 item is required"),
});

export type CreateAgreementInput = z.infer<typeof createAgreementSchema>;

// Update agreement
export const updateAgreementSchema = createAgreementSchema.partial().extend({
  agreementId: z.string(),
});

export type UpdateAgreementInput = z.infer<typeof updateAgreementSchema>;

// Agreement ID
export const agreementIdSchema = z.object({
  agreementId: z.string(),
});

// Submit for approval
export const submitAgreementSchema = agreementIdSchema;

// Approve agreement
export const approveAgreementSchema = z.object({
  agreementId: z.string(),
  notes: z.string().optional(),
});

// Reject agreement
export const rejectAgreementSchema = z.object({
  agreementId: z.string(),
  reason: z.string().min(1, "Rejection reason is required"),
});

// List agreements
export const listAgreementsSchema = z.object({
  campaignAddress: z.string(),
  status: agreementStatusSchema.optional(),
});

// List with pagination
export const listPendingSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(20),
  offset: z.number().int().min(0).optional().default(0),
});

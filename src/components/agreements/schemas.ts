import { z } from 'zod';

// Constants
export const DEFAULT_CONTRACT_DAYS = 7;
export const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;

export const expenseCategorySchema = z.enum([
  'MEDICAL',
  'CONSTRUCTION',
  'GROCERIES',
  'TRANSPORTATION',
  'UTILITIES',
  'OTHER',
]);

export const paymentTermsSchema = z.enum(['FULL_PAYMENT', 'INSTALLMENT']);

export const agreementItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required'),
  specifications: z.string().optional(),
  unitPrice: z.number().min(0, 'Price must be positive'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

// Base schema without refinements (for extend usage)
const _agreementFormBaseSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  vendorName: z.string().min(1, 'Vendor name is required'),
  category: expenseCategorySchema,
  items: z.array(agreementItemSchema).min(1, 'At least 1 item required'),
  startDate: z.date({
    required_error: 'Start date is required',
    invalid_type_error: 'Invalid start date',
  }),
  endDate: z.date({
    required_error: 'End date is required',
    invalid_type_error: 'Invalid end date',
  }),
  paymentTerms: paymentTermsSchema,
});

// Schema with refinements (for form validation)
export const agreementFormSchema = _agreementFormBaseSchema.refine(
  (data) => data.endDate > data.startDate,
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  }
).refine(
  (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(data.startDate);
    start.setHours(0, 0, 0, 0);
    return start >= today;
  },
  {
    message: 'Start date cannot be in the past',
    path: ['startDate'],
  }
);

// Helper to get default end date
export const getDefaultEndDate = (startDate: Date = new Date(), days: number = DEFAULT_CONTRACT_DAYS): Date => {
  return new Date(startDate.getTime() + (days * MILLISECONDS_PER_DAY));
};

// Schema for agreements with metadata (for list page, backend response)
export const agreementWithMetaSchema = _agreementFormBaseSchema.extend({
  id: z.string(),
  status: z.enum(['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED']),
  totalAmount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  submittedBy: z.string().optional(),
  reviewedBy: z.string().optional(),
  reviewedAt: z.date().optional(),
});

export type AgreementFormData = z.infer<typeof agreementFormSchema>;
export type AgreementItemData = z.infer<typeof agreementItemSchema>;
export type ExpenseCategory = z.infer<typeof expenseCategorySchema>;
export type PaymentTerms = z.infer<typeof paymentTermsSchema>;
export type AgreementWithMeta = z.infer<typeof agreementWithMetaSchema>;
export type AgreementStatus = z.infer<typeof agreementWithMetaSchema.shape.status>;

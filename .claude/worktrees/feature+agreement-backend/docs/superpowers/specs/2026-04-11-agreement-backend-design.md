# Agreement Backend Design

**Date:** 2026-04-11
**Topic:** Complete Backend Implementation for Agreement Feature
**Branch:** feature/agreement-backend

---

## Overview

A 2-stage purchase approval system for donation transparency that replaces the existing direct Invoice model.

### Core Concept

1. **PurchaseAgreement** - Campaigner submits planned spending → Admin approves/rejects
2. **Invoice** - After approval, campaigner uploads receipt → Admin verifies

---

## Database Schema

### New Enums

```prisma
enum AgreementStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  REJECTED
}

enum InvoiceStatus {
  PENDING_VERIFICATION
  VERIFIED
  REJECTED
}

enum ExpenseCategory {
  MEDICAL
  CONSTRUCTION
  GROCERIES
  TRANSPORTATION
  UTILITIES
  OTHER
}

enum PaymentTerms {
  FULL_PAYMENT
  INSTALLMENT
}
```

### Updated Role Enum

```prisma
enum Role {
  DONATUR
  CAMPAIGNER
  ADMIN  // Added
}
```

### New Models

#### PurchaseAgreement

| Field | Type | Description |
|-------|------|-------------|
| id | String @id @default(cuid()) | Primary key |
| campaignId | String | FK to Campaign |
| vendorName | String | Supplier/merchant name |
| vendorAddress | String? | Optional address |
| category | ExpenseCategory | Expense category |
| startDate | DateTime | Contract start |
| endDate | DateTime | Contract end |
| paymentTerms | PaymentTerms | FULL_PAYMENT or INSTALLMENT |
| totalAmount | Decimal @db.Decimal(15,2) | Calculated total |
| status | AgreementStatus @default(DRAFT) | Current status |
| submittedAt | DateTime? | When submitted for approval |
| approvedAt | DateTime? | When approved |
| approvedBy | String? | Admin user ID who approved |
| rejectionReason | String? | Reason if rejected |
| createdAt | DateTime @default(now()) | Creation timestamp |
| updatedAt | DateTime @updatedAt | Update timestamp |

#### AgreementItem

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | Primary key |
| agreementId | String | FK to PurchaseAgreement |
| itemName | String | Item name |
| specifications | String? | Optional specs |
| unitPrice | Decimal | Price per unit |
| quantity | Int | Number of units |
| subtotal | Decimal | Calculated (unitPrice × quantity) |

#### Invoice

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | Primary key |
| agreementId | String @unique | FK to PurchaseAgreement (1:1) |
| invoiceNumber | String | Invoice/receipt number |
| invoiceDate | DateTime | Date on invoice |
| totalAmount | Decimal | Total on invoice |
| status | InvoiceStatus | PENDING_VERIFICATION, VERIFIED, REJECTED |
| verifiedAt | DateTime? | When verified |
| verifiedBy | String? | Admin user ID |
| notes | String? | Verification notes |
| createdAt | DateTime @default(now()) | Creation timestamp |
| updatedAt | DateTime @updatedAt | Update timestamp |

#### InvoiceAttachment

| Field | Type | Description |
|-------|------|-------------|
| id | String @id | Primary key |
| invoiceId | String | FK to Invoice |
| fileName | String | Original filename |
| fileUrl | String | Storage URL |
| fileType | String | MIME type |
| fileSize | Int | Size in bytes |
| createdAt | DateTime @default(now()) | Upload timestamp |

### Updated Campaign Model

Remove:
- ~~`invoices Invoice[]`~~ (old relation)

Add:
- `purchaseAgreements PurchaseAgreement[]`

### Indexes

- PurchaseAgreement: campaignId, status
- AgreementItem: agreementId
- Invoice: status
- InvoiceAttachment: invoiceId

---

## tRPC API Design

### Router: agreementRouter

#### Campaigner Endpoints

**`create`** - Protected
```typescript
Input: {
  campaignId: string
  vendorName: string
  vendorAddress?: string
  category: ExpenseCategory
  startDate: Date
  endDate: Date
  paymentTerms: PaymentTerms
  items: Array<{
    itemName: string
    specifications?: string
    unitPrice: number
    quantity: number
  }>
}
Returns: PurchaseAgreement with items
Business Rules:
- Calculate totalAmount from items
- Check total ≤ campaign remaining budget
- Set status = DRAFT
```

**`update`** - Protected
```typescript
Input: {
  agreementId: string
  data: Partial<create input>
}
Returns: Updated PurchaseAgreement
Business Rules:
- Only DRAFT status can be updated
- Recalculate totalAmount
- Re-check budget
```

**`submit`** - Protected
```typescript
Input: { agreementId: string }
Returns: Updated PurchaseAgreement
Business Rules:
- Only DRAFT → PENDING_APPROVAL
- Set submittedAt = now
- Must be agreement owner
```

**`list`** - Protected
```typescript
Input: {
  campaignId: string
  status?: AgreementStatus
}
Returns: Array<PurchaseAgreement>
```

**`detail`** - Protected
```typescript
Input: { agreementId: string }
Returns: PurchaseAgreement with items, invoice (if exists)
```

**`submitInvoice`** - Protected
```typescript
Input: {
  agreementId: string
  invoiceNumber: string
  invoiceDate: Date
  totalAmount: number
  attachments: Array<{
    fileName: string
    fileUrl: string
    fileType: string
    fileSize: number
  }>
}
Returns: Invoice with attachments
Business Rules:
- Agreement must be APPROVED
- invoiceAmount ≤ agreementAmount × 1.10 (110% tolerance)
- At least 1 attachment required
- Create 1:1 Invoice linked to Agreement
```

#### Admin Endpoints

**`listPending`** - Protected (admin only)
```typescript
Input: { limit?: number, offset?: number }
Returns: Array<PurchaseAgreement> where status = PENDING_APPROVAL
```

**`approve`** - Protected (admin only)
```typescript
Input: {
  agreementId: string
  notes?: string
}
Returns: Updated PurchaseAgreement
Business Rules:
- Status PENDING_APPROVAL → APPROVED
- Set approvedAt = now
- Set approvedBy = current user id
```

**`reject`** - Protected (admin only)
```typescript
Input: {
  agreementId: string
  reason: string
}
Returns: Updated PurchaseAgreement
Business Rules:
- Status PENDING_APPROVAL → REJECTED
- Set rejectionReason
```

**`listPendingInvoices`** - Protected (admin only)
```typescript
Input: { limit?: number, offset?: number }
Returns: Array<Invoice> where status = PENDING_VERIFICATION
```

**`verifyInvoice`** - Protected (admin only)
```typescript
Input: {
  invoiceId: string
  notes?: string
}
Returns: Updated Invoice
Business Rules:
- Status PENDING_VERIFICATION → VERIFIED
- Set verifiedAt = now
- Set verifiedBy = current user id
```

**`rejectInvoice`** - Protected (admin only)
```typescript
Input: {
  invoiceId: string
  reason: string
}
Returns: Updated Invoice
Business Rules:
- Status PENDING_VERIFICATION → REJECTED
- Set notes with rejection reason
```

---

## Zod Schemas

### agreement.schema.ts

```typescript
export const expenseCategorySchema = z.enum([
  'MEDICAL', 'CONSTRUCTION', 'GROCERIES',
  'TRANSPORTATION', 'UTILITIES', 'OTHER'
])

export const paymentTermsSchema = z.enum(['FULL_PAYMENT', 'INSTALLMENT'])

export const agreementItemSchema = z.object({
  itemName: z.string().min(1, 'Item name required'),
  specifications: z.string().optional(),
  unitPrice: z.number().min(0, 'Price must be non-negative'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

export const createAgreementSchema = z.object({
  campaignId: z.string(),
  vendorName: z.string().min(1, 'Vendor name required'),
  vendorAddress: z.string().optional(),
  category: expenseCategorySchema,
  startDate: z.date(),
  endDate: z.date(),
  paymentTerms: paymentTermsSchema,
  items: z.array(agreementItemSchema).min(1, 'At least 1 item required'),
})

export const updateAgreementSchema = createAgreementSchema.partial()

export const agreementIdSchema = z.object({
  agreementId: z.string(),
})

export const submitAgreementSchema = agreementIdSchema

export const approveAgreementSchema = z.object({
  agreementId: z.string(),
  notes: z.string().optional(),
})

export const rejectAgreementSchema = z.object({
  agreementId: string,
  reason: z.string().min(1, 'Rejection reason required'),
})

export const submitInvoiceSchema = z.object({
  agreementId: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice number required'),
  invoiceDate: z.date(),
  totalAmount: z.number().min(0),
  attachments: z.array(z.object({
    fileName: z.string(),
    fileUrl: z.string().url(),
    fileType: z.string(),
    fileSize: z.number(),
  })).min(1, 'At least 1 attachment required'),
})

export const verifyInvoiceSchema = z.object({
  invoiceId: z.string(),
  notes: z.string().optional(),
})

export const rejectInvoiceSchema = z.object({
  invoiceId: z.string(),
  reason: z.string().min(1, 'Rejection reason required'),
})
```

---

## Business Rules Summary

### Budget Validation
```
remainingBudget = campaign.totalRaised - campaign.totalUsedAmount
if (agreement.total > remainingBudget) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Exceeds budget' })
}
```

### Invoice Tolerance
```
maxAllowed = agreement.totalAmount × 1.10
if (invoice.totalAmount > maxAllowed) {
  throw new TRPCError({ code: 'BAD_REQUEST', message: 'Exceeds 110% tolerance' })
}
```

### Role Check Middleware
```typescript
const adminProcedure = protectedProcedure
  .use(({ ctx, next }) => {
    if (ctx.session.user.role !== 'ADMIN') {
      throw new TRPCError({ code: 'FORBIDDEN' })
    }
    return next()
  })
```

### Ownership Check
```typescript
// For campaigner operations
const agreement = await ctx.db.purchaseAgreement.findUnique({
  where: { id: input.agreementId },
  include: { campaign: true }
})

if (agreement.campaign.creatorId !== ctx.session.user.id) {
  throw new TRPCError({ code: 'FORBIDDEN', message: 'Not your agreement' })
}
```

---

## Error Handling

| Scenario | Code | Message |
|----------|------|---------|
| Agreement not found | NOT_FOUND | Agreement not found |
| Not agreement owner | FORBIDDEN | Not your agreement |
| Not admin | FORBIDDEN | Admin access required |
| Invalid status transition | BAD_REQUEST | Cannot perform action on agreement in {status} |
| Budget exceeded | BAD_REQUEST | Total exceeds remaining budget (remaining: X) |
| Invoice tolerance exceeded | BAD_REQUEST | Invoice exceeds 110% of agreement amount |
| Agreement not approved | BAD_REQUEST | Agreement must be approved before submitting invoice |

---

## Data Flow

```
Campaigner Create Agreement
    ↓
Status: DRAFT
    ↓
Campaigner Submit Agreement
    ↓
Status: PENDING_APPROVAL
    ↓
Admin Approve/Reject
    ↓
Status: APPROVED or REJECTED
    ↓ (if approved)
Campaigner Submit Invoice
    ↓
Status: PENDING_VERIFICATION
    ↓
Admin Verify/Reject
    ↓
Status: VERIFIED or REJECTED
```

---

## Files to Create/Modify

### Create
- `src/server/api/routers/agreement.ts`
- `src/server/api/schemas/agreement.schema.ts`

### Modify
- `prisma/schema.prisma`
- `src/server/api/root.ts`
- `src/server/api/trpc.ts` (add adminProcedure)

---

## Migration Strategy

1. Since old Invoice model is unused in code, safe to drop
2. Create new models
3. Generate migration with `npx prisma migrate dev --name add_agreement_system`
4. No data migration needed (no existing data)

---

## Acceptance Criteria

- [ ] Prisma schema generates without errors
- [ ] Migration applies successfully
- [ ] All tRPC procedures compile
- [ ] TypeScript check passes
- [ ] ESLint passes
- [ ] Can create agreement through tRPC caller
- [ ] Budget validation works
- [ ] Role-based access works (admin vs campaigner)
- [ ] Invoice tolerance validation works

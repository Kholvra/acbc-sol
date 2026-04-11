# Phase 1+2 Frontend Design: Agreement Form & Listing

**Date:** 2026-04-11  
**Branch:** feature/agreement-frontend  
**Scope:** Connect existing multi-step form to backend, create listing page

---

## Route Structure

| Path | Purpose |
|------|---------|
| `/campaigns/[id]/agreements/new` | Create new purchase agreement (existing, to be wired) |
| `/campaigns/[id]/agreements` | List all agreements for a campaign (new) |

---

## Phase 1: Connect Form

### tRPC Mutation
`api.agreement.create.useMutation()`

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Step 1: Form Input (strings)                                       │
│  - vendorName: string                                               │
│  - category: ExpenseCategory                                        │
│  - items: AgreementItemData[]                                       │
│  - startDate: string ("2024-01-15")                                 │
│  - endDate: string ("2024-01-22")                                   │
│  - paymentTerms: PaymentTerms                                       │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ Transform in page component
┌─────────────────────────────────────────────────────────────────────┐
│  Step 2: API Call (transformed)                                     │
│  {                                                                  │
│    campaignId: string,                                              │
│    vendorName: string,                                              │
│    vendorAddress: undefined,        ← Not in form, omit explicitly  │
│    category: ExpenseCategory,                                       │
│    items: AgreementItemData[],                                      │
│    startDate: new Date(data.startDate),  ← Date object              │
│    endDate: new Date(data.endDate),      ← Date object              │
│    paymentTerms: PaymentTerms                                       │
│  }                                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼ api.agreement.create.mutateAsync()
┌─────────────────────────────────────────────────────────────────────┐
│  Step 3: Response Handling                                          │
│  - Success: toast.success() → router.push(listing)                  │
│  - Error: toast.error(err.message) → stay on form                   │
└─────────────────────────────────────────────────────────────────────┘
```

### UI Changes in `/campaigns/[id]/agreements/new/page.tsx`

1. **Import tRPC hook:** `import { api } from '~/trpc/react'`
2. **Add mutation:** `const createMutation = api.agreement.create.useMutation()`
3. **Transform dates:** Convert `startDate` and `endDate` from strings to Date objects
4. **Handle vendorAddress:** Pass `undefined` explicitly (backend handles as optional)
5. **Cache invalidation:** Call `utils.agreement.list.invalidate()` before redirect
6. **Loading state:** Wire `createMutation.isPending` to form's submit button
7. **Remove debug:** Delete console.log statements
8. **Error handling:** Show TRPC error message in toast

### States

| State | UI Behavior |
|-------|-------------|
| **Loading** | Submit button shows spinner via `isLoading={createMutation.isPending}`, disabled state |
| **Success** | Toast "Agreement created successfully", invalidate list cache, redirect to `/campaigns/{id}/agreements` |
| **Error** | Toast with TRPC error message (e.g., "Not your campaign"), stay on form with data preserved |

---

## Phase 2: Listing Page

### tRPC Query
`api.agreement.list.useQuery({ campaignId })`

### File: `src/app/(dashboard)/campaigns/[id]/agreements/page.tsx`

**Structure:**
- TikTokLayout wrapper
- Header with title "Purchase Agreements", campaign context, and "+ New Agreement" CTA
- Agreement list component

### UI Components

**Header Section:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Purchase Agreements for "{campaignTitle}"                          │
│                                                                     │
│  [+ New Agreement]                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

**Agreement Card/Row:**
- **Vendor name** (primary text)
- **Category** (badge: MEDICAL, CONSTRUCTION, etc.)
- **Status** (color-coded badge):
  - DRAFT (gray)
  - PENDING_APPROVAL (yellow)
  - APPROVED (green)
  - REJECTED (red)
- **Total amount** - Formatted IDR (see Currency Formatting below)
- **Period** - `{startDate} → {endDate}`
- **Created** - Relative time (e.g., "2 days ago")
- **Actions** - View details (future), Edit (if DRAFT/REJECTED)

### Currency Formatting

**Approach:** Use `Intl.NumberFormat` with Indonesian locale.

```typescript
const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Example: formatIDR(1500000) → "Rp 1.500.000"
```

This is distinct from the form's `parseUnitPrice` which handles string → number conversion for inputs.

### States

| State | UI Behavior |
|-------|-------------|
| **Loading** | Skeleton rows (3-5) or full-page spinner with "Loading agreements..." |
| **Empty** | Empty state illustration with "No agreements yet" message and CTA to create first |
| **Error** | Error message with retry button, toast notification |
| **Data** | Table or card list with all agreements, sorted by `createdAt: desc` |

### Cache Strategy

**Stale Data Handling:** When redirecting from create → listing, the list query may have stale cached data.

**Solution (Option A - Explicit Invalidation):**
```typescript
const utils = api.useUtils();

// In create mutation onSuccess:
onSuccess: () => {
  utils.agreement.list.invalidate({ campaignId });
  router.push(`/campaigns/${campaignId}/agreements`);
}
```

This is the standard React Query pattern - invalidate the list before redirecting so fresh data loads.

---

## Navigation Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│   Campaign Detail Page                                                       │
│        │                                                                     │
│        │ "Manage Agreements" button                                          │
│        ▼                                                                     │
│   ┌─────────────────────────────────────┐                                    │
│   │  /campaigns/[id]/agreements         │                                    │
│   │  (Listing Page)                     │                                    │
│   │                                     │                                    │
│   │  ┌─────────────────────────────┐    │                                    │
│   │  │  Agreement List             │    │                                    │
│   │  │  - Sorted by createdAt desc │    │                                    │
│   │  │  - Status badges            │    │                                    │
│   │  └─────────────────────────────┘    │                                    │
│   │                                     │                                    │
│   │  [+ New Agreement]                  │                                    │
│   └──────────┬──────────────────────────┘                                    │
│              │                                                               │
│              ▼                                                               │
│   ┌─────────────────────────────────────┐                                    │
│   │  /campaigns/[id]/agreements/new     │                                    │
│   │  (Create Form - 3 steps)            │                                    │
│   │                                     │                                    │
│   │  Step 1: Details                    │                                    │
│   │  Step 2: Review                     │                                    │
│   │  Step 3: Submit ────────────────────┼──────► Invalidate list cache      │
│   │                                     │        Toast success               │
│   └─────────────────────────────────────┘        Redirect to listing ◄───────┘
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Edge Cases

| Case | Handling |
|------|----------|
| **Invalid campaignId** | TRPC returns NOT_FOUND → error toast, redirect to campaigns list or show error state |
| **User not campaign owner** | TRPC returns FORBIDDEN → error toast "Not your campaign", redirect to dashboard |
| **Network error during submit** | React Query retry ×3, then toast error with "Network error. Please try again." |
| **Date parse error** | Zod validation on form catches invalid dates before submission |
| **Empty items array** | Frontend schema prevents (min: 1), can't proceed to review step |
| **User navigates away during mutation** | Mutation continues in background; toast shows if completed on return |
| **Double-submit** | Submit button disabled via `isPending` state prevents duplicate submissions |
| **Browser back after create** | Listing page shows fresh data (cache invalidated), new agreement visible |
| **Server validation failure** | TRPC error bubble up to toast (e.g., "End date must be after start date") |

---

## File Changes

| File | Action | Purpose |
|------|--------|---------|
| `src/app/(dashboard)/campaigns/[id]/agreements/new/page.tsx` | **Modify** | Wire up `api.agreement.create.useMutation()`, transform dates to Date objects, pass `vendorAddress: undefined`, invalidate list cache on success, redirect on success, add error toast |
| `src/app/(dashboard)/campaigns/[id]/agreements/page.tsx` | **Create** | Listing page with `api.agreement.list.useQuery({ campaignId })`, TikTokLayout, header with CTA, handle empty/loading/error states |
| `src/components/agreements/agreement-list.tsx` | **Create** | Reusable component to render agreement cards/table rows with status badges and formatted amounts |
| `src/components/agreements/agreement-list-skeleton.tsx` | **Create** | Skeleton loading state for the agreement list |
| `src/lib/formatters.ts` | **Modify** (or create if doesn't exist) | Add `formatIDR()` utility function for currency display |

---

## Implementation Notes

### Date Transformation Detail

The backend expects `Date` objects, but HTML date inputs return strings. Transform in the page component:

```typescript
const handleSubmit = async (formData: AgreementFormData) => {
  const transformedData = {
    campaignId,
    vendorName: formData.vendorName,
    vendorAddress: undefined,  // Explicitly undefined, not empty string
    category: formData.category,
    items: formData.items,
    startDate: new Date(formData.startDate),  // String → Date
    endDate: new Date(formData.endDate),      // String → Date
    paymentTerms: formData.paymentTerms,
  };

  await createMutation.mutateAsync(transformedData);
};
```

### Status Badge Colors

| Status | Color |
|--------|-------|
| DRAFT | gray |
| PENDING_APPROVAL | yellow |
| APPROVED | green |
| REJECTED | red |

### Query Configuration

```typescript
const { data: agreements, isLoading, error } = api.agreement.list.useQuery(
  { campaignId },
  {
    enabled: !!campaignId,
    retry: 2,
    staleTime: 30 * 1000, // 30 seconds
  }
);
```

---

## Design Approved

Approved by: _________________  
Date: _________________

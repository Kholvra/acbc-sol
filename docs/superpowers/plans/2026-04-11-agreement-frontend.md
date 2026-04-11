# Implementation Plan: Phase 1+2 Agreement Frontend

**Date:** 2026-04-11  
**Branch:** feature/agreement-frontend  
**Based on:** docs/superpowers/specs/2026-04-11-agreement-frontend-design.md

---

## Scope

### In-Scope
- Wire up existing `/campaigns/[id]/agreements/new` form to `api.agreement.create` mutation
- Date transformation (string → Date) in page component before API call
- Cache invalidation (`utils.agreement.list.invalidate()`) on successful create
- Create new `/campaigns/[id]/agreements` listing page
- Status badges with color coding (DRAFT/gray, PENDING_APPROVAL/yellow, APPROVED/green, REJECTED/red)
- IDR currency formatting using `Intl.NumberFormat('id-ID')`
- Loading, empty, and error states for listing page
- Proper error handling for FORBIDDEN, NOT_FOUND, and network errors
- Toast notifications via sonner

### Non-Goals
- Admin dashboard features (approve, reject, listPending)
- Invoice submission (Phase 3+)
- Agreement detail page
- Edit agreement functionality
- Vendor address field (backend accepts undefined)
- Real-time updates or WebSocket integration
- Pagination (not required by backend list schema)
- Search/filter on listing page

---

## Steps

### Step 1: Create Utility Formatter for IDR Currency

**Files:**
- `src/lib/formatters.ts` (create)

**Action:**
Create a new utility file with the `formatIDR` function for consistent currency display across the application.

```typescript
export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};
```

**Verification:**
```bash
npm run typecheck -- src/lib/formatters.ts
```

**Commit:**
```
feat(lib): add formatIDR utility for Indonesian Rupiah formatting

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

### Step 2: Create Agreement List Components

**Files:**
- `src/components/agreements/agreement-list.tsx` (create)
- `src/components/agreements/agreement-list-skeleton.tsx` (create)

**Action:**

**2a. Create `agreement-list-skeleton.tsx`**
- 3-5 skeleton rows matching the agreement card layout
- Use Tailwind animate-pulse for loading effect
- Match the visual structure: vendor, category badge, status badge, amount, dates

**2b. Create `agreement-list.tsx`**
- Props interface: `agreements` (array from API), `campaignId` (string)
- Import `formatIDR` from `src/lib/formatters`
- Map through agreements and render each as a card/row with:
  - Vendor name (bold, primary text)
  - Category badge (MEDICAL, CONSTRUCTION, etc.)
  - Status badge with colors:
    - DRAFT: `bg-gray-100 text-gray-700`
    - PENDING_APPROVAL: `bg-yellow-100 text-yellow-700`
    - APPROVED: `bg-green-100 text-green-700`
    - REJECTED: `bg-red-100 text-red-700`
  - Total amount via `formatIDR(agreement.totalAmount)`
  - Period: `{startDate.toLocaleDateString('id-ID')} → {endDate.toLocaleDateString('id-ID')}`
  - Created at: relative time or formatted date

**Verification:**
```bash
npm run typecheck -- src/components/agreements/
npm run lint -- src/components/agreements/
```

**Commit:**
```
feat(components): add AgreementList and AgreementListSkeleton components

- AgreementList renders agreement cards with status badges and IDR formatting
- AgreementListSkeleton provides loading state with 4 skeleton rows
- Status colors: gray (DRAFT), yellow (PENDING), green (APPROVED), red (REJECTED)

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

### Step 3: Create Listing Page

**Files:**
- `src/app/(dashboard)/campaigns/[id]/agreements/page.tsx` (create)

**Action:**
Create the listing page following this structure:

```typescript
'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '~/trpc/react';
import { toast } from 'sonner';
import TikTokLayout from '~/components/layout/tiktok-layout';
import Button from '~/components/ui/button';
import { AgreementList } from '~/components/agreements/agreement-list';
import { AgreementListSkeleton } from '~/components/agreements/agreement-list-skeleton';
import { EmptyState } from '~/components/ui/empty-state';
import { Plus, FileText } from 'lucide-react';

interface AgreementsPageProps {
  params: Promise<{ id: string }>;
}

export default function AgreementsPage({ params }: AgreementsPageProps) {
  const router = useRouter();
  const { id: campaignId } = use(params);

  const { data: agreements, isLoading, error } = api.agreement.list.useQuery(
    { campaignId },
    {
      enabled: !!campaignId,
      retry: 2,
      staleTime: 30 * 1000,
    }
  );

  // Handle error with useEffect for toast
  React.useEffect(() => {
    if (error) {
      toast.error(error.message || 'Failed to load agreements');
    }
  }, [error]);

  const handleCreateNew = () => {
    router.push(`/campaigns/${campaignId}/agreements/new`);
  };

  return (
    <TikTokLayout>
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20 min-h-screen">
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-heading font-black text-aid-dark mb-3 tracking-tight">
              Purchase Agreements
            </h1>
            <p className="text-aid-dark/60 font-medium max-w-2xl">
              Manage purchase agreements for this campaign. All agreements require admin approval before proceeding.
            </p>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={handleCreateNew}
            leftIcon={<Plus size={20} />}
          >
            New Agreement
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {isLoading ? (
            <AgreementListSkeleton />
          ) : error ? (
            <EmptyState
              title="Error Loading Agreements"
              description={error.message || 'Something went wrong. Please try again.'}
              icon={<FileText className="w-12 h-12 text-red-300 mx-auto mb-4" />}
              action={{
                label: 'Try Again',
                onClick: () => window.location.reload(),
              }}
            />
          ) : agreements && agreements.length > 0 ? (
            <AgreementList agreements={agreements} campaignId={campaignId} />
          ) : (
            <EmptyState
              title="No Agreements Yet"
              description="Create your first purchase agreement to start tracking campaign expenses."
              icon={<FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />}
              action={{
                label: 'Create First Agreement',
                onClick: handleCreateNew,
              }}
            />
          )}
        </div>
      </div>
    </TikTokLayout>
  );
}
```

**Key Points:**
- Use `use(params)` for Next.js 15 async params
- Query only runs when `campaignId` is truthy (`enabled: !!campaignId`)
- Handle FORBIDDEN/NOT_FOUND errors via toast (TRPC returns these as error states)
- Empty state has CTA to create first agreement
- Error state has retry button

**Verification:**
```bash
npm run typecheck -- src/app/(dashboard)/campaigns/\[id\]/agreements/page.tsx
npm run lint -- src/app/(dashboard)/campaigns/\[id\]/agreements/page.tsx
```

**Commit:**
```
feat(pages): create agreements listing page at /campaigns/[id]/agreements

- Uses api.agreement.list.useQuery with campaignId
- Implements loading, empty, and error states
- Includes New Agreement CTA button
- Follows project TikTokLayout and styling patterns

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

### Step 4: Wire Up Create Form to Backend

**Files:**
- `src/app/(dashboard)/campaigns/[id]/agreements/new/page.tsx` (modify)

**Action:**
Modify the existing new agreement page to connect to the backend:

**4a. Add imports:**
```typescript
import { api } from '~/trpc/react';
import { TRPCClientError } from '@trpc/client';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';
```

**4b. Add error type helper (match kyc-verification-card pattern):**
```typescript
interface TRPCErrorShape {
  code?: TRPC_ERROR_CODE_KEY;
  message?: string;
}

function isTRPCError(error: unknown): error is { data?: TRPCErrorShape } {
  return (
    error instanceof TRPCClientError ||
    (typeof error === 'object' && error !== null && 'data' in error)
  );
}
```

**4c. Add mutation with utils for cache invalidation:**
```typescript
const utils = api.useUtils();

const createMutation = api.agreement.create.useMutation({
  onSuccess: async () => {
    // Invalidate list cache before redirect
    await utils.agreement.list.invalidate({ campaignId });
    toast.success('Agreement created successfully!');
    router.push(`/campaigns/${campaignId}/agreements`);
  },
  onError: (error) => {
    if (isTRPCError(error)) {
      const errorCode = error.data?.code;
      const message = error.data?.message || 'Failed to create agreement';

      if (errorCode === 'FORBIDDEN') {
        toast.error('You do not have permission to create agreements for this campaign.');
      } else if (errorCode === 'NOT_FOUND') {
        toast.error('Campaign not found.');
      } else if (errorCode === 'BAD_REQUEST') {
        toast.error(message);
      } else {
        toast.error(message);
      }
    } else {
      toast.error('An unexpected error occurred. Please try again.');
    }
  },
});
```

**4d. Transform handleSubmit function:**
```typescript
const handleSubmit = async (data: AgreementFormData) => {
  try {
    // Transform form data (strings) to API format (Dates)
    const transformedData = {
      campaignId,
      vendorName: data.vendorName,
      vendorAddress: undefined, // Not in form, backend handles as optional
      category: data.category,
      items: data.items.map(item => ({
        itemName: item.itemName,
        specifications: item.specifications,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      startDate: new Date(data.startDate), // String → Date
      endDate: new Date(data.endDate),     // String → Date
      paymentTerms: data.paymentTerms,
    };

    await createMutation.mutateAsync(transformedData);
  } catch {
    // Error handled by mutation's onError
    // Stay on form so user can retry
  }
};
```

**4e. Wire loading state to form:**
```typescript
<AgreementForm
  campaignId={campaignId}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```
Note: The form already has `isSubmitting` state internally, but we should verify the button disables properly during mutation.

**4f. Remove debug code:**
- Delete the `console.log('=== AGREEMENT SUBMITTED ===')` and related logs
- Update success toast to not mention "Check console"

**Verification:**
```bash
npm run typecheck -- src/app/(dashboard)/campaigns/\[id\]/agreements/new/page.tsx
npm run lint -- src/app/(dashboard)/campaigns/\[id\]/agreements/new/page.tsx
```

**Commit:**
```
feat(pages): wire up agreement create form to backend API

- Add api.agreement.create.useMutation with cache invalidation
- Transform string dates to Date objects before API call
- Handle FORBIDDEN, NOT_FOUND, and BAD_REQUEST errors
- Pass vendorAddress as undefined (backend optional field)
- Remove debug console.log statements

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

### Step 5: Add Navigation Link from Campaign Detail

**Files:**
- Identify and modify the campaign detail page or relevant navigation

**Action:**
Find where campaign actions are displayed (likely in a campaign detail page or card) and add a "Manage Agreements" button/link that navigates to `/campaigns/[id]/agreements`.

If no campaign detail page exists in the current scope, this step can be skipped or noted as future work.

**Verification:**
```bash
# Verify the link works
npm run dev
# Navigate to a campaign and click "Manage Agreements"
```

**Commit:**
```
feat(nav): add Manage Agreements link to campaign detail

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| **Date parsing edge cases** (invalid date strings) | Zod validation in form catches before submission; `new Date()` handles most ISO strings; TRPC will return BAD_REQUEST if dates are invalid |
| **Cache not invalidating** | Use `await utils.agreement.list.invalidate({ campaignId })` before redirect; use specific campaignId in invalidate call |
| **Double-submit** | Form's `isSubmitting` state disables submit button; mutation's `isPending` also available for additional guard |
| **TRPC error typing issues** | Use `isTRPCError` helper from kyc-verification-card pattern; fallback to generic error message |
| **Empty skeleton layout shift** | Match skeleton dimensions exactly to loaded content; use consistent padding and spacing |
| **Large agreement lists causing performance issues** | Backend returns all agreements (no pagination in schema); if this becomes an issue, future work can add pagination to backend |
| **Timezone issues with dates** | Backend stores dates as-is; frontend displays using `toLocaleDateString('id-ID')` which handles local timezone |

---

## Verification Summary

Before marking implementation complete, verify:

- [ ] **TypeScript:** `npm run typecheck` passes with no errors
- [ ] **Linting:** `npm run lint` passes with no errors
- [ ] **Format:** `npm run format:check` passes

### Manual Testing Checklist

- [ ] **Create Agreement Flow:**
  - Navigate to `/campaigns/[valid-id]/agreements/new`
  - Fill all form fields (vendor, category, items, dates, payment terms)
  - Proceed through all 3 steps
  - Submit form
  - Verify toast "Agreement created successfully!"
  - Verify redirect to `/campaigns/[id]/agreements`
  - Verify new agreement appears in list with correct data

- [ ] **Error Handling:**
  - Test with invalid campaign ID (should show NOT_FOUND error)
  - Test as non-owner (should show FORBIDDEN error)
  - Test with end date before start date (should show BAD_REQUEST)
  - Test network disconnection during submit (should show network error)

- [ ] **Listing Page States:**
  - Verify loading skeleton appears initially
  - Verify empty state when no agreements exist
  - Verify error state with retry button
  - Verify agreement cards render with:
    - Correct vendor name
    - Category badge
    - Status badge with correct color
    - Formatted IDR amount
    - Date range

- [ ] **Cache Invalidation:**
  - Create a new agreement
  - Immediately navigate back to listing (browser back)
  - Verify new agreement appears without manual refresh

- [ ] **Double-Submit Prevention:**
  - Click submit button rapidly multiple times
  - Verify only one agreement is created

---

## Implementation Notes

### Date Transformation Detail

The form returns dates as strings (`"2024-01-15"`) from HTML date inputs. Transform to Date objects:

```typescript
startDate: new Date(data.startDate), // "2024-01-15" → Date object
endDate: new Date(data.endDate),     // "2024-01-22" → Date object
```

This matches the backend's `createAgreementSchema` which expects `z.date()`.

### Error Code Mapping

| TRPC Error Code | User-Facing Message |
|-----------------|---------------------|
| FORBIDDEN | "You do not have permission to create agreements for this campaign." |
| NOT_FOUND | "Campaign not found." |
| BAD_REQUEST | Use server message (e.g., "End date must be after start date") |
| default | "An unexpected error occurred. Please try again." |

### Query Configuration

```typescript
api.agreement.list.useQuery(
  { campaignId },
  {
    enabled: !!campaignId,     // Only run when campaignId exists
    retry: 2,                  // Retry twice on failure
    staleTime: 30 * 1000,      // 30 second stale time
  }
);
```

### Currency Format Pattern

```typescript
// formatIDR(1500000) → "Rp 1.500.000"
new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
}).format(amount)
```

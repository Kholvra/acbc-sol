# Implementation Plan: Phase 1+2 Agreement Frontend

**Date:** 2026-04-11  
**Branch:** feature/agreement-frontend  
**Based on:** docs/superpowers/specs/2026-04-11-agreement-frontend-design.md

---

## Pre-Reading (REQUIRED)

Before implementing, the agent MUST read these files to understand existing patterns:

1. **src/app/(dashboard)/campaigns/[id]/agreements/new/page.tsx** - Current form page implementation
2. **src/components/agreements/agreement-form.tsx** - Form component structure and props
3. **src/components/agreements/schemas.ts** - Frontend AgreementFormData type (note: dates are strings)
4. **src/server/api/schemas/agreement.schema.ts** - Backend createAgreementSchema (note: dates are Date objects)
5. **src/server/api/routers/agreement.ts** - Create and list procedures (input/output shapes, error codes)
6. **src/components/kyc/kyc-verification-card.tsx** - Reference for TRPC error handling pattern
7. **src/components/ui/empty-state.tsx** - Verify component exists and understand props
8. **src/components/ui/button.tsx** - Button component props (variant, size, isLoading, leftIcon)

**Pre-Check:** Verify these exist before starting:
- `lucide-react` package (check package.json)
- `src/components/ui/empty-state.tsx` component
- `sonner` toast library (check package.json)

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
- Navigation links from campaign detail (defer to later phase — file location unclear)

---

## Steps

### Step 1: Create Utility Formatter for IDR Currency

**Files:**
- `src/lib/formatters.ts` (create)

**Action:**
Create a utility file exporting a function to format numbers as Indonesian Rupiah. Use `Intl.NumberFormat` with locale `'id-ID'`, currency `'IDR'`, and 0 fraction digits.

**Key Code:**
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
npm run typecheck
```

**Commit:**
```
feat(lib): add formatIDR utility for Indonesian Rupiah formatting
```

---

### Step 2: Create Agreement List Components

**Files:**
- `src/components/agreements/agreement-list.tsx` (create)
- `src/components/agreements/agreement-list-skeleton.tsx` (create)

**Action:**

**2a. Skeleton Component:**
Create a skeleton loading component that renders 4 placeholder rows. Each row should mimic the agreement card layout (vendor name area, category badge area, status badge area, amount area). Use Tailwind's `animate-pulse` and appropriate background colors (e.g., `bg-gray-200`) to create the loading effect.

**2b. List Component:**
Create a component that accepts an array of agreements (from `api.agreement.list` output) and campaignId. For each agreement, render:
- Vendor name (bold text)
- Category badge (text from agreement.category)
- Status badge with conditional colors:
  - DRAFT: gray background/text
  - PENDING_APPROVAL: yellow background/text
  - APPROVED: green background/text
  - REJECTED: red background/text
- Total amount using `formatIDR(agreement.totalAmount)`
- Period: start date → end date (formatted with `toLocaleDateString('id-ID')`)
- Created at date (formatted)

Import `formatIDR` from the utility created in Step 1.

**Verification:**
```bash
npm run typecheck
npm run lint
```

**Commit:**
```
feat(components): add AgreementList and AgreementListSkeleton components

- AgreementList renders agreement cards with status badges and IDR formatting
- AgreementListSkeleton provides loading state with 4 skeleton rows
- Status colors: gray (DRAFT), yellow (PENDING), green (APPROVED), red (REJECTED)
```

---

### Step 3: Create Listing Page

**Files:**
- `src/app/(dashboard)/campaigns/[id]/agreements/page.tsx` (create)

**Action:**
Create a client page component (with `'use client'`) that:

1. Extracts `campaignId` from params using `use(params)` (Next.js 15 pattern)
2. Calls `api.agreement.list.useQuery({ campaignId })` with:
   - `enabled: !!campaignId`
   - `retry: 2`
   - `staleTime: 30000`
3. Wraps content in `TikTokLayout`
4. Shows `AgreementListSkeleton` when `isLoading`
5. Shows `EmptyState` with CTA when no agreements exist
6. Shows error state (with retry button) when query errors
7. Renders `AgreementList` with data when available
8. Includes a "New Agreement" button that navigates to `/campaigns/[id]/agreements/new`
9. Shows error toast when TRPC returns error (use useEffect to watch error state)

Use `Plus` and `FileText` icons from `lucide-react` (verify exists in pre-check).

**Verification:**
```bash
npm run typecheck
npm run lint
```

**Commit:**
```
feat(pages): create agreements listing page at /campaigns/[id]/agreements

- Uses api.agreement.list.useQuery with campaignId
- Implements loading, empty, and error states
- Includes New Agreement CTA button
- Follows project TikTokLayout and styling patterns
```

---

### Step 4: Wire Up Create Form to Backend

**Files:**
- `src/app/(dashboard)/campaigns/[id]/agreements/new/page.tsx` (modify)

**Action:**
Modify the existing page to connect to the backend:

1. **Add imports:** Import `api` from `~/trpc/react`, `TRPCClientError` from `@trpc/client`, and error type helpers (see kyc-verification-card for pattern)

2. **Add mutation:** Create `api.agreement.create.useMutation()` with:
   - `onSuccess`: invalidate list cache, show success toast, redirect to listing
   - `onError`: handle FORBIDDEN, NOT_FOUND, BAD_REQUEST with appropriate toast messages

3. **Transform data in handleSubmit:** Before calling `mutateAsync`, transform the form data:
   ```typescript
   const transformedData = {
     campaignId,
     vendorName: data.vendorName,
     vendorAddress: undefined,  // Explicitly undefined
     category: data.category,
     items: data.items,
     startDate: new Date(data.startDate),  // String → Date
     endDate: new Date(data.endDate),      // String → Date
     paymentTerms: data.paymentTerms,
   };
   ```

4. **Wire loading state:** Pass `createMutation.isPending` to form's submit button (check if form supports isLoading prop or needs internal state modification)

5. **Remove debug code:** Delete all console.log statements and update success toast to not mention console

**Key Points:**
- MUST transform string dates to Date objects (backend expects Date)
- MUST pass `vendorAddress: undefined` (not empty string)
- MUST invalidate cache BEFORE redirect: `await utils.agreement.list.invalidate({ campaignId })`
- Error handler should use `isTRPCError` helper pattern from kyc-verification-card

**Verification:**
```bash
npm run typecheck
npm run lint
```

**Commit:**
```
feat(pages): wire up agreement create form to backend API

- Add api.agreement.create.useMutation with cache invalidation
- Transform string dates to Date objects before API call
- Handle FORBIDDEN, NOT_FOUND, and BAD_REQUEST errors
- Pass vendorAddress as undefined (backend optional field)
- Remove debug console.log statements
```

---

### Step 5: Run Manual Tests and Document Results

**Files:**
- None (verification step)

**Action:**
Run through the manual testing checklist and document results. Create a test-results.md file or update the plan with checkmarks.

**Test Checklist:**

- [ ] **Typecheck passes:** `npm run typecheck` completes with 0 errors
- [ ] **Lint passes:** `npm run lint` completes with 0 errors
- [ ] **Format check:** `npm run format:check` passes

**Create Agreement Flow:**
- [ ] Navigate to `/campaigns/[valid-id]/agreements/new`
- [ ] Fill all form fields (vendor, category, items with quantities/prices, dates, payment terms)
- [ ] Proceed through all 3 steps (Details → Review → Submit)
- [ ] Submit form
- [ ] Verify toast "Agreement created successfully!"
- [ ] Verify redirect to `/campaigns/[id]/agreements`
- [ ] Verify new agreement appears in list with correct vendor, amount, status

**Error Handling:**
- [ ] Test with invalid campaign ID (should show NOT_FOUND error toast)
- [ ] Test as non-owner (should show FORBIDDEN error toast)
- [ ] Test with end date before start date (should show BAD_REQUEST)
- [ ] Test network error (offline/airplane mode during submit)

**Listing Page States:**
- [ ] Verify loading skeleton appears initially
- [ ] Verify empty state when no agreements exist (with CTA)
- [ ] Verify error state with retry button when query fails
- [ ] Verify agreement cards show: vendor, category badge, status badge, IDR amount, date range

**Cache Invalidation:**
- [ ] Create a new agreement
- [ ] Navigate back via browser back button
- [ ] Verify new agreement appears without manual refresh

**Double-Submit Prevention:**
- [ ] Click submit button rapidly multiple times
- [ ] Verify only one agreement is created in database

**Verification:**
```bash
# Run all verification commands
npm run typecheck
npm run lint
npm run format:check
```

**Commit:**
```
test: verify Phase 1+2 implementation passes all manual tests

- All typecheck, lint, format checks pass
- Create agreement flow tested end-to-end
- Error handling verified for FORBIDDEN, NOT_FOUND, BAD_REQUEST
- Cache invalidation confirmed working
```

---

## Risk Register

| Risk | Mitigation |
|------|------------|
| **Date parsing edge cases** | Zod validation in form catches before submission; TRPC returns BAD_REQUEST if dates invalid |
| **Cache not invalidating** | Use `await utils.agreement.list.invalidate({ campaignId })` with specific campaignId before redirect |
| **Double-submit** | Form's internal `isSubmitting` state + mutation `isPending` disables button |
| **TRPC error typing issues** | Use `isTRPCError` helper from kyc-verification-card; fallback to generic message |
| **Empty skeleton layout shift** | Match skeleton dimensions exactly to loaded content; consistent padding/spacing |
| **Large agreement lists** | Backend returns all agreements; future work can add pagination if needed |
| **Missing dependencies** | **Pre-check required:** Verify `lucide-react` and `EmptyState` component exist before Step 2/3 |
| **Timezone issues** | Use `toLocaleDateString('id-ID')` which handles local timezone properly |

---

## Implementation Notes

### Date Transformation Detail

The form returns dates as strings (`"2024-01-15"`) from HTML date inputs. Transform to Date objects before API call:

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

### TRPC Error Helper Pattern

From kyc-verification-card.tsx — use this pattern:

```typescript
import { TRPCClientError } from '@trpc/client';
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc';

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

---

## Definition of Done

- [ ] All 5 steps completed
- [ ] `npm run typecheck` passes with 0 errors
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run format:check` passes
- [ ] Manual test checklist completed with all items checked
- [ ] Create agreement flow works end-to-end (form → API → redirect → listing)
- [ ] Error handling works for FORBIDDEN, NOT_FOUND, BAD_REQUEST
- [ ] Cache invalidation verified (new agreement appears without refresh)
- [ ] Currency formatting displays correct IDR format (Rp 1.500.000)
- [ ] Status badges show correct colors

# Important Fixes Pending Backend Completion

> **Status:** Waiting for backend implementation to complete before addressing these issues.
> 
> This document tracks critical fixes that require backend integration.

---

## Critical Issues (Must Fix Before Production)

### 1. Server-Side Validation
**File:** `src/components/agreements/agreement-form.tsx:110-115`

**Problem:** No server-side validation implemented. Client-side Zod validation can be bypassed.

**Fix Required:**
- Implement server-side validation using the same Zod schemas
- Validate all form data on the API endpoint before processing
- Return structured validation errors to display in form

**Backend Dependency:** API endpoint for agreement creation with validation

---

### 2. Authorization Check for Campaign Ownership
**File:** `src/app/(dashboard)/campaigns/[id]/agreements/new/page.tsx:28-33`

**Problem:** No authorization check to verify user owns the campaign. Any authenticated user can create agreements for any campaign (IDOR vulnerability).

**Fix Required:**
- Add server-side check to verify `campaignId` belongs to authenticated user
- Return 403 Forbidden if user lacks permission
- Add client-side handling for authorization errors

**Backend Dependency:** API endpoint that validates campaign ownership

---

### 3. Middleware Route Protection
**File:** `src/middleware.ts:9`

**Problem:** Middleware only protects `/dashboard/:path*` but agreement routes are at `/campaigns/[id]/agreements/*`

**Fix Required:**
```typescript
// Update matcher to include campaign routes
export const config = {
  matcher: ["/dashboard/:path*", "/campaigns/:path*"],
};
```

**Backend Dependency:** None (can fix now, but testing requires backend)

---

### 4. Type Mismatch in Mock Data
**File:** `src/mocks/agreements.ts:3-45`

**Problem:** Mock data uses `Date` objects for `startDate`/`endDate`, but schema expects `string` types.

**Fix Required:**
```typescript
// Change from:
startDate: new Date(),
endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),

// To:
startDate: new Date().toISOString().split('T')[0],
endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
```

**Backend Dependency:** None (can fix now)

---

## High Priority Issues

### 5. Input Bounds Validation
**File:** `src/components/agreements/schemas.ts:12-15`

**Problem:** No maximum bounds on numeric inputs or length limits on text fields.

**Fix Required:**
```typescript
// Add maximum constraints
unitPrice: z.number().min(0).max(1000000000000), // 1 trillion max
quantity: z.number().int().min(1).max(1000000), // 1 million max
itemName: z.string().min(1).max(500),
specifications: z.string().max(2000).optional(),
```

**Backend Dependency:** API should enforce same limits

---

### 6. Rate Limiting
**File:** `src/components/agreements/agreement-form.tsx`

**Problem:** No rate limiting for form submissions.

**Fix Required:**
- Client-side: Disable submit button after click, add cooldown
- Server-side: Implement rate limiting on API endpoint

**Backend Dependency:** API rate limiting implementation

---

### 7. Error Handling with User Feedback
**File:** `src/components/agreements/agreement-form.tsx:92-103`

**Problem:** Errors are caught and logged to console but user sees no feedback.

**Fix Required:**
```typescript
} catch (error) {
  console.error('Submit error:', error);
  toast.error('Failed to submit agreement. Please try again.');
}
```

**Backend Dependency:** Proper error responses from API

---

## Medium Priority Issues

### 8. Remove Sensitive Data Logging
**Files:** 
- `src/components/agreements/agreement-form.tsx:110-115`
- `src/hooks/use-mock-agreements.ts:47`

**Problem:** Complete form data logged to console in production.

**Fix Required:**
- Remove `console.log` statements
- Use proper logging service with PII filtering
- Only log errors, not full form data

**Backend Dependency:** None (can fix now)

---

### 9. Remove Console Logging & Alerts
**File:** `src/components/agreements/agreement-form.tsx:95-99, 113`

**Problem:** Debug logging and `alert()` in production code.

**Fix Required:**
- Remove `console.log('=== FORM SUBMITTED ===')`
- Remove `alert('Form submitted! Check console for data.')`
- Use toast notifications instead

**Backend Dependency:** None (can fix now)

---

## Testing Infrastructure (Blocked)

### 10. Complete Testing Setup
**Problem:** Zero test coverage across all agreement components.

**Required:**
1. Install testing dependencies: `vitest`, `@testing-library/react`, `@testing-library/user-event`
2. Add test script to `package.json`: `"test": "vitest"`
3. Create `vitest.config.ts`
4. Write tests for:
   - Validation schemas (highest priority)
   - Form submission workflow
   - Dynamic array operations
   - Error handling

**Backend Dependency:** Mock API responses for integration tests

---

## Summary

| Priority | Count | Can Fix Now | Needs Backend |
|----------|-------|-------------|---------------|
| Critical | 4 | 1 | 3 |
| High | 3 | 1 | 2 |
| Medium | 2 | 2 | 0 |
| Testing | 1 | 0 | 1 |

**Total:** 10 major issues pending

---

## Next Steps After Backend Ready

1. [ ] Implement server-side validation on API
2. [ ] Add authorization middleware/checks
3. [ ] Update middleware route protection
4. [ ] Implement rate limiting
5. [ ] Add proper error handling with user feedback
6. [ ] Remove all debug logging
7. [ ] Set up testing infrastructure
8. [ ] Write comprehensive test suite

---

**Last Updated:** 2026-03-12  
**Status:** 🟡 Blocked - Waiting for backend implementation

# Campaign Card Donate Button Redesign

## Problem Statement

The desktop donate button in the campaign card component overlaps with the right-side control stack (like, share, mute buttons). Both elements use `absolute right-4` positioning, causing visual collision especially on shorter viewports or when the card is in expanded state.

## Current Implementation

**Desktop Donate Button (lines 213-233):**
```tsx
{!isMobile && (
    <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-2">
```

**Right-side Controls (lines 292-317):**
```tsx
<div className="absolute right-4 top-24 flex flex-col items-center gap-4 z-40...">
```

Both elements occupy the same horizontal space (`right-4`) with overlapping vertical positioning. The `!isMobile &&` check is redundant since `hidden md:flex` already handles desktop-only visibility.

## Proposed Solution

Reposition the desktop donate button as a Floating Action Button (FAB) in the bottom-right corner, separate from the media controls stack.

### Design Specifications

#### Position
- **Location:** Bottom-right corner, floating above collapsed info panel
- **Coordinates:** `right-4 md:bottom-8` (desktop), not shown on mobile
- **Z-index:** `z-50` (maintains click priority)
- **Visibility:** Hidden when `isExpanded === true` (panel has its own donate button)

**Why `md:bottom-8`:** The info panel uses `pb-28 md:pb-6` (24px desktop padding). Positioning at `bottom-8` (32px) keeps the FAB within the padding area without overlapping panel content.

#### Visual Style
| Property | Value |
|----------|-------|
| Shape | Circular |
| Size | 56px diameter (`w-14 h-14`) |
| Background | `bg-aid-green` |
| Icon | White heart (`text-white fill-current`) |
| Shadow | `shadow-xl` |
| Border | `border-2 border-white/20` |

#### Interaction States
| State | Style |
|-------|-------|
| Default | `bg-aid-green`, `shadow-xl` |
| Hover | `hover:bg-aid-dark`, `hover:scale-110` |
| Active/Press | `active:scale-95` |
| Disabled | `disabled:opacity-50`, `disabled:cursor-not-allowed` |
| Loading | Spinner animation (`animate-spin`) |

#### Animation
- Hover: Scale to 110% with `transition-transform duration-300`
- Press: Scale to 95%
- Loading: Replace icon with spinning loader
- Expanded transition: `transition-opacity duration-300` for hide/show

### Behavior

1. **Visibility:** Desktop only (`hidden md:flex`), hidden when `isExpanded === true`
2. **Quick Donate:** Executes `executeQuickDonate()` on click
3. **Loading State:** Shows spinner during transaction

**Expanded State Logic:**
When `isExpanded` is true, the info panel expands to 85% height and contains its own full-width donate button (line 434). The FAB should hide to avoid duplication and potential confusion:
```tsx
className={`... ${isExpanded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
```

### Mobile Considerations

Mobile layout remains unchanged:
- The existing "+" button at bottom-right (lines 421-428) continues to work
- Creates consistent donation trigger location across platforms

## Edge Cases

### Very Short Desktop Viewports
On `md:h-full` cards with minimal height, the FAB at `md:bottom-8` + controls at `top-24` + expanded panel (85% height) could cause vertical stacking issues.

**Mitigation:** The FAB hides when expanded (`isExpanded` condition), so the only risk is collapsed state with very short cards. The 32px FAB + 96px controls leaves adequate space on cards > 200px height. The card container uses `min-h-[400px]` implicitly via aspect ratio constraints.

### Collapsed vs Expanded Height
- **Collapsed:** Panel is `h-auto`, FAB at `bottom-8` sits within `md:pb-6` padding
- **Expanded:** Panel is `h-[85%]`, FAB is hidden to avoid overlap with expanded content

- `src/components/campaign/campaign-card.tsx` — Reposition and restyle desktop donate button

## Non-Goals

- No changes to mobile layout
- No changes to the quick donate logic/hook
- No changes to the right-side control stack
- No new animations beyond existing hover/press states
- Tooltip on hover (deferred enhancement)
- Simplifying the `!isMobile &&` check (out of scope for this fix)

## Verification

1. Desktop donate button appears at bottom-right, not center-right
2. No overlap with like/share/mute controls at any viewport height
3. Button hides when info panel is expanded
4. Button is clickable and executes quick donate
5. Loading state displays correctly
6. Mobile layout unchanged
7. Accessibility: Focus visible, aria-label present

## Accessibility

- **aria-label:** `aria-label="Quick donate ${QUICK_DONATE_AMOUNT} IDRX"` for screen readers
- **Focus ring:** `focus:outline-none focus:ring-2 focus:ring-aid-green focus:ring-offset-2` for keyboard navigation
- **Reduced motion:** Respect `prefers-reduced-motion` by using `transition-transform` which respects system settings

## Implementation Notes

Replace lines 213-233 with new FAB-style button:
- Position: `right-4 md:bottom-8` (was `right-4 top-1/2`)
- Shape: Circular `rounded-full w-14 h-14` (was rounded rectangle)
- Visibility: Add `hidden md:flex` only, removing redundant `!isMobile &&` wrapper
- Expanded state: Add `isExpanded` condition to hide FAB when panel is expanded

The `md:bottom-8` value (2rem/32px) positions the FAB within the desktop padding area (`md:pb-6` = 24px) plus a small offset.

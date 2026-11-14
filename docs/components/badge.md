# Badge — Component Reference

> **Status:** Implemented Reference  
> **Component:** `components/ui/badge`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Dashboard  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/badge/`  
> **Gallery route:** `/gallery/badge`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Badge** is a compact, non-intrusive status, category, or counter indicator used to communicate metadata, system states, numerical counts, tags, or operational stages at a glance.

### 1.1 In Scope
- **Semantic Status Variants**: `default`, `primary`, `success`, `warning`, `danger`, `info`, and `outline`.
- **Universal Density Scale**:
  - `sm` (`20px` / `1.25rem` minimum block size — compact tables & dense lists)
  - `md` (`24px` / `1.5rem` minimum block size — standard default)
  - `lg` (`28px` / `1.75rem` minimum block size — prominent headers & summaries)
- **Visual Modifier Roles**:
  - **Leading Icon Slot (`startIcon`)**: Decorative icon container marked `aria-hidden="true"`.
  - **Dot Indicator (`dot`, `dotPulse`)**: Colored circular indicator with optional reduced-motion-safe pulse animation.
  - **Tabular Counters**: `font-variant-numeric: tabular-nums` prevents width jitter when numeric counts update.
  - **Dismissible Tag (`onRemove`, `removeAriaLabel`)**: Native inline `<button type="button">` with click propagation stopped and localized ARIA labeling via props.
  - **Pill vs Rounded Geometry (`shape`)**: Consumes `--radius-full` (`pill`, default) or `--radius-control` (`rounded`: `6px` Dashboard / `8px` Website).
- **Zero Shadows & RTL/Arabic Parity**: Shadow-free across all starters, uses 100% CSS logical properties, and adjusts `:lang(ar)` line-height (`var(--line-height-arabic-snug)`) and letter-spacing (`normal`) to clear diacritics.

### 1.2 Out of Scope
- Full-page banner alerts (use an Alert/Callout pattern).
- Ephemeral floating notifications (use `Toast`).
- Multi-select combobox filter inputs.

---

## 2. Architecture & White-Label Isolation

The `Badge` primitive resides in `src/components/ui/badge/` and obeys the strict bottom-up layer contract:
- **Zero Third-Party UI Libraries:** Native `<span>`, `<button>`, and Kit `<Icon>` wrapper only.
- **Pure Dependency Flow:** Never imports `@/providers`, `@/i18n`, `@/components/patterns`, or `@/components/shell`.
- **No Silent English Fallbacks:** Dismissible badges receive translated `removeAriaLabel` explicitly from parent callers; `Badge` never calls `t()` or defaults to `'Remove'`.
- **Focus & Motion Contracts:** Dismiss button `:focus-visible` outlines consume `--focus-ring-width` and `--focus-ring-offset`. `.dotPulse` stops animating under `@media (prefers-reduced-motion: reduce)`.

---

## 3. Visual Variants & Semantic Token Contracts

All colors consume shared design tokens in light and dark themes with zero shadows:

| Variant | Semantic Role | Background Token | Text Token | Border Rule |
| :--- | :--- | :--- | :--- | :--- |
| **`default`** | Neutral / Categorical | `--color-surface-subtle` | `--color-text-primary` | `1px solid var(--color-border-subtle)` |
| **`primary`** | Brand / Action / Active | `--color-primary-subtle` | `--color-primary-subtle-foreground` | `1px solid var(--color-primary-border)` |
| **`success`** | Operational / Healthy | `--color-success-subtle` | `--color-success` | `1px solid color-mix(in srgb, currentColor 24%, transparent)` |
| **`warning`** | Pending / Degraded | `--color-warning-subtle` | `--color-warning` | `1px solid color-mix(in srgb, currentColor 24%, transparent)` |
| **`danger`** | Blocked / Outage / Critical | `--color-danger-subtle` | `--color-danger` | `1px solid color-mix(in srgb, currentColor 24%, transparent)` |
| **`info`** | Notice / Building / Info | `--color-info-subtle` | `--color-info` | `1px solid color-mix(in srgb, currentColor 24%, transparent)` |
| **`outline`** | Subtle Inactive / Tag | `transparent` | `--color-text-primary` | `1px solid var(--color-border-control)` |

### 3.1 Density & Control Sizing Scale

| Size | Min Block Size | Padding (`inline` / `block`) | Gap | Font Size | Line Height (LTR / AR) | Dot / Start Icon / Remove Button |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `20px` (`1.25rem`) | `var(--space-2)` / `var(--space-0-5)` | `var(--space-1)` | `var(--font-size-xs)` (`12px`) | `var(--line-height-none)` / `var(--line-height-arabic-snug)` | `0.375rem` dot · `0.75rem` icon · `0.875rem` btn |
| **`md`** | `24px` (`1.5rem`) | `var(--space-2)` / `var(--space-0-5)` | `var(--space-1)` | `var(--font-size-xs)` (`12px`) | `var(--line-height-none)` / `var(--line-height-arabic-snug)` | `0.375rem` dot · `0.875rem` icon · `1rem` btn |
| **`lg`** | `28px` (`1.75rem`) | `var(--space-3)` / `var(--space-0-5)` | `var(--space-2)` | `var(--font-size-sm)` (`14px`) | `var(--line-height-tight)` / `var(--line-height-arabic-snug)` | `var(--space-2)` dot · `1rem` icon · `1.125rem` btn |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **Semantic HTML**:
   - Renders an inline `<span>` with `data-variant`, `data-size`, and `data-shape`.
   - Decorative indicators (`.dot` and `.startIcon`) carry `aria-hidden="true"` so screen readers announce clean badge text.
   - When `onRemove` is provided, renders a native `<button type="button">` bound to `removeAriaLabel` and calls `e.stopPropagation()` before `onRemove()`.
2. **Tabular Numerals**:
   - Applies `font-variant-numeric: tabular-nums` so live counter badges do not shift surrounding elements.
3. **Reduced Motion**:
   - `.dotPulse` clears its continuous `@keyframes badgeDotPulse` animation when `prefers-reduced-motion: reduce` is active.

---

## 5. Component API & Props Specification

```typescript
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'pill' | 'rounded';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The content of the badge (label, count, or composition) */
  children: React.ReactNode;

  /** Semantic color variant. Defaults to 'default' */
  variant?: BadgeVariant;

  /** Sizing density step. Defaults to 'md' */
  size?: BadgeSize;

  /** Corner geometry: 'pill' (radius-full) or 'rounded' (radius-control). Defaults to 'pill' */
  shape?: BadgeShape;

  /** Optional leading icon element */
  startIcon?: React.ReactNode;

  /** Whether to show a colored semantic status dot indicator */
  dot?: boolean;

  /** Whether the dot indicator animates with a subtle pulse */
  dotPulse?: boolean;

  /** Callback fired when the dismissible remove button is clicked */
  onRemove?: () => void;

  /** Accessible label for the remove button. Required when onRemove is passed */
  removeAriaLabel?: string;

  /** Additional CSS class names */
  className?: string;
}
```

---

## 6. Verification

- **Unit suite**: `src/components/ui/badge/badge.test.tsx` (variants, sizes, shapes, decorative `aria-hidden` slots, dismissible propagation guard, ref forwarding, custom attributes).
- **Browser verification**: `e2e/badge.spec.ts` covering `/gallery/badge` variant/size/shape switching, dismiss/restore keyboard & pointer flow, matrix view, RTL/Arabic rendering, and zero dashboard shadows.

# Button — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Archetype (Documentation-Only Baseline)  
> **Applies to:** Core UI Primitive (`components/ui/button`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/button/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/button/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Executive Summary & Architectural Role

The `Button` primitive triggers an action: save, submit, cancel, retry, open a dialog, or execute a command.

Within the White Label UI Kit, `Button` serves as the **reference implementation of shared control sizing, two-tier token aliasing, and strict CSS Logical Properties**. It establishes the patterns that other interactive form controls (`Input`, `Select`, `Combobox`, `Toggle`) follow for sizing and density. It does not dictate the independent interaction or semantic contracts of non-control primitives (such as `Dialog`, `Tabs`, `Checkbox`, or `Card`), which follow their own WAI-ARIA standards.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        BUTTON ARCHETYPE SUMMARY                        │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Single Foundation: Identical implementation across all kit editions│
│  3. Six-Step Scale: xs (28px) → sm (32px) → md (36px) → lg (40px)      │
│                     → xl (48px) → 2xl (56px) via min-block-size        │
│  4. Product Default Aliases: Dashboard = md (36px) | Website = xl (48px│
│  5. Rendered Target Expansion: Expands to 48×48px min on coarse pointer│
│  6. 100% CSS Logical Properties: inline-size, block-size, padding-*    │
│  7. 100% Shadow-Free Dashboard: Surface steps, borders, focus rings    │
│  8. Geometry-Stable Loading: In-flow transparent content + spinner     │
│  9. Safe Native Defaults: type="button" prevents accidental submit     │
│ 10. Canonical Shared Source: Author in Dashboard, sync to Website      │
└────────────────────────────────────────────────────────────────────────┘
```

### The Single Foundation Principle
**One complete Button foundation serves every edition and starter.**
- The primitive contains zero licensing checks, zero account/subscription context, and zero `edition="pro"` props.
- Parallel implementations (such as `FreeButton` vs `ProButton`) are strictly forbidden.
- Commercial editions add pre-built patterns, multi-brand workflows, and application templates around `Button`; they do not alter or fork the primitive.

---

## 2. Inviolable Architectural Boundaries

### 2.1 The Four-Tier Architecture
Responsibility flows strictly downwards:

| Layer | Path | Allowed Dependencies | Forbidden Dependencies | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/button/` | `react`, `@/lib/cn`, `./*.module.css`, `../control-sizing` | `@/providers`, `@/i18n`, `next/*`, state/form/query libs, hardcoded English copy | Native `<button>` markup, styles, control sizing, loading presentation |
| **2. Connected Patterns** | `src/components/patterns/` | Layer 1 + `@/providers` (`useI18n`, `useTheme`), `@/components/icons` | `next/*`, direct DOM mutations | Binds translations (`t()`), bidi isolation (`<BidiText>`), and icon triggers |
| **3. Compositions & Shell** | `src/components/shell/`, `wireframes/` | Layers 1–2 + Layout contexts | `next/*`, dashboard shadows | Action bars, modal footers, website CTA rows |
| **4. Host Application** | `src/app/` (Next.js), `src/` (Vite) | All layers + `next/navigation`, `next/link` | Top-level client boundaries on server layouts | Routing, server mutations, analytics, notifications |

### 2.2 Canonical Source Ownership & Synchronization
`Button` is authored in `typescript/nextjs/starterkit/dashboard/src/components/ui/button/`.
- Never edit the mirrored file in `typescript/nextjs/starterkit/website/src/components/ui/button/` directly.
- The shared synchronization script mirrors files cleanly:
  ```bash
  node scripts/sync-shared.mjs
  node scripts/sync-shared.mjs --check
  ```

---

## 3. Control Sizing & Token Architecture

The UI Kit defines a universal six-step sizing scale in `src/styles/tokens/controls.css` and `src/components/ui/control-sizing.ts`.

### 3.1 Sizing Metrics Table
All pixel equivalents assume a standard 16px root font size (`1rem = 16px`):

| Scale Step | Min Height (`min-block-size`) | Inline Padding (`padding-inline`) | Block Padding (`padding-block`) | Label Font Size (`font-size`) | Label Line Height (`line-height`) | Icon Size | Label/Icon Gap | Primary Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `1.75rem` (28px) | `0.50rem` (8px) | `0.1875rem` (3px) | `0.875rem` (14px) | `1.25rem` (20px) | `0.875rem` (14px) | `0.25rem` (4px) | Dense data grids, compact table actions |
| **`sm`** | `2.00rem` (32px) | `0.75rem` (12px) | `0.3125rem` (5px) | `0.875rem` (14px) | `1.25rem` (20px) | `1.00rem` (16px) | `0.375rem` (6px) | Secondary toolbars, compact modal actions |
| **`md`** | `2.25rem` (36px) | `0.875rem` (14px) | `0.4375rem` (7px) | `0.875rem` (14px) | `1.25rem` (20px) | `1.00rem` (16px) | `0.50rem` (8px) | **Dashboard Product Default** |
| **`lg`** | `2.50rem` (40px) | `1.00rem` (16px) | `0.5625rem` (9px) | `0.875rem` (14px) | `1.25rem` (20px) | `1.125rem` (18px) | `0.50rem` (8px) | Prominent dashboard headers, filter triggers |
| **`xl`** | `3.00rem` (48px) | `1.25rem` (20px) | `0.6875rem` (11px) | `1.00rem` (16px) | `1.50rem` (24px) | `1.25rem` (20px) | `0.50rem` (8px) | **Website Product Default** |
| **`2xl`** | `3.50rem` (56px) | `1.50rem` (24px) | `0.9375rem` (15px) | `1.00rem` (16px) | `1.50rem` (24px) | `1.50rem` (24px) | `0.75rem` (12px) | Marketing hero CTAs, lead-capture forms |

### 3.2 Product-Owned Default Alias Contract
Products own their default control density without component forks:
- **Dashboard Preset:** `--control-height-default: var(--control-height-md);` (36px)
- **Website Preset:** `--control-height-default: var(--control-height-xl);` (48px)

#### The `data-size` DOM Omission Rule
When `size` is omitted in React (`<Button>Click</Button>`), the component renders `data-size={undefined}`, leaving the DOM attribute unset:
```html
<button type="button" data-variant="secondary" data-touch-target="auto">Click</button>
```
The base CSS class `.button` binds its private scoped variables (`--_control-*`) to `var(--control-*-default)`. This allows:
1. Dashboard to render at 36px by default.
2. Website to render at 48px by default.
3. Explicit `size="md"` to render identically at 36px in both products.
4. Zero JavaScript runtime calculations and zero hydration layout shifts.

### 3.3 Border-Box & Block-Size Safety (Text Resilience)
Buttons must never use fixed `height: 36px`. They enforce:
```css
min-block-size: var(--_control-height);
box-sizing: border-box;
```
`min-block-size` supplies the minimum block size while allowing the button to expand vertically if browser zoom, large localized text, or multiline wrapping requires extra space.

---

## 4. Touch-Target Policy & Rendered Expansion

Small visible controls on mobile touchscreens cause high tap error rates. Rather than an invisible wrapper or complex hitbox abstraction, the UI Kit enforces rendered target expansion.

### 4.1 Implemented Behavior
- **`touchTarget="auto"` (Default):**
  Uses CSS media queries to detect coarse pointer devices (touchscreens, mobile phones, tablets) and expands the rendered button surface:
  ```css
  @media (any-pointer: coarse), (pointer: coarse) {
    .button[data-touch-target="auto"] {
      min-block-size: max(var(--_control-height), var(--control-touch-target-min));
      min-inline-size: var(--control-touch-target-min);
    }
  }
  ```
- **`touchTarget="comfortable"`:**
  Explicitly enforces minimum 48×48px rendered dimensions on all pointer devices:
  ```css
  .button[data-touch-target="comfortable"] {
    min-block-size: max(var(--_control-height), var(--control-touch-target-min));
    min-inline-size: var(--control-touch-target-min);
  }
  ```
- **Token Contract:** `--control-touch-target-min: 3rem;` (48px), exceeding WCAG 2.5.5 (Level AAA: 44×44px) and satisfying WCAG 2.5.8 (Level AA: 24×24px).

---

## 5. Visual Hierarchy & Semantic Variants

The kit provides 5 semantic variants:

| Variant | Semantic Meaning | Implemented Background | Implemented Text | Implemented Border | Implemented Hover State | Implemented Active State |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`primary`** | Main action within a local task | `--color-primary` | `--color-primary-foreground` | `--color-primary` | `--color-primary-hover` | `--color-primary-active` |
| **`secondary`** | Standard supporting action (default) | `--color-secondary-bg` | `--color-text-primary` | `--color-secondary-border` | `--color-secondary-hover` (border remains stable) | `--color-secondary-active` |
| **`subtle`** | Low-emphasis branded action | `--color-primary-subtle` | `--color-primary-subtle-foreground` | `--color-primary-border` | `--color-primary-subtle-hover` | `--color-primary-subtle-active` |
| **`ghost`** | Minimal visual intrusion | `transparent` | `--color-text-primary` | `transparent` | `--color-ghost-hover` | `--color-ghost-active` |
| **`danger`** | Destructive action (delete, revoke) | `--color-danger-solid` | `--color-danger-solid-foreground` | `--color-danger-solid` | `--color-danger-solid-hover` | `--color-danger-solid-active` |

### 5.1 Corner Geometry (Radius Contract)
Buttons consume the product-owned semantic corner radius role:
```css
border-radius: var(--radius-control);
```
- **Dashboard:** `--radius-control: var(--radius-md);` (6px)
- **Website:** `--radius-control: var(--radius-lg);` (8px)
- Rounded corners must never clip keyboard focus outlines (`overflow: hidden` is prohibited on the root button).

---

## 6. Interaction & State Matrix

Button states are expressed through semantic CSS custom properties and standard HTML/data attributes:

| State | Trigger Attribute | Implemented Visual Treatment |
| :--- | :--- | :--- |
| **Resting** | `:enabled` | Variant default tokens |
| **Hover** | `:hover:not(:disabled)` | Variant hover token or opacity |
| **Active / Activation Feedback** | `:active:not(:disabled)` | Variant active token (temporary activation feedback) |
| **Keyboard Focus** | `:focus-visible` | 0ms immediate visible outline (`var(--focus-ring-width)` solid `var(--color-border-focus)`) |
| **Disabled** | `:disabled:not([data-loading="true"])` | Consumes `--color-control-disabled-bg`, `--color-text-disabled`, `--color-border-disabled` |
| **Loading** | `data-loading="true"` + `aria-busy="true"` | In-flow content transparent + decorative overlaid spinner |

### 6.1 Temporary Activation vs Persistent Toggle State
- `:active` represents **temporary activation feedback** while the pointer or key is pressed down.
- Persistent pressed states (such as a mute button or view toggle) must be exposed via `aria-pressed={true | false}` by the caller. Ordinary `Button` does not manage a toggle state machine.

### 6.2 Keyboard Focus Indicator (`:focus-visible`)
Keyboard focus is communicated strictly via high-contrast visible outlines, never `box-shadow`:
```css
.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
}
```
- Focus outlines appear immediately (0ms transition).
- Focus rings follow browser `:focus-visible` heuristics, isolating keyboard navigation from mouse/touch activation.

### 6.3 Disabled Behavior
A disabled submit button cannot initiate submission through its activation, but it does not disable submission of the entire form by other mechanisms. Native disabled blocks normal click activation on the button itself.

### 6.4 Loading State Mechanics & Accessibility

```tsx
<button
  disabled={disabled || loading}
  aria-busy={loading || undefined}
  data-loading={loading ? 'true' : undefined}
>
  <span className={cn(styles.content, loading && styles.hiddenContent)}>
    {startIcon && <span className={styles.icon}>{startIcon}</span>}
    {children}
    {endIcon && <span className={styles.icon}>{endIcon}</span>}
  </span>
  {loading && (
    <span className={styles.spinnerWrapper} aria-hidden="true">
      <span className={styles.spinner} />
    </span>
  )}
</button>
```

#### Implemented Loading Guarantees:
1. **Geometry Stability (Zero Layout Shift):**  
   The `.content` wrapper remains in the normal document layout flow with:
   ```css
   .hiddenContent {
     opacity: 0;
     pointer-events: none;
     user-select: none;
   }
   ```
   Because `opacity: 0` preserves box dimensions in layout, the button retains its exact rendered width and height during loading transitions (provided button text does not change).
2. **Accessible Name Preservation:**  
   Unlike `display: none` or `visibility: hidden`, elements styled with `opacity: 0` **remain in the accessibility tree**. Text content—including plain text, nested elements (`<span>`), and existing `aria-label` or `aria-labelledby` attributes—is preserved during accessible-name computation. Extra labels are not required solely because children are nested.
3. **`aria-busy` Semantics:**  
   The attribute `aria-busy="true"` communicates to accessibility APIs that the element is currently updating. It **does not guarantee that assistive technologies will speak an automatic announcement**. Where async status updates should be announced without moving focus, callers should provide an appropriate localized announcement region (`role="status"` / `aria-live="polite"`); announcement timing and urgency are application-level decisions.
4. **Decorative Spinner:**  
   The spinner is strictly decorative and marked `aria-hidden="true"`.
5. **Reduced Motion Compliance:**  
   Under `@media (prefers-reduced-motion: reduce)`, continuous CSS keyframe spinning is disabled:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .spinner {
       animation: none;
       opacity: 0.7;
     }
   }
   ```

---

## 7. Strict CSS Logical Properties & Zero-Shadow Mandate

### 7.1 100% CSS Logical Properties
Physical directional and dimensional CSS properties are strictly forbidden in `button.module.css`.

| Forbidden Physical Property | Implemented Logical Property |
| :--- | :--- |
| `height: 36px` | `min-block-size: var(--_control-height)` |
| `min-width: 48px` | `min-inline-size: var(--control-touch-target-min)` |
| `padding-left`, `padding-right` | `padding-inline: var(--_control-padding-inline)` |
| `padding-top`, `padding-bottom` | `padding-block: var(--_control-padding-block)` |
| `margin-left`, `margin-right` | `margin-inline-start`, `margin-inline-end` |
| `top: 0; left: 0; right: 0; bottom: 0;` | `inset: 0` |
| `border-right-color` | `border-inline-end-color: transparent` |
| `text-align: left` | `text-align: start` |

### 7.2 Zero-Shadow Dashboard Guarantee
In accordance with Rule 10, the Dashboard is **100% shadow-free**:
- Zero `box-shadow`
- Zero `text-shadow`
- Zero `filter: drop-shadow()`
- Visual hierarchy is achieved via surface contrast, borders, and focus rings.
- Enforced by gate: `node scripts/check-dashboard-shadows.mjs` (must exit 0).

---

## 8. Icons, Accessibility & RTL

### 8.1 Logical Icon Slots
- Props are strictly named `startIcon` and `endIcon` (physical `leftIcon` or `rightIcon` are forbidden).
- In LTR (`dir="ltr"`), `startIcon` renders on the inline-start (left).
- In RTL (`dir="rtl"`), `startIcon` automatically renders on the inline-start (right) without CSS overrides.

### 8.2 Directional Icon Mirroring
Directional icons (e.g., `chevron-right`, `arrow-right`) from `@/components/icons` are registered via `directional()` in `registry.ts`. They mirror automatically in RTL by emitting `data-mirror-rtl="true"`. Component CSS modules never author custom `scaleX(-1)` overrides.

### 8.3 Icon-Only Actions
When rendering a button with an icon and no visible text, callers must set `iconOnly={true}` and provide a localized accessible name:
```tsx
<Button iconOnly aria-label={t('dashboard.refresh')} onClick={handleRefresh}>
  <Icon name="refresh" />
</Button>
```

#### Equilateral Square Geometry Contract:
- **Aspect Ratio:** `aspect-ratio: 1 / 1` and `inline-size: var(--_control-height)` guarantee an exact equilateral square matching the control height across all 6 sizing tokens (28×28px, 32×32px, 36×36px, 40×40px, 48×48px, 56×56px).
- **Padding:** Padding is zeroed (`padding-inline: 0; padding-block: 0;`), perfectly centering the child icon without oblong text-padding distortion.
- **Touch Target:** Under `touchTarget="comfortable"` (or on coarse touch pointers), inline and block dimensions expand symmetrically to `max(var(--_control-height), var(--control-touch-target-min))` (48×48px minimum).
- **Accessibility:** Callers are strictly required to provide an accessible name via `aria-label` or `aria-labelledby`.

---

## 9. TypeScript API & Prop Interface

```typescript
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import type { ControlSizingProps, ControlSize } from '../control-sizing';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, ControlSizingProps {
  /**
   * Visual hierarchy variant.
   * @default 'secondary'
   */
  variant?: ButtonVariant;

  /**
   * Explicit control size from the six-step token scale.
   * If omitted, inherits the product default:
   * - Dashboard: 'md' (36px min-height)
   * - Website: 'xl' (48px min-height)
   */
  size?: ControlSize;

  /**
   * Touch target interaction policy.
   * - 'auto': Enforces 48×48px minimum target on coarse pointers (default).
   * - 'comfortable': Enforces 48×48px minimum target on all devices.
   * @default 'auto'
   */
  touchTarget?: 'auto' | 'comfortable';

  /**
   * Loading state. Disables activation, hides content without layout shift,
   * exposes aria-busy, and renders a centered decorative spinner.
   * @default false
   */
  loading?: boolean;

  /**
   * Logical leading icon slot (inline-start).
   */
  startIcon?: ReactNode;

  /**
   * Logical trailing icon slot (inline-end).
   */
  endIcon?: ReactNode;

  /**
   * Enforces an equilateral square (1:1 aspect ratio) geometry for icon-only buttons.
   * When true, width matches control height, padding is zeroed, and callers must
   * provide an aria-label or aria-labelledby.
   * @default false
   */
  iconOnly?: boolean;

  /**
   * Native HTML button type.
   * Defaults to 'button' so inclusion in a form does not accidentally submit.
   * Callers may explicitly pass 'submit' or 'reset'.
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';
}
```

### 9.1 Prop Precedence & Predictability
Props are spread in exact sequence:
```tsx
<button
  {...props}               // Caller props spread FIRST
  ref={ref}                // Native ref forwarding
  type={type}              // Defaults to 'button'; caller can pass 'submit'
  disabled={isDisabled}    // Controlled: disabled || loading
  aria-busy={loading || undefined}
  aria-label={computedAriaLabel}
  data-size={size}
  data-touch-target={touchTarget}
  data-variant={variant}
  data-loading={loading ? 'true' : undefined}
  className={cn(styles.button, className)}
/>
```
Spreading `{...props}` before behavioral attributes ensures caller props cannot inadvertently clobber `disabled` during loading or clear required `data-*` state hooks.

---

## 10. Canonical Source Code Reference

### 10.1 Component Implementation (`button.tsx`)
```tsx
import { type ComponentPropsWithoutRef, type ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'subtle' | 'ghost' | 'danger';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'>, ControlSizingProps {
  variant?: ButtonVariant;
  loading?: boolean;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    size,
    touchTarget = 'auto',
    variant = 'secondary',
    loading = false,
    disabled = false,
    startIcon,
    endIcon,
    type = 'button',
    className,
    children,
    ...props
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const computedAriaLabel =
    props['aria-label'] ?? (loading && typeof children === 'string' ? children : undefined);

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={computedAriaLabel}
      data-size={size}
      data-touch-target={touchTarget}
      data-variant={variant}
      data-loading={loading ? 'true' : undefined}
      className={cn(styles.button, className)}
    >
      <span className={cn(styles.content, loading && styles.hiddenContent)}>
        {startIcon && <span className={styles.icon}>{startIcon}</span>}
        {children}
        {endIcon && <span className={styles.icon}>{endIcon}</span>}
      </span>
      {loading && (
        <span className={styles.spinnerWrapper} aria-hidden="true">
          <span className={styles.spinner} />
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
```

### 10.2 Stylesheet Implementation (`button.module.css`)
```css
.button {
  --_control-height: var(--control-height-default);
  --_control-padding-inline: var(--control-padding-default);
  --_control-padding-block: var(--control-padding-block-default);
  --_control-font-size: var(--control-font-size-default);
  --_control-line-height: var(--control-line-height-default);
  --_control-icon-size: var(--control-icon-size-default);
  --_control-gap: var(--control-gap-default);

  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-inline-size: 0;
  min-block-size: var(--_control-height);
  padding-inline: var(--_control-padding-inline);
  padding-block: var(--_control-padding-block);
  gap: var(--_control-gap);
  font-family: inherit;
  font-size: var(--_control-font-size);
  line-height: var(--_control-line-height);
  font-weight: var(--font-weight-medium);
  vertical-align: middle;
  border-radius: var(--radius-control);
  border: 1px solid transparent;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast),
    opacity var(--transition-fast);
}

.button[data-size="xs"] {
  --_control-height: var(--control-height-xs);
  --_control-padding-inline: var(--control-padding-xs);
  --_control-padding-block: var(--control-padding-block-xs);
  --_control-font-size: var(--control-font-size-xs);
  --_control-line-height: var(--control-line-height-xs);
  --_control-icon-size: var(--control-icon-size-xs);
  --_control-gap: var(--control-gap-xs);
}

.button[data-size="sm"] {
  --_control-height: var(--control-height-sm);
  --_control-padding-inline: var(--control-padding-sm);
  --_control-padding-block: var(--control-padding-block-sm);
  --_control-font-size: var(--control-font-size-sm);
  --_control-line-height: var(--control-line-height-sm);
  --_control-icon-size: var(--control-icon-size-sm);
  --_control-gap: var(--control-gap-sm);
}

.button[data-size="md"] {
  --_control-height: var(--control-height-md);
  --_control-padding-inline: var(--control-padding-md);
  --_control-padding-block: var(--control-padding-block-md);
  --_control-font-size: var(--control-font-size-md);
  --_control-line-height: var(--control-line-height-md);
  --_control-icon-size: var(--control-icon-size-md);
  --_control-gap: var(--control-gap-md);
}

.button[data-size="lg"] {
  --_control-height: var(--control-height-lg);
  --_control-padding-inline: var(--control-padding-lg);
  --_control-padding-block: var(--control-padding-block-lg);
  --_control-font-size: var(--control-font-size-lg);
  --_control-line-height: var(--control-line-height-lg);
  --_control-icon-size: var(--control-icon-size-lg);
  --_control-gap: var(--control-gap-lg);
}

.button[data-size="xl"] {
  --_control-height: var(--control-height-xl);
  --_control-padding-inline: var(--control-padding-xl);
  --_control-padding-block: var(--control-padding-block-xl);
  --_control-font-size: var(--control-font-size-xl);
  --_control-line-height: var(--control-line-height-xl);
  --_control-icon-size: var(--control-icon-size-xl);
  --_control-gap: var(--control-gap-xl);
}

.button[data-size="2xl"] {
  --_control-height: var(--control-height-2xl);
  --_control-padding-inline: var(--control-padding-2xl);
  --_control-padding-block: var(--control-padding-block-2xl);
  --_control-font-size: var(--control-font-size-2xl);
  --_control-line-height: var(--control-line-height-2xl);
  --_control-icon-size: var(--control-icon-size-2xl);
  --_control-gap: var(--control-gap-2xl);
}

.button[data-touch-target="comfortable"] {
  min-block-size: max(var(--_control-height), var(--control-touch-target-min));
  min-inline-size: var(--control-touch-target-min);
}

@media (any-pointer: coarse), (pointer: coarse) {
  .button[data-touch-target="auto"] {
    min-block-size: max(var(--_control-height), var(--control-touch-target-min));
    min-inline-size: var(--control-touch-target-min);
  }
}

.button[data-variant="primary"] {
  background-color: var(--color-primary);
  color: var(--color-primary-foreground);
  border-color: var(--color-primary);
}

.button[data-variant="primary"]:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.button[data-variant="primary"]:active:not(:disabled) {
  background-color: var(--color-primary-active);
  border-color: var(--color-primary-active);
}

.button[data-variant="secondary"] {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
  border-color: var(--color-border-control);
}

.button[data-variant="secondary"]:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
}

.button[data-variant="secondary"]:active:not(:disabled) {
  background-color: var(--color-surface-active);
}

.button[data-variant="subtle"] {
  background-color: var(--color-primary-subtle);
  color: var(--color-primary-subtle-foreground);
  border-color: var(--color-primary-border);
}

.button[data-variant="subtle"]:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
}

.button[data-variant="ghost"] {
  background-color: transparent;
  color: var(--color-text-primary);
  border-color: transparent;
}

.button[data-variant="ghost"]:hover:not(:disabled) {
  background-color: var(--color-surface-hover);
}

.button[data-variant="danger"] {
  background-color: var(--color-danger);
  color: var(--color-danger-foreground);
  border-color: var(--color-danger);
}

.button[data-variant="danger"]:hover:not(:disabled) {
  opacity: 0.9;
}

.button:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
}

.button:disabled:not([data-loading="true"]) {
  background-color: var(--color-control-disabled-bg);
  color: var(--color-text-disabled);
  border-color: var(--color-border-disabled);
  cursor: not-allowed;
}

.button[data-loading="true"] {
  opacity: 0.72;
  cursor: not-allowed;
}

.content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--_control-gap);
  inline-size: 100%;
}

.hiddenContent {
  opacity: 0;
  pointer-events: none;
  user-select: none;
}

.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_control-icon-size);
  block-size: var(--_control-icon-size);
  flex: none;
}

.spinnerWrapper {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.spinner {
  display: inline-block;
  inline-size: var(--_control-icon-size);
  block-size: var(--_control-icon-size);
  border: 2px solid currentColor;
  border-inline-end-color: transparent;
  border-radius: var(--radius-full);
  animation: spin 0.6s linear infinite;
  flex: none;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    opacity: 0.7;
  }
}
```

---

## 11. Production Wiring Recipes

### Recipe 1: Localized Action with Icons (Layer 2 Pattern)
```tsx
'use client';

import { Button } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useI18n } from '@/providers';

export function SaveButton({ onSave, isSaving }: { onSave: () => void; isSaving: boolean }) {
  const { t } = useI18n();

  return (
    <Button
      variant="primary"
      loading={isSaving}
      onClick={onSave}
      startIcon={<Icon name="checkmark" />}
    >
      {t('common.save')}
    </Button>
  );
}
```

### Recipe 2: Accessible Form Submission with Explicit `type="submit"`
```tsx
<form onSubmit={handleFormSubmit}>
  {/* Non-submit cancel button defaults safely to type="button" */}
  <Button variant="secondary" onClick={handleCancel}>
    {t('common.cancel')}
  </Button>

  {/* Form submit trigger */}
  <Button type="submit" variant="primary" loading={isSubmitting}>
    {t('common.submit')}
  </Button>
</form>
```

### Recipe 3: Icon-Only Action with Required Accessible Label
```tsx
import { Button } from '@/components/ui';
import { Icon } from '@/components/icons';
import { useI18n } from '@/providers';

export function RefreshButton({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      aria-label={t('dashboard.refreshData')}
      onClick={onRefresh}
    >
      <Icon name="refresh" />
    </Button>
  );
}
```

### Recipe 4: Navigation Links vs Action Buttons (Next.js Host Boundary Example)
`Button` is strictly a native `<button>` for actions. When URL navigation is required, use semantic link elements at the Next.js host boundary (`src/app/`, where `next/link` is permitted), receiving localized label content:
```tsx
import type { ReactNode } from 'react';
import Link from 'next/link';

// Illustrative Next.js host route link component consuming localized content
export function WebsiteHeroLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="website-cta-link">
      {children}
    </Link>
  );
}
```
*(Note: `website-cta-link` is an illustrative class name for route-level styling; reusable primitives and patterns do not import `next/link`).*

---

## 12. Testing & Acceptance Matrix

Testing is split cleanly between component unit tests and real-browser Playwright tests.

### 12.1 Component Unit Test Suite (`button.test.tsx`)
Vitest + Testing Library verifies attribute wiring, event callbacks, and DOM properties:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './button';

describe('Button Primitive', () => {
  it('renders with omitted size and leaves data-size undefined for CSS default alias consumption', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.getAttribute('data-size')).toBeNull();
    expect(button.getAttribute('data-variant')).toBe('secondary');
    expect(button.getAttribute('data-touch-target')).toBe('auto');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('defaults to type="button" so clicking inside a form does not accidentally submit', () => {
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());
    render(
      <form onSubmit={handleSubmit}>
        <Button>Non-submit action</Button>
        <Button type="submit">Explicit submit</Button>
      </form>,
    );

    fireEvent.click(screen.getByRole('button', { name: /non-submit action/i }));
    expect(handleSubmit).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /explicit submit/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders explicit size attribute across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Button size={size}>Size {size}</Button>);
      const button = screen.getByRole('button', { name: `Size ${size}` });
      expect(button.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('attaches touchTarget data attribute', () => {
    const { rerender } = render(<Button touchTarget="comfortable">Touch</Button>);
    let button = screen.getByRole('button', { name: /touch/i });
    expect(button.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Button touchTarget="auto">Touch</Button>);
    button = screen.getByRole('button', { name: /touch/i });
    expect(button.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders startIcon and endIcon in logical slots and preserves content structure during loading', () => {
    const { rerender } = render(
      <Button
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Save
      </Button>,
    );

    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('end-icon')).toBeTruthy();

    rerender(
      <Button
        loading
        startIcon={<span data-testid="start-icon">S</span>}
        endIcon={<span data-testid="end-icon">E</span>}
      >
        Save
      </Button>,
    );

    const button = screen.getByRole('button', { name: /save/i });
    expect(button.hasAttribute('disabled')).toBe(true);
    expect(button.getAttribute('data-loading')).toBe('true');
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Save');
    expect(screen.getByTestId('start-icon')).toBeTruthy();
    expect(screen.getByTestId('end-icon')).toBeTruthy();
    expect(button.querySelector('[aria-hidden="true"]')).toBeTruthy();
  });

  it('preserves accessible name when loading without explicit aria-label', () => {
    render(<Button loading>Submit Form</Button>);
    const button = screen.getByRole('button', { name: 'Submit Form' });
    expect(button.getAttribute('aria-label')).toBe('Submit Form');
    expect(button.getAttribute('aria-busy')).toBe('true');
  });

  it('handles click events when enabled', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Submit</Button>);
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('forwards ref to the native button element', () => {
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref}>Target</Button>);
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
```

### 12.2 Real-Browser Acceptance Requirements (Playwright E2E)
Component unit tests cannot assert layout geometry or CSS animations. The following requirements must be verified against real rendered DOM nodes:
- **Geometry Stability:** Bounding box width and height must not shift during the `loading` transition for the same text content.
- **Rendered Target Expansion:** Under coarse pointer emulation, compact buttons expand rendered dimensions to at least 48×48px.
- **Reduced Motion:** With `prefers-reduced-motion: reduce`, the spinner animation does not execute continuously.
- **Focus Outlines:** Focus rings are not clipped by surrounding layout containers.
- **RTL Direction:** Under `dir="rtl"`, `startIcon` appears on the visual right and `endIcon` appears on the visual left.

---

## 13. Release Acceptance & Definition of Done

The core `Button` primitive release milestone is complete when:

- [ ] **Pure UI Contract:** Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries.
- [ ] **API Stability:** Existing public API (`variant`, `size`, `touchTarget`, `loading`, `startIcon`, `endIcon`, `type`, `disabled`, `ref`) remains 100% compatible.
- [ ] **Default Alias Resolution:** Dashboard renders at 36px and Website renders at 48px by default when `size` is omitted.
- [ ] **Safe Default Type:** Defaults to `type="button"`.
- [ ] **Logical Properties:** 100% CSS Logical Properties in `button.module.css`.
- [ ] **Shadow Ban:** `node scripts/check-dashboard-shadows.mjs` exits 0.
- [ ] **Synchronization:** `node scripts/sync-shared.mjs --check` exits 0.
- [ ] **Lint & Types:** `tsc --noEmit` and `oxlint` exit 0 in both starters.
- [ ] **Unit Tests:** Vitest passes in both starters.
- [ ] **Browser Acceptance Requirements:** Applicable Section 12.2 browser acceptance requirements pass, with the tested starters/hosts and results recorded (referencing existing passing suites where available; no duplicate test suites commissioned).

---

## 14. Follow-Up Work & Source Discrepancies

The following items are identified as **separate, bounded evaluation items** and are intentionally not mixed into this documentation-only release:

1. **Danger Variant Token Alignment (Evaluation Item):**  
   Evaluate introducing dedicated semantic tokens (`--color-danger-hover`, `--color-danger-active`) into `src/styles/tokens/status-colors.css` to replace the existing `opacity: 0.9` hover rule in `button.module.css`, subject to token contract review.
2. **Subtle & Ghost Active Feedback (Evaluation Item):**  
   Evaluate whether dedicated active press feedback is desirable for `subtle` and `ghost` variants; existing approved surface-active roles may suffice without adding new tokens.
3. **Icon-Only Geometry (Evaluation Item):**  
   Square geometry is not required for an accessible Button. Evaluate whether a dedicated square shape or geometry variant (such as an optional prop or layout utility) is warranted for standalone icon buttons in toolbars.
4. **Link Component Strategy (Evaluation Item):**  
   A dedicated styled link primitive remains a separate product decision. Navigation continues to be handled with semantic links at the host application boundary.
5. **Unit Test Migration to `userEvent` (Maintenance Item):**  
   Plan migration of `button.test.tsx` from `fireEvent` to `@testing-library/user-event` for more realistic pointer and keyboard interaction testing.

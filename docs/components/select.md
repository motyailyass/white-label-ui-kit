# Select — Component Specification and Implementation Reference

> **Status:** Approved Baseline Specification (Audited and Approved for Implementation)  
> **Applies to:** Core UI Primitive (`components/ui/select`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/select/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/select/`  
> **Related Controls:** [Input Specification](./input.md) · [Textarea Specification](./textarea.md) · [Button Specification](./button.md) · [Checkbox Specification](./checkbox.md) · [Radio Specification](./radio.md) · [Switch Specification](./switch.md)

---

## 1. Purpose & Architectural Foundation

The `Select` primitive provides single-selection from a native dropdown list using the browser-native HTML `<select>` element.

Examples include choosing a country, language, currency, billing cycle, or account role.

### 1.1 Architectural Decisions

1. **Native Dropdown Indicator & Native Picker**:
   - Render a single native `<select>` element as both the visual control and the interaction target.
   - Retain the browser's native dropdown indicator, native picker presentation, and operating-system picker UI (e.g., iOS wheel pickers and Android bottom sheets).
   - No custom wrapper elements, no injected icon-registry chevrons, and no `appearance: none` stripping the OS arrow.
   - Apply `className`, `style`, sizing attributes (`data-size`, `data-touch-target`), and the forwarded `ref` directly to the `<select>`, consistent with `Input` and `Textarea`.
2. **Native Selection & Form Authority**:
   - Built on native HTML5 `<select>` with standard `<option>` and `<optgroup>` children.
   - Browser DOM retains sole authority over selection state, option indexing, native picker presentation, form serialization, and form reset.
   - No custom popover layers, simulated listboxes, custom option state, or synthetic focus traps.
3. **Explicit Exclusions (Deferred to Specialized Primitives & Patterns)**:
   - Searchable comboboxes and autocompletes (handled by `Combobox`).
   - Custom option item rendering and rich popovers (handled by `DropdownMenu` / `Popover`).
   - Multi-select listboxes and tag pickers (outside single-select dropdown scope).
   - Virtualized option lists.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SELECT ARCHETYPE SUMMARY                        │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Honest Native Foundation: Single native <select> element           │
│  3. Native Dropdown Indicator: Browser OS picker affordance preserved  │
│  4. Direct Ref Forwarding: Forwards ref to HTMLSelectElement           │
│  5. Direct Attribute Application: className, style, data-* on <select> │
│  6. Six-Step Scale: xs (28px), sm (32px), md (36px), lg (40px),        │
│                     xl (48px), 2xl (56px)                              │
│  7. Product Defaults: Dashboard = md (36px), Website = xl (48px)       │
│  8. Single-Select Authority: multiple?: never locked at type/runtime   │
│  9. Specificity-Safe Precedence: Disabled > Invalid > Focus > Hover    │
│ 10. High-Contrast Ready: System Field, FieldText, Highlight, GrayText  │
│ 11. Keyboard Accessible: Native OS typeahead & arrow key navigation    │
│ 12. Zero Dashboard Shadows: 100% shadow-free depth via borders/surfaces│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Deliverables & Canonical Source Ownership

Author in Dashboard, then synchronize the shared source:

```
typescript/nextjs/starterkit/dashboard/src/
  components/ui/select/
    select.tsx
    select.module.css
    select.test.tsx
    index.ts
  components/patterns/select-gallery/
    select-gallery.tsx
    select-gallery.module.css
    index.ts
  app/gallery/select/
    page.tsx
```

Mirrored destinations & deliverables:
- `typescript/nextjs/starterkit/website/src/components/ui/select/` (mirrored shared primitive)
- `typescript/nextjs/starterkit/website/src/app/gallery/select/page.tsx` (Website gallery route)
- `typescript/vite/starterkit/dashboard/src/components/ui/select/` (Vite mirrored shared primitive)
- Complete localized EN, FR, and AR message dictionaries (`src/i18n/messages/{en,fr,ar}.ts`) and localized route metadata in Dashboard and Website
- Playwright browser test suites:
  - `typescript/nextjs/starterkit/dashboard/e2e/select.spec.ts`
  - `typescript/nextjs/starterkit/website/e2e/select.spec.ts`

Verification gates to run:
```bash
node scripts/sync-shared.mjs
node scripts/sync-shared.mjs --check
node scripts/check-dashboard-shadows.mjs
```

---

## 3. Public API & Prop Interface

### 3.1 API Principles
- Single native `<select>` element: no wrapper `<span>` or `<div>`.
- Ref forwards directly to `HTMLSelectElement`.
- Caller supplies standard `<option>` and `<optgroup>` children.
- Supports native controlled and uncontrolled usage with scalar values:
  - For uncontrolled usage: the browser DOM owns current selection; native form behavior applies.
  - For controlled usage: the caller's React state controls value; native form behavior still applies.
- Kit `size` governs visual density and is never forwarded as the native numeric `<select size>` attribute (which would turn it into a listbox).
- `multiple?: never` locked at type level and filtered at runtime.
- `readOnly?: never` locked at type level (native `<select>` does not support `readOnly`).

### 3.2 TypeScript Interface

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<'select'>,
      'size' | 'multiple' | 'value' | 'defaultValue' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Controlled scalar value.
   */
  value?: string | number;

  /**
   * Initial scalar value for uncontrolled selection.
   */
  defaultValue?: string | number;

  /**
   * Explicitly forbidden. Multi-select listbox is handled by specialized primitives.
   */
  multiple?: never;

  /**
   * Native select elements do not support read-only behavior.
   */
  readOnly?: never;
}
```

### 3.3 Prop Behavior Table

| Prop | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| `size` | `ControlSize` | `undefined` (omitted) | Optional visual density (`xs` through `2xl`). Omitted consumes local product preset. |
| `touchTarget` | `'auto' \| 'comfortable'` | `'auto'` | Target policy: `'auto'` enforces 48px on coarse pointer; `'comfortable'` enforces 48px unconditionally. |
| `value` | `string \| number` | `undefined` | Controlled scalar value. |
| `defaultValue` | `string \| number` | `undefined` | Initial scalar value for uncontrolled select. |
| `disabled` | `boolean` | `false` | Native disabled state and styling. |
| `required` | `boolean` | `false` | Native constraint validation. |
| `id` | `string` | `undefined` | Caller-provided ID for external `<label htmlFor={id}>` association. |
| `aria-invalid` | `boolean \| 'true' \| 'false'` | `undefined` | Drives application error styling. |
| `aria-describedby`| `string` | `undefined` | Associates helper text and error message descriptions. |
| `className` | `string` | `undefined` | Applied directly to `<select>`. |
| `style` | `CSSProperties` | `undefined` | Applied directly to `<select>`. |
| `children` | `ReactNode` | Caller-supplied | Standard `<option>` and `<optgroup>` elements. |
| `ref` | `Ref<HTMLSelectElement>`| `undefined` | Forwards directly to native `HTMLSelectElement`. |

---

## 4. Native Semantics & Interaction

### 4.1 Selection Authority
- Native `<select>` selection is the sole source of truth.
- Do not maintain internal mirrored selection state.
- Do not set `role`, `aria-expanded`, or `aria-controls` on the native element (the browser exposes proper accessibility tree semantics natively).
- A disabled select must not open or change through user interaction.

### 4.2 Keyboard Navigation
Preserve browser-native keyboard interactions:
- `Tab` / `Shift+Tab`: Focus and blur the control.
- `Space` / `Enter` / `Alt+DownArrow`: Open the native picker where supported by the browser.
- `UpArrow` / `DownArrow`: Step through options in order.
- Native incremental typeahead: Focuses option matching typed character sequence.
- Do **not** intercept keyboard events to simulate custom navigation.

### 4.3 Labels, Helper Text & Error Relationships
Labels live outside the primitive in field composition:

```tsx
const selectId = useId();
const helpId = `${selectId}-help`;
const errorId = `${selectId}-error`;

<div className={styles.field}>
  <label htmlFor={selectId} className={styles.label}>
    Billing cycle
  </label>
  <Select
    id={selectId}
    name="billingCycle"
    defaultValue="monthly"
    aria-describedby={hasError ? `${helpId} ${errorId}` : helpId}
    aria-invalid={hasError ? 'true' : undefined}
  >
    <option value="monthly">Monthly</option>
    <option value="annual">Annual</option>
  </Select>
  <p id={helpId} className={styles.help}>Choose how often you are billed.</p>
  {hasError && (
    <p id={errorId} role="alert" className={styles.error}>
      Please select a billing cycle.
    </p>
  )}
</div>
```

Key rules:
- Accessible name is the `<label>`, never the selected option text.
- `aria-describedby` links to real existing elements (only include `errorId` when the error element actually renders).
- `aria-invalid="true"` is activated only after application validation, never immediately on initial render.

---

## 5. Empty Choice & Required Validation

Native HTML `<select>` has **no native placeholder attribute**. When an initial empty prompt is needed, the caller supplies an empty-value option as the first direct child:

```tsx
<Select id={id} name="country" required defaultValue="">
  <option value="">Choose a country</option>
  <option value="fr">France</option>
  <option value="ma">Morocco</option>
</Select>
```

### 5.1 Validation Rules
- The prompt is an `<option>`, not an accessible-label replacement.
- In the required single-select example, keeping the empty option as the first direct child produces native `valueMissing` (`:invalid`) at rest; selecting an eligible non-empty option makes the control valid.
- For optional selection, an enabled empty option (`<option value="">None</option>`) represents an eligible, valid choice.
- Native `:invalid` alone does **not** trigger application error styling. Error styling is activated strictly when `aria-invalid="true"` is present.

---

## 6. Form Behavior

The native select element owns form behavior:
- A named, enabled select contributes its selected value to `FormData` when its selected option is eligible for submission. A disabled selected option, or an option inside a disabled optgroup, is ineligible and omitted.
- A disabled select is completely omitted from `FormData`.
- An enabled, optional select with an eligible enabled empty option selected contributes `name=""` to `FormData`.
- A required empty select blocks native form submission.
- An uncontrolled select returns to its initial value on native form reset (`<button type="reset">`).
- A controlled select is restored by the caller's React reset handler.

---

## 7. Sizing, Geometry & Product Defaults

### 7.1 Sizing Scale & Metric Table
All control sizes consume the approved tokens from `src/styles/tokens/controls.css`:

| Size | Minimum Block Size (`--control-height-*`) | Inline Padding (`--control-padding-*`) | Block Padding per Side (`--control-padding-block-*`) | Font Size (`--control-font-size-*`) | Line Height (`--control-line-height-*`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `xs` | **28px** (1.75rem) | 8px (0.50rem) | **3px** (0.1875rem) | **14px** (0.875rem) | **20px** (1.25rem) |
| `sm` | **32px** (2.00rem) | 12px (0.75rem) | **5px** (0.3125rem) | **14px** (0.875rem) | **20px** (1.25rem) |
| `md` | **36px** (2.25rem) | 14px (0.875rem) | **7px** (0.4375rem) | **14px** (0.875rem) | **20px** (1.25rem) |
| `lg` | **40px** (2.50rem) | 16px (1.00rem) | **9px** (0.5625rem) | **14px** (0.875rem) | **20px** (1.25rem) |
| `xl` | **48px** (3.00rem) | 20px (1.25rem) | **11px** (0.6875rem)| **16px** (1.000rem) | **24px** (1.50rem) |
| `2xl`| **56px** (3.50rem) | 24px (1.50rem) | **15px** (0.9375rem)| **16px** (1.000rem) | **24px** (1.50rem) |

*Pixel values assume a 16px root font size.*

### 7.2 Product-Owned Default Parity
When `size` is omitted:
- **Dashboard / Vite**: Renders identically to explicit `size="md"` (36px min block size).
- **Website**: Renders identically to explicit `size="xl"` (48px min block size).
- Parity applies to all dimensions: height, padding, font size, line height, radius, and border.

### 7.3 Width & Touch Target Policy
- `inline-size: 100%`, `min-inline-size: 0`.
- The **native select element itself** is the interaction target.
- For `touchTarget="comfortable"` and for `touchTarget="auto"` under `@media (any-pointer: coarse)`:
  - Enforce at least 48px in **both dimensions** (`min-block-size: max(var(--_control-height), 3rem); min-inline-size: max(var(--control-touch-target-min, 3rem), 0px);`).
  - Larger sizes are preserved (`2xl` maintains minimum 56px height).

---

## 8. Appearance & State Matrix

### 8.1 State Cascade & Specificity Precedence
Precedence order:
```
Disabled > Invalid > Focus > Hover > Rest
```

1. **Rest**:
   - Background: `var(--color-control-bg)`
   - Border: `1px solid var(--color-border-control)`
   - Text: `var(--color-text-primary)`
2. **Hover (`:hover:not(:disabled)`)**:
   - Optional subtle surface adjustment (`--color-surface-hover` or resting control bg).
   - **Neutral border remains stable** (`1px solid var(--color-border-control)`).
3. **Focus (`:focus-visible`)**:
   - Border: `1px solid var(--color-border-focus)`
   - Outline: `var(--focus-ring-width) solid var(--color-border-focus)`
   - Outline offset: `var(--focus-ring-offset)`
   - Takes precedence over hover border.
4. **Invalid (`[aria-invalid="true"]`)**:
   - Border: `1px solid var(--color-danger)`
   - Retains danger border during hover.
5. **Invalid + Focus (`[aria-invalid="true"]:focus-visible`)**:
   - Border: `1px solid var(--color-danger)`
   - Outline: `var(--focus-ring-width) solid var(--color-danger)`
   - Retains danger border and danger outline during hover.
6. **Disabled (`:disabled`)**:
   - Background: `var(--color-control-disabled-bg)`
   - Border: `1px solid var(--color-border-disabled)`
   - Text: `var(--color-text-disabled)`
   - Cursor: `not-allowed`
   - Takes precedence over invalid and hover.

### 8.2 Specificity-Safe CSS Cascade Rules
To guarantee that hover does not override invalid or focus borders:
- Neutral hover border selector is scoped: `.select:hover:not(:disabled):not(:focus-visible):not([aria-invalid="true"])`.
- Invalid selector: `.select[aria-invalid="true"]:not(:disabled)`.
- Focus selector: `.select:focus-visible:not(:disabled)`.
- Invalid + Focus selector: `.select[aria-invalid="true"]:focus-visible:not(:disabled)`.
- Disabled selector: `.select:disabled`.

### 8.3 Zero Dashboard Shadows
Dashboard is **100% shadow-free**. No `box-shadow`, `filter: drop-shadow()`, or glow effects in `select.module.css`.

### 8.4 High-Contrast Mode (Forced Colors)
In `@media (forced-colors: active)`:
- Rest: `border-color: ButtonBorder; background-color: Field; color: FieldText;`
- Focus: `border-color: Highlight; outline: 2px solid Highlight;`
- Invalid: `border-color: Highlight;`
- Invalid + Focus: `border-color: Highlight; outline: 2px solid Highlight;`
- Disabled / Disabled + Invalid: `border-color: GrayText; color: GrayText;`
- Native dropdown indicator affordance is preserved by the browser. Forced-colors CSS is verified in real browsers, acknowledging that OS native indicators and system palettes render according to browser platform rules.

---

## 9. Canonical Source Code Reference

### 9.1 `select.module.css`

```css
/**
 * White Label UI Kit — Select Primitive Stylesheet
 * Single Native <select> Element, Zero Dashboard Shadows, 100% CSS Logical Properties.
 */

.select {
  /* Scoped private fallback bindings to product presets */
  --_control-height: var(--control-height-default);
  --_control-padding-inline: var(--control-padding-default);
  --_control-padding-block: var(--control-padding-block-default);
  --_control-font-size: var(--control-font-size-default);
  --_control-line-height: var(--control-line-height-default);

  box-sizing: border-box;
  display: block;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: var(--_control-height);
  padding-inline: var(--_control-padding-inline);
  padding-block: var(--_control-padding-block);
  border-radius: var(--radius-control);
  background-color: var(--color-control-bg);
  border: 1px solid var(--color-border-control);
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: var(--_control-font-size);
  line-height: var(--_control-line-height);
  font-weight: var(--font-weight-regular);
  text-align: start;
  cursor: pointer;
  outline: none;
  transition:
    background-color var(--transition-fast),
    border-color var(--transition-fast),
    color var(--transition-fast);
}

/* Explicit Six-Step Scale Bindings */
.select[data-size="xs"] {
  --_control-height: var(--control-height-xs);
  --_control-padding-inline: var(--control-padding-xs);
  --_control-padding-block: var(--control-padding-block-xs);
  --_control-font-size: var(--control-font-size-xs);
  --_control-line-height: var(--control-line-height-xs);
}

.select[data-size="sm"] {
  --_control-height: var(--control-height-sm);
  --_control-padding-inline: var(--control-padding-sm);
  --_control-padding-block: var(--control-padding-block-sm);
  --_control-font-size: var(--control-font-size-sm);
  --_control-line-height: var(--control-line-height-sm);
}

.select[data-size="md"] {
  --_control-height: var(--control-height-md);
  --_control-padding-inline: var(--control-padding-md);
  --_control-padding-block: var(--control-padding-block-md);
  --_control-font-size: var(--control-font-size-md);
  --_control-line-height: var(--control-line-height-md);
}

.select[data-size="lg"] {
  --_control-height: var(--control-height-lg);
  --_control-padding-inline: var(--control-padding-lg);
  --_control-padding-block: var(--control-padding-block-lg);
  --_control-font-size: var(--control-font-size-lg);
  --_control-line-height: var(--control-line-height-lg);
}

.select[data-size="xl"] {
  --_control-height: var(--control-height-xl);
  --_control-padding-inline: var(--control-padding-xl);
  --_control-padding-block: var(--control-padding-block-xl);
  --_control-font-size: var(--control-font-size-xl);
  --_control-line-height: var(--control-line-height-xl);
}

.select[data-size="2xl"] {
  --_control-height: var(--control-height-2xl);
  --_control-padding-inline: var(--control-padding-2xl);
  --_control-padding-block: var(--control-padding-block-2xl);
  --_control-font-size: var(--control-font-size-2xl);
  --_control-line-height: var(--control-line-height-2xl);
}

/* Stable Resting & Neutral Hover Border */
.select:hover:not(:disabled):not(:focus-visible):not([aria-invalid="true"]) {
  border-color: var(--color-border-control);
}

/* Invalid State */
.select[aria-invalid="true"]:not(:disabled) {
  border-color: var(--color-danger);
}

/* Focus State */
.select:focus-visible:not(:disabled) {
  border-color: var(--color-border-focus);
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
}

/* Invalid + Focus State */
.select[aria-invalid="true"]:focus-visible:not(:disabled) {
  border-color: var(--color-danger);
  outline: var(--focus-ring-width) solid var(--color-danger);
  outline-offset: var(--focus-ring-offset);
}

/* Disabled State (Wins over invalid and hover) */
.select:disabled {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* Touch-Target Policy: at least 48px in both dimensions */
@media (any-pointer: coarse) {
  .select[data-touch-target="auto"],
  .select[data-touch-target="comfortable"] {
    min-block-size: max(var(--_control-height), var(--control-touch-target-min, 3rem));
    min-inline-size: max(var(--control-touch-target-min, 3rem), 0px);
  }
}

.select[data-touch-target="comfortable"] {
  min-block-size: max(var(--_control-height), var(--control-touch-target-min, 3rem));
  min-inline-size: max(var(--control-touch-target-min, 3rem), 0px);
}

/* Forced Colors Mode */
@media (forced-colors: active) {
  .select {
    border-color: ButtonBorder;
    background-color: Field;
    color: FieldText;
  }

  .select:hover:not(:disabled):not(:focus-visible):not([aria-invalid="true"]) {
    border-color: ButtonBorder;
  }

  .select:focus-visible:not(:disabled) {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }

  .select[aria-invalid="true"]:not(:disabled) {
    border-color: Highlight;
  }

  .select[aria-invalid="true"]:focus-visible:not(:disabled) {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }

  .select:disabled {
    border-color: GrayText;
    color: GrayText;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .select {
    transition: none;
  }
}
```

### 9.2 `select.tsx`

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './select.module.css';

export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<'select'>,
      'size' | 'multiple' | 'value' | 'defaultValue' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Controlled scalar value.
   */
  value?: string | number;

  /**
   * Initial scalar value for uncontrolled selection.
   */
  defaultValue?: string | number;

  /**
   * Explicitly forbidden. Multi-select listbox is handled by specialized primitives.
   */
  multiple?: never;

  /**
   * Native select elements do not support read-only behavior.
   */
  readOnly?: never;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      size,
      touchTarget = 'auto',
      className,
      multiple: _ignoredMultiple,
      readOnly: _ignoredReadOnly,
      ...props
    },
    ref,
  ) {
    return (
      <select
        {...props}
        ref={ref}
        data-size={size}
        data-touch-target={touchTarget}
        className={cn(styles.select, className)}
      />
    );
  },
);

Select.displayName = 'Select';
```

### 9.3 `index.ts`

```typescript
export { Select, type SelectProps } from './select';
```

---

## 10. Demonstration Gallery Specifications (`/gallery/select`)

Create a connected `SelectGallery` pattern with:
1. **Overview & Product Default**: Omitted size specimen proving local product default parity (`md` in Dashboard, `xl` in Website).
2. **Six-Step Scale**: `xs` through `2xl` with explicit default parity verification.
3. **Controlled Selection**: Demonstrates controlled `value` and `onChange` with localized feedback.
4. **Uncontrolled Selection & Reset**: Demonstrates native `defaultValue` and form reset restoration.
5. **State Matrix**: Resting, hover, focus, invalid, disabled, and combined precedence specimens.
6. **Required Validation & Optional Choice**: Real native required-form validation and separately demonstrated application error relationships with no premature alert.
7. **Option Groups**: Shows `<optgroup>` and individual disabled `<option>` items.
8. **Bidirectional Layout**: EN/FR/AR specimens, Arabic font stack clearance, and nested direction override (`dir="ltr"` inside Arabic page).
9. **Touch Target Verification**: Comfortable target and active theme tokens.
10. **Async Form Simulation**: Pending state, reset cancellation, timer cleanup on unmount as well as reset, duplicate submission guard, and status ID storage.

---

## 11. Testing & Acceptance Matrix

### 11.1 Vitest Unit Tests (`select.test.tsx`)
- Renders native `<select>` and forwards `HTMLSelectElement` ref.
- Passes `id`, `name`, `form`, events, and ARIA attributes directly to `<select>`.
- Supports `<option>`, disabled `<option>`, and `<optgroup>` children.
- Supports controlled `value`/`onChange` and uncontrolled `defaultValue`.
- Emits `data-size` when explicit; omits `data-size` attribute when omitted.
- Applies `data-touch-target`.
- Rejects unsupported `multiple` and `readOnly` props at the TypeScript boundary.
- Filters `multiple` and `readOnly` at runtime before spreading onto the native element.
- External `<label htmlFor={id}>` focuses the select.
- Native `disabled` and disabled `<fieldset>` inheritance.
- Native validity: empty required produces `valueMissing`; selecting an option clears it.
- `FormData` includes enabled selection and excludes disabled select.
- Native form reset restores default uncontrolled selection.

### 11.2 Playwright Browser Tests (`e2e/select.spec.ts`)
- **Direct Hitbox**: Native select is the actual interaction target and responds to real pointer and keyboard interaction.
- **Scale Geometry & Parity**: All 6 sizes verified; omitted size matches `md` (36px) in Dashboard and `xl` (48px) in Website across all dimensions.
- **Touch Target Expansion**: Asserts `window.matchMedia('(any-pointer: coarse)').matches` is `true`, explicit small size (`xs`) expands to $\ge 48\times 48\text{px}$ in both dimensions, and `2xl` preserves $\ge 56\text{px}$ height.
- **State Cascade**: Verifies neutral border stability on hover, focus outline, invalid danger border, and disabled precedence.
- **Forced Colors Mode**: Verifies system colors across all combined states, including hover and pointer exit.
- **Form Submission**: Native required form blocks submission when empty and succeeds after selection; optional empty values submit correctly.
- **Reset Cancellation**: Pending submission reset cancellation verified beyond timer completion, with timer cleanup on unmount.
- **Locale & Direction**: State preservation across locale switch; RTL and nested LTR reflow without horizontal overflow.

---

## 12. Release Acceptance Checklist

- [ ] Reconciled specification reviewed and agreed.
- [ ] Canonical implementation authored in `dashboard/src/components/ui/select/`.
- [ ] Synchronized to `website/src/components/ui/select/` with zero drift.
- [ ] Unit tests pass in all three starters.
- [ ] Playwright browser test suites pass in Dashboard and Website.
- [ ] Dashboard 100% shadow-free policy verified.
- [ ] Zero typecheck and zero lint errors across starters.

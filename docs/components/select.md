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

1. **Custom Token-Spaced Indicator & Native Picker**:
   - Render a native `<select>` wrapped in an inline-flex container with an accessible-hidden decorative Hugeicons chevron (`Icon name="chevron-down"`).
   - Native OS picker affordance and interaction are preserved: the chevron has `pointer-events: none`, allowing clicks across the entire control to hit the `<select>`.
   - Closed-state appearance uses standard `appearance: none` with token-based clearance: `padding-inline-end: calc(var(--_control-padding-inline) * 2 + var(--_control-icon-size))`.
   - Forward `ref`, `className`, `style`, and native attributes directly to the `<select>`.
   - Provide `showIcon?: boolean` (default `true`) allowing callers to omit the decorative indicator when minimal styling is desired.
   - Progressive-enhancement arrow rotation via `.select:open ~ .arrow { transform: translateY(-50%) rotate(180deg); }`, suppressed under `prefers-reduced-motion: reduce`.
2. **Native Selection & Form Authority**:
   - Built on native HTML5 `<select>` with standard `<option>` and `<optgroup>` children.
   - Browser DOM retains sole authority over selection state, option indexing, native picker presentation, form serialization, and form reset.
   - No custom popover layers, simulated listboxes, custom option state, or synthetic focus traps.
3. **Explicit Exclusions (Deferred to Specialized Primitives & Patterns)**:
   - Searchable comboboxes and autocompletes (handled by `Combobox`).
   - Custom option item rendering and rich popovers (handled by `DropdownMenu` / `Popover`).
   - Multi-select listboxes and tag pickers (outside single-select dropdown scope).
   - Virtualized option lists.

### 1.2 Standards, Design System Guidance & Kit Decisions

To maintain architectural rigor and audit clarity, the Select implementation separates requirements into three distinct tiers:

1. **Normative Accessibility Requirements (WCAG 2.2 AA / AAA & Web Standards)**:
   - **Accessible Name & Descriptions (WCAG 4.1.2, 1.3.1)**: As a pure UI primitive, `Select` cannot guarantee an accessible name on its own because labels are supplied by callers. The primitive renders an honest semantic `<select>` target, and consumers (connected patterns, forms, and pages) must provide an accessible name via an associated `<label htmlFor="...">`, `aria-label`, or `aria-labelledby`. Supporting hints and validation messages are associated via `aria-describedby`.
   - **Visible Keyboard Focus (WCAG 2.4.7, 2.4.11)**: Focus indicator appears immediately with high visual contrast (`outline: var(--focus-ring-width) solid var(--color-border-focus)`), meeting minimum 3:1 non-text contrast against adjacent colors.
   - **Target Size Minimum (WCAG 2.5.8 Level AA)**: WCAG 2.2 Level AA establishes a 24×24 CSS pixel minimum pointer target size in both dimensions (subject to spacing, inline, and essential exceptions). `Select` uses `inline-size: 100%` with minimum block sizes starting at 28px (`xs`), ensuring target area in standard container layouts satisfies this criterion.
   - **Color Contrast (WCAG 1.4.3, 1.4.11)**: Measured against concrete token values. In the default Dashboard neutral light theme: text `--color-text-primary` (`#141414`) against white (`#FFFFFF`) achieves 18.42:1 (exceeding 4.5:1 WCAG AA text threshold); focus border `--color-border-focus` (`#525252`) achieves 7.81:1 and danger border `--color-danger` (`#b91c1c`) achieves 6.47:1 against white (exceeding 3:1 non-text threshold). In dark theme: text `--color-text-primary` (`#FAFAFA`) against `--color-control-bg` (`#18181B`) achieves 15.8:1; focus border achieves 5.2:1. Custom brand palettes or adjacent tinted surfaces must be independently checked against these criteria.
   - **Native Dropdown Semantics & Keyboard Navigation**: Built strictly on `<select>` and `<option>`, ensuring native keyboard typeahead, Arrow Up/Down navigation, Enter/Space activation, and platform screen reader role announcement.

2. **Established Design System Guidance (e.g., GOV.UK, USWDS)**:
   - **Select vs. Alternatives**: Guidance such as USWDS suggesting radios for small lists (often cited around 2–7 options) represents context-dependent design system advice rather than an immutable rule. Radios allow immediate comparison of all choices without an extra interaction; Select is suitable for longer option sets (e.g., countries, currencies, time zones) or compact interfaces. The choice must be guided by context, task frequency, and user research.
   - **Preselected Defaults vs. Empty Prompts**: An unselected empty prompt is not required for every mandatory select. When a sensible, safe default exists (e.g., standard billing cycle or user's detected currency), preselecting it streamlines completion. When users must make a conscious, unprompted choice without default bias, an initial empty prompt (`<option value="">Choose an option...</option>`) combined with HTML5 `required` enforces deliberate selection.

3. **White-Label UI Kit Choices (System Design Specifications)**:
   - **Six-Step Control Scale**: `xs` (28px), `sm` (32px), `md` (36px), `lg` (40px), `xl` (48px), and `2xl` (56px) to match the kit's holistic typographic and spacing scale.
   - **Comfortable Ergonomic Touch Targets**: In addition to meeting the 24×24px WCAG AA baseline, our kit provides 48×48px comfortable touch targets (`--control-touch-target-min: 3rem`) for coarse pointers and mobile viewports, aligning with enhanced touch ergonomics (Apple HIG / Material).
   - **Token-Spaced Custom Indicator**: Replaces OS arrow with Hugeicons registry chevron positioned at `inset-inline-end: var(--_control-padding-inline)` with `pointer-events: none` to hit-test native `<select>`.
   - **Progressive Enhancement Arrow Rotation**: Rotates the chevron 180° when the browser exposes `:open` pseudo-class, safely collapsing to 0ms under `prefers-reduced-motion: reduce`.
   - **Zero Dashboard Shadows**: 100% shadow-free depth on Dashboard; depth communicated strictly through surface tones and borders.
   - **LanguageSwitcher Consolidation**: Directly reuses `Select` to eliminate redundant styling and ensure consistent behavior across all starters.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SELECT ARCHETYPE SUMMARY                        │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Honest Native Foundation: Native <select> with standard picker     │
│  3. Custom Indicator: Hugeicons chevron, pointer-events: none          │
│  4. Direct Ref Forwarding: Forwards ref to HTMLSelectElement           │
│  5. Direct Attribute Application: className, style forwarded to select │
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
- Native `<select>` element rendered with inline-flex root wrapper and accessible-hidden Hugeicons chevron.
- Ref forwards directly to `HTMLSelectElement`.
- Caller supplies standard `<option>` and `<optgroup>` children.
- Supports native controlled and uncontrolled usage with scalar values:
  - For uncontrolled usage: the browser DOM owns current selection; native form behavior applies.
  - For controlled usage: the caller's React state controls value; native form behavior still applies.
- Kit `size` governs visual density and is never forwarded as the native numeric `<select size>` attribute (which would turn it into a listbox).
- `showIcon?: boolean` (defaults to `true`) toggles the custom chevron indicator.
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
   * Whether to render the decorative dropdown chevron indicator.
   * Defaults to true. When false, symmetrical padding is applied.
   */
  showIcon?: boolean;

  /**
   * Optional className applied directly to the inner native select element.
   * (The standard `className` prop applies to the control root wrapper).
   */
  selectClassName?: string;

  /**
   * Optional inline styles applied directly to the inner native select element.
   * (The standard `style` prop applies to the control root wrapper).
   */
  selectStyle?: CSSProperties;

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
- In forced-colors mode, the custom chevron indicator is styled using system colors (`CanvasText`, `Highlight`, `GrayText`), while native picker options and operating system pickers render according to platform high-contrast rules.

---

## 9. Canonical Source Code Reference

### 9.1 `select.module.css`

```css
/**
 * White Label UI Kit — Select Primitive Stylesheet
 * Single Native <select> with Custom Token-Spaced Registry Chevron.
 * 100% CSS Logical Properties, Zero Dashboard Shadows.
 */

.root {
  /* Scoped private fallback bindings to product presets */
  --_control-height: var(--control-height-default);
  --_control-padding-inline: var(--control-padding-default);
  --_control-padding-block: var(--control-padding-block-default);
  --_control-font-size: var(--control-font-size-default);
  --_control-line-height: var(--control-line-height-default);
  --_control-icon-size: var(--control-icon-size-default);

  position: relative;
  box-sizing: border-box;
  display: inline-block;
  inline-size: 100%;
  min-inline-size: 0;
  vertical-align: middle;
}

/* Explicit Six-Step Scale Bindings */
.root[data-size="xs"] {
  --_control-height: var(--control-height-xs);
  --_control-padding-inline: var(--control-padding-xs);
  --_control-padding-block: var(--control-padding-block-xs);
  --_control-font-size: var(--control-font-size-xs);
  --_control-line-height: var(--control-line-height-xs);
  --_control-icon-size: var(--control-icon-size-xs);
}

.root[data-size="sm"] {
  --_control-height: var(--control-height-sm);
  --_control-padding-inline: var(--control-padding-sm);
  --_control-padding-block: var(--control-padding-block-sm);
  --_control-font-size: var(--control-font-size-sm);
  --_control-line-height: var(--control-line-height-sm);
  --_control-icon-size: var(--control-icon-size-sm);
}

.root[data-size="md"] {
  --_control-height: var(--control-height-md);
  --_control-padding-inline: var(--control-padding-md);
  --_control-padding-block: var(--control-padding-block-md);
  --_control-font-size: var(--control-font-size-md);
  --_control-line-height: var(--control-line-height-md);
  --_control-icon-size: var(--control-icon-size-md);
}

.root[data-size="lg"] {
  --_control-height: var(--control-height-lg);
  --_control-padding-inline: var(--control-padding-lg);
  --_control-padding-block: var(--control-padding-block-lg);
  --_control-font-size: var(--control-font-size-lg);
  --_control-line-height: var(--control-line-height-lg);
  --_control-icon-size: var(--control-icon-size-lg);
}

.root[data-size="xl"] {
  --_control-height: var(--control-height-xl);
  --_control-padding-inline: var(--control-padding-xl);
  --_control-padding-block: var(--control-padding-block-xl);
  --_control-font-size: var(--control-font-size-xl);
  --_control-line-height: var(--control-line-height-xl);
  --_control-icon-size: var(--control-icon-size-xl);
}

.root[data-size="2xl"] {
  --_control-height: var(--control-height-2xl);
  --_control-padding-inline: var(--control-padding-2xl);
  --_control-padding-block: var(--control-padding-block-2xl);
  --_control-font-size: var(--control-font-size-2xl);
  --_control-line-height: var(--control-line-height-2xl);
  --_control-icon-size: var(--control-icon-size-2xl);
}

/* Native Select Element */
.select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  box-sizing: border-box;
  display: block;
  inline-size: 100%;
  min-inline-size: 0;
  min-block-size: var(--_control-height);
  padding-inline-start: var(--_control-padding-inline);
  padding-inline-end: calc(var(--_control-padding-inline) * 2 + var(--_control-icon-size));
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
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast);
}

/* Symmetrical padding when chevron is omitted */
.select[data-show-icon="false"] {
  padding-inline-end: var(--_control-padding-inline);
}

/* Stable Resting & Neutral Hover Border */
.select:hover:not(:disabled):not(:focus-visible):not([aria-invalid="true"]) {
  border-color: var(--color-border-control);
}

/* Focus State (Immediate 0ms Visible Outline) */
.select:focus-visible,
.select:focus {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
  border-color: var(--color-border-focus);
  transition: none;
}

/* Invalid State: driven strictly by aria-invalid="true" */
.select[aria-invalid="true"]:not(:disabled) {
  border-color: var(--color-danger);
}

.select[aria-invalid="true"]:focus-visible,
.select[aria-invalid="true"]:focus {
  border-color: var(--color-danger);
  outline-color: var(--color-danger);
  transition: none;
}

/* Disabled State: wins over invalid and hover */
.select:disabled {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* Decorative Chevron Arrow */
.arrow {
  position: absolute;
  inset-inline-end: var(--_control-padding-inline);
  inset-block-start: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_control-icon-size);
  block-size: var(--_control-icon-size);
  font-size: var(--_control-icon-size);
  color: var(--color-text-secondary);
  transition:
    transform var(--transition-fast),
    color var(--transition-fast);
}

/* Arrow hover, focus, and state colors */
.select:hover:not(:disabled) ~ .arrow {
  color: var(--color-text-primary);
}

.select:focus-visible:not(:disabled) ~ .arrow,
.select:focus:not(:disabled) ~ .arrow {
  color: var(--color-border-focus);
}

.select[aria-invalid="true"]:not(:disabled) ~ .arrow {
  color: var(--color-danger);
}

.select:disabled ~ .arrow {
  color: var(--color-text-disabled);
}

/* Progressive enhancement: rotate arrow when browser exposes native :open */
.select:open ~ .arrow {
  transform: translateY(-50%) rotate(180deg);
}

/* Touch-Target Policy: at least 48px in both dimensions */
.root[data-touch-target="comfortable"],
.root[data-touch-target="comfortable"] .select {
  min-block-size: max(var(--_control-height), var(--control-touch-target-min, 3rem));
  min-inline-size: max(var(--control-touch-target-min, 3rem), 0px);
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"],
  .root[data-touch-target="auto"] .select,
  .root[data-touch-target="comfortable"],
  .root[data-touch-target="comfortable"] .select {
    min-block-size: max(var(--_control-height), var(--control-touch-target-min, 3rem));
    min-inline-size: max(var(--control-touch-target-min, 3rem), 0px);
  }
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

  .select:focus-visible,
  .select:focus {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }

  .select[aria-invalid="true"]:not(:disabled) {
    border-color: Highlight;
  }

  .select[aria-invalid="true"]:focus-visible,
  .select[aria-invalid="true"]:focus {
    border-color: Highlight;
    outline: 2px solid Highlight;
  }

  .select:disabled {
    border-color: GrayText;
    color: GrayText;
  }

  .arrow {
    color: CanvasText;
  }

  .select:disabled ~ .arrow {
    color: GrayText;
  }

  .select:hover:not(:disabled) ~ .arrow,
  .select:focus-visible:not(:disabled) ~ .arrow {
    color: Highlight;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .select,
  .arrow {
    transition: none;
  }
}
```

### 9.2 `select.tsx`

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { Icon } from '@/components/icons';
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
   * Whether to render the decorative dropdown chevron indicator.
   * Defaults to true. When false, symmetrical padding is applied.
   */
  showIcon?: boolean;

  /**
   * Optional className applied directly to the inner native select element.
   * (The standard `className` prop applies to the control root wrapper).
   */
  selectClassName?: string;

  /**
   * Optional inline styles applied directly to the inner native select element.
   * (The standard `style` prop applies to the control root wrapper).
   */
  selectStyle?: CSSProperties;

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
      showIcon = true,
      className,
      style,
      selectClassName,
      selectStyle,
      disabled = false,
      dir,
      children,
      // Filter unsupported / forbidden attributes before runtime spread
      multiple: _ignoredMultiple,
      readOnly: _ignoredReadOnly,
      ...props
    },
    ref,
  ) {
    return (
      <span
        className={cn(styles.root, className)}
        style={style}
        data-size={size}
        data-touch-target={touchTarget}
        data-disabled={disabled ? 'true' : undefined}
        data-show-icon={showIcon ? 'true' : 'false'}
        dir={dir}
      >
        <select
          {...props}
          ref={ref}
          dir={dir}
          disabled={disabled}
          data-size={size}
          data-touch-target={touchTarget}
          data-show-icon={showIcon ? 'true' : 'false'}
          className={cn(styles.select, selectClassName)}
          style={selectStyle}
        >
          {children}
        </select>
        {showIcon && (
          <span className={styles.arrow} aria-hidden="true">
            <Icon name="chevron-down" />
          </span>
        )}
      </span>
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

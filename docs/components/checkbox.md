# Checkbox — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Implementation Specification (Reviewed Baseline)  
> **Applies to:** Core UI Primitive (`components/ui/checkbox`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/checkbox/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/checkbox/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md) · [Button Specification](./button.md) · [Input Specification](./input.md) · [Textarea Specification](./textarea.md)

---

## 1. Executive Summary & Objective

The `Checkbox` primitive captures an independent **selected / not-selected** binary choice, or presents a third **indeterminate (mixed)** state representing partial selection across nested items. It serves as the multi-selection and binary preference control across forms, data tables, filter panels, and settings pages.

Within the White Label UI Kit, `Checkbox` preserves native browser `<input type="checkbox">` semantics, accessibility lifecycles, and form participation while delivering white-label token adherence, real touch-target safety, stable hover borders, and zero-drift cross-starter synchronization.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CHECKBOX ARCHETYPE SUMMARY                      │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Single Foundation: Identical implementation across all kit editions│
│  3. Native Input Authority: Native <input type="checkbox"> drives DOM  │
│  4. Ref Forwarding: Forwards ref directly to HTMLInputElement          │
│  5. Target vs. Indicator: Target (36px/48px) decoupled from box (16/20)│
│  6. Real Hitbox Target: Native input occupies 100% of the target area  │
│  7. CSS-Driven Tri-State: Native :checked & :indeterminate drive icons │
│  8. Registered Icons: <Icon name="check" /> and <Icon name="minus" />  │
│  9. Specificity-Safe Precedence: Disabled > Invalid > Checked > Hover  │
│ 10. Foreground Tokens: --color-primary-foreground & danger-foreground  │
│ 11. No Speculative ReadOnly: Follows native checkbox HTML semantics   │
│ 12. Valid Media Syntax: Separate @media blocks for coarse pointers     │
│ 13. Consistent Radius: Uniform --radius-sm preserves square geometry   │
│ 14. Zero Unapproved Motion: No scale/bounce; simple opacity transition │
│ 15. Forced-Colors Ready: System color tokens for high-contrast mode    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Scope Boundaries

- **Real interaction target**: The structural container defines the interaction area (e.g. 36×36px Dashboard, 48×48px Website), and the transparent native `<input type="checkbox">` spans the entire area (`inset: 0`, 100% width/height) to guarantee reliable activation without pseudo-element hit-testing bugs.
- **Compact visible indicator**: The visible square box is centered inside the interaction target and scales strictly with the approved `--control-icon-size-*` token scale (`14px` xs → `16px` sm/md → `18px` lg → `20px` xl → `24px` 2xl).
- **CSS-Driven visual authority**: Both `<Icon name="check" />` and `<Icon name="minus" />` are rendered inside the indicator. Native CSS `:checked` and `:indeterminate` determine which glyph is visible, with indeterminate naturally taking cascade precedence over checked.
- **Indeterminate DOM synchronization**: Synchronizes React `indeterminate?: boolean` directly to `HTMLInputElement.indeterminate` via `useLayoutEffect`, without creating competing prop-derived wrapper states or redundant ARIA overrides.
- **Registered icon glyphs**: Uses the application's semantic Icon registry: `<Icon name="check" />` (`Tick02Icon`) for checked, and `<Icon name="minus" />` (`MinusSignIcon`) for indeterminate.
- **Touch-target policy**: Automatically expands to at least 48×48px (`--control-touch-target-min: 3rem`) on coarse pointer devices and under `touchTarget="comfortable"`, while preserving larger explicit sizes (e.g. 56×56px `2xl`).

### 1.2 Explicit Non-Goals & Exclusions

The following are strictly excluded from the primitive:
- **No integrated labels, descriptions, or error messages inside the primitive**: Labels and descriptions are associated externally via `<label htmlFor={id}>` and `aria-describedby`.
- **No toggle switch presentation**: Immediate-action switches belong to the dedicated `Switch` primitive (`role="switch"`).
- **No radio-button single selection**: Mutually exclusive selection belongs to `RadioGroup` and `Radio`.
- **No "Select All" business logic inside the primitive**: Tri-state logic, parent-child synchronization, and item arrays are calculated by caller patterns.
- **No speculative `readOnly` prop**: In HTML, checkboxes do not have a read-only interaction state. Checkboxes use `disabled` or caller-level click prevention.
- **No form libraries, schema validation, or persistence**: React Hook Form, Formik, and Zod plug in cleanly via standard native props (`name`, `checked`, `onChange`, `onBlur`, `ref`).
- **No loading states or commercial edition checks**: One pure foundation serves all editions.

---

## 2. Inviolable Architectural Boundaries

### 2.1 The Four-Tier Architecture

Responsibility flows strictly downwards:

| Layer | Path | Allowed Dependencies | Forbidden Dependencies | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/checkbox/` | `react`, `@/lib/cn`, `@/components/icons`, `./*.module.css`, `../control-sizing` | `@/providers`, `@/i18n`, `next/*`, external state/form/query libs, hardcoded English copy | Native `<input type="checkbox">`, indicator presentation, control sizing, native ref forwarding |
| **2. Field Composition** | `src/components/patterns/` | Layer 1 + Layout contexts | `next/*`, direct DOM mutations | Label association (`<label htmlFor>`), helper/error ARIA linkages (`aria-describedby`) |
| **3. Connected Pattern** | `src/components/patterns/` | Layers 1–2 + `@/providers` (`useI18n`, `useTheme`), `@/i18n` (`BidiText`) | `next/*`, dashboard shadows | Localized text (`t()`), bidi isolation, settings/preference rows, table batch selection |
| **4. Host Application** | `src/app/`, `src/` | All layers + `next/navigation`, `next/link` | Top-level client boundaries on server layouts | Form submission, server mutations, database persistence |

### 2.2 Canonical Source Ownership & Synchronization

`Checkbox` is authored canonically in `typescript/nextjs/starterkit/dashboard/src/components/ui/checkbox/`.
- Shared code is mirrored to `typescript/nextjs/starterkit/website/src/components/ui/checkbox/` and `typescript/vite/starterkit/dashboard/src/components/ui/checkbox/`.
- Author changes in Dashboard only, then run:
  ```bash
  node scripts/sync-shared.mjs
  node scripts/sync-shared.mjs --check
  ```

---

## 3. Public API & Prop Interface

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface CheckboxProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Displays the native mixed/indeterminate state.
   * Synchronizes with HTMLInputElement.indeterminate.
   * Does not replace checked / defaultChecked.
   * @default false
   */
  indeterminate?: boolean;
}
```

### 3.1 Property Defaults

| Property | Default Value | Description |
| :--- | :--- | :--- |
| `type` | `'checkbox'` (locked) | Native HTML checkbox input type |
| `size` | `undefined` (omitted) | Consumes local product preset default alias via CSS (`md` in Dashboard, `xl` in Website) |
| `touchTarget` | `'auto'` | Enforces 48×48px minimum interaction area on coarse pointer devices |
| `indeterminate` | `false` | Sets the DOM `indeterminate` property; CSS renders the registered minus glyph |
| `checked` / `defaultChecked` | Caller-controlled | Standard controlled or uncontrolled boolean state |
| `disabled` | `false` | Native disabled state; suppresses events and pointer interaction |
| `required` | `false` | Native form constraint validation |

### 3.2 Native Attribute Preservation & Forwarding

All standard HTML `<input type="checkbox">` attributes forward cleanly to the underlying input:
- **Identification & Form:** `id`, `name`, `value` (defaults to `"on"` if unspecified), `form`, `required`.
- **State & Events:** `checked`, `defaultChecked`, `onChange`, `onFocus`, `onBlur`, `onKeyDown`.
- **Accessibility:** `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`, `aria-required`, `aria-errormessage`.
- **Root Styling:** `className` and `style` apply to the outer structural container for layout positioning, while semantic input attributes and events apply directly to the `<input>`.
- **Direct Ref Forwarding:** The forwarded `ref` points directly to the **`HTMLInputElement`**, never to the outer wrapper container, ensuring seamless integration with focus management, imperative DOM queries, and form libraries.

---

## 4. Native Interaction & State Contract

### 4.1 Controlled & Uncontrolled Usage

- **Controlled Usage**:
  ```tsx
  <Checkbox
    checked={isSelected}
    onChange={(e) => setIsSelected(e.currentTarget.checked)}
  />
  ```
  The caller owns state. The primitive maintains zero shadow state and synthesizes zero artificial events.
- **Uncontrolled Usage**:
  ```tsx
  <Checkbox
    name="marketingOptIn"
    value="subscribed"
    defaultChecked
  />
  ```
  The browser DOM owns state, native form serialization, and form reset.

### 4.2 Keyboard Navigation
- **`Tab`**: Moves keyboard focus to the enabled checkbox. Triggers immediate (0ms) visible `:focus-visible` outline.
- **`Shift + Tab`**: Moves focus to the previous focusable element.
- **`Space`**: Toggles checked state natively.
- **`Enter`**: Standard checkboxes do not activate on `Enter` (unlike buttons); this native browser behavior is strictly preserved.
- RTL direction does not alter `Space` or `Tab` interaction.

---

## 5. Indeterminate (Mixed) State Contract

Indeterminate is a **native DOM property (`input.indeterminate`)**, not an HTML attribute:

1. **DOM Synchronization**: A `useLayoutEffect` synchronizes `inputRef.current.indeterminate = Boolean(indeterminate)` whenever the prop changes.
2. **CSS Cascade Authority**:
   - Both `.iconCheck` and `.iconMinus` exist statically in the DOM.
   - `.input:checked + .indicator .iconCheck` displays the checkmark.
   - `.input:indeterminate + .indicator .iconMinus` displays the minus glyph, while explicitly suppressing `.iconCheck`.
   - Native `:indeterminate` pseudo-class takes visual priority over `:checked` in CSS.
3. **Native Accessibility**: When `input.indeterminate = true`, modern browsers expose mixed state directly to assistive technologies. No redundant `aria-checked="mixed"` override is needed.
4. **Form Submission vs. Presentation**:
   - `checked` determines form submission payload (`name=value`).
   - `indeterminate` determines visual presentation only.
5. **Caller-Calculated Selection**: The primitive does NOT cycle three states on click. In parent/child patterns, the caller calculates state:
   - 0 children selected → `checked={false}`, `indeterminate={false}`
   - Some children selected → `checked={false}`, `indeterminate={true}`
   - All children selected → `checked={true}`, `indeterminate={false}`
6. **Form Reset**: Form reset restores uncontrolled checkboxes to `defaultChecked`. Because native form reset does not clear DOM `indeterminate`, caller patterns must explicitly re-evaluate their selection state on form reset.

---

## 6. Sizing: Interaction Target vs. Visible Indicator

Interaction target size and visible indicator size are **deliberately decoupled**. Interactive controls require comfortable touch/click targets, but a 36px or 48px visible checkbox box would deform form layouts.

### 6.1 Six-Step Sizing Metric Scale

All pixel equivalents assume standard `1rem = 16px`:

| Scale Step | Minimum Interaction Target | Visible Box Dimensions | Corner Radius Token | Icon Glyph Size Token | Primary Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `1.75rem` (28px) | `0.875rem` (14px) | `var(--radius-sm)` (4px) | `0.625rem` (10px) | Dense data table rows, compact tree views |
| **`sm`** | `2.00rem` (32px) | `1.00rem` (16px) | `var(--radius-sm)` (4px) | `0.75rem` (12px) | Secondary toolbars, compact filter lists |
| **`md`** | `2.25rem` (36px) | `1.00rem` (16px) | `var(--radius-sm)` (4px) | `0.75rem` (12px) | **Dashboard Product Default** |
| **`lg`** | `2.50rem` (40px) | `1.125rem` (18px) | `var(--radius-sm)` (4px) | `0.875rem` (14px) | Comfortable dashboard cards, settings rows |
| **`xl`** | `3.00rem` (48px) | `1.25rem` (20px) | `var(--radius-sm)` (4px) | `1.00rem` (16px) | **Website Product Default** |
| **`2xl`** | `3.50rem` (56px) | `1.50rem` (24px) | `var(--radius-sm)` (4px) | `1.125rem` (18px) | Marketing signups, hero lead-capture forms |

### 6.2 Product-Owned Default Presets
- **Dashboard Preset (`styles/dashboard/controls.css`):**
  - Target: `--control-height-default: var(--control-height-md);` (36px)
  - Indicator: `16×16px` (`--control-icon-size-md`)
  - Glyph: `12×12px`
- **Website Preset (`styles/website/controls.css`):**
  - Target: `--control-height-default: var(--control-height-xl);` (48px)
  - Indicator: `20×20px` (`--control-icon-size-xl`)
  - Glyph: `16×16px`
- **Uniform Radius**: Consistently uses `var(--radius-sm, 4px)` across all steps to keep the checkbox distinctly square and prevent confusion with circular radio controls.
- When `size` is omitted (`<Checkbox />`), `data-size` is unset in the DOM. The stylesheet resolves private scoped variables via product `*-default` aliases, exactly matching the explicit `md` (Dashboard) and `xl` (Website) steps.

### 6.3 Real Input-Sized Interaction Hitbox
- The outer container has dimensions equal to `--_checkbox-target`.
- The native `<input type="checkbox">` is positioned with `position: absolute; inset: 0; inline-size: 100%; block-size: 100%; opacity: 0; cursor: pointer; z-index: 1;`.
- **Result**: Tapping or clicking anywhere inside the 36px, 48px, or 56px container hits the real native input directly.
- The visible indicator sits centered within the container with `pointer-events: none;`.

### 6.4 Valid Media-Query Touch-Target Policy
The touch expansion uses separate, valid CSS blocks:
```css
.root[data-touch-target="comfortable"] {
  min-inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  min-block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"] {
    min-inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    min-block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  }
}
```
Using `max(var(--_checkbox-target), ...)` ensures explicit larger targets (such as 56px `2xl`) are preserved and not shrunk to 48px.

---

## 7. Visual States & Specificity-Safe Precedence

### 7.1 State Detail Table

| State | Selector / Condition | Box Background | Box Border | Icon Color | Pointer / Interaction |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Unchecked Resting** | `.input:not(:checked):not(:indeterminate)` | `var(--color-surface)` | `1px solid var(--color-border-control)` | None | Click / Space checks |
| **Unchecked Hover** | `.input:not(:checked):hover:not(:disabled)` | `var(--color-surface-hover)` | `1px solid var(--color-border-control)` *(Stable!)* | None | Click / Space checks |
| **Checked Resting** | `.input:checked:not(:indeterminate)` | `var(--color-primary)` | `1px solid var(--color-primary)` | `var(--color-primary-foreground)` | Click / Space unchecks |
| **Checked Hover** | `.input:checked:hover:not(:disabled)` | `var(--color-primary-hover)` | `1px solid var(--color-primary-hover)` | `var(--color-primary-foreground)` | Click / Space unchecks |
| **Indeterminate** | `.input:indeterminate` | `var(--color-primary)` | `1px solid var(--color-primary)` | `var(--color-primary-foreground)` | Click / Space checks |
| **Focus-Visible** | `.input:focus-visible + .indicator` | As state | As state | As state | 2px outline: `var(--color-border-focus)` with 2px offset |
| **Invalid (Unchecked)** | `.input[aria-invalid="true"]:not(:checked)` | `var(--color-surface)` | `1px solid var(--color-danger)` | None | Danger outline on focus |
| **Invalid (Checked/Mixed)** | `.input[aria-invalid="true"]:checked`, `.input[aria-invalid="true"]:indeterminate` | `var(--color-danger)` | `1px solid var(--color-danger)` | `var(--color-danger-foreground)` | Danger outline on focus |
| **Invalid + Hover** | `.input[aria-invalid="true"]:hover:not(:disabled)` | Maintains `--color-danger` fill/border | `1px solid var(--color-danger)` | `var(--color-danger-foreground)` | Danger styling remains |
| **Disabled** | `.input:disabled + .indicator` | `var(--color-control-disabled-bg)` | `1px solid var(--color-border-disabled)` | `var(--color-text-disabled)` | Pointer disabled, no events |

### 7.2 Specificity-Safe Precedence Rules

To prevent cascade bugs where hover or invalid selectors collide:
1. **Disabled rules have highest specificity and precedence**:
   `.input:disabled + .indicator` and `.input:disabled:hover + .indicator` strictly override hover, checked, and invalid styles.
   Disabled checked/indeterminate marks remain visible but consume `var(--color-text-disabled)`.
2. **Invalid rules override normal checked hover**:
   The selector for invalid checked hover explicitly matches or exceeds `.input:checked:hover:not(:disabled)` specificity so hover does not replace `--color-danger` with primary colors.
3. **Stable Hover Border**:
   Hovering an unchecked checkbox changes its surface background (`--color-surface-hover`), but its border **strictly remains stable** at `--color-border-control`.
4. **Dashboard 100% Shadow-Free Guarantee**:
   Zero `box-shadow`, `text-shadow`, or decorative glows in the Dashboard starter.

---

## 8. Icon Registry Integration

Checkbox uses the application's semantic Icon registry (`src/components/icons`):

1. **Checked Mark**:
   - Registered name: `"check"`
   - Core Hugeicons export: `Tick02Icon`
2. **Indeterminate Mark**:
   - Registered name: `"minus"`
   - Core Hugeicons export: `MinusSignIcon` (from `@hugeicons/core-free-icons`)
   - Directional mirroring: `false` (does not mirror in RTL)
3. **Actual SVG Sizing**:
   - The indicator stylesheet sizes the **actual SVG** element (`.iconCheck svg, .iconMinus svg { inline-size: var(--_checkbox-icon-size); block-size: var(--_checkbox-icon-size); }`).
4. **Motion**:
   - Unapproved scale/bounce animation is removed.
   - Uses simple, clean `opacity` transition: `transition: opacity var(--motion-duration-fast) var(--motion-ease-enter);`.

---

## 9. Forced-Colors Mode (High Contrast Accessibility)

Under `@media (forced-colors: active)`:
- Custom background fills are replaced by system `Canvas`, `CanvasText`, `Highlight`, and `HighlightText`.
- Borders and focus rings remain visible via `currentColor` and `Highlight`.
- Checked and minus glyphs use system `HighlightText` against `Highlight` backgrounds.

---

## 10. Labels, Groups & Form Lifecycles

### 10.1 Accessible Label Association
Every checkbox must have an accessible name:
```tsx
<div className={styles.fieldRow}>
  <Checkbox id={fieldId} name="analyticsOptIn" />
  <label htmlFor={fieldId} className={styles.label}>
    {t('settings.analyticsOptIn')}
  </label>
</div>
```
- Clicking the `<label>` reliably toggles the checkbox exactly once through browser-native label association.
- Wrapping label or sibling label: Both are supported because `id` and `htmlFor` associate programmatically.

### 10.2 Checkbox Groups
When choices form a related set:
- Wrap in semantic `<fieldset>` with `<legend>` for the group title.
- Note: Native `required` on an individual checkbox means *that specific checkbox must be checked* (e.g. Terms acceptance). Group-level "select at least one" validation is handled by caller validation, not native `required` on every item.

### 10.3 Form Submission Rules
- Checked & enabled → submits `name=value` (or `name=on`).
- Unchecked or disabled → omitted from form submission payload.
- Form reset restores the checkbox to `defaultChecked`.

---

## 11. RTL & Internationalization Architecture

- **100% Logical CSS Properties**: `inline-size`, `block-size`, `padding-inline`, `margin-inline-end`, `inset-inline-start`.
- **RTL Row Flow**: In LTR (`dir="ltr"`), the checkbox renders to the left of its label. In RTL (`dir="rtl"`), it renders to the right of its label naturally without manual float or scale rules.
- **Directional Mirroring**: Neither the checkmark nor the minus glyph flips in RTL (`mirror: false`).
- **Arabic Diacritic Clearance**: The field row uses `align-items: center` (or baseline alignment with appropriate offset) and sufficient block clearance so Arabic Tashkeel diacritics and tall ascenders never clip.

---

## 12. Proposed Source Implementation Contract

### 12.1 `checkbox.tsx`

```tsx
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
} from 'react';
import { Icon } from '@/components/icons';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './checkbox.module.css';

export interface CheckboxProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Displays the native mixed/indeterminate state.
   * Synchronizes directly with HTMLInputElement.indeterminate.
   * Does not replace checked / defaultChecked.
   * @default false
   */
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    size,
    touchTarget = 'auto',
    indeterminate = false,
    disabled = false,
    className,
    style,
    id: callerId,
    ...props
  },
  forwardedRef,
) {
  const generatedId = useId();
  const inputId = callerId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(forwardedRef, () => inputRef.current as HTMLInputElement);

  // Synchronize native indeterminate DOM property
  useLayoutEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <span
      className={cn(styles.root, className)}
      style={style}
      data-size={size}
      data-touch-target={touchTarget}
      data-disabled={disabled ? 'true' : undefined}
    >
      <input
        {...props}
        ref={inputRef}
        id={inputId}
        type="checkbox"
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.indicator} aria-hidden="true">
        <span className={styles.iconCheck}>
          <Icon name="check" />
        </span>
        <span className={styles.iconMinus}>
          <Icon name="minus" />
        </span>
      </span>
    </span>
  );
});

Checkbox.displayName = 'Checkbox';
```

### 12.2 `checkbox.module.css`

```css
/*
 * Checkbox Component Stylesheet
 *
 * Core UI Primitive: 100% logical CSS properties, zero shadows in dashboard.
 * Decouples minimum interaction target from visible indicator box.
 */

.root {
  /* Default density aliases */
  --_checkbox-target: var(--control-height-default, 2.25rem);
  --_checkbox-box-size: var(--control-icon-size-default, 1rem);
  --_checkbox-radius: var(--radius-sm, 0.25rem);
  --_checkbox-icon-size: calc(var(--_checkbox-box-size) * 0.75);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_checkbox-target);
  block-size: var(--_checkbox-target);
  min-inline-size: var(--_checkbox-target);
  min-block-size: var(--_checkbox-target);
  vertical-align: middle;
  flex: none;
  box-sizing: border-box;
}

/* Six-Step Density Overrides */
.root[data-size="xs"] {
  --_checkbox-target: var(--control-height-xs, 1.75rem);
  --_checkbox-box-size: 0.875rem; /* 14px */
  --_checkbox-icon-size: 0.625rem; /* 10px */
}

.root[data-size="sm"] {
  --_checkbox-target: var(--control-height-sm, 2rem);
  --_checkbox-box-size: 1rem; /* 16px */
  --_checkbox-icon-size: 0.75rem; /* 12px */
}

.root[data-size="md"] {
  --_checkbox-target: var(--control-height-md, 2.25rem);
  --_checkbox-box-size: 1rem; /* 16px */
  --_checkbox-icon-size: 0.75rem; /* 12px */
}

.root[data-size="lg"] {
  --_checkbox-target: var(--control-height-lg, 2.5rem);
  --_checkbox-box-size: 1.125rem; /* 18px */
  --_checkbox-icon-size: 0.875rem; /* 14px */
}

.root[data-size="xl"] {
  --_checkbox-target: var(--control-height-xl, 3rem);
  --_checkbox-box-size: 1.25rem; /* 20px */
  --_checkbox-icon-size: 1rem; /* 16px */
}

.root[data-size="2xl"] {
  --_checkbox-target: var(--control-height-2xl, 3.5rem);
  --_checkbox-box-size: 1.5rem; /* 24px */
  --_checkbox-icon-size: 1.125rem; /* 18px */
}

/* Touch-Target Policy (Separate Valid CSS Rules) */
.root[data-touch-target="comfortable"] {
  min-inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  min-block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"] {
    min-inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    min-block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    inline-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
    block-size: max(var(--_checkbox-target), var(--control-touch-target-min, 3rem));
  }
}

/* Native Input (Occupies 100% of the Real Hitbox Target) */
.input {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  box-sizing: border-box;
}

/* Visible Indicator Box */
.indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_checkbox-box-size);
  block-size: var(--_checkbox-box-size);
  border-radius: var(--_checkbox-radius);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-control);
  box-sizing: border-box;
  pointer-events: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);
}

/* Hover State (Stable Border Principle) */
.input:hover:not(:disabled) + .indicator {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-control); /* Stable border! */
}

/* Focus-Visible Outline (Immediate 0ms Ring) */
.input:focus-visible + .indicator {
  outline: var(--focus-ring-width, 2px) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset, 2px);
}

/* Checked & Indeterminate Active State */
.input:checked + .indicator,
.input:indeterminate + .indicator {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-primary-foreground);
}

.input:checked:hover:not(:disabled) + .indicator,
.input:indeterminate:hover:not(:disabled) + .indicator {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Icon Glyph Containers */
.iconCheck,
.iconMinus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_checkbox-icon-size);
  block-size: var(--_checkbox-icon-size);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-fast) var(--motion-ease-enter);
}

.iconCheck svg,
.iconMinus svg {
  inline-size: var(--_checkbox-icon-size);
  block-size: var(--_checkbox-icon-size);
}

/* Native Checked Display */
.input:checked + .indicator .iconCheck {
  opacity: 1;
}

/* Native Indeterminate Display (Cascade Priority Over Checked) */
.input:indeterminate + .indicator .iconCheck {
  opacity: 0;
}

.input:indeterminate + .indicator .iconMinus {
  opacity: 1;
}

/* Invalid State (aria-invalid="true") */
.input[aria-invalid="true"]:not(:checked):not(:indeterminate) + .indicator {
  border-color: var(--color-danger);
}

.input[aria-invalid="true"]:checked + .indicator,
.input[aria-invalid="true"]:indeterminate + .indicator {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--color-danger-foreground);
}

/* Specificity Rule: Invalid Hover Must Maintain Danger Styling */
.input[aria-invalid="true"]:hover:not(:disabled) + .indicator,
.input[aria-invalid="true"]:checked:hover:not(:disabled) + .indicator,
.input[aria-invalid="true"]:indeterminate:hover:not(:disabled) + .indicator {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: var(--color-danger-foreground);
}

.input[aria-invalid="true"]:focus-visible + .indicator {
  outline-color: var(--color-danger);
}

/* Disabled State (Highest Specificity Precedence) */
.input:disabled {
  cursor: not-allowed;
}

.input:disabled + .indicator,
.input:disabled:hover + .indicator,
.input[aria-invalid="true"]:disabled + .indicator,
.input[aria-invalid="true"]:disabled:hover + .indicator {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
  outline: none;
}

/* Disabled Checked/Indeterminate Maintains Mark with Disabled Foreground */
.input:disabled:checked + .indicator,
.input:disabled:indeterminate + .indicator {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
}

/* Reduced Motion Guarantee */
@media (prefers-reduced-motion: reduce) {
  .indicator,
  .iconCheck,
  .iconMinus {
    transition: none;
  }
}

/* Forced Colors Mode (High Contrast Accessibility) */
@media (forced-colors: active) {
  .indicator {
    forced-color-adjust: none;
    background-color: Canvas;
    border-color: CanvasText;
    color: CanvasText;
  }

  .input:checked + .indicator,
  .input:indeterminate + .indicator {
    background-color: Highlight;
    border-color: Highlight;
    color: HighlightText;
  }

  .input:focus-visible + .indicator {
    outline-color: Highlight;
  }

  .input:disabled + .indicator {
    background-color: Canvas;
    border-color: GrayText;
    color: GrayText;
  }
}
```

### 12.3 `index.ts`

```typescript
export { Checkbox } from './checkbox';
export type { CheckboxProps } from './checkbox';
```

---

## 13. Demonstration Gallery Specifications (`/gallery/checkbox`)

The demonstration gallery in both starters showcases complete real-world scenarios:
1. **Overview & Product Default Sizing**: Single checkbox with omitted size prop demonstrating Dashboard default (36px target, 16px box) vs Website default (48px target, 20px box).
2. **Six-Step Sizing Scale**: Explicit specimens `xs` through `2xl` with identical text labels.
3. **Operational States**: Unchecked resting, hover border stability, active keyboard focus-visible outline, checked, indeterminate, disabled unchecked, disabled checked, and disabled indeterminate.
4. **Interactive "Select All" Tri-State Pattern**: Parent checkbox controlling a set of 3 child options (real-time indeterminate calculation).
5. **Validation & Error Relationships**: Associated description and error text linked via `aria-describedby` with `aria-invalid="true"` danger styling and invalid-hover verification.
6. **Controlled vs. Uncontrolled**: Controlled React state tracking alongside native uncontrolled form reset.
7. **Localization & RTL Parity**:
   - Arabic layout (`lang="ar" dir="rtl"`) demonstrating natural inline-start alignment and diacritic clearance.
   - Mixed-script technical specimen (`dir="ltr"`) containing tracking IDs or code terms.
8. **Theme Parity**: Light and Dark theme verification with zero dashboard shadows.
9. **Form Lifecycle & Reset**: Interactive signup form with validation, submission announcement, and reset cancellation.

---

## 14. Testing & Acceptance Matrix

### 14.1 Vitest Unit Tests (`src/components/ui/checkbox/checkbox.test.tsx`)
- [ ] Renders native `<input type="checkbox">` with omitted size attribute.
- [ ] Renders explicit `data-size` across all six scale steps (`xs` through `2xl`).
- [ ] Defaults `touchTarget` to `"auto"` and supports `"comfortable"`.
- [ ] Supports controlled state via `checked` and emits `onChange` when clicked.
- [ ] Supports uncontrolled initial state via `defaultChecked`.
- [ ] Synchronizes `indeterminate` DOM property.
- [ ] Forwards ref directly to native `HTMLInputElement`.
- [ ] Suppresses events and pointer changes when `disabled`.
- [ ] Supports `aria-invalid="true"` and forwards `aria-describedby` IDs.
- [ ] Supports keyboard toggle via `Space` key.
- [ ] Correctly participates in native form submit and form reset lifecycles.
- [ ] Clicking associated `<label htmlFor>` toggles state exactly once.

### 14.2 Playwright Browser Tests (`e2e/checkbox.spec.ts`)
- [ ] **Target Dimensions**: Verifies rendered target box matches scale tokens (36px Dashboard default, 48px Website default) and indicator box matches (16px / 20px).
- [ ] **Real Hitbox Edge-Click**: Clicking near the boundary of the 36px/48px interaction target reliably toggles the checkbox.
- [ ] **Hover & Focus Precedence**:
  - Resting border is `--color-border-control`.
  - Hover border remains stable at `--color-border-control`.
  - Focus indicates outline at `--color-border-focus`.
  - Pointer exit while focused retains `--color-border-focus`.
  - Blur restores stable resting border.
- [ ] **Validation Precedence**: `aria-invalid="true"` renders `--color-danger` consistently across resting, hover, focus, and pointer exit.
- [ ] **Combined States**: Disabled + checked and disabled + indeterminate maintain disabled tokens while clearly communicating selection state.
- [ ] **Arabic Alignment**: In RTL mode, checkbox is positioned on the inline-start (right) side of the label with aligned baseline.
- [ ] **Indeterminate Tri-State Behavior**: Clicking an indeterminate checkbox transitions to checked state and removes indeterminate property.

---

## 15. 10-Gate Release Acceptance Checklist

- [ ] **1. Pure UI Boundary:** Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries; zero hardcoded copy.
- [ ] **2. React 19 Ref:** Types use `ComponentPropsWithoutRef<'input'>` and forward ref directly to `HTMLInputElement`.
- [ ] **3. Logical CSS:** 100% logical properties (`inline-size`, `block-size`, `margin-inline`, `padding-inline`, `inset-inline-*`).
- [ ] **4. Control Sizing & Tokens:** Consumes `ControlSizingProps`, `--control-*-default`, and semantic color/radius tokens.
- [ ] **5. Dashboard Shadow Ban:** 100% shadow-free (`node scripts/check-dashboard-shadows.mjs` exits 0).
- [ ] **6. Reduced Motion:** Transition timing collapses under `@media (prefers-reduced-motion: reduce)` without gating component logic.
- [ ] **7. Keyboard & Accessibility:** Visible focus outline (`:focus-visible`), native indeterminate synchronization, full `Space` key support.
- [ ] **8. Canonical Synchronization:** Author in `dashboard/src` and sync cleanly to `website/src` (`node scripts/sync-shared.mjs --check` exits 0).
- [ ] **9. Quality Gates:** `tsc --noEmit`, `oxlint`, and Vitest test suites pass with code 0 across all kit starters.
- [ ] **10. Browser Acceptance:** Verified across Chromium Desktop and Mobile Viewport (390px) projects.

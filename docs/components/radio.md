# Radio — Component Specification & Implementation Reference

> **Document Status:** Draft / Proposed Implementation Specification (Reviewed Baseline Aligned with `radio2.md`)  
> **Applies to:** Core UI Primitive (`components/ui/radio`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/radio/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/radio/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md) · [Button Specification](./button.md) · [Input Specification](./input.md) · [Textarea Specification](./textarea.md) · [Checkbox Specification](./checkbox.md)

---

## 1. Executive Summary & Objective

The `Radio` primitive represents a single mutually exclusive selection option within a native radio group. Unlike multi-selection controls such as `Checkbox`, radio buttons sharing a common `name` attribute ensure that selecting any one option automatically deselects all other options in that group.

Within the White Label UI Kit, `Radio` preserves 100% browser-native `<input type="radio">` semantics, keyboard navigation lifecycles, and form participation. It delivers strict white-label token adherence, a real touch-target hitbox, circular geometry, stable hover borders, and zero-drift cross-starter synchronization without introducing premature abstraction layers.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        RADIO ARCHETYPE SUMMARY                         │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Native-Only Foundation: Single <Radio> primitive, native grouping  │
│  3. Native Input Authority: Native <input type="radio"> drives DOM     │
│  4. Ref Forwarding: Forwards ref directly to HTMLInputElement          │
│  5. Target vs. Indicator: Target (36px/48px) decoupled from circle     │
│  6. Real Hitbox Target: Native input occupies 100% of the target area  │
│  7. CSS-Only Dot Presentation: 50% diameter, opacity-only transition   │
│  8. Circular Geometry: Full border-radius (--radius-full) on ring & dot│
│  9. Specificity-Safe Precedence: Disabled > Invalid > Checked > Hover  │
│ 10. Foreground Tokens: --color-primary-foreground & danger-foreground  │
│ 11. No Speculative ReadOnly: Follows native radio HTML semantics       │
│ 12. Valid Media Syntax: Separate @media blocks for coarse pointers     │
│ 13. Native Keyboard: Browser-native Arrow, Space, Tab, and RTL         │
│ 14. Zero Scale/Bounce Motion: Opacity-only (0ms on reduced motion)     │
│ 15. Forced-Colors Ready: System color tokens for high-contrast mode    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Scope Boundaries (Deliver in this Phase)

- **Pure Native Primitive**: Deliver `components/ui/radio/` comprising `radio.tsx`, `radio.module.css`, `radio.test.tsx`, and `index.ts`.
- **Real interaction target**: The structural root container defines the interaction area (e.g. 36×36px Dashboard, 48×48px Website), and the transparent native `<input type="radio">` spans the entire area (`inset: 0`, 100% width/height) to guarantee reliable activation without pseudo-element hit-testing bugs.
- **Circular indicator box**: The visible circular indicator is centered inside the interaction target and scales strictly with the approved `--control-icon-size-*` token scale (`14px` xs → `16px` sm/md → `18px` lg → `20px` xl → `24px` 2xl).
- **Proportional 50% dot**: The inner circular dot is exactly 50% of the visible circle's diameter (`7px` xs, `8px` sm/md, `9px` lg, `10px` xl, `12px` 2xl), derived directly via CSS `calc(var(--_radio-box-size) * 0.5)` so that product defaults (`md` vs `xl`) retain full geometry parity automatically.
- **Motion discipline**: Dot reveal uses opacity and color transitions only—**zero scale, bounce, or slide animations**. Transitions collapse to 0ms under `prefers-reduced-motion: reduce`.
- **Native field composition**: Grouping is achieved using native web standards: shared `name` attributes, `<fieldset>`, `<legend>`, and external `<label htmlFor={id}>`.
- **Touch-target policy**: Automatically expands to at least 48×48px (`--control-touch-target-min: 3rem`) on coarse pointer devices and under `touchTarget="comfortable"`, while preserving larger explicit sizes (e.g. 56×56px `2xl`).
- **Connected gallery & routes**: Connected `components/patterns/radio-gallery/` wired to `/gallery/radio` in Dashboard and Website with full EN/FR/AR localization.

### 1.2 Explicit Non-Goals & Deferred Scope

The following are strictly excluded from this implementation:
- **No stateful `RadioGroup` or React Context component**: Explicitly deferred. Native `<input type="radio" name="...">` already provides robust grouping, mutual exclusivity, and form binding natively.
- **No custom arrow-key navigation or roving-tabindex JavaScript**: Native radio buttons handle arrow cycling and Tab navigation out of the box in all browsers. No manual key interception, synthetic tabindex manipulation, or manual RTL arrow inversion scripts.
- **No integrated labels, descriptions, or error messages inside the primitive**: Labels and descriptions are associated externally via `<label htmlFor={id}>` and `aria-describedby`.
- **No multi-selection behavior**: Multi-selection belongs strictly to `Checkbox`.
- **No toggle-switch behavior**: Immediate binary actions belong to `Switch` (`role="switch"`).
- **No speculative `readOnly` prop**: In HTML, radio buttons do not support a read-only state.
- **No segmented button controls or selectable cards**: Card-based option selectors belong to compound pattern components.
- **No form libraries, schema validation, or persistence**: React Hook Form, Formik, and Zod plug in cleanly via standard native props (`name`, `value`, `checked`, `onChange`, `onBlur`, `ref`).

---

## 2. Inviolable Architectural Boundaries

### 2.1 The Four-Tier Architecture

Responsibility flows strictly downwards:

| Layer | Path | Allowed Dependencies | Forbidden Dependencies | Responsibility |
| :--- | :--- | :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/radio/` | `react`, `@/lib/cn`, `./*.module.css`, `../control-sizing` | `@/providers`, `@/i18n`, `next/*`, external state/form/query libs, hardcoded English copy | Native `<input type="radio">`, circular indicator presentation, control sizing, native ref forwarding |
| **2. Field Composition** | `src/components/patterns/` | Layer 1 + Layout contexts | `next/*`, direct DOM mutations | Semantic `<fieldset>` / `<legend>`, label association (`<label htmlFor>`), helper/error ARIA linkages (`aria-describedby`) |
| **3. Connected Pattern** | `src/components/patterns/` | Layers 1–2 + `@/providers` (`useI18n`, `useTheme`), `@/i18n` (`BidiText`) | `next/*`, dashboard shadows | Localized text (`t()`), bidi isolation, settings/preference groups, billing frequency selection |
| **4. Host Application** | `src/app/`, `src/` | All layers + `next/navigation`, `next/link` | Top-level client boundaries on server layouts | Form submission, server mutations, database persistence |

### 2.2 Canonical Source Ownership & Synchronization

`Radio` is authored canonically in `typescript/nextjs/starterkit/dashboard/src/components/ui/radio/`.
- Shared code is mirrored to `typescript/nextjs/starterkit/website/src/components/ui/radio/` and `typescript/vite/starterkit/dashboard/src/components/ui/radio/`.
- Author changes in Dashboard only, then run:
  ```bash
  node scripts/sync-shared.mjs
  node scripts/sync-shared.mjs --check
  ```

---

## 3. Public API & Prop Interface

### 3.1 `RadioProps` Interface

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface RadioProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {}
```

### 3.2 Property Contract Table

| Property | Type | Default Value | Contract |
| :--- | :--- | :--- | :--- |
| `type` | `'radio'` | `'radio'` (locked) | Native HTML radio input type |
| `size` | `ControlSize` | `undefined` (omitted) | Consumes product preset default alias via CSS (`md` in Dashboard, `xl` in Website) |
| `touchTarget` | `'auto' \| 'comfortable'` | `'auto'` | Enforces 48×48px minimum interaction area on coarse pointer devices |
| `checked` | `boolean` | `undefined` | Caller-controlled selection state |
| `defaultChecked` | `boolean` | `undefined` | Native uncontrolled initial selection state |
| `name` | `string` | `undefined` | Shared name grouping mutually exclusive options |
| `value` | `string \| number` | `undefined` | Explicit option value submitted with the form |
| `disabled` | `boolean` | `false` | Native disabled state; suppresses events and pointer interaction |
| `required` | `boolean` | `false` | Native radio-group constraint validation |
| `ref` | `Ref<HTMLInputElement>` | Direct | Forwards directly to native `HTMLInputElement` |

### 3.3 Attribute Destinations

In accordance with Kit primitive conventions:
- **Root Element (`<span className={styles.root}>`)**: Receives `className`, `style`, `data-size`, and `data-touch-target`.
- **Native Input (`<input type="radio">`)**: Receives `id`, `name`, `value`, `checked`, `defaultChecked`, `disabled`, `required`, event handlers (`onChange`, `onFocus`, `onBlur`), ARIA attributes (`aria-describedby`, `aria-invalid`), and consumer test identifiers (`data-testid`).
- **Decorative Indicator (`<span className={styles.indicator}>`)**: Receives `aria-hidden="true"`, with `pointer-events: none`.
- **No Redundant Attributes**: Do not add redundant `role="radio"` or `aria-checked` to the native input element.

---

## 4. Native Interaction & State Contract

### 4.1 Controlled & Uncontrolled Usage

1. **Uncontrolled Grouping with Native `<fieldset>`**:
   ```tsx
   <fieldset className={styles.fieldset}>
     <legend className={styles.legend}>{t('common.radioGallery.planLegend')}</legend>
     <div className={styles.fieldRow}>
       <Radio id="plan-monthly" name="billing-plan" value="monthly" defaultChecked />
       <label htmlFor="plan-monthly">{t('common.radioGallery.monthlyLabel')}</label>
     </div>
     <div className={styles.fieldRow}>
       <Radio id="plan-annual" name="billing-plan" value="annual" />
       <label htmlFor="plan-annual">{t('common.radioGallery.annualLabel')}</label>
     </div>
   </fieldset>
   ```

2. **Controlled Selection Derived by Caller**:
   ```tsx
   const [selectedPlan, setSelectedPlan] = useState('monthly');

   <fieldset className={styles.fieldset}>
     <legend className={styles.legend}>{t('common.radioGallery.planLegend')}</legend>
     <div className={styles.fieldRow}>
       <Radio
         id="plan-monthly"
         name="billing-plan"
         value="monthly"
         checked={selectedPlan === 'monthly'}
         onChange={(e) => setSelectedPlan(e.target.value)}
       />
       <label htmlFor="plan-monthly">{t('common.radioGallery.monthlyLabel')}</label>
     </div>
     <div className={styles.fieldRow}>
       <Radio
         id="plan-annual"
         name="billing-plan"
         value="annual"
         checked={selectedPlan === 'annual'}
         onChange={(e) => setSelectedPlan(e.target.value)}
       />
       <label htmlFor="plan-annual">{t('common.radioGallery.annualLabel')}</label>
     </div>
   </fieldset>
   ```

### 4.2 Browser-Native Keyboard Navigation

Radio button keyboard navigation is handled 100% natively by the browser engine:
- **`Tab`**: Enters the group by focusing the checked option. If no option is selected, moves focus into the group according to standard browser heuristics. When moving focus out of the group, `Tab` advances to the next interactive control on the page.
- **`Shift + Tab`**: Moves focus backwards into the group, or exits the group backwards to the preceding interactive control.
- **Arrow Keys (`ArrowDown`, `ArrowRight`, `ArrowUp`, `ArrowLeft`)**: Move focus to and select adjacent enabled options within the group according to native browser arrow navigation rules.
- **`Space`**: Selects the currently focused unselected radio button.
- **`Enter`**: Does **not** select or toggle radio buttons (submits the form if inside a `<form>`).
- **Disabled Options**: Native disabled options are skipped during arrow navigation and cannot be activated via keyboard.
- **Zero Custom Interception**: Do not intercept arrow keys or impose artificial JavaScript tabindex loops. Test native browser behavior directly across browsers and directions without hardcoded assumptions.

---

## 5. Sizing: Interaction Target vs. Visible Indicator

### 5.1 Six-Step Sizing Metric Scale

Dimensions represent minimum border-box measurements adhering strictly to the local token scale:

| Density Size | Interaction Target (`inline-size` × `block-size`) | Indicator Outer Circle (`_radio-box-size`) | Inner Dot (50% Outer Diameter) | Border Radius |
| :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `28px` (`var(--control-height-xs, 1.75rem)`) | `14px` (`var(--control-icon-size-xs, 0.875rem)`) | `7px` (`0.4375rem`) | `var(--radius-full)` |
| **`sm`** | `32px` (`var(--control-height-sm, 2rem)`) | `16px` (`var(--control-icon-size-sm, 1rem)`) | `8px` (`0.5rem`) | `var(--radius-full)` |
| **`md`** *(Dash Default)* | `36px` (`var(--control-height-md, 2.25rem)`) | `16px` (`var(--control-icon-size-md, 1rem)`) | `8px` (`0.5rem`) | `var(--radius-full)` |
| **`lg`** | `40px` (`var(--control-height-lg, 2.5rem)`) | `18px` (`var(--control-icon-size-lg, 1.125rem)`) | `9px` (`0.5625rem`) | `var(--radius-full)` |
| **`xl`** *(Web Default)* | `48px` (`var(--control-height-xl, 3rem)`) | `20px` (`var(--control-icon-size-xl, 1.25rem)`) | `10px` (`0.625rem`) | `var(--radius-full)` |
| **`2xl`** | `56px` (`var(--control-height-2xl, 3.5rem)`) | `24px` (`var(--control-icon-size-2xl, 1.5rem)`) | `12px` (`0.75rem`) | `var(--radius-full)` |

### 5.2 Product-Owned Default Presets & Dot Derivation

1. **Calculated Dot Size**:
   ```css
   --_radio-dot-size: calc(var(--_radio-box-size) * 0.5);
   ```
   By calculating the dot diameter as 50% of `--_radio-box-size`, product presets automatically maintain geometry parity:
   - **Dashboard**: Omitted size resolves to `md` (`36px` target, `16px` circle, `8px` dot).
   - **Website**: Omitted size resolves to `xl` (`48px` target, `20px` circle, `10px` dot). Explicit `size="xl"` matches omitted size across target, circle, dot, and alignment.
2. **Dashboard Shadow-Free Rule**:
   - 100% shadow-free depth achieved strictly via semantic surface tokens and border contrast.

### 5.3 Real Input-Sized Interaction Hitbox

To prevent click-interception defects, no pseudo-element hitboxes are used. The native input completely fills the root interaction target:
```css
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
```

### 5.4 Valid Media-Query Touch-Target Policy

Coarse-pointer target enlargement is separated into valid CSS rules:
```css
.root[data-touch-target="comfortable"] {
  min-inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  min-block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"] {
    min-inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    min-block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  }
}
```

---

## 6. Visual States & Specificity-Safe Precedence

### 6.1 State Detail Table

| State | Outer Circle Background | Outer Circle Border | Inner Dot (`.dot`) | Outline (`:focus-visible`) |
| :--- | :--- | :--- | :--- | :--- |
| **Unchecked Resting** | `var(--color-surface)` | `1px solid var(--color-border-control)` | `opacity: 0` | `none` |
| **Unchecked Hover** | `var(--color-surface-hover)` | `1px solid var(--color-border-control)` *(stable!)* | `opacity: 0` | `none` |
| **Checked Resting** | `var(--color-primary)` | `1px solid var(--color-primary)` | `opacity: 1; background: var(--color-primary-foreground)` | `none` |
| **Checked Hover** | `var(--color-primary-hover)` | `1px solid var(--color-primary-hover)` | `opacity: 1; background: var(--color-primary-foreground)` | `none` |
| **Focus-Visible** | Inherits state background | Inherits state border | Inherits state dot | `var(--focus-ring-width, 2px) solid var(--color-border-focus)` (`offset: 2px`) |
| **Invalid Unchecked** | `var(--color-surface)` | `1px solid var(--color-danger)` | `opacity: 0` | `outline-color: var(--color-danger)` |
| **Invalid Checked** | `var(--color-danger)` | `1px solid var(--color-danger)` | `opacity: 1; background: var(--color-danger-foreground)` | `outline-color: var(--color-danger)` |
| **Invalid Hover (Unchecked)** | `var(--color-surface-hover)` | `1px solid var(--color-danger)` | `opacity: 0` | `none` |
| **Invalid Hover (Checked)** | `var(--color-danger)` | `1px solid var(--color-danger)` | `opacity: 1; background: var(--color-danger-foreground)` | `none` |
| **Disabled Unchecked** | `var(--color-control-disabled-bg)` | `1px solid var(--color-border-disabled)` | `opacity: 0` | `none` |
| **Disabled Checked** | `var(--color-control-disabled-bg)` | `1px solid var(--color-border-disabled)` | `opacity: 1; background: var(--color-text-disabled)` | `none` |

### 6.2 Specificity-Safe Precedence Rules

To prevent CSS specificity inversions:
1. **Disabled wins unconditionally**: `.input:disabled + .indicator` overrides all invalid, hover, and checked rules.
2. **Invalid checked preserves danger**: Hovering an invalid checked radio maintains danger background and border; it never reverts to primary hover.
3. **Invalid unchecked preserves surface**: Hovering an invalid unchecked radio maintains surface hover and danger border; it never fills with danger red while unchecked.
4. **Stable border principle**: Ordinary hover on unchecked inputs changes background to `--color-surface-hover` while keeping `--color-border-control` intact to prevent visual border jitter.
5. **No scale or bounce motion**: Dot appearance uses opacity transition only (`opacity var(--motion-duration-fast) var(--motion-ease-standard)`), collapsing to 0ms under reduced motion.

---

## 7. Forced-Colors Mode (High Contrast Accessibility)

In `@media (forced-colors: active)`, system colors take precedence:

```css
@media (forced-colors: active) {
  .indicator {
    forced-color-adjust: none;
    background-color: Canvas;
    border-color: CanvasText;
    color: CanvasText;
  }

  /* Unchecked resting and hover (not disabled) */
  .input:not(:checked):not(:disabled) + .indicator,
  .input:not(:checked):hover:not(:disabled) + .indicator {
    background-color: Canvas;
    border-color: CanvasText;
  }

  /* Checked resting and hover (valid or invalid, not disabled) */
  .input:checked:not(:disabled) + .indicator,
  .input:checked:hover:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:checked:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:checked:hover:not(:disabled) + .indicator {
    background-color: Highlight;
    border-color: Highlight;
  }

  .input:checked:not(:disabled) + .indicator .dot,
  .input[aria-invalid="true"]:checked:not(:disabled) + .indicator .dot {
    background-color: HighlightText;
  }

  /* Invalid unchecked resting and hover (not disabled) */
  .input[aria-invalid="true"]:not(:checked):not(:disabled) + .indicator,
  .input[aria-invalid="true"]:not(:checked):hover:not(:disabled) + .indicator {
    background-color: Canvas;
    border-color: Highlight;
  }

  /* Focus visible outline */
  .input:focus-visible:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:focus-visible:not(:disabled) + .indicator {
    outline-color: Highlight;
  }

  /* Disabled State: Highest Precedence (GrayText Always Wins) */
  .input:disabled + .indicator,
  .input:disabled:hover + .indicator,
  .input:disabled:checked + .indicator,
  .input:disabled:checked:hover + .indicator,
  .input[aria-invalid="true"]:disabled + .indicator,
  .input[aria-invalid="true"]:disabled:hover + .indicator,
  .input[aria-invalid="true"]:disabled:checked + .indicator,
  .input[aria-invalid="true"]:disabled:checked:hover + .indicator,
  .input[aria-invalid="true"]:disabled:not(:checked) + .indicator,
  .input[aria-invalid="true"]:disabled:not(:checked):hover + .indicator {
    background-color: Canvas;
    border-color: GrayText;
    outline: none;
  }

  .input:disabled:checked + .indicator .dot,
  .input[aria-invalid="true"]:disabled:checked + .indicator .dot {
    background-color: GrayText;
  }
}
```

---

## 8. Accessible Field Composition & Form Lifecycles

### 8.1 Accessible Label Association & Grouping

Every radio button must be labeled externally:
```tsx
const groupId = useId();
const emailId = `${groupId}-email`;
const smsId = `${groupId}-sms`;
const helpId = `${groupId}-help`;

<fieldset className={styles.fieldset} aria-describedby={helpId}>
  <legend className={styles.legend}>
    {t('common.radioGallery.channelLegend')}
  </legend>

  <div className={styles.optionRow}>
    <Radio
      id={emailId}
      name={`${groupId}-channel`}
      value="email"
      defaultChecked
    />
    <label htmlFor={emailId} className={styles.label}>
      {t('common.radioGallery.emailLabel')}
    </label>
  </div>

  <div className={styles.optionRow}>
    <Radio
      id={smsId}
      name={`${groupId}-channel`}
      value="sms"
    />
    <label htmlFor={smsId} className={styles.label}>
      {t('common.radioGallery.smsLabel')}
    </label>
  </div>

  <p id={helpId} className={styles.helpText}>
    {t('common.radioGallery.channelHelp')}
  </p>
</fieldset>
```

- **Dynamic IDs**: Reusable gallery instances generate dynamic IDs via `useId()` to prevent duplicate DOM IDs.
- **Separate Groups**: Unrelated groups use distinct `name` attributes.
- **Validation Distinction**: Native `required` constraint validation is distinct from application-driven `aria-invalid="true"`. Untouched required groups do not show red danger borders merely because `:invalid` matches natively.

### 8.2 Form Lifecycle & Submission Rules

- Only the **selected, enabled, named** radio option in a group is submitted in `FormData`.
- If no option is selected in an optional group, no entry is appended to `FormData`.
- Disabled radio buttons are omitted from `FormData`, even if checked.
- `HTMLFormElement.reset()` restores all radio buttons to their initial `defaultChecked` values.
- In controlled forms, the caller must handle form reset explicitly by restoring the controlled state.
- Form demos must cancel pending submission timers on reset or component unmount.

---

## 9. RTL & Internationalization Architecture

- **100% Logical CSS Properties**: `inline-size`, `block-size`, `min-inline-size`, `min-block-size`, `margin-inline`, `padding-inline`, `border-radius`. Zero physical left/right properties.
- **Natural Inline Alignment**: In both LTR and RTL documents, `Radio` sits at `inline-start` relative to its label. Option rows follow the inherited document direction.
- **Symmetric Circular Geometry**: Circles are inherently direction-neutral and must **not** be flipped or mirrored under `dir="rtl"`.
- **Arabic Script Clearance**: Labels associated with `Radio` consume the design kit's line-height clearance to prevent diacritic (Tashkeel) truncation.
- **Bidi Text Isolation**: Technical identifiers (e.g. `TRK-984210-X`, SKU codes, phone numbers) are wrapped in `<BidiText dir="ltr">`.

---

## 10. Proposed Source Implementation Contract

### 10.1 `radio.tsx`

```tsx
import {
  type ComponentPropsWithoutRef,
  forwardRef,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './radio.module.css';

export interface RadioProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
  {
    size,
    touchTarget = 'auto',
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
        type="radio"
        disabled={disabled}
        className={styles.input}
      />
      <span className={styles.indicator} aria-hidden="true">
        <span className={styles.dot} />
      </span>
    </span>
  );
});

Radio.displayName = 'Radio';
```

### 10.2 `radio.module.css`

```css
/*
 * Radio Component Stylesheet
 * 100% Logical CSS Properties, Zero Dashboard Shadows.
 */

.root {
  /* Default density aliases */
  --_radio-target: var(--control-height-default, 2.25rem);
  --_radio-box-size: var(--control-icon-size-default, 1rem);
  --_radio-dot-size: calc(var(--_radio-box-size) * 0.5);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_radio-target);
  block-size: var(--_radio-target);
  min-inline-size: var(--_radio-target);
  min-block-size: var(--_radio-target);
  vertical-align: middle;
  flex: none;
  box-sizing: border-box;
}

/* Six-Step Density Overrides */
.root[data-size="xs"] {
  --_radio-target: var(--control-height-xs, 1.75rem);
  --_radio-box-size: var(--control-icon-size-xs, 0.875rem); /* 14px */
}

.root[data-size="sm"] {
  --_radio-target: var(--control-height-sm, 2rem);
  --_radio-box-size: var(--control-icon-size-sm, 1rem); /* 16px */
}

.root[data-size="md"] {
  --_radio-target: var(--control-height-md, 2.25rem);
  --_radio-box-size: var(--control-icon-size-md, 1rem); /* 16px */
}

.root[data-size="lg"] {
  --_radio-target: var(--control-height-lg, 2.5rem);
  --_radio-box-size: var(--control-icon-size-lg, 1.125rem); /* 18px */
}

.root[data-size="xl"] {
  --_radio-target: var(--control-height-xl, 3rem);
  --_radio-box-size: var(--control-icon-size-xl, 1.25rem); /* 20px */
}

.root[data-size="2xl"] {
  --_radio-target: var(--control-height-2xl, 3.5rem);
  --_radio-box-size: var(--control-icon-size-2xl, 1.5rem); /* 24px */
}

/* Touch-Target Policy */
.root[data-touch-target="comfortable"] {
  min-inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  min-block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"] {
    min-inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    min-block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    inline-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
    block-size: max(var(--_radio-target), var(--control-touch-target-min, 3rem));
  }
}

/* Native Input Hitbox (Spans 100% of the Target Area) */
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

/* Visible Indicator Circle */
.indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--_radio-box-size);
  block-size: var(--_radio-box-size);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-control);
  box-sizing: border-box;
  pointer-events: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);
}

/* Inner Dot Indicator (50% Outer Diameter) */
.dot {
  inline-size: var(--_radio-dot-size);
  block-size: var(--_radio-dot-size);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-primary-foreground);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--motion-duration-fast) var(--motion-ease-standard);
}

/* Hover State (Stable Border Principle) */
.input:hover:not(:disabled) + .indicator {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-control);
}

/* Focus-Visible Outline */
.input:focus-visible + .indicator {
  outline: var(--focus-ring-width, 2px) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset, 2px);
}

/* Checked Active State */
.input:checked + .indicator {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.input:checked + .indicator .dot {
  opacity: 1;
}

.input:checked:hover:not(:disabled) + .indicator {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Invalid State */
.input[aria-invalid="true"]:not(:checked) + .indicator {
  border-color: var(--color-danger);
}

.input[aria-invalid="true"]:checked + .indicator {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}

.input[aria-invalid="true"]:checked + .indicator .dot {
  background-color: var(--color-danger-foreground);
}

.input[aria-invalid="true"]:not(:checked):hover:not(:disabled) + .indicator {
  background-color: var(--color-surface-hover);
  border-color: var(--color-danger);
}

.input[aria-invalid="true"]:checked:hover:not(:disabled) + .indicator {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}

.input[aria-invalid="true"]:focus-visible + .indicator {
  outline-color: var(--color-danger);
}

/* Disabled State */
.input:disabled {
  cursor: not-allowed;
}

.input:disabled + .indicator,
.input:disabled:hover + .indicator,
.input[aria-invalid="true"]:disabled + .indicator,
.input[aria-invalid="true"]:disabled:hover + .indicator {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  outline: none;
}

.input:disabled:checked + .indicator,
.input[aria-invalid="true"]:disabled:checked + .indicator {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
}

.input:disabled:checked + .indicator .dot,
.input[aria-invalid="true"]:disabled:checked + .indicator .dot {
  background-color: var(--color-text-disabled);
  opacity: 1;
}

/* Reduced Motion Guarantee */
@media (prefers-reduced-motion: reduce) {
  .indicator,
  .dot {
    transition: none;
  }
}

/* Forced Colors Mode */
@media (forced-colors: active) {
  .indicator {
    forced-color-adjust: none;
    background-color: Canvas;
    border-color: CanvasText;
    color: CanvasText;
  }

  /* Unchecked resting and hover (not disabled) */
  .input:not(:checked):not(:disabled) + .indicator,
  .input:not(:checked):hover:not(:disabled) + .indicator {
    background-color: Canvas;
    border-color: CanvasText;
  }

  /* Checked resting and hover (valid or invalid, not disabled) */
  .input:checked:not(:disabled) + .indicator,
  .input:checked:hover:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:checked:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:checked:hover:not(:disabled) + .indicator {
    background-color: Highlight;
    border-color: Highlight;
  }

  .input:checked:not(:disabled) + .indicator .dot,
  .input[aria-invalid="true"]:checked:not(:disabled) + .indicator .dot {
    background-color: HighlightText;
  }

  /* Invalid unchecked resting and hover (not disabled) */
  .input[aria-invalid="true"]:not(:checked):not(:disabled) + .indicator,
  .input[aria-invalid="true"]:not(:checked):hover:not(:disabled) + .indicator {
    background-color: Canvas;
    border-color: Highlight;
  }

  /* Focus visible outline */
  .input:focus-visible:not(:disabled) + .indicator,
  .input[aria-invalid="true"]:focus-visible:not(:disabled) + .indicator {
    outline-color: Highlight;
  }

  /* Disabled State: Highest Precedence (GrayText Always Wins) */
  .input:disabled + .indicator,
  .input:disabled:hover + .indicator,
  .input:disabled:checked + .indicator,
  .input:disabled:checked:hover + .indicator,
  .input[aria-invalid="true"]:disabled + .indicator,
  .input[aria-invalid="true"]:disabled:hover + .indicator,
  .input[aria-invalid="true"]:disabled:checked + .indicator,
  .input[aria-invalid="true"]:disabled:checked:hover + .indicator,
  .input[aria-invalid="true"]:disabled:not(:checked) + .indicator,
  .input[aria-invalid="true"]:disabled:not(:checked):hover + .indicator {
    background-color: Canvas;
    border-color: GrayText;
    outline: none;
  }

  .input:disabled:checked + .indicator .dot,
  .input[aria-invalid="true"]:disabled:checked + .indicator .dot {
    background-color: GrayText;
  }
}
```

### 10.3 `index.ts`

```tsx
export { Radio, type RadioProps } from './radio';
```

---

## 11. Demonstration Gallery Specifications (`/gallery/radio`)

The interactive gallery lives in `src/components/patterns/radio-gallery/` and routes at `/gallery/radio` in both Dashboard and Website.
All section titles, descriptions, options, and status messages are localized in `en`, `fr`, and `ar` message dictionaries:

1. **Overview & Product Defaults**: Demonstrates omitted `size` resolving to `md` (36px target, 16px circle, 8px dot) in Dashboard and `xl` (48px target, 20px circle, 10px dot) in Website.
2. **Six-Step Sizing Scale**: Explicit specimens from `xs` through `2xl` demonstrating target decoupling and proportional dot scaling.
3. **Controlled Group**: Caller state managing active selection and reflecting current state in text.
4. **Uncontrolled Group & Form Reset**: Native browser state tracking via `defaultChecked` with a working form reset button.
5. **Operational States & Combined Precedence**:
   - Unchecked resting, unchecked hover, checked resting, checked hover, disabled unchecked, disabled checked.
   - Combined states: Invalid + checked, Invalid + unchecked, Invalid + disabled unchecked, Invalid + disabled checked.
6. **Required Validation & Help/Error Relationships**: Native `required` group validation with helper and error text associated via `aria-describedby`.
7. **Independent Groups**: Multiple groups on the same page verifying that selecting an option in Group A does not deselect options in Group B.
8. **Localization, RTL & Long Labels**: Multi-line wrapping text, Arabic script clearance, and explicit RTL specimen.
9. **Touch Targets & Themes**: Demonstrating fine-pointer vs comfortable touch targets across light and dark themes with zero dashboard shadows.
10. **Guarded Form Simulation**: Form submission with client-side validation, duplicate submission guarding, timer cancellation on reset/unmount, and active reset during pending requests.
11. **Code Usage Snippets**: Production-ready copyable snippets.

---

## 12. Testing & Acceptance Matrix

### 12.1 Vitest Unit Tests (`src/components/ui/radio/radio.test.tsx`)

1. **Rendering & Attributes**:
   - Renders native `<input type="radio">` with `type="radio"` locked.
   - Forwards `name`, `value`, `required`, and custom HTML attributes to the native input.
   - Forwards `ref` directly to the underlying `HTMLInputElement`.
   - Structural root receives `className`, `style`, `data-size`, and `data-touch-target`.
2. **Sizing & Touch Target**:
   - Renders omitted `data-size` when prop is omitted (CSS handles preset default).
   - Renders explicit `data-size="xs|sm|md|lg|xl|2xl"`.
   - Defaults `data-touch-target="auto"` and supports `data-touch-target="comfortable"`.
3. **Controlled & Uncontrolled Selection**:
   - Uncontrolled `defaultChecked` initializes selection.
   - Controlled `checked` updates dynamically and fires `onChange`.
   - Radios sharing a `name` toggle mutually exclusive selections.
4. **Disabled Behavior**:
   - Disabled radio ignores mouse clicks and keyboard Space.
   - Does not toggle when clicking associated external `<label htmlFor>`.
5. **Keyboard Interaction**:
   - Space activates the focused radio button.
   - Enter does **not** toggle or activate the radio button.
6. **Form Lifecycles**:
   - Correctly includes only the selected, enabled radio in `FormData`.
   - Unselected groups contribute no entries to `FormData`.
   - Disabled selected radios are excluded from `FormData`.
   - `form.reset()` restores initial `defaultChecked` selections.

### 12.2 Playwright Browser Tests (`e2e/radio.spec.ts`)

1. **Real Hitbox & Edge Clicking**:
   - Radio clicks select, not toggle. Clicks at (1px, 1px) top-left corner and (w-1px, h-1px) bottom-right corner select the native input from an unselected state.
   - Subsequent clicks on an already selected radio verify that the radio remains selected and does not clear or toggle off.
2. **Sizing & Dot Parity**:
   - In Dashboard: omitted size equals explicit `size="md"` (36×36px target, 16×16px circle, 8×8px dot).
   - In Website: omitted size equals explicit `size="xl"` (48×48px target, 20×20px circle, 10×10px dot).
   - Indicator circle and dot are centered horizontally and vertically inside the interaction target.
   - Preserves explicit `2xl` sizing (56×56px target, 24×24px circle, 12×12px dot).
3. **Touch Targets (Comfortable & Coarse-Pointer)**:
   - Tests `touchTarget="comfortable"` explicitly expanding targets to at least 48×48px while preserving larger 56px targets.
   - Tests `@media (any-pointer: coarse)` expanding `touchTarget="auto"` targets to at least 48×48px.
4. **Native Group Exclusivity & Isolation**:
   - Clicking Option B selects Option B and deselects Option A within the same group.
   - Clicking options in Group 1 has zero effect on options in Group 2.
5. **Browser-Native Keyboard Navigation & Visible Focus Outline**:
   - `Tab` navigates into the group; arrow keys cycle through options.
   - Keyboard focus displays an immediate, unclipped visible focus ring (`2px solid var(--color-border-focus)`).
6. **Hover & Border Stability**:
   - Hovering unchecked radio changes background to `--color-surface-hover` while `--color-border-control` remains stable.
7. **Native Form Validation & Reset Lifecycles**:
   - Native `required` group blocks form submission when no option is selected.
   - Form submission includes only the selected, enabled radio in `FormData`.
   - `form.reset()` restores initial `defaultChecked` selections.
8. **RTL & Narrow-Layout Reflow**:
   - Tests layout alignment and natural option reflow at 320px mobile width with long wrapping text and no clipped focus rings.
9. **Forced-Colors Mode (All Single & Combined States)**:
   - Checked resting & hover: System `Highlight` background/border, `HighlightText` dot.
   - Unchecked resting & hover: `CanvasText` border, `Canvas` background.
   - Invalid + checked at rest & hover: System `Highlight` treatment.
   - Invalid + unchecked at rest & hover: System `Highlight` border, `Canvas` background.
   - Invalid + disabled (checked or unchecked): System `GrayText` border and dot (disabled wins!).
   - Resting assertions tested after pointer exit (`page.mouse.move(0, 0)`).
10. **Zero Dashboard Shadows**:
   - `node scripts/check-dashboard-shadows.mjs` verifies zero `box-shadow`, `text-shadow`, or `filter: drop-shadow` in Dashboard.

---

## 13. 10-Gate Pre-Handoff Checklist

- [ ] **Gate 1: Pure Core UI Boundary**: Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries.
- [ ] **Gate 2: Native Input Authority**: Native `<input type="radio">` spans 100% of the hitbox (`inset: 0`) and handles native form/accessibility lifecycles.
- [ ] **Gate 3: Circular Geometry & Proportional Dot**: Circle and dot consume `var(--radius-full, 9999px)`. Dot diameter is exactly 50% of the circle diameter (`calc(var(--_radio-box-size) * 0.5)`).
- [ ] **Gate 4: Six-Step Sizing Tokens**: Implements `xs` through `2xl` with product-owned defaults (`md` Dashboard, `xl` Website).
- [ ] **Gate 5: Touch-Target Policy**: Valid CSS media queries enforce 48×48px minimum target on coarse pointers.
- [ ] **Gate 6: Zero Dashboard Shadows**: `node scripts/check-dashboard-shadows.mjs` exits with code 0.
- [ ] **Gate 7: Motion Discipline**: Opacity-only transitions; zero scale/bounce animations; 0ms under `prefers-reduced-motion: reduce`.
- [ ] **Gate 8: Forced-Colors Cascade**: System `Highlight`, `CanvasText`, and `GrayText` precedence verified for all single and combined states.
- [ ] **Gate 9: Canonical Shared Sync**: Authored in Dashboard and cleanly mirrored via `node scripts/sync-shared.mjs --check`.
- [ ] **Gate 10: Complete Test Verification**: Unit tests (`vitest run`) and browser tests (`playwright test`) pass cleanly.

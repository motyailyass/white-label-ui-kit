# Select — Component specification and implementation reference

> **Status:** Proposed baseline for review
**Component:** `components/ui/select`
**Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/select/`
**Mirrors:** Next.js Website and Vite Dashboard
**Gallery:** `/gallery/select`
> 

## 1. Purpose

`Select` lets a user choose **one option from a native dropdown**.

Examples include selecting a country, language, billing cycle, or account role.

### Architectural decision

Start with a native **`<select>`**:

- Native keyboard, form, validation, and accessibility behavior.
- No custom popup, listbox, keyboard handling, or option state.
- No third-party dependency.
- Browser- or operating-system-rendered picker UI is expected and is not an injected application icon.

Searchable selects, autocomplete, multi-select, custom option rendering, and virtualized lists are **separate future components**. Do not build them into this primitive.

---

## 2. Deliverables

Author in Dashboard, then synchronize the shared source:

```
src/components/ui/select/
  select.tsx
  select.module.css
  select.test.tsx
  index.ts

src/components/patterns/select-gallery/
  select-gallery.tsx
  select-gallery.module.css
  index.ts
```

Also deliver:

- UI and patterns barrel exports.
- Dashboard and Website `/gallery/select` routes.
- EN, FR, and AR gallery dictionaries and route metadata.
- Dashboard and Website Playwright suites.
- Synchronized Website and Vite shared source.

Run:

```bash
node scripts/sync-shared.mjs
node scripts/sync-shared.mjs --check
node scripts/check-dashboard-shadows.mjs
```

Do not overwrite the product-owned control token files.

---

## 3. Public API

### 3.1 API principles

- The primitive is a **single native select element**, not a wrapper around a separate interactive control.
- Forward the ref to `HTMLSelectElement`.
- Render caller-provided native `<option>` and `<optgroup>` children.
- Support native controlled and uncontrolled usage.
- Preserve native attributes, events, form association, and ARIA relationships.
- Do not add internal selection state.
- Do not add labels, helper text, errors, or translation logic to the primitive.

### 3.2 Suggested TypeScript interface

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<'select'>,
      'size' | 'multiple' | 'value' | 'defaultValue'
    >,
    ControlSizingProps {
  value?: string | number;
  defaultValue?: string | number;

  /** This primitive is a single-selection dropdown. */
  multiple?: never;

  /** Native select elements do not support read-only behavior. */
  readOnly?: never;
}
```

The kit’s `size` is a **visual density**, not the native numeric `<select size>` attribute. Do not forward it as the native attribute: that could change the control into a listbox.

The `multiple` omission is intentional. A native multiple-selection listbox has different interaction and sizing requirements and is outside this release.

### 3.3 Prop behavior

| Prop | Behavior |
| --- | --- |
| `size` | Optional visual density: `xs` through `2xl`. Omitted uses the product default. |
| `touchTarget` | `auto` by default; `comfortable` enforces the touch minimum. |
| `value` | Controlled selected value. |
| `defaultValue` | Initial value for an uncontrolled select. |
| `onChange` | Native React change event; read `event.currentTarget.value`. |
| `name`, `form` | Native form association and submission. |
| `required`, `disabled` | Native behavior, including disabled fieldset inheritance. |
| `id` | Caller-provided ID for an external label. |
| `aria-invalid`, `aria-describedby` | Passed directly to the select. |
| `className`, `style` | Applied to the select element itself, consistent with `Input`. |
| `children` | Native `<option>` and `<optgroup>` elements. |
| `ref` | The native `HTMLSelectElement`. |

Do not introduce `options`, `selected`, `onValueChange`, `loading`, `placeholder`, or `readOnly` as new abstraction props.

### 3.4 Reference structure

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './select.module.css';

export interface SelectProps
  extends Omit<
      ComponentPropsWithoutRef<'select'>,
      'size' | 'multiple' | 'value' | 'defaultValue'
    >,
    ControlSizingProps {
  value?: string | number;
  defaultValue?: string | number;
  multiple?: never;
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

This is the intended shape, not a claim that the snippet has already passed the repository’s lint or tests. Confirm runtime filtering and TypeScript behavior during implementation.

---

## 4. Native semantics and interaction

### 4.1 Selection

- Native select state is authoritative.
- Do not add a duplicate `selected` state or synthetic `aria-selected`.
- Do not add a separate trigger button or custom popup.
- Do not set `role`, `aria-expanded`, or `aria-controls` on behalf of the native picker.
- Native option `disabled` and `<optgroup>` behavior must remain intact.
- A disabled select must not open or change through user interaction.

### 4.2 Keyboard

Preserve the browser’s native behavior for:

- Tab focus and leaving the control.
- Opening and closing the native picker.
- Arrow-key option navigation.
- Selection and type-ahead where supported by the browser and platform.

Do **not** intercept arrows, Enter, Space, Escape, or type-ahead to recreate native behavior. Test the browser behavior without assuming that every browser or operating system opens and navigates its picker identically.

### 4.3 Labels and descriptions

Labels live outside the primitive:

```tsx
const selectId = useId();
const helpId = `${selectId}-help`;

<label htmlFor={selectId}>Billing cycle</label>

<Select
  id={selectId}
  name="billingCycle"
  defaultValue="monthly"
  aria-describedby={helpId}
>
  <option value="monthly">Monthly</option>
  <option value="annual">Annual</option>
</Select>

<p id={helpId}>Choose how often you are billed.</p>
```

The accessible name must remain the field’s label, not the currently selected option.

For an error, associate the actual error ID with the select and set `aria-invalid="true"` only when the application has determined there is an error.

---

## 5. Empty choice and required validation

A native select has **no native placeholder attribute**. If a prompt is needed, the caller supplies an empty-value option:

```tsx
<Select id={id} name="country" required defaultValue="">
  <option value="">Choose a country</option>
  <option value="fr">France</option>
  <option value="ma">Morocco</option>
</Select>
```

Requirements:

- The prompt is an option, not an accessible-label replacement.
- Localize its text in connected patterns.
- Callers explicitly decide whether the empty option remains selectable after a choice. Do not hardcode that policy in the primitive.
- In the standard required single-select example, the initial empty option produces native `valueMissing`; selecting a nonempty option makes the select valid.
- An optional select may legitimately have an empty value.
- Native invalidity must not automatically paint an untouched required field red. Application error styling is driven by `aria-invalid="true"`.

Do not use `:invalid` alone for the kit’s danger styling.

---

## 6. Form behavior

The native select owns its form behavior:

- A named, enabled select contributes its selected value to `FormData`.
- A disabled select is omitted from `FormData`.
- An optional selected empty-value option contributes an empty value when it is a successful option; it is not automatically omitted.
- A required empty select blocks ordinary native form submission.
- An uncontrolled select returns to its initial selection on native form reset.
- A controlled select is restored by the caller’s React state/reset handler.

Do not add hidden inputs or custom serialization.

The gallery should demonstrate both:

1. **Actual native required-form validation**, including blocked and then successful submission.
2. **Application-driven error presentation**, with help/error relationships and no premature error.

If an asynchronous gallery submission is simulated:

- Prevent duplicate submissions.
- Keep Reset available while pending.
- Cancel pending timers on reset and unmount.
- Store status IDs, not translated strings, so changing locale updates feedback without clearing selection.

---

## 7. Sizing and product defaults

Use the existing product-owned control tokens rather than inventing a separate Select scale. Dashboard defaults to `md`; Website defaults to `xl`. [[1]](https://github.com/motyailyass/white-label-ui-kit/blob/b2d35369a8a328886ba9549d36c9eebcad4dcb0f/typescript/nextjs/starterkit/dashboard/src/styles/tokens/controls.css) [[2]](https://github.com/motyailyass/white-label-ui-kit/blob/b2d35369a8a328886ba9549d36c9eebcad4dcb0f/typescript/nextjs/starterkit/website/src/styles/tokens/controls.css)

| Size | Minimum height | Inline padding token | Font size | Line height |
| --- | --- | --- | --- | --- |
| `xs` | 28px | `--control-padding-xs` | 14px | 20px |
| `sm` | 32px | `--control-padding-sm` | 14px | 20px |
| `md` | 36px | `--control-padding-md` | 14px | 20px |
| `lg` | 40px | `--control-padding-lg` | 14px | 20px |
| `xl` | 48px | `--control-padding-xl` | 16px | 24px |
| `2xl` | 56px | `--control-padding-2xl` | 16px | 24px |

*Pixel values assume a 16px root font size.*

Use the matching `--control-padding-block-*` tokens and product default aliases.

### Default parity

When `size` is omitted:

- Dashboard/Vite must match explicit `size="md"`.
- Website must match explicit `size="xl"`.

Compare **all relevant geometry**: height, padding, typography, border, radius, and available content area—not only outer height.

### Width and touch

- Default to `inline-size: 100%` and `min-inline-size: 0`, consistent with the existing Input.
- The **native select itself** is the interaction target.
- `touchTarget="comfortable"` enforces at least 48px in both dimensions.
- `touchTarget="auto"` applies the same minimum under `@media (any-pointer: coarse)`.
- Preserve larger sizes: `2xl` remains at least 56px high.
- The containing layout must reserve the expanded control size; do not add a pseudo-element hitbox.

---

## 8. Appearance and states

### 8.1 Native picker indicator

For this first release, **retain the native browser dropdown indicator**.

- Do not use `appearance: none` merely to replace the browser arrow.
- Do not add an application-rendered arrow or another clickable trigger.
- Browser/OS differences in the arrow and open picker are acceptable.
- The application controls the closed field’s supported styling; it must not promise pixel-identical native popup options across platforms.

If a later design requires a custom indicator or popup, evaluate it separately. Any application-rendered icon must use the shared icon registry.

### 8.2 State matrix

| State | Treatment |
| --- | --- |
| Resting | Control background, neutral control border, primary text |
| Hover | Optional subtle surface change; **neutral border remains stable** |
| Focus | Immediate visible focus outline and focus border |
| Invalid | Danger border when `aria-invalid="true"` |
| Invalid + focus | Danger border and visible danger focus outline |
| Disabled | Disabled background, border, and text; no interactive hover treatment |
| Disabled + invalid | Disabled styling takes precedence |

Use the existing semantic control, border, focus, danger, disabled, radius, and transition tokens. Do not add Dashboard shadows.

**Precedence:** disabled → invalid → focus → hover → resting.

There is no read-only state. Use ordinary text or another appropriate presentation when a value must be displayed but not changed.

### 8.3 Motion

- No motion is needed for the native picker.
- Color and border transitions may follow the existing control conventions.
- Focus indication must appear immediately.
- Under `prefers-reduced-motion: reduce`, suppress nonessential transitions.

### 8.4 Forced colors

Preserve native affordances and system color behavior. Verify, at minimum:

- Enabled resting and hover.
- Focus and invalid + focus.
- Invalid at rest.
- Disabled and disabled + invalid.
- Visible text, border, focus indicator, and native dropdown affordance.

Do not assume that a CSS declaration on the closed select controls the operating-system picker. Avoid `forced-color-adjust: none` unless testing demonstrates a specific need and all relevant states remain legible.

---

## 9. Localization, RTL, and responsive behavior

- All gallery labels, descriptions, options, prompts, errors, statuses, and route metadata must resolve through EN/FR/AR dictionaries.
- Changing locale must update presentation text without resetting the user’s selected value.
- Use stable, locale-independent option values.
- Use logical CSS properties and `text-align: start`.
- Test Arabic RTL, mixed-direction option labels, and a nested LTR example.
- Use bidi isolation in surrounding application text when displaying mixed technical identifiers; do not modify user-entered values.
- Labels must wrap without clipping the control.
- At 320px and with enlarged text, the gallery must reflow without page-level horizontal clipping or hidden focus indicators.
- Long selected text may be visually constrained by the native closed control; do not claim that native popup rendering or truncation is identical across platforms.

---

## 10. Gallery sections

Create a connected `SelectGallery` with:

1. **Overview and product default** — omitted size and external label.
2. **Six-step scale** — `xs` through `2xl`, plus explicit default-parity specimens.
3. **Controlled selection** — stable values and localized state feedback.
4. **Uncontrolled selection and reset** — native `defaultValue` and reset.
5. **States** — resting, disabled, invalid, focus, and combined precedence.
6. **Required and optional examples** — native required form plus separately demonstrated accessible error relationships.
7. **Options and groups** — `<optgroup>` and disabled option.
8. **Localization and RTL** — EN/FR/AR, Arabic and nested LTR, mixed technical content.
9. **Touch and active theme** — comfortable target and active theme tokens.
10. **Form submission and reset** — `FormData`, pending state, duplicate guard, and timer cleanup.
11. **Usage snippets** — native options, label, controlled and uncontrolled examples.

The gallery must not include a fake custom popup or claim to control the OS-native picker’s appearance.

---

## 11. Verification checklist

### Component tests

- [ ]  Renders a native select and forwards an `HTMLSelectElement` ref.
- [ ]  Passes IDs, names, form association, events, and ARIA attributes to the select.
- [ ]  Supports native options, disabled options, and optgroups.
- [ ]  Supports controlled `value`/`onChange` and uncontrolled `defaultValue`.
- [ ]  Applies `data-size` and `data-touch-target`; omitted size remains omitted.
- [ ]  Does not forward a native numeric `size` attribute or enable `multiple`.
- [ ]  Rejects unsupported multiple/read-only props at the intended TypeScript boundary; verify runtime filtering.
- [ ]  External label focuses the select.
- [ ]  Disabled and disabled-fieldset behavior remains native.
- [ ]  Required empty versus selected values use native validity.
- [ ]  FormData includes the enabled selection and excludes a disabled select.
- [ ]  Uncontrolled reset restores its default; controlled reset is handled by the caller.

### Real-browser tests — Dashboard and Website

- [ ]  Native select is the actual target and responds to real pointer and keyboard interaction.
- [ ]  All six sizes and complete omitted-versus-explicit default parity.
- [ ]  `comfortable` and verified `(any-pointer: coarse)` targets; test an explicit small size in **both** products and preserve `2xl`.
- [ ]  Stable unchecked/neutral hover border and immediate visible focus.
- [ ]  Invalid, focused, disabled, and disabled + invalid precedence.
- [ ]  Forced-colors combined states, including focus and pointer exit.
- [ ]  Required form blocks submission when empty and succeeds after selection, with correct `FormData`.
- [ ]  Optional empty value and disabled-select submission behavior.
- [ ]  Native reset and controlled reset.
- [ ]  Pending reset cancellation, checked after the timer would otherwise complete.
- [ ]  EN/FR/AR copy, locale-change selection preservation, RTL and nested LTR.
- [ ]  Narrow viewports and enlarged text without horizontal clipping.

Test what is observable and supported in each browser. Do not claim that Chromium desktop/mobile emulation proves Safari, Firefox, native mobile picker, or screen-reader behavior.

### Repository gates

- [ ]  Typecheck, lint, unit suites, and builds across the three starters.
- [ ]  Dashboard and Website browser suites executed—not merely authored.
- [ ]  Shared sync check passes.
- [ ]  Dashboard shadow check passes.
- [ ]  Report the exact commit and distinguish executed checks from untested platforms.

---

## 12. Implementation boundary

**Implement native single-select only.** Keep search, multi-select, custom option content, popovers, and custom listboxes out of this release.

Once the teammate pushes it, I’ll audit the actual Select source and the outstanding Switch test-only correction together.
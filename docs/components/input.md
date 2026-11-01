# Input — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Archetype  
> **Applies to:** Core UI Primitive (`components/ui/input`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/input/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/input/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md) · [Button Specification](./button.md)

---

## 1. Objective & Scope

The `Input` primitive captures single-line textual data from the user. It represents the foundational data-entry element within the White Label UI Kit, serving as the text-entry counterpart to the `Button` primitive.

### 1.1 Scope Boundaries

The initial release focuses strictly on a **dependable, pure native `<input>` primitive** supporting browser-native text-like types:

```typescript
export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'password';
```

Supporting `type="password"` utilizes native browser masking; it does **not** bundle a visibility toggle button or password-strength meter into the primitive.

### 1.2 Explicit Exclusions (Deferred to Specialized Primitives & Patterns)
To maintain primitive purity and prevent scope creep, the following capabilities are explicitly excluded from `Input`:
- `textarea` (handled by a dedicated `Textarea` primitive).
- Number steppers and currency formatters (handled by formatted/composite controls).
- Date and time pickers (handled by `DatePicker`).
- File uploads (handled by `FileUpload`).
- Checkboxes, radio buttons, ranges, color pickers, or submit inputs.
- Autocomplete dropdowns or comboboxes (handled by `Combobox`).
- OTP and segmented inputs (handled by `InputOtp`).
- Input masking and client formatting engines.
- Clear buttons, prefix/suffix adornment slots, or search debouncing.

---

## 2. Architecture & Ownership

Responsibility flows strictly downwards:

| Layer | Path | Responsibility |
| :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/input/` | Native `<input>`, CSS Module styles, control sizing, native prop forwarding, ref forwarding |
| **2. Field Composition** | `src/components/patterns/` | Label association (`<Label>`), helper text, error text, and ARIA relationships |
| **3. Connected Pattern** | `src/components/patterns/` | Internationalization (`t()`), bidi isolation, and application integration |
| **4. Host Application** | `src/app/`, `src/` | Form submission, server validation, state management, and persistence |

### 2.1 Primitive Restrictions
The primitive contains:
- **Zero imports** from `@/providers`, `@/i18n`, `next/*`, router packages, form libraries (`react-hook-form`, `formik`), or schema validators (`zod`).
- **Zero embedded copy**: No hardcoded labels, placeholders, or English error fallbacks.
- **Zero hardcoded brands or colors**: Visual styles consume design tokens exclusively.
- **Native behavior preservation**: Pure does not mean disabling browser capabilities. Native editing, selection, caret navigation, autocomplete, spellcheck, undo/redo, and native form submission are preserved.

### 2.2 Canonical Source Ownership
`Input` is authored in `typescript/nextjs/starterkit/dashboard/src/components/ui/input/`.
- Never edit the mirrored file in `typescript/nextjs/starterkit/website/src/components/ui/input/` directly.
- The shared synchronization script mirrors files cleanly:
  ```bash
  node scripts/sync-shared.mjs
  node scripts/sync-shared.mjs --check
  ```

---

## 3. Kit Editions & Single Foundation Principle

One complete `Input` implementation serves all kit editions and starters:
- The primitive contains zero licensing checks, zero subscription flags, and zero commercial tier gating (`<Input edition="pro" />` is forbidden).
- Forking into parallel primitives (such as `FreeInput` vs `ProInput`) is strictly forbidden.
- Accessibility, error styling, Arabic RTL support, password masking, and autocomplete are non-negotiable core requirements available in all editions.

---

## 4. Public API & Prop Interface

```typescript
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'password';

export interface InputProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'size' | 'type' | 'children'
    >,
    ControlSizingProps {
  /**
   * Supported text-like HTML input type. Defaults to 'text'.
   */
  type?: InputType;
}
```

### 4.1 Native HTML `size` Collision Resolution
In native HTML, `<input size={20} />` specifies a character-width hint. In our design system, `size` represents the six-step control scale (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`).
- The native character-count `size` is omitted via `Omit<ComponentPropsWithoutRef<'input'>, 'size'>`.
- Width is controlled via layout and CSS (`inline-size: 100%`), never through character-unit counts.

### 4.2 Property Defaults

| Property | Default Value | Description |
| :--- | :--- | :--- |
| `type` | `'text'` | Standard single-line text entry |
| `size` | `undefined` (omitted) | Consumes local product preset via CSS default alias |
| `touchTarget` | `'auto'` | Expands to 48px minimum on coarse pointer devices |
| `disabled` | `false` | Native disabled behavior |
| `readOnly` | `false` | Native read-only behavior |
| `required` | `false` | Native constraint validation |
| Value | Caller-controlled | No kit-supplied default value |

### 4.3 Native Attribute Preservation & Forwarding
All standard HTML `<input>` attributes are forwarded cleanly:
- Editing & State: `value`, `defaultValue`, `onChange`, `onInput`, `onBlur`, `onFocus`, `onKeyDown`.
- Form Integration: `id`, `name`, `form`, `autoComplete`, `inputMode`.
- Constraints: `required`, `readOnly`, `disabled`, `minLength`, `maxLength`, `pattern`.
- Accessibility & Metadata: `aria-invalid`, `aria-describedby`, `aria-required`, `dir`, `lang`, `spellCheck`.
- Ref Forwarding: Forwards `ref` directly to `HTMLInputElement` (not a wrapper `div`), allowing native focus and form library integration.

---

## 5. Native Editing Contract

### 5.1 Controlled & Uncontrolled Usage
The primitive supports both React editing patterns:
- **Controlled Usage**: `<Input value={value} onChange={(e) => setValue(e.target.value)} />`. The caller owns the state. The primitive does not mirror value into redundant internal state.
- **Uncontrolled Usage**: `<Input name="username" defaultValue="admin" />`. The browser DOM owns the current value, reset behavior, and form payload.

### 5.2 Editing Discipline
- Never pass `value` and `defaultValue` simultaneously.
- Never switch between controlled and uncontrolled modes during the component lifetime.
- Do not trim, transform, or format text on each keystroke in the primitive; callers own formatting.
- Preserve caret position, text selection, undo (`Cmd+Z` / `Ctrl+Z`), redo, and native clipboard actions.
- Never block paste in password fields.
- Do not intercept or trigger submissions during IME (Input Method Editor) composition.

---

## 6. Sizing, Product Presets & Token Contracts

The UI Kit defines a universal six-step sizing scale in `src/styles/tokens/controls.css` and `src/components/ui/control-sizing.ts`.

### 6.1 Sizing Scale & Metric Table
All pixel equivalents assume a standard 16px root font size (`1rem = 16px`):

| Scale Step | Min Height (`min-block-size`) | Inline Padding (`padding-inline`) | Block Padding (`padding-block`) | Font Size (`font-size`) | Line Height (`line-height`) | Primary Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `1.75rem` (28px) | `0.50rem` (8px) | `0.1875rem` (3px) | `0.875rem` (14px) | `1.25rem` (20px) | Dense data tables, compact filter bars |
| **`sm`** | `2.00rem` (32px) | `0.75rem` (12px) | `0.3125rem` (5px) | `0.875rem` (14px) | `1.25rem` (20px) | Secondary toolbars, compact modal forms |
| **`md`** | `2.25rem` (36px) | `0.875rem` (14px) | `0.4375rem` (7px) | `0.875rem` (14px) | `1.25rem` (20px) | **Dashboard Product Default** |
| **`lg`** | `2.50rem` (40px) | `1.00rem` (16px) | `0.5625rem` (9px) | `0.875rem` (14px) | `1.25rem` (20px) | Prominent headers, search fields |
| **`xl`** | `3.00rem` (48px) | `1.25rem` (20px) | `0.6875rem` (11px) | `1.00rem` (16px) | `1.50rem` (24px) | **Website Product Default** |
| **`2xl`** | `3.50rem` (56px) | `1.50rem` (24px) | `0.9375rem` (15px) | `1.00rem` (16px) | `1.50rem` (24px) | Marketing lead-capture, hero search |

### 6.2 Product-Owned Default Alias Contract
Products own their default control density without component forks:
- **Dashboard Preset:** `--control-height-default: var(--control-height-md);` (36px, radius 6px)
- **Website Preset:** `--control-height-default: var(--control-height-xl);` (48px, radius 8px)

#### The `data-size` DOM Omission Rule
When `size` is omitted in React (`<Input placeholder="..." />`), the component renders `data-size={undefined}`, leaving the DOM attribute unset:
```html
<input class="input" type="text" data-touch-target="auto" />
```
The base CSS class `.input` binds its private scoped variables (`--_control-*`) to `var(--control-*-default)`. This guarantees:
1. Dashboard inputs render at 36px by default.
2. Website inputs render at 48px by default.
3. Explicit `size="md"` renders identically at 36px in both products.
4. Zero JavaScript runtime calculations and zero hydration layout shifts.

### 6.3 Typography & Text Resilience
- **Font Weight:** Unlike `Button` (which uses `font-weight: var(--font-weight-medium)`), `Input` uses regular body weight: `font-weight: var(--font-weight-regular)` (400).
- **Block Size Safety:** Inputs use `min-block-size: var(--_control-height)`, not fixed `height`. Under 200% font scaling, the block dimension expands to prevent character clipping.
- **Single-Line Native Scrolling:** Inputs do not wrap text onto multiple lines. Long text scrolls horizontally as native inputs do.

### 6.4 Touch-Target Policy (48×48px Minimum Target, No Pointer Interception)
The kit enforces a **48×48px minimum interaction target** (`--control-touch-target-min: 3rem`):
- `touchTarget="comfortable"`: Enforces `min-block-size: max(var(--_control-height), var(--control-touch-target-min))` and `min-inline-size: var(--control-touch-target-min)` directly on the input element.
- `touchTarget="auto"` (default): On fine pointers, visual dimensions equal scale dimensions. On coarse pointer devices (`@media (any-pointer: coarse)`), `min-block-size` and `min-inline-size` expand directly to `max(var(--_control-height), var(--control-touch-target-min))` and `var(--control-touch-target-min)`.
- **Zero Pointer Interception:** Never use pseudo-elements with `pointer-events: auto` over the input surface, as they intercept pointer clicks and block user focus.

---

## 7. Interaction & State Matrix

| State | Semantic Trigger | Background Token | Border Token | Text Token | Outline / Focus Indicator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Resting** | Editable input | `--color-control-bg` | `--color-border-control` | `--color-text-primary` | None |
| **Hover** | `:hover:not(:disabled):not(:read-only)` | `--color-control-bg` | `--color-border-control` (stable; no independent hover border emphasis) | `--color-text-primary` | None |
| **Focus** | `:focus-visible` / `:focus` | `--color-control-bg` | `--color-border-focus` | `--color-text-primary` | `var(--focus-ring-width) solid var(--color-border-focus)` with `var(--focus-ring-offset)` (0ms immediate) |
| **Invalid** | `aria-invalid="true"` | `--color-control-bg` | `--color-danger` (stable across hover) | `--color-text-primary` | Focus ring and border transition to `--color-danger` |
| **Disabled** | `disabled` / `aria-disabled="true"` | `--color-control-disabled-bg` | `--color-border-disabled` | `--color-text-disabled` | None (`cursor: not-allowed`) |
| **Read-Only** | `readOnly` / `aria-readonly="true"` | `--color-surface-subtle` | `--color-border-subtle` | `--color-text-secondary` | Focusable; subtle focus indicator |

### 7.1 Semantics: Disabled vs. Read-Only
- **Disabled (`disabled`)**: Excluded from Tab navigation, excluded from form submission, non-editable, announced as dimmed/disabled.
- **Read-Only (`readOnly`)**: Focusable in Tab navigation, selectable, copyable, submitted with the form, announced as read-only. Never set `pointer-events: none` on read-only inputs.

### 7.2 Distinguishing Native Behavior from ARIA-Only State
- **Native Constraint Validation (`:invalid`, `required`, `pattern`)**:
  - The browser blocks native form submission when a native constraint is violated.
  - Generates browser-owned tooltip notifications during form submission attempts.
- **ARIA-Only Validation (`aria-invalid="true"`)**:
  - Driven by the application/form validation state.
  - Communicates failure programmatically to assistive technology without preventing typing, editing, or form submission by itself.
  - Does not generate native browser popup bubbles.
- **Styling Alignment**:
  - Both `.input[aria-invalid='true']` and `:invalid` receive error border styling (`--color-danger`).
  - Focus indication remains fully visible when an input is invalid, ensuring keyboard users do not lose their focus indicator.
  - Error meaning is never communicated through color alone; caller-supplied error text provides programmatic and visual context.

### 7.3 Zero Dashboard Shadows
In compliance with repository architecture:
- **Dashboard:** Shadows (`box-shadow`, `drop-shadow`) are **100% prohibited**. Depth is achieved through surface backgrounds, borders, and visible focus rings.
- **Website:** Shadows are local, opt-in, and restrained via `--website-shadow-*`.

---

## 8. Labels, Help Text, Errors & Accessibility

Every input requires a meaningful accessible name. A placeholder is never a substitute for a label (WCAG 2.1 Failure F65).

### 8.1 Caller-Supplied Field Composition
The composition pattern connects `Input`, `<label>`, helper text, and error text cleanly:

```tsx
// Example of field composition pattern (caller-owned):
function FieldExample() {
  const id = React.useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  const { t } = useI18n();
  const [value, setValue] = React.useState('');
  const [hasError, setHasError] = React.useState(false);

  // Space-separated IDs link both help text and error text when applicable
  const describedBy = hasError ? `${helpId} ${errorId}` : helpId;

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.label}>
        {t('common.inputGallery.usernameLabel')}
      </label>

      <Input
        id={id}
        name="username"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        required
      />

      <p id={helpId} className={styles.helpText}>
        {t('common.inputGallery.usernameHelp')}
      </p>

      {hasError && (
        <p id={errorId} className={styles.errorText}>
          {t('common.inputGallery.usernameError')}
        </p>
      )}
    </div>
  );
}
```

### 8.2 ARIA Relationship Rules
1. **Dynamic IDs**: Reusable compositions generate IDs with `React.useId()`. The input `id` matches `<label htmlFor={id}>`.
2. **Space-Separated Describers**: `aria-describedby` cleanly combines helper text ID and error text ID.
3. **No Phantom Describers**: Never reference element IDs that do not exist in the DOM.
4. **No Automatic `role="alert"`**: Do not automatically attach `role="alert"` to every inline error; forms manage submission error summaries and notification policies.

---

## 9. RTL & Internationalization

- **Translation Purity**: Translation logic resides strictly outside the primitive.
- **Direction Inheritance**: Inputs inherit document direction (`dir="rtl"` in Arabic, `dir="ltr"` in English/French). Text aligns to `text-align: start`.
- **Deliberate Direction Handling**: Do not make blanket assumptions that all technical data is LTR. Specific fields (e.g. international phone numbers, URLs, or code inputs) may receive explicit `dir="ltr"` from the caller when appropriate.
- **Render-Time Translation**: Gallery and form statuses resolve from identifiers during render, ensuring immediate updates upon locale switching.

---

## 10. Canonical Source Code Reference

### 10.1 `input.module.css`

```css
/**
 * White Label UI Kit — Input Primitive Stylesheet
 * 100% CSS Logical Properties, Zero Dashboard Shadows.
 */

.input {
  /* Scoped private fallback bindings to product presets */
  --_control-height: var(--control-height-default);
  --_control-padding-inline: var(--control-padding-default);
  --_control-padding-block: var(--control-padding-block-default);
  --_control-font-size: var(--control-font-size-default);
  --_control-line-height: var(--control-line-height-default);

  position: relative;
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
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast);
}

/* Explicit Six-Step Scale Bindings */
.input[data-size='xs'] {
  --_control-height: var(--control-height-xs);
  --_control-padding-inline: var(--control-padding-xs);
  --_control-padding-block: var(--control-padding-block-xs);
  --_control-font-size: var(--control-font-size-xs);
  --_control-line-height: var(--control-line-height-xs);
}

.input[data-size='sm'] {
  --_control-height: var(--control-height-sm);
  --_control-padding-inline: var(--control-padding-sm);
  --_control-padding-block: var(--control-padding-block-sm);
  --_control-font-size: var(--control-font-size-sm);
  --_control-line-height: var(--control-line-height-sm);
}

.input[data-size='md'] {
  --_control-height: var(--control-height-md);
  --_control-padding-inline: var(--control-padding-md);
  --_control-padding-block: var(--control-padding-block-md);
  --_control-font-size: var(--control-font-size-md);
  --_control-line-height: var(--control-line-height-md);
}

.input[data-size='lg'] {
  --_control-height: var(--control-height-lg);
  --_control-padding-inline: var(--control-padding-lg);
  --_control-padding-block: var(--control-padding-block-lg);
  --_control-font-size: var(--control-font-size-lg);
  --_control-line-height: var(--control-line-height-lg);
}

.input[data-size='xl'] {
  --_control-height: var(--control-height-xl);
  --_control-padding-inline: var(--control-padding-xl);
  --_control-padding-block: var(--control-padding-block-xl);
  --_control-font-size: var(--control-font-size-xl);
  --_control-line-height: var(--control-line-height-xl);
}

.input[data-size='2xl'] {
  --_control-height: var(--control-height-2xl);
  --_control-padding-inline: var(--control-padding-2xl);
  --_control-padding-block: var(--control-padding-block-2xl);
  --_control-font-size: var(--control-font-size-2xl);
  --_control-line-height: var(--control-line-height-2xl);
}

/* Focus State (Immediate 0ms Visible Outline) */
.input:focus-visible,
.input:focus {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
  border-color: var(--color-border-focus);
  transition: none;
}

/* Invalid State: driven strictly by aria-invalid="true" */
.input[aria-invalid='true'] {
  border-color: var(--color-danger);
}

.input[aria-invalid='true']:focus-visible,
.input[aria-invalid='true']:focus {
  border-color: var(--color-danger);
  outline-color: var(--color-danger);
  transition: none;
}

/* Disabled State */
.input:disabled {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
  cursor: not-allowed;
}

/* Read-Only State */
.input:read-only:not(:disabled) {
  background-color: var(--color-surface-subtle);
  border-color: var(--color-border-subtle);
  color: var(--color-text-secondary);
}

/* Placeholder */
.input::placeholder {
  color: var(--color-text-placeholder);
  opacity: 1;
}

/* Touch-Target Policy (48×48px Minimum Target) */
.input[data-touch-target='comfortable'] {
  min-block-size: max(var(--_control-height), var(--control-touch-target-min));
  min-inline-size: var(--control-touch-target-min);
}

@media (any-pointer: coarse) {
  .input[data-touch-target='auto'] {
    min-block-size: max(var(--_control-height), var(--control-touch-target-min));
    min-inline-size: var(--control-touch-target-min);
  }
}
```

### 10.2 `input.tsx`

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './input.module.css';

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'password';

export interface InputProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'size' | 'type' | 'children'
    >,
    ControlSizingProps {
  type?: InputType;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    type = 'text',
    size,
    touchTarget = 'auto',
    className,
    ...props
  },
  ref,
) {
  return (
    <input
      {...props}
      ref={ref}
      type={type}
      data-size={size}
      data-touch-target={touchTarget}
      className={cn(styles.input, className)}
    />
  );
});

Input.displayName = 'Input';
```

---

## 11. Gallery Requirements (`/gallery/input`)

A dedicated gallery route (`/gallery/input`) will be created in both Dashboard and Website starters, covering 13 comprehensive sections:

1. **Overview:** Standard labelled field composition.
2. **Six-Step Sizing:** Explicit `xs`, `sm`, `md`, `lg`, `xl`, and `2xl` inputs.
3. **Product Default:** Omitted `size` input demonstrating local product presets (`36px` Dashboard vs `48px` Website).
4. **Native Types:** Demonstration of `text`, `email`, `tel`, `url`, `search`, and `password`.
5. **States:** Resting, hover, focus, disabled, read-only, required, and invalid.
6. **Help & Error Linkage:** Working examples of `aria-describedby` with helper text and error text.
7. **Controlled vs. Uncontrolled:** Side-by-side demonstration of controlled state and uncontrolled form reset.
8. **Localization:** Full English, French, and Arabic label rendering.
9. **Text Direction:** Arabic text entry and mixed-direction data entry.
10. **Theme Parity:** Verified across Light and Dark theme modes.
11. **Responsive & Touch Targets:** Fine pointer vs coarse pointer expansion.
12. **Real Form Demonstration:** Labelled input, help text, submit button, localized simulated feedback, and form reset.
13. **Code Usage Snippets:** Copyable, production-ready implementation snippets.

---

## 12. Testing & Acceptance Matrix

### 12.1 Component Unit Tests (`input.test.tsx`)
- Renders native `<input>` element with default `type="text"`.
- Omitted `size` leaves `data-size` attribute unset in DOM.
- Explicit `size="xs"` through `"2xl"` sets corresponding `data-size`.
- Touch target defaults to `auto`, accepts `comfortable`.
- Controlled and uncontrolled editing via `userEvent.type`.
- Native change, focus, and blur callbacks execute properly.
- Forwards `ref` cleanly to `HTMLInputElement`.
- Disabled input blocks focus and user typing.
- Read-only input permits focus and selection, but blocks text entry.
- `aria-invalid="true"` attaches correctly.
- Form submission includes read-only and editable inputs, but excludes disabled inputs.
- Uncontrolled form reset restores initial `defaultValue`.

### 12.2 Browser Verification Requirements (Playwright)
- Dashboard omitted size computes to minimum height `36px` (`2.25rem`).
- Website omitted size computes to minimum height `48px` (`3.00rem`).
- Explicit sizes (`xs` through `2xl`) compute identically across Dashboard and Website.
- Coarse pointer device expands minimum height to at least `48px`.
- Visual focus indicator is visible immediately (`0ms` transition delay).
- Enlarged root font (200%) expands block height without vertical character clipping.
- Arabic layout preserves logical alignment without layout distortion.

---

## 13. Release Acceptance Checklist

- [ ] **Single Pure Primitive:** One shared native `<input>`, zero edition forks.
- [ ] **Approved API:** Ref to `HTMLInputElement`, no speculative icon/adornment props.
- [ ] **Native Contract:** Controlled/uncontrolled editing, native selection, native autocomplete.
- [ ] **State Distinction:** Disabled and read-only remain semantically distinct; native constraints distinguished from ARIA-only invalid state.
- [ ] **Two-Tier Density:** Dashboard defaults to `md` (36px); Website defaults to `xl` (48px).
- [ ] **Zero Dashboard Shadows:** `node scripts/check-dashboard-shadows.mjs` exits code 0.
- [ ] **100% Logical CSS:** Zero physical CSS properties (`left`, `right`, `margin-left`).
- [ ] **48×48 Touch Target:** Both block and inline minimum dimensions enforced without pseudo-element blocks.
- [ ] **Shared Canonical Synchronization:** Mirrored cleanly with `node scripts/sync-shared.mjs --check` exiting code 0.
- [ ] **Formatting Acceptance:** `biome check` passes cleanly on all new and modified source files.
- [ ] **Build Acceptance:** Production builds (`next build` for Dashboard and Website; `vite build` for Vite Dashboard) succeed with zero errors.
- [ ] **Browser Acceptance:** Playwright tests verify geometry, touch targets, RTL alignment, and font zoom across target viewports.
- [ ] **Quality Gates:** `tsc --noEmit`, `oxlint`, and Vitest test suites pass in all starters.

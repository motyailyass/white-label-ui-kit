# Textarea — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Archetype  
> **Applies to:** Core UI Primitive (`components/ui/textarea`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/textarea/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/textarea/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md) · [Input Specification](./input.md) · [Button Specification](./button.md)

---

## 1. Objective & Scope

The `Textarea` primitive captures multi-line textual data from the user (such as descriptions, notes, feedback, support messages, and structured code or configuration snippets). It represents the multi-line data-entry counterpart to the single-line `Input` primitive within the White Label UI Kit.

### 1.1 Scope Boundaries

The release focuses strictly on a **dependable, pure native `<textarea>` primitive** following the established `Input` foundation without copying its single-line assumptions:

- Direct native `<textarea>` element without wrapper `<div>` elements.
- Bounded public contract extending native textarea attributes with the kit's six-step `ControlSizingProps`.
- Native multiline editing contract with full support for newlines (`Enter`), multiline selection, and clipboard lifecycles.
- Initial height determined natively by the `rows` attribute (defaulting to `rows={4}`), while control sizing governs **density** (font size, line height, inline padding, block padding).
- Default vertical manual resizing (`resize: vertical`), locked against horizontal blowout, while preserving resizing for `readOnly` content inspection.
- Coarse-pointer minimum 48×48px interaction target enforcement.
- Strict visual parity with `Input` and `Button`: stable borders across resting and hover states, high-visibility keyboard-focus outlines, and dedicated `aria-invalid="true"` validation styling.

### 1.2 Explicit Non-Goals & Exclusions
To maintain primitive purity and prevent scope creep, the following capabilities are explicitly excluded from `Textarea`:
- Rich-text or Markdown editing frameworks.
- Syntax highlighting or line numbering.
- Mentions, autocomplete suggestions, or tagging chips.
- Embedded character count badges, progress meters, or clear buttons (handled via caller-owned composition).
- Toolbar, icon, or action slots.
- Autosizing scripts (`scrollHeight` measurement, resize observers, `minRows` / `maxRows`).
- Client-side auto-submission or draft local storage.

---

## 2. Architecture & Ownership

Responsibility flows strictly downwards:

| Layer | Path | Responsibility |
| :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/textarea/` | Native `<textarea>`, CSS Module styles, density sizing, native prop forwarding, ref forwarding |
| **2. Field Composition** | `src/components/patterns/` | Label association (`<label htmlFor>`), helper text, error text, optional external counter, and ARIA relationships |
| **3. Connected Pattern** | `src/components/patterns/` | Internationalization (`t()`), bidi isolation, and application integration |
| **4. Host Application** | `src/app/`, `src/` | Form submission, server validation, state management, and persistence |

### 2.1 Primitive Restrictions
The primitive contains:
- **Zero imports** from `@/providers`, `@/i18n`, `next/*`, router packages, form libraries (`react-hook-form`, `formik`), or schema validators (`zod`).
- **Zero embedded copy**: No hardcoded labels, placeholders, or English error fallbacks.
- **Zero hardcoded brands or colors**: Visual styles consume design tokens exclusively.
- **Native behavior preservation**: Pure does not mean disabling browser capabilities. Native multiline editing, line breaking, selection, caret navigation, autocomplete, spellcheck, undo/redo, and native form submission are preserved.

### 2.2 Canonical Source Ownership
`Textarea` is authored in `typescript/nextjs/starterkit/dashboard/src/components/ui/textarea/`.
- Never edit the mirrored file in `typescript/nextjs/starterkit/website/src/components/ui/textarea/` directly.
- The shared synchronization script mirrors files cleanly:
  ```bash
  node scripts/sync-shared.mjs
  node scripts/sync-shared.mjs --check
  ```

---

## 3. Kit Editions & Single Foundation Principle

One complete `Textarea` implementation serves all kit editions and starters:
- The primitive contains zero licensing checks, zero subscription flags, and zero commercial tier gating (`<Textarea edition="pro" />` is forbidden).
- Forking into parallel primitives (such as `FreeTextarea` vs `ProTextarea`) is strictly forbidden.
- Accessibility, error styling, Arabic RTL support, and density controls are non-negotiable core requirements available in all editions.

---

## 4. Public API & Prop Interface

```typescript
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface TextareaProps
  extends Omit<
      ComponentPropsWithoutRef<'textarea'>,
      'children'
    >,
    ControlSizingProps {}
```

### 4.1 Property Defaults

| Property | Default Value | Description |
| :--- | :--- | :--- |
| `rows` | `4` | Agreed default visible text lines when omitted by caller |
| `size` | `undefined` (omitted) | Consumes local product preset via CSS default alias |
| `touchTarget` | `'auto'` | Expands to 48px minimum on coarse pointer devices |
| `disabled` | `false` | Native disabled behavior (disables resize) |
| `readOnly` | `false` | Native read-only behavior (preserves vertical resize for reading) |
| `required` | `false` | Native constraint validation |
| Value | Caller-controlled | No kit-supplied default value |

### 4.2 Native Attribute Preservation & Forwarding
All standard HTML `<textarea>` attributes are forwarded cleanly:
- **Editing & State:** `value`, `defaultValue`, `onChange`, `onInput`, `onBlur`, `onFocus`, `onKeyDown`.
- **Form Integration:** `id`, `name`, `form`, `autoComplete`.
- **Constraints:** `rows`, `cols`, `required`, `readOnly`, `disabled`, `minLength`, `maxLength`, `wrap`.
- **Accessibility & Metadata:** `aria-invalid`, `aria-describedby`, `aria-required`, `dir`, `lang`, `spellCheck`, `placeholder`, `autoCapitalize`.
- **Ref Forwarding:** Forwards `ref` directly to `HTMLTextAreaElement` (not a wrapper `div`), allowing native focus and form library integration.

### 4.3 Native Attribute Distinctions from Input
- Textarea does not possess a native `type` attribute.
- Textarea does **not** support the native HTML5 `pattern` attribute. Constraint validation relies on `required`, `minLength`, `maxLength`, or application validation.
- `size` represents the kit's density scale (`'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`), not a character-column count.
- Initial content is passed via `defaultValue` (uncontrolled) or `value` (controlled). Passing `children` is disallowed by the type interface.

---

## 5. Native Multiline Editing Contract

### 5.1 Controlled & Uncontrolled Usage
The primitive supports both React editing patterns:
- **Controlled Usage**: `<Textarea value={value} onChange={(e) => setValue(e.target.value)} />`. The caller owns the state. The primitive does not mirror value into redundant internal state.
- **Uncontrolled Usage**: `<Textarea name="description" defaultValue="Initial note" />`. The browser DOM owns the current value, reset behavior, and form payload.

### 5.2 Editing Discipline
- Never pass `value` and `defaultValue` simultaneously.
- Never switch between controlled and uncontrolled modes during the component lifetime.
- Do not trim, transform, or format text on each keystroke in the primitive; callers own formatting.
- Preserve caret position, multiline selection, line-break insertion (`Enter`), indentation, undo (`Cmd+Z` / `Ctrl+Z`), redo, and native clipboard actions.
- `Enter` inserts a newline; it must never be hijacked into an automatic form submit shortcut by the primitive.
- Default to native soft wrapping so long lines wrap visually without injecting artificial hard carriage returns into the submitted form data.

---

## 6. Sizing: Density is Separate from Row Count

Textarea does **not** copy Input's 36px or 48px fixed single-line height assumptions. Textarea uses the 6-step control scale strictly for **density**, while initial visible block height is governed by `rows`.

| Concern | Owner |
| :--- | :--- |
| Font size and line height | Explicit `size` or product preset default aliases |
| Inline and block padding | Explicit `size` or product preset default aliases |
| Initial visible text lines | `rows` prop (defaults to `4`) |
| Minimum touch target floor | `--control-touch-target-min: 3rem` (48px) |
| Manual block expansion | Browser-native `resize: vertical` |
| Responsive layout width | Container and `inline-size: 100%` |

### 6.1 Product-Owned Control Sizing Presets
- **Dashboard Preset (`styles/dashboard/controls.css`):** Defaults to `md` (compact density: 14px font, 20px line-height, 14px inline padding, 7px block padding).
- **Website Preset (`styles/website/controls.css`):** Defaults to `xl` (comfortable marketing density: 16px font, 24px line-height, 20px inline padding, 11px block padding).
- When `size` is omitted, `*-default` aliases resolve density tokens locally. Both starters use `rows={4}` as the default row count, yielding role-appropriate default heights.

### 6.2 Density Token Mapping

| Scale Step | Font Size Token | Line Height Token | Inline Padding Token | Block Padding Token |
| :--- | :--- | :--- | :--- | :--- |
| `xs` | `--control-font-size-xs` (14px) | `--control-line-height-xs` (20px) | `--control-padding-xs` (8px) | `--control-padding-block-xs` (3px) |
| `sm` | `--control-font-size-sm` (14px) | `--control-line-height-sm` (20px) | `--control-padding-sm` (12px) | `--control-padding-block-sm` (5px) |
| `md` *(Dash Def)* | `--control-font-size-md` (14px) | `--control-line-height-md` (20px) | `--control-padding-md` (14px) | `--control-padding-block-md` (7px) |
| `lg` | `--control-font-size-lg` (14px) | `--control-line-height-lg` (20px) | `--control-padding-lg` (16px) | `--control-padding-block-lg` (9px) |
| `xl` *(Web Def)* | `--control-font-size-xl` (16px) | `--control-line-height-xl` (24px) | `--control-padding-xl` (20px) | `--control-padding-block-xl` (11px) |
| `2xl` | `--control-font-size-2xl` (16px) | `--control-line-height-2xl` (24px) | `--control-padding-2xl` (24px) | `--control-padding-block-2xl` (15px) |

### 6.3 Touch-Target Policy
The kit enforces a **48×48px minimum interaction target** (`--control-touch-target-min: 3rem`) for touch safety:
- `touchTarget="comfortable"`: Enforces `min-block-size: var(--control-touch-target-min)` and `min-inline-size: var(--control-touch-target-min)`.
- `touchTarget="auto"` (default): On coarse pointer devices (`@media (any-pointer: coarse)`), enforces `min-block-size: var(--control-touch-target-min)` and `min-inline-size: var(--control-touch-target-min)`. On fine pointers, height is governed cleanly by `rows` and density padding.

### 6.4 Manual Resizing & Layout Safety
- **Vertical Manual Resizing:** Uses `resize: vertical;` to allow users to expand text area block-size while strictly locking inline-size (`100%`) against horizontal grid blowout.
- **Read-Only Preservation:** When `readOnly` is present, vertical resizing **remains enabled** so users can comfortably expand the area to inspect long read-only content, logs, or terms.
- **Disabled Suppression:** When `disabled` is present, `resize: none !important;` is enforced.
- **Browser-Owned Handle Qualification:** Draggable resize handles are rendered by desktop browser engines; mobile browsers (e.g. iOS Safari) do not render desktop-style resize drag handles. Documentation and tests qualify this behavior accurately.

---

## 7. Interaction & State Matrix

In alignment with the visual decision adopted for shared controls, `Textarea` **removes independent hover-only border emphasis**. Resting borders remain stable on hover; keyboard focus and validation errors are communicated clearly through visible outlines and semantic border tokens.

| State | Semantic Trigger | Background Token | Border Token | Text Token | Outline / Focus Indicator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Resting** | Editable textarea | `--color-control-bg` | `--color-border-control` | `--color-text-primary` | None |
| **Hover** | `:hover:not(:disabled):not(:read-only)` | `--color-control-bg` | `--color-border-control` *(stable)* | `--color-text-primary` | None |
| **Focus** | `:focus-visible` / `:focus` | `--color-control-bg` | `--color-border-focus` | `--color-text-primary` | `var(--focus-ring-width) solid var(--color-border-focus)` with `var(--focus-ring-offset)` (0ms immediate) |
| **Invalid** | `aria-invalid="true"` | `--color-control-bg` | `--color-danger` *(stable across hover)* | `--color-text-primary` | Focus ring and border transition to `--color-danger` (0ms immediate) |
| **Disabled** | `disabled` / `aria-disabled="true"` | `--color-control-disabled-bg` | `--color-border-disabled` | `--color-text-disabled` | None (`cursor: not-allowed; resize: none`) |
| **Read-Only** | `readOnly` / `aria-readonly="true"` | `--color-surface-subtle` | `--color-border-subtle` | `--color-text-secondary` | Focusable; subtle focus indicator (`resize: vertical`) |

### 7.1 Semantics: Disabled vs. Read-Only
- **Disabled (`disabled`)**: Excluded from Tab navigation, excluded from form submission, non-editable, announced as dimmed/disabled, resize handle disabled.
- **Read-Only (`readOnly`)**: Focusable in Tab navigation, selectable, copyable, submitted with the form, announced as read-only, resize handle preserved for reading comfort.

### 7.2 Native Constraint vs. ARIA-Only Validation
- **Native Constraint Validation (`required`, `minLength`, `maxLength`)**:
  - The browser blocks native form submission when a native constraint is violated.
  - Generates browser-owned tooltip notifications during form submission attempts.
- **ARIA-Only Validation (`aria-invalid="true"`)**:
  - Driven by the application/form validation state.
  - Error styling in CSS is scoped **strictly to `aria-invalid="true"`**. Pristine empty required textareas (`<Textarea required />`) never trigger danger-colored borders upon first render.

---

## 8. Labels, Help Text, and Errors

Every textarea requires a meaningful accessible name. Placeholder text is not a label.

### 8.1 Caller-Owned Composition
```tsx
const textareaId = React.useId();
const helpId = `${textareaId}-help`;
const errorId = `${textareaId}-error`;

const describedBy = hasError
  ? `${helpId} ${errorId}`
  : helpId;

<div className={styles.fieldGroup}>
  <label htmlFor={textareaId} className={styles.label}>
    {t('common.textareaGallery.messageLabel')}
  </label>
  <Textarea
    id={textareaId}
    rows={4}
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    aria-describedby={describedBy}
    aria-invalid={hasError ? 'true' : undefined}
    placeholder={t('common.textareaGallery.messagePlaceholder')}
  />
  <p id={helpId} className={styles.helpText}>
    {t('common.textareaGallery.messageHelp')}
  </p>
  {hasError && (
    <p id={errorId} className={styles.errorText}>
      {t('common.textareaGallery.messageError')}
    </p>
  )}
</div>
```

---

## 9. Optional External Character Limits & Counters

- **Native Limits:** Standard `minLength` and `maxLength` attributes are forwarded directly to the native element.
- **External Counter (Pattern Responsibility):**
  - An external character counter is an optional, caller-owned composition pattern outside the pure primitive.
  - Callers should clarify whether length is measured via UTF-16 code units (`string.length`) or grapheme clusters. Native `maxlength` enforcement in browsers measures UTF-16 code units.
  - Do **not** attach `aria-live="polite"` to announce every single keystroke. Link the counter via `aria-describedby` or announce only milestone warnings (e.g. 90% capacity).

---

## 10. Localization, Arabic Typography & Direction

1. **Logical CSS Properties:**
   - 100% logical properties: `inline-size: 100%`, `min-inline-size: 0`, `padding-inline`, `padding-block`, `text-align: start`.
2. **Empirical Arabic Verification:**
   - Multi-line Arabic text requires sufficient line-height clearance to prevent diacritic truncation (Tashkeel). The line-height tokens (`1.25rem` / `1.5rem`) must be empirically verified with test assertions rather than assuming unverified clearance.
3. **Browser-Owned Resize Handle Positioning:**
   - In modern desktop engines supporting logical resizing, native resize handles appear at the inline-end (bottom-left under RTL, bottom-right under LTR).
4. **Mixed Direction & Code Content:**
   - For code blocks, stack traces, or technical snippets inside an RTL document, callers set explicit `dir="ltr"` on the `<Textarea dir="ltr" />`.

---

## 11. Security and Privacy Boundaries

Textarea is a plain-text entry control—not an HTML editor or sanitization system.
- Zero `dangerouslySetInnerHTML`.
- Zero automatic draft caching to `localStorage` or unsolicited client logging.
- Client validation is UX feedback; server-side validation is strictly required for length, authorization, and storage persistence.

---

## 12. Canonical Source Code Reference

### 12.1 `textarea.tsx`

```tsx
import React from 'react';
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';
import styles from './textarea.module.css';

export interface TextareaProps
  extends Omit<ComponentPropsWithoutRef<'textarea'>, 'children'>,
    ControlSizingProps {}

/**
 * Textarea — Pure Core UI primitive for multi-line text entry.
 *
 * Adheres strictly to the White Label UI Kit architecture:
 * - 100% pure primitive: zero context, zero embedded copy, native ref forwarding.
 * - Logical CSS properties and product-owned density presets.
 * - Stable resting border across hover; high-visibility focus outlines.
 * - Initial height governed by native rows (defaulting to 4); vertical manual resizing.
 */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      size,
      touchTarget = 'auto',
      rows = 4,
      className,
      ...props
    },
    ref,
  ) {
    const classNames = [
      styles.textarea,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <textarea
        ref={ref}
        rows={rows}
        data-size={size}
        data-touch-target={touchTarget}
        className={classNames}
        {...props}
      />
    );
  },
);

Textarea.displayName = 'Textarea';
```

### 12.2 `textarea.module.css`

```css
.textarea {
  --_control-font-size: var(--control-font-size-default);
  --_control-line-height: var(--control-line-height-default);
  --_control-padding-inline: var(--control-padding-default);
  --_control-padding-block: var(--control-padding-block-default);

  box-sizing: border-box;
  display: block;
  inline-size: 100%;
  min-inline-size: 0;
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
  overflow-y: auto;
  resize: vertical;
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast),
    color var(--transition-fast);
}

/* Explicit Six-Step Density Bindings */
.textarea[data-size="xs"] {
  --_control-font-size: var(--control-font-size-xs);
  --_control-line-height: var(--control-line-height-xs);
  --_control-padding-inline: var(--control-padding-xs);
  --_control-padding-block: var(--control-padding-block-xs);
}

.textarea[data-size="sm"] {
  --_control-font-size: var(--control-font-size-sm);
  --_control-line-height: var(--control-line-height-sm);
  --_control-padding-inline: var(--control-padding-sm);
  --_control-padding-block: var(--control-padding-block-sm);
}

.textarea[data-size="md"] {
  --_control-font-size: var(--control-font-size-md);
  --_control-line-height: var(--control-line-height-md);
  --_control-padding-inline: var(--control-padding-md);
  --_control-padding-block: var(--control-padding-block-md);
}

.textarea[data-size="lg"] {
  --_control-font-size: var(--control-font-size-lg);
  --_control-line-height: var(--control-line-height-lg);
  --_control-padding-inline: var(--control-padding-lg);
  --_control-padding-block: var(--control-padding-block-lg);
}

.textarea[data-size="xl"] {
  --_control-font-size: var(--control-font-size-xl);
  --_control-line-height: var(--control-line-height-xl);
  --_control-padding-inline: var(--control-padding-xl);
  --_control-padding-block: var(--control-padding-block-xl);
}

.textarea[data-size="2xl"] {
  --_control-font-size: var(--control-font-size-2xl);
  --_control-line-height: var(--control-line-height-2xl);
  --_control-padding-inline: var(--control-padding-2xl);
  --_control-padding-block: var(--control-padding-block-2xl);
}

/* Touch-Target Policy */
.textarea[data-touch-target="comfortable"] {
  min-inline-size: var(--control-touch-target-min);
  min-block-size: var(--control-touch-target-min);
}

@media (any-pointer: coarse), (pointer: coarse) {
  .textarea[data-touch-target="auto"] {
    min-inline-size: var(--control-touch-target-min);
    min-block-size: var(--control-touch-target-min);
  }
}

/* Focus State (Immediate 0ms Visible Outline) */
.textarea:focus-visible,
.textarea:focus {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
  border-color: var(--color-border-focus);
  transition: none;
}

/* Invalid State: driven strictly by aria-invalid="true" */
.textarea[aria-invalid="true"] {
  border-color: var(--color-danger);
}

.textarea[aria-invalid="true"]:focus-visible,
.textarea[aria-invalid="true"]:focus {
  border-color: var(--color-danger);
  outline-color: var(--color-danger);
  transition: none;
}

/* Disabled State: Non-editable and resize handle disabled */
.textarea:disabled {
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  color: var(--color-text-disabled);
  cursor: not-allowed;
  resize: none !important;
}

/* Read-Only State: Non-editable, but vertical resize preserved for reading long content */
.textarea:read-only:not(:disabled) {
  background-color: var(--color-surface-subtle);
  border-color: var(--color-border-subtle);
  color: var(--color-text-secondary);
}

/* Placeholder Styling */
.textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 1;
}

/* Reduced Motion Guarantee */
@media (prefers-reduced-motion: reduce) {
  .textarea {
    transition: none;
  }
}
```

### 12.3 `index.ts`

```typescript
export { Textarea } from './textarea';
export type { TextareaProps } from './textarea';
```

---

## 13. Demonstration Gallery Specifications (`/gallery/textarea`)

The demonstration gallery presents real, localized examples of the `Textarea` primitive in both starters:
1. **Overview & Default Sizing:** Ordinary labelled multiline field with omitted `size` prop to visually demonstrate product-owned defaults (`md` in Dashboard, `xl` in Website) and `rows={4}`.
2. **Density Scale:** Six sizes (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) rendered with identical `rows={4}` to demonstrate density decoupling.
3. **Product Default:** Explicit demonstration of omitted size consuming local starter presets.
4. **Row Variations:** Demonstration of native `rows={2}`, `rows={4}`, and `rows={6}`.
5. **States:** Resting, hover stability, active keyboard focus, `aria-invalid="true"`, `disabled`, and `readOnly` (with vertical resizing preserved).
6. **Help & Error Relationships:** Associated description and error elements via `aria-describedby`.
7. **Controlled vs. Uncontrolled:** Controlled state tracking alongside uncontrolled `defaultValue` usage.
8. **Multiline Editing:** Demonstration of newlines, wrapping, and native scrolling.
9. **Manual Resize:** Explaining actual supported vertical resizing behavior.
10. **Localization & Direction:**
    - Arabic script specimen (`lang="ar" dir="rtl"`) demonstrating Tashkeel clearance and bottom-left resize handle.
    - Mixed-direction technical text block (`dir="ltr"`) containing multiline JSON or stack trace data inside an Arabic layout.
11. **Theme & Responsive Layout:** Verified under dark/light themes and narrow mobile viewports without horizontal overflow.
12. **Local Form Demonstration:** Interactive feedback form featuring `<label>`, optional external counter, submit `Button`, simulated local submission, and reset lifecycle.

---

## 14. Testing & Acceptance Matrix

### 14.1 Vitest Unit Tests (`src/components/ui/textarea/textarea.test.tsx`)
- [ ] Renders a native `<textarea>` with default `rows={4}` and omitted size.
- [ ] Renders explicit size density across all six scale steps (`xs` through `2xl`).
- [ ] Supports `touchTarget="comfortable"` and defaults to `"auto"`.
- [ ] Supports controlled multiline editing and emits `onChange` events.
- [ ] Supports uncontrolled editing with `defaultValue`.
- [ ] Forwards ref directly to native `HTMLTextAreaElement`.
- [ ] Fires `onFocus` and `onBlur` callbacks.
- [ ] Suppresses user typing and disables resize handle when `disabled`.
- [ ] Allows focus and selection, and preserves vertical resize when `readOnly`.
- [ ] Supports native `aria-invalid` attribute.
- [ ] Forwards `aria-describedby` for helper and error text linkage.
- [ ] Participates correctly in form submission and form reset lifecycle.

### 14.2 Playwright Browser Tests (`e2e/textarea.spec.ts`)
- [ ] **Target Dimensions & Rows:** Verifies computed initial height derives from `rows` and density padding rather than a rigid fixed height.
- [ ] **Touch Target Safety:** Enforces 48×48px minimum interaction boundaries under coarse pointers and comfortable mode.
- [ ] **Edge-Click Focus:** Clicking near the edge reliably focuses the native `<textarea>`.
- [ ] **Hover & Focus Precedence:**
  - Resting border is `--color-border-control`.
  - Hover border remains stable at `--color-border-control` (zero independent hover border emphasis).
  - Focus indicates outline and border at `--color-border-focus`.
  - Pointer exit while focused retains `--color-border-focus`.
  - Blur restores stable resting border.
- [ ] **Validation Precedence:** `aria-invalid="true"` renders `--color-danger` consistently across resting, hover, focus, and pointer exit.
- [ ] **Required vs. Invalid Distinction:** Untouched empty `<Textarea required />` does NOT render with a danger error border upon first paint.
- [ ] **Arabic Multiline Clearance:** Verifies multi-line Arabic text renders without vertical clipping or diacritic truncation.
- [ ] **Resize Preservation on Read-Only:** Verifies `readOnly` textarea retains vertical resize capability.

---

## 15. Release Acceptance Checklist

- [ ] **1. Pure UI Boundary:** Zero imports from `@/providers`, `@/i18n`, `next/*`, or external form libraries; zero hardcoded English copy.
- [ ] **2. React 19 Ref:** Types use `ComponentPropsWithoutRef<'textarea'>` and forward ref directly to `HTMLTextAreaElement`.
- [ ] **3. Logical CSS:** 100% logical properties (`inline-size`, `min-inline-size`, `padding-inline`, `padding-block`, `text-align: start`).
- [ ] **4. Density & Control Sizing:** Consumes `ControlSizingProps`, `--control-*-default`, and semantic color/radius tokens; density is decoupled from row count.
- [ ] **5. Dashboard Shadow Ban:** 100% shadow-free (`node scripts/check-dashboard-shadows.mjs` exits 0).
- [ ] **6. Reduced Motion:** Transition timing collapses under `@media (prefers-reduced-motion: reduce)` without gating component logic.
- [ ] **7. Keyboard & Accessibility:** Visible focus outline (`:focus-visible`), unclipped focus rings, valid ARIA linkages, and full keyboard navigation.
- [ ] **8. Canonical Synchronization:** Author in `dashboard/src` and sync cleanly to `website/src` (`node scripts/sync-shared.mjs --check` exits 0).
- [ ] **9. Quality Gates:** `tsc --noEmit`, `oxlint`, and Vitest test suites pass with code 0 across all kit starters.
- [ ] **10. Browser Acceptance:** Verified across Chromium Desktop and Mobile Viewport (390px) emulation.

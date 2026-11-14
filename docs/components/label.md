# Label — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/label`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/label/`  
> **Gallery route:** `/gallery/label`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Label** is an essential accessible primitive that programmatically associates descriptive text with a form control (`<input>`, `<textarea>`, `<select>`, `<button>`). It provides clickable target delegation, visual hierarchy, requirement indication, and accessibility metadata for assistive technology.

### 1.1 In Scope
- **Semantic HTML Element**: Native `<label>` element by default, with native `htmlFor` target delegation (and automatic `for` stripping when rendered polymorphically via `as="span"` / non-label tags).
- **Product-Owned Default + Explicit Density Scale**:
  - **Product Default (`size` omitted)**: Consumes `--typography-label-size`, `--typography-label-line-height`, and `--typography-label-weight` (`14px / 20px` Dashboard compact, `16px / 24px` Website comfortable; expanding automatically to `24px` / `28px` under `:lang(ar)`).
  - `sm` (12px / 1rem, `1.25rem` Arabic) — compact dashboard data tables & dense toolbars
  - `md` (14px / 1.25rem, `1.5rem` Arabic) — explicit medium density
  - `lg` (16px / 1.5rem, `1.75rem` Arabic) — explicit large / comfortable website forms
- **Required Field Indication**:
  - Semantic asterisk indicator (`*`) with `aria-hidden="true"` preventing screen readers from reading "star" or "asterisk".
  - Customizable indicator node via `requiredIndicator` prop.
- **Operational States**:
  - `disabled` state with `data-disabled="true"` applying `--color-text-disabled` and `cursor: not-allowed`.
- **Polymorphism**: Support for `as?: ElementType` (e.g. rendering as `span` when used inside complex compound triggers).
- **Pure White-Label Boundaries**: 100% CSS logical properties, zero dashboard shadows, native typography token inheritance, and bidirectional RTL/LTR layout parity.

### 1.2 Out of Scope
- Form validation error messaging or helper hint text (managed by pattern containers or form wrappers).
- Custom control replacement logic.

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Label` primitive resides in `src/components/ui/label/` and strictly adheres to layer boundaries:
- **Zero Third-Party UI Libraries:** Direct native DOM element; no Radix, no MUI, no Chakra.
- **Pure Dependency Flow:** Never imports from `@/providers`, `@/i18n`, `@/components/patterns`, `@/components/shell`, or application state.
- **Zero Hardcoded Strings:** Does not contain hardcoded English strings; all text content and accessible names are supplied via props or children.
- **Bidirectional Support:** Uses CSS logical properties (`margin-inline`, `padding-inline`, `gap: var(--space-1)`). The required indicator naturally aligns at the inline-end in both LTR and RTL.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ passes localized labels and field IDs
Connected Patterns & Studio (components/patterns/label-gallery/)
       ↓ binds props & renders specimen
Core UI Primitives (components/ui/label/)
       ↓ pure primitive (label.tsx, label.module.css)
Design Tokens (tokens/color-roles.css, tokens/typography.css, tokens/spacing.css)
```

---

## 3. Visual Variants & Semantic Token Contracts

| State / Role | Typography Token | Text Color Token | Cursor |
| :--- | :--- | :--- | :--- |
| **Product Default (`size` omitted)** | `--typography-label-size` (14px Dashboard / 16px Website), `--typography-label-weight` (500) | `--color-text-primary` | `default` (`pointer` when `htmlFor` is linked) |
| **Small (`sm`)** | `--font-size-xs` (12px), `1rem` (`1.25rem` Arabic) | `--color-text-primary` | `default` (`pointer` when `htmlFor` is linked) |
| **Medium (`md`)** | `--font-size-sm` (14px), `1.25rem` (`1.5rem` Arabic) | `--color-text-primary` | `default` (`pointer` when `htmlFor` is linked) |
| **Large (`lg`)** | `--font-size-base` (16px), `1.5rem` (`1.75rem` Arabic) | `--color-text-primary` | `default` (`pointer` when `htmlFor` is linked) |
| **Disabled** | Inherits active size role | `--color-text-disabled` | `not-allowed` |
| **Required Star** | `--font-weight-bold` | `--color-danger` | Inherits |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **Programmatic Association**:
   - Always paired with a target control via `htmlFor="<id>"` matching the control's `id`.
   - Clicking the label transfers browser keyboard focus to the target input or control.
2. **Accessible Required Indication**:
   - The visual asterisk is rendered inside `<span aria-hidden="true">*</span>`.
   - Assistive technologies announce required status via the target control's `required` or `aria-required="true"` attribute, not via noisy text synthesis.
3. **User Selection**:
   - `user-select: none` prevents accidental double-click text selection when clicking rapidly to focus fields.

---

## 5. Component API & Props Specification

```typescript
export type LabelSize = 'sm' | 'md' | 'lg';

export interface LabelProps extends React.ComponentPropsWithRef<'label'> {
  /**
   * Explicit typography density override.
   * When omitted, inherits product-owned `--typography-label-*` tokens.
   */
  size?: LabelSize;

  /** Whether the associated form field is required */
  required?: boolean;

  /** Custom indicator node to display when required. Defaults to '*' */
  requiredIndicator?: ReactNode;

  /** Whether the field is disabled, applying disabled typography styles */
  disabled?: boolean;

  /** Polymorphic element tag. Defaults to 'label' */
  as?: ElementType;

  /** Children nodes (label text, optional badges, icons) */
  children?: ReactNode;

  /** Additional CSS class names */
  className?: string;
}
```

---

## 6. Verification

- **Unit & Interaction Tests (`vitest run`):** `src/components/ui/label/label.test.tsx` (9 tests covering `htmlFor` programmatic pairing, omitted default `data-size` preserving product defaults, `userEvent.click()` focus delegation, `aria-hidden="true"` required indicator excluding asterisk from accessible name, `disabled`, explicit `sm | md | lg`, polymorphic `as` attribute stripping, `dir="rtl"` / `lang="ar"`, and ref forwarding).
- **Playwright E2E:** `e2e/label.spec.ts` in both Next.js Dashboard and Next.js Website across Desktop Chrome and Mobile Viewport (390px).

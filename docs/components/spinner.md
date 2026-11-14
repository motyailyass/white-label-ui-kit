# Spinner — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/spinner`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/spinner/`  
> **Gallery route:** `/gallery/spinner`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Spinner** is an indeterminate loading indicator primitive used to signal ongoing asynchronous background activity, such as server data mutations, page transitions, button submit states, or section data retrieval.

### 1.1 In Scope
- **Universal Density Scale**: 5 explicit size steps matching control dimensions:
  - `xs` (12px / 0.75rem, embedded inside compact badge or tag items)
  - `sm` (16px / 1rem, standard for button leading loading states)
  - `md` (20px / 1.25rem, standard default for inputs and cards)
  - `lg` (24px / 1.5rem, modal overlays and section content blocks)
  - `xl` (32px / 2rem, full page loading fallbacks)
- **Semantic Color Variants**:
  - `default` (`--color-text-secondary`)
  - `primary` (`--color-primary`)
  - `current` (`currentColor`, inherits parent font color e.g. within solid buttons)
  - `inverse` (`--color-text-inverse`)
- **Accessibility & Live Regions**:
  - `role="status"` with `aria-live="polite"` when `label`, `aria-label`, or `aria-labelledby` is provided.
  - Visually hidden `.visuallyHidden` text (`clip-path: inset(50%)`) prevents visual clutter while informing assistive technology when `label` is passed.
  - `aria-hidden="true"` when purely decorative (no accessible name).
  - Inner `<svg>` sets `aria-hidden="true"` and `focusable="false"`.
- **Reduced Motion Architecture**:
  - Slows animation down from 750ms to 2000ms under `@media (prefers-reduced-motion: reduce)`, preventing vestibular discomfort.

### 1.2 Out of Scope
- Determinate percentage progress bars (covered by `Progress`).
- Multi-step loading sequences (covered by `Stepper`).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Spinner` primitive resides in `src/components/ui/spinner/`:
- **Lightweight Native SVG**: Self-contained SVG path without heavy external icon or animation libraries.
- **Zero Inline Styles**: Controlled via CSS custom properties and logical dimensions.
- **Zero Dashboard Shadows**: 100% flat stroke geometry; no glow or filter drop-shadows.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ passes optional localized screen reader label
Connected Patterns & Studio (components/patterns/spinner-gallery/)
       ↓ binds props & renders specimen
Core UI Primitives (components/ui/spinner/)
       ↓ pure primitive (spinner.tsx, spinner.module.css)
Design Tokens (tokens/color-roles.css, tokens/motion.css)
```

---

## 3. Visual Variants & Semantic Token Contracts

| Variant | Stroke Color Token | Track Opacity |
| :--- | :--- | :--- |
| **`default`** | `--color-text-secondary` | `0.2` |
| **`primary`** | `--color-primary` | `0.2` |
| **`current`** | `currentColor` | `0.2` |
| **`inverse`** | `--color-text-inverse` | `0.2` |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **Accessible Status Role**:
   - When a `label` is supplied (e.g. `label={t('common.loading')}`), the element sets `role="status" aria-live="polite"` and includes a visually-hidden `<span className={styles.visuallyHidden}>{label}</span>`.
   - When `label` is omitted, `aria-hidden="true"` ensures screen readers skip decorative spinners.
2. **Vestibular Safety**:
   - Respects user motion preferences by relaxing spin velocity under `prefers-reduced-motion`.

---

## 5. Component API & Props Specification

```typescript
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'primary' | 'current' | 'inverse';

export interface SpinnerProps extends ComponentPropsWithRef<'span'> {
  /** Sizing scale for the spinner. Defaults to 'md' */
  size?: SpinnerSize;

  /** Semantic color variant. Defaults to 'default' */
  variant?: SpinnerVariant;

  /** Accessible label for assistive technology. When provided, exposes role="status" */
  label?: string;

  /** Renders `label` visibly beside the spinner instead of visually hidden. Defaults to false */
  showLabel?: boolean;

  /** Stroke width of the circular path. Defaults to 2.5 */
  strokeWidth?: number;

  /** Additional CSS class names */
  className?: string;
}
```

## 6. Verification & QA Gates
- **Unit & RTL Tests (`spinner.test.tsx`)**: Verifies decorative `aria-hidden="true"`, whitespace-only fallback, `label` / `aria-label` / `aria-labelledby` `role="status"` wiring, all 5 size tokens, all 4 semantic variants, custom `strokeWidth`, RTL Arabic status announcements, and native `ref` forwarding.
- **Playwright E2E (`e2e/spinner.spec.ts`)**: Verifies `xs`/`md`/`xl` sizing dimensions, `role="status"` vs `aria-hidden="true"` toggle, `Full Matrix` inspection, RTL `lang="ar"` synchronization, zero Dashboard shadows, `prefers-reduced-motion: reduce` animation dampening (`2000ms`), and zero mobile overflow.

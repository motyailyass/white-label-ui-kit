# Separator — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/separator`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/separator/`  
> **Gallery route:** `/gallery/separator`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Separator** is an accessible visual divider used to separate content sections, navigation groups, form steps, or toolbar action clusters horizontally or vertically.

### 1.1 In Scope
- **Orientations**:
  - `horizontal` (default, spans full inline width, block border `1px solid var(--color-border-subtle)`)
  - `vertical` (spans parent block height, inline border `1px solid var(--color-border-subtle)`)
- **Semantic HTML & Decorative Modes**:
  - `decorative={true}` (default): sets `role="none"` preventing screen readers from announcing unnecessary "separator" stops in decorative UI.
  - `decorative={false}`: exposes semantic `role="separator"` with `aria-orientation="horizontal" | "vertical"`.
- **Text / Labeled Divider**:
  - Support for inline label text (e.g. `"OR"` in authentication forms, or section chapter titles).
  - Label alignment via `labelAlign="start" | "center" | "end"`.
- **Pure White-Label Boundaries**: 100% CSS logical properties (`inline-size`, `block-size`, `border-block-start`, `border-inline-start`), zero dashboard shadows.

### 1.2 Out of Scope
- Full section headers with subtitles and action buttons (handled by pattern section headers).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Separator` primitive resides in `src/components/ui/separator/`:
- **Native HTML First**: Renders native `<hr>` when horizontal without label; renders accessible `<div>` when vertical or when containing an inline label node.
- **Zero Third-Party Dependencies**: Pure React 19 forwardRef implementation without external runtimes.
- **Logical CSS**: Uses `border-block-start` for horizontal lines and `border-inline-start` for vertical lines.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ passes optional divider label
Connected Patterns & Studio (components/patterns/separator-gallery/)
       ↓ binds orientation & decorative props
Core UI Primitives (components/ui/separator/)
       ↓ pure primitive (separator.tsx, separator.module.css)
Design Tokens (tokens/color-roles.css, tokens/spacing.css)
```

---

## 3. Visual Variants & Semantic Token Contracts

| Feature / Variant | Orientation | DOM Tag | Semantic Token |
| :--- | :--- | :--- | :--- |
| **Horizontal** | `horizontal` | `<hr>` | `border-block-start: 1px solid var(--color-border-subtle)` |
| **Vertical** | `vertical` | `<div>` | `border-inline-start: 1px solid var(--color-border-subtle)` |
| **Labeled Divider** | `horizontal` | `<div>` | `--typography-supporting-size` (12px), `--color-text-muted` |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **WAI-ARIA 1.2 Separator Pattern**:
   - When `decorative={false}`, renders `role="separator"` with `aria-orientation="horizontal"` or `aria-orientation="vertical"`.
   - When `decorative={false}` and a `label` / `children` node is supplied, automatically links `aria-labelledby` via `React.useId()` (unless explicit `aria-label` or `aria-labelledby` is provided) so assistive technologies announce the section divider's name.
   - When `decorative={true}`, renders `role="none"` so screen readers ignore visual line rules.
2. **Labeled Dividers & Script Parity**:
   - Uses `--letter-spacing-wide` (`0.05em`) and `text-transform: uppercase` for Latin labels, while restoring `letter-spacing: var(--letter-spacing-normal)`, `--font-family-arabic`, and `text-transform: none` under `:lang(ar)` to keep Arabic cursive ligatures intact.
   - `start` and `end` label alignments hide the opposing `::before`/`::after` rule cleanly (`display: none`) so labels sit flush without phantom flex gaps.

---

## 5. Component API & Props Specification

```typescript
export type SeparatorOrientation = 'horizontal' | 'vertical';
export type SeparatorLabelAlign = 'start' | 'center' | 'end';

export interface SeparatorProps extends Omit<React.ComponentPropsWithRef<'div'>, 'children'> {
  /** Orientation of the divider. Defaults to 'horizontal' */
  orientation?: SeparatorOrientation;

  /** Whether the separator is purely decorative. If true, role="none". Defaults to true */
  decorative?: boolean;

  /** Optional text or element displayed within a horizontal divider */
  label?: ReactNode;

  /** Alignment of the optional label. Defaults to 'center' */
  labelAlign?: SeparatorLabelAlign;

  /** Optional children alias for horizontal label content */
  children?: ReactNode;

  /** Additional CSS class names */
  className?: string;
}
```

---

## 6. Verification

- **Unit Tests (`vitest run`):** `src/components/ui/separator/separator.test.tsx` (7 tests covering default decorative `<hr role="none">`, semantic `decorative={false}` horizontal/vertical attributes, automatic `aria-labelledby` pairing and override precedence, `start`/`center`/`end` + `children` alias, RTL/Arabic nested scripts, and ref forwarding).
- **Playwright E2E:** `e2e/separator.spec.ts` in both Next.js Dashboard and Next.js Website across Desktop Chrome and Mobile Viewport (390px).

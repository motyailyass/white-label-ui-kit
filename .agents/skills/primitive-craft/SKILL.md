---
name: primitive-craft
description: Standards, state matrices, and verification checklists for crafting pure white-label Core UI primitives.
---

# Primitive Craft — Pure White-Label UI Primitives

Execution discipline for authoring the 52 primitives in `src/components/ui/`. Every primitive must satisfy all 8 sections.

## 1. Component Contract
- Pure HTML element wrapper with full `React.ComponentPropsWithoutRef<T>` / `React.ButtonHTMLAttributes<T>` passthrough.
- Forward ref via `React.forwardRef` with explicit `displayName`.
- Props in, events out. Zero context, router, i18n, query, form, or zod dependencies.
- No `asChild` (Radix pattern forbidden). Host-agnostic slots (`as?: React.ElementType`, `icon?: React.ReactNode`) only.

## 2. State Matrix
Implement every applicable state via CSS variables and `data-*` attributes:
- **Interactive**: `default`, `:hover`, `:active`, `:focus-visible` (visible ring, offset).
- **Operational**: `disabled` (or `data-disabled="true"`), `aria-disabled="true"`.
- **Loading**: `data-loading="true"` (preserves layout dimensions, hides label from a11y, announces spinner).
- **Validation**: `aria-invalid="true"`, `data-invalid="true"`.
- **Overlays** (Dialog, Sheet, Popover, Menu): `data-state="open|closed"`, Escape key dismissal, focus trap, body scroll lock, click-outside dismissal.

## 3. Sizing & Spacing Tokens
- Heights: only `var(--control-height-xs)` through `var(--control-height-2xl)`. Default to `var(--control-height-default)`.
- Padding: only `var(--control-padding-xs)` through `var(--control-padding-2xl)`.
- Typography: only `var(--control-font-size-*)` and `var(--font-size-*)`.
- Icon Size: only `var(--control-icon-size-*)`.
- Zero raw pixel dimensions for heights, paddings, or font sizes.

## 4. RTL & Logical Properties
- CSS Logical Properties only: `padding-inline`, `margin-block`, `inset-inline-*`, `border-inline-*`, `text-align: start`. Zero `left`, `right`, `margin-left`, `margin-right`.
- Directional glyphs (chevrons, back/forward arrows) flip automatically via `@/components/icons` (`directional()`). Never flip manually in primitive CSS.

## 5. Accessibility & ARIA Contract
- Native semantic elements first (`<button>`, `<dialog>`, `<input>`, `<select>`).
- If custom wrapper required: explicit `role`, `aria-label` / `aria-labelledby`, `aria-describedby`.
- Visible `:focus-visible` with 2px ring and 2px offset. Never remove outline on keyboard focus.
- Keyboard contracts: `Enter` and `Space` for activation; Arrow keys for list/tab/menu navigation; `Escape` for dismissal.

## 6. Directory Layout & Public Contract
Each primitive lives in its own isolated folder:
```text
src/components/ui/[primitive-name]/
├── [primitive-name].tsx
├── [primitive-name].module.css
├── [primitive-name].test.tsx
└── index.ts
```
Never import internal files or styles across component boundaries; consume only via `index.ts`.

## 7. Verification & Tests
One test file per primitive (`[primitive-name].test.tsx`) covering:
- Render with defaults and variants.
- Keyboard interaction and activation.
- Disabled state enforcement (no click event emission).
- ARIA roles, attributes, and accessible names.
- Logical direction / RTL behavior.

## 8. Review Checklist (10 Verification Gates)
1. [ ] **Pure UI boundary**: Zero imports from i18n, providers, next/*, or global stores.
2. [ ] **Ref & props forwarding**: Native attributes forwarded and ref forwarded via `forwardRef`.
3. [ ] **State matrix**: Hover, active, focus-visible, disabled, loading, invalid handled cleanly.
4. [ ] **Overlays**: Escape dismissal, focus trap, scroll lock, click-outside if applicable.
5. [ ] **Sizing tokens**: Consumes `--control-height-*` and `--control-padding-*` (zero hardcoded px).
6. [ ] **Logical properties**: Strict CSS logical properties (zero physical left/right/margin-left/padding-right).
7. [ ] **Keyboard & a11y**: Keyboard operable, ARIA attributes present, contrast-compliant `:focus-visible`.
8. [ ] **Unit tests**: Vitest test suite passes with full interaction coverage.
9. [ ] **Lint & types**: Oxlint and `tsc --noEmit` exit 0 with zero warnings and zero errors.
10. [ ] **Public contract**: Exported cleanly via `index.ts`.


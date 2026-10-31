---
trigger: glob
globs: "**/*.css, **/*.tsx"
description: CSS Modules rules, CSS Logical Properties, token contracts, z-index, motion, and RTL styling mandates.
---

# 40-styling-rtl: CSS Logical Properties, Tokens & RTL Standards

Detailed architectural rationale: @docs/standards/TECH_STACK.md and @docs/standards/RTL_AND_I18N.md

## 1. Strict CSS Logical Properties & Zero Inline Styles
- **Zero physical directions or dimensions**: Physical directional and dimensional CSS properties (`margin-left`, `margin-right`, `margin-top`, `margin-bottom`, `padding-left`, `padding-right`, `padding-top`, `padding-bottom`, `left`, `right`, `top`, `bottom`, `border-left`, `border-right`, `border-top`, `border-bottom`, `text-align: left/right`, `width`, `height`, `min-width`, `max-width`, `min-height`, `max-height`, `overflow-x`, `overflow-y`, `margin: 0 auto`, `padding: 0 ...`) are prohibited in components, shell, layouts, patterns, and wireframes.
- **Always use logical properties**:
  - Sizing: `inline-size`, `block-size`, `min-inline-size`, `max-inline-size`, `min-block-size` (prefer `100dvh` over `100vh` for full-viewport shells).
  - Margins & Paddings: `margin-inline`, `margin-inline-start/end`, `margin-block`, `margin-block-start/end`, `padding-inline`, `padding-block`.
  - Positioning & Borders: `inset-inline-start/end`, `inset-block-start/end`, `border-inline-start/end`, `border-block-start/end`, `overflow-inline`, `overflow-block`.
  - Alignment: `text-align: start` / `text-align: end`.
- **Zero ad-hoc inline styles & zero `!important` hacks**: Visual styling must live in `*.module.css` consuming CSS custom properties. Never pass physical properties (`width`, `margin`, colors) via `style={{ ... }}` in `.tsx` files—the sole permitted exception is passing typed CSS custom property overrides (such as `--sidebar-width` or `--panel-width`) on configurable layout containers. Never use `!important` outside `@media (prefers-reduced-motion: reduce)` scroll clamping.

## 2. Design Tokens Only
- **Semantic token consumption**: Consume semantic roles (`--color-bg-base`, `--color-surface*`, `--color-text-*`, `--color-border-*`, `--typography-*-size/line-height/weight`, `--radius-control/card/overlay/dialog/navigation`, `--letter-spacing-*`). Hardcoded hex colors, sub-12px font sizes (`10px`, `11px`), and raw pixel paddings/gaps are forbidden.
- **Control sizing contract**: All interactive controls consume the six-step token scale from `styles/tokens/controls.css` (`--control-height-*`, `--control-padding-*`, `--control-padding-block-*`, `--control-font-size-*`, `--control-line-height-*`, `--control-icon-size-*`, `--control-gap-*`) defaulting to `--control-*-default` (`md` 36px in Dashboard; `xl` 48px in Website) via `min-block-size`, never fixed `height`. Enforce 48×48px coarse-pointer touch targets via `data-touch-target`.
- **Spacing boundary ownership**: Assign single ownership per boundary: parents own child `gap`, containers own `padding-inline`, sections own `padding-block`, cards own internal padding. Never double page/section gutters.
- **Z-index discipline**: Consume only the 10-step scale (`--z-base` through `--z-tooltip`) and its approved semantic aliases (`--z-header`, `--z-sidebar`, `--z-panel`). Off-scale `calc(var(--z-*) + N)` arithmetic and magic integers are forbidden.
- **Directional icon mirroring**: Directional icons mirror automatically via `directional()` in `@/components/icons` (`icon.module.css` + `data-mirror-rtl="true"`). Never write manual `scaleX(-1)` rules in component CSS modules, and never mirror non-directional icons.

## 3. Accessibility, Focus & Reduced Motion
- **Visible focus states**: Define `:focus-visible` with immediate (0ms) outlines (`outline: var(--focus-ring-width) solid var(--color-border-focus); outline-offset: var(--focus-ring-offset);`). Never clip focus rings with `overflow: hidden` on interactive or card wrappers, and never use `box-shadow` for focus.
- **Motion & `@keyframes` discipline**: Use `--transition-fast/normal/slow` on `opacity`, `transform`, `background-color`, `border-color`, or `color`—never `transition: all` and never animate `width`, `height`, `min-width`, `margin`, or `padding`. Any continuous CSS `@keyframes` animation (such as loading spinners) MUST define a `@media (prefers-reduced-motion: reduce)` override (`animation: none` or low-motion pulse).


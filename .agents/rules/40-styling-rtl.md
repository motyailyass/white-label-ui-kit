---
trigger: glob
globs: "**/*.css"
description: CSS Modules rules, CSS Logical Properties, token contracts, and RTL styling mandates.
---

# 40-styling-rtl: CSS Logical Properties & RTL Standards

Detailed architectural rationale: @docs/standards/TECH_STACK.md and @docs/standards/RTL_AND_I18N.md

## 1. Strict CSS Logical Properties Mandate
- **Zero physical directions**: Physical directional CSS properties (`margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, `right`, `border-left`, `border-right`, `text-align: left`) are strictly prohibited in `components/ui/` and layouts.
- **Always use logical properties**:
  - `margin-inline-start` / `margin-inline-end`
  - `padding-inline-start` / `padding-inline-end`
  - `margin-block` / `padding-block`
  - `inset-inline-start` / `inset-inline-end`
  - `border-inline-start` / `border-inline-end`
  - `text-align: start` / `text-align: end`
- **Zero inline styles**: Styling must live exclusively in `*.module.css` consuming CSS custom properties.

## 2. Design Tokens Only
- **Semantic token consumption**: Style values must consume variables from `styles/tokens/` (`var(--color-bg-base)`, `var(--space-4)`, `var(--radius-md)`, `var(--font-family-arabic)`). Hardcoded hex colors and pixel spacing are forbidden.
- **Control sizing contract**: All controls consume the approved six-step token scale from `styles/tokens/controls.css` (`--control-height-*`, `--control-padding-*`, `--control-padding-block-*`, `--control-font-size-*`, `--control-line-height-*`, `--control-icon-size-*`, `--control-gap-*`). Dashboard defaults to `md` (36px); Website defaults to `xl` (48px). Control heights are minimum border-box block sizes (`min-block-size`), never fixed heights.
- **Spacing tokens & boundary ownership**: Spacing must consume the approved 4px-base primitive scale from `styles/tokens/spacing.css` or product-owned roles (`styles/dashboard/spacing.css`, `styles/website/spacing.css`). Never use physical properties (`margin-left`, `padding-right`); always use logical properties (`margin-inline-start`, `padding-block`). Assign single ownership to each spacing boundary: parents own child `gap`, containers own inline gutter (`padding-inline`), sections own block rhythm (`padding-block`), and cards own internal padding.
- **Directional icon mirroring**: Directional icons (arrows, chevrons, collapse triggers) must mirror in RTL (`[dir="rtl"] [data-mirror-rtl="true"] { transform: scaleX(-1); }`). Never mirror non-directional icons (search, checkmark, media play).

## 3. Accessibility & Motion
- **Visible focus states**: Interactive elements must define `:focus-visible` with outlines using shared accessibility tokens (`outline: var(--focus-ring-width) solid var(--color-border-focus); outline-offset: var(--focus-ring-offset);`). Focus indicators must never rely on shadows and must remain independent of brand accents.
- **Reduced motion**: Respect user preferences with `@media (prefers-reduced-motion: reduce)` by disabling or clamping layout transitions.


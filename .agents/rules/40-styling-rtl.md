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
- **Directional icon mirroring**: Directional icons (arrows, chevrons, collapse triggers) must mirror in RTL (`[dir="rtl"] [data-mirror-rtl="true"] { transform: scaleX(-1); }`). Never mirror non-directional icons (search, checkmark, media play).

## 3. Accessibility & Motion
- **Visible focus states**: Interactive elements must define `:focus-visible` with a 2px outline and offset (`outline: 2px solid var(--color-primary)`).
- **Reduced motion**: Respect user preferences with `@media (prefers-reduced-motion: reduce)` by disabling or clamping layout transitions.


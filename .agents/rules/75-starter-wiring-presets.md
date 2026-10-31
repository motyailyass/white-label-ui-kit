---
trigger: glob
globs: "**/src/components/patterns/**, **/src/layouts/**, **/src/components/website/**, **/src/wireframes/**, **/src/app/**"
description: Product preset contracts and component wiring workflows across Dashboard and Website starters.
---

# 75-starter-wiring-presets: Dashboard vs Website Component Wiring

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. The Four-Step Wiring Pipeline
Never jump directly from raw HTML/CSS in `app/` or `wireframes/`—every UI element flows through the kit's tiers:
1. **Pure Primitive (`components/ui/*`)**: Stateless, token-driven markup + ARIA + keyboard state (`Button`, `Dialog`, `Accordion`, `Tabs`, `Input`, `Select`, `Badge`, `Card`, etc.). Zero context/i18n.
2. **Connected Pattern (`components/patterns/*`)**: Binds `useI18n()` (`t`, `formatNumber`, `formatCurrency`, `formatPercent`, `formatDate`), `useTheme()`, and `<BidiText dir="ltr">` into pure primitives, supplying localized `aria-label` / `closeLabel` props.
3. **Product Composition (`components/shell/*` + `layouts/*` for Dashboard; `components/website/*` + `wireframes/*` for Website)**: Applies product-specific presets, landmarks, and slot props (`as`, `imageComponent`) without hardcoding demo copy.
4. **Host Route (`src/app/*`)**: Host `layout.tsx` / `page.tsx` + `generateMetadata()`, injecting Next.js `Link`, `Image`, `router.refresh()` (`onLocaleChange`), and localized route data.

## 2. Dashboard Wiring Contract (`typescript/nextjs/starterkit/dashboard`)
- **Depth & Surfaces**: **100% shadow-free** (`box-shadow`, `text-shadow`, `drop-shadow` strictly forbidden). Express hierarchy via `--color-bg-base`, `--color-surface`, `--color-surface-raised`, and `--color-border-subtle`.
- **Control & Radius Defaults**: Controls default to `md` (`36px` `min-block-size`) and `--radius-control` (`6px`); cards use `--radius-card` (`8px`); dialogs use `--radius-dialog` (`12px`).
- **Compact Typography & Tabular Metrics**: Consume `--typography-page-title-*`, `--typography-section-title-*`, `--typography-card-title-*`, `--typography-body-*` (`14px/20px`), `--typography-label-*`, `--typography-supporting-*`, and `--typography-metric-*` (`font-variant-numeric: tabular-nums` + `<BidiText dir="ltr">`).
- **Spacing Roles**: Consume `--layout-page-padding-block`, `--layout-page-padding-inline`, `--layout-section-gap`, `--layout-card-padding`, `--layout-toolbar-gap`, and `--layout-action-gap` with single boundary ownership.

## 3. Website Wiring Contract (`typescript/nextjs/starterkit/website`)
- **Restrained Semantic Shadows**: Consume ONLY semantic shadow roles from `styles/website/shadows.css` (`--website-shadow-card`, `--website-shadow-card-hover`, `--website-shadow-header`, `--website-shadow-menu`, `--website-shadow-dialog`) or `<WebsiteCard elevation="...">`. Never apply raw shadow primitives or horizontal x-offsets.
- **Control & Radius Defaults**: Controls default to `xl` (`48px` `min-block-size`) and `--radius-control` (`8px`); cards use `--radius-card` (`12px`); feature showcases use `--radius-feature` (`16px`); dialogs use `--radius-dialog` (`16px`).
- **Editorial Responsive Typography**: Consume `--typography-hero-display-*`, `--typography-page-title-*`, `--typography-section-title-*`, `--typography-card-title-*`, `--typography-lead-*`, `--typography-body-*` (`16px/24px`), and `--typography-eyebrow-*` (`data-role="eyebrow"`).
- **Section Rhythm & Composition**: Sections (`Hero`, `BentoGrid`, `Pricing`, `FAQ`, `CTA`, `Navbar`, `Footer`) must compose pure `components/ui/*` primitives (`Button`, `Accordion`, `ToggleGroup`, `Input`, `Badge`) + `<WebsiteCard>` + `<Icon>`, consume `--layout-hero-padding-block` / `--layout-section-padding-block` / `--layout-container-max-width`, accept prop-driven content backed by the `website.*` i18n namespace, and contain **zero** inline `style={{}}`, **zero** raw `<svg>`, and **zero** hardcoded English defaults.

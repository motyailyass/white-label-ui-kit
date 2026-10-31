---
name: component-wiring
description: >-
  End-to-end workflow for wiring pure Core UI primitives into connected patterns, Dashboard shells/layouts/routes, and Website sections/templates/routes while respecting tokens, semantic HTML/lang, i18n, and starter independence.
---

# Component Wiring — Primitives → Patterns → Dashboard & Website

Use this runbook whenever building or wiring UI components across `components/ui/`, `components/patterns/`, Dashboard (`components/shell/`, `layouts/`, `app/`), and Website (`components/website/`, `wireframes/`, `app/`).

---

## Step 1: Classify the Target Layer Before Writing Code

| Layer | Canonical Location | Allowed Dependencies | Forbidden Dependencies |
| :--- | :--- | :--- | :--- |
| **1. Pure Primitive** | `dashboard/src/components/ui/<name>/` (mirrored to `website`) | `react`, `@/lib/cn`, `@/components/icons`, `./*.module.css`, `../control-sizing` | `@/providers`, `@/i18n`, `next/*`, external state/form/query libs, hardcoded English strings |
| **2. Connected Pattern** | `dashboard/src/components/patterns/<name>/` (shared) or starter-local folder | Layer 1 + `@/providers` (`useI18n`, `useTheme`), `@/i18n` (`BidiText`) | `next/*`, `try/catch` silent fallbacks, direct `document.documentElement` mutation |
| **3A. Dashboard Shell & Layouts** | `dashboard/src/components/shell/*`, `dashboard/src/layouts/*` | Layers 1–2 + `LayoutContext`, polymorphic `as` & `imageComponent` props | `next/*`, ANY shadows (`box-shadow`, `drop-shadow`), hardcoded brand/nav/aria strings |
| **3B. Website Surfaces & Sections** | `website/src/components/website/*`, `website/src/wireframes/*` | Layers 1–2 + `website/*` preset tokens (`--website-shadow-*`, `--radius-feature`) | `next/*`, `dashboard.*` i18n keys, raw `<svg>`, inline `style={{}}`, hardcoded `'Tokyo.dev'` copy |
| **4. Next.js Host Route** | `{dashboard,website}/src/app/**` | All layers + `next/link`, `next/image`, `next/navigation`, `getServerI18nState` | Top-level `'use client'` on `layout.tsx`, static English `metadata`, synthetic test routes in prod |

---

## Step 2: Author or Verify the Pure Primitive (`primitive-craft`)

1. Activate and follow `.agents/skills/primitive-craft/SKILL.md` in `dashboard/src/components/ui/<name>/`.
2. Ensure every user-facing label needed by the primitive (`closeLabel`, `clearLabel`, `previousLabel`, `nextLabel`, `aria-label`) is an explicit prop—never a hardcoded English fallback.
3. Export from `dashboard/src/components/ui/index.ts` and mirror immediately:
   ```bash
   node scripts/sync-shared.mjs
   ```

---

## Step 3: Wire Connected Patterns (`components/patterns/`)

When a UI composition needs translations, number/currency/date formatting, or theme state:
1. Import via public module barrels (`@/components/ui`, `@/providers`, `@/i18n`, `@/components/icons`).
2. Read `const { t, locale, formatNumber, formatCurrency, formatPercent, formatDate } = useI18n();` unconditionally (never inside `try/catch`).
3. Pass translated strings from `t('common....')` into pure primitive props (`aria-label`, `closeLabel`, visible text).
4. Wrap embedded LTR values (codes, phone numbers, emails, percentages, currencies) in `<BidiText dir="ltr">`. Add `lang="..."` only on actual foreign human-language prose/labels, never on language-neutral IDs or numbers, and always pass explicit record currency to `formatCurrency(amount, record.currency)`.
5. For multi-language UI controls (like `<LanguageSwitcher>`), set explicit `lang={loc.code}` and `dir={getDirectionForLocale(loc.code)}` on each option/item.

---

## Step 4A: Wire into Dashboard (`typescript/nextjs/starterkit/dashboard`)

1. **Preset Token Discipline**:
   - **Zero shadows**: Verify with `node scripts/check-dashboard-shadows.mjs`. Separate surfaces using `--color-bg-base`, `--color-surface`, `--color-surface-raised`, and `--color-border-subtle`.
   - **Controls & Radii**: Let controls inherit default `md` (`36px` `min-block-size`) and `--radius-control` (`6px`); cards consume `--radius-card` (`8px`).
   - **Typography & Metrics**: Use `--typography-page-title-*` (`<h1>`), `--typography-section-title-*` (`<h2>`), `--typography-card-title-*` (`<h3>`), `--typography-body-*` (`14px/20px`), and `--typography-metric-*` (`font-variant-numeric: tabular-nums`).
   - **Spacing**: Single boundary ownership—`ContentBody` owns `--layout-page-padding-*`, sections own `--layout-section-gap`, cards own `--layout-card-padding`.
2. **Host Route & Slot Wiring**:
   - Wire `router.refresh()` via `onLocaleChange` at the `src/app/` host boundary without leaking `next/navigation` into `providers/`.
   - Pass `as={Link}` and `imageComponent={Image}` into layout navigation, breadcrumbs, logos, and avatars.
   - Export `generateMetadata()` localized via `getServerI18nState()` + `translate()`.
   - Localize all fixture/demo data through `dashboard.*` / `settings.*` message keys (zero hardcoded English labels in `fixtures/`).

---

## Step 4B: Wire into Website (`typescript/nextjs/starterkit/website`)

1. **Preset Token Discipline**:
   - **Controls & Radii**: Let controls inherit default `xl` (`48px` `min-block-size`) and `--radius-control` (`8px`); cards consume `<WebsiteCard>` / `--radius-card` (`12px`); hero/feature showcases consume `--radius-feature` (`16px`).
   - **Shadows**: Opt-in semantic tokens ONLY (`--website-shadow-card`, `--website-shadow-card-hover`, `--website-shadow-header`, `--website-shadow-menu`, `--website-shadow-dialog`).
   - **Typography & Rhythm**: Use `--typography-hero-display-*`, `--typography-section-title-*`, `--typography-card-title-*`, `--typography-lead-*`, `--typography-body-*` (`16px/24px`), and `--typography-eyebrow-*` (`data-role="eyebrow"`). Space sections via `--layout-hero-padding-block`, `--layout-section-padding-block`, and `--layout-container-max-width`.
2. **Compose Primitives—Never Reinvent Ad-Hoc Markup**:
   - Navbar mobile menu → accessible non-modal disclosure (`aria-expanded`, `aria-controls`, Escape dismissal, hidden when closed, `48×48px` trigger) or explicit `Sheet` when modal behavior is desired.
   - Pricing billing switch → `ToggleGroup` / `aria-pressed` buttons + data-driven `formatCurrency(amount, tier.currency)` + `<BidiText dir="ltr">`.
   - FAQ items → `Accordion` / disclosure buttons with `<h3>` headings and `aria-expanded` + `aria-controls`.
   - Waitlist/CTA form → `Label` + `Input` + `Button` + `role="status"` confirmation.
   - Icons → `<Icon name="..." />` from `@/components/icons` (zero raw `<svg>`).
3. **Semantic HTML, `lang` & Localization**:
   - Localize every section prop via the `website.*` message namespace (`en`, `fr`, `ar`)—never ship `dashboard.*` keys in Website or hardcoded `'Tokyo.dev'` defaults.
   - Mark English code/CLI snippets (`<pre lang="en" dir="ltr"><code>...</code></pre>`) with `lang="en"`; use `<BidiText dir="ltr">` without `lang="en"` for language-neutral numbers/prices/phones.
   - Ensure `website/src/app/` maintains `layout.tsx`, `page.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, and `loading.tsx` with `generateMetadata()`.

---

## Step 5: Mandatory Verification Gate Before Handoff

Run in exact order and report actual exit codes:

```bash
# 1. Mirror shared files and verify zero drift + zero dashboard shadows
node scripts/sync-shared.mjs
node scripts/sync-shared.mjs --check
node scripts/check-dashboard-shadows.mjs

# 2. Dashboard type-check, lint, and unit tests
cd typescript/nextjs/starterkit/dashboard
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/oxlint
./node_modules/.bin/vitest run

# 3. Website type-check, lint, and unit tests
cd ../website
./node_modules/.bin/tsc --noEmit
./node_modules/.bin/oxlint
./node_modules/.bin/vitest run
```

For overlays, navigation drawers, or layout/section changes, run Playwright E2E covering LTR (`en`), RTL (`ar`), coarse-pointer touch targets, and `prefers-reduced-motion: reduce`.

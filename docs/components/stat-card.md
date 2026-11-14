# StatCard — Component Specification

> **Status:** Audited Canonical Baseline  
> **Component:** `components/ui/stat-card`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/stat-card/`  
> **Gallery route:** `/gallery/stat-card`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **StatCard** is an information-dense KPI metric display component designed to present single business indicators (such as Revenue, Conversion Rate, Active Users, or Growth) alongside descriptive labels, status badges, trend deltas, and comparison baselines.

### 1.1 In Scope
- **Compound Structure**:
  - `StatCard`: Root card container (`as?: ElementType`, defaults to `<div>`) with semantic surface variants (`default | raised | subtle`) and density padding (`sm | md | lg`).
  - `StatCardHeader`: Top cluster containing the label/title and optional icon slot.
  - `StatCardTitle`: Descriptive KPI metric title (`as?: ElementType`, defaults to `<span>`).
  - `StatCardIcon`: Decorative icon wrapper (`aria-hidden="true"`).
  - `StatCardValue`: Prominent numerical metric with tabular figures (`font-variant-numeric: tabular-nums`).
  - `StatCardFooter`: Wrap-safe footer row for trend delta and description.
  - `StatCardTrend`: Indicator of relative change (`direction="up" | "down" | "neutral"`, optional `pill`, optional `icon`, optional screen-reader `label`).
  - `StatCardDescription`: Supporting comparison context text (`<p>`).
- **Universal Density Scale**:
  - `sm`: Compact padding (`--space-3`), value `var(--font-size-2xl)` (`24px`)
  - `md`: Standard default (`--space-5`), value `var(--typography-metric-value-size)` (`28px` Dashboard / `var(--font-size-3xl)`)
  - `lg`: Spacious KPI card (`--space-6`), value `var(--font-size-4xl)` (`32px`)
- **Surface Variants**:
  - `default`: Base surface (`--color-surface`) with `--color-border-subtle`.
  - `raised`: Elevated surface (`--color-surface-raised`) with `--color-border-strong`.
  - `subtle`: Low-contrast surface (`--color-surface-subtle`) with `--color-border-subtle`.
- **Trend Indication**:
  - `up`: `--color-success` (+ `--color-success-subtle` when `pill`).
  - `down`: `--color-danger` (+ `--color-danger-subtle` when `pill`).
  - `neutral`: `--color-text-muted` (+ `--color-surface-subtle` when `pill`).
- **Pure White-Label Boundaries**: React 19 `ref` as prop, 100% CSS logical properties, approved spacing/radius tokens, Arabic `:lang(ar)` line-height clearance & normal letter-spacing, zero dashboard shadows.

### 1.2 Out of Scope
- Full complex interactive time-series charts (covered by `Chart`).
- Tabular row data (covered by `DataTable`).

---

## 2. Visual & Semantic Token Contracts

| Element | Semantic Surface / Color Tokens | Typography & Spacing Tokens |
| :--- | :--- | :--- |
| **Root Surface** | `--color-surface*`, `--color-border-subtle` / `--color-border-strong` | `--radius-card`, `--space-3` / `--space-5` / `--space-6` |
| **Title** | `--color-text-secondary` | `--typography-label-size`, `--typography-label-line-height`, `--typography-label-weight` |
| **Value** | `--color-text-primary` | `--typography-metric-value-size`, `--typography-metric-value-line-height`, `--typography-metric-value-weight`, `tabular-nums`, `--letter-spacing-tight` (`normal` in `:lang(ar)`) |
| **Trend** | `--color-success` / `--color-danger` / `--color-text-muted` | `--typography-supporting-*`, `--space-0-5` gap, `--space-2` pill inline padding, `--radius-full` |
| **Description** | `--color-text-muted` | `--typography-supporting-size`, `--typography-supporting-line-height`, `--typography-supporting-weight` |

---

## 3. Accessibility & WAI-ARIA Matrix

1. **Heading Hierarchy**: `StatCardTitle` accepts `as` (e.g. `<h3>`) and `StatCard` accepts `as` (e.g. `<article>` / `<section>`).
2. **Tabular Numerals**: `font-variant-numeric: tabular-nums` prevents horizontal layout jitter during updates.
3. **Screen-Reader Trend Signal (WCAG 1.4.1)**: Icons carry `aria-hidden="true"`, while optional `label` on `StatCardTrend` renders a `.visuallyHidden` prefix so meaning does not rely solely on color.
4. **Bidirectional Safety**: Connected consumers wrap numeric currency/delta tokens in `<BidiText dir="ltr">` inside RTL contexts.

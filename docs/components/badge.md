# Badge — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/badge`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/badge/`  
> **Gallery route:** `/gallery/badge`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Badge** is a compact, non-intrusive status, category, or counter indicator used to communicate metadata, system states, numerical counts, tags, or operational stages at a glance.

### 1.1 In Scope
- **Semantic Status Variants**: `default` (neutral monochrome), `primary` (brand action), `success` (positive/active), `warning` (caution/pending), `danger` (destructive/error), `info` (informational), and `outline` (subtle border with transparent background).
- **Universal Density Scale**: Three explicit sizes matching the UI Kit's control token hierarchy:
  - `sm` (20px minimum block size / 1.25rem, compact data tables & dense list items)
  - `md` (24px minimum block size / 1.5rem, standard default for cards & pages)
  - `lg` (28px minimum block size / 1.75rem, prominent badges & hero sections)
- **Visual Modifier Roles**:
  - **Dot Indicator**: Optional colored status dot preceding the label (pulse / static).
  - **Numerical Counter / Tabular Numbers**: Optimized for numerical values (`font-variant-numeric: tabular-nums`) preventing layout shift on value changes.
  - **Removable / Dismissible Tag**: Optional inline remove button (`onRemove`) with accessible keyboard focus and ARIA labels.
  - **Pill vs Standard Radius**: Consumes semantic `--radius-full` for pill shape (default) or `--radius-control` (rectangular).
- **Pure White-Label Boundaries**: 100% CSS logical properties, zero dashboard shadows, native high-contrast support, and bidirectional RTL/LTR layout parity.

### 1.2 Out of Scope
- Full-page banner alerts (covered by `Alert` / `Callout`).
- Ephemeral floating message notifications (covered by `Toast`).
- Form chip input selectors with text search (covered by `Combobox` multi-select tags).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Badge` primitive resides in `src/components/ui/badge/` and strictly follows the kit's inviolable architectural rules:
- **Zero Third-Party UI Libraries:** Own all markup, styling, and behavior natively. No Radix, no MUI, no Chakra.
- **Pure Dependency Flow:** Never imports from `@/providers`, `@/i18n`, `@/components/patterns`, `@/components/shell`, or application state.
- **Localized Props:** All user-facing strings (e.g. `removeAriaLabel`) are passed through props from parent patterns; `Badge` never calls `t()` internally.
- **Bidirectional Support:** Uses 100% CSS logical properties (`padding-inline`, `padding-block`, `margin-inline-start`). Dot indicators, start icons, and close buttons automatically respect document `dir="rtl"`.
- **Zero Dashboard Shadows:** All elevation is achieved strictly through surface contrast (`--color-surface-subtle`, `--color-surface-raised`), semantic border tokens, and foreground contrast.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ passes translated strings & callbacks
Connected Patterns & Studio (components/patterns/badge-gallery/)
       ↓ binds props & renders specimen
Core UI Primitives (components/ui/badge/)
       ↓ pure primitive (badge.tsx, badge.module.css)
Design Tokens (tokens/color-roles.css, tokens/status-colors.css, tokens/controls.css)
```

---

## 3. Visual Variants & Semantic Token Contracts

All colors consume shared design tokens. In light mode, badges use subtle tinted backgrounds with high-contrast text and border; in dark mode, luminance is adjusted for dark surfaces without synthetic glows.

| Variant | Semantic Role | Background Token | Text Token | Border Token |
| :--- | :--- | :--- | :--- | :--- |
| **`default`** | Neutral / Categorical | `--color-surface-subtle` | `--color-text-primary` | `--color-border-subtle` |
| **`primary`** | Brand / Action / Active | `--color-primary-subtle` | `--color-primary-subtle-foreground` | `--color-primary-border` |
| **`success`** | Complete / Operational / Live | `--color-success-subtle` | `--color-success-foreground` | `--color-success-border` |
| **`warning`** | In Progress / Pending / Attention | `--color-warning-subtle` | `--color-warning-foreground` | `--color-warning-border` |
| **`danger`** | Blocked / Error / Critical | `--color-danger-subtle` | `--color-danger-foreground` | `--color-danger-border` |
| **`info`** | Notice / Feature / Guidance | `--color-info-subtle` | `--color-info-foreground` | `--color-info-border` |
| **`outline`** | Neutral Inactive / Ghost | `transparent` | `--color-text-secondary` | `--color-border-control` |

### 3.1 Density & Control Sizing Scale

| Size | Min Block Size (Height) | Padding Inline | Font Size | Line Height | Icon / Dot Size |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `20px` (`1.25rem`) | `6px` (`var(--space-1-5)`) | `12px` (`--font-size-xs`) | `16px` (`1rem`) | `6px` dot / `12px` icon |
| **`md`** | `24px` (`1.5rem`) | `8px` (`var(--space-2)`) | `12px` (`--font-size-xs`) | `16px` (`1rem`) | `8px` dot / `14px` icon |
| **`lg`** | `28px` (`1.75rem`) | `10px` (`0.625rem`) | `14px` (`--font-size-sm`) | `20px` (`1.25rem`) | `8px` dot / `16px` icon |

---

## 4. Accessibility & WAI-ARIA Matrix

1. **Semantic HTML**:
   - Renders honest inline semantic elements (`<span>` by default).
   - When dismissible (`onRemove` is provided), the remove action renders a native `<button type="button">` with an explicit `aria-label` (e.g. `removeAriaLabel="Remove Draft status"`).
2. **Status Announcements**:
   - For real-time changing status badges (e.g., live count updates or critical errors), parent containers provide `aria-live="polite"` or `role="status"`.
3. **Tabular Numerals**:
   - Count badges and numerical values apply `font-variant-numeric: tabular-nums` to ensure stable block layouts across changing digits without horizontal jitter.
4. **Contrast Compliance**:
   - Every variant passes WCAG 2.1 AA contrast requirements ($> 4.5:1$ against badge background, and badge background maintains clear boundary separation against parent surface).

---

## 5. Component API & Props Specification

```typescript
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md' | 'lg';
export type BadgeShape = 'pill' | 'rounded';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The content of the badge (label, count, or composition) */
  children: React.ReactNode;

  /** Semantic color variant. Defaults to 'default' */
  variant?: BadgeVariant;

  /** Sizing density step. Defaults to 'md' */
  size?: BadgeSize;

  /** Corner geometry: 'pill' (radius-full) or 'rounded' (radius-control). Defaults to 'pill' */
  shape?: BadgeShape;

  /** Optional leading icon element */
  startIcon?: React.ReactNode;

  /** Whether to show a colored semantic status dot indicator */
  dot?: boolean;

  /** Whether the dot indicator animates with a subtle pulse */
  dotPulse?: boolean;

  /** Callback fired when the dismissible remove button is clicked */
  onRemove?: () => void;

  /** Accessible label for the remove button. Required when onRemove is passed */
  removeAriaLabel?: string;

  /** Additional CSS class names */
  className?: string;
}
```

---

## 6. Implementation & Delivery Plan

1. **Primitive Implementation (`src/components/ui/badge/`)**:
   - `badge.tsx`: Pure primitive with variant classes, sizing data attributes, leading icon, status dot, and accessible remove button.
   - `badge.module.css`: 100% CSS logical properties, semantic status tokens, zero dashboard shadows, tabular figures.
   - `badge.test.tsx`: Vitest suite covering all 7 variants, 3 sizes, dot indicator, dismiss action keyboard/click, and ref forwarding.
   - `index.ts`: Barrel export.
2. **Interactive Studio (`src/components/patterns/badge-gallery/`)**:
   - Live specimen stage with Variant, Size, Shape, Dot, Pulse, and Removable toggles.
   - Status specimen matrix displaying real-world patterns (Deployment status, Role tags, Notification counters, Pricing tiers).
   - 1-click JSX/CSS code inspector with copyable AI prompt export.
   - Next.js page routes (`/gallery/badge`) in both Dashboard and Website starters.
3. **Quality Gates**:
   - `tsc --noEmit` clean across both starters.
   - `vitest run` passes 100%.
   - `node scripts/sync-shared.mjs --check` validates zero drift.
   - `node scripts/check-dashboard-shadows.mjs` confirms 100% shadow-free dashboard compliance.

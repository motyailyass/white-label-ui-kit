# Card — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/card`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/card/`  
> **Gallery route:** `/gallery/card`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Card** is a structured, composable container used to group related information, actions, and media into a distinct visual surface. It forms the foundational building block for dashboard metric widgets, settings sections, user profiles, pricing grids, and website feature blocks.

### 1.1 In Scope
- **Sub-Component Compound Hierarchy**:
  - `Card`: Outer container managing surface tokens, boundary borders, padding density, and corner geometry.
  - `CardHeader`: Top compartment grouping title, description, and optional header action slot.
  - `CardTitle`: Semantic heading slot with polymorphic `as` prop (`h1`–`h6`, `span`, default `h3`).
  - `CardDescription`: Supporting copy slot styled with muted typography and `:lang(ar)` line-height clearance.
  - `CardContent`: Primary body area for data visualization, forms, tables, or unstructured text.
  - `CardFooter`: Bottom compartment typically holding primary/secondary actions, timestamps, or metadata.
- **Surface & Visual Variants**:
  - `default`: Base surface (`--color-surface`) with subtle border (`1px solid var(--color-border-subtle)`).
  - `subtle`: Secondary tinted surface (`--color-surface-subtle`) for contrast against base canvases.
  - `raised`: Elevated surface (`--color-surface-raised`) with reinforced border (`1px solid var(--color-border-strong)`).
  - `interactive`: Clickable/selectable card with keyboard focus rings, hover/active surface transitions, and pointer cursor.
- **Padding Density Scale**:
  - `none`: `0` (used when children provide bespoke bleed or internal edge-to-edge images/tables).
  - `sm`: Compact padding (`--space-3` / 12px) for high-density dashboard feeds and compact widgets.
  - `md`: Standard default padding (`--space-5` / 20px) for standard widgets and cards.
  - `lg`: Spacious padding (`--space-6` / 24px below `48rem`, `--space-8` / 32px at `>= 48rem`) for website feature cards and pricing tiers.
- **Dividers & Structural Borders**:
  - Optional header divider (`border-block-end: 1px solid var(--color-border-subtle)`).
  - Optional footer divider (`border-block-start: 1px solid var(--color-border-subtle)`).
- **White-Label & Policy Discipline**:
  - **100% Shadow-Free Dashboard**: Depth achieved strictly via surface steps, boundary borders, and layering—zero box-shadows.
  - **Restrained Website Shadows**: Local opt-in shadow consuming `--website-shadow-card` strictly on the website product.
  - **100% CSS Logical Properties**: Logical padding (`padding-inline`, `padding-block`) and borders (`border-block-*`).

### 1.2 Out of Scope
- Full-page modal dialog wrappers (handled by `Dialog`).
- Slide-over drawers (handled by `Panel` / `Sheet`).
- Toast notifications (handled by `Toast`).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Card` family lives in `src/components/ui/card/` and adheres strictly to the architectural standards:
- **Zero Third-Party UI Libraries:** Own all markup, styling, and behavior natively. No Radix, no MUI, no Chakra.
- **Framework Neutrality:** Never import Next.js modules (`next/link`, `next/image`, `next/navigation`) inside `components/ui/`.
- **Pure Dependency Flow:** Never imports from `@/providers`, `@/i18n`, `@/components/patterns`, `@/components/shell`, or application state.
- **Honest Semantic HTML:** Exposes polymorphic `as` slots so consumers can render `<article>`, `<section>`, `<aside>`, or `<div>` without over-tagging generic containers.

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ consumes via localized props & slots
Connected Patterns & Studio (components/patterns/card-gallery/)
       ↓ binds props & renders specimen
Core UI Primitives (components/ui/card/)
       ├─ Card (card.tsx, card.module.css)
       ├─ CardHeader, CardTitle, CardDescription
       └─ CardContent, CardFooter
Design Tokens (tokens/colors.css, tokens/radius.css, tokens/spacing.css)
```

---

## 3. Visual Styling & Token Contracts

### 3.1 Variant Matrix

| Variant | Surface Token | Border Token | Hover State (if interactive) |
| :--- | :--- | :--- | :--- |
| **`default`** | `--color-surface` | `--color-border-subtle` | `--color-surface-hover` + `--color-border-strong` |
| **`subtle`** | `--color-surface-subtle` | `--color-border-subtle` | `--color-surface-hover` + `--color-border-strong` |
| **`raised`** | `--color-surface-raised` | `--color-border-strong` | `--color-surface-hover` + `--color-border-strong` |
| **`interactive`** | `--color-surface` | `--color-border-subtle` | `--color-surface-hover` + `--color-border-strong` + focus ring |

### 3.2 Radius & Typography Architecture
- Consumes product-owned semantic radius role `--radius-card`:
  - **Dashboard**: `8px` (`--radius-card: var(--radius-lg)`).
  - **Website**: `12px` (`--radius-card: var(--radius-xl)`).
  - **Feature / Hero (Website opt-in)**: `16px` (`--radius-feature: var(--radius-2xl)`).
- `.card` avoids `overflow: hidden` so rounded card edges never clip focus outlines of inner controls. Media bleed images opt in locally via inherited start/end logical radii.
- `CardTitle` consumes product-owned `--typography-card-title-size`, `--typography-card-title-weight`, and `--typography-card-title-line-height` with `:lang(ar)` stack (`--font-family-arabic`) and diacritic clearance, while `CardDescription` applies `--line-height-arabic-normal` under `:lang(ar)`.

### 3.3 Density Scale & Logical Padding

| Density Step | Inline Padding | Block Padding | Compartment Gap (`CardContent`) |
| :--- | :--- | :--- | :--- |
| **`none`** | `0` | `0` | `--space-3` (`12px`) |
| **`sm`** | `12px` (`--space-3`) | `12px` (`--space-3`) | `--space-3` (`12px`) |
| **`md`** *(Default)* | `20px` (`--space-5`) | `20px` (`--space-5`) | `--space-3` (`12px`) |
| **`lg`** | `24px` → `32px` (`--space-6` / `--space-8`) | `24px` → `32px` (`--space-6` / `--space-8`) | `--space-3` (`12px`) |

---

## 4. Accessibility & Semantic HTML

1. **Heading Hierarchy Preservation**:
   - `CardTitle` provides an `as` prop defaulting to `<h3>`. Consumers can pass `as="h2"` or `as="h4"` to maintain sequential headings without skipping levels (`<h1>` → `<h2>` → `<h3>`).
2. **Accessible Landmarks**:
   - For standalone content pieces (e.g. blog post preview, user profile card), consumers pass `as="article"`.
   - For document sections, consumers pass `as="section" aria-labelledby={headingId}`.
3. **Interactive Card Accessibility**:
   - When `interactive` is enabled (or `variant="interactive"`), the card receives `tabIndex={0}`, `role="button"`, and standard focus ring indicators (`outline: var(--focus-ring-width) solid var(--color-border-focus)`).
   - Enter and Space keystrokes trigger `onClick` only when the card root itself owns focus (nested interactive elements handle their own Enter/Space activation).

---

## 5. Component API Specification

```typescript
export type CardVariant = 'default' | 'subtle' | 'raised' | 'interactive';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardElement = 'div' | 'article' | 'section' | 'aside';
export type CardHeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'span';
export type CardFooterAlign = 'end' | 'between' | 'start' | 'stretch';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual surface variant. Defaults to 'default' */
  variant?: CardVariant;

  /** Internal padding density scale. Defaults to 'md' */
  padding?: CardPadding;

  /** Whether the card is interactive (clickable with hover, active, and focus rings) */
  interactive?: boolean;

  /** HTML element tag rendered for the card root. Defaults to 'div' */
  as?: CardElement;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to render a subtle bottom dividing line */
  divider?: boolean;
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading semantic tag. Defaults to 'h3' */
  as?: CardHeadingElement;
}

export type CardDescriptionProps = HTMLAttributes<HTMLParagraphElement>;

export type CardContentProps = HTMLAttributes<HTMLDivElement>;

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether to render a subtle top dividing line */
  divider?: boolean;

  /** Alignment of footer actions: 'end' | 'between' | 'start' | 'stretch'. Defaults to 'end' */
  align?: CardFooterAlign;
}
```

---

## 6. Implementation & Verification Plan

1. **Core UI Primitives (`src/components/ui/card/`)**:
   - `card.tsx`: Compound components (`Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`).
   - `card.module.css`: 100% CSS logical properties, semantic tokens, zero dashboard shadows, responsive paddings.
   - `card.test.tsx`: Vitest suite testing compound slot composition, polymorphic element rendering (`as`), interactive keyboard/click events, divider lines, and variant classes.
   - `index.ts`: Barrel exports.
2. **Interactive Component Studio (`src/components/patterns/card-gallery/`)**:
   - Live specimen stage testing variants, density padding (`none` media bleed, `sm`, `md`, `lg`), header/footer dividers, footer alignments, and interactive keyboard/click events.
   - Variant & density matrix (`View Mode`): 4 surface variants (`default`, `subtle`, `raised`, `interactive`) and 3 padding density steps (`sm`, `md`, `lg`).
   - Code inspector with dynamic JSX, CSS module tokens, and AI prompt export.
   - Routes: `/gallery/card` in both Dashboard and Website starters.
3. **Quality Gates**:
   - `tsc --noEmit` clean on Dashboard and Website.
   - `vitest run card.test.tsx` passes 100%.
   - `node scripts/sync-shared.mjs --check` validates zero drift.
   - `node scripts/check-dashboard-shadows.mjs` confirms 100% shadow-free dashboard compliance.
   - `next build` passes in both starters.

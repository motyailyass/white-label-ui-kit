# Tech Stack & Architectural Standards

**Document Status:** Official Implementation Standard  
**Applies to:** Website Starter Kit & Dashboard Starter Kit (`Next.js` and `Vite` implementations)  
**Related Reference:** [RTL & Internationalization Standard](./RTL_AND_I18N.md)

---

## 1. Executive Summary & Core Principles

This starter kit provides a production-grade, unbranded, white-label UI foundation engineered for any website, SaaS platform, or internal software.

### The Seven Inviolable Principles

1. **100% Internally Owned UI (Zero UI Libraries)**:
   - **No Radix, no MUI, no Chakra, no shadcn, no third-party headless UI runtimes.**
   - Every component in `src/components/ui/` is written from scratch using pure React, TypeScript, native HTML5 APIs (`<dialog>`, Popover API, `<details>`, etc.), and explicit WAI-ARIA standards.
   - Zero vendor lock-in. 100% internal code ownership. Hugeicons (`@hugeicons/react`, `@hugeicons/core-free-icons`) is the sole third-party visual exception, strictly encapsulated behind `src/components/icons/`.

2. **Native CSS Modules + CSS Custom Properties (Zero Tailwind)**:
   - **No Tailwind CSS, no CSS-in-JS runtimes, no pre-styled frameworks.**
   - All styling is authored in dedicated CSS Modules (`*.module.css`) consuming a semantic token contract via native CSS variables (`var(--color-bg-base)`, `var(--radius-control)`, etc.).
   - Switching brands or themes (Light/Dark/Custom) requires changing only CSS variable values, never component logic.

3. **Strict Four-Tier Layer Boundary**:
   - The **Core UI Layer (`src/components/ui/*`)** is completely pure. It receives native props (`value`, `onChange`, `disabled`, `loading`, `children`, `className`). It **NEVER** imports from `@/providers`, `@/i18n`, `@/components/patterns`, `@/components/shell`, `@/layouts`, `next/*`, TanStack Query, Zustand, React Hook Form, or Zod.
   - **Connected Patterns & Shell (`src/components/patterns/*`, `src/components/shell/*`, `src/components/website/*`)** bind providers and i18n to pure UI primitives while remaining framework-neutral (zero `next/*` imports).
   - **Host Routes (`src/app/` in Next.js, `src/main.tsx` / `src/App.tsx` in Vite)** own framework-specific routing, metadata, font loading, and server refresh wiring.

4. **Modern High-Performance Tooling**:
   - **Biome** (`linter.enabled: false`) is the sole formatting authority across `src` and `e2e`.
   - **Oxlint** is the sole linting authority, enforcing zero explicit `any` (`typescript/no-explicit-any: "error"`) and architectural import boundaries (`no-restricted-imports`).
   - **TypeScript (`tsc --noEmit`)** is the strict type-checking authority.

5. **Dual-Tier Automated Testing**:
   - **Vitest + React Testing Library** for real component unit, accessibility, keyboard, and public API contract tests.
   - **Playwright** for real-browser end-to-end user workflows, overlays, focus containment, reduced motion, RTL layout, and typography/control-sizing verification against rendered DOM elements.

6. **Native RTL & Internationalization (i18n) First (Arabic/MENA Ready)**:
   - **Zero-Retrofit RTL Architecture**: Every component is built RTL-compliant from day one.
   - **CSS Logical Properties Mandatory**: Physical direction properties (`margin-left`, `padding-right`, `left`, `right`, `border-left`, `float: left`, `text-align: left`) are strictly prohibited. Authors use `margin-inline`, `padding-block`, `inset-inline-*`, `border-inline-*`, and `text-align: start/end`.
   - **Bi-directional (Bidi) & Honest `lang` Handling**: Native `<bdi>` via `<BidiText>` (`@/i18n`) isolates embedded LTR tokens inside RTL prose, while explicit `lang="..."` tags mark genuine foreign-language labels and prose so screen readers and `:lang()` CSS rules both work accurately.
   - **Self-Hosted Variable Fonts & Arabic Typography**: Self-hosted `Geist-Variable.woff2`, `GeistMono-Variable.woff2`, and `NotoSansArabic-Variable.woff2` bundled locally with `:lang(ar)` line-height clearance, normal cursive letter-spacing, and nested `:lang(en)` / `:lang(fr)` restoration.
   - **Native Formatting Engine**: Zero-dependency `Intl` utilities (`formatNumber`, `formatCurrency`, `formatPercent`, `formatDate`, `formatRelativeTime`) where **data determines the currency and locale determines how it is displayed**.
   - **Mirrored Icons System**: Semantic icon registry (`src/components/icons/registry.ts`) flagging directional glyphs via `directional()` for automatic `[dir="rtl"] .mirror` flipping.

7. **Complete Starter Independence (Zero Coupling at Delivery)**:
   - **Shared Internally, Independent at Delivery**: Shared core modules (`components/ui`, `components/icons`, `providers`, `lib`, `styles/tokens`, shared `i18n` engine + `common`/`errors` messages, shared `components/patterns`) are authored in `dashboard/src` and mirrored via `node scripts/sync-shared.mjs`, while starter-owned dictionaries (`dashboard`/`settings` vs `website`) and product presets remain strictly isolated.
   - **Zero Monorepo or Sibling Dependencies**: Starters contain zero sibling imports (`../../dashboard` or `@starterkit/*`) and install, type-check, lint, test, and build independently when extracted into an empty directory.
   - **Early Vite Portability Validation**: A minimal Vite reference starter (`typescript/vite/starterkit/dashboard`) validates framework-neutral primitives, providers, tokens, and `@font-face` font delivery alongside Next.js before scaling the catalog.

---

## 2. Official Technology Stack Matrix

### A. Universal Base Starter Kit (Installed in `package.json`)

| Area | Package / Technology | Version | Authority / Scope |
| :--- | :--- | :--- | :--- |
| **Application Host** | `next` *(Next.js Starters)*<br>`vite` *(Vite Reference)* | `^16.4.0`<br>`^8.3.5` | Full-stack App Router for Next.js; fast client SPA bundler for Vite. |
| **Core UI Runtime** | `react`, `react-dom` | `^19.1.0` | 100% internally developed primitives. Zero external UI component libraries. |
| **Web Styling** | CSS Modules + Custom Properties | Native W3C | Component-scoped styles (`*.module.css`) + semantic tokens (`src/styles/tokens/`). Strict CSS Logical Properties. |
| **Class Name Utility** | Zero-Dependency `cn` | Internal | Pure TypeScript helper (`src/lib/cn.ts`) for merging CSS module classes. |
| **RTL & Internationalization** | Native `Intl` + W3C Bidi + Logical CSS | Internal Engine | Zero external runtime dependencies (`src/i18n/`, `src/providers/`). Strict `TranslationKey`, `BidiText`, and native formatters. |
| **Icons** | Semantic Registry + Hugeicons | `^1.1.10` / `^4.4.0` | Semantic name mapping (`src/components/icons/`) with `directional()` RTL mirroring. |
| **Code Formatting** | `@biomejs/biome` | `^2.6.4` | Sole formatter across TypeScript, CSS, and JSON (`linter.enabled: false`). |
| **Linter** | `oxlint` | `^0.15.10` | Sole linter enforcing type hygiene and architectural `no-restricted-imports` rules. |
| **Type Checking** | `typescript` (`tsc`) | `^7.0.2` | Standalone strict type verification (`tsc --noEmit`). |
| **Unit & Component Tests** | `vitest`, `@testing-library/react` | `^5.0.5`, `^16.2.0` | Behavioral contracts, keyboard interactions, and ARIA compliance. |
| **End-to-End Tests** | `@playwright/test` | `^1.50.1` | Real-browser workflows, focus trapping, overlays, RTL, and computed token checks. |

### B. Optional Project Add-Ons (Opt-In Recipes)
These libraries are **never forced** in the base starter kit. When a specific product requires them, they are installed strictly in the feature/app layer:

| Feature Need | Recommended Package | How It Plugs In |
| :--- | :--- | :--- |
| **Server-State Caching** | `@tanstack/react-query` | Plugs into feature hooks. Never imported in `components/ui/`. |
| **Transient Global State** | `zustand` | Plugs into app features. Never imported in `components/ui/`. |
| **Form Management** | `react-hook-form` | Plugs into native UI controls via props/refs. Never imported in `components/ui/`. |
| **Runtime Schema Validation** | `zod` | Validates API/env boundaries and form schemas outside `components/ui/`. |
| **Headless Data Grid** | `@tanstack/react-table` | Optional table state engine; UI table markup remains native. |
| **Rich-Text Editor** | `@tiptap/react` | Isolated feature module; sanitize untrusted HTML via DOMPurify. |

---

## 3. Architectural Layers & Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│               1. APP ROUTES, LAYOUTS & TEMPLATES                       │
│  src/app/ (Next.js) or src/main.tsx (Vite), src/layouts/, wireframes/  │
│  • Host routing, generateMetadata(), next/font or @font-face           │
│  • AppProvidersBridge (router.refresh() on locale change in Next.js)   │
│  • Layouts & templates receiving localized content via props           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via props & host-agnostic slots (as, imageComponent)
┌───────────────────────────────────▼────────────────────────────────────┐
│               2. CONNECTED PATTERNS, SHELL & WEBSITE                   │
│  src/components/patterns/*, src/components/shell/*, components/website/│
│  • Binds useTheme() & useI18n() to pure UI primitives                  │
│  • AppShell, Sidebar, Header, Panel, ErrorState, Switchers             │
│  • Zero next/* imports — 100% portable across Next.js and Vite         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via pure props & callbacks
┌───────────────────────────────────▼────────────────────────────────────┐
│               3. CORE UI PRIMITIVES & SEMANTIC ICONS                   │
│  src/components/ui/*, src/components/icons/*                           │
│  • 100% pure (Button, ThemeToggle, ControlSizing, Icon)                │
│  • Zero providers, i18n, router, query, store, or form imports         │
│  • CSS Modules (*.module.css) with strict CSS Logical Properties       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via CSS custom properties
┌───────────────────────────────────▼────────────────────────────────────┐
│               4. TOKENS, PRESETS & FOUNDATION                          │
│  src/styles/tokens/*, src/styles/{dashboard,website}/*, i18n/, lib/    │
│  • Neutral/brand/status colors, typography, spacing, radius, controls  │
│  • Z-index & motion scales, scroll-lock ref counter, i18n formatters   │
└────────────────────────────────────────────────────────────────────────┘
```

### Boundary Enforcement Rules (Enforced by `.oxlintrc.json`)

1. **Pure Core UI (`src/components/ui/**`)**:
   - Importing `@/providers`, `@/i18n`, `@/components/patterns`, `@/components/shell`, `@/layouts`, `next/*`, `@tanstack/react-query`, `zustand`, `react-hook-form`, or `zod` inside `src/components/ui/` fails `pnpm lint`.
2. **Framework Neutrality**:
   - Importing `next/*` outside `src/app/**` fails `pnpm lint`. Reusable components accept `as` and `imageComponent` props.
3. **Icon Vendor Encapsulation**:
   - Importing `@hugeicons/*` outside `src/components/icons/**` fails `pnpm lint`.
4. **Styling & Configurable Dimensions**:
   - Zero utility classes from external frameworks and zero physical inline layout styles (`width`, `minWidth`).
   - Legitimate runtime-configurable shell dimensions (`sidebarWidth`, `panelWidth`) pass typed CSS custom properties (`--sidebar-width`, `--panel-width`) consumed by CSS Modules without `!important`.

---

## 4. Component Structure Standard

Every component in `src/components/ui/` follows this directory structure:

```text
src/components/ui/[component-name]/
├── [component-name].tsx           # Component logic & TypeScript interface
├── [component-name].module.css    # Scoped styles consuming CSS variables & logical properties
├── [component-name].test.tsx      # Vitest + Testing Library test suite
└── index.ts                       # Public barrel export
```

### Verified Component Contract (`Button`)

```tsx
// src/components/ui/button/button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ControlSizingProps {
  variant?: ButtonVariant;
  fullWidth?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'secondary',
      size,
      touchTarget,
      fullWidth = false,
      loading = false,
      disabled,
      type = 'button',
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        data-size={size}
        data-touch-target={touchTarget}
        className={cn(
          styles.button,
          styles[variant],
          fullWidth && styles.fullWidth,
          loading && styles.loading,
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className={styles.spinner} aria-hidden="true" />
        ) : (
          startIcon && <span className={styles.iconSlot}>{startIcon}</span>
        )}
        {children != null && <span className={styles.label}>{children}</span>}
        {endIcon && <span className={styles.iconSlot}>{endIcon}</span>}
      </button>
    );
  },
);

Button.displayName = 'Button';
```

---

## 5. Token System Specification (`src/styles/tokens/`)

Tokens are native CSS custom properties structured across shared primitives and product-owned presets:

1. **`colors.css`**: Canonical nine-step neutral primitive ramp (`--color-neutral-0` `#ffffff` to `--color-neutral-8` `#000000`). Fixed across themes.
2. **`color-roles.css`**: Shared semantic text roles (`--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-placeholder`, `--color-text-disabled`, `--color-text-inverse`, `--color-text-on-active`), border/focus roles (`--color-border-subtle`, `--color-border-strong`, `--color-border-control`, `--color-border-focus`, `--color-border-disabled`), 7-token brand primary contract (`--color-primary*`), and control/selection surfaces.
3. **`status-colors.css`**: Functional status indicators for Success, Warning, Danger, and Information (`--color-status-{success,warning,danger,info}*`).
4. **Preset Surface & Brand Architecture (`styles/{dashboard,website}/`)**:
   - `dashboard/colors.css`: Softened analytical canvas (`--color-bg-base`: N1 light / N7 dark).
   - `website/colors.css`: High-contrast editorial canvas (`--color-bg-base`: N0 light / N8 dark).
   - `dashboard/brand.css` & `website/brand.css`: Product-local brand overrides.
5. **`typography.css` & Product Typography Presets**:
   - **11-step rem scale**: `--font-size-xs` (12px) through `--font-size-7xl` (64px). Sub-12px tokens are prohibited.
   - **Approved weights**: Regular 400 (`--font-weight-regular`, plus `--font-weight-normal` alias), Medium 500 (`--font-weight-medium`), Semibold 600 (`--font-weight-semibold`), Bold 700 (`--font-weight-bold`).
   - **Self-hosted variable fonts**: `Geist-Variable.woff2` (`--font-family-sans`), `GeistMono-Variable.woff2` (`--font-family-mono`), and `NotoSansArabic-Variable.woff2` (`--font-family-arabic`) bundled locally in `src/styles/fonts/` with SIL OFL-1.1 licenses.
   - **Product presets**: `dashboard/typography.css` (compact 14px/20px body) and `website/typography.css` (comfortable 16px/24px body and responsive display headings), including role-appropriate `:lang(ar)` line-height clearance.
6. **`spacing.css` & Product Spacing Presets**:
   - **4px-base primitive scale**: `--space-0` through `--space-32` (with `--space-0-5` 2px micro step).
   - **Product presets**: `dashboard/spacing.css` (compact analytical rhythm) and `website/spacing.css` (responsive section rhythm). Single boundary ownership prevents doubled gutters.
7. **`radius.css` & Product Radius Presets**:
   - **Primitive scale**: `--radius-none` (0) through `--radius-2xl` (16px) and `--radius-full` (9999px).
   - **Product presets**: Dashboard controls default to `6px` (`--radius-control: var(--radius-md)`); Website controls default to `8px` (`--radius-control: var(--radius-lg)`).
8. **`controls.css` & Product Control Defaults**:
   - **Six-step scale**: `xs` (28px), `sm` (32px), `md` (36px), `lg` (40px), `xl` (48px), `2xl` (56px) as minimum border-box block sizes (`min-block-size`), plus `--control-touch-target-min: 3rem` (48px).
   - **Product defaults**: Dashboard defaults to `md` (36px); Website defaults to `xl` (48px). Explicit `size="md"` renders identically in both starters.
9. **`z-index.css`**:
   - **10-step ascending scale**: `--z-base` (0), `--z-raised` (10), `--z-sticky` (100), `--z-dropdown` (200), `--z-overlay` (300), `--z-drawer` (310), `--z-modal-backdrop` (400), `--z-modal` (410), `--z-toast` (500), `--z-tooltip` (600), plus semantic aliases (`--z-header`, `--z-sidebar`, `--z-panel`). Magic numbers (`9999`) are forbidden.
10. **`motion.css`**:
    - **4-step duration scale**: `--motion-duration-instant` (0ms), `--motion-duration-fast` (120ms), `--motion-duration-normal` (180ms), `--motion-duration-slow` (240ms) and three easings (`--motion-ease-standard`, `--motion-ease-enter`, `--motion-ease-exit`).
    - Under `prefers-reduced-motion: reduce`, duration tokens collapse to `0ms` and `scroll-behavior: auto !important` is enforced. Never use `transition: all` or gate state cleanup on `transitionend`.
11. **`accessibility.css` & Shadow Policy**:
    - Shadow-free keyboard focus rings (`--focus-ring-width: 2px`, `--focus-ring-offset: 2px`, `--color-border-focus`).
    - **Dashboard is 100% shadow-free** (enforced by `node scripts/check-dashboard-shadows.mjs`). Website shadows live exclusively in `styles/website/shadows.css` with zero horizontal offset.
12. **`index.css`**: Canonical token barrel imported before product presets in `globals.css`.

---

## 6. Dependency & Pre-Merge Checklist

Before adding a dependency or merging component work, verify:
- [ ] **Native First**: Can modern browser APIs (`Intl`, `<dialog>`, CSS Logical Properties) solve it with zero dependencies?
- [ ] **Zero Headless UI**: No third-party UI or headless primitives introduced.
- [ ] **Permissive License**: MIT, Apache-2.0, or BSD-3-Clause only.
- [ ] **Boundary Compliance**: `pnpm lint` (`oxlint`), `pnpm type-check` (`tsc --noEmit`), `pnpm test` (`vitest run`), `pnpm run sync:shared:check`, and `pnpm run check:shadows` all exit `0`.
- [ ] **RTL, Bidi & Reduced Motion**: Verified in `dir="rtl"` (`lang="ar"`) and `prefers-reduced-motion: reduce`.

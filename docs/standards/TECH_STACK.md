# Tech Stack & Architectural Standards

**Document Status:** Official Implementation Standard  
**Applies to:** Website Starter Kit & Dashboard Starter Kit (`Next.js` and `Vite` implementations)  
**Related Reference:** [RTL & Internationalization Standard](./RTL_AND_I18N.md)

---

## 1. Executive Summary & Core Principles

This starter kit provides a production-grade, unbranded, white-label UI foundation engineered for any website, SaaS platform, or internal software.

### The Six Inviolable Principles

1. **100% Internally Owned UI (Zero UI Libraries)**:
   - **No Radix, no MUI, no Chakra, no shadcn, no third-party headless UI runtimes.**
   - Every component in `src/components/ui/` is written from scratch using pure React, TypeScript, native HTML5 APIs (`<dialog>`, Popover API, `<details>`, etc.), and explicit WAI-ARIA standards.
   - Zero vendor lock-in. 100% internal code ownership.

2. **Native CSS Modules + CSS Custom Properties (Zero Tailwind)**:
   - **No Tailwind CSS, no CSS-in-JS runtimes, no pre-styled frameworks.**
   - All styling is authored in dedicated CSS Modules (`*.module.css`) consuming a semantic token contract via native CSS variables (`var(--color-bg-base)`, `var(--radius-md)`, etc.).
   - Switching brands or themes (Light/Dark/Custom) requires changing only CSS variable values, never component logic.

3. **Strict Layer Boundary: Core UI vs. Application Features**:
   - The **Core UI Layer (`src/components/ui/*`)** is completely pure. It receives native props (`value`, `onChange`, `error`, `disabled`, `children`, `className`). It **NEVER** imports or depends on TanStack Query, Zustand, React Hook Form, or Zod.
   - The **Application / Feature Layer** leverages TanStack Query, Zustand, React Hook Form, and Zod to provide pre-wired, production-ready blueprints (e.g., settings forms, authenticated navigation, data fetching, global modals).

4. **Modern High-Performance Tooling**:
   - **Biome** is the sole formatting authority.
   - **Oxlint** is the primary linting authority.
   - **TypeScript (`tsc --noEmit`)** is the strict type-checking authority.
   - Fast, Rust-based developer ergonomics with zero legacy configuration bloat.

5. **Dual-Tier Automated Testing**:
   - **Vitest + React Testing Library** for component unit, accessibility, and public API contract tests.
   - **Playwright** for real-browser end-to-end user workflows, overlays, keyboard focus loops, and visual regression.

6. **Native RTL & Internationalization (i18n) First (Arabic/MENA Ready)**:
   - **Zero-Retrofit RTL Architecture**: Every component is built RTL-compliant from day one. Retrofitting RTL into 60 components after authoring is painful and costly.
   - **CSS Logical Properties Mandatory**: Physical direction properties (`margin-left`, `padding-right`, `left`, `right`, `border-left`, `float: left`, `text-align: left`) are strictly prohibited in `src/components/ui/` and layouts. Authors must strictly use `margin-inline`, `padding-block`, `inset-inline-*`, `border-inline-*`, and `text-align: start/end`.
   - **Bi-directional (Bidi) Handling**: Native `<bdi>` and `<BidiText>` prevent text and punctuation bleed when Arabic (RTL) text embeds Latin/English words, phone numbers, tracking codes, or URLs.
   - **Arabic Typography Stacks**: Specialized Arabic font tokens (`--font-family-arabic`, `--font-family-arabic-heading`) with vertical line-height compensation for tall Arabic ascenders and descenders.
   - **Native Formatting Engine**: Native zero-dependency `Intl` utilities (`formatNumber`, `formatCurrency`, `formatDate`, `formatRelativeTime`) supporting Western Latin (`latn`) and Eastern Arabic (`arab`) numbering systems.
   - **Mirrored Icons System**: Systematic classification distinguishing directional icons that must mirror in RTL (`<MirroredIcon>` / `data-mirror-rtl="true"`) from non-directional icons that must never mirror.

---

## 2. Official Technology Stack Matrix

### A. Universal Base Starter Kit (Installed in `package.json`)
The base starter kit contains only **3 runtime dependencies**, guaranteeing zero vendor lock-in, zero bloat, and total freedom for any project:

| Area | Package / Technology | Version | Authority / Scope |
| :--- | :--- | :--- | :--- |
| **Application Framework** | `next` *(Next.js Starter)*<br>`vite` *(Vite Starter)* | `^16.4.0`<br>`^6.2.0` | Full-stack App Router for Next.js; ultra-fast client-side SPA for Vite. |
| **Core UI Runtime** | `react`, `react-dom` | `^19.1.0` | 100% internally developed primitives. Zero external UI component libraries. |
| **Web Styling** | CSS Modules + Custom Properties | Native W3C | Component-scoped styles (`*.module.css`) + semantic tokens (`src/styles/tokens/`). Strict CSS Logical Properties. |
| **Class Name Utility** | Zero-Dependency `cn` | Internal | Pure TypeScript helper (`src/lib/cn.ts`) for merging CSS module classes without `clsx`. |
| **RTL & Internationalization** | Native `Intl` + W3C Bidi + Logical CSS | Internal Engine | Zero external dependencies (`src/lib/i18n/`). `I18nProvider`, `useDirection`, `BidiText`, `MirroredIcon`, and native formatters. |
| **Icons** | Native Accessible SVG System | Internal | Stroke-based accessible SVG icons with automatic RTL mirroring capability. |
| **Code Formatting** | `@biomejs/biome` | `^2.6.3` | Formatter across all TypeScript, CSS, and JSON files. |
| **Linter** | `oxlint` | `^0.15.10` | High-performance linter across the entire repository. |
| **Type Checking** | `typescript` (`tsc`) | `^7.0.2` | Standalone strict type verification (`tsc --noEmit`). |
| **Unit & Component Tests** | `vitest`, `@testing-library/react` | `^5.0.5`, `^16.2.0` | Component behavioral contracts, keyboard interactions, and ARIA compliance. |
| **End-to-End Tests** | `@playwright/test` | `^1.50.1` | Full browser workflows, focus trapping, overlays, and visual regression. |

### B. Optional Project Add-Ons (Opt-In Recipes)
These libraries are **never forced** in the base starter kit. When a specific product or client requires them, they are installed as opt-in feature modules:

| Feature Need | Recommended Package | Version | How It Plugs In |
| :--- | :--- | :--- | :--- |
| **Server-State Caching** | `@tanstack/react-query` | `^5.67.0` | Plugs into data-fetching hooks (e.g. `useUserData()`). Never imported in `ui/`. |
| **Transient Global State** | `zustand` | `^5.0.3` | Plugs into app shell for global sidebar/modal triggers. Never imported in `ui/`. |
| **Form Management** | `react-hook-form` | `^7.55.0` | Plugs directly into native UI `<Input>` and `<Select>` via `...register()`. |
| **Runtime Schema Validation**| `zod` | `^4.6.7` | Validates API boundaries and form schemas with React Hook Form. |
| **Headless Data Grid** | `@tanstack/react-table` | `^8.21.2` | Optional engine for advanced multi-column filtering; UI table remains native. |
| **Rich-Text Editor** | `@tiptap/react`, `@tiptap/starter-kit` | `^2.11.0` | Isolated rich-text feature module only. |

---

## 3. Architectural Layers & Boundaries

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FEATURE / APP LAYER                             │
│  src/features/           src/app/ (Next.js) or src/routes/ (Vite)      │
│  • TanStack Query hooks for backend communication                      │
│  • Zustand stores for client-side transient state                      │
│  • React Hook Form + Zod schemas for business validation               │
│  • Rich-Text Editor (Tiptap) isolated feature modules                  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via clean props
┌───────────────────────────────────▼────────────────────────────────────┐
│                        CORE UI PRIMITIVES                              │
│  src/components/ui/*                                                   │
│  • 100% internally authored (Button, Dialog, Input, Sheet, etc.)       │
│  • Zero state/query/form dependencies                                  │
│  • CSS Modules only (*.module.css) with strict CSS Logical Properties   │
│  • WAI-ARIA compliant, keyboard-first, native HTML APIs                │
│  • Built-in RTL & Bidi compliance with mirrored icon support           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ consumes via CSS variables
┌───────────────────────────────────▼────────────────────────────────────┐
│              DESIGN TOKENS & INTERNATIONALIZATION ENGINE               │
│  src/styles/tokens/*                       src/lib/i18n/*              │
│  • Semantic colors, radii, shadows         • I18nProvider, useDirection│
│  • Arabic & Latin typography tokens        • BidiText, MirroredIcon    │
│  • Line-height compensation tokens         • Native Intl formatters    │
└────────────────────────────────────────────────────────────────────────┘
```

### Boundary Enforcement Rules

1. **No Leakage into Core UI**:
   - `import { useQuery } from '@tanstack/react-query'` inside `src/components/ui/` is a build-failing architectural violation.
   - `import { useForm } from 'react-hook-form'` inside `src/components/ui/` is a build-failing architectural violation.
   - `import { z } from 'zod'` inside `src/components/ui/` is a build-failing architectural violation.
   - Core UI components expose standard native event handlers (`onClick`, `onChange`, `onFocus`, `onKeyDown`) and status props (`error?: string`, `disabled?: boolean`, `isLoading?: boolean`).

2. **Styling & RTL Integrity**:
   - No utility classes from external frameworks.
   - No inline styles for layout or theming.
   - **Zero Physical Direction Properties**: Never write `margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, `right`, or `text-align: left`. Always use `margin-inline`, `padding-block`, `inset-inline-*`, `border-inline-*`, and `text-align: start`.
   - Dynamic states must be expressed via `data-*` attributes (e.g. `data-state="open"`, `data-variant="outline"`, `data-mirror-rtl="true"`).

---

## 4. Component Structure Standard

Every component in `src/components/ui/` MUST follow this directory format:

```text
src/components/ui/[component-name]/
├── [component-name].tsx           # Component logic & TypeScript interface
├── [component-name].module.css    # Scoped styles consuming CSS variables & logical properties
├── [component-name].test.tsx      # Vitest + Testing Library test suite (including RTL tests)
└── index.ts                       # Public export
```

### Example Component Contract (`button`)

```tsx
// src/components/ui/button/button.tsx
import React, { forwardRef } from 'react';
import { cn } from '@/lib/cn';
import { MirroredIcon } from '@/lib/i18n';
import styles from './button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  mirrorIcons?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      startIcon,
      endIcon,
      mirrorIcons = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type="button"
        data-variant={variant}
        data-size={size}
        disabled={disabled || isLoading}
        className={cn(styles.button, className)}
        {...props}
      >
        {isLoading && <span className={styles.spinner} aria-hidden="true" />}
        {startIcon && (
          <span className={styles.startIcon}>
            {mirrorIcons ? <MirroredIcon>{startIcon}</MirroredIcon> : startIcon}
          </span>
        )}
        <span className={styles.label}>{children}</span>
        {endIcon && (
          <span className={styles.endIcon}>
            {mirrorIcons ? <MirroredIcon>{endIcon}</MirroredIcon> : endIcon}
          </span>
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
```

---

## 5. Token System Specification (`src/styles/tokens/`)

Tokens are pure native CSS custom properties structured across 6 files:

1. **`colors.css`**: Neutral grayscale (`--color-neutral-0` to `--color-neutral-950`), semantic roles (`--color-bg-base`, `--color-surface`, `--color-text-primary`, `--color-border-subtle`, `--color-primary`, `--color-danger`).
2. **`typography.css`**: Font families (including native Arabic font stacks `--font-family-arabic`, `--font-family-arabic-heading`, and universal fallbacks), fluid scale (`--font-size-xs` through `--font-size-5xl`), line heights with Arabic vertical ascender/descender compensation (`--line-height-arabic-normal: 1.65`), and font weights.
3. **`spacing.css`**: 4px/8px proportional grid scale (`--space-1` = 4px, `--space-2` = 8px, `--space-4` = 16px, etc.). Consumed exclusively with logical properties (`margin-inline`, `padding-block`).
4. **`radii.css`**: Border radius scale (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`).
5. **`shadows.css`**: Elevation scale (`--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`).
6. **`index.css`**: Master token export and `:root` / `[data-theme="dark"]` overrides.

---

## 6. Dependency Policy & Review Checklist

Before adding any new dependency to `package.json`, verify:
- [ ] **Native First**: Can modern browser APIs (HTML5, CSS Logical Properties, Web `Intl` API) accomplish this without a package?
- [ ] **Zero Headless Runaways**: Does it attempt to provide pre-styled or headless UI behaviors that should be internally owned?
- [ ] **License Check**: MIT, Apache-2.0, or BSD-3-Clause required.
- [ ] **Weight & Isolation**: If it is a feature dependency (e.g., Tiptap), is it strictly kept outside `src/components/ui/`?
- [ ] **RTL Compliance**: Does this feature or component respect document directionality (`dir="rtl"`) with zero physical CSS properties?
- [ ] **Testing**: Does introducing this dependency have test coverage under Vitest or Playwright?

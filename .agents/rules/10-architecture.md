---
trigger: always_on
description: Architectural layers, dependency flow, public export boundaries, and white-label purity.
---

# 10-architecture: Layer Boundaries & Purity

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. The Three Architectural Tiers
Dependency flows strictly downwards:
```
Features / App Routes (Next.js app/, layouts/)
       ↓ consumes via clean props
Core UI Primitives (components/ui/*, components/shell/*, components/icons/*)
       ↓ consumes via CSS variables
Tokens & Foundation (styles/tokens/*, i18n/*, providers/*)
```

## 2. Inviolable Boundary Rules
- **Pure Core UI**: Code inside `components/ui/` must NEVER import from `@tanstack/react-query`, `zustand`, `react-hook-form`, `zod`, or application context.
- **Framework neutrality**: Never import Next.js-specific modules (`next/navigation`, `next/link`, `next/image`) inside reusable UI, layout, or icon primitives. Use host-agnostic slots (`as`, `imageComponent`).
- **Public index.ts contracts**: Components and modules must expose their public API via an `index.ts`. Deep imports bypassing the component root (e.g., `components/ui/button/button.module.css` from outside the button folder) are forbidden.
- **No silent fallbacks**: Core logic must fail loudly when required dependencies, configurations, or translations are missing, rather than masking bugs behind invisible or corrupted fallbacks.

## 3. White-Label Purity & Dependencies
- **No speculative dependencies**: Check whether native Web APIs (`Intl`, Popover, CSS Logical Properties) solve the problem before adding dependencies. Zero third-party headless UI (no Radix, no MUI, no Chakra, no Tailwind). Hugeicons is the one approved third-party exception.
- **No hardcoded demo data**: Reusable layouts (`ClassicLayout`) and primitives must accept data via props. Never embed hardcoded mock users, mock emails, or demo company names as fallback defaults.

## 4. Starter Independence & Delivery Isolation
- **Shared internally, zero coupling delivered**: Shared source maintenance (mirroring primitives and tokens from canonical dashboard to website) must never couple starters at delivery. Once installed or extracted, each starter must be 100% self-contained.
- **Complete standalone independence**: Every framework/product combination (`Next.js website`, `Next.js dashboard`, `Vite website`, `Vite dashboard`) must install, build, test, and run independently outside the UI-kit repository.
- **Zero sibling or monorepo coupling**: Never import across starters (`../../dashboard` or `@starterkit/*`). Starters must contain zero sibling path dependencies and zero unpublished internal packages.
- **Dedicated presets**: The website imports only its local `styles/website/` preset; the dashboard imports only its local `styles/dashboard/` preset. Neither contains the other product's preset files, routes, or layouts.
- **Verification by extraction**: Validate independence by extracting the starter into an empty directory and running installation, build, and tests without the parent monorepo.

## 5. Shadow & Depth Architecture
- **Completely shadow-free dashboard**: Shadows (`box-shadow`, `text-shadow`, `filter: drop-shadow(...)`, SVG `feDropShadow`, decorative glows, and React inline style equivalents) are strictly prohibited in the dashboard. Visual separation is achieved strictly through semantic surface steps (`--color-surface`, `--color-surface-raised`), boundary borders (`--color-border-subtle`), spacing, and overlay backdrops.
- **Website-owned shadows**: Shadows are local to the website starter (`styles/website/shadows.css`), restrained (neutral black, zero horizontal offset for natural RTL/LTR), and opt-in via semantic tokens (`--website-shadow-card`, `--website-shadow-header`, `--website-shadow-menu`, `--website-shadow-dialog`).
- **Focus via outlines**: Keyboard focus is always communicated through visible outlines consuming `--focus-ring-width`, `--focus-ring-offset`, and `--color-border-focus`—never through box-shadows.

## 6. Control Sizing Architecture
- **Approved six-step scale**: `xs` (28px / 1.75rem), `sm` (32px / 2rem), `md` (36px / 2.25rem), `lg` (40px / 2.5rem), `xl` (48px / 3rem), `2xl` (56px / 3.5rem). Heights are minimum border-box block sizes, not fixed heights.
- **Product-owned defaults**: Dashboard defaults to `md` (36px); Website defaults to `xl` (48px). Product defaults must never be overwritten by shared synchronization.
- **Consistent explicit sizes**: Explicit `size="md"` renders identically in both products.
- **Identical across themes and directions**: Dimensions, block paddings, and line heights remain identical across themes and directions.
- **Touch-target policy**: Interaction target is decoupled from visible size. Touch-oriented controls enforce a minimum 48×48px interaction area (`--control-touch-target-min: 3rem`) via `data-touch-target="comfortable"` or `data-touch-target="auto"` on coarse pointers.
- **Text resilience**: Minimum block dimensions supply space while wrapped content is permitted to grow rather than being clipped.

## 7. Spacing Architecture
- **Approved 4px-base primitive scale**: `--space-0` (0), `--space-0-5` (0.125rem / 2px micro exception), `--space-1` (0.25rem / 4px), `--space-2` (0.5rem / 8px), `--space-3` (0.75rem / 12px), `--space-4` (1rem / 16px), `--space-5` (1.25rem / 20px), `--space-6` (1.5rem / 24px), `--space-8` (2rem / 32px), `--space-10` (2.5rem / 40px), `--space-12` (3rem / 48px), `--space-16` (4rem / 64px), `--space-20` (5rem / 80px), `--space-24` (6rem / 96px), `--space-32` (8rem / 128px).
- **Separation of three responsibilities**: Spacing primitives (`tokens/spacing.css`) provide available distances; product spacing roles (`styles/dashboard/spacing.css`, `styles/website/spacing.css`) define layout usage; control dimensions (`tokens/controls.css`) govern internal interactive element sizing.
- **Product spacing rhythms**: Dashboard layouts use compact product-owned spacing roles (16px mobile, 24-32px desktop); website layouts use comfortable component spacing and responsive section rhythm (48px mobile, 64px tablet, 96px desktop).
- **Single boundary ownership**: A parent stack owns spacing between children (`gap`); a container owns outer gutter (`padding-inline`); a section owns its block rhythm (`padding-block`); a card owns internal padding. Avoid doubling gutters on both section and container.
- **Identical across themes and directions**: Spacing dimensions remain identical across themes and directions; logical properties (`padding-inline`, `padding-block`) are strictly enforced.

## 8. Radius Architecture
- **Approved primitive scale**: `--radius-none` (0), `--radius-xs` (2px), `--radius-sm` (4px), `--radius-md` (6px), `--radius-lg` (8px), `--radius-xl` (12px), `--radius-2xl` (16px), `--radius-full` (9999px). Pixel units are used deliberately for corner geometry.
- **Product-owned defaults**: Dashboard controls default to `6px` (`--radius-control: var(--radius-md)`); Website controls default to `8px` (`--radius-control: var(--radius-lg)`). Dashboard cards default to `8px` (`--radius-card: var(--radius-lg)`); Website cards default to `12px` (`--radius-card: var(--radius-xl)`). Attached surfaces default to `0` (`--radius-attached: var(--radius-none)`). Website feature surfaces default to `16px` (`--radius-feature: var(--radius-2xl)`).
- **Component consumption**: Components consume semantic roles rather than hardcoded radii. Radius remains stable across control sizes, themes, and directions.
- **Pills and circles**: Pills (`--radius-full`) and circles (`50%`) are explicit treatments. Do not make controls pill-shaped by default.
- **Focus indicator preservation**: Rounded surfaces must not clip keyboard focus rings (`overflow: hidden` must not be added globally).

## 9. Typography Architecture
- **Approved 11-step rem primitive scale**: Strictly 11 sizes starting at 12px: `--font-size-xs` (0.75rem / 12px), `--font-size-sm` (0.875rem / 14px), `--font-size-base` (1rem / 16px), `--font-size-lg` (1.125rem / 18px), `--font-size-xl` (1.25rem / 20px), `--font-size-2xl` (1.5rem / 24px), `--font-size-3xl` (1.75rem / 28px), `--font-size-4xl` (2rem / 32px), `--font-size-5xl` (2.5rem / 40px), `--font-size-6xl` (3rem / 48px), `--font-size-7xl` (4rem / 64px). Unused 11px micro-exception tokens are prohibited.
- **Approved font weights**: Regular 400 (`--font-weight-regular`), Medium 500 (`--font-weight-medium`), Semibold 600 (`--font-weight-semibold`), Bold 700 (`--font-weight-bold`). Variable font assets cover continuous 100-900 weights natively with zero synthetic bolding.
- **Self-hosted font delivery**: Font assets (`Geist-Variable.woff2`, `GeistMono-Variable.woff2`, `NotoSansArabic-Variable.woff2`) and their SIL OFL-1.1 licenses are bundled locally inside each starter (`src/styles/fonts/`). Next.js loads them via `next/font/local` in `layout.tsx` with zero runtime external requests, functioning completely offline.
- **Product-owned defaults**:
  - Dashboard defaults to compact body typography (`14px / 20px`, 400), page title (`24px / 32px`, 600), section title (`20px / 28px`, 600), card title (`16px / 24px`, 600), supporting text (`12px / 16px`, 400), and metric values (`28px / 36px`, 600, tabular figures).
  - Website defaults to comfortable body typography (`16px / 24px`, 400), lead text (`18px / 28px` mobile -> `20px / 32px` desktop), page title (`32px / 40px` mobile -> `48px / 56px` desktop), section title (`28px / 36px` mobile -> `40px / 48px` desktop), card title (`20px / 28px` mobile -> `24px / 32px` desktop), hero display (`40px / 48px` mobile -> `64px / 72px` desktop), and eyebrow (`12px / 16px`, 500).
- **Role-appropriate Arabic clearance**: Arabic headings and text roles consume product-owned line-height adjustments (e.g. dashboard page title 40px vs Latin 32px; body 24px vs Latin 20px) to clear Tashkeel (diacritics) and tall ascenders/descenders without arbitrary global line-height overrides. Controls maintain `min-block-size` and `overflow: visible` to prevent diacritic truncation.
- **Script tracking and nested restoration**: Arabic script cursive ligatures strictly maintain `letter-spacing: normal` (eyebrow and badge uppercase tracking is removed for Arabic). Nested Latin text (`:lang(en)`, `:lang(fr)`) within Arabic documents restores `var(--font-family-sans)` and Latin tracking rules.
- **Control sizing preservation**: General typography updates must never modify button or input control sizing tokens (`--control-font-size-*`, `--control-line-height-*`).
- **Starter independence**: Product typography presets (`styles/dashboard/typography.css`, `styles/website/typography.css`) remain local and are protected from shared synchronization.

## 10. Z-Index & Overlay Stacking Hierarchy
- **Shared 10-step semantic scale**: Strictly 10 monotonically ascending layers: `--z-base` (0), `--z-raised` (10), `--z-sticky` (100), `--z-dropdown` (200), `--z-overlay` (300), `--z-drawer` (310), `--z-modal-backdrop` (400), `--z-modal` (410), `--z-toast` (500), `--z-tooltip` (600). Arbitrary z-index numbers (`999`, `9999`) are strictly prohibited.
- **Overlay ownership & stacking contexts**: Nested overlays (e.g., custom select popover inside a modal dialog) are scoped to the parent dialog's local stacking context, rendering above the modal surface without leaking global z-index inflation.
- **Interaction permission vs visual elevation**: Modal backdrops (`--z-overlay` for drawers, `--z-modal-backdrop` for dialogs) explicitly intercept pointer events, enforce keyboard focus containment, and handle outside dismissal without confusing visual layering with interaction rights.

## 11. Motion & Reduced Motion Architecture
- **Approved 4-step duration scale**: `--motion-duration-instant` (0ms), `--motion-duration-fast` (120ms), `--motion-duration-normal` (180ms), `--motion-duration-slow` (240ms).
- **Approved three easing tokens**: `--motion-ease-standard` (`cubic-bezier(0.2, 0, 0, 1)`), `--motion-ease-enter` (`cubic-bezier(0, 0, 0, 1)`), `--motion-ease-exit` (`cubic-bezier(0.4, 0, 1, 1)`).
- **Composite transition helpers**: `--transition-fast`, `--transition-normal`, `--transition-slow` bind standard duration and easing together.
- **Strict property discipline**: Never use `transition: all`. Do not animate layout properties (`width`, `height`, `margin`, `padding`) by default; prefer `opacity` and GPU-accelerated `transform`. Focus rings appear immediately without transition. Theme switches must not animate whole-page background/color.
- **Reduced motion guarantee**: Under `prefers-reduced-motion: reduce`, duration tokens collapse to `0ms` and `scroll-behavior: auto !important` is enforced. Transitions with 0ms duration do not fire `transitionend`; component lifecycles (focus restoration, backdrop removal, scroll unlocking, and inert state cleanup) must be driven directly by state machines/effects, never gated on `transitionend` or `animationend` callbacks.

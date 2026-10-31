---
trigger: glob
globs: "**/src/**/*.ts, **/src/**/*.tsx"
description: Next.js App Router rules, server component boundaries, localized metadata, error boundaries, and framework isolation.
---

# 70-nextjs: App Router Boundaries & Server-First Conventions

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Host-Boundary Metadata & Dynamic Locale Sync
- **Keep Next.js concerns at the host boundary**: Prefer Server Components for `page.tsx`, `not-found.tsx`, `loading.tsx`, and root `layout.tsx` (`generateMetadata()`). Remember that a client shell wrapper still accepts server-rendered `children`; wire Next-specific `router.refresh()` (via `onLocaleChange`) and `usePathname()` cleanly inside `src/app/` without forcing rewrites of every reusable shell/layout component.
- **Localized dynamic metadata**: Use async `generateMetadata()` reading `getServerI18nState()` + `translate()` so `<title>`, `description`, and OpenGraph tags localize dynamically across `en`, `fr`, and `ar` rather than exporting hardcoded English `metadata` constants.

## 2. Complete Route Contracts & Clean Production Routes
- **Mandatory status boundaries in every starter**: Both `dashboard/src/app/` and `website/src/app/` must provide `error.tsx` (`'use client'`), `global-error.tsx` (`'use client'`, self-contained and resilient when root layout/providers have failed, reading locale/theme cookies safely on the client with fallback), `not-found.tsx`, and `loading.tsx`—each rendering a single semantic `<main>` landmark and valid `<h1>`. Avoid catch-all `[...catchAll]` routes that shadow root `not-found.tsx` layout wrappers.
- **Dev/test-gated gallery & fixtures**: Keep Playwright/dev component galleries out of production `components/patterns/` barrels and gate dev/test routes reliably (`notFound()` in production unless explicitly enabled for E2E).

## 3. Strict Framework Isolation
- **Zero `next/*` outside `src/app/`**: Importing `next/link`, `next/image`, `next/navigation`, or `next/headers` inside `components/ui/`, `components/icons/`, `components/shell/`, `components/patterns/`, `components/website/`, `layouts/`, `wireframes/`, `providers/`, or `i18n/` is a failing violation.
- **Slot wiring in `src/app/`**: Wire Next.js `Link` and `Image` in `src/app/` and pass them down via `as={Link}` and `imageComponent={Image}`.


---
trigger: glob
globs: "**/src/app/**"
description: Next.js App Router rules, server component boundaries, error handling, and routing isolation.
---

# 70-nextjs: App Router Boundaries & Server-First Conventions

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Server-First Hierarchy
- **Server Components by default**: All layout (`layout.tsx`), page (`page.tsx`), and error files in `src/app/` are Server Components by default. Keep data fetching and cookie reading on the server.
- **Client boundaries at the leaf**: Only attach `'use client'` to small interactive leaf components (e.g. toggles, interactive forms, dynamic tabs). Do not convert entire pages to client components.

## 2. Route Conventions & Error Boundaries
- **Route contracts**: Every major route segment should provide explicit `error.tsx` (must be a client component), `not-found.tsx`, and `loading.tsx` skeleton states.
- **Metadata**: Define static or dynamic `metadata` exports in `layout.tsx` or `page.tsx`. Include localized titles, descriptions, and open-graph tags.

## 3. Strict Framework Isolation
- **No Next.js leakage into UI**: Never import `next/link`, `next/image`, `next/navigation`, or `next/headers` inside `components/ui/` or `components/shell/`.
- **Slot pattern**: Pass Next.js router instances and optimized images down into UI primitives using `as={Link}` or `imageComponent={Image}`.


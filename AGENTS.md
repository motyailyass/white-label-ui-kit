# AGENTS.md — UI Kit

> Read this before any task. Detailed rules live in `.agents/rules/`. Read the
> one that matches the files you touch. These rules outrank habit.

## Repo

White-label React UI kit for websites and dashboards. Next.js is the first
reference host; Vite is a later copy of the same source, not a second
implementation. It must serve 10+ projects without forking components.

## Layout

Each app lives under `typescript/nextjs/starterkit/{dashboard,website}/`.
Paths below are relative to the app you are in.

- `src/components/ui/` — pure primitives.
- `src/components/icons/` — Icon wrapper + semantic registry.
- `src/components/shell/` — AppShell, Sidebar, Header, Content, Panel.
- `src/components/patterns/` — connected compositions.
- `src/layouts/` — classic, dual-sidebar, three-column.
- `src/providers/` — theme, i18n, app providers.
- `src/i18n/` — messages, formatters, bidi.
- `src/styles/tokens/` — design tokens.

## Commands

From the app directory:

- `pnpm dev`
- `pnpm lint`
- `pnpm type-check`
- `pnpm test`
- `pnpm build`

Run the smallest check first; run the full gate before handoff.

## Non-negotiables

1. No third-party UI or headless libraries. Own markup, behavior, styles.
2. CSS Modules + native custom properties. No Tailwind, CSS-in-JS, inline styles.
3. `components/ui` is pure: no i18n, providers, router, query, form, zod.
4. No `next/*` in reusable code. Next-only code stays in `app/`.
5. Locale is the source of truth; direction derives (`ar` → RTL, `en`/`fr` → LTR).
6. Every user-facing string goes through `t()`.
7. Logical CSS properties only; check `dir="rtl"`.
8. Every primitive has a Vitest/RTL test; overlays get Playwright.
9. Layouts receive data via props; no demo names/nav/users as defaults.
10. No secrets. No `git push` without explicit approval.
11. Starters are independent: zero sibling imports, zero monorepo coupling, local presets.
12. Dashboard is 100% shadow-free (depth via surfaces, borders, layering); website shadows are local, opt-in, and restrained.
13. Control sizing: All controls use the approved local six-step token scale. Dashboard defaults to md (36px minimum height); website defaults to xl (48px minimum height). Explicit sizes retain the same meaning across starters. Dimensions remain identical across themes and directions. Controls must accommodate enlarged text, and visible size must not be confused with interaction-target size. Product-owned control defaults must never be overwritten by shared synchronization.
14. Spacing: Use the approved 4px-base primitive scale. Dashboard layouts use compact product-owned spacing roles; website layouts use comfortable component spacing and responsive section rhythm. Use logical properties and assign one owner to each spacing boundary. Shared primitives must not overwrite product presets or control-size defaults.
15. Radius: Use the approved primitive scale with product-owned semantic roles. Dashboard controls default to 6px; website controls default to 8px. Components consume semantic roles rather than hardcoded radii. Radius remains stable across control sizes, themes, and directions. Pills and circles are explicit treatments. Product presets must survive shared synchronization, and rounded surfaces must not clip focus indicators.
16. Typography: Use the approved rem-based 11-step primitive scale (--font-size-xs to --font-size-7xl) and weights 400, 500, 600, 700. Dashboard defaults to compact body typography (14px / 20px, 400); website defaults to comfortable body typography (16px / 24px, 400) and responsive heading roles. Components consume product-owned semantic typography roles rather than hardcoded sizes. Arabic script uses explicit stack (--font-family-arabic), normal letter-spacing, and increased line-height clearance. Control typography contracts must remain stable and preserved. Product presets must survive shared synchronization.
17. Z-Index & Overlay Architecture: All layers consume the shared 10-step semantic scale (--z-base: 0, --z-raised: 10, --z-sticky: 100, --z-dropdown: 200, --z-overlay: 300, --z-drawer: 310, --z-modal-backdrop: 400, --z-modal: 410, --z-toast: 500, --z-tooltip: 600). Arbitrary magic numbers (such as 9999) are forbidden. Overlays maintain clean stacking contexts; nested dropdowns inside dialogs render in front of dialog surfaces. Backdrops intercept background pointer events while preserving focus traps and dismissibility.
18. Motion & Reduced Motion Architecture: Transitions use the shared 4-step duration scale (--motion-duration-instant: 0ms, --motion-duration-fast: 120ms, --motion-duration-normal: 180ms, --motion-duration-slow: 240ms) and three standard easings (--motion-ease-standard, --motion-ease-enter, --motion-ease-exit). Never use `transition: all` or animate layout properties (width, height, margin, padding) by default. Focus indicators appear immediately without transition. Under `prefers-reduced-motion: reduce`, duration tokens collapse to 0ms and smooth scrolling is disabled. Component lifecycles (focus restoration, backdrop removal, scroll unlocking, inert state) must be driven directly by state rather than relying on transitionend or animationend events, which do not fire when duration is zero.

## Done

- Code + test + docs/gallery entry for any public component.
- `pnpm lint`, `pnpm type-check`, `pnpm test` pass.
- RTL checked; no inline styles; no `any`.
- Handoff note: changed files, commands run, skipped checks, risks.

## Workflow

- Read the files and callers before editing.
- Multi-file or public-API change: plan first.
- Smallest complete diff; don't reformat unrelated code.
- One agent per file at a time; stop if you see unfamiliar edits.
- Fix the root cause once in shared code.
- Never claim a check you did not run.


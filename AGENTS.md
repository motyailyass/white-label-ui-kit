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


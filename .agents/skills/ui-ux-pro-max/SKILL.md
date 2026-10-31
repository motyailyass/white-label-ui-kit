---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web, mobile, and desktop. Use for read-only UX, accessibility, interaction, layout, chart, and landing-page research—always subordinate to UI Kit rules and tokens."
---

# UI/UX Pro Max — Design Intelligence (Scoped for UI Kit)

> **MANDATORY UI KIT REPOSITORY OVERRIDES (READ FIRST)**
> `AGENTS.md` and `.agents/rules/*` strictly outrank every generic recommendation or code snippet in this skill's CSV database and `references/*.md`:
> 1. **Never use `--persist`, `MASTER.md`, or `--density` token overrides**: `src/styles/tokens/*` and `src/styles/{dashboard,website}/*` are the sole canonical token system. Never generate `design-system/` folders or shadcn variables (`--color-background`, `--color-ring`, `--space-md`).
> 2. **Forbidden stacks & libraries**: Never query or apply `--stack html-tailwind`, `--stack shadcn`, `--domain gsap`, `--domain google-fonts`, Lucide/Heroicons, CSS-in-JS, or spring-physics libraries. Translate any Tailwind utility snippet in search results (e.g., `focus:ring-2`) into UI Kit CSS Modules + semantic tokens (`outline: var(--focus-ring-width) solid var(--color-border-focus); outline-offset: var(--focus-ring-offset);`).
> 3. **Exact UI Kit Metrics Outrank Generic Defaults**:
>    - **Control heights**: Dashboard default = `md` (`36px` / `2.25rem`); Website default = `xl` (`48px` / `3rem`); coarse-pointer touch target = `48×48px` (`--control-touch-target-min: 3rem`), NOT `44px`.
>    - **Body typography**: Dashboard = `14px / 20px` (`--typography-body-*`); Website = `16px / 24px`. Fonts are self-hosted `Geist` + `Noto Sans Arabic` only.
>    - **Shadows**: Dashboard is **100% shadow-free**; Website uses only restrained zero-x-offset `--website-shadow-*` semantic roles.
>    - **Z-Index & Motion**: Strictly the 10-step `--z-*` scale (`0`–`600`) and 4-step `--motion-duration-*` scale (`0ms`, `120ms`, `180ms`, `240ms`). `0ms` immediate focus rings and `prefers-reduced-motion: reduce` collapsing to `0ms` are mandatory, NOT anti-patterns.

---

## When to Apply

Use this skill for **read-only UX, accessibility, interaction, chart, and page-structure research** when designing or reviewing components, patterns, dashboard views, or website sections:
- Accessibility edge cases (`--domain ux`)
- Icon semantics & labeling (`--domain icons`, mapped onto `@/components/icons` Hugeicons registry)
- Chart selection & data legibility (`--domain chart`)
- Marketing / landing section structure (`--domain landing`, `--domain product`)
- React / Next.js rendering & performance patterns (`--domain react`, `--stack react`, `--stack nextjs`)

## Running the Search Tool

Always invoke the script using its exact workspace path from the repository root (`python3` on macOS/Linux):

```bash
python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>
```

## Approved Query Modes in This Repository

Build each query around **one dominant intent** using **2–5 meaningful terms**:

1. **UX & Accessibility Outcomes (`--domain ux`)**:
   ```bash
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "keyboard focus modal" --domain ux
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "error summary validation" --domain ux
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "live badge count screen reader" --domain ux
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "focus not obscured" --domain ux
   ```
2. **Icon Accessibility (`--domain icons`)**:
   ```bash
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "decorative icon aria hidden" --domain icons
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "icon button accessible label" --domain icons
   ```
3. **Charts, Landing Structure & React/Next.js Performance**:
   ```bash
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "real-time dashboard" --domain chart
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "hero social-proof" --domain landing
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "rerender memo list" --domain react
   python3 ".agents/skills/ui-ux-pro-max/scripts/search.py" "suspense streaming bundle" --stack nextjs
   ```

## Rule Categories by Priority (Adapted to UI Kit)

| Priority | Category | Impact | Domain | UI Kit Enforcement |
|----------|----------|--------|--------|--------------------|
| 1 | Accessibility | CRITICAL | `ux` | 4.5:1 contrast, semantic HTML + `lang`, keyboard nav, unclipped `:focus-visible` outline |
| 2 | Touch & Sizing | CRITICAL | `ux` | Dashboard `36px` (`md`), Website `48px` (`xl`), coarse touch target `48×48px` (`data-touch-target`) |
| 3 | Performance | HIGH | `ux`, `react` | Server-first App Router, leaf `'use client'`, zero layout shift (`CLS < 0.1`) |
| 4 | Visual & Icons | HIGH | `icons` | Hugeicons via `<Icon name="..." />` only; Dashboard 100% shadow-free; Website opt-in `--website-shadow-*` |
| 5 | Layout & RTL | HIGH | `ux` | 100% CSS Logical Properties, `dir="rtl"` + `<BidiText dir="ltr" lang="en">`, zero horizontal overflow |
| 6 | Typography & Color | MEDIUM | `ux` | Semantic `--typography-*` & `--color-*` roles; Geist + Noto Sans Arabic; zero raw hex/px |
| 7 | Motion | MEDIUM | `ux` | `--transition-fast/normal/slow`, GPU `opacity`/`transform` only, state-driven reduced-motion cleanup |
| 8 | Forms & Feedback | MEDIUM | `ux` | Explicit `<label>`, `useId()`, `aria-invalid` + `aria-describedby`, `role="status"` / `role="alert"` |
| 9 | Navigation | HIGH | `ux` | Named `<nav aria-label={t(...)}>`, `aria-current="page"`, host-agnostic `as={Link}` slots |
| 10 | Charts & Data | LOW | `chart` | Tabular figures (`tabular-nums`), accessible legends/summaries, never rely on color alone |

## Fallback Rule When Search Returns 0 Results

1. Retry once with a narrower 2–4 word query and explicit `--domain`.
2. If still empty, state explicitly that `search.py` returned 0 matches and apply `.agents/rules/*` + `primitive-craft` / `component-wiring` directly. Never fabricate search results.

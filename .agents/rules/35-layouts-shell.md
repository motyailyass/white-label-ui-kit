---
trigger: glob
globs: "**/src/components/shell/**, **/src/layouts/**, **/src/components/patterns/**, **/src/wireframes/**"
description: AppShell architecture, layout slots, connected patterns, website sections, and drawer accessibility.
---

# 35-layouts-shell: Layout Shells, Patterns & Navigation Drawers

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Unified AppShell & Host-Agnostic Slot Architecture
- **One AppShell hierarchy (Dashboard)**: All dashboard layouts (`ClassicLayout`, `DualSidebarLayout`, `ThreeColumnLayout`) must wrap content inside `<AppShell>` and `<AppShellMain>`.
- **Host-agnostic slots (`as`, `imageComponent`)**: Layout data contracts (`NavItem`, `BreadcrumbItem`, `LayoutLogo`, `LayoutUser`) and website navigation items must expose `as` and `imageComponent` slots so `app/` callers can pass Next.js `Link` and `Image` for SPA navigation without leaking `next/*` into reusable layers.
- **Zero hardcoded copy or demo chrome**: Never hardcode brand letters (`"P"`), fallback labels (`"Sidebar navigation"`, `"Close panel"`, `"Breadcrumbs"`, `"Tokyo.dev"`), or static `#app-sidebar` IDs. Pass localized labels from `patterns/` or `app/` via `t()`, and generate internal IDs via `React.useId()`.
- **Configurable runtime dimensions via CSS variables**: Never pass physical inline `width`/`minWidth` on `AppShell` or `Panel`. Legitimate configurable shell dimensions (`sidebarWidth`, `panelWidth`) must be passed strictly as typed CSS custom property overrides (`--sidebar-width`, `--panel-width`) consumed by logical CSS rules (`inline-size: var(--panel-width)`), avoiding `!important` overrides.

## 2. Landmark Hygiene & Connected Patterns
- **No nested `<aside>` landmarks**: Root sidebars and docked contextual panels render `<aside aria-label={localizedLabel}>`. Inner sub-rails (`SidebarPrimary`, `SidebarSecondary`) render `<div>`, while `<nav>` inside sidebars/headers/footers must each carry a distinct localized `aria-label`.
- **Active navigation state**: Active route items (including icon-only rail buttons) must set `aria-current="page"`, `data-active="true"`, and an explicit `aria-label`.
- **Connected `patterns/` discipline**: Components in `src/components/patterns/` bridge `useI18n()` / `useTheme()` to pure `components/ui/` primitives. Never wrap `useI18n()` in `try/catch` silent English fallbacks, and never mutate `document.documentElement` directly outside `ThemeProvider` / `I18nProvider`.

## 3. Mobile Navigation & Overlay Panel Contracts
- **Trigger & region binding**: Every drawer/disclosure trigger (`SidebarTrigger`, `TokyoNavbar` mobile trigger, overlay `Panel` trigger) must bind `aria-controls={regionId}` and `aria-expanded={isOpen}`. Closed regions must not remain focusable in the tab order (`hidden` or `inert`).
- **Explicit modal vs non-modal choice**:
  - **Modal drawers & overlay panels** (Dashboard mobile `Sidebar`, Dashboard `Panel` when `mode="overlay"` or `<= 1024px` tablet/mobile): Render an intercepting backdrop, `role="dialog"`, `aria-modal="true"`, Escape-key dismissal, focus trapping (`Tab` / `Shift+Tab`), state-driven focus restoration to the trigger on close, and ref-counted body scroll lock (`overflow: hidden`).
  - **Non-modal navigation disclosures** (Website topbar mobile menu): A non-modal disclosure (`aria-expanded`, `aria-controls`, Escape dismissal returning focus to trigger, hidden when closed) is valid and does not require a modal backdrop, scroll lock, `role="dialog"`, or focus trap unless explicitly designed as a modal sheet.
- **Exact breakpoint parity**: Synchronize JS viewport listeners (`window.matchMedia`) with CSS `@media` queries to prevent 1px breakpoint dead zones, and automatically close mobile drawer state when resizing to desktop.


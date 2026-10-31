---
name: primitive-craft
description: >-
  Standards, token contracts, state matrices, overlay architecture, and verification checklists for crafting pure white-label Core UI primitives in src/components/ui/.
---

# Primitive Craft — Pure White-Label UI Primitives

Execution discipline for authoring pure primitives in `typescript/nextjs/starterkit/dashboard/src/components/ui/` (and mirroring via `node scripts/sync-shared.mjs`). Every primitive must satisfy all 9 sections.

## 1. Component Contract (React 19)
- **Native `ref` as prop preferred**: Prefer authoring new primitives as plain function components typed with `React.ComponentPropsWithRef<T>` and passing `ref` directly to the underlying DOM element; existing working `React.forwardRef` primitives remain valid.
- **Safe button defaults & polymorphism**: Every `<button>` primitive defaults `type = 'button'`. Links or polymorphic triggers use discriminated unions (`href`) or host-agnostic `as?: React.ElementType` slots (automatically enforcing `rel="noopener noreferrer"` when `target="_blank"`). No Radix `asChild`.
- **Logical prop names only**: Use `startIcon` / `endIcon`, `side="inline-start" | "inline-end"`, `align="start" | "center" | "end"`. Physical names (`leftIcon`, `rightIcon`) are forbidden.
- **Dynamic IDs**: Generate internal ARIA pairing IDs with `React.useId()` (`const fallbackId = React.useId(); const id = propId ?? fallbackId;`). Never hardcode static `id` strings.
- **Zero context & zero hardcoded copy**: Props in, events out. Zero imports from `@/providers`, `@/i18n`, `next/*`, routers, query, form, or zod. Never hardcode English strings (`"Close"`, `"Clear"`, `"Light"`, `"Current: ..."`): accept explicit string label props from connected callers.
- **Safe prop spreading**: Compose caller event handlers (`onClick`, `onKeyDown`, `onFocus`, `onBlur`) rather than letting trailing `{...props}` overwrite internal behavior.

## 2. State Matrix
Express state via `data-*` attributes and semantic CSS custom properties:
- **Interactive**: `default`, `:hover:not(:disabled)`, `:active:not(:disabled)`, `:focus-visible` (0ms immediate outline: `var(--focus-ring-width) solid var(--color-border-focus)` with `var(--focus-ring-offset)`).
- **Operational**: `disabled`, `aria-disabled="true"` consuming `--color-control-disabled-bg`, `--color-text-disabled`, `--color-border-disabled`.
- **Loading**: `data-loading="true"` and `aria-busy="true"` (preserves inline/block dimensions without layout shift; spinner respects `@media (prefers-reduced-motion: reduce)`).
- **Validation & Form Binding**: `aria-invalid={invalid || undefined}`, `data-invalid={invalid ? 'true' : undefined}`, `aria-describedby` merging hint + error IDs, native `name`/`value`/`onChange`/`onBlur` passthrough.
- **Toggles & Selection**: `aria-pressed` (Toggle), `aria-checked` (Switch/Checkbox/Radio), `aria-selected` (Tabs/Select/Combobox), `aria-current="page"` (Breadcrumb/Pagination).

## 3. Token & Control Sizing Contract
- **Interactive Controls** (`Button`, `Input`, `Select`, `Combobox`, `DatePicker`, `Toggle`, `ThemeToggle`):
  - Extend `ControlSizingProps` (`size?: ControlSize`, `touchTarget?: ControlTouchTarget` from `../control-sizing`).
  - Bind private `--_control-*` variables to `var(--control-*-default)` (`36px` `md` in Dashboard; `48px` `xl` in Website), override per `[data-size="xs|sm|md|lg|xl|2xl"]`, use `min-block-size: var(--_control-height)` (never fixed `height`), and enforce `--control-touch-target-min` (`3rem` / `48px`) under `[data-touch-target="comfortable"]` and coarse pointers (`[data-touch-target="auto"]`).
- **Semantic Surfaces, Radii, Z-Index & Motion**:
  - Colors: `--color-surface*`, `--color-text-*`, `--color-border-*`, `--color-primary*`, `--color-success/warning/danger/info*`.
  - Radii: `--radius-control`, `--radius-card`, `--radius-overlay`, `--radius-dialog`, `--radius-navigation`, `--radius-full` (pills only). Never clip `:focus-visible` outlines with `overflow: hidden`.
  - Typography: `--control-font-size-*` / `--control-line-height-*` inside controls; `--typography-*-size/line-height/weight` in non-control primitives (`Card`, `Alert`, `EmptyState`, `StatCard`).
  - Z-index: strictly the 10-step scale (`--z-base`, `--z-raised`, `--z-sticky`, `--z-dropdown`, `--z-overlay`, `--z-drawer`, `--z-modal-backdrop`, `--z-modal`, `--z-toast`, `--z-tooltip`). Zero magic numbers or `calc(var(--z-*) + N)`.
  - Motion: `--transition-fast`, `--transition-normal`, `--transition-slow` on `opacity`, `transform`, or color properties only. Never `transition: all` or layout properties (`width`, `height`, `margin`, `padding`). Never gate cleanup on `transitionend`/`animationend`.

## 4. Overlay & Roving-Focus Architecture
- **Modal Overlays** (`Dialog`, `AlertDialog`, `Sheet`, `CommandPalette`):
  - Prefer native `<dialog>` or explicit `role="dialog"` / `role="alertdialog"` + `aria-modal="true"` + `aria-labelledby` + `aria-describedby`.
  - Escape closes only the topmost active overlay layer (nested `Select`/`Popover` inside `Dialog` closes first without closing `Dialog`).
  - Ref-counted body scroll lock and state-driven focus restoration to the invoking trigger on close.
- **Floating Non-Modal Overlays** (`Popover`, `DropdownMenu`, `ContextMenu`, `HoverCard`, `Tooltip`, `Select`, `Combobox`, `DatePicker`):
  - Scoped cleanly so nested popovers inside modals render above `--z-modal` (`410`) without global z-index inflation.
- **RTL-Aware Keyboard Navigation**:
  - Horizontal composites (`Tabs`, `RadioGroup`, `ToggleGroup`, `Slider`, `NavigationMenu`, `DatePicker`, `TreeView`) inspect `element.closest('[dir]')` / `document.documentElement.dir` and invert `ArrowLeft` / `ArrowRight` in `dir="rtl"`.

## 5. RTL & Logical CSS Properties
- Logical properties exclusively: `inline-size`, `block-size`, `min-block-size`, `padding-inline`, `padding-block`, `margin-inline`, `margin-block`, `inset-inline-*`, `inset-block-*`, `border-inline-*`, `border-block-*`, `text-align: start`.
- Directional icons come from `@/components/icons` (`directional()` in `registry.ts`). Never write custom `scaleX(-1)` rules in primitive CSS.

## 6. Directory Layout & Canonical Sync
Author every shared primitive in `dashboard/src` first:
```text
typescript/nextjs/starterkit/dashboard/src/components/ui/[primitive-name]/
├── [primitive-name].tsx
├── [primitive-name].module.css
├── [primitive-name].test.tsx
└── index.ts
```
1. Export public types and components from `[primitive-name]/index.ts` and `src/components/ui/index.ts`.
2. Run `node scripts/sync-shared.mjs` from repo root to mirror to `website/src`.

## 7. Verification & Unit/E2E Tests
- **Vitest + `@testing-library/user-event`** (`[primitive-name].test.tsx`):
  - Default and variant rendering (`getByRole` priority, zero `any`).
  - Realistic `userEvent` click + keyboard (`Enter`, `Space`, Arrow keys, `Escape`).
  - Disabled state click/keyboard suppression and `type="button"` verification.
  - Ref forwarding, ARIA attributes, and `dir="rtl"` behavior.
- **Playwright E2E**: Required for all overlay primitives (focus trap, nested overlay Escape order,LTR + RTL positioning, `prefers-reduced-motion: reduce`).

## 8. 10-Gate Pre-Handoff Checklist
1. [ ] **Pure UI boundary**: Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries; zero hardcoded English copy.
2. [ ] **React 19 `ref` & safe props**: Typed with `ComponentPropsWithRef<T>`, `type="button"` default, dynamic `useId()`, composed event handlers.
3. [ ] **Logical props & CSS**: `startIcon`/`endIcon` props and 100% logical CSS properties (`inline-size`, `min-block-size`, `padding-inline`, `inset-inline-*`).
4. [ ] **Control sizing & tokens**: Consumes `ControlSizingProps`, `--control-*-default`, semantic disabled/surface/radius/z-index/motion tokens; zero inline styles or raw hex/px.
5. [ ] **Dashboard shadow ban**: Zero `box-shadow`, `text-shadow`, or `drop-shadow` (`node scripts/check-dashboard-shadows.mjs` exits 0).
6. [ ] **Reduced motion**: Zero layout-property transitions; continuous `@keyframes` mitigated under `prefers-reduced-motion: reduce`; state-driven lifecycle cleanup.
7. [ ] **Keyboard, ARIA & RTL**: Full WAI-ARIA roles/states, `:focus-visible` outline unclipped, RTL arrow-key inversion verified.
8. [ ] **Tests**: `userEvent` Vitest suite passes in both `dashboard` and `website` (+ Playwright spec for overlays).
9. [ ] **Shared sync**: `node scripts/sync-shared.mjs --check` exits 0 with zero drift.
10. [ ] **Lint & types**: `tsc --noEmit` and `oxlint` exit 0 in both starters.

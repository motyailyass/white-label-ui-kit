---
trigger: glob
globs: "**/*.ts, **/*.tsx, **/*.mjs"
description: Strict TypeScript standards, React 19 ergonomics, dynamic IDs, hook rules, and leaf boundary placement.
---

# 20-typescript-react: Strict Types & React 19

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Type Strictness & React 19 Ergonomics
- **Zero `any`**: The use of `any` (in source or tests) is a failing violation. Use `unknown`, generic parameters, or explicit discriminated unions.
- **Accurate prop interfaces**: Prop types must never lie. Match element-specific HTML attribute types (`HTMLDivElement` for `<div>`, not `HTMLElement`). If a component conditionally renders an anchor or button (`href` or polymorphic `as`), use a discriminated union or generic `React.ElementType` contract so invalid attributes cannot be passed.
- **Native `ref`-as-prop preferred in React 19**: Both starters run React 19 (`^19.1.0`). Prefer authoring new components as plain functions typing props with `React.ComponentPropsWithRef<T>` and forwarding `ref` directly onto the root DOM element; existing working `React.forwardRef` components remain valid and do not require churn-only rewrites.
- **Uncontrolled `default*` vs controlled props**: Props prefixed with `default*` (`defaultVariant`, `defaultOpen`, `defaultSidebarCollapsed`, `defaultPanelOpen`) initialize uncontrolled state once on mount—never synchronize changing `default*` props into state via effects. Expose explicit controlled contracts (`value` / `open` / `variant` + `on*Change`) when runtime external control is required.
- **Safe prop spreading**: Spread `{...props}` *before* critical behavioral attributes or compose caller callbacks (`onClick={(e) => { onClick?.(e); if (!e.defaultPrevented) internalHandler(e); }}`) so caller props never accidentally clobber internal state or ARIA wiring.
- **Dynamic DOM IDs via `useId()`**: Never hardcode static `id="..."` strings inside reusable UI, pattern, or shell components (causes duplicate-ID accessibility failures when mounted twice). Generate stable SSR-safe IDs with `const generatedId = React.useId(); const id = propId ?? generatedId;`.

## 2. React Hooks & Lifecycle
- **Unconditional hooks**: Never call hooks (`useI18n()`, `useTheme()`) inside `try/catch` blocks, conditionals, or loops.
- **Clean effect cleanup & memoized context**: Every `useEffect` that attaches window/media listeners or modifies `document.body` must return an explicit cleanup function. Memoize React Context `value` objects with `useMemo` and callbacks with `useCallback`.
- **Breakpoint synchronization**: Never compare `window.innerWidth < N` against CSS `@media (max-width: Npx)` (creates a 1px dead zone at `N`). Use `window.matchMedia('(max-width: ...)')` matching the exact CSS media query, and reset mobile-only transient states (such as mobile drawer open/scroll-lock) when crossing back to desktop.
- **Keyboard target guard**: Any global keyboard shortcut (`Cmd+B`, `Cmd+.`) must inspect `e.target` to avoid hijacking active form inputs, textareas, selects, or `contenteditable` elements.

## 3. Client Boundary Placement
- **Targeted client boundaries**: Attach `'use client'` to interactive components that use React state, effects, browser APIs, or context hooks. Remember that a client layout wrapper can still render server-rendered `children` passed into it; keep Next.js metadata (`generateMetadata`) and `router.refresh()` locale synchronization cleanly at the `src/app/` host boundary rather than rewriting working shell wrappers gratuitously.


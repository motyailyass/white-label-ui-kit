---
trigger: glob
globs: "**/*.ts, **/*.tsx"
description: Strict TypeScript standards, React 19 ergonomics, hook rules, and leaf boundary placement.
---

# 20-typescript-react: Strict Types & React 19

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. Type Strictness
- **Zero `any`**: The use of `any` is a failing violation. Use `unknown`, generic parameters, or explicit discriminated unions.
- **Accurate prop interfaces**: Prop types must never lie. If a component conditionally renders an anchor or button (`href`), use a discriminated union so anchor attributes (`target`, `rel`) cannot be passed to a button and vice versa.
- **Ref-as-prop in React 19**: In React 19, `ref` is a native prop. Prefer passing `ref` directly or use `forwardRef` only where public library contract compatibility is strictly required.

## 2. React Hooks & Lifecycle
- **Clean effect cleanup**: Every `useEffect` that attaches window listeners or modifies `document.body` must return an explicit cleanup function.
- **Dependency array completeness**: Never omit referenced variables or functions from dependency arrays; wrap stable handlers with `useCallback`.
- **Keyboard target guard**: Any global keyboard listener (`Cmd+B`, `Cmd+.`, `Escape`) must inspect `e.target` to avoid hijacking active form inputs, textareas, selects, or `contenteditable` elements.

## 3. Client Boundary Placement
- **Leaf-level `'use client'`**: Push `'use client'` to the outermost interactive leaf components. Never flag entire layouts or route pages as client components if only a small button or toolbar requires interactivity.


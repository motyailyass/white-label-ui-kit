---
trigger: glob
globs: "**/src/components/ui/**"
description: Purity standards for Core UI primitives, data-driven states, and zero-context contracts.
---

# 30-ui-primitives: Core UI Primitive Purity

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. The Pure Primitive Contract
- **Props-in, events-out**: Every primitive in `components/ui/` must be 100% pure. It receives native props (`value`, `checked`, `onChange`, `disabled`, `children`, `className`) and emits standard event callbacks.
- **Zero context lock-in**: Primitives must NEVER import React context directly (no `useTheme()`, no `useDirection()`, no `useI18n()`). Toggles and controls must accept their active state and toggle handlers as pure props.
- **Zero feature coupling**: Never import router hooks, TanStack Query, React Hook Form, or Zod inside `components/ui/`.

## 2. Native HTML & ARIA Foundations
- **Native HTML first**: Rely on native HTML5 APIs (`<dialog>`, Popover API, `<details>`, `<button type="button">`) before authoring custom interactive state machines.
- **Explicit WAI-ARIA**: All interactive primitives must implement required ARIA roles, `aria-expanded`, `aria-controls`, `aria-checked`, and keyboard focus management (`Tab`, `Escape`, arrow keys).
- **Interactive indicators**: Active navigation links must explicitly declare `aria-current="page"`.

## 3. State via Data Attributes
- **No utility class spaghetti**: Express component state exclusively via `data-*` attributes (`data-state="open"`, `data-variant="outline"`, `data-active="true"`, `data-collapsed="true"`).
- **Target states in CSS Modules**: Scoped CSS modules target these data attributes (`.button[data-variant="outline"]`) rather than toggling multiple ad-hoc classes.


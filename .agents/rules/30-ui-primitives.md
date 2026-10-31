---
trigger: glob
globs: "**/src/components/ui/**, **/src/components/website/**"
description: Purity standards for Core UI primitives, logical prop naming, control sizing, data-driven states, and zero-context contracts.
---

# 30-ui-primitives: Core UI Primitive Purity

Detailed architectural rationale: @docs/standards/TECH_STACK.md

## 1. The Pure Primitive Contract
- **Props-in, events-out**: Every primitive in `components/ui/` (and pure surface primitives in `components/website/`) must be 100% pure. It receives native props (`value`, `checked`, `onChange`, `disabled`, `children`, `className`, `ref`) via `React.ComponentPropsWithRef<T>` and emits standard event callbacks.
- **Zero context & zero hardcoded copy**: Primitives must NEVER import React context (`useTheme()`, `useI18n()`) AND must NEVER embed hardcoded English user-facing strings, tooltips (`title="Current: ..."`), or fallback `aria-label` text. When an interactive primitive needs an accessible label (e.g., Dialog close button, Pagination nav, Clear input button, ThemeToggle), require or accept explicit string label props passed from connected callers (`patterns/` or `app/`).
- **Logical prop naming only**: Never use physical directional prop names (`leftIcon`, `rightIcon`, `position="left" | "right"`). Always use logical names (`startIcon`, `endIcon`, `side="inline-start" | "inline-end"`, `align="start" | "center" | "end"`).
- **Zero feature coupling**: Never import router hooks, `next/*`, TanStack Query, Zustand, React Hook Form, or Zod inside `components/ui/`. Support framework links/images via polymorphic `as` or discriminated `href` unions.

## 2. Native HTML, Control Sizing & ARIA Foundations
- **Native HTML first & safe button defaults**: Rely on native HTML5 elements (`<dialog>`, Popover API, `<details>`/`<summary>`, `<button>`, `<input>`, `<select>`, `<fieldset>`/`<legend>`) before custom state machines. Every non-submit `<button>` primitive MUST default `type="button"` (`type = 'button'`) so placing it inside a `<form>` never triggers accidental submission.
- **Control sizing contract**: Interactive controls extend `ControlSizingProps` (`size`, `touchTarget` from `control-sizing.ts`), emit `data-size={size}` and `data-touch-target={touchTarget}`, and consume `--control-height-default` (resolving to `36px` `md` in Dashboard and `48px` `xl` in Website) with `min-block-size` (never fixed `height`).
- **Explicit WAI-ARIA & RTL keyboard navigation**: Implement required ARIA attributes (`aria-expanded`, `aria-controls`, `aria-checked`, `aria-pressed`, `aria-invalid`, `aria-busy`, `aria-describedby`, `aria-current="page"`). Horizontal roving-focus primitives (`Tabs`, `RadioGroup`, `ToggleGroup`, `Slider`, `Menu`, `DatePicker`, `TreeView`) must invert `ArrowLeft`/`ArrowRight` under `dir="rtl"`.

## 3. State via Data Attributes & Semantic Tokens
- **No utility class spaghetti**: Express state via `data-*` attributes (`data-state="open|closed"`, `data-variant`, `data-size`, `data-loading="true"`, `data-invalid="true"`, `data-active="true"`).
- **Semantic disabled & interactive tokens**: Consume `--color-control-disabled-bg`, `--color-text-disabled`, and `--color-border-disabled` for disabled states and explicit hover/active tokens rather than arbitrary `opacity` hacks.


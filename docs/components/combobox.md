# Combobox — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Archetype  
> **Applies to:** Core UI Primitive (`components/ui/combobox`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/combobox/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/combobox/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Executive Summary & Architectural Role

The `Combobox` primitive provides an accessible, searchable, and filterable single-line text input paired with a floating listbox, supporting both single-select and multi-select (tags/chips) modes.

Within the White Label UI Kit, `Combobox` follows:
- **Pure Core UI boundary:** Zero third-party dependencies (no Radix, no Downshift).
- **Single & Multi-Select Modes:** Supports single selection or multi-select tag chips with keyboard backspace removal and listbox checkbox indicators.
- **Two-tier control sizing:** Consumes the universal six-step token scale (`xs` to `2xl`).
- **WAI-ARIA 1.2 Combobox pattern:** `role="combobox"`, `role="listbox"`, `role="option"`, `aria-activedescendant`.
- **Zero-shadow dashboard guarantee:** Depth is achieved via surface contrast (`--color-surface-raised`), boundary borders (`--color-border-subtle`), and z-index (`--z-dropdown`).
- **100% CSS Logical Properties:** Full bidirectional mirroring in RTL.

---

## 2. Inviolable Architectural Boundaries

- Pure UI primitive in `src/components/ui/combobox/`.
- Never imports from `@/providers`, `@/i18n`, `next/*`, or validation/form libraries.
- All user-facing strings (`placeholder`, `emptyMessage`, `clearAriaLabel`, `toggleAriaLabel`, `removeChipAriaLabel`) are provided as props by callers.
- Controlled and uncontrolled operation supported via `value`, `defaultValue`, and `onValueChange`:
  - Single-select: `value?: string`, `defaultValue?: string`, `onValueChange?: (value: string) => void`.
  - Multi-select: `multiple: true`, `value?: string[]`, `defaultValue?: string[]`, `onValueChange?: (values: string[]) => void`.
- Native hidden input(s) rendered when `name` prop is provided for standard HTML form compatibility.

---

## 3. Control Sizing & Density Metrics

| Scale Step | Min Height (`min-block-size`) | Inline Padding (`padding-inline`) | Font Size | Icon Size | Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `1.75rem` (28px) | `0.50rem` (8px) | `0.875rem` (14px) | `0.875rem` (14px) | Dense tables, compact filtering |
| **`sm`** | `2.00rem` (32px) | `0.75rem` (12px) | `0.875rem` (14px) | `1.00rem` (16px) | Secondary toolbars |
| **`md`** | `2.25rem` (36px) | `0.875rem` (14px) | `0.875rem` (14px) | `1.00rem` (16px) | **Dashboard Product Default** |
| **`lg`** | `2.50rem` (40px) | `1.00rem` (16px) | `0.875rem` (14px) | `1.125rem` (18px) | Standard form layouts |
| **`xl`** | `3.00rem` (48px) | `1.25rem` (20px) | `1.00rem` (16px) | `1.25rem` (20px) | **Website Product Default** |
| **`2xl`** | `3.50rem` (56px) | `1.50rem` (24px) | `1.00rem` (16px) | `1.50rem` (24px) | Marketing hero search |

### Touch Target Policy:
On coarse pointers or with `touchTarget="comfortable"`, the input and options enforce a minimum interaction area of **48×48px** (`--control-touch-target-min: 3rem`), satisfying WCAG 2.5.5 / 2.5.8.

---

## 4. Keyboard Navigation

- `ArrowDown`: Opens popup and navigates to the next enabled option (skipping disabled).
- `ArrowUp`: Navigates to previous enabled option.
- `Enter`: Commits the active option:
  - In single-select mode, commits the value and closes the popup.
  - In multi-select mode, toggles the option, appends or removes the chip, and keeps the popup open for further selections.
- `Backspace`: When in multi-select mode and the text search query is empty, removes the last selected chip.
- `Escape`: Closes popup without committing unselected changes; restores input to active selection.
- `Home` / `End`: Navigates to first/last enabled option in list.
- `Tab`: Closes popup and allows standard tab navigation to the next interactive element.

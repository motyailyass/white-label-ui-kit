# Combobox — Component Specification & Architectural Reference

> **Document Status:** Master Standard & Reference Archetype  
> **Applies to:** Core UI Primitive (`components/ui/combobox`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/combobox/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/combobox/`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md) · [Input Specification](./input.md) · [Button Specification](./button.md)

---

## 1. Objective & Scope

The `Combobox` primitive provides an accessible, searchable, and filterable single-line text input paired with a floating listbox popover. It supports both single-select and multi-select (tags/chips) modes without any external headless UI dependencies.

### 1.1 Scope Boundaries

The `Combobox` primitive handles:
- Browser-native text input integration with WAI-ARIA 1.2 combobox role mappings.
- Substring query filtering and automatic matching substring highlighting (`<mark>`).
- Keyboard roving focus navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Escape`, `Home`, `End`).
- Single-select mode with auto-fill label and clear button.
- Multi-select mode with interactive, removable tag chips and Backspace chip deletion.
- Top-row icon anchoring architecture: Leading search icons and trailing action buttons remain pinned to the first line (`min-block-size: 1.5rem; align-self: flex-start`) during multi-line chip wrapping, preventing visual jitter.
- Flat options list and grouped options with semantic headers.
- Hidden input rendering for standard HTML form submissions.
- Async loading state with spinner and `aria-busy`.

### 1.2 Explicit Exclusions
- Third-party headless engines (zero Radix, Downshift, or Floating UI).
- Async pagination fetching or remote query debounce logic (owned by parent callers/patterns).
- Custom rich-text dropdown editors (handled by dedicated rich-text primitives).

---

## 2. Architecture & Ownership

Responsibility flows strictly downwards:

| Layer | Path | Responsibility |
| :--- | :--- | :--- |
| **1. Core UI Primitive** | `src/components/ui/combobox/` | WAI-ARIA 1.2 combobox, floating listbox, tag chips, CSS Module styles, control sizing, ref forwarding |
| **2. Field Composition** | `src/components/patterns/` | Label association (`<Label>`), helper text, error text, and ARIA relationships |
| **3. Connected Pattern** | `src/components/patterns/combobox-gallery/` | Internationalization (`t()`), bidi isolation, and gallery studio inspection |
| **4. Host Application** | `src/app/`, `src/` | Form submission, server validation, state management, and persistence |

### 2.1 Inviolable Boundary Rules
- **Pure Core UI boundary:** Code inside `components/ui/combobox/` must never import from `@/providers`, `@/i18n`, `next/*`, `@tanstack/react-query`, `zustand`, or `zod`.
- **Zero hardcoded English fallbacks:** User-facing strings (`placeholder`, `emptyMessage`, `loadingMessage`, `clearAriaLabel`, `toggleAriaLabel`, `removeChipAriaLabel`) are provided as props by callers.
- **100% CSS Logical Properties:** All block/inline dimensions and paddings consume CSS logical properties (`inline-size`, `block-size`, `padding-inline`, `padding-block`).
- **Dashboard shadow ban:** Listbox elevation is achieved strictly via surface steps (`--color-surface-raised`), boundary borders (`--color-border-subtle`), and z-index (`--z-dropdown`).

---

## 3. Public API & Prop Interface

```typescript
export interface ComboboxOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface ComboboxOptionGroup {
  label: string;
  options: ComboboxOption[];
}

export type ComboboxItems = ComboboxOption[] | ComboboxOptionGroup[];

export interface ComboboxBaseProps
  extends Omit<ComponentPropsWithRef<'input'>, 'size' | 'onChange' | 'value' | 'defaultValue'>,
    ControlSizingProps {
  options: ComboboxItems;
  onSearchChange?: (query: string) => void;
  filterFn?: (option: ComboboxOption, query: string) => boolean;
  emptyMessage?: ReactNode;
  loadingMessage?: ReactNode;
  loading?: boolean;
  invalid?: boolean;
  clearable?: boolean;
  clearAriaLabel?: string;
  toggleAriaLabel?: string;
  removeChipAriaLabel?: (label: string) => string;
  startIcon?: ReactNode;
  maxListHeight?: string;
  wrapperClassName?: string;
  listboxClassName?: string;
}

export interface ComboboxSingleProps extends ComboboxBaseProps {
  multiple?: false;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, selectedOption: ComboboxOption | null) => void;
}

export interface ComboboxMultiProps extends ComboboxBaseProps {
  multiple: true;
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (values: string[], selectedOptions: ComboboxOption[]) => void;
}

export type ComboboxProps = ComboboxSingleProps | ComboboxMultiProps;
```

---

## 4. Interaction & State Matrix

| State | Semantic Trigger | Background Token | Border Token | Text Token | Outline / Focus Indicator |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Resting** | Container resting | `--color-control-bg` | `--color-border-control` | `--color-text-primary` | None |
| **Hover** | `:hover:not(:disabled)` | `--color-control-bg` | `--color-border-control` | `--color-text-primary` | None |
| **Focus** | `:focus-within` / `.focused` | `--color-control-bg` | `--color-border-focus` | `--color-text-primary` | `1px solid var(--color-border-focus)` flush outline (`outline-offset: 0`), yielding exactly 2px visual focus thickness without floating gap |
| **Invalid** | `invalid={true}` | `--color-control-bg` | `--color-danger` | `--color-text-primary` | `1px solid var(--color-danger)` flush outline (`outline-offset: 0`) |
| **Loading** | `loading={true}` | `--color-control-bg` | `--color-border-control` | `--color-text-primary` | Displays spinning loader icon and sets `aria-busy="true"` |
| **Disabled** | `disabled={true}` | `--color-control-disabled-bg` | `--color-border-disabled` | `--color-text-disabled` | None (`cursor: not-allowed`) |

---

## 5. Control Sizing & Density Metrics

| Scale Step | Min Height (`min-block-size`) | Inline Padding (`padding-inline`) | Font Size | Icon Size | Usage Context |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`xs`** | `1.75rem` (28px) | `0.50rem` (8px) | `0.875rem` (14px) | `0.875rem` (14px) | Dense tables, compact filtering |
| **`sm`** | `2.00rem` (32px) | `0.75rem` (12px) | `0.875rem` (14px) | `1.00rem` (16px) | Secondary toolbars |
| **`md`** | `2.25rem` (36px) | `0.875rem` (14px) | `0.875rem` (14px) | `1.00rem` (16px) | **Dashboard Product Default** |
| **`lg`** | `2.50rem` (40px) | `1.00rem` (16px) | `0.875rem` (14px) | `1.125rem` (18px) | Standard form layouts |
| **`xl`** | `3.00rem` (48px) | `1.25rem` (20px) | `1.00rem` (16px) | `1.25rem` (20px) | **Website Product Default** |
| **`2xl`** | `3.50rem` (56px) | `1.50rem` (24px) | `1.00rem` (16px) | `1.50rem` (24px) | Marketing hero search |

### Decoupled Menu Density:
Floating listbox menu items never balloon to 56px: menu density remains strictly decoupled to preserve scanability:
- **Single-line options:** `36px` (`2.25rem`) height with `14px / 20px` typography.
- **Two-line options (with descriptions):** `48px` (`3rem`) height with top-aligned icons/checkboxes and clear 2px title-to-description rhythm.

---

## 6. Keyboard Navigation Contract

- `ArrowDown`: Opens popup and navigates to the next enabled option (skipping disabled).
- `ArrowUp`: Navigates to previous enabled option.
- `Enter`: Commits the active option:
  - In single-select mode, commits the value and closes the popup.
  - In multi-select mode, toggles the option, appends or removes the chip, and keeps the popup open for further selections.
- `Backspace`: When in multi-select mode and the text search query is empty, removes the last selected chip.
- `Escape`: Closes popup without committing unselected changes; restores input to active selection.
- `Home` / `End`: Navigates to first/last enabled option in list.
- `Tab`: Closes popup and allows standard tab navigation to the next interactive element.

---

## 7. Accessibility & WAI-ARIA 1.2 Compliance

- Input carries `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded={isOpen}`, `aria-controls={listboxId}`, and `aria-activedescendant={activeOptionId}`.
- Listbox carries `role="listbox"`, `aria-multiselectable={multiple || undefined}`.
- Options carry `role="option"`, `aria-selected={isSelected}`, `aria-disabled={option.disabled}`.
- Option groups carry `role="group"` with `aria-labelledby={groupHeadingId}`.
- Touch target: On coarse pointers or with `touchTarget="comfortable"`, the input and options enforce a minimum interaction area of **48×48px** (`--control-touch-target-min: 3rem`), satisfying WCAG 2.5.5 / 2.5.8.

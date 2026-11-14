# ToggleGroup Specification

## 1. Component Overview
The `ToggleGroup` primitive coordinates a set of two-state `Toggle` buttons in a single or multiple selection group. Common use cases include text formatting bars (Bold/Italic/Underline), alignment selectors (Left/Center/Right/Justify), and layout view switchers (Grid/List).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/toggle-group/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Container renders `role="group"` with accessible `aria-label`.
  - Nested items render `aria-pressed={isPressed}`.
  - Keyboard arrow navigation allows roving focus across buttons within the group.
- **Tokens & Geometry**:
  - Controls consume `--radius-control` with joined outer borders and inner borders collapsed seamlessly (`--radius-attached: 0`).
  - Density sizes: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`.
  - 100% shadow-free in dashboard mode.
  - 100% CSS logical properties.

## 3. Component API
### `<ToggleGroup type="single" value={value} onValueChange={onValueChange} size="md" variant="outline">`
- `type?: 'single' | 'multiple'`: Selection model (default: `'single'`).
- `value?: string | string[]`: Controlled value(s).
- `defaultValue?: string | string[]`: Uncontrolled initial value(s).
- `onValueChange?: (value: any) => void`: Callback fired on selection change.
- `size?: ControlSize`: Unified sizing for all toggles.
- `variant?: ToggleVariant`: Unified variant for all toggles.
- `disabled?: boolean`: Disables all toggle items.

### Compound `<ToggleGroupItem value={value}>{children}</ToggleGroupItem>`

## 4. State Matrix
- **Selection Types**: `single`, `multiple`
- **Sizes**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **Variants**: `default`, `outline`, `subtle`
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (logical properties throughout)

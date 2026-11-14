# Slider Specification

## 1. Component Overview
The `Slider` primitive allows users to select a numeric value or range from a continuous or stepped interval. It supports keyboard navigation (arrows, PageUp/PageDown, Home/End), pointer dragging with pointer capture, track fill indicators, 3 density sizes (`sm`, `md`, `lg`), and RTL orientation.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/slider/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Thumb handle has `role="slider"`, `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-orientation="horizontal"`.
  - Accessible keyboard control: Arrow keys (±1 step, mirrored in RTL), PageUp/PageDown (±10 steps), Home/End (min/max).
  - Accessible labelling via `aria-label` or `aria-labelledby`.
- **Interaction & Pointer Capture**:
  - Direct click on track jumps the thumb to the exact target fraction.
  - Smooth dragging using pointer event listeners with `setPointerCapture`.
- **Tokens & Geometry**:
  - Track background consumes `var(--color-border-subtle)` / `var(--color-surface-raised)`.
  - Active fill consumes `var(--color-primary)`.
  - Thumb consumes `var(--color-surface)` and `var(--color-border-strong)` with focus ring.
  - 100% shadow-free in dashboard mode.
  - 100% CSS logical properties (`inset-inline-start`, `inline-size`, `block-size`).

## 3. Component API
### `<Slider value={value} defaultValue={defaultValue} min={0} max={100} step={1} onChange={onChange} size={size} disabled={disabled} aria-label="Volume" />`
- `value?: number`: Controlled slider value.
- `defaultValue?: number`: Uncontrolled initial value.
- `min?: number`: Minimum boundary (default: `0`).
- `max?: number`: Maximum boundary (default: `100`).
- `step?: number`: Stepping granularity (default: `1`). Floating point precision is preserved.
- `onChange?: (value: number) => void`: Callback fired on value change.
- `size?: 'sm' | 'md' | 'lg'`: Track & thumb density size (default: `'md'`). Exposes `data-size`.
- `disabled?: boolean`: Disables interactive dragging and keyboard navigation. Exposes `data-disabled`.
- `name?: string`: Form field name for native form submissions via hidden input.
- `aria-label?: string`: Accessible label for assistive technology.
- `aria-labelledby?: string`: References ID of external label element.
- `aria-valuetext?: string`: Human-readable text equivalent for screen readers.
- `formatValue?: (value: number) => string`: Formatter used to compute `aria-valuetext` dynamically.

## 4. State Matrix
- **Sizes**: `sm`, `md`, `lg`
- **States**: Default, Hover, Dragging/Active, Focused, Disabled
- **Granularity**: Continuous, Stepped intervals
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (logical properties and mirrored arrow keys)

# Toggle Specification

## 1. Component Overview
The `Toggle` primitive is a two-state button that can be either pressed (on) or unpressed (off). It is typically used for styling controls (bold, italic), pinning views, muting audio, or toggling display states.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/toggle/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Uses native `<button type="button" aria-pressed={pressed}>`.
  - Communicates pressed state cleanly to assistive technology.
  - Visible focus outline using `--focus-ring-width` and `--color-border-focus`.
- **Tokens & Geometry**:
  - 6-step control sizing: `xs`, `sm`, `md`, `lg`, `xl`, `2xl` with private `--_control-*` scoped bindings.
  - Touch-target policy: Enforces minimum 48×48px interaction area (`--control-touch-target-min: 3rem`) via `data-touch-target="comfortable"` or `data-touch-target="auto"` on coarse pointers.
  - Surface and border tokens: `var(--color-surface)`, `var(--color-surface-hover)`, `var(--color-surface-raised)`.
  - Active pressed state: `background-color: var(--color-surface-raised); border-color: var(--color-border-subtle); color: var(--color-text-primary)`.
  - 100% shadow-free in dashboard mode.
  - 100% CSS logical properties.

## 3. Component API
### `<Toggle pressed={pressed} defaultPressed={false} onPressedChange={onPressedChange} size={size} variant={variant} disabled={disabled}>{children}</Toggle>`
- `pressed?: boolean`: Controlled pressed state. Exposes `data-state="on" | "off"`.
- `defaultPressed?: boolean`: Uncontrolled initial pressed state.
- `onPressedChange?: (pressed: boolean) => void`: Callback fired on toggle state change.
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`: Control sizing scale (default: `md`). Exposes `data-size`.
- `variant?: 'default' | 'outline' | 'subtle'`: Visual border treatment. Exposes `data-variant`.
- `disabled?: boolean`: Disables interactive toggle. Exposes `data-disabled`.
- `children: ReactNode`: Button label, icon, or composite content.

## 4. State Matrix
- **Control Sizing**: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`
- **Variants**: `default`, `outline`, `subtle`
- **States**: Unpressed, Pressed, Hover, Focused, Disabled
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (logical properties throughout)

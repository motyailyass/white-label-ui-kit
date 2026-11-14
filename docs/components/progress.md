# Progress Specification

## 1. Component Overview
The `Progress` primitive displays a linear progress bar indicating task completion or ongoing activity. It exports `Progress`, `ProgressLabel`, and `ProgressValue`, supporting **determinate** (`min` to `max`) and **indeterminate** modes, 4 semantic variants (`default`, `success`, `warning`, `danger`), and 3 track heights (`sm`, `md`, `lg`).

## 2. Architecture & Design Principles
- **Purity & React 19 Refs**: Pure markup and styling in `src/components/ui/progress/`. Zero third-party dependencies and direct React 19 `ref` forwarding via `ComponentPropsWithRef`.
- **WAI-ARIA Accessibility**:
  - `role="progressbar"` with `data-size`, `data-variant`, and `data-state` attributes.
  - Determinate mode sets `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`.
  - Indeterminate mode omits `aria-valuenow`, sets `aria-busy="true"`, and still renders `valueText` in the header when `showValue` is true.
  - Compound `<ProgressLabel>` automatically links to `aria-labelledby` via internal context when no external `aria-label` / `aria-labelledby` is provided.
- **GPU Compositor Motion & Reduced Motion**:
  - Determinate progress drives a typed CSS custom property (`--_progress-scale`) mapped to `transform: translateX(...)` rather than animating `inline-size` layout geometry or distorting pill corners via `scaleX`.
  - Indeterminate sweep animates GPU `transform` (`translateX`), mirrors direction under `:dir(rtl)`, and freezes to a centered indicator under `@media (prefers-reduced-motion: reduce)`.
- **Tokens & Contrast**:
  - Track background consumes `var(--color-border-subtle)` so it stays clearly separated from both Dashboard (`#ffffff`) and Website (`#fafafa`) surfaces as well as dark theme surfaces.
  - Indicator fill consumes `var(--color-primary)`, `var(--color-success)`, `var(--color-warning)`, or `var(--color-danger)`; 100% shadow-free in Dashboard.

## 3. Component API
### `<Progress />`
- `value?: number | null`: Current numeric value between `min` and `max`. Renders indeterminate mode when `null`, `undefined`, or non-finite.
- `min?: number`: Minimum boundary (default: `0`).
- `max?: number`: Maximum boundary (default: `100`).
- `size?: 'sm' | 'md' | 'lg'`: Track height (`sm` = `4px`, `md` = `8px`, `lg` = `12px`). Default `'md'`.
- `variant?: 'default' | 'success' | 'warning' | 'danger'`: Semantic color variant. Default `'default'`.
- `label?: ReactNode`: Visible and accessible label associated via `aria-labelledby`.
- `showValue?: boolean`: Renders the formatted value or `valueText` in the header row. Default `false`.
- `valueText?: string`: Accessible `aria-valuetext` override and optional visible readout.
- `indicatorClassName?: string`: Custom class forwarded to the fill bar element.

### `<ProgressLabel />` & `<ProgressValue />`
- Compound slots for custom layouts inside `<Progress>`. `<ProgressLabel>` wires its `id` to the parent bar's `aria-labelledby` automatically when composed inside `<Progress>`.

## 4. State Matrix
- **Modes**: Determinate (`0–100%`), Indeterminate (`data-state="indeterminate"`)
- **Sizes**: `sm` (`4px`), `md` (`8px`), `lg` (`12px`)
- **Variants**: `default`, `success`, `warning`, `danger`
- **Theme**: Light & Dark (`--color-border-subtle` track contrast)
- **Direction & Script**: LTR (`en`/`fr`) & RTL (`ar` — mirrored transform sweep and Arabic font/tracking overrides)

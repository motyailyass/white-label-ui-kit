# Chart Component Specification

## 1. Overview
The `Chart` primitive provides lightweight, white-label, zero-dependency SVG data visualizations for dashboards and websites. Built purely with native React 19 and SVG elements, it eliminates heavyweight charting dependencies (recharts, d3, chart.js) while guaranteeing crisp rendering, dark mode adaptation, RTL mirroring, and complete screen-reader accessibility.

## 2. Architectural Role & Layer Boundaries
- **Purity**: Zero third-party dependencies (no recharts, d3, or canvas runtimes).
- **Styling**: Pure CSS Modules + native custom properties.
- **Logical Geometry**: 100% logical layout with coordinate mirroring under `dir="rtl"`.
- **Dashboard Shadow Freedom**: 100% shadow-free in dashboard; depth communicated via borders, surface steps, and contrast.

## 3. Supported Chart Types & Compound Structure
- `ChartContainer`: Accessible `<figure role="region" aria-label="...">` wrapper managing aspect ratios, responsive SVG viewBox scaling, and palette tokens.
- `BarChart`: Categorical discrete bar visualization with grid lines, rounded corners, and value tooltips.
- `LineChart`: Continuous trend line and area fill with SVG spline interpolation, gridlines, and focusable data nodes.
- `DonutChart`: Proportional categorical distribution with customizable inner cutout radius, center metric summary, and stroke segments.
- `ChartLegend`: Series indicator list with color swatches and value summaries.
- `ChartTooltip`: Floating or integrated contextual value inspector.

## 4. Accessibility & WAI-ARIA
- Container landmark: `<figure role="region" aria-label="...">`
- Graphic role: `<svg role="img" aria-label="...">`
- Screen Reader Data Table: Hidden semantic `<table>` containing full dataset rows (`<th>`, `<td>`), ensuring non-visual user parity.
- Focusable Data Points: SVG `<circle>` and `<rect>` elements receive `tabIndex={0}` and localized `aria-label` values for keyboard traversal.

## 5. CSS & Token Contracts
- Series Color Ramp:
  - `--chart-1`: Accent tone 1 (Primary brand or primary monochrome step)
  - `--chart-2`: Accent tone 2 (Muted / secondary tone)
  - `--chart-3`: Accent tone 3 (Subtle / tertiary tone)
  - `--chart-4`: Accent tone 4
  - `--chart-5`: Accent tone 5
- Grid & Axes: `--color-border-subtle`, `--color-text-muted`, `--color-text-secondary`.
- Surfaces & Tooltips: `--color-surface-raised`, `--color-border-subtle`.

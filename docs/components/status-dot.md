# StatusDot Specification

## 1. Component Overview
The `StatusDot` primitive provides a visual status indicator for user presence, live connection status, background sync, and system health. Rendered as a semantic `<span role="status">`, it supports 5 functional status states (`online`, `offline`, `busy`, `away`, `info`), 3 density sizes (`sm: 6px`, `md: 8px`, `lg: 10px`), an optional animated radiating pulse ring (`ping`), and a companion status label.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/status-dot/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Container element uses `role="status"`.
  - Accessible announcement via `aria-label` or visible companion text.
  - Decorative dot container has `aria-hidden="true"` when accompanied by visible label text.
  - Data attributes `data-status`, `data-size`, and `data-ping` reflect runtime state for styling and verification.
- **Motion & Reduced Motion Architecture**:
  - Optional `ping` pulse radar wave animation.
  - Automatically disabled under `@media (prefers-reduced-motion: reduce)` (`animation: none !important; display: none !important;`).
- **High-Contrast Forced Colors**:
  - Supports Windows High Contrast mode via `@media (forced-colors: active)` with `border: 1px solid CanvasText;` on the dot indicator.
- **Tokens & Contrast**:
  - Status colors consume canonical tokens from `tokens/status-colors.css`:
    - Online / Success: `var(--color-success)`
    - Busy / Danger: `var(--color-danger)`
    - Away / Warning: `var(--color-warning)`
    - Offline / Neutral: `var(--color-text-muted)`
    - Info / Informational: `var(--color-info)`
  - 100% shadow-free in dashboard mode.
- **RTL & Logical Geometry**:
  - 100% CSS logical properties (`gap: var(--space-2)`, `inline-size`, `block-size`).

## 3. Component API

### `<StatusDot />`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `status` | `'online' \| 'offline' \| 'busy' \| 'away' \| 'info'` | `'online'` | Semantic status variant. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Dot indicator size (`sm` = 6px, `md` = 8px, `lg` = 10px). |
| `ping` | `boolean` | `false` | Enables animated radiating radar pulse ring. |
| `label` | `ReactNode` | — | Companion status text label. |
| `children` | `ReactNode` | — | Alternative companion text slot (used when `label` is omitted). |
| `statusLabels` | `Partial<Record<StatusDotStatus, string>>` | — | Dictionary of localized status names for accessible fallback announcement. |
| `className` | `string` | — | Outer wrapper class override. |
| `data-testid` | `string` | — | Test selector. |
| `aria-label` | `string` | — | Accessible label for assistive tech. |

## 4. Usage Examples

### Standalone Dot with ARIA Label
```tsx
import { StatusDot } from '@/components/ui';

export function UserPresence() {
  return <StatusDot status="online" ping aria-label="User is active" />;
}
```

### With Companion Label
```tsx
import { StatusDot } from '@/components/ui';

export function ServerHealth() {
  return <StatusDot status="info" label="Database Replica Syncing" />;
}
```

## 5. State Matrix
- **Statuses**: `online` (green), `offline` (neutral gray), `busy` (red), `away` (amber), `info` (blue)
- **Sizes**: `sm` (6px), `md` (8px), `lg` (10px)
- **Ping Animation**: On, Off
- **Theme**: Light & Dark (evaluated via canonical status-color tokens)
- **Direction**: LTR & RTL (preserves natural order with logical spacing)
- **Forced Colors**: Active (uses system `CanvasText` border)

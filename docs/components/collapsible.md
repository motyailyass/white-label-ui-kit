# Collapsible Specification

## 1. Component Overview
The `Collapsible` primitive provides an accessible, standalone disclosure component that allows users to toggle the visibility of a content panel. It supports controlled and uncontrolled modes, disabled states, customizable trigger elements, and smooth expansion animations that respect reduced motion preferences.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/collapsible/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Full bidirectional linkage: Trigger renders `<button type="button" id={triggerId} aria-expanded={open} aria-controls={contentId}>`.
  - Content panel renders `<div id={contentId} role="region" aria-labelledby={triggerId}>` with `hidden={!open}` when collapsed.
  - Exposes `data-state="open" | "closed"` and `data-disabled` attributes.
  - Keyboard activation via `Enter` or `Space`.
- **Motion & Reduced Motion**:
  - Smooth animation using CSS Grid `grid-template-rows: 0fr -> 1fr` and visibility transitions.
  - Automatically collapses to 0ms under `@media (prefers-reduced-motion: reduce)`.
- **Tokens & Geometry**:
  - 100% CSS logical properties.
  - 100% shadow-free in dashboard mode.
  - Canonical color tokens for borders and text.

## 3. Component API
### `<Collapsible open={open} defaultOpen={false} onOpenChange={onOpenChange} disabled={disabled}>`
- `open?: boolean`: Controlled open state.
- `defaultOpen?: boolean`: Uncontrolled initial state (default: `false`).
- `onOpenChange?: (open: boolean) => void`: Callback fired when open state toggles.
- `disabled?: boolean`: Disables interactive toggle. Exposes `data-disabled`.
- `children: ReactNode`: Compound children (`CollapsibleTrigger`, `CollapsibleContent`).

### Compound Components:
- `<CollapsibleTrigger id={id} disabled={disabled}>{children}</CollapsibleTrigger>`
- `<CollapsibleContent id={id}>{children}</CollapsibleContent>`

## 4. State Matrix
- **States**: Collapsed, Expanded, Disabled
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (logical properties throughout)

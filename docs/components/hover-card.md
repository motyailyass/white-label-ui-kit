# HoverCard Primitive Specification

## 1. Overview
The `HoverCard` primitive displays a rich, interactive preview card when sighted users hover over or focus an anchor/trigger element. Unlike tooltips (which are plain text and cannot be hovered into), HoverCards permit rich media, links, buttons, and user interaction within the card with safe cursor travel.

## 2. Anatomy
```tsx
<HoverCard openDelay={150} closeDelay={150} placement="bottom">
  <HoverCardTrigger>
    <span className="trigger-link">@sophia</span>
  </HoverCardTrigger>
  <HoverCardContent>
    <div className="card-profile">
      <h4>Sophia Mansour</h4>
      <p>Lead Systems Architect crafting white-label design systems.</p>
    </div>
  </HoverCardContent>
</HoverCard>
```

## 3. Keyboard & Accessibility Contracts
- **Trigger Semantics**: Renders `<button type="button">` with `aria-haspopup="dialog"`, `aria-expanded="true | false"`, and `aria-controls="{contentId}"`.
- **Content Semantics**: Renders `<div role="dialog" aria-modal="false" id="{contentId}">`.
- **Keyboard Dismissal**: Pressing `Escape` while focused on the trigger dismisses the card immediately without delay.
- **Hover Intent & Pointer Bridge**:
  - `openDelay` (default 200ms) prevents accidental flashes when moving the cursor across the screen.
  - `closeDelay` (default 200ms) and an invisible pseudo-element bridge (`::before`) span the gap between trigger and card, allowing safe diagonal cursor travel.
- **Focus Rings**: Trigger focus ring appears immediately (`transition: none`, Rule 18).

## 4. Visual & Token Specifications
- **Surfaces & Borders**:
  - Background: `--color-surface-raised`
  - Border: 1px solid `--color-border-subtle`
  - Radius: `--radius-card` (8px dashboard, 12px website)
  - Z-Index: `--z-dropdown` (200)
- **Placements & Alignments**:
  - Placements: `top`, `bottom`, `start`, `end`.
  - Alignments: `start`, `center`, `end`.
  - Driven by modern CSS `translate` property to prevent placement/alignment collisions.
- **Motion & Reduced Motion**:
  - Fade and visibility transitions use `--motion-duration-fast` (120ms) and `--motion-ease-standard`.
  - Under `prefers-reduced-motion: reduce`, duration collapses to 0ms.
- **Shadow Policy**:
  - Dashboard is 100% shadow-free. Depth is achieved strictly through surface contrast, borders, and layering.
- **Direction & Logical Properties**:
  - 100% CSS logical properties (`inset-inline-start`, `inset-inline-end`, `inset-block-start`, `inset-block-end`).
  - Automatic RTL mirroring with zero directional hardcoding.

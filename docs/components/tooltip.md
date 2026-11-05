# Tooltip — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/tooltip`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/tooltip/`  
> **Gallery route:** `/gallery/tooltip`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Tooltip** is a lightweight, non-interactive floating bubble that appears on pointer hover or keyboard focus to display a brief description, contextual clarification, or keyboard shortcut for an interactive trigger element (such as an icon-only button, status indicator, or toolbar action).

### 1.1 In Scope
- Non-modal, transient contextual descriptions triggered by hover and keyboard focus.
- W3C WAI-ARIA Tooltip pattern (`role="tooltip"` + `aria-describedby` or `aria-labelledby`).
- WCAG 2.1 Success Criterion 1.4.13 compliance: **Dismissible** (via `Escape`), **Hoverable** (pointer can cross into the tooltip bubble without closing), and **Persistent** (remains open until focus/hover is removed).
- Four primary placements (`top`, `bottom`, `left`, `right`) with auto-fallback viewport edge collision avoidance.
- Optional directional arrow notch aligned to the anchor center.
- Optional keyboard shortcut badge display (e.g. `⌘K`, `Shift+?`).
- Pure white-label styling: High-contrast inverted dark surface, 100% shadow-free dashboard compliance, CSS logical properties, and full RTL/LTR bi-directional support.

### 1.2 Out of Scope
- Rich, interactive floating popovers with clickable buttons, links, or form controls (covered by `Popover` / `Dialog`).
- Action menus with item selection (covered by `DropdownMenu` / `Select`).
- Ephemeral system notifications (covered by `Toast`).

---

## 2. Architecture & White-Label Isolation

### 2.1 Pure Core UI Boundary
The `Tooltip` primitive resides in `src/components/ui/tooltip/`. It strictly follows the inviolable architectural boundaries:
- **Zero Third-Party UI Libraries:** No Radix, no Floating UI, no Popper. All positioning, collision detection, and hover intent state are owned natively.
- **Pure Dependency Flow:** Never imports from `@/providers`, `@/i18n`, `next/*`, or external state managers.
- **Ref Forwarding & Trigger Cloning:** Uses React element cloning to cleanly attach accessibility attributes (`aria-describedby`, event handlers) directly to the child trigger element without injecting extra wrapper `<div>` nodes into the DOM layout.
- **Bidirectional Support:** 100% CSS logical properties. Placements `left` and `right` automatically mirror to physical inline-start / inline-end when `dir="rtl"`.
- **Zero Dashboard Shadows:** High-contrast visual boundary achieved through semantic surfaces (`--color-surface-raised` or inverted dark contrast) and border (`--color-border-subtle`). Website consumes local opt-in shadow `--website-shadow-menu`.

```
Application Layer / Connected Pattern
  ├─ Provides trigger (Button, Icon, Link) and localized tooltip content
  └─ Tooltip Primitive (src/components/ui/tooltip/)
       ├─ Trigger clone with aria-describedby={tooltipId}
       └─ Floating bubble (role="tooltip", id={tooltipId})
            ├─ Text / Content node
            ├─ Keyboard shortcut badge (<kbd>)
            └─ Directional arrow notch (optional)
```

---

## 3. Standards & Accessibility Compliance (WCAG 2.1 AA / 1.4.13)

### 3.1 The Three Non-Negotiable Rules of WCAG 1.4.13
1. **Dismissible:**
   - Pressing `Escape` immediately dismisses the active tooltip without moving keyboard focus or altering trigger state.
2. **Hoverable:**
   - The user can move the pointer across the gap between the trigger and the tooltip bubble into the bubble itself without the tooltip disappearing.
3. **Persistent:**
   - The tooltip remains visible until the user moves the pointer away, moves keyboard focus away, presses `Escape`, or the trigger unmounts.

### 3.2 Timing & Intent State Machine
- **Keyboard Focus:** Shows **immediately** (`0ms` delay) when focused via keyboard (`focus-visible`). Dismisses on `blur`.
- **Pointer Hover Warm-up Delay:** When entering an idle trigger, waits **`250ms`** before opening. This prevents visual flicker when sweeping the cursor across a toolbar.
- **Adjacent Skip Delay (Grace Period):** If a tooltip is already open and the cursor moves to another tooltip trigger within **`200ms`**, the next tooltip opens instantly (`0ms` delay) without a second warm-up delay.
- **Touch Devices:** Tooltips are suppressed on simple touch scroll/tap to prevent sticky, un-dismissible floating bubbles from blocking mobile viewports.

---

## 4. Positioning & Collision Architecture

### 4.1 Placements
- `top` (Default): Centered horizontally above the trigger.
- `bottom`: Centered horizontally below the trigger.
- `left`: Centered vertically to the inline-start of the trigger (mirrors in RTL).
- `right`: Centered vertically to the inline-end of the trigger (mirrors in RTL).

### 4.2 Viewport Boundary Collision Detection
Before rendering, the calculated target rect is checked against viewport boundaries (`window.innerWidth`, `window.innerHeight` with `8px` safety gutter):
- If `placement="top"` collides with the top viewport edge, it automatically flips to `bottom`.
- If `placement="bottom"` collides with the bottom viewport edge, it automatically flips to `top`.
- If `placement="left"` collides with the inline edge, it flips to `right` (and vice-versa).

### 4.3 Stacking Context
Consumes `--z-tooltip: 600`, which is the highest tier in our universal 10-step semantic scale:
`--z-base (0) < --z-raised (10) < --z-sticky (100) < --z-dropdown (200) < --z-overlay (300) < --z-drawer (310) < --z-modal-backdrop (400) < --z-modal (410) < --z-toast (500) < --z-tooltip (600)`.

---

## 5. Visual Styling & White-Label Token Contracts

| Property | Dashboard Standard | Website Standard | Token / Variable |
| :--- | :--- | :--- | :--- |
| **Surface (Inverted)** | `#18181b` (Light mode) / `#27272a` (Dark mode) | High-contrast inverted dark surface | High-contrast surface |
| **Foreground Text** | `#ffffff` / `#fafafa` (WCAG AAA contrast > 7:1) | High-contrast white | High-contrast text |
| **Typography** | `12px / 16px`, weight `500` (Medium) | `13px / 18px`, weight `500` (Medium) | `--font-size-xs` |
| **Radius** | `6px` (`--radius-md`) | `8px` (`--radius-lg`) | `--radius-control` |
| **Padding** | `4px 8px` (`--space-1` / `--space-2`) | `6px 10px` (`--space-1` / `--space-2-5`) | Logical `padding-block` & `padding-inline` |
| **Shortcut Tag** | Muted `<kbd>` badge with border | Muted `<kbd>` badge with border | Tabular numbers, uppercase mono font |
| **Shadow Policy** | **100% Shadow-Free** (1px subtle border) | Restrained shadow `--website-shadow-menu` | Shadow gate script verified |
| **Motion** | Enter `120ms` (`--motion-duration-fast`), exit `80ms` | Fast enter/exit transitions | Collapses to `0ms` under reduced motion |

---

## 6. Component TypeScript Interface

```tsx
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'contrast' | 'subtle';

export interface TooltipProps {
  /** The content displayed inside the floating tooltip bubble */
  content: ReactNode;

  /** The single interactive trigger element (Button, Link, Icon) */
  children: ReactElement;

  /** Preferred placement relative to the trigger. Defaults to 'top' */
  placement?: TooltipPlacement;

  /** Whether to render a directional arrow notch. Defaults to true */
  arrow?: boolean;

  /** Warm-up hover delay in milliseconds before opening. Defaults to 250ms */
  delayDuration?: number;

  /** Grace period in milliseconds for instant opening of adjacent tooltips. Defaults to 200ms */
  skipDelayDuration?: number;

  /** Visual variant: 'contrast' (inverted dark bubble) or 'subtle' (raised surface with border). Defaults to 'contrast' */
  variant?: TooltipVariant;

  /** Optional keyboard shortcut string rendered as an accessible <kbd> tag (e.g. '⌘K', 'Esc') */
  shortcut?: string;

  /** Controlled open state */
  open?: boolean;

  /** Default open state for uncontrolled usage */
  defaultOpen?: boolean;

  /** Callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;

  /** Disables the tooltip from showing */
  disabled?: boolean;

  /** Optional className for the tooltip floating bubble */
  className?: string;
}
```

---

## 7. Interactive Studio & Pattern Gallery Plan (`/gallery/tooltip`)

The interactive studio will allow testing and inspecting:
1. **Live Trigger Specimen:**
   - Single-button trigger, icon-only button trigger, and text link trigger.
   - Live hovering, focus states, and keyboard `Escape` dismissal.
2. **Interactive Controls:**
   - **Placements:** `Top`, `Bottom`, `Left`, `Right`.
   - **Variants:** `Contrast (Inverted Dark)` vs `Subtle (Surface Raised)`.
   - **Arrow Toggle:** With arrow notch vs borderless pill.
   - **Shortcut Selector:** None, `⌘K`, `Shift+?`, `Esc`, `⌘S`.
   - **Hover Delay Slider:** Instant (`0ms`), Default (`250ms`), Slow (`600ms`).
   - **Specimen Direction:** LTR (Latin) vs RTL (Arabic) with directional mirroring.
3. **Inspector Panel:**
   - **Selected Settings & Computed Specs:** Measured bounding box, computed placement, active delay, z-index (`600`).
   - **Code Export:** Copyable JSX snippet and CSS Module code.
   - **AI Agent Prompt:** Instant generation prompt for implementing tooltips.

---

## 8. Verification Strategy

1. **Vitest Unit Tests (`tooltip.test.tsx`):**
   - Renders trigger with `aria-describedby` matching tooltip `id`.
   - Opens on pointer hover after delay duration.
   - Opens immediately on keyboard focus.
   - Closes immediately on `Escape` keydown.
   - Keeps tooltip visible when pointer crosses into tooltip bubble (WCAG 1.4.13).
   - Renders optional arrow notch and keyboard shortcut `<kbd>` badge.
   - Honors `disabled={true}` prop.
2. **Quality Gates:**
   - `node scripts/sync-shared.mjs --check` (Zero code drift).
   - `node scripts/check-dashboard-shadows.mjs` (Zero dashboard shadows).
   - `tsc --noEmit` on Dashboard & Website.
   - `pnpm test` on Dashboard & Website.

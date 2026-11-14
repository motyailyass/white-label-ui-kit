# Tooltip — Component Specification and Implementation Reference

> **Status:** Implemented Reference (`components/ui/tooltip` + interactive Tooltip Studio)  
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
- **Bidirectional Support:** Logical placements (`start` / `end`) resolve dynamically via `dir`, ancestor `[dir]`, or computed direction, and `<kbd>` shortcut glyphs isolate an inner `<span dir="ltr">` so combinations such as `⌘K` never invert in RTL.
- **Zero Dashboard Shadows:** Visual separation uses semantic surfaces (`--color-primary` / `--color-primary-foreground` for `contrast`, `--color-surface-raised` / `--color-border-subtle` for `subtle`) without box shadows.

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
- `start` / `end`: Logical horizontal placements resolving physically to `left`/`right` in LTR and reversing in RTL.
- `left` / `right`: Explicit physical horizontal placements centered vertically beside the trigger.

### 4.2 Viewport Boundary Collision Detection
Before rendering, the calculated target rect is checked against viewport boundaries (`window.innerWidth`, `window.innerHeight` with `8px` safety gutter and `sideOffset` default `8px`):
- If `placement="top"` collides with the top viewport edge, it automatically flips to `bottom`.
- If `placement="bottom"` collides with the bottom viewport edge, it automatically flips to `top`.
- If physical/resolved `left` or `right` collides with the viewport horizontal edge, it flips to the opposite side when sufficient space exists.

### 4.3 Stacking Context
Consumes `--z-tooltip: 600`, which is the highest tier in our universal 10-step semantic scale:
`--z-base (0) < --z-raised (10) < --z-sticky (100) < --z-dropdown (200) < --z-overlay (300) < --z-drawer (310) < --z-modal-backdrop (400) < --z-modal (410) < --z-toast (500) < --z-tooltip (600)`.

---

## 5. Visual Styling & White-Label Token Contracts

| Property | Dashboard Standard | Website Standard | Token / Variable |
| :--- | :--- | :--- | :--- |
| **Contrast Variant (`variant="contrast"`)** | High-contrast monochrome fill & foreground (`#141414` light / `#fafafa` dark) | Same shared monochrome contrast role tokens | `--color-primary`, `--color-primary-foreground` |
| **Subtle Variant (`variant="subtle"`)** | Raised surface with `1px` subtle border | Raised surface with `1px` subtle border | `--color-surface-raised`, `--color-text-primary`, `--color-border-subtle` |
| **Typography** | `12px` (`0.75rem`), weight `500`, snug / Arabic-cleared line-height | `12px` (`0.75rem`), weight `500`, snug / Arabic-cleared line-height | `--font-size-xs`, `--font-weight-medium`, `--line-height-snug`, `--line-height-arabic-snug` |
| **Radius** | `6px` (`--radius-md`) | `8px` (`--radius-lg`) | `--radius-control` |
| **Padding** | `4px` (`--space-1`) block / `8px` (`--space-2`) inline | `4px` (`--space-1`) block / `8px` (`--space-2`) inline | `padding-block`, `padding-inline` |
| **Shortcut Tag (`<kbd>`)** | `--radius-xs` (`2px`), `--font-family-mono`, normal tracking, isolated `<span dir="ltr">` | `--radius-xs` (`2px`), `--font-family-mono`, normal tracking, isolated `<span dir="ltr">` | `color-mix(in srgb, currentColor 16%, transparent)` / `--color-surface-subtle` |
| **Shadow Policy** | **100% Shadow-Free** (`1px` border) | **100% Shadow-Free** (`1px` border) | `scripts/check-dashboard-shadows.mjs` |
| **Motion** | Enter animation `120ms` (`--motion-duration-fast` + `--motion-ease-enter`) | Enter animation `120ms` (`--motion-duration-fast` + `--motion-ease-enter`) | Disables `@media (prefers-reduced-motion: reduce)` |
| **Stacking Layer** | Highest layer (`600`) | Highest layer (`600`) | `--z-tooltip` |

---

## 6. Component TypeScript Interface

```tsx
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right' | 'start' | 'end';
export type TooltipVariant = 'contrast' | 'subtle';

export interface TooltipProps {
  /** The content displayed inside the floating tooltip bubble */
  content: ReactNode;

  /** The single interactive trigger element (Button, Link, Icon, etc.) */
  children: ReactElement;

  /** Preferred placement relative to the trigger. Defaults to 'top' */
  placement?: TooltipPlacement;

  /** Whether to render a directional arrow notch. Defaults to true */
  arrow?: boolean;

  /** Warm-up hover delay in milliseconds before opening. Defaults to 250ms */
  delayDuration?: number;

  /** Grace period in milliseconds for instant opening of adjacent tooltips. Defaults to 200ms */
  skipDelayDuration?: number;

  /** Distance in pixels between trigger and tooltip bubble. Defaults to 8px */
  sideOffset?: number;

  /** Visual variant: 'contrast' or 'subtle'. Defaults to 'contrast' */
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

  /** Explicit direction override ('ltr' | 'rtl') */
  dir?: 'ltr' | 'rtl';

  /** Optional className for the tooltip floating bubble */
  className?: string;
}
```

---

## 7. Interactive Tooltip Studio (`/gallery/tooltip`)

The Studio page (`components/patterns/tooltip-gallery`) provides live configuration controls and code/spec inspection:
1. **Specimen Direction & Script:** Toggle between `LTR` and Arabic `RTL` (`dir` + `lang="ar"` subtree translation) cleanly synced with global locale direction.
2. **Placements & Variants:** Test all 6 placements (`top`, `bottom`, `start`, `end`, `left`, `right`) and both variants (`contrast`, `subtle`), plus the directional arrow notch toggle.
3. **Trigger Types, Shortcuts & Delay:** Switch between `Icon Button`, `Text Button`, and `Action Pill` (`<button type="button">`), shortcut badges (`None`, `⌘K`, `Shift+?`, `Esc`), hover warm-up delays (`0ms`, `250ms`, `500ms`), and `disabled` state, plus an interactive skip-delay toolbar for testing adjacent `0ms` transitions.
4. **Code & Token Inspector:** Copy live JSX, conditional CSS Module snippet (for `Action Pill` only), AI Agent prompts, and localized accessibility/token specs.

---

## 8. Verification Matrix

1. **Vitest Unit Tests (`tooltip.test.tsx`):**
   - [x] Renders trigger with dynamic `aria-describedby` matching tooltip `id`.
   - [x] Opens on pointer hover after `delayDuration` and immediately on keyboard focus.
   - [x] Closes immediately on `Escape` and `blur`; remains open when pointer enters bubble (WCAG 1.4.13 Hoverable).
   - [x] Opens adjacent tooltip immediately within `skipDelayDuration` grace period.
   - [x] Renders optional arrow notch, `contrast` & `subtle` variants, controlled `open`, `disabled`, and forwarded `ref`.
   - [x] Isolates `<kbd>` shortcut text inside `<span dir="ltr">`, resolves logical `start`/`end` in RTL vs LTR, and auto-flips on viewport collision.
2. **Playwright E2E (`e2e/tooltip.spec.ts`):**
   - [x] Real-browser keyboard focus, `Escape` dismissal, variant switching, RTL shortcut isolation, `start` logical flip, and zero dashboard shadows.
3. **Quality Gates:**
   - `node scripts/sync-shared.mjs --check`
   - `node scripts/check-dashboard-shadows.mjs`
   - `tsc --noEmit` & `oxlint` & `vitest run` on Next.js Dashboard, Next.js Website, and Vite Dashboard.

# Popover — Component Specification and Implementation Plan

> **Status:** Approved baseline for implementation  
> **Component:** `components/ui/popover`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/popover/`  
> **Gallery route:** `/gallery/popover`  
> **Specification Version:** 2.1 (Reconciled with Auditor Feedback)

---

## 1. Purpose & Core Architectural Taxonomy

A **Popover** is a non-modal floating overlay anchored to a trigger element (typically a `<button>`). It presents contextual content, micro-forms, filters, disclosures, or interactive settings directly adjacent to the trigger without locking the page.

### 1.1 Strict Overlay Boundaries in this UI Kit

| Component | Modal? | Background Inert? | Stacking Mechanism | Interaction & Dismissal |
| :--- | :---: | :---: | :---: | :--- |
| **Popover** *(This Component)* | **No** (`aria-modal="false"`) | **No** (Underlying page interactive) | Native HTML `popover="auto"` (Top Layer) / Data-state attribute | Anchored to trigger. Light dismiss on outside click and <kbd>Escape</kbd>. Outside click does **not** hijack focus back to trigger. |
| **Dialog** (`components/ui/dialog`) | **Yes** (`showModal()`) | **Yes** (`inert` via browser) | Top Layer (`::backdrop`) | Blocking modal for critical workflows, confirmations, or long forms. Traps focus inside. |
| **Tooltip** (`components/ui/tooltip`) | **No** | **No** | `--z-tooltip: 600` | Non-interactive text label on hover/focus (`role="tooltip"`). Contains zero interactive controls. |
| **DropdownMenu** (`components/ui/dropdown-menu`) | **No** | **No** | `--z-dropdown: 200` | Menu command item selection via arrow keys (`role="menu"` / `role="menuitem"`). |

---

## 2. Foundation: Primary Overlay & Supported Browser Matrix

### 2.1 Supported Browser Matrix & Primary Path
The component targets modern Baseline Web engines (Chromium 114+, Safari 17+, Firefox 125+):
- **Native HTML Popover API (`popover="auto"`)**:
  - Automatically elevates the popover into the browser’s **Top Layer** without magic z-index inflation, cleanly rendering in front of all standard page layers and properly stacking above native modal `<dialog>` elements when invoked from within a modal dialog.
  - Native browser light dismissal (outside click and <kbd>Escape</kbd>) is provided natively by the engine.
  - The background document remains interactive and non-inert.
- **Styling Parity Across Engines**:
  - To prevent browsers or test harnesses that do not recognize `:popover-open` from discarding rules, display states are strictly controlled via `[data-state="open"]` and `[data-state="closed"]`.
- **Test Environment Stub (JSDOM)**:
  - In JSDOM / headless Vitest environments where `showPopover` / `hidePopover` are not present on `HTMLElement.prototype`, a lightweight mock is provided in the test harness that dispatches native `toggle` events.

### 2.2 Controlled State & Competing Popovers Coordination
1. **Single Source of Truth**:
   - `open` (controlled) and `defaultOpen` (uncontrolled) drive visibility via `useLayoutEffect`.
   - Transitions from `false -> true` call `popover.showPopover()`.
   - Transitions from `true -> false` call `popover.hidePopover()`.
2. **Coordinating Competing Auto Popovers**:
   - In accordance with the HTML Popover specification, opening an auto popover will automatically close any unrelated open auto popover.
   - When the browser closes a popover due to light dismiss or a competing popover opening, the native `toggle` event fires (`newState === 'closed'`).
   - The primitive dispatches `onOpenChange?.(false)`.
   - **No Infinite Loops**: The component does **not** aggressively force-reopen in a microtask if the browser closed it. Reconciliation only occurs if the parent explicitly toggles the controlled `open` prop from `false` to `true`, preventing two controlled popovers from competing in an infinite toggle loop.

### 2.3 Positioning Architecture (Pure White-Label, Zero External Libraries)
The native HTML Popover API handles **stacking and light dismiss**, but it **does not handle anchor positioning**. In accordance with Rule 10 (Zero third-party UI/headless libraries: no Popper, no Floating UI, no Radix), we own the positioning engine:
1. **Dynamic Coordinate Calculation**: While open, coordinates are computed using `trigger.getBoundingClientRect()`, `popover.getBoundingClientRect()`, and current scroll offsets.
2. **Scroll & Resize Tracking**: When open, listeners on `window` (`resize`, and `scroll` with `{ passive: true, capture: true }`) update coordinates smoothly so the popover remains locked to its anchor during page and container scrolling.
3. **Four-Edge Viewport Boundary Clamping**:
   - Lateral clamping: Enforces a minimum 16px lateral gutter (`--space-4`) on mobile screens (320px–390px) to prevent overflowing viewport sides.
   - Vertical clamping & auto-flip: If a popover placed at `bottom` overflows the bottom viewport edge, it automatically flips to `top` if space permits. When space is constrained on both sides, `max-height` clamps to available viewport height and internal scrolling (`overflow-y: auto`) engages on `.body`.
4. **Physical vs. Logical Placement**:
   - Logical positions (`inline-start`, `inline-end`) are resolved according to effective direction (`dir="ltr"` vs `dir="rtl"`).
   - Physical positions (`top`, `bottom`, `left`, `right`) remain explicit.

---

## 3. Accessibility & Focus Ergonomics

### 3.1 Content-Driven Semantics (Explicit vs. Generic)
- **Generic Floating Disclosure (Default)**:
  - When used for contextual toolbars, formatting palettes, or informational text cards, `role` is omitted (generic content).
  - The trigger receives `aria-expanded` and `aria-controls`, but **not** `aria-haspopup="dialog"`.
  - The popover surface is rendered immediately after the trigger in the DOM flow so keyboard navigation naturally moves from the trigger into the popover content.
- **Interactive Dialog Popover (`role="dialog"`)**:
  - When the popover contains an interactive micro-form, multi-field filter, or settings card, callers specify `role="dialog"`.
  - Callers **must** provide an accessible name via `aria-labelledby` referencing `PopoverTitle` or caller-supplied `aria-label`.
  - The trigger receives `aria-haspopup="dialog"`.
  - Renders with `aria-modal="false"` explicitly indicating non-modal nature.

### 3.2 Focus Decoupling on Dismissal & Open
1. **On Open**:
   - Interactive Form / Settings (`role="dialog"` or when `initialFocusRef` is provided): Focus moves to the first focusable element (or `initialFocusRef`).
   - Generic / Informational Content: Focus remains on the trigger to avoid disorienting screen reader users.
2. **On Close**:
   - **<kbd>Escape</kbd>**: Focus returns to the invoking trigger.
   - **Outside Click**: **Do NOT hijack focus back to the trigger.** The clicked external element receives focus and executes its intended action normally without interruption.
   - **Explicit Close Button**: Focus returns to the invoking trigger.
   - **Trigger Unmounted / Removed**: Focus does not attempt to focus a detached DOM node.

### 3.3 Contrast & Focus Appearance (WCAG 2.2 AA / AAA)
- **Token Measurements**:
  - Light theme: Surface `--color-surface-raised` (`#ffffff`), text `--color-text-primary` (`#141414`), contrast = **18.42:1** (exceeds WCAG AAA 7:1).
  - Dark theme: Surface `--color-surface-raised` (`#141414`), text `--color-text-primary` (`#fafafa`), contrast = **17.34:1**.
  - Surface step `--color-surface` (`#1f1f1f`) against `#fafafa` achieves **15.83:1** (exceeds WCAG AAA 7:1).
  - Visible focus outlines: Immediate 0ms visible outline consuming `--focus-ring-width: 2px` and `--color-border-focus` (`#525252` light / `#a3a3a3` dark).
- **High Contrast (Forced Colors)**: Surface border maps to `ButtonBorder` (2px solid), background to `Canvas`, text to `CanvasText`.

---

## 4. Public TypeScript API

```typescript
import {
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

export type PopoverPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'inline-start'
  | 'inline-end';

export interface PopoverProps {
  /**
   * Controlled open state.
   */
  open?: boolean;

  /**
   * Initial open state for uncontrolled usage.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Callback fired when open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Preferred placement relative to the trigger.
   * @default 'bottom-start'
   */
  placement?: PopoverPlacement;

  /**
   * Distance in pixels between trigger and popover surface.
   * @default 8
   */
  offset?: number;

  /**
   * Whether to flip placement when colliding with viewport boundaries.
   * @default true
   */
  autoFlip?: boolean;

  /**
   * Popover children (typically PopoverTrigger and PopoverContent).
   */
  children: ReactNode;
}

export interface PopoverTriggerProps extends ComponentPropsWithRef<'button'> {
  /**
   * Renders as child element slot.
   */
  asChild?: boolean;
}

export type PopoverContentProps =
  | {
      /**
       * Interactive dialog popover. Requires an accessible name.
       */
      role: 'dialog';
      'aria-label'?: string;
      'aria-labelledby'?: string;
      initialFocusRef?: RefObject<HTMLElement | null>;
      maxWidth?: number | string;
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
    }
  | {
      /**
       * Generic non-dialog floating disclosure (default).
       */
      role?: 'region' | 'none';
      'aria-label'?: string;
      'aria-labelledby'?: string;
      initialFocusRef?: RefObject<HTMLElement | null>;
      maxWidth?: number | string;
      className?: string;
      style?: CSSProperties;
      children?: ReactNode;
    };
```

---

## 5. CSS Modules Architecture (`popover.module.css`)

```css
/**
 * White Label UI Kit — Popover Stylesheet
 * 100% CSS Logical Properties. Zero Dashboard Shadows.
 */

.popover {
  margin: 0;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  overflow: visible;
}

.popover[data-state="open"] {
  display: block;
}

.popover[data-state="closed"] {
  display: none !important;
}

.surface {
  position: fixed;
  z-index: var(--z-dropdown); /* 200 */
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-inline-size: min(100%, 200px);
  max-inline-size: min(calc(100vw - var(--space-8)), var(--_popover-max-width, 340px));
  max-block-size: min(calc(100vh - var(--space-8)), 480px);
  border-radius: var(--radius-card);
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  font-family: inherit;
  outline: none;
  overflow: visible;
}

.body {
  flex: 1 1 auto;
  min-block-size: 0;
  padding-inline: var(--space-4);
  padding-block: var(--space-3);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.header {
  flex-shrink: 0;
  padding-inline: var(--space-4);
  padding-block: var(--space-3);
  border-block-end: 1px solid var(--color-border-subtle);
}

.title {
  margin: 0;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-tight);
}

.description {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
}

.footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  padding-inline: var(--space-4);
  padding-block: var(--space-3);
  border-block-start: 1px solid var(--color-border-subtle);
  background-color: var(--color-surface);
}

@media (forced-colors: active) {
  .surface {
    border: 2px solid ButtonBorder;
    background-color: Canvas;
    color: CanvasText;
  }
}
```

---

## 6. Implementation Plan & Minimum Acceptance Tests

1. **Trigger & Pointer/Keyboard Opening**:
   - Pointer click toggles state; updates `aria-expanded`.
   - <kbd>Enter</kbd> / <kbd>Space</kbd> opens popover.
2. **Dismissal & Focus Decoupling**:
   - <kbd>Escape</kbd> closes popover and restores focus to trigger.
   - Outside click dismisses popover **without hijacking focus from the clicked element**.
3. **Controlled State & Competing Popovers**:
   - Two auto popovers on the same page do not enter an infinite loop when toggled.
   - Parent state updates synchronize immediately to the DOM.
4. **Collision, Flipping, Scroll & Resize**:
   - Auto-flips when colliding with bottom viewport edge.
   - Clamps within lateral viewport padding (16px) on mobile (320px).
   - Dynamically tracks anchor position during page and container scrolling.
5. **Nesting Inside Modal `<dialog>`**:
   - Popover rendered from inside a modal dialog displays in front of the dialog in the Top Layer.
   - First <kbd>Escape</kbd> closes popover; second <kbd>Escape</kbd> closes dialog.
6. **Inner `<Select>` Integration**:
   - Native `<Select>` inside popover works seamlessly.
7. **Semantics & Accessibility**:
   - Generic disclosure renders with no forced dialog role; dialog popover enforces accessible name.
   - 100% RTL and Arabic layout clearance.
   - 0 dashboard shadows verified via `check-dashboard-shadows.mjs`.

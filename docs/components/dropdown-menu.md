# DropdownMenu — Component Specification and Implementation Plan

> **Status:** Proposed baseline for team review  
> **Component:** `components/ui/dropdown-menu`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/dropdown-menu/`  
> **Gallery route:** `/gallery/dropdown-menu`  

This document defines the architectural foundation, accessibility requirements, state synchronization, public API, positioning engine, keyboard navigation contract, and verification matrix for the white-label **DropdownMenu** primitive.

---

## 1. What is a DropdownMenu?

A **DropdownMenu** is an anchored, floating action surface triggered by a button that presents a list of discrete commands, options, or cascading submenus. It follows the **WAI-ARIA Menu Pattern** (`role="menu"`).

### Distinctions from Sibling Primitives

| Primitive | Primary Purpose | ARIA Semantics | Keyboard Paradigm | Focus & Modality |
| :--- | :--- | :--- | :--- | :--- |
| **DropdownMenu** | Command list, action dispatch, navigation shortcuts | `role="menu"` / `role="menuitem"` | Roving tabindex / arrow keys (`↑`, `↓`, `Home`, `End`), typeahead | Non-modal; closes on item activation; moves focus into menu |
| **Select** | Form input to select one (or more) data values for submission | `role="combobox"` / `role="listbox"` / `role="option"` | Arrow keys, typeahead, `Enter` / `Space` selection | Form-bound; associates with form reset/validation |
| **Popover** | Arbitrary rich disclosure (forms, filter cards, settings) | `role="region"` / `role="dialog"` / generic | Standard Tab sequence through focusable controls | Non-modal; does not close on internal interaction |
| **Dialog** | Modal workflow interrupting user task | `role="dialog"` + `aria-modal="true"` | Strict Tab focus trap, initial focus targeting | Modal; background becomes `inert`; body scroll locked |
| **Tooltip** | Brief non-interactive contextual description | `role="tooltip"` | No keyboard focus inside; hover/focus triggered | Non-interactive; floating contextual hint |

---

## 2. Architectural Foundation & Top-Layer Strategy

### 2.1 Primary Path: Native Popover API (`popover="auto"`)

Following the validated architecture established in `Popover`, `DropdownMenu` uses the browser's native **Popover API** (`popover="auto"`) as its primary top-layer foundation:
1. **Top-Layer Promotion:** Promoted natively to the browser's top layer, bypassing `overflow: hidden` on parent containers and rendering seamlessly above native modal `<dialog>` elements without arbitrary z-index escalation.
2. **Light Dismiss:** Native browser light-dismiss on outside pointerdown and Escape key press.
3. **Competing Overlay Yielding:** Opening another `popover="auto"` or top-layer surface triggers native dismissal, handled by the component's state reconciliation engine.

### 2.2 Tested Fallback Path

For runtime environments lacking HTML Popover API support or CSS `:popover-open` selectors:
- Feature detection via:
  ```ts
  const supportsNativePopover =
    typeof HTMLElement !== 'undefined' &&
    typeof HTMLElement.prototype.showPopover === 'function' &&
    typeof CSS !== 'undefined' &&
    typeof CSS.supports === 'function' &&
    CSS.supports('selector(:popover-open)');
  ```
- Graceful degradation using high-elevation CSS positioning: `--z-dropdown: 200` with clean stacking context isolation.
- Manual document-level `pointerdown` outside-click listener and `keydown` Escape handler (automatically omitted when native light dismiss is active to prevent redundant/conflicting handlers).
- Controlled via `data-fallback="true"` and `data-state="open" | "closed"` attribute selectors.

---

## 3. Core UI Boundary & White-Label Purity

Following UI-Kit Non-Negotiables and `primitive-craft`:
1. **Zero External Dependencies:** No Radix UI, Floating UI, Popper.js, Downshift, or Tailwind. Own markup, positioning geometry, and event dispatch.
2. **Pure UI Boundary:** `src/components/ui/dropdown-menu/` must contain zero imports from `@/providers`, `@/i18n`, `next/*`, `@tanstack/react-query`, or form libraries.
3. **Zero Hardcoded Copy:** Zero English strings (`"More"`, `"Options"`, `"Select"`, `"Back"`). All labels, accessible names, and item text are provided via props or child slots.
4. **CSS Modules + Logical Properties:** 100% logical properties (`padding-inline`, `margin-block`, `inset-inline-*`, `min-block-size`). Zero physical coordinates (`left`, `right`, `top`, `bottom` in styling).
5. **Dashboard Zero-Shadow Rule:** In Dashboard, visual elevation is achieved exclusively through semantic surface layering (`--color-surface-raised`), borders (`--color-border-subtle`), and overlay backdrops. In Website, restrained shadows consume `--website-shadow-menu`.
6. **Polymorphic Triggers & Items:** `asChild` composition pattern on triggers; host-agnostic `as?: ElementType` on menu items (e.g. for anchor links `as="a"`, automatically adding `rel="noopener noreferrer"` when `target="_blank"`).

---

## 4. Public Component API & Subcomponent Tree

### 4.1 Subcomponent Inventory

```text
DropdownMenu (Root Provider & Coordinator)
├── DropdownMenuTrigger (Anchor Button / Custom Trigger)
└── DropdownMenuContent (Floating Menu Surface)
    ├── DropdownMenuGroup (Logical section grouping)
    │   ├── DropdownMenuLabel (Non-interactive section heading)
    │   ├── DropdownMenuItem (Standard interactive command)
    │   │   ├── DropdownMenuShortcut (Visual keyboard hint)
    │   ├── DropdownMenuCheckboxItem (Toggleable checkmark option)
    │   ├── DropdownMenuRadioGroup (Mutually exclusive selection container)
    │   │   └── DropdownMenuRadioItem (Single radio selection option)
    │   └── DropdownMenuSeparator (Semantic horizontal divider)
    └── DropdownMenuSub (Cascading nested submenu root)
        ├── DropdownMenuSubTrigger (Submenu activator with chevron)
        └── DropdownMenuSubContent (Cascading submenu surface)
```

### 4.2 Component Contracts

#### `DropdownMenu` (Root)
```tsx
export interface DropdownMenuProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Event callback fired when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement relative to the trigger */
  placement?:
    | 'bottom-start'
    | 'bottom-end'
    | 'bottom-center'
    | 'top-start'
    | 'top-end'
    | 'top-center'
    | 'inline-start'
    | 'inline-end';
  /** Pixel distance offset from trigger (defaults to 4) */
  offset?: number;
  /** Automatically flip to opposite side on viewport collision (default: true) */
  autoFlip?: boolean;
  /** Direction override for the menu ('ltr' | 'rtl') */
  dir?: 'ltr' | 'rtl';
  /** Children compound tree */
  children: ReactNode;
}
```

#### `DropdownMenuTrigger`
```tsx
export interface DropdownMenuTriggerProps extends ComponentPropsWithRef<'button'> {
  /** If true, clones the direct child element instead of rendering a button */
  asChild?: boolean;
}
```
- Sets `type="button"` by default.
- Injects `aria-haspopup="menu"`, `aria-expanded={isOpen}`, and `aria-controls={menuId}`.
- Listens for `onClick`, `onKeyDown` (`ArrowDown`, `ArrowUp`, `Enter`, `Space`).

#### `DropdownMenuContent`
```tsx
export interface DropdownMenuContentProps extends ComponentPropsWithRef<'div'> {
  /** Accessible label for the menu if not labelled by trigger */
  'aria-label'?: string;
  /** ID of element that labels the menu */
  'aria-labelledby'?: string;
  /** Maximum block size / height before internal scrolling occurs */
  maxHeight?: number | string;
  /** Minimum width for the menu container */
  minWidth?: number | string;
  /** Loop keyboard navigation around ends (default: true) */
  loop?: boolean;
}
```
- Emits `role="menu"`, `tabIndex={-1}`, and dynamic `id`.
- Manages roving focus and arrow navigation across child items.

#### `DropdownMenuItem`
```tsx
export interface DropdownMenuItemProps extends ComponentPropsWithRef<'button'> {
  /** Host-agnostic element type (defaults to 'button') */
  as?: ElementType;
  /** Disabled state: item cannot be focused or activated */
  disabled?: boolean;
  /** Destructive action variant styling */
  variant?: 'default' | 'danger';
  /** Leading icon slot */
  startIcon?: ReactNode;
  /** Trailing icon or chevron slot */
  endIcon?: ReactNode;
  /** Callback fired upon menu item selection */
  onSelect?: (event: Event) => void;
  /** Close menu on select (default: true) */
  closeOnSelect?: boolean;
}
```
- Emits `role="menuitem"`, `tabIndex={isActive ? 0 : -1}`, `aria-disabled={disabled || undefined}`.
- Suppresses native submission (`type="button"`).

#### `DropdownMenuCheckboxItem`
```tsx
export interface DropdownMenuCheckboxItemProps extends DropdownMenuItemProps {
  /** Checked boolean or indeterminate */
  checked?: boolean | 'indeterminate';
  /** Callback when checked status changes */
  onCheckedChange?: (checked: boolean) => void;
}
```
- Emits `role="menuitemcheckbox"`, `aria-checked={checked}`.
- Renders an accessible indicator slot with checkmark/dash.

#### `DropdownMenuRadioGroup` & `DropdownMenuRadioItem`
```tsx
export interface DropdownMenuRadioGroupProps extends ComponentPropsWithRef<'div'> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export interface DropdownMenuRadioItemProps extends DropdownMenuItemProps {
  value: string;
}
```
- RadioGroup emits `role="group"`.
- RadioItem emits `role="menuitemradio"`, `aria-checked={isSelected}`.

#### `DropdownMenuSeparator` & `DropdownMenuLabel`
- `DropdownMenuSeparator`: `role="separator"`, `aria-orientation="horizontal"`.
- `DropdownMenuLabel`: Semantic text label; when inside a group, linked via `aria-labelledby`.

#### `DropdownMenuShortcut`
- Semantic `<kbd className={styles.shortcut}>` displaying platform-appropriate shortcut strings.

---

## 5. Keyboard Navigation & Focus Engine (WAI-ARIA Menu)

### 5.1 Keyboard Interaction Matrix

| Key | Context | Behavior |
| :--- | :--- | :--- |
| `ArrowDown` | Trigger (closed) | Opens menu and focuses the **first enabled item**. |
| `ArrowUp` | Trigger (closed) | Opens menu and focuses the **last enabled item**. |
| `Enter` / `Space` | Trigger (closed) | Opens menu and focuses the **first enabled item**. |
| `ArrowDown` | Menu (open) | Moves focus to the **next enabled item** (wraps to start if `loop={true}`). |
| `ArrowUp` | Menu (open) | Moves focus to the **previous enabled item** (wraps to end if `loop={true}`). |
| `Home` | Menu (open) | Moves focus directly to the **first enabled item**. |
| `End` | Menu (open) | Moves focus directly to the **last enabled item**. |
| `Enter` / `Space` | Menu Item | Activates the item, invokes `onSelect` / `onClick`, and closes the menu (unless prevented). |
| `Escape` | Menu (open) | Closes active menu, stops event propagation, and **restores focus to trigger**. |
| `Tab` / `Shift+Tab` | Menu (open) | Closes menu immediately and allows standard document tab sequence to resume. |
| `ArrowRight` (LTR) / `ArrowLeft` (RTL) | Submenu Trigger | Opens cascading submenu and focuses its first enabled item. |
| `ArrowLeft` (LTR) / `ArrowRight` (RTL) | Submenu Content | Closes cascading submenu and returns focus to its parent subtrigger. |
| Printable Char (`a-z`, `0-9`) | Menu (open) | **Typeahead**: searches item labels starting with typed character and moves focus. |

### 5.2 Focus Management & Roving Tabindex

1. **Roving Tabindex:**
   - Active/focused item has `tabIndex={0}`.
   - All other items have `tabIndex={-1}`.
   - Initial focus on open lands on the first item with `tabIndex={0}`.
2. **Disabled & Hidden Elements Filter:**
   - Focus calculation queries only visible, enabled items:
     - Rejects `disabled`, `aria-disabled="true"`, `button[disabled]`.
     - Rejects elements with `display: none`, `visibility: hidden`, `visibility: collapse`, `hidden` attribute, or `aria-hidden="true"`.
   - If the first item in the menu is disabled or hidden, initial focus lands cleanly on the first **interactive, enabled, and visible** item.
3. **Focus Restoration on Close:**
   - When closed via `Escape`, item activation, or light dismiss, focus is programmatically restored to `triggerRef.current`.
   - If trigger was removed from DOM during action dispatch, focus falls back cleanly to a safe body container without throwing.
4. **Outside Click Non-Stealing Policy:**
   - When a user clicks an external interactive control (such as an external button or input) while the menu is open, the click executes immediately on that target control; the menu dismisses without swallowing the pointer event or stealing focus back to the trigger.

---

## 6. State Reconciliation & Competing Overlay Policy

Following lessons verified in `Popover`:

### 6.1 Strict Controlled State Policy
- When `open` prop is controlled:
  - If `open === false`, trigger clicks fire `onOpenChange?.(true)` but **never** imperatively invoke `showPopover()` or open the DOM surface. The menu remains closed until the parent updates the prop to `true`.
  - If `open === true` and the native DOM surface was closed (e.g. yielded to another popover), clicking the trigger calls `onOpenChange?.(true)` and re-asserts top-layer presence (`showPopover()`).
  - If parent rejects closure (keeps `open={true}`), repeated `Escape` key presses continue sending close requests to `onOpenChange(false)` without getting locked by one-time flags.

### 6.2 Competing Menu & Top-Layer Yielding
- When native `toggle` fires `newState === 'closed'`:
  - Component checks if another top-layer popover is active in the document (`document.querySelector('[popover]:popover-open')`).
  - If another surface is active, the closed menu yields cleanly without entering a re-open loop.
  - The menu trigger synchronizes `aria-expanded="false"` based on `Boolean(open && isDomOpen)`.

---

## 7. Positioning & Viewport Geometry Engine

### 7.1 Logical Placements
Supported placements:
- `bottom-start` (default for LTR: bottom-left; for RTL: bottom-right)
- `bottom-end` (LTR: bottom-right; RTL: bottom-left)
- `bottom-center`
- `top-start`
- `top-end`
- `top-center`
- `inline-start` (lateral side: left in LTR, right in RTL)
- `inline-end` (lateral side: right in LTR, left in RTL)

### 7.2 Collision Detection & Auto-Flip
- **Block-axis collision:** If `placement="bottom-*"` overflows the bottom viewport boundary, the positioning engine evaluates available clearance above the trigger. If clearance allows, it flips to `top-*`.
- **Inline-axis collision:** If menu surface exceeds viewport inline boundaries, it clamps `left` (or `right`) within a minimum safety padding (`8px` from viewport edges).
- **Max-height constraint:** If available block size is smaller than the menu content, sets `max-height: calc(100vh - 16px)` and enables `overflow-y: auto`.

### 7.3 Dynamic Viewport Tracking
- Registers passive `scroll` and `resize` event listeners on `window` and ancestors while menu is open.
- Positions are recalculated via `requestAnimationFrame` to ensure zero visual lagging or detaching.
- Cleanly deregisters all listeners on menu close and component unmount.

---

## 8. RTL, Internationalization & Bidi

1. **Logical CSS Properties:**
   - Item padding uses `padding-inline: var(--space-3)`.
   - Shortcut keys use `margin-inline-start: auto`.
   - Start icons use `margin-inline-end: var(--space-2)`.
2. **Direction Derivation & Inversion:**
   - Detects active direction from trigger's `element.closest('[dir]')` or document root.
   - Inverts lateral placements (`inline-start` vs `inline-end`).
   - Inverts submenu arrow-key navigation:
     - LTR: `ArrowRight` opens submenu; `ArrowLeft` closes submenu.
     - RTL: `ArrowLeft` opens submenu; `ArrowRight` closes submenu.
3. **Submenu Chevrons:**
   - Directional chevron icon uses `@/components/icons` semantic registry (`directional()`), which mirrors automatically under RTL without ad-hoc CSS transforms.

---

## 9. Design Tokens, Themes & Zero-Shadow Policy

### 9.1 Token Consumption

| Element | Semantic Token |
| :--- | :--- |
| **Menu Surface Background** | `var(--color-surface-raised)` |
| **Menu Border** | `var(--color-border-subtle)` |
| **Menu Radius** | `var(--radius-overlay)` (Dashboard: `8px`; Website: `12px`) |
| **Item Radius** | `var(--radius-control)` (Dashboard: `6px`; Website: `8px`) |
| **Item Min Block Size** | `var(--control-height-sm)` (`32px` in compact, `36px` default) |
| **Item Focus Ring** | `var(--focus-ring-width)` solid `var(--color-border-focus)` (immediate 0ms) |
| **Item Hover Surface** | `var(--color-surface-hover)` |
| **Destructive Item Text** | `var(--color-danger-text)` |
| **Destructive Item Hover** | `var(--color-danger-surface-hover)` |
| **Disabled Item** | `var(--color-text-disabled)`, `var(--color-control-disabled-bg)` |
| **Z-Index Layer** | `var(--z-dropdown)` (`200`) |

### 9.2 Dashboard Zero-Shadow Rule
- Dashboard menu surfaces must have **zero** `box-shadow`, `text-shadow`, or `filter: drop-shadow(...)`.
- Depth is communicated through contrast boundaries (`--color-surface-raised` against `--color-surface`), subtle perimeter border, and dark mode surface elevation.
- Verified via `pnpm run check:shadows`.

### 9.3 Forced Colors & Reduced Motion
- **Forced Colors (`@media (forced-colors: active)`):**
  - Active item indicator highlights using `SystemColor: Highlight` and `HighlightText`.
  - Borders enforce `1px solid ButtonBorder` or `CanvasText`.
- **Reduced Motion (`@media (prefers-reduced-motion: reduce)`):**
  - All duration tokens collapse to `0ms`.
  - Transitions disabled; state machine and focus updates occur instantly without awaiting transition events.

---

## 10. Integration with Modal Dialog

When a `DropdownMenu` is opened from within a modal `Dialog`:
1. **Top-Layer Stacking:** When using native Popover API, `popover="auto"` is placed in the top layer and renders in front of `<dialog>` regardless of dialog z-index.
2. **Fallback Stacking Context:** In fallback mode, the menu is portaled or rendered within the dialog container with `--z-dropdown: 200` relative to the dialog surface.
3. **Sequential Escape Handling:**
   - Pressing `Escape` when the menu is open dismisses the `DropdownMenu` first, restoring focus to the menu trigger.
   - The underlying `Dialog` remains open.
   - A subsequent `Escape` press closes the `Dialog`.

---

## 11. Gallery Specimens (`/gallery/dropdown-menu`)

The gallery page provides realistic, localized examples (EN, FR, AR):
1. **Basic Action Menu:** Common actions (Edit, Duplicate, Share, Delete).
2. **Item Variants:** Icons, shortcut badges (`⌘E`, `⇧⌘D`), destructive items.
3. **Checkbox Items:** Toggleable options (Show Toolbar, Show Full URLs).
4. **Radio Group Items:** Mutually exclusive options (View Mode: Compact, Normal, Relaxed).
5. **Cascading Submenus:** Nested menu tree (More Tools → Developer Tools, Page Source).
6. **Controlled vs Uncontrolled:** External state control with open/close verification.
7. **Inside Modal Dialog:** Dropdown menu invoked from a modal dialog form.
8. **Disabled & Hidden First Item:** Verifies initial focus skips disabled/hidden items.
9. **RTL & Long French Labels:** Stress tests clearance, text overflow, and bidi flipping.

---

## 12. Verification Matrix & Quality Gates

### 12.1 Vitest Unit Tests (`dropdown-menu.test.tsx`)
- [ ] Opens and closes via trigger click in uncontrolled mode.
- [ ] Opens via `ArrowDown` (focuses first enabled item) and `ArrowUp` (focuses last enabled item).
- [ ] Navigates with `ArrowDown` / `ArrowUp` and wraps cleanly with `loop={true}`.
- [ ] Jumps to first item on `Home` and last item on `End`.
- [ ] Typeahead selects item by initial letter.
- [ ] Activates item on `Enter` / `Space` and calls `onSelect`.
- [ ] Closes on `Escape` and restores focus to trigger.
- [ ] Outside click dismisses menu without preventing target control action.
- [ ] Initial focus skips disabled and `visibility: hidden` controls.
- [ ] Reconciles controlled `open={false}` and `open={true}` states.
- [ ] Checkbox items toggle `aria-checked` and fire `onCheckedChange`.
- [ ] Radio items update single active value within `DropdownMenuRadioGroup`.
- [ ] Forwarded refs and `asChild` composition maintain clean DOM references.

### 12.2 Real-Browser Playwright E2E Tests (`e2e/dropdown-menu.spec.ts`)
- [ ] Click trigger opens menu; roving arrow keys update focus visually.
- [ ] Escape dismisses menu and returns focus to trigger in real browser.
- [ ] Nested Submenu: `ArrowRight` opens submenu in LTR; `ArrowLeft` opens in RTL.
- [ ] Outside click executes action on outside button and dismisses menu.
- [ ] Mobile viewport (320px) containment without horizontal overflow.
- [ ] Menu inside modal `Dialog`: renders above dialog surface; Escape dismisses menu first.
- [ ] Zero dashboard shadows verified via `scripts/check-dashboard-shadows.mjs`.

### 12.3 Pre-Handoff Quality Gate Commands
```bash
# Shared sync check
node scripts/sync-shared.mjs --check

# Dashboard shadow policy gate
node scripts/check-dashboard-shadows.mjs

# Type-check & lint
cd typescript/nextjs/starterkit/dashboard && pnpm type-check && pnpm lint
cd typescript/nextjs/starterkit/website && pnpm type-check && pnpm lint

# Unit tests
cd typescript/nextjs/starterkit/dashboard && pnpm test src/components/ui/dropdown-menu/
cd typescript/nextjs/starterkit/website && pnpm test src/components/ui/dropdown-menu/

# Real-browser E2E
cd typescript/nextjs/starterkit/dashboard && npx playwright test e2e/dropdown-menu.spec.ts
```

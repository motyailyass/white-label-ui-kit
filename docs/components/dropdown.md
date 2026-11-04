# Dropdown — Component Specification and Implementation Plan

> **Status:** Revised baseline incorporating team review (Version 2)  
> **Component:** `components/ui/dropdown`  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/dropdown/`  
> **Mirrors:** Next.js Website, Vite Dashboard  
> **Gallery route:** `/gallery/dropdown`  

---

## 1. Purpose and Scope

The **Dropdown** primitive is an anchored, non-modal **action menu** triggered by a button that presents a list of commands or navigation links. It implements the **WAI-ARIA Menu Button Pattern** (`role="menu"`).

### Component Boundaries & Sibling Primitives

| Primitive | Primary Purpose | ARIA Semantics | Keyboard Paradigm | Focus & Modality |
| :--- | :--- | :--- | :--- | :--- |
| **Dropdown** | Menu of commands, actions, or navigation destinations | `role="menu"` / `role="menuitem"` | Roving tabindex / arrow keys (`↑`, `↓`, `Home`, `End`) | Non-modal; closes on item activation; moves focus into menu |
| **Select** | Form control to select one or more data values | `role="combobox"` / `role="listbox"` / `role="option"` | Arrow keys, typeahead, `Enter` / `Space` selection | Form-bound; associates with form validation/reset |
| **Popover** | Arbitrary floating content (forms, filter panels, disclosure) | `role="region"` / `role="dialog"` / generic | Standard Tab sequence through focusable controls | Non-modal; does not close on internal interaction |
| **Dialog** | Modal workflow interrupting user task | `role="dialog"` + `aria-modal="true"` | Strict Tab focus trap, initial focus targeting | Modal; background becomes `inert`; body scroll locked |

### First-Release Scope

#### Included in Release 1
- **Trigger & Anchored Menu Surface:** `Dropdown`, `DropdownTrigger`, `DropdownContent`.
- **Items & Structure:** Action buttons (`DropdownItem`), navigation links (`DropdownItem href="..."`), disabled items, separators (`DropdownSeparator`), and optional group headings (`DropdownGroup`, `DropdownLabel`).
- **Keyboard Navigation:** Full WAI-ARIA roving tabindex navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `Space`, `Escape`, `Tab`).
- **Dismissal & Outside Interactions:** Native light dismiss on outside clicks (without swallowing external clicks or stealing focus), Escape dismissal (restoring focus to trigger).
- **Disabled Item Behavior:** Focusable for discovery via arrow keys, but completely blocked from activation (keyboard and pointer).
- **Positioning & RTL Parity:** Anchored positioning, collision auto-flip, and true RTL horizontal alignment reversal (`start` aligns right edges in RTL, left edges in LTR).
- **State Coordination:** Controlled (`open`, `onOpenChange`) and uncontrolled (`defaultOpen`) modes with clean yielding for competing popovers.
- **Dialog Integration:** Safe elevation and sequential Escape handling when invoked inside modal `Dialog`.
- **White-Label Design Tokens:** 100% logical CSS properties, zero Dashboard shadows, and verified semantic tokens.

#### Deferred to Future Releases
- Checkbox items (`role="menuitemcheckbox"`).
- Radio items (`role="menuitemradio"`).
- Cascading nested submenus (`DropdownSub`).
- Combobox search / autocomplete filters inside the menu.
- Context menus triggered by right-click.

---

## 2. Foundation & Architecture

### 2.1 Reusing the Popover Foundation with WAI-ARIA Menu Semantics

The Dropdown primitive reuses the battle-tested overlay positioning and top-layer architecture from `Popover`:
1. **Native Popover API (`popover="auto"`):** Renders in the browser's top layer by default, bypassing `overflow: hidden` containers and stacking cleanly above modal `<dialog>` elements without arbitrary z-index escalation.
2. **Light Dismiss Engine:** Native browser light dismiss on outside pointer interactions and Escape key presses.
3. **Menu Keyboard & Semantics Layer:** While `Popover` allows standard Tab flow through generic disclosures or forms, `Dropdown` layers strict WAI-ARIA Menu behaviors:
   - Sets `role="menu"` on the floating surface.
   - Sets `role="menuitem"` on action items and links.
   - Implements roving tabindex (`tabIndex={0}` on the currently active item, `tabIndex={-1}` on all other items).
   - Replaces Tab navigation inside the menu with Arrow keys (`↑`/`↓`), `Home`, and `End`. Pressing `Tab` or `Shift+Tab` exits the menu and closes it immediately.

### 2.2 RTL Horizontal Alignment Parity

In the original Popover lateral placement logic, `inline-start` and `inline-end` respected direction, but horizontal alignment for `bottom-start` and `bottom-end` did not mirror for RTL. 

`Dropdown` explicitly implements bidirectional horizontal alignment reversal:
- **`bottom-start` / `top-start`:**
  - LTR (`dir="ltr"`): Aligns left edge of surface with left edge of trigger (`left = triggerRect.left`).
  - RTL (`dir="rtl"`): Aligns right edge of surface with right edge of trigger (`left = triggerRect.right - surfaceRect.width`).
- **`bottom-end` / `top-end`:**
  - LTR (`dir="ltr"`): Aligns right edge of surface with right edge of trigger (`left = triggerRect.right - surfaceRect.width`).
  - RTL (`dir="rtl"`): Aligns left edge of surface with left edge of trigger (`left = triggerRect.left`).
- **`bottom-center` / `top-center`:** Centered horizontally relative to trigger (`left = triggerRect.left + (triggerRect.width - surfaceRect.width) / 2`).

### 2.3 Fallback Layering Strategy

For environments lacking native HTML Popover API support:
- Controlled via `data-fallback="true"` and `data-state="open" | "closed"`.
- Positions using `position: fixed` with `--z-dropdown: 200`.
- Attaches document-level outside-pointer listener and keydown Escape listener only when native Popover API is unavailable.
- Note: A fallback using CSS z-index inside a native modal `<dialog>` renders relative to that dialog's stacking context. This will be verified in testing rather than assumed to be identical to the native top layer.

### 2.4 Core UI Boundary

The primitive lives in `src/components/ui/dropdown/`:
- Zero imports from `@/providers`, `@/i18n`, `next/*`, or external UI libraries.
- Zero hardcoded English strings. All labels, item text, and accessible names are caller-provided.
- Mirroring to Website and Vite is handled via `pnpm run sync:shared`.

---

## 3. Public API & Component Composition

### 3.1 Component Contracts

```tsx
// 1. Root Coordinator
export interface DropdownProps {
  /** Controlled open state */
  open?: boolean;
  /** Uncontrolled initial open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Preferred placement relative to trigger */
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
  /** Direction override ('ltr' | 'rtl') */
  dir?: 'ltr' | 'rtl';
  children: ReactNode;
}

// 2. Trigger
export interface DropdownTriggerProps extends ComponentPropsWithoutRef<'button'> {
  /** Clones direct child element and merges attributes/handlers */
  asChild?: boolean;
}

// 3. Menu Content Surface
export interface DropdownContentProps extends ComponentPropsWithoutRef<'div'> {
  /** Accessible name if not labelled by trigger */
  'aria-label'?: string;
  /** ID of element providing accessible name */
  'aria-labelledby'?: string;
  /** Minimum width for the menu (defaults to 160px) */
  minWidth?: number | string;
  /** Maximum block size / height before scrolling occurs (defaults to 360px) */
  maxHeight?: number | string;
  /** Loop keyboard arrow navigation around edges (default: true) */
  loop?: boolean;
}

// 4. Menu Item (Discriminated Action vs Link Contract)
export type DropdownItemBaseProps = {
  /** Visual variant */
  variant?: 'default' | 'danger';
  /** Disabled state: item remains focusable for discovery, but cannot be activated */
  disabled?: boolean;
  /** Leading icon slot */
  startIcon?: ReactNode;
  /** Trailing icon or chevron slot */
  endIcon?: ReactNode;
  /** Optional keyboard shortcut string (e.g. "⌘E") */
  shortcut?: string;
  /** Whether selecting the item closes the menu (default: true) */
  closeOnSelect?: boolean;
  /** Selection callback */
  onSelect?: (event: Event | SyntheticEvent) => void;
  children: ReactNode;
  className?: string;
};

export type DropdownItemButtonProps = DropdownItemBaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof DropdownItemBaseProps> & {
    href?: undefined;
  };

export type DropdownItemLinkProps = DropdownItemBaseProps &
  Omit<ComponentPropsWithoutRef<'a'>, keyof DropdownItemBaseProps> & {
    href: string;
  };

export type DropdownItemProps = DropdownItemButtonProps | DropdownItemLinkProps;

// 5. Separator
export interface DropdownSeparatorProps extends ComponentPropsWithoutRef<'div'> {}

// 6. Optional Group & Label
export interface DropdownGroupProps extends ComponentPropsWithoutRef<'div'> {}
export interface DropdownLabelProps extends ComponentPropsWithoutRef<'div'> {}
```

### 3.2 Composition Rules & Safe Link Contracts

1. **Button Actions vs Navigation Links:**
   - When `href` is supplied, `DropdownItem` renders `<a href={href} role="menuitem">`.
   - If `target="_blank"` is supplied on a link, `rel="noopener noreferrer"` is automatically enforced.
   - When `href` is omitted, `DropdownItem` renders `<button type="button" role="menuitem">`, avoiding accidental form submissions.
2. **`asChild` Trigger Composition:**
   - When `asChild` is true on `DropdownTrigger`, the direct child is cloned.
   - Trigger attributes (`aria-haspopup="menu"`, `aria-expanded`, `aria-controls`) and event handlers (`onClick`, `onKeyDown`) are composed cleanly without overwriting caller props or producing nested `<button>` elements.
   - Ref composition (`composeRefs`) preserves forwarded refs and internal trigger refs.

---

## 4. Keyboard Navigation & Focus Engine

### 4.1 Keyboard Interaction Matrix

| Key | Trigger (Closed) | Menu Open |
| :--- | :--- | :--- |
| `ArrowDown` | Opens menu, focuses **first enabled item** | Moves focus to **next enabled item** (wraps if `loop={true}`) |
| `ArrowUp` | Opens menu, focuses **last enabled item** | Moves focus to **previous enabled item** (wraps if `loop={true}`) |
| `Enter` / `Space` | Opens menu, focuses **first enabled item** | Activates focused item, calls `onSelect`/`onClick`, closes menu |
| `Home` | — | Moves focus to **first enabled item** |
| `End` | — | Moves focus to **last enabled item** |
| `Escape` | — | Closes menu, stops propagation, **restores focus to trigger** |
| `Tab` / `Shift+Tab` | Normal document tab navigation | Closes menu immediately; focus moves to next/prev document control |

### 4.2 Disabled Items: Focusable for Discovery, Blocked from Activation

Per WAI-ARIA Menu Guidelines:
- In an ARIA menu, disabled items **remain focusable** so users browsing with a keyboard or screen reader can discover available commands.
- **Implementation:**
  - Disabled items use `aria-disabled="true"` rather than native HTML `disabled`.
  - Native `disabled` on `<button>` causes browsers to remove the element from sequential focus order; using `aria-disabled="true"` with roving `tabIndex={0 | -1}` ensures arrow navigation reaches them.
  - When focused, pressing `Enter` or `Space` prevents action execution and prevents menu dismissal (`e.preventDefault()`).
  - Pointer clicks on disabled items prevent action execution and keep the menu open.
  - Visual styling uses `--color-text-disabled`, `--color-control-disabled-bg`, and `cursor: not-allowed`.

### 4.3 Focus Restoration vs. Outside Click Non-Stealing Policy

To eliminate conflicting focus behaviors:
1. **Escape Dismissal:** Programmatically restores focus to `triggerRef.current` (if the trigger is still connected in the DOM).
2. **Item Selection Dismissal:** By default restores focus to trigger unless the action explicitly shifts focus elsewhere (e.g. opening a Dialog).
3. **Outside Click Light Dismiss:**
   - When a user clicks outside the menu on another interactive element (e.g. an input, checkbox, or external button), the menu dismisses **without swallowing the click** and **without stealing focus back to the trigger**. The external control receives the pointer event and focus directly.
4. **Tab Exit:**
   - Pressing `Tab` or `Shift+Tab` inside the menu requests immediate closure. Focus cleanly moves to the next or previous natural focusable element in the page without getting stranded on an unmounted element.

---

## 5. State Synchronization & Reconciliation

### 5.1 Controlled State Synchronization

The component synchronizes controlled `open` prop with the native DOM state:
- **`open === false`:**
  - Trigger clicks invoke `onOpenChange?.(true)`.
  - If the parent rejects the change (maintains `open={false}`), the DOM surface **never opens** and trigger maintains `aria-expanded="false"`.
- **`open === true`:**
  - Trigger clicks invoke `onOpenChange?.(false)`.
  - If a yielded controlled menu is reopened via trigger click, imperative top-layer restoration is executed and `onOpenChange?.(true)` is called.
  - If the parent rejects dismissal on `Escape`, repeated `Escape` key presses continue sending close requests to `onOpenChange(false)` without getting blocked by one-time flags.

### 5.2 Competing Popover Coordination

Because the native Popover API (`popover="auto"`) automatically dismisses an open popover when another auto popover opens:
- When native `toggle` reports `newState === 'closed'`, the component detects whether another popover took the top layer.
- If another popover is active, `Dropdown` yields cleanly without entering a continuous reopening loop.
- **Recommendation for Parents:** In applications with multiple controlled dropdowns (e.g. a table with an action menu per row), the parent state should track a single active dropdown identifier (`activeDropdownId`) rather than keeping independent boolean `true` flags.

---

## 6. Design Tokens, Themes & Zero-Shadow Policy

### 6.1 Token Consumption

All visual styles consume existing, verified tokens:

| Element | Verified Semantic Token | Dashboard Value | Website Value |
| :--- | :--- | :--- | :--- |
| **Menu Surface Background** | `var(--color-surface-raised)` | `var(--color-neutral-0)` (light) / `var(--color-neutral-6)` (dark) | `var(--color-neutral-0)` (light) / `var(--color-neutral-6)` (dark) |
| **Menu Border** | `var(--color-border-subtle)` | `var(--color-neutral-2)` (light) / `var(--color-neutral-6)` (dark) | `var(--color-neutral-2)` (light) / `var(--color-neutral-6)` (dark) |
| **Menu Radius** | `var(--radius-overlay)` | `var(--radius-lg)` (8px) | `var(--radius-xl)` (12px) |
| **Item Radius** | `var(--radius-control)` | `var(--radius-md)` (6px) | `var(--radius-lg)` (8px) |
| **Item Min Block Size** | `var(--control-height-sm)` | `2rem` (32px) | `2rem` (32px) |
| **Item Focus Ring** | `var(--focus-ring-width)` solid `var(--color-border-focus)` | 2px solid primary ring | 2px solid primary ring |
| **Item Hover Surface** | `var(--color-surface-hover)` | `var(--color-neutral-1)` (light) / `var(--color-neutral-6)` (dark) | `var(--color-neutral-1)` (light) / `var(--color-neutral-6)` (dark) |
| **Destructive Item Text** | `var(--color-danger)` | `#b91c1c` (light) / `#fca5a5` (dark) | `#b91c1c` (light) / `#fca5a5` (dark) |
| **Destructive Item Hover** | `var(--color-danger-subtle)` | `#fef2f2` (light) / `#450a0a` (dark) | `#fef2f2` (light) / `#450a0a` (dark) |
| **Separator** | `var(--color-border-subtle)` | `1px solid var(--color-border-subtle)` | `1px solid var(--color-border-subtle)` |
| **Z-Index Fallback** | `var(--z-dropdown)` | `200` | `200` |

### 6.2 Dashboard Zero-Shadow Rule
- **Dashboard:** Menus must be 100% shadow-free. Visual separation is achieved strictly through surface steps (`--color-surface-raised`), boundary borders (`--color-border-subtle`), and background overlay.
- **Website:** Optional restrained shadow via `--website-shadow-menu`.
- Enforced via `pnpm run check:shadows`.

---

## 7. Integration with Modal Dialog

When a `Dropdown` is opened from within a modal `Dialog`:
1. **Top-Layer Stacking:** Native `popover="auto"` renders in the browser top layer, floating cleanly above the `<dialog>` element without z-index conflicts.
2. **Fallback Stacking Context:** In fallback mode without native Popover support, the menu renders with `--z-dropdown: 200` inside the dialog's local stacking context.
3. **Sequential Dismissal on Escape:**
   - Pressing `Escape` when the dropdown is open dismisses the dropdown first and restores focus to its trigger.
   - The modal `Dialog` remains open.
   - A subsequent `Escape` press closes the `Dialog`.

---

## 8. Gallery Specimens (`/gallery/dropdown`)

The gallery page will demonstrate:
1. **Basic Action Menu:** Common actions (Edit, Duplicate, Archive).
2. **Destructive Action:** Delete action opening a confirmation `Dialog`.
3. **Navigation Links:** Real `<a href="...">` menu items opening in same or new tab.
4. **Disabled Items:** Visual styling and verification of keyboard focusability without activation.
5. **Separators & Groups:** Grouped commands with section dividers.
6. **Controlled vs Uncontrolled:** External state control with acceptance/rejection testing.
7. **RTL & Arabic Layout:** Verification of bidirectional alignment reversal (`bottom-start` right-aligned in Arabic) and text clearance.
8. **Dropdown inside Modal Dialog:** Sequential Escape handling and stacking verification.

---

## 9. Verification Matrix

### 9.1 Vitest Unit Tests (`dropdown.test.tsx`)
- [ ] Opens and closes via trigger click in uncontrolled mode.
- [ ] Opens via `ArrowDown` (focuses first enabled item) and `ArrowUp` (focuses last enabled item).
- [ ] Arrow navigation moves focus through items and wraps with `loop={true}`.
- [ ] `Home` focuses first enabled item; `End` focuses last enabled item.
- [ ] `Enter` / `Space` activates item and calls `onSelect` / `onClick`.
- [ ] Disabled item receives focus via arrow navigation but cannot be activated via keyboard or click.
- [ ] `DropdownItem` with `href` renders valid `<a href>` with `role="menuitem"`.
- [ ] `Escape` closes menu and restores focus to trigger.
- [ ] `Tab` closes menu and allows natural focus traversal.
- [ ] Outside click dismisses menu without swallowing external click.
- [ ] Controlled `open={false}` prevents trigger click from opening DOM surface.
- [ ] RTL placement calculation correctly mirrors `bottom-start` to right-aligned in RTL.
- [ ] Forwarded refs and `asChild` composition work correctly without nested buttons.

### 9.2 Real-Browser Playwright Tests (`e2e/dropdown.spec.ts`)
- [ ] Keyboard opening, roving focus navigation, and Escape restoration in real Chromium.
- [ ] Outside click dismisses menu and executes action on clicked external button.
- [ ] Dropdown inside modal Dialog: dropdown is visible above dialog surface, and Escape closes dropdown first without closing dialog.
- [ ] Disabled item is visible, focusable with arrow keys, but never triggers action on click/Enter.
- [ ] Navigation link item executes real page navigation.
- [ ] RTL direction alignment verified in Arabic locale.
- [ ] Dashboard zero-shadow compliance verified via `check-dashboard-shadows.mjs`.

### 9.3 Handoff Quality Gates
```bash
node scripts/sync-shared.mjs --check
node scripts/check-dashboard-shadows.mjs
cd typescript/nextjs/starterkit/dashboard && pnpm type-check && pnpm lint && pnpm test src/components/ui/dropdown/
cd typescript/nextjs/starterkit/website && pnpm type-check && pnpm lint && pnpm test src/components/ui/dropdown/
cd typescript/nextjs/starterkit/dashboard && npx playwright test e2e/dropdown.spec.ts
```

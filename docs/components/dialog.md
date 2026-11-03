# Dialog — Component Specification and Implementation Plan

> **Status:** Revised baseline for team review & audit  
> **Component:** `components/ui/dialog`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/dialog/`  
> **Gallery route:** `/gallery/dialog`  
> **Specification Version:** 2.0 (Reconciled with Auditor & Teammate Review)

---

## 1. Purpose & Scope

A **Dialog** renders a focused modal surface that interrupts the user's current workflow to convey critical information, request confirmation, or collect targeted input. A modal dialog establishes a distinct interaction context: it temporarily renders above the document in the browser's top layer and makes the underlying page inert until the user closes the dialog or completes an action.

### 1.1 Out of Scope for Initial Release
- Non-modal (modeless) floating dialogs.
- Context menus, general popovers, and tooltips (covered by dedicated overlay primitives).
- Side drawers, slide-over panels, or mobile navigation sheets (covered by `Sheet` / `Drawer`).
- Ephemeral toast notifications (covered by `Toast`).
- Dedicated alert-dialog primitive (an `AlertDialog` has distinct role and accessibility semantics; it will be evaluated separately).

---

## 2. Architecture & Foundation

### 2.1 Native `<dialog>` and `showModal()`
The primitive is built directly on the HTML5 `<dialog>` element, invoked via `HTMLDialogElement.showModal()`.

**Architectural Rationale**:
- **Top Layer Placement**: Native `showModal()` promotes the element into the browser's top layer, automatically rendering above all other z-indexed elements and eliminating stacking context conflicts.
- **Native Inertness**: The browser automatically renders the background document inert (blocking mouse, touch, and assistive technology access to underlying page content).
- **Native Scrim (`::backdrop`)**: Styles the backdrop via the browser's pseudo-element `::backdrop`, avoiding manual detached backdrop containers.
- **Native Keyboard Cancellation**: The browser natively dispatches `cancel` and `close` events when `Escape` is pressed.

```
Application Layer / Connected Pattern
  ├─ Owns open state, form actions, and localized copy
  └─ Dialog Primitive (src/components/ui/dialog/)
       └─ Native <dialog> invoked via showModal()
            ├─ DialogHeader
            │    ├─ DialogTitle (links to aria-labelledby)
            │    └─ DialogDescription (links to aria-describedby)
            ├─ DialogBody
            │    └─ Content, interactive forms, or inner Select controls
            └─ DialogFooter
                 ├─ Cancel Button (type="button")
                 └─ Confirm / Action Button
```

### 2.2 Core Boundary & White-Label Isolation
- **Pure Core UI**: Lives in `src/components/ui/dialog/`. Zero imports from `@/providers`, `@/i18n`, `next/*`, `@tanstack/react-query`, `zustand`, `react-hook-form`, or `zod`.
- **Zero Hardcoded Copy**: All visible copy (titles, descriptions, cancel/close labels) must be caller-supplied.
- **Ref Forwarding**: Forwards a ref directly to the native `HTMLDialogElement`.
- **Zero Dashboard Shadows**: 100% shadow-free depth on Dashboard; Website consumes local opt-in token `--website-shadow-dialog`.
- **Bidirectional Support**: 100% CSS logical properties (`inset-inline-*`, `margin-inline`, `padding-block`).

---

## 3. Standards, Design System Guidance & Kit Decisions

To maintain architectural rigor and audit clarity, requirements are strictly divided into three tiers:

### 3.1 Tier 1: Normative Accessibility Requirements (WCAG 2.2 AA / AAA & Web Standards)
- **Accessible Name (WCAG 4.1.2, 1.3.1)**: Every dialog must have an accessible name. The primitive requires callers to supply `aria-labelledby` referencing `DialogTitle` (or an explicit `aria-label`). A primitive cannot guarantee an accessible name on its own; this is a shared contract with the caller.
- **Keyboard Operability & No Trap (WCAG 2.1.1, 2.1.2 Level A)**: Focus must remain inside the modal interaction context during `Tab` and `Shift+Tab`. Background page content must be inert. (Note: Escape key dismissal is an expected WAI-ARIA APG pattern behavior, distinguished from the normative WCAG 2.1.2 No Keyboard Trap criterion).
- **Visible Keyboard Focus (WCAG 2.4.7, 2.4.11)**: Interactive elements inside the dialog must render high-contrast focus indicators meeting the 3:1 non-text contrast threshold.
- **Color Contrast (WCAG 1.4.3, 1.4.11)**: Measured against concrete rendered tokens:
  - Default Light Theme: Text `#141414` against surface `#FFFFFF` achieves 18.42:1 (exceeding 4.5:1 text threshold); focus border `#525252` achieves 7.81:1 against white (exceeding 3:1 non-text threshold).
  - Default Dark Theme: Text `#FAFAFA` against surface `--color-surface-raised` (`#141414` / `#1f1f1f`) achieves > 17:1; focus border `#a3a3a3` achieves 7.3:1 against `#141414`.
  - High Contrast (Forced Colors): `::backdrop` maps to system `Canvas`; dialog borders map to `ButtonBorder`; text to `CanvasText`.

### 3.2 Tier 2: Established Design System Guidance (e.g., GOV.UK, USWDS, WAI-ARIA APG)
- **Modals vs. Inline Content**: Modals should be used sparingly for critical confirmations, destructive warnings, or short focused workflows. Routine forms belong inline.
- **Initial Focus Placement**: Focus should be directed based on task risk:
  - Simple form: focus the first editable field.
  - Destructive confirmation: focus the least destructive action (e.g., `Cancel`), never default to `Delete`.
  - Informational notice: focus the Close action or a static heading.
- **Short Descriptions**: `aria-describedby` should link to a concise explanation. Long structured text should remain in the document flow for normal reading rather than being concatenated into an unnavigable screen reader description.

### 3.3 Tier 3: White-Label UI Kit Choices & Product Decisions
- **Backdrop Dismissal**: Defaulting to `false` (clicking the backdrop scrim does not close by default). This is a deliberate product choice to protect against accidental input loss in forms. An explicit `closeOnBackdropClick?: boolean` prop is provided for lightweight, non-form dialogs.
- **No Mandatory Built-in "X"**: A top-corner "X" button is an optional design pattern, not a universal requirement. In destructive confirmations or guided actions, explicit `Cancel` and `Confirm` buttons in `DialogFooter` are cleaner and less error-prone. Callers can opt into an "X" close button via an optional `showCloseButton?: boolean` and `closeLabel?: string`.
- **Product-Owned Radii**:
  - Dashboard: `--radius-dialog: var(--radius-xl)` (12px)
  - Website: `--radius-dialog: var(--radius-2xl)` (16px)
- **Five Sizing Steps**: `sm` (400px), `md` (540px), `lg` (720px), `xl` (960px), and `full` (`calc(100vw - 32px)`).

---

## 4. Public API & Component Contract

### 4.1 Controlled Modal API
To ensure a single, unambiguous source of truth, the initial implementation uses a **strictly controlled** API:

```typescript
import {
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type DialogCloseReason =
  | 'escape'
  | 'backdrop'
  | 'close-button'
  | 'cancel-button'
  | 'native-close';

export interface DialogOpenChangeDetails {
  reason: DialogCloseReason;
}

export interface DialogProps extends Omit<ComponentPropsWithRef<'dialog'>, 'open' | 'onClose'> {
  /**
   * Controlled open state.
   */
  open: boolean;

  /**
   * Callback fired when open state changes (via Escape, backdrop, close button, or native close).
   */
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;

  /**
   * Maximum inline size of the dialog panel.
   * @default 'md'
   */
  size?: DialogSize;

  /**
   * Whether clicking the backdrop scrim requests closing the dialog.
   * Defaults to false to prevent accidental form data loss.
   * @default false
   */
  closeOnBackdropClick?: boolean;

  /**
   * Prevents dismissal when the Escape key is pressed.
   * Useful when an asynchronous operation (e.g. saving) is in flight.
   * @default false
   */
  preventEscapeClose?: boolean;

  /**
   * Optional ref to the element that should receive focus when the dialog opens.
   * If omitted, browser native focus or first interactive control receives focus.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Optional ref to the element that should receive focus when the dialog closes.
   * If omitted, focus automatically returns to the element that was active before opening.
   */
  returnFocusRef?: RefObject<HTMLElement | null>;

  /**
   * Whether to display an optional top-corner icon close button.
   * @default false
   */
  showCloseButton?: boolean;

  /**
   * Accessible label for the optional top-corner close button.
   * Mandatory when showCloseButton is true.
   */
  closeLabel?: string;

  /**
   * Dialog children (typically DialogHeader, DialogBody, DialogFooter).
   */
  children?: ReactNode;
}

export interface DialogHeaderProps extends ComponentPropsWithRef<'div'> {}

export interface DialogTitleProps extends ComponentPropsWithRef<'h2'> {
  /**
   * Polymorphic heading level tag.
   * @default 'h2'
   */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export interface DialogDescriptionProps extends ComponentPropsWithRef<'p'> {}

export interface DialogBodyProps extends ComponentPropsWithRef<'div'> {}

export interface DialogFooterProps extends ComponentPropsWithRef<'div'> {}
```

### 4.2 Prop Behavior Matrix

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | **Required** | Single source of truth for modal visibility. |
| `onOpenChange` | `(open: boolean, details: DialogOpenChangeDetails) => void` | **Required** | Reports requested closure or completed native close. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Maximum width of the dialog surface. |
| `closeOnBackdropClick` | `boolean` | `false` | Product choice: backdrop dismissal is off by default. |
| `preventEscapeClose` | `boolean` | `false` | Prevents closing on Escape (e.g. during pending save). |
| `initialFocusRef` | `RefObject<HTMLElement>` | `undefined` | Target for explicit initial focus. |
| `returnFocusRef` | `RefObject<HTMLElement>` | `undefined` | Target for explicit focus restoration. |
| `showCloseButton` | `boolean` | `false` | Renders optional top-corner close button. |
| `closeLabel` | `string` | `undefined` | Accessible label for the optional close button. |
| `aria-labelledby` | `string` | `undefined` | Associates heading ID (`DialogTitle`). |
| `aria-describedby`| `string` | `undefined` | Associates description ID (`DialogDescription`). |
| `ref` | `Ref<HTMLDialogElement>` | `undefined` | Forwards to native `HTMLDialogElement`. |

---

## 5. State Synchronization & Native Lifecycle

### 5.1 Opening and Closing Lifecycle
Managing a controlled native `<dialog>` in React requires careful synchronization:

```
        Caller supplies open = true
                    │
                    ▼
       ┌─────────────────────────┐
       │   Is dialog connected?   │
       └────────────┬────────────┘
                    │ Yes
                    ▼
       ┌─────────────────────────┐
       │   Is dialog.open true?   │─── No ───►  dialog.showModal()
       └────────────┬────────────┘                     │
                    │ Yes                              ▼
                    │                     Store previously active element
                    │                     Apply initial focus if supplied
                    ▼
            Render children
```

1. **Opening (`open: true`)**:
   - In a layout effect or commit effect on the client:
   - Check `dialogRef.current?.open`. If false, call `dialogRef.current.showModal()`.
   - Store `document.activeElement` as `previousActiveElementRef` (unless `returnFocusRef` was provided).
   - If `initialFocusRef?.current` exists, call `initialFocusRef.current.focus()`.
2. **Closing (`open: false`)**:
   - Check `dialogRef.current?.open`. If true, call `dialogRef.current.close()`.
   - Restore focus to `returnFocusRef?.current ?? previousActiveElementRef.current`.
   - Verify that the target element is still attached to the DOM (`document.body.contains(target) && !target.disabled`) before calling `.focus()`. If disconnected, skip focus restoration to avoid errors.

### 5.2 React Strict Mode & Re-render Safety
- Calling `showModal()` on an already open dialog throws an `InvalidStateError`. The implementation must guard every call:
  ```typescript
  if (open) {
    if (!dialog.open) {
      dialog.showModal();
    }
  } else {
    if (dialog.open) {
      dialog.close();
    }
  }
  ```
- In React 18/19 Strict Mode (mount → unmount → remount in development), effects must close or reset cleanly without throwing or leaving orphaned backdrops.

### 5.3 Native Event Reconciliation
1. **`cancel` Event**:
   - Fired by the browser when `Escape` is pressed.
   - If `preventEscapeClose` is true: call `e.preventDefault()` to stop the browser from closing the dialog.
   - If false: call `e.preventDefault()` to prevent uncontrolled closure, then notify `onOpenChange(false, { reason: 'escape' })`. This keeps React state as the sole driver.
2. **`close` Event**:
   - Fired when the native element is closed (e.g. by `<form method="dialog">` or external `.close()`).
   - If `open` is still `true`, invoke `onOpenChange(false, { reason: 'native-close' })` to reconcile React state immediately.
3. **Backdrop Click Detection**:
   - When `closeOnBackdropClick` is true:
   - The native `::backdrop` is pseudo-DOM and clicks on it register on the `<dialog>` element itself.
   - The handler checks if `event.target === dialogElement`:
     ```typescript
     const rect = dialog.getBoundingClientRect();
     const isInDialog = (
       rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
       rect.left <= event.clientX && event.clientX <= rect.left + rect.width
     );
     if (!isInDialog) {
       onOpenChange(false, { reason: 'backdrop' });
     }
     ```
   - Clicks inside `DialogHeader`, `DialogBody`, or `DialogFooter` have coordinates inside `rect` and do not trigger dismissal.

### 5.4 Form Handling (`<form method="dialog">` vs Regular Forms)
- **Regular Form (`onSubmit`)**: Application form with validation. Submission is handled normally via React handlers or Server Actions.
- **Native Dialog Form (`<form method="dialog">`)**: Native mechanism where button submission sets `dialog.returnValue` and fires the `close` event. Reconciled via `onOpenChange(false, { reason: 'native-close' })`.
- **Cancel Button Inside Form**: Cancel buttons must explicitly use `type="button"` to prevent accidental form submission or premature validation.

---

## 6. Layout, Sizing & Theme Tokens

### 6.1 Sizing Scale

| Size | Maximum Inline Size | Typical Content |
| :--- | :--- | :--- |
| `sm` | `400px` (`25rem`) | Destructive confirmation, short prompt, single-input question. |
| `md` | `540px` (`33.75rem`) | **Default**. Standard form, settings section, entity creation. |
| `lg` | `720px` (`45rem`) | Multi-column inputs, detail review, table preview. |
| `xl` | `960px` (`60rem`) | Data inspect, split layout, code viewer. |
| `full` | `calc(100vw - var(--space-8))` | Full document flow, complex canvas. |

### 6.2 Responsive Reflow & Max Height
- **Viewport Constraints**:
  - `inline-size: min(100% - var(--space-8), var(--_dialog-max-width));`
  - `max-block-size: min(100vh - var(--space-8), 90vh);`
- **Narrow Viewports (320px)**: The dialog fits with usable padding and margins without horizontal clipping.
- **Scroll Containment**: `DialogBody` has `overflow-y: auto; overscroll-behavior: contain;`, ensuring long content scrolls within the dialog without scrolling the background.

### 6.3 Tokens & Zero Dashboard Shadows
- **Dashboard Surface**:
  - `background-color: var(--color-surface-raised);`
  - `border: 1px solid var(--color-border-subtle);`
  - `border-radius: var(--radius-dialog);` (resolves to `--radius-xl` = 12px)
  - `box-shadow: none !important;` (Dashboard shadow prohibition policy)
- **Website Surface**:
  - `border-radius: var(--radius-dialog);` (resolves to `--radius-2xl` = 16px)
  - `box-shadow: var(--website-shadow-dialog);` (local opt-in shadow)
- **Native Backdrop**:
  - `::backdrop { background-color: var(--color-overlay); }`
  - Light theme: `rgb(0 0 0 / 48%)`
  - Dark theme: `rgb(0 0 0 / 64%)`

---

## 7. Canonical CSS Reference (`dialog.module.css`)

```css
/**
 * White Label UI Kit — Native Dialog Stylesheet
 * Native <dialog> in top layer, 100% CSS logical properties.
 */

.dialog {
  /* Scoped max-width defaults */
  --_dialog-max-width: 540px;

  position: fixed;
  inset: 0;
  margin: auto;
  padding: 0;
  box-sizing: border-box;
  inline-size: min(calc(100% - var(--space-8)), var(--_dialog-max-width));
  max-block-size: min(calc(100vh - var(--space-8)), 90vh);
  border-radius: var(--radius-dialog);
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border-subtle);
  color: var(--color-text-primary);
  font-family: inherit;
  overflow: hidden;
  outline: none;
}

/* Ensure closed dialog remains hidden and does not override browser default */
.dialog:not([open]) {
  display: none !important;
}

/* Open layout box */
.dialog[open] {
  display: flex;
  flex-direction: column;
}

/* Sizing steps */
.dialog[data-size="sm"] { --_dialog-max-width: 400px; }
.dialog[data-size="md"] { --_dialog-max-width: 540px; }
.dialog[data-size="lg"] { --_dialog-max-width: 720px; }
.dialog[data-size="xl"] { --_dialog-max-width: 960px; }
.dialog[data-size="full"] { --_dialog-max-width: calc(100vw - var(--space-8)); }

/* Native Backdrop */
.dialog::backdrop {
  background-color: var(--color-overlay);
}

/* Header */
.header {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  padding-inline: var(--space-6);
  padding-block: var(--space-5);
  border-block-end: 1px solid var(--color-border-subtle);
}

.title {
  margin: 0;
  font-family: inherit;
  font-size: var(--font-size-xl);
  line-height: var(--line-height-tight);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.description {
  margin: 0;
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  color: var(--color-text-secondary);
}

/* Body */
.body {
  flex: 1 1 auto;
  padding-inline: var(--space-6);
  padding-block: var(--space-5);
  overflow-y: auto;
  overscroll-behavior: contain;
}

/* Footer */
.footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding-inline: var(--space-6);
  padding-block: var(--space-4);
  border-block-start: 1px solid var(--color-border-subtle);
  background-color: var(--color-surface);
}

/* Optional Top-Corner Close Button */
.closeButton {
  position: absolute;
  inset-block-start: var(--space-4);
  inset-inline-end: var(--space-4);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: var(--control-height-sm);
  block-size: var(--control-height-sm);
  padding: 0;
  border: none;
  border-radius: var(--radius-control);
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  outline: none;
}

.closeButton:hover {
  background-color: var(--color-primary-subtle);
  color: var(--color-text-primary);
}

.closeButton:focus-visible {
  outline: var(--focus-ring-width) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset);
}

/* Forced Colors Mode */
@media (forced-colors: active) {
  .dialog {
    border: 2px solid ButtonBorder;
    background-color: Canvas;
    color: CanvasText;
  }

  .dialog::backdrop {
    background-color: Canvas;
    opacity: 0.85;
  }

  .closeButton {
    border: 1px solid ButtonBorder;
  }
}
```

---

## 8. Integration: Nested Overlays & Inner `Select`

A critical integration scenario is rendering our white-label native `Select` inside the `Dialog`:
1. **Top Layer Compatibility**:
   - Because `Select` uses a native `<select>` with standard OS popup menu picker, opening the select inside the `<dialog>` works cleanly: the OS picker displays in front of the dialog.
2. **Indicator Alignment**:
   - `Select`'s custom chevron indicator (`pointer-events: none`) remains aligned inside the dialog content box.
3. **Escape Key Handling**:
   - When the user opens a `<select>` picker inside `<dialog>`: pressing `Escape` dismisses the `<select>` picker first in the browser window manager.
   - A subsequent `Escape` press on the focused select fires `cancel` on the `<dialog>`, dismissing the modal.
   - Planned test in Playwright integration suite.

---

## 9. Gallery Demonstration Plan (`/gallery/dialog`)

The gallery at `/gallery/dialog` demonstrates realistic usage patterns with complete EN, FR, and AR localization:

1. **Specimen 1: Confirmation Dialog**:
   - Destructive project delete confirmation. Initial focus is placed on the non-destructive **Cancel** button via `initialFocusRef`.
2. **Specimen 2: Standard Form Dialog**:
   - Entity creation form with required fields, validation, and Cancel action that resets errors.
3. **Specimen 3: Nested Overlay (Select in Dialog)**:
   - Form containing our native `Select` primitive, verifying stacking context and Escape dismissal order.
4. **Specimen 4: Long Content & Scroll Containment**:
   - Legal agreement terms with scrolling `DialogBody`, verifying header and footer remain accessible and page does not scroll behind.
5. **Specimen 5: Sizing Matrix (`sm`, `md`, `lg`, `xl`, `full`)**:
   - Trigger buttons demonstrating each of the five width tiers.
6. **Specimen 6: Asymmetric Focus Restoration**:
   - Dialog opened from a table row action. Demonstrates returning focus to the trigger or to a safe fallback heading when the row is deleted.
7. **Specimen 7: Non-Dismissible Pending Save**:
   - Simulates an active save with `preventEscapeClose={true}` and disabled cancel actions while pending.

---

## 10. Comprehensive Verification Matrix

### 10.1 Vitest Unit Tests (`dialog.test.tsx`)
1. **Lifecycle & Native Method Invocations**:
   - Renders `<dialog>` element.
   - Calls `showModal()` when `open` becomes `true`.
   - Calls `close()` when `open` becomes `false`.
   - Guards against double-calling `showModal()` when already open.
   - Cleans up safely on unmount.
2. **Event & Reason Reporting**:
   - `cancel` event triggers `onOpenChange(false, { reason: 'escape' })`.
   - `preventEscapeClose={true}` cancels the `cancel` event via `e.preventDefault()`.
   - Optional close button click triggers `onOpenChange(false, { reason: 'close-button' })`.
   - Native `close` event triggers `onOpenChange(false, { reason: 'native-close' })`.
3. **Focus Restoration**:
   - Stores active element on open and restores focus on close when still mounted.
   - Handles disconnected elements without error.
4. **Accessible Label Association**:
   - Verifies `aria-labelledby` and `aria-describedby` reach the native `<dialog>`.

### 10.2 Playwright Browser Tests (`e2e/dialog.spec.ts`)
1. **Top-Layer Visibility & Modal State**:
   - Opens dialog in real Chromium/WebKit/Firefox; verifies `:modal` pseudo-class and visibility.
2. **Background Inertness**:
   - Background page buttons and links cannot be focused via `Tab` or clicked with the mouse while dialog is open.
3. **Focus Trap & Initial Focus**:
   - Tab and Shift+Tab loop exclusively within the dialog.
   - `initialFocusRef` focuses the designated control immediately upon opening.
4. **Focus Restoration**:
   - Closing dialog via Escape or Cancel button restores focus to the invoking trigger.
5. **Forms & Submission**:
   - Form submission inside dialog works cleanly.
   - `<button type="button">Cancel</button>` does not trigger HTML5 validation errors.
6. **Nested `Select` Integration**:
   - `Select` inside `Dialog` opens, displays options, changes value, and pressing Escape closes picker first.
7. **Zero Dashboard Shadows**:
   - Verifies `getComputedStyle(dialog).boxShadow === 'none'` on Dashboard.
8. **RTL Direction & Arabic Script**:
   - In `dir="rtl"`, title alignment, close button positioning, and footer action order reflect correct logical layout.
9. **Forced Colors Mode**:
   - Verifies system `ButtonBorder`, `Canvas`, and `CanvasText` resolution under high contrast.
10. **Narrow Viewport (320px) & Zoom**:
    - Dialog reflows without horizontal overflow or clipped actions.

---

## 11. Pre-Implementation Review Checklist

- [ ] Native `<dialog>` + `showModal()` foundation agreed upon.
- [ ] Controlled API (`open: boolean`, `onOpenChange`) with explicit reasons defined.
- [ ] Native event reconciliation (`cancel`, `close`, `method="dialog"`) specified.
- [ ] Accessible name contract (`aria-labelledby` / `DialogTitle`) clearly assigned to caller.
- [ ] Focus restoration contract (including removed trigger fallback) defined.
- [ ] Product choices (backdrop dismissal off by default, optional close button) clearly separated from WCAG standards.
- [ ] Verified actual rendered tokens (`#141414`, `#FAFAFA`, `#ffffff`, zero Dashboard shadows).
- [ ] Nested `Select` integration scenario documented.
- [ ] Real-browser test suite planned across focus, inertness, forms, RTL, forced colors, and narrow viewports.

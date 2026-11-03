# Dialog — Component Specification and Implementation Plan

> **Status:** Proposed baseline for team review
**Component:** `components/ui/dialog`
**Starters:** Next.js Dashboard, Next.js Website, Vite reference
**Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/dialog/`
**Gallery:** `/gallery/dialog`
> 

This is a **plan**, not a claim that the component has been implemented or certified. The design choices below can be adjusted after the teammate checks the existing code and tokens.

---

## 1. Purpose

A **Dialog** presents a focused task or message above the current page. A modal dialog temporarily prevents interaction with the page behind it until the user closes the dialog or completes an action.

Typical uses:

- Confirming a destructive action.
- Editing a small set of settings.
- Warning about unsaved changes.
- Displaying important information that needs acknowledgment.

Dialogs interrupt the user’s workflow. Use them when that interruption helps the task; a normal page or inline form is often better for lengthy content or complex workflows. This is design guidance, not a universal rule. [[1]](https://designsystem.digital.gov/components/modal/)

### Out of scope for the first version

- Non-modal dialogs.
- Popovers, menus and tooltips.
- Side drawers or full-screen mobile navigation.
- Toast notifications.
- A dedicated alert-dialog primitive.
- A complete form or data-fetching framework.

A destructive confirmation can be composed with Dialog, but an **alert dialog** has distinct semantics and should not be treated as automatically equivalent. We can add a dedicated primitive later if needed.

---

## 2. Architecture

### 2.1 Recommended foundation: native `<dialog>`

Use the HTML `<dialog>` element and open it with `showModal()`.

This gives us a native modal in the browser’s **top layer**, a native backdrop, and browser-supported modal behavior. It avoids building the entire modal mechanism from a generic `<div>`. The actual implementation must still be tested across supported browsers and assistive technologies. [[2]](https://www.w3.org/WAI/WCAG22/Techniques/html/H102) [[3]](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

```
Application / connected pattern
  ├─ Owns open state, content, form actions and translated copy
  └─ Dialog primitive
       └─ Native <dialog> opened with showModal()
            ├─ Title
            ├─ Description or content
            └─ Actions and/or close control
```

### 2.2 Core boundary

The primitive should:

- Remain independent of application state, routing, API calls and persistence.
- Contain no hardcoded user-facing English.
- Accept caller-provided content and translated labels.
- Forward a ref to the native `HTMLDialogElement`.
- Apply local product tokens and respect the dashboard shadow policy.
- Work in both LTR and RTL contexts.

### 2.3 Browser behavior is not the whole accessibility contract

Native `<dialog>` is a strong foundation, but it does **not** automatically supply a meaningful title, good focus placement, clear actions or correct application behavior. Those are shared responsibilities of the primitive and its caller.

---

## 3. Proposed Public API

Start with a **controlled modal** API. Keeping one source of application state makes the first implementation easier to reason about than supporting several overlapping control modes.

```tsx
interface DialogProps {
  open: boolean;

  onOpenChange: (
    open: boolean,
    details: {
      reason: 'escape' | 'close-button' | 'action' | 'native-close';
    },
  ) => void;

  children: React.ReactNode;

  className?: string;
  style?: React.CSSProperties;

  'aria-labelledby'?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}
```

The final types should be reconciled with the repository’s existing conventions and native dialog props. This is the intended behavior, **not a complete implementation**.

### 3.1 Prop behavior

| Prop | Responsibility |
| --- | --- |
| `open` | Caller’s desired modal state. |
| `onOpenChange` | Reports a requested change or a native close that already occurred. |
| `children` | Dialog contents, including an accessible title and a way to close it. |
| `className`, `style` | Applied to the native dialog panel. |
| `aria-labelledby` | Normally references the visible dialog heading. |
| `aria-label` | Alternative accessible name when there is no suitable visible heading. |
| `aria-describedby` | Optional reference to a short description. |
| `ref` | Forwards to the native `<dialog>` element. |

**Contract decision:** `open` is controlled by the caller. The component must not also expose an uncontrolled `defaultOpen` in the initial version unless the team explicitly agrees on how both modes behave.

### 3.2 Composition

Prefer small, composable building blocks rather than requiring every dialog to use the same layout:

```tsx
<Dialog
  open={open}
  onOpenChange={handleOpenChange}
  aria-labelledby={titleId}
  aria-describedby={descriptionId}
>
  <DialogHeader>
    <DialogTitle id={titleId}>Delete project?</DialogTitle>
    <DialogDescription id={descriptionId}>
      This action cannot be undone.
    </DialogDescription>
  </DialogHeader>

  <DialogFooter>
    <Button onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete project
    </Button>
  </DialogFooter>
</Dialog>
```

The exact exports—`DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`—are proposed conveniences. They should remain thin presentation components, not create hidden state or force a particular layout.

The application supplies the text. In a localized pattern, it comes from the translation dictionaries.

### 3.3 No mandatory built-in “X”

A dialog needs a clear way to close or cancel, but that does not always have to be an icon in the corner. A visible Cancel or Close button may be more appropriate.

If the kit provides an optional icon-only close button:

- Its accessible name must be supplied or localized by the caller.
- It must use `type="button"` so it does not accidentally submit a form.
- Its hit area and focus styling must use the kit’s control policies.

---

## 4. State and Native Lifecycle

This is the part that deserves the most implementation care.

### 4.1 Opening

When `open` becomes `true`:

1. The native element must be connected to the DOM.
2. Call `showModal()` if it is not already open.
3. Move focus to an appropriate element inside the dialog.
4. Do not render `<dialog open>` as a substitute for `showModal()`; the `open` attribute alone does not establish the same modal behavior.

When `open` becomes `false`, close the native dialog and clean up any component-managed resources.

### 4.2 React synchronization

The implementation must account for:

- Re-renders without repeated or invalid `showModal()` calls.
- React Strict Mode effect setup and cleanup.
- Rapid open → close → open changes.
- Unmounting while open.
- Server rendering and hydration: browser-only methods run on the client.
- Native `cancel` and `close` events, without duplicate callbacks or stale events closing a newly reopened dialog.
- An external native close, including `form method="dialog"` or use of the forwarded ref.

**Important:** A `close` event means the browser has already closed the element. The component must define and test how controlled state is reconciled if the caller still supplies `open={true}`. It must not silently leave React state and native state disagreeing.

The teammate should document the chosen behavior and test it rather than guessing from a simple happy-path demo.

### 4.3 Close requests versus completed closure

These are different:

- **Close request:** for example, the user presses Escape. The component can request `onOpenChange(false, …)` and the application updates state.
- **Native close already occurred:** for example, a dialog form closes itself. Notify the application and reconcile the controlled state.

If dismissal needs to be temporarily prevented—for example, while a critical save is in progress—that behavior must be explicit, limited to the relevant case, and must not leave the user trapped indefinitely.

### 4.4 Forms

A dialog can contain a normal form. The application owns validation and submission.

`<form method="dialog">` has special native behavior: it closes the dialog rather than performing a normal network submission. If the implementation supports it, test how its native close interacts with controlled state. [[3]](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

Cancel/close controls inside forms should not accidentally submit. A cancel action should remain available even if another form field is invalid.

---

## 5. Accessibility and Keyboard Behavior

### 5.1 Accessible name

Every dialog instance needs an accessible name.

Preferred:

```tsx
<Dialog aria-labelledby={titleId}>
  <DialogTitle id={titleId}>Edit account</DialogTitle>
  {/* ... */}
</Dialog>
```

Use `aria-label` where a visible title is genuinely inappropriate. The primitive cannot guarantee a good name by itself; the caller is responsible for providing one.

A short description may be linked with `aria-describedby`. Avoid attaching a large, structured body of lists, tables or multiple paragraphs as one long description; users should be able to navigate that content normally. [[4]](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### 5.2 Initial focus

Choose focus based on the task:

- **Simple form:** focus the relevant field.
- **Destructive confirmation:** consider the least destructive action, such as Cancel.
- **Long or structured content:** focus a suitable static heading or introductory element so the beginning is available to the user.
- **Simple informational dialog:** focus a sensible Close or Continue action.

Do not automatically focus a destructive action merely because it appears first. A static heading can be made programmatically focusable; do not put `tabindex` on the native `<dialog>` itself. [[4]](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) [[3]](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

### 5.3 Keyboard

The intended modal interaction follows the WAI-ARIA Authoring Practices pattern:

| Key | Expected behavior |
| --- | --- |
| `Tab` | Moves through the dialog’s focusable controls. |
| `Shift + Tab` | Moves backward through them. |
| `Escape` | Requests closing the topmost modal. |
| `Enter` / `Space` | Activate the focused control according to its native semantics. |

Background content must not be operable while the modal is open. Test that focus remains in the modal’s interaction context, including at the first and last controls, instead of assuming that a particular browser’s native behavior covers every case. [[4]](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### 5.4 Focus restoration

When closed, return focus to the element that opened the dialog when it still exists and remains a sensible target.

If it no longer exists—for example, a Delete action removed its row—the application should choose a logical fallback, such as the next row or a section heading. The component must not blindly force focus to a removed or disabled element. [[4]](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

### 5.5 Visible focus and contrast

Use the kit’s focus tokens, but verify their rendered result against the **actual adjacent colors** in supported themes.

Distinguish:

- **WCAG requirements:** applicable keyboard, focus, contrast and other success criteria.
- **Pattern guidance:** recommendations such as APG focus placement.
- **Kit choices:** exact focus color, ring width, spacing and visual style.

A token name or a passing screenshot does not establish compliance for every customer theme.

---

## 6. Dismissal Policy

Recommended initial behavior:

| Action | Default |
| --- | --- |
| Escape | Requests close. |
| Explicit Cancel or Close | Requests close. |
| Successful application action | Application decides when to close. |
| Clicking the backdrop | **Does not close by default.** |
| Clicking inside the panel | Does not dismiss the dialog. |

Backdrop dismissal is a **product choice**, not a WCAG requirement. Defaulting it off reduces accidental loss of form input. If the team later adds an option, it needs to distinguish an actual outside click from drags and clicks originating inside the panel.

Do not depend on newer native `closedby` behavior without checking the supported browser matrix and providing the agreed fallback. Native `showModal()` dialogs ordinarily support Escape dismissal; browser support for other dismissal options varies. [[3]](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

---

## 7. Visual Design and Tokens

### 7.1 Panel

The dialog panel should have:

- A surface background and readable foreground.
- A visible boundary appropriate to the current theme.
- A width that fits its content while remaining within the viewport.
- Sufficient interior spacing for title, body and actions.
- A layout that accommodates long translated text.
- A visible focus treatment for interactive controls.

**Dashboard:** no box shadows or drop shadows, consistent with the existing policy. Use surface, border and backdrop contrast.

**Website:** follow the local product theme; do not introduce a new shadow requirement without a design decision.

### 7.2 Width

Dialog sizing is not the same as the six-step input-control height scale. Do **not** reuse `xs`–`2xl` merely because controls have those sizes.

For the first version, the team should inspect existing layout tokens and decide whether a default maximum width plus caller-supplied width is enough. Add named dialog sizes only if there are clear, recurring use cases.

Regardless of the chosen width:

- Panel must fit within narrow viewports with usable side margins.
- Long unbroken text should not force the page horizontally.
- Actions should wrap or stack when needed.
- Test at 320px and with browser zoom.

### 7.3 Height and scrolling

For content taller than the viewport:

- Keep the dialog within the visible viewport.
- Ensure all content and actions are reachable by scrolling.
- Avoid clipping close controls, validation errors or focused fields.
- Verify behavior with mobile browser chrome and an on-screen keyboard.

Whether the header and footer remain fixed is a design choice; it is not a requirement for every dialog.

### 7.4 Backdrop

Use the native `::backdrop`, styled with existing or explicitly approved semantic tokens.

The backdrop should visually distinguish the modal from the underlying page without making dialog content hard to read. Forced-colors mode needs separate testing; transparency and colors may be adjusted by the browser or operating system.

### 7.5 Motion

A dialog does **not** need an animation to be usable or standards-compliant.

If motion is added:

- Keep it short and restrained using existing motion tokens.
- Respect `prefers-reduced-motion`.
- Opening and closing must still work when animations are unavailable or disabled.
- Do not delay focus, dismissal or cleanup in a way that leaves the page inaccessible.
- Treat native dialog entry/exit animation as progressive enhancement; support for discrete `display` and top-layer transitions must be verified in the target browsers. [[3]](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)

---

## 8. RTL and Localization

The primitive itself contains no translated copy.

The gallery and connected patterns must:

- Provide complete EN, FR and AR text using the existing translation system.
- Preserve dialog state when locale changes unless application behavior intentionally closes it.
- Use logical properties for padding, margins and positioning.
- Verify Arabic text, long labels, action wrapping and mixed-direction content.
- Verify nested direction overrides where applicable.
- Avoid assuming that every icon must be mirrored: directional icons depend on meaning; a close “X” is not directional.

---

## 9. Layering, Overlays and Scope

`showModal()` places the dialog in the browser’s top layer. This usually avoids ordinary `z-index` problems, but related controls still need real integration testing.

Test:

- A native Select inside the dialog.
- Tooltips, menus or popovers opened from inside the dialog if those components exist.
- Whether overlays are visually visible and keyboard-operable above the dialog.
- Focus returning correctly after a child overlay closes.

**Nested modal dialogs:** not required for the first release unless there is a real product use case. If they are supported later, only the topmost modal should respond to Escape, and closing it should restore focus to the parent dialog. Do not claim nested-dialog support without testing it.

**Page scrolling:** native modality and background scroll locking are not identical in every environment. Decide whether the kit needs explicit scroll locking and verify mobile behavior before adding a global lock. Any lock must be cleaned up on close and unmount.

---

## 10. Gallery Requirements

The gallery should demonstrate actual usage—not review history or subjective visual feedback presented as a standard.

### Recommended specimens

1. **Basic dialog:** title, description and Close action.
2. **Confirmation:** Cancel and destructive action, with sensible initial focus.
3. **Form dialog:** labels, validation, submit, Cancel and focus on the relevant field.
4. **Long content:** scrolling and keyboard access to all content.
5. **Controlled lifecycle:** open, close, reopen and state feedback.
6. **Focus restoration:** return to trigger and a case where the trigger disappears.
7. **Pending action:** duplicate-submission guard, clear status and safe cancellation behavior.
8. **RTL and localization:** EN/FR/AR, long copy and action wrapping.
9. **Theme and viewport:** actual light/dark product tokens, small screens and zoom.
10. **Integration:** existing Select and other relevant controls inside the modal.
11. **Usage examples:** concise code snippets showing the public contract.

The gallery may include product-specific examples, but the primitive must remain free of product copy and application dependencies.

---

## 11. Verification Plan

### 11.1 Unit and component tests

- Ref resolves to `HTMLDialogElement`.
- `open` state calls the intended native lifecycle without duplicate calls.
- `onOpenChange` reports supported reasons correctly.
- Escape close requests can be handled by the application.
- Native `close` events reconcile with controlled state.
- Rapid state changes and React Strict Mode do not leave stale state.
- Unmount cleanup is safe.
- Caller-provided label and description attributes reach the native dialog.
- Close controls inside a form do not accidentally submit.
- Application content and events are forwarded correctly.

Unit tests are useful here, but a DOM simulator is not a substitute for real modal, focus and top-layer behavior.

### 11.2 Real-browser tests

In Dashboard and Website:

- Opened dialog is modal, visible and correctly named.
- Focus moves to the intended initial target.
- Tab and Shift+Tab do not reach page content behind the modal.
- Background pointer interaction is blocked.
- Escape closes or requests closure as documented.
- Focus returns to the trigger, with a tested fallback where it is removed.
- Clicking the backdrop follows the documented policy.
- Controlled state and native state remain synchronized after native closure.
- Required forms, successful submit and Cancel behave correctly.
- Long content, narrow widths, scrolling and zoom remain usable.
- RTL and nested direction behave correctly.
- Reduced motion and forced colors remain usable.
- Select and other interactive overlays work inside the modal.
- Dashboard shadow policy passes.
- Shared-source sync check passes.

### 11.3 Browser and assistive-technology coverage

A green Chromium suite is valuable, but it is not proof of behavior everywhere. Establish the actual supported matrix and test appropriate combinations, including:

- Chromium, Firefox and WebKit where available.
- Real mobile browsers and on-screen keyboards where practical.
- Screen-reader checks for dialog name, initial focus, content and close behavior.

Record what was actually tested and what remains unverified.

---

## 12. Delivery Checklist

- [ ]  Team agrees on the controlled API and native-close synchronization contract.
- [ ]  Dashboard implementation authored in the canonical source.
- [ ]  Shared implementation synchronized to Website and Vite.
- [ ]  Gallery and EN/FR/AR copy complete.
- [ ]  Unit tests pass across the three starters.
- [ ]  Browser tests pass in Dashboard and Website.
- [ ]  Theme, forced-colors, RTL and reduced-motion checks performed.
- [ ]  Keyboard and focus restoration verified.
- [ ]  Dashboard shadow and shared-sync checks pass.
- [ ]  Typecheck, lint and production builds pass in the agreed scope.
- [ ]  Handoff states the exact tests run and any remaining browser or screen-reader gaps.

**Recommendation:** Give this plan to the teammate for review before implementation, with particular attention to the controlled/native lifecycle and focus behavior. Those are more important than deciding the exact panel width or animation first.
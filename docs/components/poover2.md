# Popover — Component Specification and Implementation Plan

> **Status:** Proposed baseline for team review
**Component:** `components/ui/popover`
**Starters:** Next.js Dashboard, Next.js Website, Vite reference
**Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/popover/`
**Gallery:** `/gallery/popover`
> 

This is a **planning reference**, not a claim that the component is implemented or approved. Visual values and the exact positioning mechanism should be checked against the existing kit before implementation.

---

## 1. What is a Popover?

A **Popover** is a small, non-modal surface displayed near a control after the user activates it. It provides contextual content without requiring a full dialog or navigation to another page.

Examples:

- A small set of display preferences.
- A date-range filter with Apply and Cancel.
- Account information and related controls.
- A short explanation with an optional action.

The user can generally continue interacting with the surrounding page. Unlike a modal Dialog, the rest of the page does **not** become inert.

### When not to use it

| Need | Better starting point |
| --- | --- |
| A modal confirmation or focused form | **Dialog** |
| A list of commands with menu keyboard behavior | **Menu** |
| Brief, non-interactive explanatory text on hover/focus | **Tooltip** |
| Selecting an option in a form | **Select** or an appropriate selection control |
| A large or complex workflow | A page or Dialog, depending on context |

These distinctions guide the design; they do not mean every small floating surface automatically needs a different component.

---

## 2. Scope for the First Version

### Included

- Click or keyboard activation from a trigger.
- A non-modal panel positioned relative to that trigger.
- Controlled open and close behavior.
- Outside-click and Escape dismissal.
- Viewport-aware positioning.
- Interactive content inside the panel.
- LTR and RTL support.
- White-label themes, forced-colors testing and reduced-motion support.
- Integration inside a Dialog.

### Deferred

- Hover-triggered popovers and tooltips.
- Full menu, combobox or listbox keyboard behavior.
- Nested popover stacks as a general-purpose overlay framework.
- A complex animation system.
- Virtualized content.
- Mobile bottom-sheet behavior.

The team can expand scope later when an actual use case requires it.

---

## 3. Architecture

### 3.1 Recommended starting point: native Popover API

Investigate using the browser’s **Popover API** with `popover="auto"` for the initial implementation.

An auto popover is non-modal, enters the browser’s top layer when open and supports native light dismiss. Opening another auto popover can close an existing one, subject to the browser’s nesting rules. These are meaningful behavior choices that must be documented and tested—not hidden implementation details. [[1]](https://developer.mozilla.org/en-US/docs/Web/API/Popover_API/Using)

```
Connected pattern / application
  ├─ Owns content, translated copy and application state
  └─ Popover primitive
       ├─ Trigger
       └─ Non-modal content, positioned relative to the trigger
```

### 3.2 Browser support decision

Before implementation, the teammate should check the project’s supported browser matrix against:

- Native Popover API support.
- React and TypeScript support for the required attributes.
- The chosen positioning mechanism.

If the project supports browsers that cannot provide the agreed behavior, document and implement a tested fallback—or explicitly obtain agreement to change the support baseline. **Do not silently degrade to a panel in the wrong place or an unusable trigger.**

### 3.3 Native does not mean “automatic accessibility”

The Popover API handles visibility and top-layer behavior; it does not decide whether the content is a menu, a form, a dialog or plain information. The caller must provide semantics appropriate to the content. [[2]](https://html.spec.whatwg.org/multipage/popover.html)

In particular:

- Do not automatically add `role="menu"` to every Popover.
- Do not add `aria-modal="true"` to a non-modal Popover.
- Do not assume a generic Popover automatically has Dialog behavior.
- Do not implement menu arrow-key navigation in the generic primitive.

---

## 4. Core UI Boundary

The primitive should:

- Live in `src/components/ui/popover/`.
- Avoid imports from app providers, routing, i18n and form libraries.
- Include no hardcoded user-facing text.
- Allow caller-supplied content and localized labels.
- Forward refs to the relevant native elements.
- Use shared tokens rather than product-specific hardcoded colors.
- Respect Dashboard’s no-shadow policy.
- Be synchronized to Website and Vite using the existing shared-source process.

Internal component context is acceptable if needed for composition. The boundary is that the primitive should not depend on **application-specific** context.

---

## 5. Proposed Public API

The final API should follow the kit’s existing React conventions. A reasonable starting point is a controlled compound API:

```tsx
<Popover open={open} onOpenChange={setOpen}>
  <PopoverTrigger>
    <Button>Display settings</Button>
  </PopoverTrigger>

  <PopoverContent>
    {/* Caller-supplied content and actions */}
  </PopoverContent>
</Popover>
```

This is illustrative, not implementation-ready code. In particular, the team must avoid producing a button inside another button.

### 5.1 Proposed parts

| Part | Responsibility |
| --- | --- |
| `Popover` | Coordinates controlled state and its children. |
| `PopoverTrigger` | Associates an existing trigger or renders a button according to the final API decision. |
| `PopoverContent` | Renders the non-modal panel and applies positioning. |
| Optional `PopoverClose` | Requests closure where an explicit close control is useful. |

### 5.2 Proposed properties

| Property | Proposed behavior |
| --- | --- |
| `open` | Required controlled state for the initial version. |
| `onOpenChange(open)` | Reports state changes requested by the trigger or browser dismissal. |
| `placement` | Preferred side and alignment relative to the trigger. |
| `className`, `style` | Apply to the documented element; don’t split layout and styling responsibilities ambiguously. |
| `ref` | Forward to the relevant trigger or panel element. |
| `children` | Caller-supplied trigger and content. |

I recommend **not** adding `defaultOpen`, a large set of interaction modes or detailed close-reason enums until there is a demonstrated need. A native toggle event may not reliably identify every dismissal cause; the API should not promise reasons it cannot accurately report.

### 5.3 Trigger composition decision

Before coding, choose and document one clear pattern:

1. `PopoverTrigger` renders its own `<button>` and receives button content; **or**
2. It composes an existing Button safely, with a well-defined ref and event contract.

If using an `asChild` pattern, test event and ref composition carefully. Do not create invalid nested buttons or silently overwrite caller handlers.

---

## 6. State Synchronization

A controlled React API and a browser-managed popover have **two state representations**:

1. The application’s `open` prop.
2. The browser’s actual popover visibility.

They must not silently diverge.

### Required behavior

- When the application changes `open` to `true`, show the native popover once it is connected.
- When it changes `open` to `false`, hide it.
- When the browser dismisses it—such as through Escape, an outside interaction or another auto popover—the component notifies the caller.
- Define what happens if the browser has closed it but the caller intentionally keeps `open={true}`.
- Avoid duplicate callbacks from component-initiated native changes.
- Handle unmount, rapid open/close changes and React Strict Mode.
- Run browser-only APIs on the client; do not assume they exist during server rendering.
- Avoid stale native events reopening or closing the wrong instance.

As with Dialog, the implementation must test the **actual native state**, not only whether a callback was called.

---

## 7. Interaction and Dismissal

### 7.1 Default behavior

| Interaction | Proposed behavior |
| --- | --- |
| Activate closed trigger | Request open. |
| Activate trigger while open | Request close. |
| Press Escape | Close or request closure of the active popover. |
| Click outside | Light-dismiss the popover. |
| Click a control inside | Do not close unless that action explicitly requests it. |
| Open another auto popover | Follow and document native auto-popover behavior. |
| Trigger is removed | Close safely; do not leave a detached panel visible. |
| Component unmounts | Clean up listeners, positioning observers and native state. |

### 7.2 Outside-click behavior

Clicking a control outside the popover should generally allow that intended interaction to continue; dismissing the popover must not unexpectedly swallow the click.

If native light dismiss is used, verify its real behavior rather than layering a second competing outside-click handler over it.

### 7.3 Disabled triggers

A disabled trigger must not open the popover. Use the underlying control’s native disabled behavior where applicable.

---

## 8. Accessibility and Focus

### 8.1 Trigger relationship

The trigger needs an accessible name that describes what it opens.

A native association such as `popovertarget` can give the browser a relationship between the trigger and popover, including an implicit expanded state. The implementation must confirm how the chosen React API exposes this and avoid conflicting duplicate attributes or inaccurate `aria-expanded` values. [[3]](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/popoverTargetElement)

### 8.2 Content semantics

Use semantics appropriate to what is inside:

- Simple explanatory content may only need meaningful document structure.
- A small group of form controls needs labels and appropriate field relationships.
- A menu needs the separate Menu contract and its keyboard behavior.
- A non-modal dialog-like task may need dialog semantics and a name—but should not be created by adding `role="dialog"` blindly to every Popover.

### 8.3 Focus when opening

There is **no single correct focus target for every popover**.

- For short informational content, retaining focus on the trigger may be appropriate.
- For a small interactive form, moving focus to the first relevant control may be useful.
- If focus moves, the caller should be able to choose an appropriate target.

The chosen behavior must be documented and consistent with the content pattern.

### 8.4 Focus when closing

- If Escape closes a popover while focus is inside, returning focus to the trigger is often appropriate.
- If a user clicks another control outside, do **not** steal focus back to the trigger and prevent the intended action.
- If the trigger was removed or disabled, avoid focusing a disconnected or unusable element.
- If focus restoration is delegated to the browser, verify it in supported browsers.

### 8.5 Keyboard

- Trigger works with native button keyboard activation.
- Escape dismisses as documented.
- Tab and Shift+Tab follow a logical focus order.
- The Popover is **non-modal**: do not add a modal focus trap or make the page inert.
- Any special keyboard behavior belongs to the content pattern, not the generic Popover.

The modal-dialog focus loop we discussed for Dialog must **not** be copied into this component.

---

## 9. Positioning and Geometry

This is the main technical challenge of an anchored Popover.

### 9.1 Placement

Proposed supported placements:

```
bottom-start   bottom-end
top-start      top-end
inline-start   inline-end
```

The default can be **bottom-start**, subject to the kit’s design review. “Start” and “end” must respect LTR and RTL direction.

### 9.2 Viewport collision behavior

The panel must remain usable when the trigger is near the edge of the viewport.

Examples:

- If there is insufficient space below, try above.
- If the panel would overflow an inline edge, shift it within the available viewport.
- If content is taller than available space, constrain the panel and make its content reachable by scrolling.
- Avoid covering the trigger unnecessarily when another viable placement exists.

The final placement should follow a documented preference order. It need not guarantee a perfect position in every impossible geometry; it must not silently make the content inaccessible.

### 9.3 Position updates

Recalculate or otherwise maintain positioning when relevant conditions change:

- Window or containing area scrolls.
- Viewport resizes or orientation changes.
- Trigger or panel changes size.
- Locale changes and text reflows.
- Browser zoom or mobile viewport changes.
- A trigger moves because surrounding content changes.

Clean up any observers and listeners when the popover closes or unmounts.

### 9.4 Positioning implementation decision

The teammate should inspect whether the repository already uses a positioning utility or dependency.

Possible approaches include:

- Existing, approved positioning infrastructure.
- Native CSS anchor positioning with an appropriate tested fallback.
- A small, well-tested positioning layer, if the required behavior is limited.

**Do not assume CSS anchor positioning has identical support across every browser in the project’s matrix.** Collision fallbacks and anchor behavior require their own compatibility check. [[4]](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Anchor_positioning/Using) [[5]](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position-try-fallbacks)

### 9.5 Width and height

Use existing semantic tokens where possible:

- Content should have a sensible maximum width.
- Long words and translated text must not force horizontal overflow.
- Height should be constrained to the available viewport.
- The panel should not automatically match the trigger width unless that is an explicit option.

Exact widths, padding and radius are **kit decisions**, not accessibility standards.

---

## 10. Appearance, Theme and Motion

### Surface

The content surface should use existing semantic tokens for:

- Background and text.
- Border.
- Radius.
- Interior spacing.
- Focus indicators for controls inside.

### Dashboard shadows

Dashboard remains shadow-free. Separate the panel from its surroundings through the approved surface and border tokens.

Website can use its product-owned depth treatment if one is already defined and the team chooses to use it.

### Forced colors

Test the panel boundary, text and focus indicators in forced-colors mode. System-color behavior should be verified in a browser, not inferred solely from token names.

### Motion

Animation is optional.

If used:

- Keep it restrained and use existing motion tokens.
- Respect `prefers-reduced-motion`.
- Do not make focus, state synchronization or cleanup dependent on an animation completing.
- Opening and dismissal must remain functional if transitions are unavailable.

---

## 11. RTL and Localization

The primitive must remain independent of translation providers.

The gallery and connected patterns should:

- Provide complete EN, FR and AR presentation copy.
- Verify logical start/end alignment and placement.
- Test long French labels and Arabic content.
- Preserve application state when locale changes unless the product intentionally resets it.
- Verify nested direction overrides where the application uses them.
- Avoid assuming that physical left/right placement equals logical start/end.

Positioning must use the trigger’s relevant direction context, including when the panel is promoted to the top layer.

---

## 12. Dialog and Overlay Integration

A Popover may be opened from within a modal Dialog—for example, a date-range filter inside a form.

Verify:

1. The panel appears above the Dialog and remains usable.
2. Its content is not blocked by the Dialog’s modal behavior.
3. Escape closes the appropriate active layer without unexpectedly dismissing both.
4. Focus returns to a sensible target.
5. Closing the parent Dialog does not leave an orphaned Popover.
6. Theme tokens and direction remain correct.

Do not assume that `z-index` alone solves interaction with the browser top layer. Test the actual chosen native or fallback implementation.

---

## 13. Gallery Plan

The gallery should demonstrate working behaviors without turning design preferences into claims of universal standards.

### Suggested specimens

1. **Basic informational Popover**
Trigger, short content and native dismissal.
2. **Interactive settings**
A small labeled preference form with Apply and Cancel; Cancel must actually discard uncommitted changes.
3. **Placement examples**
Top/bottom and start/end placements.
4. **Viewport edge behavior**
Triggers near screen edges to demonstrate flip and shift.
5. **Scrollable content**
A constrained panel where every action remains reachable.
6. **Controlled state**
Clear open/close behavior, including outside dismissal.
7. **Inside Dialog**
An interactive Popover opened from an existing Dialog.
8. **LTR, RTL and long text**
EN/FR/AR content and direction checks.
9. **Themes and forced colors**
Use real product tokens; do not claim custom customer palettes have been verified.
10. **Code examples**
Copyable examples that match the final public API.

---

## 14. Verification Matrix

### 14.1 Unit and component tests

- Trigger and content refs reach the intended elements.
- Controlled open/close callbacks are correct.
- Trigger and content attributes are forwarded without overwriting caller events.
- Trigger composition does not create nested buttons.
- Disabled trigger cannot open.
- Native state changes are reconciled with controlled state.
- Component-initiated changes do not produce duplicate callbacks.
- Cleanup is safe on unmount.
- Caller-provided labels and descriptions reach the correct elements.

### 14.2 Real-browser tests

Run in Dashboard and Website:

- Trigger opens and closes with pointer and keyboard.
- Outside interaction closes the popover and still performs the intended outside action.
- Escape closes the active popover and handles focus correctly.
- Interactive controls inside work without closing unexpectedly.
- The page remains interactive; no modal focus trap is introduced.
- Panel stays visible near all viewport edges.
- Position updates after scrolling and resizing.
- Long content remains scrollable and usable.
- RTL and nested direction produce correct logical placement.
- Opening another popover follows the documented behavior.
- Popover inside Dialog is visible, operable and dismisses in the correct order.
- Trigger removal and component unmount leave no orphaned panel.
- Forced colors and reduced motion are usable.
- Dashboard shadow policy and shared synchronization pass.

### 14.3 Browser and assistive-technology checks

Confirm the project’s actual support matrix. Chromium with a mobile-sized viewport is **not** equivalent to real mobile Safari or an assistive-technology test.

Record what was tested, including any gaps involving Firefox, WebKit, real devices or screen readers.

---

## 15. Release Checklist

- [ ]  Native Popover API and browser-support strategy agreed.
- [ ]  Trigger composition and public API agreed.
- [ ]  Controlled/native state synchronization defined and tested.
- [ ]  Positioning and collision strategy selected based on the actual repository.
- [ ]  Outside click, Escape and focus behavior verified.
- [ ]  Popover inside Dialog verified.
- [ ]  LTR, RTL, responsive and long-content behavior verified.
- [ ]  EN/FR/AR gallery copy complete.
- [ ]  Forced-colors and reduced-motion behavior tested.
- [ ]  Dashboard shadow check and shared sync pass.
- [ ]  Unit, browser, typecheck, lint and build gates run in the agreed scope.
- [ ]  Handoff separates verified results from remaining gaps.

**Recommendation:** Have the teammate first review the native API, browser support and positioning approach. Those three decisions determine the implementation; the exact visual styling can follow the existing design system.
# Dropdown — Component Specification and Implementation Plan

> **Status:** Proposed baseline for team review
**Component:** `components/ui/dropdown`
**Canonical source:** Next.js Dashboard
**Mirrors:** Next.js Website and Vite Dashboard
**Gallery:** `/gallery/dropdown`
> 

I agree with **Dropdown** as the component name. For this kit, it should specifically mean an **action menu**: a button that opens a list of commands or navigation links.

This is a proposed plan—not an implemented or audited component.

---

## 1. Purpose and scope

Use Dropdown for actions associated with an object or context, such as:

- Edit
- Duplicate
- Archive
- Delete
- View details

### How it differs from existing components

| Component | Purpose |
| --- | --- |
| **Dropdown** | A menu of actions or navigation destinations. |
| **Select** | Choose a value for a form. |
| **Popover** | Show arbitrary contextual content, such as a small form or information panel. |
| **Dialog** | Interrupt the workflow with a modal interaction. |

A Dropdown can contain links, but ordinary website navigation does not automatically need ARIA menu behavior. Use this component when the intended interaction is genuinely a menu button.

### Out of scope for the first release

Keep the initial component focused:

- Nested submenus.
- Searchable menus or autocomplete.
- Form fields inside menu items.
- Multi-select menus.
- Context menus opened by right-click.
- Virtualized lists.

Those can be considered separately when there is a real need.

---

## 2. Foundation and architecture

### 2.1 Reuse Popover carefully

Dropdown needs an anchored floating surface, collision handling and dismissal. The preferred direction is to **reuse the existing Popover’s positioning and overlay foundation**, rather than build a second positioning engine.

However, Dropdown must add its own **menu semantics, keyboard navigation and focus management**. A Popover by itself does not provide those behaviors. The HTML standard explicitly notes that popover-based menus still need author-provided keyboard interaction. [[1]](https://html.spec.whatwg.org/dev/popover.html)

Before implementation, verify that the existing Popover can support this without conflicting event handlers—particularly inside Dialog. If it cannot, extract or adjust the shared overlay behavior rather than layering two competing implementations.

### 2.2 Core boundary

The primitive should:

- Live in `src/components/ui/dropdown/`.
- Have no dependency on application providers, translations or a specific framework.
- Contain no hardcoded English labels.
- Use caller-provided text and icons.
- Work in Dashboard, Website and Vite.
- Follow the existing shared-source synchronization rules.

Internal React context for the compound components is fine; the restriction is against coupling the primitive to application context.

---

## 3. Accessibility: requirements versus choices

### 3.1 Accessible menu pattern

Follow the WAI-ARIA menu-button pattern:

- The trigger is a **button** with an accessible name.
- The trigger exposes that it opens a menu and whether it is expanded.
- The floating list has `role="menu"`.
- Actions and links have `role="menuitem"`.
- The menu has an accessible name, normally associated with its trigger.
- Opening the menu moves focus into it.

The APG describes this pattern and its expected keyboard interaction. [[2]](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

### 3.2 WCAG requirements

The resulting experience must be keyboard operable, provide visible focus, expose meaningful names and states, and avoid obscuring focused controls. These are requirements to verify in the **rendered experience**, not claims that the primitive alone makes every usage compliant. [[3]](https://www.w3.org/TR/WCAG22) [[4]](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum)

### 3.3 Kit choices—not universal standards

The following are project decisions:

- Exact width, padding, radius and icon size.
- Whether typeahead is included in the initial release.
- Which placements are exposed.
- Whether Dashboard uses shadows.
- Which browser versions receive a fallback.

They should use existing kit tokens and product policies, not be presented as WCAG requirements.

---

## 4. Proposed public API

Names can be refined to fit the repository, but the initial composition should stay simple:

```tsx
<Dropdown>
  <DropdownTrigger asChild>
    <Button variant="secondary">
      Actions
    </Button>
  </DropdownTrigger>

  <DropdownContent>
    <DropdownItem onSelect={handleEdit}>
      Edit
    </DropdownItem>

    <DropdownItem onSelect={handleDuplicate}>
      Duplicate
    </DropdownItem>

    <DropdownSeparator />

    <DropdownItem
      onSelect={handleDelete}
      variant="danger"
    >
      Delete
    </DropdownItem>
  </DropdownContent>
</Dropdown>
```

All strings above are **caller-owned example content**, not hardcoded primitive copy.

### Proposed components

| Component | Responsibility |
| --- | --- |
| `Dropdown` | Owns or receives open state and coordinates the menu. |
| `DropdownTrigger` | Opens the menu and exposes its expanded state. |
| `DropdownContent` | Anchored menu surface with menu semantics. |
| `DropdownItem` | An action or navigation link within the menu. |
| `DropdownSeparator` | Visually and semantically separates groups. |

An optional `DropdownGroup` and `DropdownLabel` can be added if needed for real group headings, but they are not necessary to prove the initial primitive.

### State API

Recommended:

```tsx
interface DropdownProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}
```

- **Uncontrolled:** `defaultOpen` establishes initial state.
- **Controlled:** the parent supplies `open` and responds to `onOpenChange`.
- Avoid promising detailed close reasons unless the implementation can report them accurately.
- Document the existing native Popover competition policy rather than claiming simultaneous auto-popover state can always remain independent.

For layouts with multiple controlled dropdowns, the simplest recommendation is for the parent to maintain **one active dropdown identifier**.

### Trigger and item composition

If supporting `asChild`:

- Do not produce nested `<button>` elements.
- Preserve the child’s ref and the caller’s forwarded ref.
- Compose event handlers without calling them twice.
- Respect `event.preventDefault()` where the API promises that behavior.
- Preserve link behavior for a child `<a>` or framework link.

These requirements need tests; they must not merely be assumed from the existing Popover implementation.

---

## 5. Action items, links and disabled items

### 5.1 Actions

Actions should normally render as:

```html
<button type="button" role="menuitem">Edit</button>
```

`type="button"` avoids unintentionally submitting a surrounding form.

Activating an enabled action:

1. Calls the caller’s action once.
2. Closes the menu by default.
3. Does not automatically perform a destructive operation beyond what the caller supplied.

If deletion needs confirmation, the application can open a Dialog. Dropdown must not silently invent confirmation behavior.

### 5.2 Navigation links

A navigation item should remain a real link with an `href`, preserving browser behaviors such as opening in a new tab and copying the link address. The APG’s navigation-menu example uses links as menu items for this reason. [[5]](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/examples/menu-button-links/)

### 5.3 Disabled items

A disabled item must:

- Communicate its disabled state.
- Never execute its action or navigate.
- Have a visibly distinct disabled presentation.

For the ARIA menu pattern, disabled menu items can remain focusable for discovery but cannot be activated. Implement and test this deliberately; simply adding a native `disabled` attribute changes focus behavior. [[6]](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

---

## 6. Keyboard and focus behavior

### 6.1 Trigger

| Key | Behavior |
| --- | --- |
| `Enter` / `Space` | Open the menu and focus the first menu item. |
| `ArrowDown` | Recommended: open and focus the first item. |
| `ArrowUp` | Recommended: open and focus the last item. |

The arrow-key trigger shortcuts are APG options; choosing to support them is a kit decision. [[2]](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

### 6.2 Open menu

| Key | Behavior |
| --- | --- |
| `ArrowDown` | Move to the next item. |
| `ArrowUp` | Move to the previous item. |
| `Home` / `End` | Move to the first / last item. |
| `Enter` / `Space` | Activate the focused item where applicable. |
| `Escape` | Close the menu and return focus to its trigger. |
| `Tab` / `Shift+Tab` | Leave the menu and close it; do not trap focus. |

The menu is a **composite widget**: arrow keys move among its items, while Tab moves out of it. [[6]](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

**Typeahead:** matching items by typed characters is useful for longer menus. It can be included if the team can implement and test it properly; it should not delay the basic menu if the first release is intentionally smaller.

### 6.3 Focus after dismissal

- **Escape:** return focus to the trigger if it still exists.
- **Outside click:** do not steal focus back from the control the user clicked.
- **Tab:** allow normal movement out of the menu.
- **Item activation:** close the menu, but do not override focus intentionally moved by the action—for example, an action opening a Dialog.
- **Removed trigger:** let the caller provide a logical fallback when needed, such as after deleting a table row.

---

## 7. Pointer, touch and dismissal

- Clicking or tapping the trigger opens or closes the menu.
- Clicking an enabled item activates it once.
- Clicking outside dismisses the menu **and allows the outside interaction to proceed**.
- Clicking within the menu does not count as outside dismissal.
- Disabled items do not activate with pointer, touch or keyboard.
- The menu is **non-modal**: no backdrop scrim, no page inertness and no modal focus trap.

---

## 8. Positioning and layout

Use the shared overlay positioning where it is reliable.

### Recommended initial placement API

- Preferred side: `bottom`, `top`, `inline-start`, `inline-end`.
- Alignment: `start`, `center`, `end`, if the shared foundation supports them consistently.
- Default can be `bottom-start` as a **kit choice**, not a standard.

### Required behavior

- Stay anchored when the page or a scroll container scrolls.
- Reposition when the viewport, trigger or menu size changes.
- Flip or shift near viewport edges.
- Keep long menus scrollable, with the focused item brought into view.
- Work in LTR, RTL and nested direction overrides.
- Remain usable at narrow widths and browser zoom.
- Handle removal of the trigger without errors.

Test actual bounding boxes and focus—not just a placement data attribute.

### Inside Dialog

A Dropdown opened inside the existing modal Dialog must remain interactive above the dialog surface. Escape should dismiss the **Dropdown first**, then the Dialog on a subsequent Escape. This must be verified with the actual shared Popover/Dialog implementations rather than assumed from z-index values.

---

## 9. Visual treatment and theming

The component should consume **existing, verified tokens** rather than invent values in the specification.

### Surface

- Raised or appropriate menu surface token.
- Boundary/border token.
- Product-owned radius.
- **Dashboard:** follow the existing zero-shadow policy.
- **Website:** use a local shadow token only if the product actually defines and opts into one.

### Items

Support clear states:

- Rest.
- Pointer hover.
- Keyboard focus.
- Disabled.
- Optional destructive emphasis.

Hover and keyboard focus should not be conflated: a keyboard user must be able to see the focused item. Icons are optional and decorative unless they communicate information not already present in text.

### Accessibility modes

- **Forced colors:** use system colors where needed; verify that focus and disabled states remain distinguishable.
- **Reduced motion:** disable or reduce optional transitions.
- **RTL:** use logical spacing and alignment; keep labels and icons correctly ordered.

No visual arrow, animation or particular spacing should be described as a universal UI standard.

---

## 10. Gallery plan

The gallery should demonstrate real usage, not audit commentary:

1. **Basic actions:** Edit, Duplicate and Archive.
2. **Destructive action:** Delete opens a separate confirmation Dialog.
3. **Navigation items:** real links with correct browser behavior.
4. **Disabled item:** visible and non-activatable.
5. **Groups and separator:** if included in the API.
6. **Placement and collision:** examples near viewport edges.
7. **Controlled and uncontrolled:** including a parent-coordinated example.
8. **Dropdown inside Dialog:** focus and Escape sequence.
9. **RTL and localization:** EN, FR and AR.
10. **Long menu:** scrolling and focused-item visibility.

Gallery labels and descriptions belong in the message dictionaries; the core primitive remains translation-independent.

---

## 11. Verification matrix

### Unit tests

- Controlled and uncontrolled state.
- Trigger and item ref forwarding.
- `asChild` prop and handler composition.
- No nested buttons.
- Correct roles, accessible names and expanded state.
- Enabled actions run once.
- Disabled actions and links do not activate.
- Escape and item selection request closure.
- Controlled parent acceptance and rejection.
- Safe cleanup on unmount.

### Real-browser tests

1. **Keyboard:** open, first focus, arrows, Home/End, activation, Escape and Tab exit.
2. **Focus:** outside click, removed trigger and action opening a Dialog.
3. **Pointer/touch:** action runs once; outside action is not swallowed.
4. **Links:** real `href` and expected navigation behavior.
5. **Disabled items:** exposed correctly and never activated.
6. **Positioning:** each supported side, viewport collision, scrolling and resizing.
7. **Dialog integration:** Dropdown closes first on Escape.
8. **RTL:** including a nested direction override.
9. **Accessibility modes:** forced colors, visible focus and reduced motion.
10. **Responsive:** narrow viewport and zoom.
11. **Browser support/fallback:** test against the project’s actual support matrix.

Where possible, also run assistive-technology checks with the supported browser/screen-reader combinations; automated tests alone cannot establish the full experience.

### Repository gates

After canonical implementation and synchronization:

```bash
node scripts/sync-shared.mjs
node scripts/sync-shared.mjs --check
node scripts/check-dashboard-shadows.mjs
```

Also run the applicable typecheck, lint, unit tests, browser tests and builds across the starters. Report the exact scope actually run.

---

## 12. Recommended first-release decision

Build **Dropdown as an action-menu primitive** using the existing overlay foundation **only after confirming that its focus and dismissal behavior can be composed safely**.

Start with:

- Trigger, content, item and separator.
- Actions and links.
- Keyboard navigation and disabled items.
- Controlled/uncontrolled state.
- RTL, themes and Dialog integration.
- Targeted browser tests.

Defer submenus and more complex selection features until there is a real product need.
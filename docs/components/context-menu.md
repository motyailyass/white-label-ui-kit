# ContextMenu Primitive Specification

## 1. Overview
The `ContextMenu` primitive presents contextual actions activated by right-click (secondary click), long press, or contextmenu keyboard triggers within a defined target zone. Position is fixed and clamped within viewport boundaries with full keyboard cycling and screen reader semantics.

## 2. Anatomy
```tsx
<ContextMenu>
  <ContextMenuTrigger className={styles.fileCard}>
    <div className={styles.fileMeta}>Document.pdf</div>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>File Actions</ContextMenuLabel>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={handleDownload}>
      <Icon name="download" size={16} />
      <span>Download</span>
      <ContextMenuShortcut>⌘D</ContextMenuShortcut>
    </ContextMenuItem>
    <ContextMenuItem onSelect={handleDuplicate} disabled>Duplicate</ContextMenuItem>
    <ContextMenuSeparator />
    <ContextMenuItem onSelect={handleDelete} variant="danger">
      Move to Trash
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## 3. Keyboard & Accessibility Contracts
- **Trigger Semantics**: Listens for secondary-click (`onContextMenu`) and opens at cursor coordinates `(clientX, clientY)`.
- **Content Semantics**: Renders `<div role="menu" aria-orientation="vertical" tabIndex={-1}>`. Focus is shifted into the container upon opening.
- **Item Navigation**:
  - `ArrowDown` / `ArrowUp` cycle through enabled items, wrapping around endpoints.
  - `Home` / `End` jump immediately to first and last enabled items.
  - `Enter` / `Space` activate the focused item and close the menu.
  - Disabled items (`disabled={true}`) are skipped during keyboard navigation and ignored by clicks.
- **Dismissal**:
  - `Escape` dismisses the menu immediately.
  - Outside pointer events (`pointerdown`) and outside contextmenu clicks dismiss the menu.

## 4. Visual & Token Specifications
- **Positioning**:
  - Position is fixed with CSS variables `--context-menu-x` and `--context-menu-y` bound to physical coordinates (`top`, `left`).
  - Clamped against `window.innerWidth` and `window.innerHeight` with an 8px safe margin to prevent viewport overflow.
- **Surfaces & Borders**:
  - Background: `--color-surface-raised`
  - Border: 1px solid `--color-border-subtle`
  - Radius: `--radius-card` (8px dashboard, 12px website)
  - Z-Index: `--z-dropdown` (200)
- **Shadow Policy**:
  - Dashboard is 100% shadow-free. Depth is achieved via surface contrast, borders, and backdrop.
- **Direction & Logical Properties**:
  - 100% CSS logical properties internally (`padding-inline`, `padding-block`, `margin-inline-start: auto`).
  - Perfect RTL mirroring: item text aligns right, leading icons render on the right, and shortcuts render on the left with `<span dir="ltr">`.

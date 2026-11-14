# Command Palette Specification

## 1. Component Overview
The `CommandPalette` (`CommandDialog` compound primitive) provides a keyboard-first modal action launcher and filtered navigation dialog. It consists of [`CommandDialog`](../typescript/nextjs/starterkit/dashboard/src/components/ui/command-palette/command-palette.tsx), `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut`, and `CommandFooter`, adhering to WAI-ARIA Combobox and Listbox semantics.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/command-palette/` with React 19 native `ref` props and zero hardcoded user-facing copy. Callers pass localized strings into `CommandEmpty`, `CommandFooter` (`tips` or `children`), `CommandInput` (`aria-label`, `placeholder`), and `CommandDialog` (a required `aria-label` or `aria-labelledby`).
- **Top-Layer Dialog & Focus Restoration**:
  - Uses native `<dialog>` `showModal()` / `close()` anchored to `margin-inline: auto` and `--color-overlay` backdrop.
  - Captures invoking `document.activeElement` before opening and synchronously restores focus on close (or to `returnFocusRef` / `initialFocusRef`).
- **WAI-ARIA & DOM-Ordered Roving Navigation**:
  - Input renders `role="combobox"` with `aria-autocomplete="list"`, `aria-expanded="true"`, `aria-controls`, and `aria-activedescendant`.
  - Listbox queries `[role="option"]` items in DOM order across dynamically filtered groups, supporting `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter` (guarded against `isComposing` IME sessions), and `Escape` dismissal (`preventEscapeClose` supported).
  - Active option scrolls cleanly into view via `scrollIntoView({ block: 'nearest' })` and uses `--color-ghost-hover` for crisp contrast on `--color-surface-raised` in both light and dark modes.
- **Tokens, Radius & Reduced Motion**:
  - Consumes `--radius-dialog`, `--radius-control`, `--color-overlay`, `--color-surface-raised`, `--color-border-subtle`, `--z-modal`, and `:lang(ar)` Arabic font stack / normal letter-spacing.
  - 100% logical CSS properties, unclipped focus indicators, `@media (forced-colors: active)` support, and zero box-shadows in Dashboard.

## 3. Component API
### `<CommandDialog open={boolean} onOpenChange={callback} aria-label|aria-labelledby closeOnBackdropClick preventEscapeClose initialFocusRef returnFocusRef resetQueryOnClose>`
- Native `<dialog>` overlay container managing modal top-layer stacking, synchronous focus capture/restoration, background body-scroll locking, a Tab/Shift+Tab focus loop, backdrop clicks, Escape guards, and DOM-ordered keyboard navigation. An accessible name (`aria-label` or `aria-labelledby`) is required by the prop type.

### `<CommandInput value={string} onValueChange={callback} placeholder={string} />`
- Search input with `search` icon and accessible combobox bindings; synchronizes controlled/uncontrolled reset on close.

### `<CommandList>` / `<CommandGroup heading={ReactNode}>` / `<CommandEmpty>` / `<CommandSeparator>`
- Scrollable listbox compartment (`overscroll-behavior: contain`), accessible group labels, pure caller-defined empty slot, and divider.

### `<CommandItem value={string} icon={ReactNode} shortcut={ReactNode} onSelect={callback} disabled={boolean}>`
- Interactive option row aligning `icon` and label at inline-start and optional `shortcut` (`<CommandShortcut>`) cleanly at inline-end.

### `<CommandShortcut>` & `<CommandFooter tips={CommandFooterTip[]}>`
- Isolated `dir="ltr"` `<kbd>` shortcut chip and localized footer hints container.

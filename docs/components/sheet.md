# Sheet

**Layer:** Core UI (`src/components/ui/sheet/`)  
**Element:** Native modal `<dialog>` (`showModal()`) anchored to a viewport edge with WAI-ARIA Tab/Shift+Tab trapping, ref-counted body scroll locking, and automatic focus restoration.

---

## Import

```tsx
import {
  Sheet,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetCloseButton,
  SheetBody,
  SheetFooter,
  type SheetProps,
  type SheetSide,
  type SheetSize,
  type SheetCloseReason,
} from '@/components/ui/sheet';
```

---

## Architecture & Guarantees

- **React 19 `ref` as prop**: All 7 subcomponents accept native `ref` directly via `React.ComponentPropsWithRef<...>` without `forwardRef`.
- **Native top-layer `<dialog>`**: Renders `<dialog>` via `showModal()` when open (and renders `null` when closed), delivering native top-layer promotion and background inertness.
- **Logical RTL/LTR Docking**: Edge placement is logical by default: `inline-end` docks right in LTR and left in RTL (`inline-start` docks left in LTR and right in RTL), using `:dir(rtl)` slide keyframes.
- **State-driven Focus Restoration**: Scroll lock release (`acquireBodyScrollLock()`), `dialog.close()`, and focus restoration (`returnFocusRef` or pre-open active element) execute in `useLayoutEffect` cleanup rather than waiting for `transitionend`, ensuring reliable cleanup under `prefers-reduced-motion: reduce`.
- **Drag-out Safe Backdrop Dismissal**: `onPointerDown` checks whether the pointer originated strictly outside the dialog panel before `onClick` commits `'backdrop'` dismissal, preventing accidental closes when selecting text inside the drawer.
- **Keyboard Focus Loop**: Intercepts `Tab` and `Shift+Tab` inside the open sheet to wrap between the first and last non-disabled focusable elements cleanly.
- **Multilingual & Arabic Clearance**: `:lang(ar)` switches to `var(--font-family-arabic)` with `letter-spacing: var(--letter-spacing-normal)`, clears diacritics in `.body`, and prevents long-word overflow (`overflow-wrap: anywhere`, `min-inline-size: 0`).
- **Shadow-Free Dashboard Discipline**: Achieves edge separation strictly through `--color-overlay` backdrop dimming, `--color-surface` elevation, and `--color-border-subtle` dividers—zero CSS shadows.

---

## API Reference

### `Sheet`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `open` | `boolean` | **Required** | Controlled visibility of the modal drawer. |
| `onOpenChange` | `(open: boolean, details?: { reason: SheetCloseReason }) => void` | **Required** | Invoked when dismissed via `'escape'`, `'backdrop'`, or `'close-button'`. |
| `side` | `'inline-start' \| 'inline-end' \| 'top' \| 'bottom'` | `'inline-end'` | Logical viewport edge to anchor the drawer. |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Panel width (side sheets) or block height (top/bottom sheets). |
| `titleId` | `string` | `useId()` | Override `aria-labelledby` reference; forwarded to `<SheetTitle>`. |
| `descriptionId` | `string` | `useId()` | Override `aria-describedby` reference; forwarded to `<SheetDescription>`. |
| `showCloseButton` | `boolean` | `false` | Renders a built-in `<SheetCloseButton>` in the top trailing corner. |
| `closeLabel` | `string` | **Required when `showCloseButton` is `true`** | Localized accessible label for the built-in close button. |
| `closeOnBackdropClick` | `boolean` | `true` | Enables clicking outside the drawer panel to dismiss. |
| `preventEscapeClose` | `boolean` | `false` | Blocks `Escape` key dismissal cleanly. |
| `initialFocusRef` | `RefObject<HTMLElement \| null>` | — | Optional element to focus immediately when the sheet opens. |
| `returnFocusRef` | `RefObject<HTMLElement \| null>` | — | Optional trigger element to restore focus to on close; defaults to pre-open active element. |
| `ref` | `Ref<HTMLDialogElement>` | — | Native `<dialog>` element ref. |

> **Close Button Prop Guard**: `SheetProps` is a discriminated union (`SheetCloseButtonProps`). Passing `showCloseButton={true}` (or `showCloseButton`) requires `closeLabel` at compile time, guaranteeing no hardcoded English aria-label leaks.

### Size Scale (`--_sheet-size`)

| Size | Inline Sheets (`inline-start` / `inline-end`) | Block Sheets (`top` / `bottom`) |
| :--- | :--- | :--- |
| `sm` | `320px` (20rem) | `240px` (15rem) |
| `md` | `400px` (25rem) | `320px` (20rem) |
| `lg` | `540px` (33.75rem) | `420px` (26.25rem) |
| `xl` | `720px` (45rem) | `540px` (33.75rem) |
| `full` | `100%` | `100dvh` |

### Subcomponents

- **`SheetHeader`** (`<div>`): Top compartment (`padding-block: var(--space-5)`, `padding-inline: var(--space-6)`) with bottom border divider (`--color-border-subtle`).
- **`SheetTitle`** (`<h2>`): Binds `id={titleId}` automatically via internal context.
- **`SheetDescription`** (`<p>`): Binds `id={descriptionId}` automatically via internal context.
- **`SheetCloseButton`** (`<button type="button">`): Ghost close trigger with `<Icon name="close" />`; requires `label` prop for accessibility.
- **`SheetBody`** (`<div>`): Flexible scrolling region (`flex: 1 1 auto`, `overflow-y: auto`).
- **`SheetFooter`** (`<div>`): Action bar (`padding-block: var(--space-4)`, `padding-inline: var(--space-6)`) with top border divider and wrapped action gap.

---

## Example Usage

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);
const inputRef = useRef<HTMLInputElement>(null);
const [open, setOpen] = useState(false);

<Button ref={triggerRef} onClick={() => setOpen(true)}>
  {t('common.openInspector')}
</Button>

<Sheet
  open={open}
  onOpenChange={(nextOpen) => setOpen(nextOpen)}
  side="inline-end"
  size="md"
  showCloseButton
  closeLabel={t('common.close')}
  initialFocusRef={inputRef}
  returnFocusRef={triggerRef}
>
  <SheetHeader>
    <SheetTitle>{t('settings.drawerTitle')}</SheetTitle>
    <SheetDescription>{t('settings.drawerDesc')}</SheetDescription>
  </SheetHeader>
  <SheetBody>
    <Input ref={inputRef} />
  </SheetBody>
  <SheetFooter>
    <Button variant="primary" onClick={() => setOpen(false)}>
      {t('common.save')}
    </Button>
  </SheetFooter>
</Sheet>
```

---

## Verification

- **Unit tests**: `src/components/ui/sheet/sheet.test.tsx` (Vitest + RTL `userEvent` covering compartments, close reasons, closed zero-DOM state, focus trap loop, `initialFocusRef`/`returnFocusRef`, `Escape`/backdrop guards, scroll lock release, and refs).
- **Playwright E2E**: `e2e/sheet.spec.ts` in both Next.js Dashboard and Website (keyboard focus trap, Escape/backdrop dismissal, RTL `lang="ar"` logical docking, form/navigation archetypes, zero Dashboard shadows, and 375×812 mobile responsiveness).

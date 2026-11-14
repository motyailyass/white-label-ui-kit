# Alert Dialog Primitive (`@ui/alert-dialog`)

**Component Directory:** `src/components/ui/alert-dialog/`
**Gallery Studio Route:** `/gallery/alert-dialog` (`src/components/patterns/alert-dialog-gallery/`)

## Architectural Overview

`AlertDialog` is a pure, white-label modal confirmation primitive built natively on HTML5 `<dialog role="alertdialog">` and `HTMLDialogElement.showModal()` for high-consequence interactions (deleting clusters, revoking production secrets, discarding uncommitted drafts).

### Standards & Accessibility Guarantees
- **Native Top Layer & Background Inertness:** `.showModal()` promotes `<dialog>` into the browser top layer (`--z-modal-backdrop: 400`, surface `--z-modal: 410`) and natively marks background DOM subtrees inert.
- **No Accidental Backdrop Dismissal:** Clicking the scrim backdrop intentionally keeps `AlertDialog` open; users must explicitly choose Cancel, Confirm Action, or `Escape` (unless `preventEscapeClose` is enabled during an in-flight async mutation).
- **Dynamic ARIA ID Registration:** `AlertDialogTitle` and `AlertDialogDescription` register their active IDs (including caller-supplied `id` overrides) with `AlertDialogContext`. `AlertDialogContent` binds `aria-labelledby` and `aria-describedby` strictly when rendered and omits `aria-labelledby` if explicit `aria-label` is supplied.
- **Safe Initial Focus & Focus Trap:** Opening focuses `initialFocusRef` -> `AlertDialogCancel` -> first focusable control inside `<dialog>`, cycling `Tab`/`Shift+Tab` inside the modal and restoring focus to `returnFocusRef` -> `AlertDialogTrigger` -> previously active element on close.
- **Product Control Sizing & Dark-Mode Contrast:** `AlertDialogAction` and `AlertDialogCancel` implement `ControlSizingProps` (`--control-height-default`: `36px` Dashboard / `48px` Website, plus `>=48px` coarse-pointer touch targets). Destructive CTAs use `--color-danger-solid` + `--color-danger-solid-foreground` for crisp light and dark contrast.
- **100% Logical Properties & Arabic Typography:** Uses CSS logical spacing/insets (`padding-inline`, `overflow-block: auto`, `border-block-*`) plus `:lang(ar)` Arabic font family (`--font-family-arabic`), normal tracking (`--letter-spacing-normal`), and `--line-height-arabic-*` clearance, with zero `box-shadow` in Dashboard.

---

## TypeScript API

```ts
export type AlertDialogSize = 'sm' | 'md' | 'lg';
export type AlertDialogCloseReason = 'action' | 'cancel' | 'escape' | 'trigger' | 'native-close';
export type AlertDialogMediaVariant = 'danger' | 'warning' | 'info' | 'default';
export type AlertDialogFooterLayout = 'end' | 'split' | 'stacked' | 'between' | 'center';
export type AlertDialogFooterBackground = 'seamless' | 'docked';

export interface AlertDialogOpenChangeDetails {
  reason: AlertDialogCloseReason;
}

export interface AlertDialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, details: AlertDialogOpenChangeDetails) => void;
  children: React.ReactNode;
}

export interface AlertDialogContentProps
  extends Omit<React.ComponentPropsWithRef<'dialog'>, 'open'> {
  size?: AlertDialogSize;                            // Default: 'md' (sm: 24rem, md: 30rem, lg: 36rem)
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  returnFocusRef?: React.RefObject<HTMLElement | null>;
  preventEscapeClose?: boolean;                      // Default: false
  children: React.ReactNode;
}

export interface AlertDialogActionProps
  extends Omit<React.ComponentPropsWithRef<'button'>, 'size'>,
    ControlSizingProps {
  as?: React.ElementType;
  variant?: 'danger' | 'primary' | 'secondary';      // Default: 'danger'
  target?: string;
  rel?: string;
}

export interface AlertDialogCancelProps
  extends Omit<React.ComponentPropsWithRef<'button'>, 'size'>,
    ControlSizingProps {
  as?: React.ElementType;
  target?: string;
  rel?: string;
}
```

Additional exports: `AlertDialogTrigger`, `AlertDialogHeader` (`align?: 'start' | 'center'`, `separator?: boolean`), `AlertDialogMedia` (`variant?: AlertDialogMediaVariant`, `aria-hidden="true"` default), `AlertDialogBody`, `AlertDialogTitle` (`as?: 'h1' | ... | 'h6'`, default `'h2'`), `AlertDialogDescription` (`as?: ElementType`, default `'p'`), and `AlertDialogFooter` (`layout`, `background`, `separator` — defaults to `false` on `seamless` and `true` on `docked`).

---

## Usage Example

```tsx
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/components/ui';
import { Icon } from '@/components/icons';

<AlertDialog>
  <AlertDialogTrigger as={Button} variant="danger">
    {t('common.studio.alertDialogOpenModalBtn')}
  </AlertDialogTrigger>
  <AlertDialogContent size="md" preventEscapeClose={isSubmitting}>
    <AlertDialogHeader>
      <AlertDialogMedia variant="danger">
        <Icon name="danger" />
      </AlertDialogMedia>
      <AlertDialogTitle>{t('common.studio.alertDialogDeleteTitle')}</AlertDialogTitle>
      <AlertDialogDescription>{t('common.studio.alertDialogDeleteDesc')}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter layout="split">
      <AlertDialogCancel>{t('common.studio.alertDialogCancel')}</AlertDialogCancel>
      <AlertDialogAction variant="danger" disabled={isSubmitting} onClick={handleDelete}>
        {t('common.studio.alertDialogDeleteConfirm')}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Verification

- **Unit & Interaction Tests (`vitest run`):** `src/components/ui/alert-dialog/alert-dialog.test.tsx` (11 tests covering `role="alertdialog"`, dynamic ARIA registration, default `Cancel` initial focus + trigger/custom focus restoration, `initialFocusRef`, `Tab`/`Shift+Tab` focus trap, ignored backdrop clicks, `Escape` / `preventEscapeClose`, disabled button suppression, `target="_blank"` `rel="noopener noreferrer"`, `AlertDialogMedia` `aria-hidden="true"`, sizing, and ref forwarding).
- **Gallery Studio:** `/gallery/alert-dialog` with Single Specimen + Matrix View (`Critical Confirmation Scenarios` & `Footer Layouts & Surface Modes`), localized across `en`, `fr`, and `ar` with synchronized RTL top-layer modal inspection.
- **Playwright E2E:** `e2e/alert-dialog.spec.ts` in both Next.js Dashboard and Next.js Website across Desktop Chrome and Mobile Viewport (390px).

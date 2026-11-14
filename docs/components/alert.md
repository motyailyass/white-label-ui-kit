# Alert Primitive (`@ui/alert`)

**Component Directory:** `src/components/ui/alert/`
**Gallery Studio Route:** `/gallery/alert` (`src/components/patterns/alert-gallery/`)

## Architectural Overview

`Alert` is a pure, white-label inline feedback and status notification primitive designed for contextual banners, validation summaries, billing/quota thresholds, cluster maintenance notices, and dismissible operational messages across both Dashboard and Website hosts.

### Design & Standards Compliance
- **Zero External Dependencies:** Pure React + TypeScript state and compound context (`AlertContext`).
- **Dynamic ARIA IDs:** Generates paired title and description IDs via `React.useId()` and only binds `aria-labelledby` / `aria-describedby` when `AlertTitle` / `AlertDescription` are mounted (and never overrides explicit `aria-label` or `aria-labelledby`).
- **Smart Live-Region Defaults:** `status="danger"` defaults to `role="alert"` (`aria-live="assertive"`), while `info`, `success`, and `warning` default to `role="status"` (`aria-live="polite"`). Explicit static landmark overrides such as `role="region"` omit unsolicited `aria-live` unless supplied by the caller.
- **Shadow-Free Dashboard Surface:** Achieves visual hierarchy strictly through semantic status tokens, `1px` surface borders, and background fill contrast—zero `box-shadow` in Dashboard.
- **100% Logical Properties & Multi-Script Typography:** Uses CSS logical properties (`padding-block`, `padding-inline`, `margin-inline-start`, `margin-block-start`) plus `:lang(ar)` Arabic font family (`--font-family-arabic`), normal tracking (`--letter-spacing-normal`), and Tashkeel clearance (`--line-height-arabic-snug`, `--line-height-arabic-normal`).
- **Focus & Touch Target Ergonomics:** Open alerts preserve `overflow: visible` so keyboard `:focus-visible` outlines (`--focus-ring-width`, `--focus-ring-offset`, `--_z-layer-raised`) are never clipped; `AlertCloseButton` tracks `--control-height-{xs,sm,md}` (`28/32/36px`) visually and expands a centered `48×48px` (`--control-touch-target-min`) hit target on `@media (pointer: coarse)` without shifting in RTL.
- **Reduced Motion & Inert Dismissal:** Collapses smoothly via CSS Grid (`grid-template-rows: 1fr` to `0fr`) with zero `transition: all` or layout-blocking JS listeners. Dismissed wrappers immediately receive `aria-hidden="true"` and `inert`, and transitions collapse under `prefers-reduced-motion: reduce`.

---

## TypeScript API

```ts
export type AlertStatus = 'info' | 'success' | 'warning' | 'danger';
export type AlertVariant = 'subtle' | 'bordered' | 'solid';
export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  status?: AlertStatus;               // Default: 'info'
  variant?: AlertVariant;             // Default: 'subtle'
  size?: AlertSize;                   // Default: 'md'
  open?: boolean;                     // Controlled open state
  defaultOpen?: boolean;              // Initial open state when uncontrolled (default: true)
  dismissible?: boolean;              // Renders built-in AlertCloseButton
  closeLabel?: string;                // Localized aria-label passed to AlertCloseButton
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  as?: React.ElementType;             // Default: 'div'
}

export interface AlertIconProps extends React.HTMLAttributes<HTMLSpanElement> {}

export interface AlertTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div'; // Default: 'h5'
}

export interface AlertDescriptionProps extends React.HTMLAttributes<HTMLDivElement> {}
export interface AlertActionProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface AlertCloseButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label'?: string;
}
```

### Default Icon Registry Mapping (`@/components/icons`)
| Status | Registry Icon Name |
| --- | --- |
| `info` | `info-circle` |
| `success` | `check-circle` |
| `warning` | `warning` |
| `danger` | `danger` |
| Close button | `close` |

---

## Design Tokens

| Role | Tokens Consumed |
| --- | --- |
| Sizing & Spacing | `--space-1`, `--space-2`, `--space-3`, `--space-4`, `--space-5`, `--font-size-xs`, `--font-size-sm`, `--font-size-base` |
| Control & Icon Sizing | `--control-height-xs` (28px), `--control-height-sm` (32px), `--control-height-md` (36px), `--control-icon-size-{xs,sm,lg,xl,2xl}`, `--control-touch-target-min` (48px) |
| Status Colors (Subtle / Bordered / Solid) | `--color-{info,success,warning,danger}`, `--color-{info,success,warning,danger}-subtle`, `--color-{info,success,warning,danger}-foreground`, `--color-danger-solid`, `--color-danger-solid-foreground` |
| Radius & Focus | `--radius-card`, `--radius-control`, `--focus-ring-width`, `--focus-ring-offset`, `--color-border-focus`, `--_z-layer-raised` |
| Motion & Typography | `--transition-fast`, `--transition-normal`, `--motion-duration-normal`, `--font-family-sans`, `--font-family-arabic`, `--line-height-snug`, `--line-height-relaxed`, `--line-height-arabic-snug`, `--line-height-arabic-normal` |

---

## Usage Examples

### Uncontrolled Dismissible Alert (Localized via `t()`)
```tsx
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
} from '@/components/ui';

<Alert
  status="warning"
  variant="subtle"
  size="md"
  dismissible
  closeLabel={t('common.studio.alertCloseLabel')}
  onClose={() => trackDismiss()}
>
  <AlertIcon />
  <div>
    <AlertTitle>{t('common.studio.alertWarnTitle')}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>
    <AlertAction>
      <Button variant="secondary" size="sm">
        {t('common.studio.alertWarnAction')}
      </Button>
    </AlertAction>
  </div>
</Alert>
```

### Controlled Alert with Reopen State
```tsx
const [open, setOpen] = useState(true);

<Alert
  status="danger"
  variant="solid"
  open={open}
  onOpenChange={setOpen}
  dismissible
  closeLabel={t('common.studio.alertCloseLabel')}
>
  <AlertIcon />
  <div>
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{message}</AlertDescription>
  </div>
</Alert>
```

---

## Verification

- **Unit & Interaction Tests (`vitest run`):** `src/components/ui/alert/alert.test.tsx` (16 tests covering semantic live roles, static role override, `aria-labelledby`/`aria-describedby` registration, `aria-hidden` icons, `closeLabel`, controlled `open` + `defaultOpen={false}`, missing-context errors, statuses/variants/sizes, polymorphic `as`, and ref forwarding).
- **Gallery Studio:** Interactive single-specimen inspector + Status × Variant (12 cards) and Size Progression (`sm`, `md`, `lg`) matrix modes in `/gallery/alert`, fully localized across `en`, `fr`, and `ar` with synchronized RTL switching.
- **Playwright E2E:** `e2e/alert.spec.ts` in both Next.js Dashboard and Next.js Website across Desktop Chrome and Mobile Viewport (390px).

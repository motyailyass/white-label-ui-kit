# Toast

**Layer:** Core UI (`src/components/ui/toast/`)  
**Elements:** Screen-anchored `<ol>` notification region (`ToastViewport`) containing accessible `<li role="status" | "alert">` notification cards (`Toast`) with hover/focus timer pause and logical RTL placement.

---

## Import

```tsx
import {
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  ToastCloseButton,
  type ToastViewportProps,
  type ToastProps,
  type ToastVariant,
  type ToastPosition,
} from '@/components/ui/toast';
```

---

## Architecture & Guarantees

- **React 19 `ref` as prop**: All 6 exports (`ToastViewport`, `Toast`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastCloseButton`) accept native `ref` directly via `ComponentPropsWithRef<...>` without `forwardRef`.
- **Symmetric LTR & RTL Placement**: `.viewport` supports 6 logical positions (`top-start`, `top-center`, `top-end`, `bottom-start`, `bottom-center`, `bottom-end`). Centered anchors (`top-center` / `bottom-center`) use `inset-inline: 0; margin-inline: auto;` with `inline-size: min(24rem, 100%)` so RTL never skews off-center.
- **Stable Countdown & Internal Focus Containment**:
  - `onDismiss` is stored in a ref so parent list re-renders never reset running timers.
  - Moving focus *between* interactive controls inside a toast (e.g., from `ToastAction` to `ToastCloseButton`) keeps the countdown paused (`!e.currentTarget.contains(e.relatedTarget)`).
- **Dynamic ARIA Association & Honest Semantics**:
  - `info` & `success` announce via `role="status"` / `aria-live="polite"`; `warning` & `danger` announce via `role="alert"` / `aria-live="assertive"`.
  - `ToastTitle` and `ToastDescription` register their DOM IDs dynamically via `useLayoutEffect`, omitting `aria-describedby` cleanly when no description is rendered.
  - `ToastViewport` only applies `role="region"` when `label`, `aria-label`, or `aria-labelledby` is supplied (avoiding unnamed ARIA landmarks).
  - `ToastTitle` defaults to `<p>` (with optional polymorphic `as?: 'h2' | ... | 'div'`) so floating notifications never skip heading levels.
- **Arabic Clearance & Reduced Motion**: `:lang(ar)` switches to `var(--font-family-arabic)`, restores `letter-spacing: var(--letter-spacing-normal)`, clears diacritics with `--line-height-arabic-*`, wraps long tokens (`overflow-wrap: anywhere`), and disables enter/hover animations under `@media (prefers-reduced-motion: reduce)`.
- **Shadow-Free Dashboard Discipline**: Achieves visual elevation strictly through `--color-surface-raised`, `--color-border-subtle`, and 4px logical semantic start accents—zero CSS shadows.

---

## API Reference

### `ToastViewport`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `position` | `'top-start' \| 'top-center' \| 'top-end' \| 'bottom-start' \| 'bottom-center' \| 'bottom-end'` | `'bottom-end'` | Logical corner/edge anchor (`--z-toast: 500`). |
| `label` | `string` | — | Localized landmark name mapped to `aria-label` (enables `role="region"`). |
| `ref` | `Ref<HTMLOListElement>` | — | Native `<ol>` element ref. |

### `Toast`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `variant` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | Semantic accent, icon, and live-region politeness (`polite` vs `assertive`). |
| `duration` | `number` | `5000` | Auto-dismiss duration in ms; pass `0` for persistent notifications. |
| `onDismiss` | `() => void` | — | Callback invoked when timer expires or close button is clicked. |
| `showCloseButton` | `boolean` | Inferred (`Boolean(closeLabel)`) | Shows dismiss button; passing `true` requires `closeLabel` at compile time. |
| `closeLabel` | `string` | — | Localized `aria-label` for built-in dismiss button. |
| `icon` | `ReactNode \| boolean` | `true` | Renders variant icon by default, custom icon node, or `false` to hide. |
| `ref` | `Ref<HTMLLIElement>` | — | Native `<li>` element ref. |

### Subcomponents

- **`ToastTitle`** (`<p>` by default, polymorphic `as`): Dynamically registers `aria-labelledby`.
- **`ToastDescription`** (`<p>`): Dynamically registers `aria-describedby`.
- **`ToastAction`** (`<button type="button">`): Secondary action area with keyboard focus ring and coarse touch target support (`--control-touch-target-min`).
- **`ToastCloseButton`** (`<button type="button">`): Calls custom `onClick` first (respecting `defaultPrevented`) then context `onDismiss`.

---

## Example Usage

```tsx
<ToastViewport position="bottom-end" label={t('common.notifications')}>
  {items.map((item) => (
    <Toast
      key={item.id}
      variant={item.variant}
      duration={5000}
      showCloseButton
      closeLabel={t('common.close')}
      onDismiss={() => removeItem(item.id)}
    >
      <ToastTitle>{item.title}</ToastTitle>
      <ToastDescription>{item.description}</ToastDescription>
      <ToastAction onClick={() => retry(item.id)}>{t('common.retry')}</ToastAction>
    </Toast>
  ))}
</ToastViewport>
```

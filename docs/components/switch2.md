# Switch — Component Specification and Implementation Reference

> **Status:** Proposed baseline for review; not an implemented or approved component.
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/switch/`
> **Mirrors:** Next.js Website and Vite Dashboard via `scripts/sync-shared.mjs`
> **Related controls:** Checkbox, Radio, and `components/ui/control-sizing.ts`

## 1. Purpose and scope

`Switch` is an individually labeled, binary on/off control, typically used for a setting that takes effect immediately. A switch is not a substitute for a Checkbox when the user is selecting an item, expressing consent, or choosing multiple values for later submission. The containing application decides when and how a change is saved; the primitive never persists data.

Deliver:

- `components/ui/switch/switch.tsx`, `switch.module.css`, `switch.test.tsx`, and `index.ts`.
- An export from the shared UI barrel.
- `components/patterns/switch-gallery/` and `/gallery/switch` routes in Dashboard and Website.
- EN, FR, and AR gallery dictionaries and localized route metadata.
- Real-browser Switch tests for Dashboard and Website.
- Canonical Dashboard source synchronized to Website and Vite.

Out of scope: integrated labels or errors, loading state, a stateful Switch group, context, application persistence, `readOnly`, `indeterminate`, custom icons, edition checks, and third-party state or form libraries.

## 2. Public API and semantics

Use a native `<input type="checkbox" role="switch">`. Native `checked` is the only selection authority; do not maintain mirrored internal selection state or set `aria-checked`. The switch is binary, never mixed.

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface SwitchProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly' | 'role' | 'aria-checked' | 'aria-readonly'
    >,
    ControlSizingProps {}
```

- Lock `type="checkbox"` and `role="switch"` on the actual input. Do not add a redundant `aria-checked` attribute.
- Forward `ref` to the native `HTMLInputElement`.
- Root receives `className`, `style`, `data-size`, and `data-touch-target`. The input receives `id`, `name`, `value`, `checked`, `defaultChecked`, `disabled`, `required`, event handlers, ARIA attributes, `form`, and consumer test IDs.
- Omitted `size` consumes the local product default, not a hardcoded Dashboard value. `touchTarget` defaults to `auto`.
- Callers supply the accessible name through an external `<label htmlFor>` or, when visible text is intentionally absent, an appropriate accessible name. Keep the accessible name stable when the switch changes state.
- Use `aria-describedby` for existing helper and error text. Apply `aria-invalid="true"` only when the application has determined an error. Do not introduce an automatic alert.
- Support controlled `checked` / `onChange` and uncontrolled `defaultChecked` directly. Do not invent `onValueChange`, `selected`, or a separate `invalid` prop.

### Reference component

```tsx
import { type ComponentPropsWithoutRef, forwardRef } from 'react';
import { cn } from '@/lib/cn';
import type { ControlSizingProps } from '../control-sizing';
import styles from './switch.module.css';

export interface SwitchProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly' | 'role' | 'aria-checked' | 'aria-readonly'
    >,
    ControlSizingProps {}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { size, touchTarget = 'auto', className, style, ...inputProps },
  ref,
) {
  return (
    <span
      className={cn(styles.root, className)}
      style={style}
      data-size={size}
      data-touch-target={touchTarget}
    >
      <input
        {...inputProps}
        ref={ref}
        type="checkbox"
        role="switch"
        className={styles.input}
      />
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb} />
      </span>
    </span>
  );
});

Switch.displayName = 'Switch';
```

`index.ts` exports `Switch` and `SwitchProps`. The app should provide an `id` when linking an external label. If the implementation uses an internal ID helper, preserve caller IDs and the same input/ref contract; it must not create a separate state source.

## 3. Sizing and real interaction target

The following proposal uses existing product-owned control tokens. Pixel values assume a 16px root font size. Interaction targets are square and are reserved by the real root layout box; the transparent native input fills that box. The decorative track does not determine the click target.

| Size | Fine-pointer target | Visible track | Circular thumb |
| --- | --- | --- | --- |
| xs | 28 × 28px | 28 × 14px | 10px |
| sm | 32 × 32px | 32 × 16px | 12px |
| md | 36 × 36px | 32 × 16px | 12px |
| lg | 40 × 40px | 36 × 18px | 14px |
| xl | 48 × 48px | 40 × 20px | 16px |
| 2xl | 56 × 56px | 48 × 24px | 20px |

- Target size derives from `--control-height-*` and `--control-height-default`.
- Track height derives from `--control-icon-size-*` and `--control-icon-size-default`; its width is twice its height. The thumb is track height minus 4px: 1px track border and 1px inset on each side.
- Use the product-owned aliases: omitted Dashboard/Vite size equals explicit `md`; omitted Website size equals explicit `xl`. Compare target, track, thumb, border, and alignment—not only root height.
- `touchTarget="auto"` expands each target dimension to at least `--control-touch-target-min` on `@media (any-pointer: coarse)`. `comfortable` always enforces that minimum. Preserve 2xl's 56px target. Expanding the target must reserve real layout space and not enlarge the visible track or overlap adjacent controls.
- The native input covers the complete root with `inset: 0`, full width and height. Do not use pseudo-element hitboxes. The track and thumb have `pointer-events: none`.

## 4. Visual behavior and precedence

| State | Track | Thumb and outline |
| --- | --- | --- |
| Off | Surface with a 1px control border | Neutral thumb at inline-start |
| Off hover | Surface-hover; unchanged neutral border | Neutral thumb |
| On | Primary background and border | Primary-foreground thumb at inline-end |
| On hover | Primary-hover background and border | Primary-foreground thumb |
| Focus-visible | Preserve off/on appearance | Immediate focus outline with offset |
| Invalid off | Surface and danger border | Neutral thumb; danger focus outline when focused |
| Invalid on | Danger background and border | Danger-foreground thumb |
| Invalid hover | Off keeps surface-hover and danger border; on remains danger | No invalid-to-primary regression |
| Disabled off/on | Disabled background and border | Disabled foreground thumb at the corresponding position; no focus outline |

Precedence is **disabled > invalid > on > hover**. Untouched native `required` controls must not gain danger styling solely through `:invalid`. The border remains 1px in every state. No Dashboard shadow, scale, bounce, or sliding-thumb animation: position changes immediately. Color transitions may be used; disable them for `prefers-reduced-motion: reduce`.

The off thumb is at **inline-start**, and the on thumb at **inline-end** in both LTR and RTL. Use logical layout, not hardcoded left/right or custom keyboard inversion. Verify the actual positions in both directions.

## 5. Forced colors

In `@media (forced-colors: active)`, use system colors and ensure ordinary component selectors cannot override them:

| State | Track background / border | Thumb |
| --- | --- | --- |
| Enabled off | `Canvas` / `CanvasText` | `CanvasText` at inline-start |
| Enabled on | `Highlight` / `Highlight` | `HighlightText` at inline-end |
| Invalid off | `Canvas` / `Highlight` | `CanvasText` |
| Invalid on | `Highlight` / `Highlight` | `HighlightText` |
| Disabled, including invalid | `Canvas` / `GrayText` | `GrayText`, positioned for off/on |
| Focus-visible, enabled | Preserve state | `Highlight` outline |

Off/on must remain distinguishable in high contrast even if colors are overridden. Check specificity for resting, hovered, focused, and disabled combined states; do not rely on source order when a more-specific ordinary selector still wins. If opting out of forced-color adjustment on a decorative element, explicitly set all relevant system colors and test computed values.

## 6. Reference stylesheet

The following is an implementation reference, not evidence of a tested component. Keep product-owned token files local; do not replace their default aliases during synchronization. The `:where()` state conditions deliberately keep selector specificity consistent so the later forced-color rules can override ordinary rules. Verify behavior against the actual project build and browsers.

```css
.root {
  --_switch-target: var(--control-height-default, 2.25rem);
  --_switch-track-height: var(--control-icon-size-default, 1rem);
  --_switch-track-width: calc(var(--_switch-track-height) * 2);
  --_switch-thumb-size: calc(var(--_switch-track-height) - 4px);

  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  inline-size: max(var(--_switch-target), var(--_switch-track-width));
  block-size: var(--_switch-target);
  min-inline-size: max(var(--_switch-target), var(--_switch-track-width));
  min-block-size: var(--_switch-target);
  flex: none;
  vertical-align: middle;
  box-sizing: border-box;
}

.root[data-size="xs"] {
  --_switch-target: var(--control-height-xs, 1.75rem);
  --_switch-track-height: var(--control-icon-size-xs, 0.875rem);
}
.root[data-size="sm"] {
  --_switch-target: var(--control-height-sm, 2rem);
  --_switch-track-height: var(--control-icon-size-sm, 1rem);
}
.root[data-size="md"] {
  --_switch-target: var(--control-height-md, 2.25rem);
  --_switch-track-height: var(--control-icon-size-md, 1rem);
}
.root[data-size="lg"] {
  --_switch-target: var(--control-height-lg, 2.5rem);
  --_switch-track-height: var(--control-icon-size-lg, 1.125rem);
}
.root[data-size="xl"] {
  --_switch-target: var(--control-height-xl, 3rem);
  --_switch-track-height: var(--control-icon-size-xl, 1.25rem);
}
.root[data-size="2xl"] {
  --_switch-target: var(--control-height-2xl, 3.5rem);
  --_switch-track-height: var(--control-icon-size-2xl, 1.5rem);
}

.root[data-touch-target="comfortable"] {
  inline-size: max(var(--_switch-target), var(--_switch-track-width), var(--control-touch-target-min, 3rem));
  block-size: max(var(--_switch-target), var(--control-touch-target-min, 3rem));
  min-inline-size: max(var(--_switch-target), var(--_switch-track-width), var(--control-touch-target-min, 3rem));
  min-block-size: max(var(--_switch-target), var(--control-touch-target-min, 3rem));
}

@media (any-pointer: coarse) {
  .root[data-touch-target="auto"] {
    inline-size: max(var(--_switch-target), var(--_switch-track-width), var(--control-touch-target-min, 3rem));
    block-size: max(var(--_switch-target), var(--control-touch-target-min, 3rem));
    min-inline-size: max(var(--_switch-target), var(--_switch-track-width), var(--control-touch-target-min, 3rem));
    min-block-size: max(var(--_switch-target), var(--control-touch-target-min, 3rem));
  }
}

.input {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  block-size: 100%;
  margin: 0;
  padding: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
  box-sizing: border-box;
}

.track {
  --_switch-thumb-color: var(--color-text-secondary);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  inline-size: var(--_switch-track-width);
  block-size: var(--_switch-track-height);
  padding: 1px;
  border: 1px solid var(--color-border-control);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-surface);
  box-sizing: border-box;
  pointer-events: none;
  transition:
    background-color var(--motion-duration-fast) var(--motion-ease-standard),
    border-color var(--motion-duration-fast) var(--motion-ease-standard);
}

.thumb {
  flex: none;
  inline-size: var(--_switch-thumb-size);
  block-size: var(--_switch-thumb-size);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--_switch-thumb-color);
  pointer-events: none;
  transition: background-color var(--motion-duration-fast) var(--motion-ease-standard);
}

.input:where(:checked) + .track {
  justify-content: flex-end;
}
.input:where(:not(:checked):hover:not(:disabled)) + .track {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-control);
}
.input:where(:checked:not(:disabled)) + .track {
  --_switch-thumb-color: var(--color-primary-foreground);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}
.input:where(:checked:hover:not(:disabled)) + .track {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}
.input:where(:focus-visible:not(:disabled)) + .track {
  outline: var(--focus-ring-width, 2px) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset, 2px);
}
.input:where([aria-invalid="true"]:not(:checked):not(:disabled)) + .track {
  border-color: var(--color-danger);
}
.input:where([aria-invalid="true"]:not(:checked):hover:not(:disabled)) + .track {
  background-color: var(--color-surface-hover);
  border-color: var(--color-danger);
}
.input:where([aria-invalid="true"]:checked:not(:disabled)) + .track {
  --_switch-thumb-color: var(--color-danger-foreground);
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}
.input:where([aria-invalid="true"]:focus-visible:not(:disabled)) + .track {
  outline-color: var(--color-danger);
}
.input:where(:disabled) {
  cursor: not-allowed;
}
.input:where(:disabled) + .track {
  --_switch-thumb-color: var(--color-text-disabled);
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  outline: none;
}

@media (prefers-reduced-motion: reduce) {
  .track, .thumb { transition: none; }
}

@media (forced-colors: active) {
  .track { forced-color-adjust: none; }
  .input:where(:not(:disabled):not(:checked)) + .track {
    --_switch-thumb-color: CanvasText;
    background-color: Canvas;
    border-color: CanvasText;
  }
  .input:where(:not(:disabled):checked) + .track {
    --_switch-thumb-color: HighlightText;
    background-color: Highlight;
    border-color: Highlight;
  }
  .input:where([aria-invalid="true"]:not(:disabled):not(:checked)) + .track {
    --_switch-thumb-color: CanvasText;
    background-color: Canvas;
    border-color: Highlight;
  }
  .input:where(:focus-visible:not(:disabled)) + .track {
    outline-color: Highlight;
  }
  .input:where(:disabled) + .track {
    --_switch-thumb-color: GrayText;
    background-color: Canvas;
    border-color: GrayText;
    outline: none;
  }
}
```

## 7. Accessible composition and forms

```tsx
const id = useId();
const helpId = `${id}-help`;

<div className={styles.optionRow}>
  <Switch id={id} name="product-updates" value="enabled" aria-describedby={helpId} />
  <label htmlFor={id}>{t('settings.productUpdates.label')}</label>
</div>
<p id={helpId}>{t('settings.productUpdates.help')}</p>
```

- Clicking the label and pressing Space toggle an enabled switch; Enter does not toggle it. Focus and Tab remain native. Disabled switches cannot be activated.
- A checked, enabled, named switch contributes its native `name` and `value` to `FormData`; unchecked or disabled switches contribute no entry. Use explicit values in examples. Native checkbox default value behavior remains available if callers omit `value`.
- `required` is native checkbox validation: if required, the checkbox must be checked for a valid form. Do not add automatic error styling before the application chooses to show an error.
- `form.reset()` restores an uncontrolled switch's `defaultChecked`. A controlled caller owns reset of its state. A fieldset can disable descendants natively; styles must follow the actual input's `:disabled` state, including inherited fieldset disabling.
- For an immediate setting, saving, failure handling, optimistic behavior, and persistence remain the application's responsibility.

## 8. Gallery and localization

Create the connected gallery under `components/patterns/switch-gallery/` with localized Dashboard/Website routes and metadata. Use `useId()`-derived IDs where gallery instances could repeat. All visible presentation text—including state names, button labels, descriptions, status/error messages, theme labels, and metadata—comes from EN/FR/AR dictionaries. Store status IDs, not translated strings, so changing locale updates feedback without resetting switch state.

Include:

1. Omitted product-default example and external label.
2. All six sizes, with default-size geometry parity specimens.
3. Controlled setting with readable current state.
4. Uncontrolled setting with native reset.
5. Off/on, hover/focus, invalid and disabled combinations.
6. Help text and state-driven error association; no error on untouched controls.
7. Independent switches and a native disabled-fieldset example.
8. EN/FR/AR, explicit RTL, long wrapping labels, and isolated LTR technical IDs where used.
9. Active light/dark theme specimens and fine/coarse/comfortable targets. Use real theme tokens, not fixed dark boxes inheriting light tokens.
10. A local form demo with checked/unchecked payload, explicit validation, and reset. If submission is simulated asynchronously, guard duplicate requests, cancel timers on reset/unmount, and keep reset available while pending.
11. Copyable usage examples.

Use logical layout and permit label wrapping without shrinking the interaction target. Check 320px/mobile, enlarged text, and both directions for overflow, clipped focus, and overlapping targets.

## 9. Acceptance tests

### Component/unit tests

- Native input type and role, input ref, prop destinations, accessible label, and no manually supplied `aria-checked` or duplicate selection state.
- Controlled and uncontrolled changes, label activation, disabled behavior, Space and Enter behavior, and native fieldset disabling.
- Omitted and explicit size attributes; default and comfortable touch policies.
- FormData for checked, unchecked, disabled, and explicitly named/value-bearing switches; uncontrolled reset and caller-controlled reset.
- Native `required` validity before and after checking; `aria-invalid` is application-driven and does not appear merely because the input is required.

### Real-browser tests for Dashboard and Website

- Edge clicks on the native input's full reserved target; no pseudo hitbox and no neighboring target overlap.
- All six target, track, and thumb dimensions; off/on thumb placement and containment. Omitted versus explicit product-default parity for all geometry.
- Fine pointer, coarse `auto`, and `comfortable` target dimensions, including 2xl at 56px. Test actual `any-pointer: coarse`, not only primary `pointer: coarse`.
- Stable unchecked hover border; off/on/invalid/disabled precedence; visible keyboard focus outline; reduced motion.
- Full forced-colors matrix: off/on × valid/invalid × enabled/disabled, including rest, hover, focus where applicable, and pointer exit. Assert system background, border, thumb, and state distinction using computed colors.
- Native Space, Tab, label activation, disabled controls, controlled/uncontrolled form behavior, FormData and native reset. Test real native required validation through an actual form.
- LTR/RTL inline-start/end placement; EN/FR/AR locale changes preserve state and update all visible copy; long labels, 320px and enlarged text without horizontal overflow or clipped focus.
- Run `node scripts/sync-shared.mjs --check` and `node scripts/check-dashboard-shadows.mjs`.

Add the pending Radio browser regression for native required-group form validation separately; the existing gallery's application-level validation test is not a substitute.

## 10. Handoff

Author the shared implementation in Dashboard, synchronize it, and preserve the local Dashboard/Website product default aliases. Run relevant unit tests, typechecks, lint, builds, sync/shadow checks, and Dashboard/Website browser suites. Report commands, results, any skipped environments, and the exact pushed commit for source audit. Do not claim this reference implementation or its test matrix passed until actually run.

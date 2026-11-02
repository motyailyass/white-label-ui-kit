# Switch — Component Specification and Implementation Reference

> **Status:** Draft / Revised Baseline Specification (Pending Implementation Gate)  
> **Applies to:** Core UI Primitive (`components/ui/switch`)  
> **Starters:** Next.js Dashboard, Next.js Website, Vite Reference  
> **Canonical Source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/switch/`  
> **Mirrored Destination:** `typescript/nextjs/starterkit/website/src/components/ui/switch/`  
> **Related Controls:** [Checkbox Specification](./checkbox.md) · [Radio Specification](./radio.md) · [Button Specification](./button.md) · [Input Specification](./input.md)

---

## 1. Executive Summary & Architectural Scope

The `Switch` primitive is an individually labeled, binary on/off control, typically used for an immediate setting or preference that takes effect upon activation. A switch is not a substitute for a `Checkbox` (which captures selection or consent during a form submission lifecycle) or a `Radio` (which captures mutually exclusive choices across a group). The containing application decides when and how changes are persisted; the primitive never stores application state or performs network requests.

### 1.1 Inviolable Architectural Principles

1. **Native Checkbox Authority**: Built on `<input type="checkbox" role="switch">`. Native `checked` is the sole source of selection authority. No internal mirrored state, no custom proxy events, and no `aria-checked`.
2. **Real Interaction Hitbox**: The native `<input>` occupies 100% of the root interaction target container (`inset: 0`). The decorative track and thumb have `pointer-events: none` to eliminate pseudo-element hit-testing defects and ensure reliable edge clicks.
3. **Decoupled Geometry & Product Defaults**: Fine-pointer interaction targets are square (`28px` to `56px`), derived from `--control-height-*`. Track height is derived from `--control-icon-size-*`; track width is twice its height. Thumb diameter is track height minus 4px (1px border + 1px padding on each side). Omitted size consumes local product presets:
   - **Dashboard / Vite**: defaults to `md` (36 × 36px target, 32 × 16px track, 12px thumb).
   - **Website**: defaults to `xl` (48 × 48px target, 40 × 20px track, 16px thumb).
   Omitted and explicit product-default geometry match 100%.
4. **Immediate Position via Logical Flexbox**: The position change is **immediate** (no sliding animation, bounce, or scale transform). The track uses `display: flex; flex-direction: row; justify-content: flex-start` (off) and `justify-content: flex-end` (on). This provides automatic, native LTR/RTL support and correct behavior inside nested `dir="ltr"` / `dir="rtl"` contexts without custom transform calculations or brittle ancestor selectors.
5. **Color-Only Transitions**: Smooth transitions apply only to `background-color` and `border-color`. Under `prefers-reduced-motion: reduce`, all transitions collapse to `none`.
6. **Locked Semantic API at Type and Runtime**:
   - At the type level, `aria-checked?: never`, `aria-readonly?: never`, `role?: never`, and `readOnly?: never` prevent TypeScript callers from supplying conflicting or synthetic attributes.
   - At runtime, forbidden/unsupported attributes are filtered out before spreading `inputProps` onto the native input to protect against JavaScript or cast callers. Direct ref forwarding provides access to the underlying `HTMLInputElement`.
7. **Zero Dashboard Shadows**: Visual hierarchy is achieved strictly through borders and surfaces (`--color-surface`, `--color-border-control`, `--color-primary`, `--color-danger`). High-contrast mode uses system colors (`Highlight`, `CanvasText`, `GrayText`).

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SWITCH ARCHETYPE SUMMARY                        │
├────────────────────────────────────────────────────────────────────────┤
│  1. Pure Core UI Boundary: Zero context, zero i18n, zero hardcoded copy│
│  2. Honest Native Foundation: <input type="checkbox" role="switch">    │
│  3. Direct Ref Forwarding: Forwards ref to HTMLInputElement            │
│  4. Target vs. Track: Hitbox (36px/48px) decoupled from visible pill   │
│  5. Real Hitbox Target: Native input occupies 100% of root target area │
│  6. Six-Step Scale: xs (28px), sm (32px), md (36px), lg (40px),        │
│                     xl (48px), 2xl (56px)                              │
│  7. Product Defaults: Dashboard = md (36px), Website = xl (48px)       │
│  8. Immediate Logical Layout: flex-start (off) -> flex-end (on)        │
│  9. Specificity-Safe Precedence: Disabled > Invalid > Checked > Hover  │
│ 10. High-Contrast Ready: System Highlight & GrayText in forced-colors  │
│ 11. Keyboard Accessible: Native Space key activation & focus outline   │
│ 12. Zero Dashboard Shadows: 100% shadow-free depth via borders/surfaces│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Public API & Type Contract

### 2.1 Interface Definition

The public type interface strictly locks native switch semantics:

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface SwitchProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly' | 'role' | 'aria-checked' | 'aria-readonly'
    >,
    ControlSizingProps {
  /**
   * Explicitly forbidden to enforce native checked authority.
   * Native `checked` or `defaultChecked` is the sole source of truth.
   */
  'aria-checked'?: never;
  'aria-readonly'?: never;
  role?: never;
  readOnly?: never;
}
```

### 2.2 Prop Contracts & Attributes

| Prop | Type | Default | Destination | Description |
| :--- | :--- | :--- | :--- | :--- |
| `size` | `ControlSize` (`'xs'` \| `'sm'` \| `'md'` \| `'lg'` \| `'xl'` \| `'2xl'`) | `undefined` | Root `data-size` | Sizing step from the approved six-step scale. When omitted, inherits local product default (`md` Dashboard, `xl` Website). |
| `touchTarget` | `'auto'` \| `'comfortable'` | `'auto'` | Root `data-touch-target` | Target expansion policy. Expands target to $\ge$ 48px on coarse pointers (`auto`) or universally (`comfortable`). Preserves 2xl 56px target. |
| `checked` | `boolean` | `undefined` | Native `<input>` | Controlled boolean state. |
| `defaultChecked` | `boolean` | `undefined` | Native `<input>` | Uncontrolled initial boolean state. |
| `disabled` | `boolean` | `false` | Native `<input>` | Disables switch interaction and applies disabled visual styling. Follows inherited `<fieldset disabled>` state. |
| `required` | `boolean` | `false` | Native `<input>` | Native HTML form validation requirement (must be checked for valid form). Optional switches remain valid when off. |
| `id` | `string` | `undefined` | Native `<input>` | DOM ID for association with external `<label htmlFor={id}>` or `aria-describedby`. |
| `name` | `string` | `undefined` | Native `<input>` | Form control name included in `FormData` when checked and enabled. |
| `value` | `string` | `'on'` | Native `<input>` | Form control value submitted when checked. Defaults to browser standard `'on'`. |
| `className` | `string` | `undefined` | Outer `<span>` root | Custom CSS class applied to root layout container. |
| `style` | `CSSProperties` | `undefined` | Outer `<span>` root | Inline styles applied to root layout container. |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | `undefined` | Native `<input>` | Native change event callback. |

### 2.3 Explicitly Forbidden Props
- `role`: Callers cannot supply or override `role="switch"`. Hardcoded on the input and typed as `?: never`.
- `aria-checked`: Callers cannot supply synthetic checked attributes; native `checked` is authoritative. Typed as `?: never`.
- `aria-readonly` / `readOnly`: In HTML, checkboxes and switches are binary toggles without partial read-only state. Typed as `?: never`.
- `onValueChange`: React standard `onChange` is used.
- `indeterminate`: Switch is strictly binary, never mixed.

---

## 3. Geometry, Sizing Scale & Product Defaults

### 3.1 Six-Step Token Scale Matrix

All geometry derives from existing product-owned tokens:
- **Target Box**: `--control-height-*` (square target hitbox: $W = H = \text{target}$)
- **Track Height**: `--control-icon-size-*`
- **Track Width**: $2 \times \text{Track Height}$
- **Thumb Diameter**: $\text{Track Height} - 4\text{px}$ (accounts for 1px border + 1px padding on each side)
- **Track Padding**: `1px`
- **Track Border**: `1px solid`
- **Thumb Inset**: `1px padding + 1px border = 2px` from the track's outer edge at both resting positions.

| Size | Fine-Pointer Target | Visible Track ($W \times H$) | Thumb Diameter | Track Padding | Inset (Border + Padding) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `xs` | 28 × 28px (`1.75rem`) | 28 × 14px (`1.75rem × 0.875rem`) | 10px (`0.625rem`) | 1px | 2px from outer edge |
| `sm` | 32 × 32px (`2.00rem`) | 32 × 16px (`2.00rem × 1.000rem`) | 12px (`0.750rem`) | 1px | 2px from outer edge |
| `md` *(Dash def)* | 36 × 36px (`2.25rem`) | 32 × 16px (`2.00rem × 1.000rem`) | 12px (`0.750rem`) | 1px | 2px from outer edge |
| `lg` | 40 × 40px (`2.50rem`) | 36 × 18px (`2.25rem × 1.125rem`) | 14px (`0.875rem`) | 1px | 2px from outer edge |
| `xl` *(Web def)* | 48 × 48px (`3.00rem`) | 40 × 20px (`2.50rem × 1.250rem`) | 16px (`1.000rem`) | 1px | 2px from outer edge |
| `2xl` | 56 × 56px (`3.50rem`) | 48 × 24px (`3.00rem × 1.500rem`) | 20px (`1.250rem`) | 1px | 2px from outer edge |

*Note on Track Width vs. Target Box:*
In this approved scale, track width is always $\le$ target box width ($28 \le 28$, $32 \le 32$, $32 \le 36$, $36 \le 40$, $40 \le 48$, $48 \le 56$). Consequently, the fine-pointer interaction target is **strictly square** across all six sizes, matching the documented target dimensions with zero mismatch.

### 3.2 Product Defaults & Parity

When `size` is omitted:
- **Dashboard & Vite**: Consumes `--control-height-default` (`--control-height-md` = 36px) and `--control-icon-size-default` (`--control-icon-size-md` = 16px). Omitted size renders **identically** to explicit `size="md"` (36 × 36px target, 32 × 16px track, 12px thumb).
- **Website**: Consumes `--control-height-default` (`--control-height-xl` = 48px) and `--control-icon-size-default` (`--control-icon-size-xl` = 20px). Omitted size renders **identically** to explicit `size="xl"` (48 × 48px target, 40 × 20px track, 16px thumb).

### 3.3 Touch Target Expansion Policy

Interaction target expansion decouples the clickable area from the visible track without resizing the decorative track or clipping adjacent elements:
- `touchTarget="comfortable"`: Expands the root dimensions to $\max(\text{target}, \text{track-width}, \text{touch-min})$.
  - For `xs`, `sm`, `md`, `lg`: Expands to at least 48 × 48px (`--control-touch-target-min: 3rem`).
  - For `xl`: Already 48 × 48px.
  - For `2xl`: Preserves full 56 × 56px (`3.5rem`) target size ($\max(3.5\text{rem}, 3\text{rem}) = 3.5\text{rem}$).
- `@media (any-pointer: coarse)`: Applies the same comfortable minimum target expansion when `touchTarget="auto"`.

---

## 4. Visual States, Precedence & Motion

### 4.1 State Styling Matrix

| State | Track Background | Track Border | Thumb Background | Outline |
| :--- | :--- | :--- | :--- | :--- |
| **Off (Resting)** | `--color-surface` | `1px solid var(--color-border-control)` | `--color-text-secondary` | `none` |
| **Off (Hover)** | `--color-surface-hover` | `1px solid var(--color-border-control)` (stable) | `--color-text-secondary` | `none` |
| **On (Resting)** | `--color-primary` | `1px solid var(--color-primary)` | `--color-primary-foreground` | `none` |
| **On (Hover)** | `--color-primary-hover` | `1px solid var(--color-primary-hover)` | `--color-primary-foreground` | `none` |
| **Focus-Visible** | Inherits state background | Inherits state border | Inherits state thumb | `2px solid var(--color-border-focus)`, offset 2px |
| **Invalid (Off)** | `--color-surface` | `1px solid var(--color-danger)` | `--color-text-secondary` | `none` |
| **Invalid (On)** | `--color-danger` | `1px solid var(--color-danger)` | `--color-danger-foreground` | `none` |
| **Invalid (Hover)** | Off keeps `--color-surface-hover`; on remains `--color-danger` | `1px solid var(--color-danger)` | Inherits state thumb | `none` |
| **Disabled** | `--color-control-disabled-bg` | `1px solid var(--color-border-disabled)` | `--color-text-disabled` | `none` |

### 4.2 State Precedence Cascade

```
Disabled (Top Precedence - overrides all, including invalid & hover)
  ↓
Invalid (Overrides ordinary checked/unchecked border and focus outline)
  ↓
Checked / On
  ↓
Hover (Preserves stable border on unchecked; changes background only)
  ↓
Resting Base
```

### 4.3 Directional Layout & Immediate State Change

- **No sliding animation**: Thumb transitions position immediately without translation distance calculations, easing curves, or bounce.
- **Flexbox logical alignment**:
  - Off: `justify-content: flex-start` places thumb at inline-start (left in LTR, right in RTL).
  - On: `justify-content: flex-end` places thumb at inline-end (right in LTR, left in RTL).
- **Nested Direction Parity**: Because flex row layout naturally respects document and container inline direction, nested `<div dir="ltr">` inside an RTL document automatically positions correctly without incorrect outer-ancestor selector overrides.
- **Equal End Insets**: The thumb has 1px padding plus a 1px border (2px from the track's outer edge) at both inline-start and inline-end positions.
- **Color transitions**: `transition: background-color var(--motion-duration-fast) var(--motion-ease-standard), border-color ...` applies to track and thumb.
- **Reduced motion**: Under `prefers-reduced-motion: reduce`, all transitions collapse to `none`.

---

## 5. High-Contrast / Forced-Colors Mode

In `@media (forced-colors: active)`:
- System colors override palette tokens unconditionally.
- `forced-color-adjust: none` is set on the track so system colors apply deterministically.
- Selector specificity is structured (using `:where()` or explicit compound selectors) so forced-color rules always win over ordinary state selectors.

| State | Track Background | Track Border | Thumb Background | Outline |
| :--- | :--- | :--- | :--- | :--- |
| **Enabled Off** | `Canvas` | `CanvasText` | `CanvasText` at inline-start | `none` |
| **Enabled On** | `Highlight` | `Highlight` | `HighlightText` at inline-end | `none` |
| **Invalid Off** | `Canvas` | `Highlight` | `CanvasText` | `none` |
| **Invalid On** | `Highlight` | `Highlight` | `HighlightText` | `none` |
| **Focus-Visible** | Inherits state | Inherits state | Inherits state | `Highlight` outline |
| **Disabled (Off/On/Invalid)** | `Canvas` | `GrayText` | `GrayText` at corresponding position | `none` |

*Precedence Guarantee:* Disabled state unconditionally renders with `Canvas` background and `GrayText` border/thumb, regardless of whether it is checked, invalid, or hovered.

---

## 6. Implementation Reference

### 6.1 `switch.tsx`

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
    ControlSizingProps {
  /**
   * Explicitly forbidden to enforce native checked authority.
   * Native `checked` or `defaultChecked` is the sole source of truth.
   */
  'aria-checked'?: never;
  'aria-readonly'?: never;
  role?: never;
  readOnly?: never;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    size,
    touchTarget = 'auto',
    className,
    style,
    // Filter unsupported / forbidden attributes before runtime spread
    'aria-checked': _ignoredAriaChecked,
    'aria-readonly': _ignoredAriaReadonly,
    role: _ignoredRole,
    readOnly: _ignoredReadOnly,
    ...inputProps
  },
  forwardedRef,
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
        ref={forwardedRef}
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

### 6.2 `switch.module.css`

```css
/*
 * Switch Component Stylesheet
 *
 * Core UI Primitive: 100% logical CSS properties, zero shadows in dashboard.
 * Decouples minimum interaction target from visible pill track.
 */

.root {
  /* Default density aliases (Dashboard defaults to md) */
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

/* Six-Step Density Overrides */
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

/* Touch-Target Policy */
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

/* Native Input (Spans 100% of Hitbox Target Area) */
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

/* Visible Pill Track */
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

/* Circular Thumb */
.thumb {
  flex: none;
  inline-size: var(--_switch-thumb-size);
  block-size: var(--_switch-thumb-size);
  border-radius: var(--radius-full, 9999px);
  background-color: var(--_switch-thumb-color);
  pointer-events: none;
  transition: background-color var(--motion-duration-fast) var(--motion-ease-standard);
}

/* Immediate Position Change via Logical Flexbox */
.input:where(:checked) + .track {
  justify-content: flex-end;
}

/* Hover State (Stable Border Principle) */
.input:where(:not(:checked):hover:not(:disabled)) + .track {
  background-color: var(--color-surface-hover);
  border-color: var(--color-border-control);
}

/* Checked State */
.input:where(:checked:not(:disabled)) + .track {
  --_switch-thumb-color: var(--color-primary-foreground);
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.input:where(:checked:hover:not(:disabled)) + .track {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

/* Focus-Visible Outline */
.input:where(:focus-visible:not(:disabled)) + .track {
  outline: var(--focus-ring-width, 2px) solid var(--color-border-focus);
  outline-offset: var(--focus-ring-offset, 2px);
}

/* Invalid State */
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

.input:where([aria-invalid="true"]:checked:hover:not(:disabled)) + .track {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
}

.input:where([aria-invalid="true"]:focus-visible:not(:disabled)) + .track {
  outline-color: var(--color-danger);
}

/* Disabled State (Highest Precedence) */
.input:where(:disabled) {
  cursor: not-allowed;
}

.input:where(:disabled) + .track {
  --_switch-thumb-color: var(--color-text-disabled);
  background-color: var(--color-control-disabled-bg);
  border-color: var(--color-border-disabled);
  outline: none;
}

/* Reduced Motion Guarantee */
@media (prefers-reduced-motion: reduce) {
  .track,
  .thumb {
    transition: none;
  }
}

/* Forced Colors Mode (High Contrast Accessibility) */
@media (forced-colors: active) {
  .track {
    forced-color-adjust: none;
  }

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

  .input:where([aria-invalid="true"]:not(:disabled):checked) + .track {
    --_switch-thumb-color: HighlightText;
    background-color: Highlight;
    border-color: Highlight;
  }

  .input:where(:focus-visible:not(:disabled)) + .track {
    outline-color: Highlight;
  }

  /* Disabled State: Highest Precedence (GrayText Always Wins) */
  .input:where(:disabled) + .track {
    --_switch-thumb-color: GrayText;
    background-color: Canvas;
    border-color: GrayText;
    outline: none;
  }
}
```

---

## 7. Connected Pattern Specification (`SwitchGallery`)

The pattern `SwitchGallery` (`components/patterns/switch-gallery/`) demonstrates:
1. **Overview & Product Defaults**: Demonstrates omitted size consuming local product defaults (`md` in Dashboard, `xl` in Website).
2. **Six-Step Sizing Scale**: Renders `xs`, `sm`, `md`, `lg`, `xl`, and `2xl` with default-size geometry parity specimens.
3. **Controlled Mode**: Demonstrates `checked` and `onChange` with readable live state feedback.
4. **Uncontrolled Mode & Form Reset**: Demonstrates `defaultChecked` restoring initial values upon native form reset.
5. **Operational States & Combined Precedence**: Demonstrates resting unchecked, resting checked, hover, disabled unchecked, disabled checked, invalid unchecked, invalid checked, and invalid disabled.
6. **Required Validation & Accessible Relationships**:
   - Optional setting switches start off and remain **valid** without errors.
   - Required switch example starts clean (`requiredError: false`).
   - Triggering validation action sets error only if unchecked.
   - Checking the switch clears the error immediately.
7. **Independent Switches & Disabled Fieldset**: Demonstrates independent switch toggles and native inheritance of `<fieldset disabled>`.
8. **Localization, RTL & Long Labels**:
   - Complete EN, FR, and AR dictionaries driving all presentation text, state labels, descriptions, and route metadata (`metaTitle`, `metaDescription`).
   - Stable accessible labels linked via `<label htmlFor={id}>`.
   - Arabic specimen in `<div dir="rtl">` testing natural inline-start/end placement.
   - Nested `<div dir="ltr">` inside RTL region testing correct direction restoration.
   - Mixed LTR technical ID isolated via `<BidiText dir="ltr">SENS-84920-X</BidiText>`.
   - Multi-line wrapping text preserving target hitbox dimensions without clipping.
   - Locale switching preserves switch checked/unchecked state without resets (storing status IDs rather than localized strings).
9. **Touch Targets & Active Theme Parity**: Demonstrates comfortable touch targets (min 48px) and active theme specimen cards using real scoped tokens with zero dashboard shadows.
10. **Form Submit & Reset Lifecycles**: Native form submission asserting `FormData` entries (`'on'` or explicit value when checked, omitted when unchecked or disabled), pending simulation timer, and timer cancellation on reset/unmount.
11. **Code Usage Examples**: Copyable snippets for standard uncontrolled and controlled usage.

---

## 8. Comprehensive Verification Matrix

### 8.1 Component Unit Tests (`switch.test.tsx`)

- [ ] **Semantic HTML & Ref**: Renders `<input type="checkbox" role="switch">`, forwards ref to `HTMLInputElement`, locks `type` and `role`.
- [ ] **Type & Runtime ARIA Locking**:
  - Rejects `aria-checked`, `aria-readonly`, `role`, and `readOnly` at compile time via TypeScript `?: never` definitions.
  - Filters out `aria-checked`, `aria-readonly`, `role`, and `readOnly` at runtime before spreading onto the native `<input>`.
- [ ] **Sizing Attributes**: Correctly applies `data-size` across all six scale steps (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`), and preserves omitted size for CSS default aliases.
- [ ] **Touch Target Attribute**: Correctly applies `data-touch-target="comfortable"` and defaults to `"auto"`.
- [ ] **Controlled & Uncontrolled State**: Toggles on and off; fires `onChange` with updated `checked` value; supports `defaultChecked`.
- [ ] **Keyboard Activation**: Toggles on Space key; does **not** toggle on Enter key.
- [ ] **External Label Activation**: Toggles when clicking associated `<label htmlFor={id}>`.
- [ ] **Disabled & Fieldset Inheritance**: Suppresses clicks and events when `disabled`; respects inherited `<fieldset disabled>`.
- [ ] **Native Required Validation**: Optional switch is valid when off; required switch is invalid when unchecked and valid when checked.
- [ ] **FormData & Lifecycle**: Included in `FormData` when checked (`'on'` or custom value); omitted when unchecked; omitted when disabled; restored by `form.reset()`.
- [ ] **ARIA Relationships**: Correctly forwards `aria-invalid` and `aria-describedby`.

### 8.2 Real-Browser Playwright Suites (`e2e/switch.spec.ts`)

- [ ] **Real Hitbox Edge Clicks**: Clicks at target corners (`x: 1, y: 1` and `x: width - 1, y: height - 1`) activate the switch.
- [ ] **Target Box Dimensions**: Square targets across all six sizes (28, 32, 36, 40, 48, 56px).
- [ ] **Default Parity**: Omitted size matches explicit `md` on Dashboard and explicit `xl` on Website across target, track, thumb, and border.
- [ ] **Coarse & Comfortable Target**: Minimum 48 × 48px under coarse pointer or `comfortable`, while explicit `2xl` retains full 56 × 56px.
- [ ] **Hover Border Stability**: Unchecked hover maintains stable 1px border.
- [ ] **Immediate Position & End Insets**: Thumb has 1px padding plus a 1px border (2px from the track's outer edge) at both inline-start (off) and inline-end (on) positions; position changes immediately without sliding animation.
- [ ] **LTR, RTL & Nested Direction**:
  - LTR off = inline-start (left), on = inline-end (right).
  - RTL off = inline-start (right), on = inline-end (left).
  - Nested `dir="ltr"` inside RTL document restores correct LTR alignment without thumb escaping track.
- [ ] **Forced Colors High Contrast**: Full matrix of off/on × valid/invalid × enabled/disabled tested at rest, hover, focus, and pointer exit. Disabled state always renders `GrayText` border and thumb.
- [ ] **State-Driven Required Validation**: Starts clean; triggers error on validate action; clears on check.
- [ ] **Form Submission & Reset**: Submits correct payload; simulates pending/success timer; cleans up timer on reset.
- [ ] **Zero Dashboard Shadows**: 100% shadow-free verification.
- [ ] **Localization & State Preservation**: Complete EN/FR/AR dictionaries and route metadata verified; changing locale preserves switch checked/unchecked state and updates all visible copy without reset.
- [ ] **Responsive Reflow**: Clean layout without horizontal clipping at 320, 375, 768, and 1280px viewports.

---

## 9. Handoff & Governance Checklist

- [ ] Shared Switch implementation authored canonically in Dashboard (`typescript/nextjs/starterkit/dashboard/src/components/ui/switch/`) and synchronized via `node scripts/sync-shared.mjs`.
- [ ] Local Dashboard (`md` / 36px) and Website (`xl` / 48px) product default aliases preserved.
- [ ] `node scripts/sync-shared.mjs --check` passes with zero drift.
- [ ] `node scripts/check-dashboard-shadows.mjs` passes (100% shadow-free in Dashboard).
- [ ] `tsc --noEmit` and `oxlint` pass across Dashboard, Website, and Vite.
- [ ] Vitest unit suites pass across Dashboard, Website, and Vite.
- [ ] Playwright browser suites pass in Dashboard and Website.
- [ ] **Radio native required-form browser regression** implemented and verified separately.

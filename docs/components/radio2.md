# Radio — Implementation Specification

**Build the native `Radio` primitive and its demonstration gallery next.** Use the established Checkbox architecture, but preserve radio-specific grouping, keyboard, and form behavior.

The remaining Checkbox forced-colors correction stays open for review with this implementation’s next push.

## 1. Scope and architecture

### Deliver now

- `components/ui/radio/`
    - `radio.tsx`
    - `radio.module.css`
    - `radio.test.tsx`
    - `index.ts`
- Connected `components/patterns/radio-gallery/`.
- `/gallery/radio` routes in Dashboard and Website.
- EN/FR/AR dictionaries and localized route metadata.
- Dashboard and Website browser regression suites.
- Canonical synchronization to Website and Vite.

### Do not introduce yet

- A stateful `RadioGroup` component or context.
- Custom arrow-key navigation or roving-tabindex logic.
- Integrated labels, descriptions, errors, or option arrays.
- Button-style segmented controls, selectable cards, or payment-option composites.
- Read-only simulation, loading state, or indeterminate state.

**Grouping is initially native:** inputs share a `name`, and the caller supplies `<fieldset>` and `<legend>`.

## 2. Public API

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface RadioProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {}
```

| Property | Contract |
| --- | --- |
| `type` | Locked to `"radio"` |
| `size` | Omitted by default; consumes product aliases |
| `touchTarget` | `"auto"` by default |
| `checked` | Caller-controlled selection |
| `defaultChecked` | Native uncontrolled initial selection |
| `name` | Shared by options belonging to one native group |
| `value` | Explicit option value supplied by the caller |
| `disabled` | Native disabled behavior |
| `required` | Native radio-group constraint validation |
| `ref` | Directly references `HTMLInputElement` |

Forward native events, form attributes, and ARIA attributes without rewriting them.

### Attribute destinations

Keep the Checkbox convention:

- `className`, `style`, `data-size`, and touch-target presentation → structural root.
- `id`, `name`, `value`, `checked`, `required`, `disabled`, events, accessible naming/descriptions, and consumer test identifiers → native input.
- Decorative indicator → `aria-hidden="true"`.

Do not add `onValueChange`, `selected`, `invalid`, `options`, or `label` props.

## 3. Markup and native interaction

Use this structural model:

```html
<span class="root">
  <input type="radio" class="input" />
  <span class="indicator" aria-hidden="true">
    <span class="dot"></span>
  </span>
</span>
```

- The root reserves the complete interaction target.
- The transparent native input fills that target.
- The visible circle is centered inside it.
- Decorative elements use `pointer-events: none`.
- Never use a noninteractive pseudo-element to claim a larger hitbox.
- Do not hide the input with `display: none`, `visibility: hidden`, or an off-screen technique.

### Selection authority

Use native `:checked` to reveal the dot. Do not maintain a parallel React selection state or prop-derived visual attribute inside the primitive.

Do not add redundant `role="radio"` or `aria-checked` to the native input.

## 4. Geometry and tokens

Use the approved control scale:

| Size | Fine-pointer target | Visible circle |
| --- | --- | --- |
| `xs` | 28px | 14px |
| `sm` | 32px | 16px |
| `md` | 36px | 16px |
| `lg` | 40px | 18px |
| `xl` | 48px | 20px |
| `2xl` | 56px | 24px |

### Token bindings

- Target → existing `--control-height-*`.
- Visible circle → existing `--control-icon-size-*`.
- Omitted size → corresponding `*-default` aliases.
- Circle and dot → circular geometry, not the Checkbox’s square radius.
- Proposed dot diameter → **50% of the visible circle’s outer diameter**, expressed consistently through the scoped size variable.

The dot is a simple CSS shape. It does **not** need an SVG or registry entry.

Do not reuse the Checkbox glyph scale automatically: that scale sizes check/minus artwork, not necessarily a radio dot.

### Product defaults

- Dashboard: omitted size equals explicit `md`.
- Website: omitted size equals explicit `xl`.

Parity must cover the target, circle, dot, border width, and alignment—not only the outer target.

### Touch policy

- Fine pointer + `auto`: scale target.
- `comfortable`: minimum 48×48px.
- `auto` + `@media (any-pointer: coarse)`: minimum 48×48px.
- Preserve the larger 56px target.
- Expand layout and the actual input together, avoiding overlapping neighboring targets.

## 5. Visual-state contract

| State | Circle | Dot / focus |
| --- | --- | --- |
| Unchecked | Control surface, control border | Dot hidden |
| Unchecked hover | Existing hover surface; border stable | Dot hidden |
| Checked | Primary fill and matching border | Primary foreground dot |
| Checked hover | Primary-hover fill and matching border | Dot remains visible |
| Keyboard focus | Preserve selection styling | Immediate focus outline |
| Invalid unchecked | Danger border; unchecked surface | Danger focus outline |
| Invalid checked | Danger fill and border | Danger foreground dot |
| Disabled unchecked | Disabled surface and border | Dot hidden |
| Disabled checked | Disabled surface and border | Disabled foreground dot visible |

**Precedence:** disabled → invalid → selected → hover.

Additional requirements:

- Constant 1px border; no layout shift.
- No independent contrasting hover-border emphasis.
- No Dashboard shadows.
- No bounce, scale, or sliding-dot animation.
- Focus outline must not animate or disappear on pointer exit.
- Reduced-motion support for any retained color/opacity transitions.

### Forced colors

Use system colors with explicit combined-state coverage.

Verify at rest, hover, and keyboard focus:

- Checked and unchecked.
- Invalid + checked.
- Invalid + unchecked.
- Disabled + checked.
- Disabled + unchecked.
- Disabled + invalid.

**Do not repeat Checkbox’s specificity issue:** adding a forced-colors block is insufficient if ordinary selectors still win.

## 6. Native grouping and keyboard behavior

A group consists of radios with the same `name` and the appropriate native form ownership.

Preserve browser-native behavior:

- Selecting one option deselects another in the group.
- Clicking the selected option does not clear the group.
- Space selects the focused option.
- Arrow navigation follows native browser behavior.
- Tab enters/leaves the native group without creating an extra tab stop for every option.
- Disabled options are not selectable through normal interaction.

Do not intercept arrow keys, invert them manually for RTL, or implement Enter-to-select behavior.

Test keyboard behavior in a real browser. Avoid imposing assumptions about reverse-Tab entry into a group with no selection.

## 7. Accessible field composition

Use external labels and native group semantics:

```tsx
const groupId = useId();
const emailId = `${groupId}-email`;
const smsId = `${groupId}-sms`;
const helpId = `${groupId}-help`;

<fieldset aria-describedby={helpId}>
  <legend>{t('common.radioGallery.channelLegend')}</legend>

  <div className={styles.optionRow}>
    <Radio
      id={emailId}
      name={`${groupId}-channel`}
      value="email"
      defaultChecked
    />
    <label htmlFor={emailId}>
      {t('common.radioGallery.emailLabel')}
    </label>
  </div>

  <div className={styles.optionRow}>
    <Radio
      id={smsId}
      name={`${groupId}-channel`}
      value="sms"
    />
    <label htmlFor={smsId}>
      {t('common.radioGallery.smsLabel')}
    </label>
  </div>

  <p id={helpId}>{t('common.radioGallery.channelHelp')}</p>
</fieldset>
```

- Generate unique IDs and group names for reusable gallery instances.
- Separate unrelated groups with different names.
- Associate helper/error text with the group and relevant controls.
- Do not reference missing description elements.
- Do not automatically attach `role="alert"` to static specimen errors.
- Clearly distinguish native `required` validation from application-driven `aria-invalid`.
- Do not show danger styling on untouched required groups merely because `:invalid` matches.

## 8. Form and state lifecycle

### Controlled

The caller owns one selected value and derives each option’s `checked` state. The primitive does not mirror it internally.

### Uncontrolled

The browser owns selection through `defaultChecked`.

### Submission/reset

Test that:

- Only the selected, enabled, named option contributes its value.
- An unselected group contributes no entry.
- A disabled selected option is omitted.
- Native reset restores uncontrolled defaults.
- Controlled reset is explicitly handled by the caller.
- Required-group submission is blocked when no valid selection exists.

Gallery simulations must guard duplicate pending submits and cancel timers on reset/unmount. Reset must remain usable during pending submission.

## 9. Localization and responsive behavior

- Translate every visible gallery label, state, explanation, and feedback message.
- Resolve feedback identifiers during rendering.
- Preserve user selection when switching locale.
- Use logical layout properties and `gap`.
- Let option rows follow inherited document direction.
- Use an explicitly RTL container for the Arabic specimen.
- Do not mirror circular indicators.
- Allow long labels to wrap without shrinking the interaction target.
- Verify 320px width, mobile width, and enlarged text without document overflow or clipped focus outlines.

## 10. Gallery and acceptance tests

Include these gallery sections:

1. Product default.
2. Six-step scale.
3. Controlled group.
4. Uncontrolled group and reset.
5. Operational and combined states.
6. Required validation and help/error relationships.
7. Independent groups.
8. EN/FR/AR and long labels.
9. Light/dark and touch targets.
10. Local form demonstration.
11. Usage snippets.

**Mandatory regression coverage:**

- Native input/ref/attribute forwarding.
- Label activation and real target edge clicks.
- Same-group exclusivity and independent-group isolation.
- Space, arrow navigation, and disabled-option behavior.
- Native form payload and reset.
- Default-versus-explicit geometry.
- Dot centering and containment across all sizes.
- Hover/focus/invalid/disabled precedence.
- Forced-colors combinations.
- RTL placement and narrow-screen reflow.

**Implementation boundary:** author canonically in Dashboard, synchronize shared files, and keep product-owned token defaults local. Deliver the implementation and verification evidence for audit before moving on to Switch.
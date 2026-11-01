**Yes—Checkbox is the right next component.** Below is the implementation specification to give your developer. It preserves the native-first architecture and the visual decisions already approved for Button, Input, and Textarea.

# Checkbox — Component Specification

**Status:** Proposed implementation contract
**Canonical location:** `dashboard/src/components/ui/checkbox/`
**Shared targets:** Next.js Website and Vite Dashboard
**Gallery route:** `/gallery/checkbox`

## 1. Purpose and scope

Checkbox represents an independent **selected / not-selected** choice.

Typical uses:

- Accepting terms.
- Enabling optional preferences.
- Selecting multiple independent items.
- A parent “Select all” control with a mixed state.

### Initial release includes

- Native `<input type="checkbox">`.
- Controlled and uncontrolled checked state.
- Indeterminate/mixed presentation.
- Disabled, required, invalid and keyboard-focus states.
- Native form participation.
- Registered check and minus icons.
- Product-owned sizing and touch targets.
- English, French and Arabic gallery compositions.

### Excluded

Do not add these to the primitive:

- Checkbox groups or selection management.
- “Select all” business logic.
- Tree selection.
- Switch/toggle behavior.
- Labels, descriptions, counters or validation messages.
- Form libraries, schema validation or persistence.
- Loading states.
- Edition or licensing checks.

**One Checkbox foundation serves every kit edition.**

---

## 2. Architecture and ownership

| Layer | Responsibility |
| --- | --- |
| `components/ui/checkbox` | Native checkbox, decorative indicator, sizing, styling, native ref |
| Field composition | Label, helper/error text, unique IDs and relationships |
| Connected pattern | Localization, application state, group behavior |
| Host application | Submission, server validation, authorization and persistence |

The primitive must not import providers, localization, routers or form libraries.

A small structural wrapper is justified here because the native input and registry-rendered indicator must coexist. **Do not copy Input’s “single element, no wrapper” restriction mechanically onto Checkbox.**

---

## 3. Public API

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface CheckboxProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'type' | 'size' | 'children' | 'readOnly'
    >,
    ControlSizingProps {
  /**
   * Displays the native mixed state.
   * Does not replace checked/defaultChecked.
   */
  indeterminate?: boolean;
}
```

### Defaults

| Property | Default |
| --- | --- |
| Native type | Always `checkbox` |
| `size` | Omitted; product alias |
| `touchTarget` | `auto` |
| `indeterminate` | `false` |
| `checked` / `defaultChecked` | Caller-owned |
| `disabled` | Native default |
| `required` | Native default |

### Preserve native attributes and events

Forward relevant attributes to the **input**, including:

- `id`, `name`, `value`, `form`.
- `checked`, `defaultChecked`.
- `disabled`, `required`.
- `onChange`, `onFocus`, `onBlur`, `onKeyDown`.
- `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-invalid`.
- `dir`, `lang`, and caller-supplied test attributes.

Forward the ref directly to **`HTMLInputElement`**, never the wrapper.

Do not introduce:

- `onCheckedChange`.
- `checked="mixed"`.
- `invalid`.
- `label`.
- `edition`.
- A fake `readOnly` behavior.

**HTML checkbox controls do not acquire read-only interaction behavior from `readOnly`.** Use disabled when appropriate, or specify a separate application interaction policy.

Document where `className` and `style` apply. Recommended: the structural root for layout/styling, while semantic attributes and events belong to the input. Do not silently spread every prop onto the wrapper.

---

## 4. Native interaction contract

### Controlled

```tsx
<Checkbox
  checked={selected}
  onChange={(event) => setSelected(event.currentTarget.checked)}
/>
```

### Uncontrolled

```tsx
<Checkbox
  name="notifications"
  value="enabled"
  defaultChecked
/>
```

Rules:

- Never pass `checked` and `defaultChecked` together.
- Never switch controlled/uncontrolled mode during the component lifetime.
- Do not duplicate checked state internally.
- Do not toggle manually in both `onClick` and `onChange`.
- Do not synthesize extra change events.
- Let native input activation drive the state.

### Keyboard

- **Tab:** focuses enabled checkboxes.
- **Space:** toggles the focused checkbox.
- **Enter:** do not implement a custom toggle.
- Do not add arrow-key navigation or roving focus to independent checkboxes.
- RTL does not change Space/Tab behavior.

---

## 5. Indeterminate state

Indeterminate is a **native DOM property**, not an HTML attribute:

```tsx
input.indeterminate = true;
```

The implementation must synchronize that property with `indeterminate` while preserving the forwarded native ref.

### Important distinctions

- `checked` determines checkedness and form submission.
- `indeterminate` determines mixed presentation.
- A checkbox can be indeterminate while its underlying checkedness is true or false.
- Display the mixed indicator in preference to the checkmark when indeterminate.
- Native activation can clear the DOM indeterminate state. The caller must update its selection model accordingly.

**Do not create a three-state click cycle inside the primitive.**

For a “Select all” example:

- None selected → unchecked.
- Some selected → indeterminate.
- All selected → checked.
- The caller calculates these states.

Use native `:checked` and `:indeterminate` for visual synchronization rather than maintaining a competing JavaScript visual-state model.

### Reset behavior

- Uncontrolled checked state resets to `defaultChecked`.
- Controlled checked state requires caller-owned reset handling.
- Do not assume native form reset also clears the indeterminate DOM property. The field/pattern must explicitly restore its intended mixed state.

---

## 6. DOM and visual structure

Conceptually:

```
Structural root
├── Native input[type="checkbox"]
└── Decorative visual indicator
    └── Registered check or minus icon
```

Requirements:

- The native input remains focusable and interactive.
- Do not use `display: none`, `visibility: hidden`, or `aria-hidden` on the input.
- The input occupies the real interaction target.
- The visible indicator is decorative and cannot intercept pointer events.
- Do not add `role="checkbox"` to the wrapper.
- Do not create a second focusable control.
- Do not override native checked semantics with contradictory `aria-checked`.

If the input is visually transparent, keyboard focus must still be shown clearly on the visible indicator through the input’s focus state.

---

## 7. Sizing: interaction target versus visible indicator

**These are separate dimensions.** Do not render a giant 36px or 48px checkbox square merely because those are the product control-target defaults.

The existing control and icon scales support this proposed mapping:[[1]](https://github.com/motyailyass/white-label-ui-kit/blob/4d2cbdffcb9da32726dedff2b1162e7090e7b2af/typescript/nextjs/starterkit/dashboard/src/styles/tokens/controls.css#L11-L62)

| Size | Minimum interaction target | Visible indicator |
| --- | --- | --- |
| `xs` | 28 × 28px | 14 × 14px |
| `sm` | 32 × 32px | 16 × 16px |
| `md` | 36 × 36px | 16 × 16px |
| `lg` | 40 × 40px | 18 × 18px |
| `xl` | 48 × 48px | 20 × 20px |
| `2xl` | 56 × 56px | 24 × 24px |

Pixel equivalents assume a 16px root font.

### Product defaults

- **Dashboard:** omitted size → `md` target and indicator aliases.
- **Website:** omitted size → `xl` target and indicator aliases.
- Explicit size meanings remain consistent across products.
- Omitted size must not silently emit `data-size="md"`.

### Token mapping

- Target → `--control-height-*`.
- Indicator → `--control-icon-size-*`.
- Product defaults → corresponding `*-default` aliases.
- Composition spacing → existing control-gap or spacing roles.

Label typography belongs to the external field composition. **Do not claim that Checkbox’s `size` automatically restyles an unrelated external label.**

### Radius

Recommended starting point: existing `--radius-sm` for the compact indicator.

Do not blindly apply the 6px/8px text-control radius to a 16px indicator if that makes it appear circular. Checkbox must remain visually distinguishable from Radio.

### Touch policy

- `comfortable`: at least 48 × 48px.
- `auto`: enforce that minimum under the existing coarse-pointer policy.
- Larger explicit targets remain larger.
- The native input must fill the target; do not fabricate an overlapping pseudo-element hitbox.

---

## 8. Visual states and precedence

**No independent hover-only border emphasis.**

| State | Expected presentation |
| --- | --- |
| Unchecked | Control background and control border |
| Checked | Primary fill, matching border, contrasting checkmark |
| Indeterminate | Primary fill, matching border, contrasting minus |
| Hover | No separate border-color change |
| Keyboard focus | Immediate visible outline |
| Invalid | Danger border; error text supplied externally |
| Disabled | Disabled surface, border and foreground roles |

Use existing semantic roles:

- `--color-control-bg`
- `--color-border-control`
- `--color-primary`
- `--color-primary-foreground`
- `--color-border-focus`
- `--color-danger`
- `--color-control-disabled-bg`
- `--color-border-disabled`
- `--color-text-disabled`

### Combined-state rules

- Mixed presentation takes precedence over the checkmark.
- Focus indication must remain visible when invalid.
- Invalid styling must not make the checked/mixed mark unreadable.
- Disabled checked/mixed controls must still communicate their selection state.
- Define disabled + invalid precedence explicitly.
- Keep border width constant.
- No scale/bounce animation or layout movement.
- No Dashboard shadows.

Native `required` validity must not automatically produce a red border on untouched first render. Application error styling is driven by `aria-invalid="true"`.

---

## 9. Icon registry requirements

Use:

```tsx
<Icon name="check" />
```

For mixed state, make one bounded registry addition:

```
Semantic name: minus
Vendor export: MinusSignIcon
Directional mirroring: none
```

`MinusSignIcon` exists in the installed Hugeicons package, but `minus` is not currently registered.

Requirements:

- Import the vendor export only inside `components/icons/registry.ts`.
- Synchronize the registry through the canonical process.
- Both indicator icons are decorative.
- Do not draw replacement ticks/dashes with Unicode, borders, text characters or data-URI artwork.
- Do not add several unnecessary aliases.

Size the **actual SVG**, not merely its surrounding slot.

---

## 10. Labels, errors and grouping

Every checkbox needs an accessible name.

Preferred composition:

```tsx
<label htmlFor={fieldId}>
  {t('preferences.emailUpdates')}
</label>

<Checkbox
  id={fieldId}
  name="emailUpdates"
  checked={enabled}
  onChange={(event) => setEnabled(event.currentTarget.checked)}
  aria-describedby={helpId}
/>

<p id={helpId}>
  {t('preferences.emailUpdatesHelp')}
</p>
```

The production layout may place Checkbox before its label; the association remains explicit.

Rules:

- Use `useId()` for reusable field compositions.
- Clicking the associated label must toggle an enabled checkbox exactly once.
- Link only existing helper/error elements.
- Show required meaning in localized visible copy where needed.
- Do not attach `role="alert"` automatically to every error.

### Groups

Use `<fieldset>` and `<legend>` when choices form a meaningful group.

**Important:** `required` on each checkbox means each marked checkbox must be checked. It does **not** mean “select at least one from this group.” That rule belongs to group-level validation.

---

## 11. Forms and security boundaries

Native submission rules must remain intact:

- Checked, enabled, named checkbox → submits its value.
- Unchecked checkbox → ordinarily omitted.
- Disabled checkbox → omitted.
- No explicit `value` → native submitted value is `"on"`.

Do not silently add hidden fallback inputs or convert values inside the primitive.

A required checkbox is **not** proof of:

- Server authorization.
- Legally sufficient consent recording.
- Trusted acceptance of terms.
- Backend validation.

The application must validate and record important choices on the server. Never log or transmit selection data from the primitive.

---

## 12. RTL, accessibility and browser behavior

- Use logical layout properties.
- Checkbox appears at the row’s inline-start when that is the composition’s chosen order.
- Arabic labels align and wrap correctly.
- Do not mirror the check or minus glyph.
- Labels may wrap; never clamp essential consent wording.
- Do not place the entire checkbox row in `dir="ltr"` merely because it contains a URL.
- Support forced-colors mode with a visible indicator, state mark and focus outline.
- Do not disable forced-colors adaptation globally.
- Do not assume custom appearance preserves native high-contrast rendering automatically.

Because the kit renders its own indicator, suppress the native checkbox paint deliberately. **Avoid showing both the browser tick and the registry tick.** Any appearance reset must be scoped to this component—not all inputs.

---

## 13. Gallery requirements

Build `/gallery/checkbox` in Dashboard and Website with:

1. Product default.
2. Six explicit sizes.
3. Unchecked and checked states.
4. Indeterminate state.
5. Disabled unchecked, checked and mixed states.
6. Required versus application-invalid distinction.
7. Keyboard-focus demonstration.
8. Label-click and long-label examples.
9. Controlled and uncontrolled examples.
10. Native submission and reset.
11. Caller-owned “Select all” demonstration.
12. EN/FR/AR and RTL/LTR.
13. Light/dark, touch targets and forced-colors checks.
14. Complete usage examples.

All presentation copy and accessible names must be localized. Technical identifiers and actual user values are not translation strings.

Do not use static DOM IDs as test selectors. Use generated IDs for relationships and scoped test IDs for deterministic fixtures.

---

## 14. Verification and release acceptance

### Unit tests

Use `userEvent` and verify:

- Native type, defaults and direct ref.
- Controlled/uncontrolled checked behavior.
- Space activation.
- Disabled focus/activation suppression.
- Label association and single-toggle behavior.
- Native attributes and event forwarding.
- Indeterminate DOM synchronization.
- Checked versus indeterminate submission semantics.
- Form submission and reset.
- No contradictory accessible state.

### Real-browser tests on both starters

Verify:

- Product-default target and indicator dimensions.
- Explicit sizes and coarse-pointer expansion.
- Actual SVG dimensions against resolved CSS lengths.
- Native input target clicks, including target padding.
- Stable hover borders.
- Visible focus and invalid-state precedence.
- Native paint does not duplicate the registry indicator.
- Arabic layout and long-label reflow.
- 320px width and enlarged text.
- Forced-colors usability.
- Group example behavior and reset.

**Do not parse `1rem` as though it meant one pixel.** Resolve CSS lengths before comparing them to rendered geometry.

### Final gate

- Sync: zero drift.
- Dashboard shadow audit.
- TypeScript, lint and formatting.
- Unit suites across all starters.
- Production builds.
- Relevant browser suites in both Next.js starters.

**Developer instruction:** implement this bounded Checkbox contract, tests and galleries. Preserve existing components and product presets. Report actual results and skipped checks; do not claim universal browser or accessibility certification. No commits or pushes without approval.
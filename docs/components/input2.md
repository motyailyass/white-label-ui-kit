# Input — specification and development instructions

**Build one reliable single-line Input primitive, then demonstrate it through accessible, localized field compositions.**

This follows the accepted Button foundation: one shared implementation, product-owned presets, native semantics, and no edition-specific forks.

I checked the current repository: its UI directory contains Button, control-sizing, and ThemeToggle, but no Input implementation. This is therefore a **new component**, not a rewrite of an existing Input.[[1]](https://github.com/motyailyass/white-label-ui-kit/tree/18b6eed/typescript/nextjs/starterkit/dashboard/src/components/ui)

---

## 1. Objective and scope

### Deliverables

1. A pure, reusable `Input`.
2. Component tests.
3. Documentation at `docs/components/input.md`.
4. Human-readable Dashboard and Website galleries.
5. A representative form combining the accepted Button and Input.
6. Synchronized shared source for supported starters.
7. An evidence-based handoff with final SHA and test results.

### Initial scope

Support native single-line, text-like entry:

```tsx
type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'password';
```

These types use browser-native behavior. Supporting `type="password"` does **not** include a visibility toggle or password-strength system.

### Explicitly excluded

- Textarea.
- Number steppers and currency formatting.
- Date/time pickers.
- File inputs.
- Checkbox, radio, range, color, hidden, or submit inputs.
- Autocomplete suggestions or combobox behavior.
- OTP and segmented inputs.
- Input masking.
- Automatic search requests or debouncing.
- Password visibility and strength controls.
- Clear buttons, prefixes, suffixes, or interactive adornments.

Those require separate component or pattern contracts. **Do not turn Input into every form control.**

---

## 2. Architecture and ownership

Your existing rules require pure primitives, native HTML, logical styling, shared control sizing, and localized content supplied by callers.[[2]](https://github.com/motyailyass/white-label-ui-kit/blob/18b6eed/.agents/rules/30-ui-primitives.md)

| Layer | Responsibility |
| --- | --- |
| `components/ui/input` | Native input, styles, prop forwarding, ref |
| Caller or field composition | Label, help text, error text, relationships |
| Connected pattern | Translation and application integration |
| Host/application | Validation policy, requests, permissions, persistence |

### Primitive restrictions

No imports from:

- Providers or i18n.
- `next/*` or routing libraries.
- Form, query, schema-validation, or application-state libraries.
- API clients or analytics SDKs.

No embedded:

- Labels or placeholders.
- English fallback error messages.
- Brand names or colors.
- Demo values.
- Validation business rules.

**“Pure” does not mean disabling normal browser behavior.** Preserve native editing, selection, autocomplete, form submission, and constraint-validation capabilities.

---

## 3. Kit editions

**Proposed product allocation—not finalized licensing terms:**

| Offering | Input-related scope |
| --- | --- |
| Free | Complete Input, all sizes/states, accessible usage, RTL, themes, native attributes |
| Pro | Additional maintained field patterns and integration recipes |
| Companies/Agencies | Additional multi-brand delivery examples and organizational guidance |

Potential premium additions can include search patterns, password controls, or application-ready forms. They are separate deliverables.

Never introduce:

```tsx
<Input edition="pro" />
```

Never create `FreeInput` and `ProInput`.

**Accessibility, error styling, Arabic, password masking, and native autocomplete are not premium restrictions.**

---

## 4. Proposed public API

Review and approve this small API before implementation:

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export type InputType =
  | 'text'
  | 'email'
  | 'tel'
  | 'url'
  | 'search'
  | 'password';

export interface InputProps
  extends Omit<
      ComponentPropsWithoutRef<'input'>,
      'size' | 'type' | 'children'
    >,
    ControlSizingProps {
  type?: InputType;
}
```

### Why omit native `size`?

HTML Input’s native `size` is a character-width hint. The kit already uses `size` for its six-step control scale.

Document this collision explicitly:

- `size="md"` means kit control sizing.
- Native character-count `size={20}` is not supported through this prop.
- Width is controlled through layout/CSS, not a second sizing interpretation.

### Defaults

| Property | Default |
| --- | --- |
| `type` | `text` |
| `size` | Omitted; local product alias |
| `touchTarget` | `auto` |
| `disabled` | Native default: false |
| `readOnly` | Native default: false |
| `required` | Native default: false |
| Value | No kit-supplied value |

### Preserve native attributes

Including:

- `value`, `defaultValue`, `onChange`.
- `onInput`, `onBlur`, `onFocus`, `onKeyDown`.
- `id`, `name`, `form`.
- `placeholder`, `autoComplete`, `inputMode`.
- `required`, `readOnly`, `disabled`.
- `minLength`, `maxLength`, `pattern`.
- `multiple` where applicable to the native type.
- `spellCheck`, `autoCapitalize`, `enterKeyHint`.
- `dir`, `lang`.
- Applicable `aria-*` and `data-*`.

Forward the ref to **`HTMLInputElement`**, not a wrapper.

### Keep the first API small

Do not add:

- `label`, `description`, or `errorMessage`.
- `validate`, `schema`, or `rules`.
- `loading`, `success`, or `permission`.
- `onValueChange` as a duplicate of native `onChange`.
- `as`, `edition`, or `brand`.
- Icon/adornment slots without a separately approved design.

Use native `aria-invalid` as the initial invalid-state contract. Do not add an equivalent `invalid` prop merely for styling convenience.

---

## 5. Native editing contract

### Controlled usage

```tsx
<Input
  value={name}
  onChange={(event) => setName(event.currentTarget.value)}
/>
```

The parent owns the value. Do not mirror it into unnecessary internal state.

### Uncontrolled usage

```tsx
<Input
  name="displayName"
  defaultValue={initialDisplayName}
/>
```

The browser owns the current value.

### Required behavior

- Support both modes.
- Do not pass `value` and `defaultValue` together.
- Do not change controlled/uncontrolled mode during the component lifetime.
- Do not trim, normalize, format, or transform text on each keystroke.
- Preserve caret position and selection.
- Preserve copy, paste, undo, and redo.
- Do not block paste into password fields.
- Do not reinterpret Enter or arrow keys unnecessarily.
- Do not trigger submission/search during IME composition through custom handlers.

Normalization and application keyboard shortcuts belong to the caller.

---

## 6. Sizing and product presets

Reuse the accepted six-step scale:

| Size | Minimum block size |
| --- | --- |
| `xs` | 28px |
| `sm` | 32px |
| `md` | 36px |
| `lg` | 40px |
| `xl` | 48px |
| `2xl` | 56px |

These are baseline equivalents at a 16px root font size, not fixed-height constraints.

### Product defaults

| Product | Omitted-size minimum | Radius |
| --- | --- | --- |
| Dashboard | 36px | 6px |
| Website | 48px | 8px |

Preserve the existing control font-size, line-height, padding, and radius roles. Do not copy Button’s medium font weight automatically; Input text weight should follow the approved form-control typography decision.

The repository requires shared sizing meanings and independent product defaults.[[3]](https://github.com/motyailyass/white-label-ui-kit/blob/18b6eed/AGENTS.md)

### Width and text behavior

- Input can fill an ordinary form container through CSS.
- Permit shrinking in flex/grid layouts; prevent accidental horizontal overflow.
- Do not hardcode a universal pixel width.
- Single-line values scroll horizontally as native inputs do.
- Do not claim that long input values wrap onto multiple lines.
- Enlarged text must not be vertically clipped.
- Use logical dimensions, padding, and alignment.

### Touch policy

Use the existing policy:

- `auto`: minimum rendered target expands on coarse-pointer devices.
- `comfortable`: minimum target regardless of pointer.
- Expansion affects the actual input surface.
- Do not create an invisible-hitbox system.

If a mobile browser’s focus behavior conflicts with an existing typography preset, report and test it. Do not silently change the shared token scale or disable user zoom.

---

## 7. States and styling

| State | Semantic source | Expected treatment |
| --- | --- | --- |
| Resting | Native editable input | Approved surface, text, border |
| Hover | Applicable pointer interaction | Approved hover border/surface |
| Focus | Actual input focus | Immediate visible focus indicator |
| Disabled | `disabled` | Approved disabled tokens |
| Read-only | `readOnly` | Distinguishable but readable and selectable |
| Invalid | `aria-invalid="true"` | Error treatment plus caller-provided error text |
| Required | `required` | Native requirement; caller communicates it visibly |

### Important distinctions

**Disabled**

- Normally excluded from tab navigation.
- Excluded from native form submission.
- Not editable.

**Read-only**

- Not editable.
- Remains focusable and selectable.
- Remains included in form submission when otherwise eligible.
- Must not receive disabled semantics or indiscriminately disabled styling.

**Invalid**

- Can coexist with focus.
- Focus indication must remain visible.
- Error meaning must not depend on color alone.
- `aria-invalid` communicates state; it does not run validation.

### Styling rules

- CSS Modules and approved semantic tokens.
- No fixed customer palette.
- No arbitrary opacity for disabled text.
- No dashboard shadows.
- No `transition: all`.
- No focus indicator delay.
- No unresolved custom-property references.

Inspect the existing token inventory before implementation. **Proposed tokens are not implemented tokens.** Request approval for genuinely missing semantic roles.

---

## 8. Labels, help, errors, and IDs

Every field needs a meaningful accessible name. A placeholder is not a substitute for a label.

### Composition example

The identifiers below represent proposed translation keys to add consistently:

```tsx
function DisplayNameField() {
  const id = React.useId();
  const helpId = `${id}-help`;
  const errorId = `${id}-error`;

  const { t } = useI18n();
  const [value, setValue] = React.useState('');
  const [showError, setShowError] = React.useState(false);

  const describedBy = showError
    ? `${helpId} ${errorId}`
    : helpId;

  return (
    <div>
      <label htmlFor={id}>
        {t('common.inputGallery.displayNameLabel')}
      </label>

      <Input
        id={id}
        name="displayName"
        value={value}
        onChange={(event) => {
          setValue(event.currentTarget.value);
        }}
        aria-invalid={showError || undefined}
        aria-describedby={describedBy}
        required
      />

      <p id={helpId}>
        {t('common.inputGallery.displayNameHelp')}
      </p>

      {showError && (
        <p id={errorId}>
          {t('common.inputGallery.displayNameError')}
        </p>
      )}
    </div>
  );
}
```

This illustrates relationships, not a complete validation policy.

### Requirements

- Caller supplies the visible label.
- Use `useId()` for reusable compositions.
- Do not generate an unrelated internal ID that callers cannot associate with their labels.
- Multiple help/error IDs remain space-separated.
- Do not reference absent error elements.
- Do not automatically add `role="alert"` to every error.
- The form decides when to validate and how to announce errors.
- Required status must be understandable without relying solely on an asterisk.
- Never overwrite caller-provided accessibility relationships.

---

## 9. RTL and localization

- Localize labels, descriptions, placeholders, errors, controls, and gallery feedback.
- Keep translation logic outside the primitive.
- Use locale to select content—not `isRtl` as a language selector.
- Inherit direction by default.
- Permit explicit `dir` for appropriate values.
- Email addresses, URLs, and mixed-script values require deliberate direction handling and testing.
- Do not automatically force every field to LTR or every Arabic-locale value to RTL.
- Keep Arabic text and diacritics readable.
- Do not reverse native caret-navigation behavior with custom keyboard code.

Translate status from identifiers during rendering rather than storing permanently translated strings in state.

---

## 10. Validation and security boundaries

### Native validation

Forward native constraints. Do not silently disable or replace them.

The caller chooses:

- Native browser constraint validation, whose messages follow browser behavior.
- Or a custom localized validation flow.

Do not mix two competing validation experiences without an explicit design.

### Security

Input is an entry control, **not a sanitization or authorization system**.

- Server validates submitted values independently.
- Client validation improves UX; it is not a security boundary.
- Do not inject input values as HTML.
- Do not log field values by default.
- Do not send field contents to analytics.
- Do not persist sensitive values in local storage.
- Do not disable password-manager support as a blanket policy.
- Preserve appropriate `autoComplete` values.
- Password masking is not encryption.
- Avoid expensive custom regex evaluation on every keystroke.
- Keep demo data synthetic; never use real credentials or personal data.

---

## 11. Gallery requirements

Create `/gallery/input` in the actual Dashboard and Website starters using existing gallery conventions.

Use the real exported Input.

### Sections

1. **Overview:** one ordinary labelled field.
2. **Sizes:** all six explicit sizes.
3. **Product default:** omitted-size Input with its local preset.
4. **Native types:** supported text-like types using synthetic data.
5. **States:** editable, disabled, read-only, required, invalid.
6. **Help/error relationships:** inspectable, working examples.
7. **Controlled/uncontrolled:** demonstrate both honestly.
8. **Localization:** English, French, Arabic and long surrounding labels.
9. **Direction:** Arabic text and appropriate mixed/LTR data examples.
10. **Theme:** existing light/dark controls.
11. **Responsive/touch:** narrow layout and target policies.
12. **Form integration:** Input plus accepted Button.
13. **Usage snippets:** valid API and localized caller content.

### Gallery boundaries

- All visible demonstration prose and feedback goes through translations.
- Technical API identifiers may remain literal.
- Use generated IDs for field associations.
- Do not claim alternate-brand support is demonstrated unless an actual preset is shown.
- Mark local simulation clearly.
- A search-type specimen does not imply a working search service.
- Use appropriate language/direction treatment for code and mixed-language content.
- Do not add a new gallery framework.
- Do not reopen Button styling or shell architecture.

---

## 12. Real form demonstration

Build one local demonstration combining:

- Labelled Input.
- Help text.
- Required/invalid behavior.
- Submit Button.
- Localized pending/result feedback.
- Reset behavior.

Clearly disclose:

> Local form demonstration; no backend persistence.
> 

Application handlers own validation and pending state. Do not show “saved to server” when nothing was persisted.

Do not include a password in success messages or dump the complete form payload into the page.

---

## 13. Tests

### Component tests

Use Testing Library and `userEvent` to verify:

- Native element and default type.
- Omitted-size attributes and explicit sizes.
- Touch-policy attributes.
- Controlled and uncontrolled editing.
- Native change/blur/focus callbacks.
- Ref forwarding.
- Label association and accessible naming.
- Description/error relationships.
- Disabled editing suppression.
- Read-only selection/focus and editing prevention.
- Required and invalid attributes.
- Native attribute forwarding.
- Multiple independent instances.
- No provider required for the primitive.

Include native form tests demonstrating:

- Disabled fields are excluded.
- Read-only fields are included.
- Uncontrolled values reset to their defaults.
- Controlled reset is handled explicitly by the caller.

Do not claim JSDOM verifies browser layout, autofill, mobile keyboards, or password-manager integrations.

### Browser tests

Against real mounted components, verify:

- Dashboard/Website defaults and explicit sizes.
- Fine/coarse pointer behavior.
- Focus visibility.
- Light/dark styling.
- Narrow layout without page overflow.
- Enlarged text without vertical clipping.
- Arabic and mixed-direction input.
- Long entered values remain editable.
- Form validation and error associations.
- Locale switching updates existing feedback.
- Supported native-type behavior relevant to the release.

Document manual or unavailable checks such as actual mobile keyboards, browser autofill, and password-manager behavior. Do not claim exhaustive browser coverage from Chromium alone.

---

## 14. Development instructions and scope control

Send the teammate this execution rule:

> Read the applicable rules, inspect tokens and gallery conventions, then produce a short file/API/token plan before implementation.
> 
> 
> Implement the smallest complete Input milestone described here. Author shared source canonically and synchronize through the existing script. Preserve local presets and independent starter installs.
> 
> Do not add dependencies, token roles, public props, or additional field components without approval. Do not weaken tests, conceal failures, or silently expand scope.
> 
> Distinguish implemented behavior, acceptance evidence, and deferred enhancements. Finish the agreed task rather than starting another cleanup cycle.
> 

### Expected structure

```
components/ui/input/
  input.tsx
  input.module.css
  input.test.tsx
  index.ts

components/patterns/input-gallery/
  input-gallery.tsx
  input-gallery.module.css
  index.ts

app/gallery/input/
  page.tsx

docs/components/
  input.md
```

Follow existing export and message conventions. Create additional files only when justified.

---

## 15. Fixed acceptance checklist

- [ ]  One pure native Input, no edition forks.
- [ ]  Approved API implemented without speculative props.
- [ ]  Native editing, selection, and form behavior preserved.
- [ ]  Controlled and uncontrolled modes work.
- [ ]  Disabled and read-only remain semantically distinct.
- [ ]  Labels/help/errors have correct relationships.
- [ ]  Product defaults and shared size meanings are preserved.
- [ ]  RTL, themes, touch, and enlarged text are tested.
- [ ]  No embedded user-facing copy or unresolved tokens.
- [ ]  Real localized galleries exist in both Next.js starters.
- [ ]  Local form demonstration is clearly labelled.
- [ ]  Canonical synchronization passes.
- [ ]  Applicable lint, format, types, unit tests, browser tests, builds, and shadow checks pass.
- [ ]  Host coverage and skipped/manual checks are reported accurately.
- [ ]  Final diff and commit contain all required new files.

### Handoff

Provide:

1. Final SHA and Git status.
2. Changed files and purpose.
3. Gallery URLs and representative screenshots.
4. Exact commands and results.
5. Tested hosts/browser engines.
6. Known limitations.
7. Deferred proposals.
8. Confirmation that no unauthorized APIs, tokens, or dependencies were added.

**Do not push without approval. Stop when the checklist is satisfied.**

**Milestone outcome: one dependable Input and a clear gallery—not an entire form framework.**
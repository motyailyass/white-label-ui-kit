# Textarea — specification and development instructions

**Build one native multiline text-entry primitive, following the accepted Input foundation without copying its single-line assumptions.**

I checked the pushed baseline at `7cedef2`. Input now uses a direct native element, product-default aliases, stable hover borders, and separate focus/error treatments. Textarea should preserve those conventions—not reopen them.[[1]](https://github.com/motyailyass/white-label-ui-kit/blob/7cedef2/typescript/nextjs/starterkit/dashboard/src/components/ui/input/input.tsx)[[2]](https://github.com/motyailyass/white-label-ui-kit/blob/7cedef2/typescript/nextjs/starterkit/dashboard/src/components/ui/input/input.module.css)

The following is the **proposed bounded contract** for the next component.

---

## 1. Objective and deliverables

Create:

1. A pure, native `Textarea`.
2. Component tests.
3. `docs/components/textarea.md`.
4. Dashboard and Website galleries at `/gallery/textarea`.
5. A localized local form combining Textarea and the existing Button.
6. Canonical synchronization to supported starters.
7. Focused browser verification and a final handoff.

### Intended use cases

- Descriptions.
- Feedback.
- Notes.
- Support messages.
- Other plain multiline text.

### Explicit non-goals

Do not include:

- Rich-text or Markdown editing.
- Syntax highlighting.
- Mentions or autocomplete suggestions.
- Attachments.
- Automatic submission.
- Draft persistence.
- Autosizing JavaScript.
- Character counters inside the primitive.
- Toolbar, icon, clear-button, or action slots.

These can become separate patterns when approved. **Do not build an editor framework around a textarea.**

---

## 2. Architecture

| Layer | Responsibility |
| --- | --- |
| `components/ui/textarea` | Native textarea, styles, native attributes, ref |
| Caller/field composition | Label, help, error, optional external counter |
| Connected pattern | Translation and integration |
| Application | Validation, requests, permissions, persistence |

### Primitive restrictions

No:

- Providers or i18n hooks.
- Router or `next/*` imports.
- Form/schema/query-library dependencies.
- API calls, analytics, or storage.
- Embedded labels, placeholder copy, or error messages.
- Customer brands, fixed palette values, or demo content.

Use one shared implementation across products and editions.

**Free and paid editions receive the same complete primitive.** Additional paid value may come from separate maintained patterns—not reduced accessibility or editing behavior in Free.

---

## 3. Public API

Use native textarea attributes plus the existing control-sizing contract:

```tsx
import type { ComponentPropsWithoutRef } from 'react';
import type { ControlSizingProps } from '../control-sizing';

export interface TextareaProps
  extends Omit<
      ComponentPropsWithoutRef<'textarea'>,
      'children'
    >,
    ControlSizingProps {}
```

### Defaults

| Property | Default |
| --- | --- |
| `rows` | `4` |
| `size` | Omitted; resolves through the product preset |
| `touchTarget` | `auto` |
| `disabled` | Native default: false |
| `readOnly` | Native default: false |
| `required` | Native default: false |
| Value | No kit-supplied value |

The four-row default is a **new proposed Textarea decision**, not an existing Input rule.

### Preserve native attributes and events

Including:

- `value`, `defaultValue`, `onChange`, `onInput`.
- `onFocus`, `onBlur`, `onKeyDown`.
- Composition events.
- `id`, `name`, `form`.
- `rows`, `cols`, `wrap`.
- `placeholder`, `autoComplete`.
- `minLength`, `maxLength`, `required`.
- `disabled`, `readOnly`.
- `spellCheck`, `autoCapitalize`.
- `dir`, `lang`, applicable `aria-*`, and `data-*`.

Forward the ref directly to **`HTMLTextAreaElement`**.

### Attribute distinctions

- Textarea does not have Input’s native `type`.
- Textarea does not use Input’s `pattern` validation.
- Its `size` prop is the kit’s density scale—not a native character-count attribute.
- `cols` remains a native hint; the component’s responsive CSS may determine actual width.
- Do not use children as initial textarea content. Use `defaultValue`.

### Do not add speculative props

No:

```
invalid
error
label
description
autoResize
minRows
maxRows
showCount
onValueChange
loading
edition
```

Use native `aria-invalid` and caller-owned compositions.

---

## 4. Native multiline editing

### Controlled

```tsx
<Textarea
  value={message}
  onChange={(event) => {
    setMessage(event.currentTarget.value);
  }}
/>
```

### Uncontrolled

```tsx
<Textarea
  name="message"
  defaultValue={initialMessage}
/>
```

### Required behavior

- Preserve line breaks.
- Enter inserts a newline; it does not become an application submit shortcut.
- Preserve caret movement, selection, undo/redo, cut/copy/paste, and native scrolling.
- Preserve IME composition.
- Do not trim, capitalize, sanitize, normalize, or format on each keystroke.
- Do not mirror controlled values into redundant internal state.
- Do not switch between controlled and uncontrolled modes.
- Do not pass `value` and `defaultValue` together.

An application may separately implement an approved keyboard shortcut. The primitive must not impose one.

---

## 5. Sizing: density is not row count

**Do not make Textarea exactly 36px or 48px tall because Input uses those defaults.**

The shared scale already defines control typography, padding, and minimum target dimensions.[[3]](https://github.com/motyailyass/white-label-ui-kit/blob/7cedef2/typescript/nextjs/starterkit/dashboard/src/components/ui/control-sizing.ts)

Textarea uses that scale for **density**. Its initial multiline height comes from `rows` and native rendering.

| Concern | Owner |
| --- | --- |
| Font size and line height | Explicit size or local default aliases |
| Inline/block padding | Explicit size or local default aliases |
| Initial visible lines | `rows` |
| Minimum control floor | Existing control-height/touch policy |
| User-adjusted height | Native resize |
| Layout width | Container and CSS |

### Product defaults

- Dashboard inherits the existing `md` density and control radius.
- Website inherits the existing `xl` density and control radius.
- Default `rows={4}` applies in both.
- Their actual heights can differ because typography and padding differ.

### Explicit sizes

Support:

```
xs · sm · md · lg · xl · 2xl
```

Explicit steps retain the same sizing meanings across starters.

Use `*-default` aliases consistently when size is omitted. Do not hardwire `md` typography or padding into the Website default.

### Measurement rule

Do not write tests asserting:

> “Default Textarea must be exactly 36px tall.”
> 

Instead verify:

- Correct density tokens.
- Expected native row-based initial sizing.
- Adequate minimum dimensions.
- No clipping.
- Consistency under matching size, rows, content, and layout conditions.

Do not impose a fixed block size that defeats `rows` or enlarged text.

---

## 6. Width, wrapping, overflow, and resizing

### Width

- Responsive container width.
- Able to shrink in flex/grid layouts.
- No universal hardcoded pixel width.
- No horizontal page overflow at supported narrow viewports.

### Wrapping

- Preserve the browser’s native default wrapping unless the caller supplies `wrap`.
- Long paragraphs should remain editable.
- Verify long unbroken content does not break the surrounding layout.
- If documenting `wrap="hard"`, explain its native form-submission implications rather than treating it as a purely visual option.

### Native resizing

**Initial decision: permit vertical/block-axis manual resizing.**

- Prefer logical block-axis resizing where supported.
- Check the supported browser matrix.
- If a physical `resize: vertical` fallback is needed, document that narrow compatibility exception rather than pretending it is a logical property.
- Do not enable unrestricted horizontal resizing that breaks the form layout.
- Do not remove resizing solely to make screenshots uniform.
- Native resizing is not guaranteed on every mobile browser.

### Autosizing is excluded

Do not add:

- `scrollHeight` measurement effects.
- Resize observers.
- `minRows` / `maxRows`.
- Automatic height changes while typing.
- `field-sizing: content` as an untested silent enhancement.

Manual resizing and autosizing are different features.

---

## 7. Visual states and border policy

Use the existing Input semantic roles where appropriate.

| State | Required appearance/behavior |
| --- | --- |
| Resting | Stable control border |
| Hover | **No independent border-color emphasis** |
| Focus | Immediate visible focus outline and approved focus treatment |
| Invalid | Error border retained through hover |
| Invalid + focused | Error border plus visible focus indication |
| Disabled | Disabled tokens; native non-editability |
| Read-only | Selectable/readable; visible focus when focused |

### Preserve the settled design

- Border width remains constant.
- No hover-only extra edge.
- No arbitrary opacity-based disabled styling.
- No Dashboard shadows.
- Focus remains visible after pointer exit while the textarea is still focused.
- Do not animate focus visibility or textarea dimensions.
- Invalid styling must not erase focus visibility.
- Define and test overlapping states so CSS specificity does not produce accidental overrides.

### Native versus ARIA

- `disabled` controls native disabled behavior.
- `readOnly` controls native editing prevention.
- `required` controls the native constraint.
- ARIA attributes communicate state; they do not substitute for those behaviors.

`aria-invalid` must pass through unchanged. Do not overwrite it with a competing custom prop.

---

## 8. Labels, help text, and errors

Every textarea needs a meaningful accessible name. Placeholder text is not a label.

Caller-owned composition:

```tsx
const id = React.useId();
const helpId = `${id}-help`;
const errorId = `${id}-error`;

const describedBy = hasError
  ? `${helpId} ${errorId}`
  : helpId;
```

```tsx
<label htmlFor={id}>
  {t('common.textareaGallery.messageLabel')}
</label>

<Textarea
  id={id}
  name="message"
  rows={4}
  value={message}
  onChange={(event) => {
    setMessage(event.currentTarget.value);
  }}
  aria-describedby={describedBy}
  aria-invalid={hasError || undefined}
/>

<p id={helpId}>
  {t('common.textareaGallery.messageHelp')}
</p>

{hasError && (
  <p id={errorId}>
    {t('common.textareaGallery.messageError')}
  </p>
)}
```

Translation keys above are proposed keys to add consistently.

### Rules

- Generate reusable composition IDs with `useId`.
- Reference only rendered description elements.
- Preserve caller-provided naming and description attributes.
- Do not automatically attach `role="alert"` to every error.
- Keep validation timing and announcements at the form level.
- Required does not automatically mean “show a red error before interaction.”

---

## 9. Character limits and counters

### Native limits

Forward `minLength` and `maxLength`.

Do not implement a second keystroke-blocking or truncation system.

### Counters

An external counter is **optional and caller-owned**, not required for this milestone.

If demonstrated:

- Define what is being counted.
- Do not claim JavaScript string length equals user-perceived characters.
- Native maxlength behavior uses UTF-16 code-unit length; emoji and combined characters can expose that distinction.
- Avoid announcing a changing count on every keystroke.
- Do not echo sensitive textarea content into status messages.

A server must validate length independently.

---

## 10. Localization and direction

- All gallery prose, labels, placeholders, errors, and feedback use message dictionaries.
- Choose content by locale—not direction.
- Textarea inherits direction by default.
- Caller may supply an appropriate `dir`, including `auto` when suitable.
- An Arabic specimen inside an English page needs its own deliberate `lang="ar"` and `dir="rtl"` context.
- Do not force every textarea to RTL or LTR.
- Verify Arabic multiline typing, punctuation, selection, and caret behavior.
- Resolve feedback translations from state identifiers during rendering.

Code snippets and foreign-language specimens must follow the project’s language/direction conventions.

---

## 11. Security and privacy boundaries

Textarea is a plain-text entry control—not an HTML editor or sanitization system.

- No `dangerouslySetInnerHTML`.
- No default logging or analytics capture of values.
- No automatic local-storage drafts.
- No real personal or confidential data in fixtures.
- Do not inject submitted text into HTML.
- Server validates length, content policy, permissions, and persistence.
- Client validation is UX—not authorization.
- Do not claim an input is “secure” merely because it has a maximum length.

---

## 12. Human-readable gallery

Create `/gallery/textarea` in both Next.js starters using existing gallery conventions.

### Sections

1. **Overview:** ordinary labelled multiline field.
2. **Density scale:** six sizes with the same `rows`.
3. **Product default:** omitted size, local preset.
4. **Rows:** representative native row counts.
5. **States:** editable, disabled, read-only, required, invalid.
6. **Help/error relationships.**
7. **Controlled versus uncontrolled.**
8. **Multiline editing:** newlines, wrapping, and long content.
9. **Manual resize:** explain actual supported behavior.
10. **Localization and direction:** English, French, Arabic.
11. **Theme and responsive layout.**
12. **Local form:** Textarea plus accepted Button.
13. **Usage snippets:** accurate and copyable.

### Gallery requirements

- Render the real exported Textarea.
- No duplicate implementation.
- Use existing locale/theme controls.
- Localize content and route metadata.
- Use synthetic fixture text.
- Keep gallery controls and status outside the primitive.
- Clearly label simulation.
- Do not claim brand presets, browser features, or integrations not actually demonstrated.
- Do not change Button or Input merely to decorate this gallery.

---

## 13. Local form demonstration

Demonstrate:

- Labelled message textarea.
- Help text.
- A deliberate validation policy.
- Submit Button.
- Local pending/result feedback.
- Reset behavior.

Display a localized equivalent of:

> Local form demonstration; no backend persistence.
> 

Requirements:

- Enter continues to insert a newline.
- Submit happens through the form’s explicit submit control.
- Reset restores an uncontrolled default or explicitly resets controlled state.
- Prevent duplicate simulated execution.
- Do not display the submitted message unnecessarily.
- Do not claim a message was delivered to a server or recipient.

---

## 14. Testing

### Component tests

Use Testing Library and `userEvent` for:

- Native element and default rows.
- Size/touch attributes.
- Ref to `HTMLTextAreaElement`.
- Controlled/uncontrolled editing.
- Newline preservation.
- Change, focus, blur, and composition-event forwarding.
- Disabled and read-only differences.
- Label and description relationships.
- Native `aria-invalid` forwarding.
- Native attribute preservation.
- Submission includes editable/read-only values and excludes disabled values.
- Uncontrolled reset and caller-controlled reset.
- Independent multiple instances.

Do not claim a unit test proves real browser resizing, caret geometry, or physical-device keyboard behavior.

### Browser tests

Create focused Textarea coverage—not another renamed Button suite.

Verify:

- Actual product density and row-based dimensions.
- Explicit-size consistency.
- At least 48×48px actual targets under the applicable policy.
- Edge clicking focuses the native textarea.
- Stable hover borders.
- Focus/error behavior through pointer exit and blur.
- Native multiline editing.
- Manual resize where supported.
- Internal scrolling with long content.
- Narrow layouts and enlarged text.
- Arabic/mixed-direction content.
- Theme parity.
- Gallery validation, reset, and locale updates.

Report supported browser engines and manual checks accurately. Chromium emulation does not certify iOS Safari, Android IMEs, or physical touch behavior.

---

## 15. File structure and implementation workflow

Expected structure:

```
components/ui/textarea/
  textarea.tsx
  textarea.module.css
  textarea.test.tsx
  index.ts

components/patterns/textarea-gallery/
  textarea-gallery.tsx
  textarea-gallery.module.css
  index.ts

app/gallery/textarea/
  page.tsx

docs/components/
  textarea.md
```

Follow existing export/message conventions.

### Before editing

1. Read applicable repository rules.
2. Record SHA and Git status.
3. Inspect tokens, Input, and existing galleries.
4. Produce a short API/file/test plan.
5. Identify any missing token or compatibility decision.

### During implementation

- Author shared source canonically.
- Synchronize through the existing script.
- Preserve local presets and independent starter behavior.
- Reuse approved tokens.
- No new dependency, public prop, or token role without approval.
- Preserve unrelated work.
- Fix demonstrated failures with regression tests.
- Do not weaken assertions, add retries, or use arbitrary sleeps to hide failures.

---

## 16. Fixed definition of done

- [ ]  Native, provider-free Textarea.
- [ ]  Approved small API and direct native ref.
- [ ]  Native multiline editing preserved.
- [ ]  Row count and density are separate.
- [ ]  Manual resizing works within the approved support scope.
- [ ]  Stable hover borders; correct focus/error behavior.
- [ ]  Labels/help/errors are correctly associated.
- [ ]  Disabled/read-only semantics remain distinct.
- [ ]  Localized galleries and local form delivered.
- [ ]  RTL, themes, touch, enlarged text, and responsive behavior verified.
- [ ]  No embedded user-facing copy or unresolved tokens.
- [ ]  Synchronization, shadows, formatting, lint, types, tests, and applicable builds pass.
- [ ]  Browser evidence specifically covers Textarea.
- [ ]  Final diff, SHA, skipped checks, and limitations are reported.

**Do not push without approval. Stop when this milestone passes. Autosizing, counters, editors, and additional patterns remain separate decisions.**
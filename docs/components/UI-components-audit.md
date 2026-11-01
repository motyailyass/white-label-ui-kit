# Button, Input and Textarea — Independent Source and Browser Audit

**Repository:** motyailyass/white-label-ui-kit  
**Audited commit:** `27c62a12ca54f7c88b9d8e4d383554c5a267cbf8`  
**Decision:** Keep the shared foundation. Complete a bounded correction pass before treating all three components and galleries as release-approved. No exploitable vulnerability was identified in the scoped primitive/gallery review; this is not a whole-application security certification.

## Scope and method

Read the repository rules, the three canonical primitives, their CSS, the connected galleries, relevant dictionaries, icon wrapper/registry, product controls/typography/color roles and tests. Checked canonical synchronization to Website and Vite. Installed the pinned dependency lockfile with lifecycle scripts disabled. Executed unit tests, type/lint/format checks, production builds, committed browser regressions and additional browser probes against the actual gallery routes in both Next.js starters.

Browser verification used installed system Chromium through repository-pinned Playwright, with an audit-only configuration supplying the executable path. Tested desktop and 390px mobile regression projects; additional probes included 320px width, 200% root text sizing, French/Arabic, light/dark, readonly+invalid states, icon dimensions and submit/reset timing. No implementation changes, commits or pushes were made.

## What is correct

- One shared primitive per control; no commercial tier checks, edition forks, router integration or localization providers inside these primitives.
- Native HTML elements and direct native refs are preserved. Button defaults to `type="button"`; Input has bounded text-like types; Textarea defaults to four native rows, with density independent of row count.
- Synchronization and Dashboard shadow checks pass.
- Measured omitted-size presets in both light/dark and French/Arabic:

| Metric | Dashboard | Website |
|---|---:|---:|
| Button height | 36px | 48px |
| Input height | 36px | 48px |
| Textarea initial height, four rows | 96px | 120px |
| Control font / line height | 14px / 20px | 16px / 24px |
| Control radius | 6px | 8px |

These are observations at the default 16px root size, not fixed-height promises. Explicit single-line sizes retain the common scale. Textarea rows remain native.

- Arabic switches the document to RTL; Arabic field specimens compute RTL; explicit technical-data exceptions remain LTR. Button directional registry icons mirror in the tested Arabic gallery.
- The reviewed galleries use the semantic Icon registry, not direct vendor imports or independent raw SVG artwork. The CSS loading spinner is a structural indicator, not evidence of a rogue icon library.
- Stable hover-border behavior is preserved. Focus indication remains separate from hover. No border redesign is requested.

## Corrections required

### F1 — High: Input gallery labels are not associated with their controls

**Evidence:** Nine `<label>` elements have no associated control on each host. This includes native-type specimens, resting/disabled/readonly fields, and the theme specimen. A nearby sibling label is not a programmatic label; clicking it does not focus the field. Placeholder fallback does not repair the visible-label relationship.

Source: `input-gallery.tsx`, lines 164–183, 194–205 and 332–333. [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/input-gallery/input-gallery.tsx#L164-L205]

**Also:** Textarea density specimens have associated visible labels such as “XS Density”, but an overriding `aria-label="XS textarea"`. Remove unnecessary overriding names or make localized accessible names include the visible label. [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx#L107-L118]

**Fix:** Generate field IDs with `useId`, pair `htmlFor`/`id`, and test label-click focus and accessible names. Do not add label state to the primitive.

### F2 — High: Gallery CSS references nonexistent typography tokens

The three gallery stylesheets reference `--line-height-xs`. Input and Textarea additionally reference nonexistent `--line-height-sm`, `--line-height-base`, `--line-height-xl` and `--line-height-3xl`. These are not defined anywhere in the canonical CSS source. Invalid custom-property substitution discards the declaration, leaving inherited line heights rather than the intended typography.

**Observed consequence:** At narrow width, the English Textarea gallery heading has overlapping lines. This is a token-resolution bug, not a subjective design preference.

Sources: Input title/subtitle and Textarea help/error styles. [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/input-gallery/input-gallery.module.css#L34-L45] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.module.css#L88-L105]

**Fix:** Use existing matching semantic typography roles for size and line height. Do not invent a parallel token scale to satisfy these accidental names. Add unresolved-token checking and narrow multiline-heading coverage.

### F3 — Medium: Input and Textarea galleries still contain untranslated UI

Examples include `Value:`, `Length: … chars`, Textarea “XS Density” labels and density/row specimen prose, and “XS Auto Target” / “XS Comfortable Target”. Input size specimens also contain hardcoded English accessible labels.

Switching to French or Arabic leaves these strings in English. Primitives are correctly free of embedded copy; the remaining violations are in connected galleries.

Sources: [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/input-gallery/input-gallery.tsx#L130-L137] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/input-gallery/input-gallery.tsx#L269-L280] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx#L107-L118] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx#L312-L321]

**Fix:** Localize presentation copy, accessible labels and sample prose in all three dictionaries. Do not overwrite a user's edited value when locale changes. Technical IDs, API keywords, example URLs, JSON and actual user-entered text are not automatically translation defects. If the counter intentionally counts UTF-16 code units like native `maxLength`, document that rather than claiming it measures every user-perceived character.

### F4 — Medium: Fixed grid minimums break narrow/enlarged-text reflow

On both hosts:
- Textarea at 320px viewport produces 329px document width.
- At 390px viewport with root font size set to 200%, Arabic dark Input produces 593px document width; Textarea produces 657px.
- Button remains at 390px in the same enlarged-text probe.

Input grid columns have a minimum of `16rem`; Textarea uses `18rem`, even when the available section width is smaller. Some controls therefore protrude outside their section/container.

Source: [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.module.css#L109-L114]

**Fix:** Cap the minimum track size to available inline width, permit child shrinking and wrap action rows where necessary. Do not conceal the defect using page-level `overflow-x: hidden`. Test full-gallery reflow, not only the geometry of one fixture control. Root text scaling is an explicit probe here, not a claim that it reproduces every browser zoom mode.

### F5 — Medium: Textarea form demonstration has stale async completion and incomplete error linkage

**Reproduction on both hosts:** Enter a message → Submit → Reset before 600ms. The status first says reset, then changes to successful submission after the old timer fires. Submit is also still available during pending, so multiple pending completions can be scheduled.

The message input sets `aria-invalid`, but the conditional helper/error paragraphs have no IDs and no `aria-describedby` relationship to it. The separate help/error specimen always shows an error description without setting invalid state.

Sources: timer/reset logic and field markup. [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx#L28-L53] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx#L414-L449]

**Fix:** Own pending state in the pattern, block duplicate submissions, invalidate/cancel obsolete completion on reset/unmount, and associate helper/error IDs. Apply invalid state only when showing an actual validation error. Keep timers, validation and announcements outside Textarea itself. Test submit→reset and repeated submit explicitly.

### F6 — Medium: Readonly styles override the invalid border in Input and Textarea

**Reproduction:** Apply `readOnly` and `aria-invalid="true"`, then focus. In light theme the outline is danger red, but the border computes to `rgb(229,229,229)` rather than danger red. The late readonly selector also overrides the normal focus-border color. The ordinary editable-invalid cases pass; the missing coverage is combined state precedence.

Sources: [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/ui/input/input.module.css#L95-L120] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/ui/textarea/textarea.module.css#L95-L121]

**Fix:** Define combined-state precedence deliberately: readonly may own surface/text; an applicable invalid state should keep its error border; focused states must retain their indicator. Decide and test disabled+invalid separately. Fix specificity/order without `!important` escalation or restoring hover-border changes.

## Lower-priority corrections and disclosures

### F7 — Button icon slot dimensions do not size the actual SVG

Registry compliance passes, but rendered control icons do not follow their slot token. In Dashboard, a 16px slot contains a 14px SVG; in Website, a 20px slot contains a 16px SVG. The wrapper consumes `--_control-icon-size`, while Icon defaults to `1em`, tied to text size.

**Fix:** Make the standard slot icon consume the intended control icon dimensions using the existing contract; verify actual SVG bounds, not only wrapper bounds. Preserve Icon registry names and directional mirroring. This is a sizing inconsistency, not a security issue or reason to replace the registry. [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/ui/button/button.module.css#L212-L219] [^https://github.com/motyailyass/white-label-ui-kit/blob/27c62a12ca54f7c88b9d8e4d383554c5a267cbf8/typescript/nextjs/starterkit/dashboard/src/components/icons/icon.tsx#L13-L35]

### F8 — Reusable galleries still use static field IDs

Examples include `specimen-required`, `specimen-invalid`, `specimen-arabic`, and `specimen-controlled`, shared between Input and Textarea galleries. There is no duplicate-ID collision in the current separately mounted routes, but mounting both galleries or a second instance would create collisions and ambiguous label relationships.

**Fix:** Use per-instance generated field IDs, and use scoped `data-testid` or accessible locators for E2E fixtures. This is reuse hygiene, not evidence that current separate routes are already colliding.

### F9 — Formatting and explicit repository CSS rules are not fully satisfied

Scoped `biome format` checking fails in all mirrors, with four canonical files requiring formatting: Button tests, Textarea tests, Textarea primitive, and Textarea gallery. No formatting fixes were applied during this audit.

Textarea uses `overflow-y` and `resize: none !important`; gallery code boxes use `overflow-x`. These contradict the repository's stated logical-overflow / restricted-`!important` rules. Use logical overflow and sufficient selector specificity, or document a narrowly justified compatibility exception. `resize: vertical` is the approved behavior and should not be changed merely to chase a “100% logical” slogan.

*Note on horizontal scrolling fallback exception:* `input-gallery.module.css` and `textarea-gallery.module.css` declare physical `overflow-x: auto;` preceding `overflow-inline: auto;` on `.codeBox`. This physical declaration is documented and retained strictly as a browser-compatibility fallback for engines lacking full `overflow-inline` support, ensuring preformatted code snippets scroll horizontally without breaking section layouts.

Do not interpret every literal as a vulnerability: `rows={4}`, six scale identifiers, `1px` borders and native structural CSS are legitimate constants. A CSS spinner with a fixed duration is a motion-token consistency follow-up, not a rogue icon or exploit.

## Security assessment

- Reviewed primitive/gallery files do not introduce raw HTML injection, executable string evaluation, secret keys, or transmission/storage of entered form values. JSX text rendering is used. Local demonstrations disclose that no backend persistence exists.
- Production dependency advisory check: `pnpm audit --prod --json` exited 0 and reported zero known vulnerabilities at audit time. This is registry-advisory coverage, not proof that all dependencies or code are secure.
- Native `required`, type/length constraints and `aria-invalid` are not backend authorization, sanitization or trusted server validation. Preserve browser capabilities and validate again at a real backend when one is introduced.
- Password demo fields can attract real browser/password-manager autofill. Do not ask testers for real passwords, log values, or add artificial autofill-blocking hacks to the primitive.
- Known danger-button hover opacity and future token proposals remain bounded, disclosed follow-up work; this audit does not authorize a token-system redesign.

## Independently executed checks

| Check | Result |
|---|---|
| Pinned install, frozen lockfile, scripts disabled | Pass |
| Shared synchronization | Pass; zero drift |
| Dashboard shadow check | Pass |
| TypeScript | Pass in all three starters |
| Oxlint | Pass in all three starters |
| Vitest Dashboard | 121 tests passed, 27 files |
| Vitest Website | 109 tests passed, 25 files |
| Vitest Vite | 104 tests passed, 24 files |
| Selected committed browser suites, Dashboard | 58 passed |
| Selected committed browser suites, Website | 28 passed |
| Production builds | All three passed |
| Scoped Biome formatting | Fail; four canonical files, mirrored |
| Production dependency advisory check | Zero known advisories reported |
| Extra gallery probes | Reproduced F1–F7 as described |

Dashboard selected suites: Button, Input, Textarea and control-sizing. Website selected suites present: Textarea and control-sizing; dedicated Button/Input gallery suites are not present there. All passing browser counts use system Chromium and the existing two viewport projects. They do not mean every browser, physical mobile keyboard, password manager, assistive technology or complete application E2E flow was tested. No Safari/Firefox/physical-device or manual screen-reader certification is claimed.

## Bounded implementation instruction

Fix F1–F6 before final approval; resolve F7–F9 in the same narrow pass if practical. Author canonical changes only, then synchronize. Preserve approved public APIs, density presets, edition-neutral architecture, native editing, icon registry and stable-hover-border decision. Add regressions for the uncovered cases on both hosts. Run formatting, unit/type/lint/build/sync/shadow checks and relevant browser suites. Report actual results and any skipped coverage. Do not force-push, replace the foundation, introduce speculative props, or claim “100% secure/error-free”. Commit/push only with the user's authorization.

# Review of controls-audit-fix.patch

Patch header commit: `0ee26a2838c2bdbd3c70f4c0c9a6cb9779afc20d`.
Applied successfully to an isolated copy of the previously audited `27c62a12ca54f7c88b9d8e4d383554c5a267cbf8` source. This reconstructs the supplied diff; it does not authenticate a Git commit object or confirm a remote push.

## Decision

The patch materially improves the implementation. Do not rewrite the primitives. However, “all nine findings resolved” is not yet accurate. Close the remaining small code/reporting/test issues below. No malicious WebKit injection or new unregistered application icon was identified in the scoped source review.

## The screenshot: browser-owned clear control, not a rogue app icon

The search specimen is a native `input type="search"`. Its source renders no clear button or SVG. In the browser probe it contains zero child elements and retains automatic native search decoration. Chromium/Blink and WebKit can render a built-in cancel control for a nonempty search field. That native glyph is not drawn through the application's Icon registry.

Reference: https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-search-cancel-button

The supplied patch adds zero lines containing “webkit”. Existing root `-webkit-font-smoothing` is a browser-specific rendering hint, not evidence of executable code injection. A user-agent stylesheet or user-agent shadow tree in DevTools is browser implementation detail, not automatically third-party or malicious injection. The screenshot alone cannot identify unrelated extensions; obtain the exact rule/source if the concern is about some other WebKit block.

The red dotted spelling underline is also consistent with native spellchecking, not a custom application icon.

Product decision required:
- Preserve native decorations and document them as browser-owned exceptions; or
- If registry-only visual chrome is required, suppress only the native search cancel decoration in the Input stylesheet. Keep type="search" semantics. Put any custom clear action in a separately approved SearchField composition, using the existing registered `close` icon, a localized button name, native type="button", suitable target size, refocus behavior, and disabled/read-only rules. Do not silently wrap Input, introduce speculative props, disable autocomplete globally, or replace native editing with fake controls.

A targeted vendor pseudo-element compatibility rule is not itself a security injection. Do not claim that ordinary browser-owned UI can be routed through React's registry automatically.

## Findings status

### F1 — Fixed in the reviewed Input/Textarea gallery markup

All nine previously disconnected Input labels now have associated controls. Browser probes on both hosts found no disconnected labels. Textarea density labels no longer have the overriding names that hid their visible labels.

### F2 — Main defect fixed

Gallery size/line-height pairs now consume defined semantic roles; the Website label role is defined locally. Static scanning found no unresolved custom-property names in the six scoped component/gallery stylesheets. Product-specific title scales are legitimate preset behavior, not an error merely because Website titles are larger.

### F3 — Still partial: Textarea controlled initial prose is hardcoded

`dashboard/src/components/patterns/textarea-gallery/textarea-gallery.tsx:24–25` still initializes:

```text
Initial controlled multiline text.
Line two of notes.
```

This remains English even when opening the Arabic demonstration. Put initial specimen prose in the locale dictionaries and initialize it from the current locale; do not overwrite user-edited text on later locale changes. A personal name such as Jane Doe, tracking IDs, and JSON fixtures are not automatically translation errors.

### F4 — Reflow fixes reproduced successfully

Both hosts now report document width equal to viewport width at 320px and at 390px with 200% root text sizing, including the Arabic probe. The grids cap their minimum track size to available space. No page-level overflow-hiding workaround was needed in the reviewed patch.

### F5 — Textarea cancellation fixed; Input's new regression test is misleading

Textarea Submit → Reset → wait beyond the timer now remains reset on both hosts. Its form helper/error IDs are linked.

However, Input's reset button still has `disabled={isSubmitting}` at `input-gallery.tsx:558`. The new test at `dashboard/e2e/input.spec.ts:369–387` claims to reset immediately while pending, but `resetBtn.click()` waits for the button to become enabled after normal completion. Measured waits were about 1001ms (Dashboard) and 1063ms (Website), rather than a pending-state cancellation. The Website copy has the same test issue.

Choose and test the intended UX honestly:
1. Allow Reset during pending, cancel the timer, and assert Reset is enabled while status is pending before clicking; or
2. Keep Reset disabled intentionally. Rename the test to reflect reset-after-completion and separately test actual timer cancellation via a supported reset/unmount path.

Do not use force clicks to simulate an unavailable user action and then claim the UI supports cancellation.

The standalone Textarea help/error specimen at `textarea-gallery.tsx:349–359` also still shows and describes an error while omitting `aria-invalid`. If it depicts an actual validation error, set invalid accordingly or make the error conditional.

### F6 — Invalid/read-only precedence fixed

Explicit combined selectors restore the error border. Keep disabled+invalid precedence documented. Read-only's distinct surface is not a reason to lose its focus indicator.

### F7 — Rendered icon sizing fixed, test does not prove its title

Actual Button slot SVGs now match the slots: 16px Dashboard, 20px Website for default slots. Icons continue to come through the registry.

But `dashboard/e2e/button.spec.ts:138–156` only asserts positive width/height and squareness. A wrongly sized square SVG still passes. Assert both rendered dimensions against the resolved control icon-size token or its measured slot; cover explicit sizes as well as product defaults. The computed inline/block values currently collected are not used in assertions.

### F8 — Partial: Button gallery static IDs remain

Input and Textarea specimen IDs are instance-generated. Button gallery still has `id="gallery-btn-default"` at line 138 and `id="gallery-interactive-loading"` at line 205. Generate per-instance IDs or replace test-only IDs with scoped data-testid locators. Existing separate routes do not currently collide; this is reuse hygiene, not an active exploit.

### F9 — Formatting fixed in scoped verification; fallback exception remains

Scoped Biome formatting checks pass for both Next.js starters. Textarea no longer needs resize !important. Input/Textarea gallery code boxes retain both `overflow-x: auto` and `overflow-inline: auto` (`input-gallery.module.css:172–173`, equivalent Textarea rule). This can be a valid horizontal-writing compatibility fallback, but it contradicts an unqualified “physical overflow fully removed” report. Document the narrow exception or remove the fallback after checking the supported-browser contract.

## Independent checks for this patch

- Frozen-lockfile install with scripts disabled: passed.
- Canonical synchronization: zero drift.
- Dashboard shadow check: passed.
- Three primitive unit suites: 39 tests passed per starter (117 total).
- TypeScript: passed in Dashboard, Website and Vite.
- Scoped formatting: passed in Dashboard and Website.
- Committed Button/Input/Textarea browser suites: Dashboard 54 passed; Website Input/Textarea 46 passed, using system Chromium and the existing desktop/mobile viewport projects.
- Extra probes: label association, actual icon/slot dimensions, RTL, narrow/enlarged-text document width, Textarea reset stability, and the Input reset auto-wait issue described above.

Passing suites do not invalidate the remaining findings: one new test proves less than its name claims, and another can pass after waiting out the operation it claims to cancel. Production builds, a fresh advisory scan, full application suites, Safari/Firefox, physical devices and manual assistive-technology testing were not rerun for this patch review.

No changes were made to the user's repository, and no commits or pushes were performed. All reconstruction and tests were in an isolated local review copy.

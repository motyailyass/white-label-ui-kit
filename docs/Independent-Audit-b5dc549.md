# Independent remediation audit — b5dc549

## Verdict

**Substantial remediation, but not ready for foundation sign-off.** This review tested the exact commit `b5dc549ae0f4bab62651ed30ff9595169582227f`, not the teammate's working directory. No application fixes were applied or pushed.

Scope: remediation diff against `fbb623e`, source inspection of affected contracts, repository quality gates, committed standalone frozen installs, both complete Next.js Chromium suites, and targeted browser fault/interaction probes. This is not a certification of every line, all accessibility criteria, all browser engines, or future primitives.

## Reproducibility and results

Environment: Linux, Node 24.22.1, pnpm 12.16.1, installed Playwright Chromium. The committed CI uses Node 22; this is not a complete reproduction of its runner image.

**The committed root frozen install fails.** For downstream diagnosis only, the audit copy's root lockfile was regenerated with `pnpm install --no-frozen-lockfile --ignore-scripts`. This corrected the two Biome specifiers and added the missing Vite importer. The passing downstream results below are conditional on that local lockfile repair, not evidence that the committed install works.

| Check | Independent result |
|---|---|
| Root `pnpm install --frozen-lockfile --ignore-scripts` | FAIL: outdated lockfile |
| Extracted Next dashboard frozen install | FAIL: Biome specifier mismatch |
| Extracted Next website frozen install | FAIL: Biome specifier mismatch |
| Extracted Vite dashboard frozen install | FAIL: no committed standalone lockfile |
| Shared sync / dashboard shadow checker | PASS |
| Recursive format / lint / type check | PASS after diagnostic install |
| Next dashboard Vitest | 87/87, 25 files |
| Next website Vitest | 78/78, 23 files |
| Vite dashboard Vitest | 70/70, 22 files |
| Production builds | All three PASS after diagnostic install |
| Dashboard complete Chromium suite, workers=1 | **86 passed, 4 failed** |
| Website complete Chromium suite, workers=1 | **80 passed** |
| Vite browser smoke | English/Arabic, RTL, loaded local fonts verified; defects below |

An initial browser run overlapped builds and suffered additional timeouts/server loss. Those results are not used as the stable final totals. The later isolated workers=1 reruns produced the totals above.

## Findings and required remediation

### F01 — P1: lockfiles do not reproduce the published project

The Next manifests request Biome `^2.6.4`, while both standalone locks and the root's corresponding importers retain `^2.6.3`. The root lock also lacks the new Vite workspace importer. Vite has no standalone `pnpm-lock.yaml`. CI explicitly uses frozen installation, so it stops before lint/test/build.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/pnpm-lock.yaml#L190-L193
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/pnpm-lock.yaml#L26-L29
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/package.json#L25-L28
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/.github/workflows/ci.yml#L21-L33

**Fix:** regenerate and commit the root lock and both Next standalone locks; create a Vite standalone lock. Verify root and each clean extracted starter with the pinned pnpm version and frozen installation. Do not substitute npm installation or a locally regenerated lock for committed reproducibility.

### F02 — P1: mobile modal focus is still incomplete; drawer-opening regressions remain

Independent keyboard reproduction on `/classic`, 390px, after waiting until the closed sidebar has its JS-applied `inert` attribute:
1. Click the sidebar trigger.
2. Wait until the opening motion finishes.
3. Focus remains on the trigger, outside the modal sidebar.
4. Press Tab: focus moves to the background LanguageSwitcher, not into the sidebar.

The effect attempts focus once and the Tab handler wraps only when focus is already at the first/last item. It does not recover focus that starts outside. Background content is not made inert. The animated visibility/focus sequencing needs correction; simply having a keydown listener does not establish a functional focus trap.

On `/three-column`, open sidebar using Ctrl+B, then inspector using Ctrl+period: both acquire modal semantics. One Escape closes both, because both global listeners independently process it. A ref-counted body lock is useful, but it does not establish topmost-modal ownership or background isolation.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/shell/sidebar/sidebar.tsx#L58-L119
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/shell/sidebar/sidebar.module.css#L301-L328
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/shell/panel/panel.tsx#L77-L140

The stable dashboard suite also has four failures:
- Desktop `motion.spec.ts:64`: drawer lifecycle/opening.
- Desktop `z-index.spec.ts:16`: drawer/backdrop opening.
- Desktop `z-index.spec.ts:136`: backdrop opening/click interception.
- Mobile `z-index.spec.ts:16`: drawer/backdrop opening.

The failed opening assertions receive `false` instead of `true`. Initial viewport state is still `false` until an effect updates it, and the trigger chooses desktop/mobile behavior using that state. Investigate hydration/viewport readiness rather than asserting that the suite is green; this review does not claim that one source mechanism explains every failing case.

**Fix:** make opening/focus reliable without waiting on transition-end events. Ensure focus enters the visible modal, recover escaped focus, make inactive background unavailable, and either prevent concurrent modal drawers or implement topmost ownership for Escape, focus, inertness and restoration. Add regression tests for normal motion and reduced motion, initial keyboard focus, Tab from outside, both overlays, and resize. Do not conceal failures with fixed sleeps or retries.

### F03 — P2: Button spinner still has no running animation

In the real rendered loading button:
- computed animation name: `button-module__TwuVaa__spin`;
- registered application keyframe: global `spin`;
- `spinner.getAnimations().length`: **0** under normal motion.

The CSS Module scopes the animation name but the keyframes remain in another global stylesheet.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/ui/button/button.module.css#L199-L214
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/styles/globals.css#L100-L107

**Fix:** co-locate named keyframes with the module that references them, or deliberately reference a global animation correctly. Assert an actual running animation under normal preference, and none under reduced motion, in each bundler. Keep the component's state lifecycle independent of animation events.

### F04 — P2: loading width is not stable

Preserving `endIcon` fixes only one case. Without a start icon, loading inserts a spinner and gap that did not previously occupy space. For the real `Saving Changes` fixture, width measured **138px without the spinner vs 162px loading**; height remained 36px.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/ui/button/button.tsx#L46-L52
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/e2e/control-sizing.spec.ts#L72-L85

**Fix:** use stable layout/overlay or a genuinely reserved loading slot. Test the same label before/after loading, measuring both width and height: no icons, start only, end only, both, long translations, RTL, and reduced motion. The current test compares only heights of differently labelled buttons.

### F05 — P2: omitted Button touchTarget still bypasses the project's automatic policy

`Button` does not default `touchTarget` to `auto`, and the coarse-pointer CSS applies only to `[data-touch-target="auto"]`. In a real coarse-pointer context:
- omitted prop: **36px** height, attribute absent;
- explicitly `auto`: **48px** height.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/ui/button/button.tsx#L15-L24
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/src/components/ui/button/button.module.css#L96-L106

**Fix:** default the API to `auto` and regression-test omission on coarse pointers. If opting out is needed, design and document an explicit opt-out. The 48px value is this project's chosen interaction-target policy, not a claim that WCAG universally mandates 48px.

### F06 — P2: unresolved typography/status variables remain, especially in Vite

Vite `App.module.css` references four undefined tokens:
- `--typography-metric-size`
- `--typography-metric-line-height`
- `--typography-metric-weight`
- `--color-status-success`

Its real revenue metric computes to **14px / 20px / 400**, not the defined metric-value role **28px / 36px / 600**. The positive delta inherits ordinary text color instead of the success role.

Correct existing names are `--typography-metric-value-*` and `--color-success`.

Other unresolved references include Website `--line-height-xs`, `--line-height-2xl`, `--letter-spacing-wider`, and fixture `--type-page-title-leading`. A size reference with a valid fallback is not itself a failure; a missing chain with no valid fallback is. Generated `next/font` variables are not missing tokens.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/vite/starterkit/dashboard/src/App.module.css#L109-L120
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/vite/starterkit/dashboard/src/styles/dashboard/typography.css#L38-L40
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/website/src/wireframes/tokyo/sections/tokyo-navbar.module.css#L40-L50

**Fix:** consume the approved existing semantic roles rather than adding accidental duplicate scales. Add a reference-resolution check that understands fallbacks and approved runtime variables, plus computed-style tests on real Vite and website elements.

### F07 — P2: Vite theme bootstrap reads the wrong persistence key

Vite `index.html` reads `ui-theme`; the provider defaults to `theme`. With a light OS preference and saved `theme=dark`, the pre-React bootstrap renders light, and the provider later changes it to dark. This was reproduced by delaying the main entry script, then allowing React to run.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/vite/starterkit/dashboard/index.html#L7-L20
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/vite/starterkit/dashboard/src/providers/theme-provider.tsx#L30-L47

**Fix:** use one configured storage key across bootstrap and provider. Test both saved-theme/system-theme disagreement directions with delayed JavaScript. Assert that there is no intermediate incorrect theme, not only the final state.

### F08 — P2: several passing tests still overstate what they verify

The self-hosted-font test collects faces and statuses but checks only that the list is nonempty. Fault injection aborting WOFF2 requests left the actual Geist face at `status="error"`, while the exact existing condition still passed because registered/fallback faces exist.

Both z-index specs still construct synthetic modal/dropdown divs. Those are useful CSS stacking fixtures, not evidence that a real nested modal/portal implementation works. Typography now uses real app/fixture elements, which is an improvement, but this does not remedy the remaining font and overlay coverage gaps.

Sources:
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/e2e/typography.spec.ts#L124-L147
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/dashboard/e2e/z-index.spec.ts#L89-L134
- https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/website/e2e/z-index.spec.ts#L60-L107

**Fix:** request and verify each intended font face with representative Latin/Arabic/mono text and successful font responses/status, avoiding fallback-only success; require a font-blocking negative test to fail. Label synthetic stacking tests honestly, and test actual Sidebar/Panel overlap now. Do not build future primitives just to satisfy an overbroad audit claim.

### F09 — P2 follow-up: PricingTier still silently invents currency

The formatter itself correctly requires currency and invalid translation keys now fail compilation. However, `PricingTier.currency` is optional and numeric prices are formatted with `tier.currency ?? 'USD'`. Custom numeric pricing data without currency therefore silently becomes USD, despite the approved explicit data-currency contract.

Source: https://github.com/motyailyass/white-label-ui-kit/blob/b5dc549/typescript/nextjs/starterkit/website/src/wireframes/tokyo/sections/tokyo-pricing.tsx#L11-L21 and #L144-L149

**Fix:** require explicit currency for monetary numeric tiers. If custom display strings such as “Contact sales” are needed, model those as a distinct non-monetary variant. Keep explicit USD on demo records, not as a hidden data fallback. Add custom EUR/JPY tier tests across locale changes.

## Confirmed improvements to preserve

- Exact-768px behavior and mobile-to-desktop cleanup worked in the hydrated targeted probe: drawer closed, modal role removed, body overflow restored.
- Button now defaults to `type="button"`, uses logical start/end slots, and exposes loading busy state.
- Invalid translation keys and omitted currency arguments are rejected by an independent negative compile probe.
- Percentage fallback, namespace ownership, host-local refresh/metadata wiring, localized website copy, and footer/provider theme ownership have substantive source/test improvements.
- Shared sync and dashboard shadow policy pass; all three apps compile; Vite is genuinely Next-independent and its local Latin/Arabic fonts loaded in the smoke probe.
- Website disclosure can remain non-modal. Existing forwardRef, foundation aliases, future APIs/templates, and intentional dashboard/website density differences should not be rewritten or removed just to reduce unused counts.

## Recommended next patch sequence

1. Commit reproducible root and standalone lockfiles.
2. Fix drawer focus/readiness and establish modal ownership/background isolation.
3. Correct Button animation, loading geometry, and default touch policy; sync canonical fixes.
4. Repair Vite/website token references and Vite theme bootstrap key.
5. Tighten pricing data currency and the false-positive tests.
6. Rerun clean frozen installs, all gates, and both complete browser suites; add Vite browser regression coverage for metrics and first-paint theme.

A clean rerun of those exact scenarios is required before closing the foundation audit. Passing unit tests, source comments, or a report from a different local dependency state are not substitutes.

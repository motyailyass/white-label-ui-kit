---
trigger: glob
globs: "**/src/**/*.tsx, **/src/**/*.css"
description: Semantic HTML5 landmarks, heading hierarchy, native elements, and HTML lang / bidi script restoration rules.
---

# 38-semantic-html-lang: Semantic HTML5, Landmarks & `lang` Attribute Rules

Detailed architectural rationale: @docs/standards/RTL_AND_I18N.md

## 1. Document & Subtree `lang` Attribute Mandate (WCAG 3.1.1 & 3.1.2)
HTML `lang` is NOT cosmetic in this UI kit—it drives both assistive technology voice synthesis AND CSS `:lang()` typography/tracking rules in `globals.css`.

- **Root `<html lang={locale} dir={direction}>`**: Every root `layout.tsx` AND `global-error.tsx` must set `lang` and derived `dir` from the active locale (never hardcode `lang="en" dir="ltr"` on error boundaries). Client locale switches in `I18nProvider` must synchronize `document.documentElement.lang` and `dir` immediately.
- **Foreign-language UI labels**: Whenever an element renders text in a specific language that may differ from the document locale—such as `<LanguageSwitcher>` `<option>` items (`English`, `Français`, `العربية`)—explicitly set `lang={loc.code}` (and `dir={getDirectionForLocale(loc.code)}`) on that element.
- **Separate human-language `lang` from LTR direction (`<BidiText>`)**:
  - In `globals.css`, `:lang(ar)` switches font family to `--font-family-arabic` (`Noto Sans Arabic`), forces `letter-spacing: normal`, and disables `text-transform: uppercase`. Nested `:lang(en)` and `:lang(fr)` restore `--font-family-sans` (`Geist`) and Latin tracking without being clobbered by `:lang(ar)` descendant selectors.
  - Set explicit `lang="..."` strictly on **actual human-language subtrees** whose language differs from the document—such as `<LanguageSwitcher>` `<option>` labels (`lang={loc.code}`), quoted foreign prose, untranslated brand/product prose, or English code/CLI documentation blocks (`<pre lang="en" dir="ltr"><code>...</code></pre>`).
  - Do **NOT** blanket-tag language-neutral identifiers (`#US-8942-BIDI`), phone numbers (`+1 (800) 555-0199`), formatted currencies, percentages, or numeric metrics with `lang="en"` merely because they run LTR—use `<BidiText dir="ltr">` (`<bdi>`) alone to isolate their directionality.
- **CSS `:lang()` parity**: Any Latin script-restoration rule in CSS must include ALL supported Latin locales (`:lang(en), :lang(fr)`), never `:lang(en)` alone. Target explicit `data-role="eyebrow" | "badge"` attributes rather than fragile `[class*="..."]` substring selectors or `!important`.

## 2. Honest Landmark & Sectioning Semantics
Semantics must describe real behavior and content—never apply extra tags or ARIA roles as a mechanical checklist:
- **Single `<main>` per route**: Every rendered route—including `error.tsx`, `not-found.tsx`, `global-error.tsx`, and `loading.tsx`—must contain exactly one `<main>` landmark.
- **Named navigation & complementary regions**: When more than one `<nav>` (e.g., sidebar nav, breadcrumbs, mobile nav, footer column nav) or `<aside>` (sidebar + docked inspector panel) can appear on a page, EVERY instance must have a unique, localized `aria-label` via `t()`.
- **Honest containers (avoid over-tagging)**:
  - Page/panel chrome: `<header>` and `<footer>`.
  - Thematic page blocks: `<section aria-labelledby={headingId}>`.
  - Reserve `<article>` strictly for genuinely syndicatable, self-contained documents (blog posts, news entries, forum comments)—a metric card, feature tile, or pricing box is **not** automatically an `<article>`.
  - Reserve `role="toolbar"` strictly for composite control bars that implement full WAI-ARIA roving-tabindex arrow-key navigation; otherwise use a standard grouped `<div>`.
  - Grouped form controls (`RadioGroup`, `CheckboxGroup`): `<fieldset>` + `<legend>`.
  - Navigation items, breadcrumbs, and feature lists: `<ul>` / `<ol>` + `<li>`.
  - Dates & timestamps: `<time dateTime={isoString}>`.

## 3. Sequential Heading Hierarchy (`<h1>` → `<h6>`)
- **One `<h1>` per view**: Every page view (dashboard routes, landing pages, 404/error views) must render exactly one primary `<h1>` describing the view.
- **Zero skipped levels**: Headings must descend sequentially (`<h1>` → `<h2>` → `<h3>`). Never start a page at `<h2>`/`<h3>` or jump from `<h1>` directly to `<h3>`.
- **Configurable heading slots**: Reusable headers, panels, empty/error states, and cards (`HeaderHeading`, `PanelHeader`, `ErrorState`, `CardTitle`) must expose a heading-level prop (`as?: 'h1' | 'h2' | 'h3' | 'h4'`) so callers preserve valid document outlines in any nesting context.

## 4. Native Interactive Elements & Live Feedback
- **Buttons vs Links**: Use `<button type="button">` for state changes/actions (toggles, modals, drawers, retries) and `<a href="...">` (or `as={Link}`) for URL navigation. Never attach `onClick` or `cursor: pointer` to a non-interactive `<div>`/`<span>`, and never use `<a href="#">` as a fake button.
- **Disclosures & Toggles**: Use native `<details>`/`<summary>` or `<button type="button" aria-expanded={open} aria-controls={panelId}>` paired with `<div id={panelId} role="region">` for accordions/FAQs. Toggle buttons (e.g., billing cycle, theme toggle) must expose `aria-pressed={isActive}`.
- **Dynamic announcements**: Wrap async form confirmations in `role="status"` (`aria-live="polite"`) and error states/alerts in `role="alert"`.

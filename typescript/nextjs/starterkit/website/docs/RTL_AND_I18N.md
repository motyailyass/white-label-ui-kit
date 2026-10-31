# RTL & Internationalization (i18n) Architecture Standard

**Document Status:** Official Architectural Standard  
**Applies to:** Core UI Library, Website Starter Kit, and Dashboard Starter Kit (`Next.js` and `Vite` implementations)

---

## 1. Executive Mandate: The "Zero-Retrofit" RTL Architecture

For any product serving the Middle East & North Africa (MENA) or global multilingual markets, **Right-to-Left (RTL) and Internationalization (i18n) are non-negotiable architectural requirements**.

> [!IMPORTANT]
> **Why Retrofitting RTL Fails**:
> Retrofitting RTL after authoring dozens of components requires auditing thousands of CSS rules, untangling physical `left`/`right` coordinates, fixing scrambled punctuation in mixed-script strings, and rewriting hardcoded English props. Building every token, primitive, shell, and section natively bidirectional from day one eliminates retrofit debt completely.

---

## 2. Core Pillars of the RTL & i18n System

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NATIVE RTL & i18n SYSTEM                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Locale Source of Truth       • dir derived strictly from locale     │
│                                 • SSR cookie read (getServerI18nState) │
│                                 • Host onLocaleChange refresh bridge   │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CSS Logical Properties       • margin-inline, padding-block         │
│                                 • inset-inline-*, border-inline-*      │
│                                 • text-align: start / end              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Honest Bidi & lang Tagging   • <BidiText dir="ltr"> (<bdi> isolate) │
│                                 • lang="..." for foreign human prose   │
│                                 • No fake lang="en" on neutral IDs/#s  │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Self-Hosted Arabic Type      • Noto Sans Arabic + Geist Variable    │
│                                 • :lang(ar) clearance & normal tracking│
│                                 • Nested :lang(en)/:lang(fr) restore   │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Strict Dictionaries & Intl   • Compile-time TranslationKey (no any) │
│                                 • Starter-isolated message namespaces  │
│                                 • Data-owned currency formatting       │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Semantic Icon Mirroring      • directional() in icons/registry.ts   │
│                                 • [dir="rtl"] .mirror scaleX(-1)       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Locale & Direction Lifecycle (`src/providers/` & `src/app/`)

### A. Locale Is the Single Source of Truth
`dir` is never toggled independently of `locale`; it derives deterministically via `getDirectionForLocale(locale)` (`ar` → `rtl`, `en`/`fr` → `ltr`):
- Root document: `<html lang={locale} dir={direction}>`.
- Mixed-language subtrees: `<option lang={loc.code}>` or `<span lang="en">` / `<span lang="fr">`.

### B. Server-Side First Paint & Host Refresh Bridge (Next.js)
1. In Next.js `src/app/layout.tsx`, `getServerI18nState('en')` reads and validates the `locale` cookie on the server so SSR streams the exact `lang` and `dir` on the first byte without LTR-to-RTL layout shift:
   ```tsx
   // src/app/layout.tsx
   export default async function RootLayout({ children }: { children: React.ReactNode }) {
     const { locale, direction } = await getServerI18nState('en');
     return (
       <html lang={locale} dir={direction} suppressHydrationWarning>
         <body>
           <AppProvidersBridge initialLocale={locale}>
             {children}
           </AppProvidersBridge>
         </body>
       </html>
     );
   }
   ```
2. `I18nProvider` remains 100% framework-neutral (zero `next/navigation` imports). It persists `locale` to `document.cookie`, updates `document.documentElement.lang` and `document.documentElement.dir`, and invokes an optional `onLocaleChange?: (locale: SupportedLocale) => void` callback.
3. `src/app/app-providers-bridge.tsx` wires `onLocaleChange={() => router.refresh()}` at the Next.js host boundary so Server Components re-render localized content immediately when the user switches languages. In Vite (`src/App.tsx`), `AppProviders` runs directly without Next.js router glue.

### C. Consuming `useI18n()`
Connected patterns, shells, and route components read i18n state from `@/providers`:

```tsx
import { useI18n } from '@/providers';

const {
  locale,
  direction,
  isRtl,
  setLocale,
  t,
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
} = useI18n();
```

---

## 4. Strict Dictionaries & Starter Ownership (`src/i18n/messages/`)

### A. Compile-Time `TranslationKey` Safety
`TranslationKey` is derived directly from the active starter's `enMessages` schema without `(string & {})` widening or fallback string parameters. Passing an unknown key is a compile-time TypeScript error (`tsc --noEmit`), and missing runtime keys fail visibly by returning the key string cleanly while substituting `{param}` placeholders via `replaceAll`.

```tsx
import { useI18n } from '@/providers';

function OverviewHeader() {
  const { t } = useI18n();

  return (
    <header>
      <h1>{t('dashboard.overview.title')}</h1>
      <p>{t('common.pagination.showing', { start: 1, end: 10, total: 42 })}</p>
    </header>
  );
}
```

### B. Starter Dictionary Isolation
Synchronization (`scripts/sync-shared.mjs`) enforces clean product dictionary boundaries so website bundles never ship dashboard strings and vice versa:
- **Shared (`dashboard` → `website`)**: `src/i18n/` engine (`config.ts`, `types.ts`, `translate.ts`, `formatters.ts`, `bidi.tsx`, `index.ts`) plus `messages/{en,fr,ar}/{common,errors}.ts`.
- **Dashboard-owned**: `messages/{en,fr,ar}/{dashboard,settings}.ts`, `messages/index.ts`, and `messages.test.ts`.
- **Website-owned**: `messages/{en,fr,ar}/website.ts`, `messages/index.ts`, and `messages.test.ts`.

---

## 5. Strict CSS Logical Properties Mandate

Physical directional properties (`margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, `right`, `border-left`, `border-right`, `float: left`, `text-align: left`) are prohibited across components, shells, layouts, and sections.

| Prohibited Physical Property | Required Logical Property | LTR Result | RTL Result |
| :--- | :--- | :--- | :--- |
| `margin-left` / `margin-right` | `margin-inline-start` / `margin-inline-end` | Left / Right | Right / Left |
| `padding-left` / `padding-right` | `padding-inline-start` / `padding-inline-end` | Left / Right | Right / Left |
| `left` / `right` | `inset-inline-start` / `inset-inline-end` | Left / Right | Right / Left |
| `border-left` / `border-right` | `border-inline-start` / `border-inline-end` | Left / Right | Right / Left |
| `text-align: left` / `right` | `text-align: start` / `text-align: end` | Left / Right | Right / Left |
| `border-radius: 8px 0 0 8px` | `border-start-start-radius` / `border-end-start-radius` | Left corners | Right corners |

---

## 6. Bi-directional (`<BidiText>`) vs. `lang` Semantics

### A. Isolating LTR Tokens Inside RTL Prose (`<BidiText>`)
When RTL text embeds LTR fragments (IDs, phone numbers, emails, URLs, formatted metrics), browser bidi algorithms can scramble adjacent punctuation. Wrap embedded tokens in `<BidiText>` from `@/i18n` (which renders native `<bdi>` with `unicode-bidi: isolate`):

```tsx
import { BidiText } from '@/i18n';

<p>
  {t('dashboard.inspector.sampleIdLabel')}: <BidiText dir="ltr">#US-8942-BIDI</BidiText>
</p>
```

### B. Separating Direction (`dir`) from Human Language (`lang`)
- **Language-neutral values** (alphanumeric IDs like `#US-8942-BIDI`, phone numbers like `+1 (800) 555-0199`, and numeric metrics) use `<BidiText dir="ltr">` for directional isolation **without** `lang="en"`.
- **Actual foreign human-language labels, prose, or code** inside a localized document (such as native language names in `<LanguageSwitcher>` `<option lang={loc.code}>` or embedded English/French phrases inside an Arabic page) declare explicit `lang="en"` / `lang="fr"` / `lang="ar"`.

---

## 7. Self-Hosted Arabic Typography & `:lang()` Restoration

Typography rules bind to `:lang(...)` rather than `[dir="rtl"]`, ensuring accurate glyph rendering and nested-script restoration:

1. **Font Stacks (`src/styles/tokens/typography.css` & `globals.css`)**:
   - `--font-family-sans`: Self-hosted `Geist-Variable.woff2` + system fallbacks.
   - `--font-family-mono`: Self-hosted `GeistMono-Variable.woff2` + monospace fallbacks.
   - `--font-family-arabic`: Self-hosted `NotoSansArabic-Variable.woff2` + Arabic fallbacks.
2. **Role-Appropriate Arabic Clearance (`styles/{dashboard,website}/typography.css`)**:
   - `:root:lang(ar)` increases semantic role line-heights (e.g., dashboard body `20px` → `24px`, page title `32px` → `40px`) so Tashkeel diacritics and tall ascenders/descenders never clip. Controls preserve `min-block-size` and `overflow: visible`.
3. **Cursive Ligature Protection & Nested Latin Restoration (`globals.css`)**:
   - Arabic cursive script resets `letter-spacing: normal` (including `[data-role="eyebrow"]:lang(ar)` and `[data-role="badge"]:lang(ar)` with `text-transform: none`) without clobbering nested `:lang(en)` or `:lang(fr)` descendants.
   - `:lang(ar) :is(:lang(en), :lang(fr))` restores `var(--font-family-sans)` and Latin tracking (`--tracking-caps`) on nested English and French elements.

---

## 8. Native `Intl` Formatting & Data-Owned Currency Contract

All number, currency, percentage, and date formatting lives in `src/i18n/formatters.ts` using native `Intl` APIs:

> [!IMPORTANT]
> **Currency Contract**: **The data determines the currency. The locale determines how it is displayed.** Switching the UI from English to French or Arabic formats the amount according to the active locale's conventions (`$1,250.00` → `1 250,00 $US`)—it **never** silently converts `USD` into `EUR` or `SAR`.

```tsx
import {
  formatNumber,
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
} from '@/i18n';

// 1. Number formatting (supports 'latn' and 'arab' numbering systems)
formatNumber(14290, { locale: 'ar', numberingSystem: 'arab' }); // "١٤٬٢٩٠"
formatNumber(14290, { locale: 'en' }); // "14,290"

// 2. Data-driven currency formatting (currency comes from the data record)
formatCurrency(28450, record.currency, { locale: 'fr' }); // e.g. "28 450,00 $US" when record.currency === 'USD'
formatCurrency(28450, 'SAR', { locale: 'ar' });

// 3. Fractional percentage formatting (0.125 -> 12.5%, including fallback)
formatPercent(0.125, { locale: 'en', maximumFractionDigits: 1 }); // "12.5%"

// 4. Date & relative time formatting
formatDate(new Date(), { locale: 'ar', dateStyle: 'medium' });
formatRelativeTime(-5, 'minute', { locale: 'ar' });
```

---

## 9. Semantic Icon Registry & Directional Mirroring (`src/components/icons/`)

Directional icons (chevrons, arrows, sidebar/panel rail toggles) flip automatically in RTL while symmetric or object icons (theme sun/moon, checkmarks, search, globe) remain unmirrored:
- Vendor icons (`@hugeicons/*`) are imported exclusively inside `src/components/icons/registry.ts`.
- Directional entries wrap their glyph with `directional(IconGlyph)`.
- `<Icon name="chevron-right" />` adds `.mirror` when `entry.mirrorInRtl` is true:
  ```css
  /* src/components/icons/icon.module.css */
  [dir="rtl"] .mirror {
    transform: scaleX(-1);
  }
  ```

---

## 10. Dynamic IDs, Touch Targets & Honest Overlay Semantics

- **Dynamic DOM IDs**: Reusable components (`LanguageSwitcher`, `Sidebar` via `LayoutContext`, `TokyoNavbar` mobile disclosure, `TokyoFaq` items) generate unique IDs via `React.useId()` so multiple instances never collide.
- **Control Touch Targets**: Interactive controls respect product-owned minimum heights (`36px` dashboard `md`, `48px` website `xl`) and expose `48×48px` coarse-pointer hit areas via `data-touch-target="auto"` (`--control-touch-target-min: 3rem`).
- **Honest Modal vs. Disclosure Semantics**:
  - **Dashboard Mobile `Sidebar` (`<= 768px`) & Overlay/Compact `Panel` (`<= 1024px` or `mode="overlay"`)**: Modal `<aside role="dialog" aria-modal="true">` with backdrop, `Escape` dismissal, Tab/Shift+Tab focus containment, focus restoration, and ref-counted body scroll locking (`acquireBodyScrollLock()`), automatically cleaning up when crossing back to desktop.
  - **Website `TokyoNavbar` Mobile Menu**: Non-modal disclosure (`aria-expanded`, `aria-controls`, `hidden={!mobileOpen}`, `Escape` dismissal with focus return to trigger)—without forcing unnecessary modal dialog traps or scroll locks onto top-level site navigation.

---

## 11. Pre-Flight RTL, Semantics & i18n Checklist

- [ ] **Logical CSS Only**: Zero physical directional properties or inline `width`/`minWidth` overrides.
- [ ] **Strict `t()` Keys**: Every user-facing string comes from typed dictionaries (`common`, `errors`, `dashboard`/`settings`, or `website`) with zero hardcoded English fallbacks.
- [ ] **Data-Owned Currency**: `formatCurrency(amount, record.currency)` receives currency from data, never from `locale`.
- [ ] **Honest `lang` & `<BidiText>`**: `<BidiText dir="ltr">` isolates neutral LTR tokens; `lang="..."` marks genuine foreign human-language labels/prose.
- [ ] **Dynamic IDs & Landmarks**: `React.useId()` for `aria-controls`/`htmlFor`; valid `<header>`, `<nav aria-label>`, `<main>`, `<footer>`, and sequential `<h1>` → `<h6>` headings across all routes and error states.
- [ ] **Icon Mirroring**: All icons render through `<Icon name="..." />` with directional glyphs marked via `directional()` in `registry.ts`.

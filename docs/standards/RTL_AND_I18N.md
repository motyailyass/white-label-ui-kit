# RTL & Internationalization (i18n) Architecture Standard

**Document Status:** Official Architectural Standard  
**Applies to:** Universal Core UI Library (60 Components), Website Starter Kit, and Dashboard Starter Kit (`Next.js` and `Vite` implementations)

---

## 1. Executive Mandate: The "Zero-Retrofit" RTL Architecture

For any product serving the Middle East & North Africa (MENA) or global multi-lingual markets, **Right-to-Left (RTL) and Internationalization (i18n) are non-negotiable architectural requirements**.

> [!IMPORTANT]
> **Why Retrofitting RTL is Painful**:
> In a design system with 60+ UI components, retrofitting RTL after the fact requires auditing thousands of CSS declarations, untangling hardcoded `left`/`right` coordinates, debugging scrambled punctuation in mixed-language strings, and manually flipping icons.
> 
> By mandating native RTL and i18n at the foundational token, layout, and component layer **now**, all 60 UI components are built natively bidirectional from day one with **zero retrofit debt**.

---

## 2. Core Pillars of the RTL & i18n Standard

```
┌────────────────────────────────────────────────────────────────────────┐
│                        NATIVE RTL & i18n SYSTEM                        │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Direction & SSR Cookies      • dir="rtl" / dir="ltr" on <html>      │
│                                 • Zero-flash first-paint cookie read   │
│                                 • Native I18nProvider & useDirection() │
├────────────────────────────────────────────────────────────────────────┤
│ 2. CSS Logical Properties       • margin-inline, padding-block         │
│                                 • inset-inline-*, border-inline-*      │
│                                 • text-align: start / end              │
├────────────────────────────────────────────────────────────────────────┤
│ 3. Bi-directional (Bidi) Text   • <BidiText> wrapper & native <bdi>    │
│                                 • unicode-bidi: isolate;               │
│                                 • Punctuation flip prevention          │
├────────────────────────────────────────────────────────────────────────┤
│ 4. Arabic Typography Stack      • Cairo / IBM Plex Sans Arabic tokens  │
│                                 • Line-height vertical compensation    │
├────────────────────────────────────────────────────────────────────────┤
│ 5. Native Intl & Dictionaries   • Zero-dependency Intl.NumberFormat    │
│                                 • Typed dictionary + t(key, params)    │
│                                 • Gregorian & Hijri date formatting    │
├────────────────────────────────────────────────────────────────────────┤
│ 6. Mirrored Icons Standard      • Directional vs Non-directional SVGs  │
│                                 • [data-mirror-rtl="true"] automation  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Direction & Locale Management (`src/providers/` & `src/i18n/`)

### A. Document & Container Level `dir`
The HTML `dir` attribute is strictly derived from the validated `SupportedLocale` (`ar` -> `rtl`, `en`/`fr` -> `ltr`):
- Document root: `<html lang="ar" dir="rtl">` or `<html lang="en" dir="ltr">`.
- Sub-trees: Isolated components (e.g., code editors, LTR snippets) may specify `<div dir="ltr">` locally.

### B. Server-Side First Paint (Zero-Flash Direction)
Setting `dir` solely in a client-side `useEffect` results in an unacceptable layout shift (flash of LTR) on the first paint when Arabic is active.

**The Solution:**
1. In Next.js App Router (Server Component `layout.tsx`), read the validated `locale` cookie via `getServerI18nState()`:
   ```tsx
   // src/app/layout.tsx
   export default async function RootLayout({ children }: { children: React.ReactNode }) {
     const { locale, direction } = await getServerI18nState('en');
     return (
       <html lang={locale} dir={direction} suppressHydrationWarning>
         <body>
           <AppProviders initialLocale={locale}>
             {children}
           </AppProviders>
         </body>
       </html>
     );
   }
   ```
2. When the user switches language on the client, `I18nProvider` immediately persists the preference to `document.cookie` (`locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`). Direction is strictly derived, eliminating drift between language and layout direction. Subsequent server requests stream the correct `dir` and `lang` on the very first byte.

### C. The `I18nProvider` & React Hooks
Direction and locale state is consumed through zero-dependency React context in `src/providers/`:

```tsx
import { useI18n } from '@/providers/i18n-provider';

// Inside any feature / pattern component:
const { locale, direction, isRtl, setLocale, t, formatNumber, formatCurrency, formatDate } = useI18n();
```

---

## 4. Translation Strategy: Namespaced Messages + `t()`

> [!IMPORTANT]
> **Architectural Decision:**
> The starter kit ships typed, namespaced messages (`src/i18n/messages/`) rather than relying on brittle inline ternary operators (`isRtl ? 'عربي' : 'English'`). Missing translations fail loudly rather than masking bugs behind invisible or corrupted fallbacks.

### Why Inline Ternaries Fail:
- They couple copy directly to direction (`isRtl`) rather than locale (e.g., Arabic vs Urdu vs Persian all share RTL but require different translations).
- They prevent adding third or fourth languages (French, Spanish, German).
- They cannot handle string interpolation (`Hello {name}, you have {count} messages`).

### The Dictionary Contract:
```tsx
import { useI18n } from '@/lib/i18n';

function OverviewSection() {
  const { t } = useI18n();

  return (
    <div>
      <h2>{t('dashboard.title', 'System Overview')}</h2>
      <p>{t('dashboard.subtitle')}</p>
    </div>
  );
}
```

---

## 5. Strict CSS Logical Properties Mandate

> [!WARNING]
> **Zero Physical Directions in Core UI & Layouts**:
> Physical directional properties (`margin-left`, `margin-right`, `padding-left`, `padding-right`, `left`, `right`, `border-left`, `border-right`, `float: left`, `text-align: left`) are **strictly prohibited** in `src/components/ui/` and all layout modules.
> Every layout and spacing rule MUST use W3C CSS Logical Properties.

### Translation Cheat Sheet:

| Prohibited Physical Property | Required Logical Property | Behavior in LTR | Behavior in RTL |
| :--- | :--- | :--- | :--- |
| `margin-left` | `margin-inline-start` | Left margin | Right margin |
| `margin-right` | `margin-inline-end` | Right margin | Left margin |
| `margin-top` / `margin-bottom` | `margin-block-start` / `end` (or `margin-block`) | Top / Bottom | Top / Bottom |
| `padding-left` | `padding-inline-start` | Left padding | Right padding |
| `padding-right` | `padding-inline-end` | Right padding | Left padding |
| `padding-top` / `padding-bottom` | `padding-block-start` / `end` (or `padding-block`) | Top / Bottom | Top / Bottom |
| `left: 0` | `inset-inline-start: 0` | Aligns to left edge | Aligns to right edge |
| `right: 0` | `inset-inline-end: 0` | Aligns to right edge | Aligns to left edge |
| `border-left` | `border-inline-start` | Left border | Right border |
| `border-right` | `border-inline-end` | Right border | Left border |
| `text-align: left` | `text-align: start` | Left-aligned text | Right-aligned text |
| `text-align: right` | `text-align: end` | Right-aligned text | Left-aligned text |
| `border-radius: 8px 0 0 8px` | `border-start-start-radius: 8px; border-end-start-radius: 8px;` | Left corners rounded | Right corners rounded |

---

## 6. Bi-directional (Bidi) Text Handling

### The Problem
When right-to-left text (Arabic) contains left-to-right fragments (English product names, email addresses, phone numbers, tracking IDs, or code blocks), browser bidi algorithms often scramble adjacent punctuation:
- **Corrupted**: `رقم الحساب: +966 50 123 4567-` (dash or brackets flip to wrong side)
- **Desired**: `رقم الحساب: ` + `+966 50 123 4567` cleanly isolated.

### The Solution: `<BidiText>` & `<bdi>`
Always isolate dynamic or bidirectional values using the native `<BidiText>` component (`src/lib/i18n/bidi.tsx`):

```tsx
import { BidiText } from '@/lib/i18n';

<p>
  رقم التتبع: <BidiText dir="ltr">#SA-9820-X</BidiText>
</p>
<p>
  الهاتف: <BidiText dir="ltr">+966 50 123 4567</BidiText>
</p>
```

Under the hood, `<BidiText>` renders HTML5 `<bdi>` with `unicode-bidi: isolate;`, preventing punctuation bleed.

---

## 7. Arabic / MENA Typography Tokens

Arabic scripts feature distinct calligraphic characteristics, taller ascenders and deeper descenders than Latin typefaces. They require specialized font stacks and larger line-height ratios.

### Tokens in `src/styles/tokens/typography.css`:

```css
/* Arabic Font Stacks */
--font-family-arabic: "Cairo", "IBM Plex Sans Arabic", "Noto Sans Arabic", "Geeza Pro", "Simplified Arabic", "Tahoma", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-family-arabic-heading: "Cairo", "IBM Plex Sans Arabic", "Noto Kufi Arabic", "Geeza Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* Universal Sans with Native Arabic Fallbacks */
--font-family-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "Geeza Pro", "Simplified Arabic", "Cairo", "Noto Sans Arabic", Arial, sans-serif;

/* Arabic Line Heights (Compensates for taller glyph ascenders/descenders) */
--line-height-arabic-tight: 1.35;
--line-height-arabic-normal: 1.65;
--line-height-arabic-relaxed: 1.85;
```

### Global Rules in `src/styles/globals.css`:
```css
[dir="rtl"] {
  font-family: var(--font-family-arabic);
  line-height: var(--line-height-arabic-normal);
  text-align: start;
}
```

---

## 8. Native Number, Date & Currency Formatting

Zero third-party date or number dependencies. All formatting relies on the native W3C `Intl` suite:

```tsx
import { formatNumber, formatCurrency, formatDate, formatRelativeTime } from '@/lib/i18n';

// 1. Number Formatting (supports Latin and Eastern Arabic-Indic numerals)
formatNumber(14290, 'ar-SA', { numberingSystem: 'arab' }); // "١٤٬٢٩٠"
formatNumber(14290, 'en-US'); // "14,290"

// 2. Localized Currency Formatting
formatCurrency(28450, 'SAR', 'ar-SA'); // "٢٨٬٤٥٠٫٠٠ ر.س."
formatCurrency(28450, 'USD', 'en-US'); // "$28,450.00"

// 3. Date & Calendar Formatting (supports Gregorian and Islamic/Hijri)
formatDate(new Date(), 'ar-SA', { dateStyle: 'full', calendar: 'islamic-umalqura' });
formatDate(new Date(), 'en-US', { dateStyle: 'medium' });

// 4. Relative Time Formatting
formatRelativeTime(-5, 'minute', 'ar-SA'); // "قبل 5 دقائق"
formatRelativeTime(2, 'day', 'en-US'); // "in 2 days"
```

---

## 9. Semantic Icon Registry & Directional Mirroring

Not all icons should mirror in RTL. Directional glyphs (chevrons, navigation arrows, layout triggers) must flip under `[dir="rtl"]`, while real-world objects, brand logos, search lenses, and status indicators must never mirror.

### The Semantic Icon Standard (`src/components/icons/`):
- All vendor icon glyphs (Hugeicons) are encapsulated exclusively within `src/components/icons/registry.ts`.
- Directional glyphs are marked via `directional(IconGlyph)`.
- `<Icon name="..." />` automatically applies `.mirror` styling under `[dir="rtl"]`:
```tsx
import { Icon } from '@/components/icons';

// Inside UI component:
<button type="button">
  <span>{t('common.next')}</span>
  <Icon name="chevron-right" />
</button>
```

In `icon.module.css`:
```css
[dir="rtl"] .mirror {
  transform: scaleX(-1);
}
```

---

## 10. Strict Layer Boundaries: Pure UI Primitives vs. App Wiring

In accordance with Principle 1 and Principle 3 of our architectural standards:
- **`src/components/ui/*`** primitives (such as `<DirectionToggle>` and `<ThemeToggle>`) are **100% pure**. They accept `direction`, `theme`, and `onToggle` callbacks via native props. They **never import or bind directly to React context**.
- **Wiring happens in layouts / patterns**: The application shell (`classic-layout.tsx`, `tokyo-navbar.tsx`) reads `useDirection()`, `useTheme()`, and `useI18n()` and passes state down to the pure primitives.

---

## 11. Host-Agnostic Slots & Accessibility Contracts

All navigation and shell primitives support framework-independent composition:
- **`SidebarItem`**: Polymorphic discriminated union. When `href` is supplied, preserves all anchor attributes (`target`, `rel`, `onClick`, `...props`) and sets `aria-current={isActive ? 'page' : undefined}`. Supports `as` slot for Next.js `<Link>` or Vite `<a>`.
- **`SidebarLogo` & `SidebarAvatar`**: Provide `as` and `imageComponent` slots, allowing consumers to plug in Next.js `<Link>` and `<Image>` without baking framework dependencies into layout primitives.
- **Mobile Drawers**: Require `id="app-sidebar"`, `aria-controls`, `aria-expanded` on the trigger, `Escape` key close listener, and a focus trap cycling `Tab` / `Shift+Tab`.
- **Landmark Hygiene**: Sub-sidebar rails (`SidebarPrimary`, `SidebarSecondary`) must render `<div>` instead of nested `<aside>` tags to prevent duplicate landmarks.
- **Keyboard Shortcuts**: Global key handlers (`Cmd+B`, `Cmd+.`) must check `event.target` and abort if the active element is an input, textarea, select, or `contenteditable`.

---

## 12. 60-Component Pre-Flight RTL & i18n Checklist

Use this checklist when developing or reviewing any component in `src/components/ui/`:

- [ ] **Zero Physical Coordinates**: Does the `.module.css` use exclusively `margin-inline`, `padding-block`, `inset-inline-*`, `border-inline-*`, and `text-align: start/end`?
- [ ] **Interactive Overlays & Portals**: For `Dialog`, `Sheet`, `Popover`, `DropdownMenu`, and `Tooltip`, does positioning respect document direction?
- [ ] **Horizontal Carousels & Sliders**: Does the scroll or slide direction increment appropriately when `dir="rtl"`?
- [ ] **Input Adornments & Icons**: Are start/end icon slots styled with `inset-inline-start` and `inset-inline-end` instead of hardcoded `left`/`right`?
- [ ] **Directional Glyphs**: Are collapse indicators and next/prev arrows wrapped in `<MirroredIcon>` or flagged with `data-mirror-rtl="true"`?
- [ ] **Bidi Isolation in Dynamic Data**: Are phone numbers, user tags, code tokens, and email fields wrapped in `<bdi>` or `<BidiText>`?
- [ ] **Text Truncation**: Does `text-overflow: ellipsis` align smoothly with `text-align: start`?
- [ ] **Keyboard Navigation**: Are ArrowLeft / ArrowRight handlers inverted in RTL (ArrowLeft advances forward in RTL)?
- [ ] **Accessibility Attributes**: Are active links tagged with `aria-current="page"`, triggers with `aria-expanded` and `aria-controls`, and overlays with `role="dialog"`?

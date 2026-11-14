# Accordion — Component Specification and Implementation Plan

> **Status:** Aligned Reference Specification  
> **Component:** `components/ui/accordion`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/accordion/`  
> **Gallery route:** `/gallery/accordion`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

An **Accordion** is a vertically stacked set of interactive disclosure headings that each reveal or hide an associated section of content. It enables users to scan high-level section summaries and progressively disclose dense information on demand, conserving vertical viewport space in product FAQ sections, dashboard multi-step settings, nested filter groups, and itemized billing breakdowns.

### 1.1 In Scope
- **Compound Component Hierarchy**:
  - `Accordion`: Root container (`data-accordion-root="true"`) orchestrating expansion state (single vs. multiple items), root-scoped keyboard navigation, control sizing, touch-target policy, and visual variant tokens.
  - `AccordionItem`: Individual disclosure unit managing value mapping, open/closed state attributes (`data-state`), and separator borders.
  - `AccordionHeader`: Semantic heading wrapper (`<h3>` by default, customizable via `as`) ensuring honest HTML heading hierarchy without skipped levels.
  - `AccordionTrigger`: Interactive trigger (`<button type="button">`) reporting `aria-expanded`, `aria-controls`, optional `aria-hidden="true"` `startIcon`, and rendering title text with a directional chevron indicator.
  - `AccordionContent`: Accessible content container (`role="region"`, `aria-labelledby`, `hidden={!isExpanded}`) revealed via CSS Grid row tracks (`grid-template-rows: 0fr` → `1fr`).
- **Expansion Modes**:
  - `single` *(Default)*: Only one item can be expanded at a time. Expanding an item automatically collapses any previously open item.
    - `collapsible` (boolean, default `true`): When enabled, clicking an already open item collapses it (allowing zero open items).
  - `multiple`: Multiple items can be expanded concurrently and operate independently.
- **Visual Style Variants**:
  - `default` *(Underline / Separated)*: Individual items separated by subtle dividing borders (`1px solid var(--color-border-subtle)`), standard for website FAQs and help centers.
  - `enclosed` *(Card Container)*: Bordered outer container (`--radius-card`) with internal edge-to-edge dividing borders and corner-matched edge triggers so `:focus-visible` outlines are never clipped by `overflow: hidden`.
  - `flush` *(Borderless)*: No outer or item borders, providing minimal rounded trigger disclosure suitable for sidebars and dense panels.
- **Control Sizing Scale & Touch Policy**:
  - Product default when `size` is omitted: consumes `--control-height-default` (`36px` `md` in Dashboard; `48px` `xl` in Website).
  - Full 6-step `ControlSize` scale supported (`xs`: `28px`, `sm`: `32px`, `md`: `36px`, `lg`: `40px`, `xl`: `48px`, `2xl`: `56px`). Studio emphasizes the core density triad (`sm`, `md`, `lg`).
  - `touchTarget`: `'auto'` *(default, scales to `--control-touch-target-min` `48px` on coarse pointers)* or `'comfortable'` *(always `>= 48px`)*.
- **Direction, Indicator Placement & Script Parity**:
  - `chevronPosition`: `'end'` *(Default)* or `'start'`.
  - Directional chevron indicator rotates 180° (`transform: rotate(180deg)`) using `--transition-normal`.
  - Explicit `:lang(ar)` rules use `--font-family-arabic`, `letter-spacing: var(--letter-spacing-normal)`, `--line-height-arabic-snug` on triggers, and `--line-height-arabic-normal` on panel content, while restoring `:lang(en)` and `:lang(fr)` Latin rules cleanly.
- **WAI-ARIA & Accessibility Discipline**:
  - W3C WAI-ARIA 1.2 Accordion Pattern compliance.
  - Triggers stay sequentially reachable in the natural `Tab` order, with root-scoped arrow navigation (`ArrowDown`, `ArrowUp`, `Home`, `End`) isolated cleanly across nested accordions.
- **White-Label & Policy Discipline**:
  - **100% Shadow-Free Dashboard**: Visual separation achieved strictly through surface steps (`--color-surface`, `--color-surface-hover`), boundary borders, and typography—zero box shadows.
  - **100% CSS Logical Properties**: Logical padding (`padding-inline`, `padding-block`), logical corners (`border-start-*`, `border-end-*`), and margins.
  - **Zero Third-Party UI Libraries**: Own all markup, state, and animation natively. No Radix UI, no MUI, no Chakra.
  - **Pure Core UI Boundary**: Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries.

### 1.2 Out of Scope
- Top-level page tab switches (handled by `Tabs`).
- Flyout navigation menus with sub-tier links (handled by `components/shell/` and Next.js `Link`).
- Standalone single toggle disclosures that don't belong to a group (handled by `Collapsible`).

---

## 2. Architecture & White-Label Isolation

### 2.1 Component Flow
The `Accordion` family lives in `src/components/ui/accordion/` and flows cleanly downwards:

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ consumes via localized props & slots
Connected Patterns & Studio (components/patterns/accordion-gallery/)
       ↓ binds providers/i18n props & renders specimen
Core UI Primitives (components/ui/accordion/)
       ├─ Accordion (root context, single/multiple state management, root-scoped keys)
       ├─ AccordionItem (item boundary, open/disabled state)
       ├─ AccordionHeader (semantic heading wrapper)
       ├─ AccordionTrigger (button trigger, ARIA states, aria-hidden icons/chevron)
       └─ AccordionContent (region container, grid disclosure)
Design Tokens (tokens/controls.css, tokens/colors.css, tokens/radius.css, tokens/spacing.css, tokens/motion.css)
```

### 2.2 Framework Neutrality & React 19 Discipline
- Forwarded refs (`HTMLDivElement` for Accordion/Item/Content, `HTMLHeadingElement` for Header, `HTMLButtonElement` for Trigger).
- Accessible pairing IDs generated via `React.useId()`:
  - Trigger ID: `accordion-${baseId}-trigger-${value}`
  - Region Content ID: `accordion-${baseId}-content-${value}`
- Clean React context (`AccordionContext` and `AccordionItemContext`) scoped internally inside `accordion.tsx`.

---

## 3. WAI-ARIA & Accessibility Specification

The implementation follows the **W3C WAI-ARIA 1.2 Accordion Pattern**:

### 3.1 ARIA Attributes Matrix

| Component | Element | Role | Required ARIA Attributes |
| :--- | :--- | :--- | :--- |
| `AccordionHeader` | `<h3 as="...">` | None (native heading) | Exposes proper heading level (`h2`–`h6` or `div`) in accessibility tree. |
| `AccordionTrigger` | `<button type="button">` | None (native button) | `aria-expanded="true \| false"`<br>`aria-controls={contentId}`<br>`id={triggerId}`<br>`aria-disabled={disabled ? 'true' : undefined}` |
| `AccordionContent` | `<div>` | `role="region"` | `role="region"`<br>`id={contentId}`<br>`aria-labelledby={triggerId}`<br>`hidden={!isExpanded}` |

### 3.2 Keyboard Navigation Matrix

| Key | Context | Action |
| :--- | :--- | :--- |
| `Tab` / `Shift+Tab` | Accordion group | Moves sequentially across enabled triggers and focusable controls inside expanded panels. |
| `Enter` / `Space` | Focused on `AccordionTrigger` | Toggles disclosure state of the associated item. |
| `ArrowDown` | Focused on `AccordionTrigger` | Moves focus to the next enabled trigger owned by the same root accordion (wraps cleanly; skips disabled/nested triggers). |
| `ArrowUp` | Focused on `AccordionTrigger` | Moves focus to the previous enabled trigger owned by the same root accordion (wraps cleanly). |
| `Home` | Focused on `AccordionTrigger` | Moves focus to the first enabled trigger owned by the same root accordion. |
| `End` | Focused on `AccordionTrigger` | Moves focus to the last enabled trigger owned by the same root accordion. |

---

## 4. Visual Styling, Token Contracts & Motion

### 4.1 Variant Styling Matrix

| Variant | Outer Container | Item Container | Item Dividers |
| :--- | :--- | :--- | :--- |
| **`default`** *(Default)* | Transparent, full width, `border-block-start: 1px solid var(--color-border-subtle)` | Transparent, vertical margin `0` | Bottom border `1px solid var(--color-border-subtle)` on each item |
| **`enclosed`** | Border `1px solid var(--color-border-subtle)`, background `--color-surface`, radius `--radius-card` | Transparent; first/last corner radii follow `calc(var(--radius-card) - 1px)` | Internal dividing lines `border-block-start: 1px solid var(--color-border-subtle)` between items |
| **`flush`** | Transparent, full width, `gap: var(--space-2)` | Transparent | Zero outer borders; rounded `--radius-control` trigger highlight |

### 4.2 Control Sizing Scale

| Size | Trigger Min-Height | Font / Line-Height | Inline Padding | Icon / Chevron Size |
| :--- | :--- | :--- | :--- | :--- |
| **Omitted** *(Default)* | `var(--control-height-default)` (`36px` Dashboard / `48px` Website) | `--control-font-size-default` / `--control-line-height-default` | `--control-padding-default` | `--control-icon-size-default` |
| **`sm`** | `32px` (`--control-height-sm`) | `--control-font-size-sm` / `--control-line-height-sm` | `--control-padding-sm` (`12px`) | `--control-icon-size-sm` (`16px`) |
| **`md`** | `36px` (`--control-height-md`) | `--control-font-size-md` / `--control-line-height-md` | `--control-padding-md` (`14px`) | `--control-icon-size-md` (`16px`) |
| **`lg`** | `40px` (`--control-height-lg`) | `--control-font-size-lg` / `--control-line-height-lg` | `--control-padding-lg` (`16px`) | `--control-icon-size-lg` (`18px`) |

*(Also accepts `xs` `28px`, `xl` `48px`, `2xl` `56px` from the shared `ControlSize` scale.)*

### 4.3 Motion & Reduced Motion
- **Smooth Grid Disclosure**: Content panels animate via `grid-template-rows` (`0fr` ↔ `1fr`) + `opacity` using `var(--transition-normal)` (`180ms` `var(--motion-ease-standard)`), alongside chevron rotation (`transform: rotate(180deg)`). Focus rings use immediate `0ms` outline (`--focus-ring-width solid var(--color-border-focus)`) at `z-index: var(--_z-layer-raised)`.
- **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, trigger, chevron, and grid disclosure transitions collapse (`transition: none !important`), revealing panels and chevron orientation immediately with zero `transitionend` lifecycle blockers.

---

## 5. Component API Specification

```typescript
import type { ControlSize, ControlSizingProps } from '../control-sizing';

export type AccordionType = 'single' | 'multiple';
export type AccordionVariant = 'default' | 'enclosed' | 'flush';
export type AccordionSize = ControlSize;
export type AccordionChevronPosition = 'start' | 'end';
export type AccordionHeadingElement = 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div';

export interface AccordionBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual style variant. Defaults to 'default' */
  variant?: AccordionVariant;

  /** Explicit sizing scale; omits to consume local --control-*-default */
  size?: AccordionSize;

  /** Touch interaction target policy ('auto' on coarse pointers or 'comfortable' >= 48px) */
  touchTarget?: ControlSizingProps['touchTarget'];

  /** Position of the expansion chevron indicator. Defaults to 'end' */
  chevronPosition?: AccordionChevronPosition;
}

export interface AccordionSingleProps extends AccordionBaseProps {
  type?: 'single';
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  collapsible?: boolean;
}

export interface AccordionMultipleProps extends AccordionBaseProps {
  type: 'multiple';
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  collapsible?: never;
}

export type AccordionProps = AccordionSingleProps | AccordionMultipleProps;

export interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Unique value identifying this accordion item */
  value: string;

  /** Whether this individual item is disabled */
  disabled?: boolean;
}

export interface AccordionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Semantic heading element. Defaults to 'h3' */
  as?: AccordionHeadingElement;
}

export interface AccordionTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading decorative icon element (marked aria-hidden="true") */
  startIcon?: React.ReactNode;
}

export interface AccordionContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to keep content mounted in the DOM when collapsed. Defaults to true */
  forceMount?: boolean;
}
```

---

## 6. Verification & Studio Architecture

1. **Core UI & Tests (`src/components/ui/accordion/`)**:
   - `accordion.test.tsx`: Vitest + `@testing-library/user-event` covering single/multiple modes (controlled & uncontrolled), `collapsible`, WAI-ARIA pairing & configurable headings, `ArrowDown`/`ArrowUp`/`Home`/`End` navigation, nested-accordion isolation, disabled item skip, `aria-hidden` icons, `size`/`touchTarget` tokens, missing-context errors, and refs.
2. **Interactive Studio (`src/components/patterns/accordion-gallery/`)**:
   - Full `en`/`fr`/`ar` localization via `t()` / `specimenT()` synchronized with global locale/direction and explicit `<BidiText dir="ltr">` numeric tokens.
   - `View Mode` switcher (`Live Specimen` vs `Variants Matrix` across `default`/`enclosed`/`flush` and `sm`/`md`/`lg`).
   - Scenarios: **Product FAQ**, **Workspace Settings** (with leading icons & buttons), and **Billing Summary** (with semantic `Badge` counters & tabular line items).
   - Controls: Direction (`LTR` / `RTL`), View Mode, Scenario, Variant, Trigger Size (`32px`/`36px`/`40px`), Expansion Mode (`Single`/`Multiple`), `Allow Collapse All`, Chevron Position (`End`/`Start`).
3. **Cross-Starter Quality & Browser Gates**:
   - `node scripts/sync-shared.mjs --check` & `node scripts/check-dashboard-shadows.mjs`.
   - `tsc --noEmit`, `oxlint`, `vitest run` across Next.js Dashboard, Next.js Website, and Vite Dashboard, plus `vite build`.
   - Playwright E2E (`e2e/accordion.spec.ts` in Next.js Dashboard & Website): `32/36/40px` heights, single/multiple & collapsible toggles, arrow-key navigation, Arabic RTL `lang="ar"`, Matrix View, and zero dashboard shadows.

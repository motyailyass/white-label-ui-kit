# Tabs — Component Specification and Implementation Plan

> **Status:** Specification Baseline & Architectural Reference  
> **Component:** `components/ui/tabs`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/tabs/`  
> **Gallery route:** `/gallery/tabs`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Tabs** primitive organizes related content into multiple switchable panels within a single surface, allowing users to alternate between distinct views without navigating away from the current page context. It is essential for dashboard analytical views, user settings sections, code/preview switchers, and website feature presentations.

### 1.1 In Scope
- **Compound Component Hierarchy**:
  - `Tabs`: Root context provider managing active selection (controlled via `value` / `onValueChange` or uncontrolled via `defaultValue`), orientation, sizing, and variant styles.
  - `TabsList`: Accessible container (`role="tablist"`) for individual tab triggers, orchestrating roving tabindex and arrow-key focus management.
  - `TabsTrigger` (alias `Tab`): Interactive trigger (`role="tab"`) toggling associated panel visibility, reporting `aria-selected`, and handling keyboard activation.
  - `TabsContent` (alias `TabsPanel`): Accessible container (`role="tabpanel"`) holding panel content, rendered when active, and semantically paired with its triggering tab via `id` and `aria-labelledby`.
- **Visual Style Variants**:
  - `line` *(Default)*: Clean underline indicator beneath active tab, ideal for page-level views, settings, and table tabs.
  - `segment`: Enclosed capsule background container with high-contrast active item pill, ideal for filter switches, metric periods, and compact toolbars.
  - `enclosed`: Boxed tab folder surface with subtle border delineation between active and inactive tabs.
- **Orientation Modes**:
  - `horizontal` *(Default)*: Tabs laid out inline with horizontal roving focus (`ArrowLeft` / `ArrowRight`).
  - `vertical`: Tabs laid out in a column with vertical roving focus (`ArrowUp` / `ArrowDown`), ideal for deep dashboard settings sidebars and complex preferences.
- **Activation Modes**:
  - `automatic` *(Default)*: Focusing a tab via arrow keys immediately selects it and switches panel content.
  - `manual`: Focusing a tab via arrow keys moves focus only; user must press `Enter` or `Space` to activate.
- **Control Sizing Scale**:
  - `sm`: Compact block height (`32px` via `--control-height-sm`), ideal for embedded card toolbars and dense data tables.
  - `md`: Standard default block height (`36px` via `--control-height-md`), standard for page sections.
  - `lg`: Prominent block height (`40px` via `--control-height-lg`), ideal for spacious section switchers and larger control bars.
- **Accessories & Semantic Enhancements**:
  - Optional leading/trailing icon slots (`startIcon`, `endIcon`) automatically wrapped with `aria-hidden="true"`.
  - Badge / Counter chip integration within triggers.
  - Indicator opacity transitions adhering to `--transition-fast`, with instant switching under `prefers-reduced-motion: reduce`.
- **RTL & Internationalization Discipline**:
  - Complete logical CSS properties (`padding-inline`, `border-block-end`, `inset-inline-*`).
  - **RTL-aware arrow key inversion**: In `dir="rtl"`, horizontal `ArrowRight` moves to the visually next (leftward) tab, while `ArrowLeft` moves rightward, respecting reading flow.
- **White-Label & Policy Discipline**:
  - **100% Shadow-Free Dashboard**: Visual hierarchy communicated strictly via surface shifts (`--color-surface`, `--color-surface-raised`), boundary borders (`--color-border-subtle`), and high-contrast text—zero box shadows.
  - **Zero Third-Party UI Libraries**: Own all markup, state, and keyboard behaviors natively. No Radix UI, no MUI, no Chakra.
  - **Pure Core UI**: Zero imports from `@/providers`, `@/i18n`, `next/*`, or external state libraries.

### 1.2 Out of Scope
- Global browser navigation menus that change URL routes (handled by `components/shell/` and Next.js `Link`).
- Multi-step wizard forms with mandatory completion order (handled by `Stepper`).
- Accordion collapsible stacks where multiple panels can open concurrently (handled by `Accordion`).

---

## 2. Architecture & White-Label Isolation

### 2.1 Component Flow
The `Tabs` family lives in `src/components/ui/tabs/` and flows cleanly downwards:

```
App Routes & Templates (app/, layouts/, wireframes/)
       ↓ consumes via localized props & slots
Connected Patterns & Studio (components/patterns/tabs-gallery/)
       ↓ binds props & renders specimen
Core UI Primitives (components/ui/tabs/)
       ├─ Tabs (root context, controlled/uncontrolled state)
       ├─ TabsList (tablist container, roving tabindex)
       ├─ TabsTrigger / Tab (tab trigger, ARIA states)
       └─ TabsContent / TabsPanel (tabpanel container)
Design Tokens (tokens/colors.css, tokens/radius.css, tokens/spacing.css, tokens/motion.css)
```

### 2.2 Framework Neutrality & React 19 Discipline
- Native `ref` support forwarded to underlying DOM elements (`HTMLDivElement` for Tabs/TabsList/TabsContent, `HTMLButtonElement` for TabsTrigger).
- Accessible pairing IDs generated via `React.useId()` to ensure zero SSR hydration mismatches and collision-free associations:
  - Tab trigger ID: `tabs-${baseId}-tab-${value}`
  - Tab panel ID: `tabs-${baseId}-panel-${value}`
- Clean React context (`TabsContext`) scoped exclusively inside `tabs.tsx` to distribute active value, orientation, size, variant, and callbacks to compound children.

---

## 3. WAI-ARIA & Accessibility Specification

The implementation adheres to the **W3C WAI-ARIA 1.2 Tabs Pattern**:

### 3.1 ARIA Attributes Matrix

| Component | Element | Role | Required ARIA Attributes |
| :--- | :--- | :--- | :--- |
| `TabsList` | `<div>` | `role="tablist"` | `aria-orientation="horizontal \| vertical"`<br>`aria-label` or `aria-labelledby` |
| `TabsTrigger` | `<button type="button">` | `role="tab"` | `aria-selected="true \| false"`<br>`aria-controls={panelId}`<br>`id={tabId}`<br>`tabindex={selected ? 0 : -1}`<br>`aria-disabled={disabled \| undefined}` |
| `TabsContent` | `<div>` | `role="tabpanel"` | `role="tabpanel"`<br>`id={panelId}`<br>`aria-labelledby={tabId}`<br>`tabindex={0}` |

### 3.2 Keyboard Navigation Matrix

| Key | Orientation | Direction | Action |
| :--- | :--- | :--- | :--- |
| `ArrowRight` | `horizontal` | LTR | Move focus to next tab (wrap to start). |
| `ArrowRight` | `horizontal` | RTL | Move focus to previous tab (wrap to end). |
| `ArrowLeft` | `horizontal` | LTR | Move focus to previous tab (wrap to end). |
| `ArrowLeft` | `horizontal` | RTL | Move focus to next tab (wrap to start). |
| `ArrowDown` | `vertical` | Both | Move focus to next tab in column (wrap to top). |
| `ArrowUp` | `vertical` | Both | Move focus to previous tab in column (wrap to bottom). |
| `Home` | Any | Both | Move focus to the first enabled tab. |
| `End` | Any | Both | Move focus to the last enabled tab. |
| `Enter` / `Space` | Any | Both | Activate focused tab (in `manual` activation mode). |

> [!IMPORTANT]
> In `automatic` mode, moving focus with arrow keys immediately activates the newly focused tab and displays its panel. In `manual` mode, focus moves independently, and activation requires `Enter` or `Space`.

---

## 4. Visual Styling, Token Contracts & Motion

### 4.1 Variant Styling Matrix

| Variant | Container (`TabsList`) | Inactive Trigger | Active Trigger | Active Indicator |
| :--- | :--- | :--- | :--- | :--- |
| **`line`** *(Default)* | Transparent, optional bottom border `1px solid var(--color-border-subtle)` | `--color-text-secondary`, hover `--color-text-primary` | `--color-text-primary`, `font-weight: 500` | 2px solid line (`var(--color-primary)`) positioned at bottom edge |
| **`segment`** | Padded track (`var(--space-1)`), background `--color-surface-subtle`, border `1px solid var(--color-border-subtle)`, radius `--radius-control` | Transparent background, `--color-text-secondary`, hover `--color-text-primary` | Solid background `--color-surface`, `--color-text-primary`, `font-weight: 500`, radius `calc(var(--radius-control) - var(--space-0-5))` | Contrast surface pill with subtle border |
| **`enclosed`** | Bottom border `1px solid var(--color-border-subtle)` (`border-inline-end` when vertical) | Transparent background, border `1px solid transparent` | Background `--color-surface`, border `1px solid var(--color-border-subtle)`, open bottom edge (`border-block-end: none`) or open inline-end edge when vertical, radius `--radius-control` | Boxed tab surface blending into active panel |

### 4.2 Control Sizing Scale

| Size | Trigger Min Height | Typography Token | Inline Padding | Gap |
| :--- | :--- | :--- | :--- | :--- |
| **`sm`** | `32px` (`--control-height-sm`) | `--control-font-size-sm` / `--control-line-height-sm` (`--line-height-arabic-snug` in `:lang(ar)`) | `--control-padding-sm` (`12px`) | `--control-gap-sm` (`6px`) |
| **`md`** *(Default)* | `36px` (`--control-height-md`) | `--control-font-size-md` / `--control-line-height-md` (`--line-height-arabic-snug` in `:lang(ar)`) | `--control-padding-md` (`14px`) | `--control-gap-md` (`8px`) |
| **`lg`** | `40px` (`--control-height-lg`) | `--control-font-size-lg` / `--control-line-height-lg` (`--line-height-arabic-snug` in `:lang(ar)`) | `--control-padding-lg` (`16px`) | `--control-gap-lg` (`8px`) |

### 4.3 Motion & Reduced Motion
- Under standard motion:
  - Text color, background, and border transitions consume `var(--transition-fast)` (`120ms cubic-bezier(0.2, 0, 0, 1)`).
  - The active line indicator transitions `opacity` via `var(--transition-fast)`.
- Under `@media (prefers-reduced-motion: reduce)`:
  - Transitions are disabled cleanly without relying on animation callbacks.

---

## 5. Component API Specification

```typescript
export type TabsVariant = 'line' | 'segment' | 'enclosed';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';
export type TabsSize = 'sm' | 'md' | 'lg';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Controlled active tab value */
  value?: string;

  /** Default active tab value for uncontrolled usage */
  defaultValue?: string;

  /** Callback fired when the active tab value changes */
  onValueChange?: (value: string) => void;

  /** Visual style variant. Defaults to 'line' */
  variant?: TabsVariant;

  /** Layout orientation. Defaults to 'horizontal' */
  orientation?: TabsOrientation;

  /** Keyboard activation mode. Defaults to 'automatic' */
  activationMode?: TabsActivationMode;

  /** Sizing scale for tab triggers. Defaults to 'md' */
  size?: TabsSize;
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label describing the purpose of the tablist */
  'aria-label'?: string;

  /** ID of an external element that labels this tablist */
  'aria-labelledby'?: string;

  /** Whether the tab list expands to fill 100% of the container width */
  fullWidth?: boolean;
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Unique value identifying this tab (matches corresponding TabsContent value) */
  value: string;

  /** Whether this individual tab is disabled */
  disabled?: boolean;

  /** Optional leading icon node */
  startIcon?: React.ReactNode;

  /** Optional trailing icon node */
  endIcon?: React.ReactNode;
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Value matching the associated TabsTrigger value */
  value: string;

  /** Whether to keep the tab content mounted in the DOM when inactive (hidden via CSS) */
  forceMount?: boolean;
}
```

---

## 6. Implementation & Verification Plan

1. **Core UI Primitives (`src/components/ui/tabs/`)**:
   - `tabs.tsx`: Pure compound implementation (`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`) with scoped `TabsContext`, dynamic `useId()`, and RTL-aware keyboard navigation.
   - `tabs.module.css`: 100% CSS logical properties, semantic tokens, zero dashboard shadows, variants (`line`, `segment`, `enclosed`), and sizes (`sm`, `md`, `lg`).
   - `tabs.test.tsx`: Vitest suite covering:
     - Uncontrolled and controlled selection transitions.
     - WAI-ARIA roles, attributes (`aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`), and roving tabindex.
     - Full keyboard navigation matrix (`ArrowRight`, `ArrowLeft`, `ArrowDown`, `ArrowUp`, `Home`, `End`, `Enter`, `Space`).
     - RTL direction inversion for horizontal arrow keys.
     - Disabled tab skip behavior.
     - Sizing and variant class applications.
   - `index.ts`: Barrel exports for components and TypeScript types.
2. **Interactive Component Studio (`src/components/patterns/tabs-gallery/`)**:
   - Live specimen stage with direction toggle (`ltr` / `rtl`), View Mode (`Live Specimen` / `Variants Matrix`), trigger composition (`Standard Labels`, `With Badges`, `With Icons`), visual variant (`line`, `segment`, `enclosed`), size (`sm`, `md`, `lg`), orientation (`horizontal`, `vertical`), activation mode (`automatic`, `manual`), and `fullWidth` toggle.
   - Variants Matrix comparing all 3 surface variants (`line`, `segment`, `enclosed`) and 3 control sizes (`sm`, `md`, `lg`) side-by-side.
   - Code inspector with dynamic JSX snippet, CSS module tokens, and AI prompt export.
   - Routes: `/gallery/tabs` in Next.js Dashboard and Website starters.
3. **Canonical Synchronization & Policy Gates**:
   - Run `node scripts/sync-shared.mjs` to mirror from `dashboard/src/` to `website/src/` and `vite/src/`.
   - Run `node scripts/sync-shared.mjs --check` to verify zero drift.
   - Run `node scripts/check-dashboard-shadows.mjs` to enforce 100% shadow-free dashboard compliance.
   - Run `tsc --noEmit` and unit test suite across both starters.
   - Run Next.js production builds (`next build`) to guarantee zero route regressions.

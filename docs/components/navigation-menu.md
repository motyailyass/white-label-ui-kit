# Navigation Menu Component Specification

## 1. Overview
The `NavigationMenu` primitive provides accessible, keyboard-operable, multi-level website and application header navigation. It supports horizontal menubars with dropdown flyouts, rich multi-column megamenus, direct navigation links, and full bidirectional (LTR/RTL) support.

## 2. Architectural Role & Layer Boundaries
- **Purity**: Zero dependencies on router, `@/i18n`, `@/providers`, or state stores.
- **Dependencies**: React 19, `cn` utility, and `Icon` primitive for the chevron indicator.
- **Framework Independence**: Links use standard `<a>` or polymorphic `as` props without hardcoding `next/link`.

## 3. Compound Component Hierarchy
- `NavigationMenu`: Root `<nav>` container providing context, active flyout state, and keyboard coordination.
- `NavigationMenuList`: The `<ul>` container holding items.
- `NavigationMenuItem`: The `<li>` container holding an individual trigger or direct link.
- `NavigationMenuTrigger`: Button with `aria-expanded`, `aria-haspopup`, chevron indicator, and focus trap integration.
- `NavigationMenuContent`: Dropdown panel positioned relative to the item or viewport with smooth entry transitions.
- `NavigationMenuLink`: Anchor or polymorphic navigation link with `data-active` and focus ring styles.

## 4. Accessibility & WAI-ARIA
- Container landmark: `<nav aria-label="...">`
- List element: `<ul role="menubar">` or list semantics.
- Trigger button:
  - `aria-expanded="true | false"`
  - `aria-haspopup="true"`
  - `aria-controls={contentId}`
- Keyboard navigation:
  - `ArrowRight` / `ArrowLeft`: Navigate across items horizontally (aware of document direction).
  - `ArrowDown` on trigger: Open panel and focus first link.
  - `Escape`: Close open flyout and return focus to trigger.
  - `Tab`: Standard forward tab order through open menu links.

## 5. CSS & Token Contracts
- Logical properties: `padding-inline`, `padding-block`, `inset-inline-start`, `min-inline-size`.
- Stacking: `--z-dropdown` (200).
- Surfaces: `--color-surface-raised`, `--color-surface-hover`.
- Borders: `--color-border-subtle`, `--color-border-focus`.
- Shadows: Shadow-free in Dashboard (`--dashboard-shadow: none`), opt-in in Website.
- Reduced motion: Animations collapse when `prefers-reduced-motion: reduce`.

# Breadcrumb — Component Specification

> **Status:** Audited Canonical Baseline  
> **Component:** `components/ui/breadcrumb`  
> **Starters:** Next.js Dashboard, Next.js Website, Vite reference  
> **Canonical source:** `typescript/nextjs/starterkit/dashboard/src/components/ui/breadcrumb/`  
> **Gallery route:** `/gallery/breadcrumb`  
> **Related Standards:** [Tech Stack & Architecture](../standards/TECH_STACK.md) · [RTL & Internationalization](../standards/RTL_AND_I18N.md)

---

## 1. Purpose & Scope

A **Breadcrumb** is a secondary navigation landmark that reveals the user's current location within a hierarchical tree, provides one-click navigation to ancestor routes, and communicates document structure to assistive technology.

### 1.1 In Scope
- **WAI-ARIA Breadcrumb Landmark**: Enclosing `<nav aria-label={ariaLabel}>` containing an ordered list (`<ol>`).
- **Compound Components**:
  - `Breadcrumb`: Root navigation landmark with density sizing (`data-size="sm|md|lg"`).
  - `BreadcrumbList`: Ordered list container (`<ol>`).
  - `BreadcrumbItem`: Individual node wrapper (`<li>`).
  - `BreadcrumbLink`: Accessible ancestor anchor with polymorphic `as?: ElementType` support (e.g. Next.js `Link`) and automatic `rel="noopener noreferrer"` merging when `target="_blank"`.
  - `BreadcrumbPage`: Current leaf node marked with `aria-current="page"`.
  - `BreadcrumbSeparator`: Separator list item (`<li>`) marked with `role="presentation"` and `aria-hidden="true"`, defaulting to directional chevron (`chevron-right`) or custom delimiter.
  - `BreadcrumbEllipsis`: Collapsed intermediate nodes indicator (`…`), supporting optional `children` and optional accessible `label` prop.
- **Universal Density Scale**:
  - `sm` (`12px` / `1rem` Latin, `1.25rem` Arabic)
  - `md` (`14px` / `1.25rem` Latin, `1.5rem` Arabic — default)
  - `lg` (`16px` / `1.5rem` Latin, `1.75rem` Arabic)
- **Bidirectional RTL Support**: Directional separator glyphs (`chevron-right`) automatically mirror under `dir="rtl"` via the semantic icon registry.
- **Pure White-Label Boundaries**: 100% CSS logical properties, approved `--space-1` / `--space-2` spacing tokens, zero dashboard shadows, and zero hardcoded English labels.

### 1.2 Out of Scope
- Full-page site maps or primary horizontal navigation menus (covered by `NavigationMenu`).
- Browser history back/forward button controls.

---

## 2. Architecture & White-Label Isolation

- **React 19 `ref` as prop**: All compound exports accept native `ref` props via `ComponentPropsWithRef`.
- **Zero Third-Party UI Libraries**: Own markup and styles natively.
- **Zero Hardcoded Strings**: `aria-label` on `Breadcrumb` is required; `BreadcrumbEllipsis` defaults to decorative `aria-hidden="true"` unless a localized `label` prop is supplied.
- **Polymorphic Host Routing**: `BreadcrumbLink` supports Next.js `Link` or standard `<a>` via `as` without importing `next/link` into `components/ui`.

---

## 3. Visual & Semantic Token Contracts

| Element | Typography & Sizing | Spacing / Radius / Motion | Colors |
| :--- | :--- | :--- | :--- |
| **`BreadcrumbList`** | Flex wrap | `row-gap: var(--space-1)`, `column-gap: var(--space-2)` | Inherited |
| **`BreadcrumbItem`** | `sm` / `md` / `lg` scale + `:lang(ar)` line-height clearance | `gap: var(--space-1)` | `--color-text-secondary` |
| **`BreadcrumbLink`** | Inherited + hover `text-underline-offset: 0.2em` | `gap: var(--space-1)`, `var(--radius-xs)`, `color var(--transition-fast)`, `--focus-ring-*` | `--color-text-secondary` → `--color-text-primary` |
| **`BreadcrumbPage`** | `--font-weight-medium`, `overflow-wrap: anywhere` | Non-interactive leaf | `--color-text-primary` |
| **`BreadcrumbSeparator`** | `sm` / `md` / `lg` scale | `user-select: none` | `--color-text-muted` |
| **`BreadcrumbEllipsis`** | Inherited | Optional `.visuallyHidden` `label` | `--color-text-muted` |

---

## 4. Accessibility & Security Matrix

1. **Semantic Landmark**: `<nav aria-label={ariaLabel}>` wrapping `<ol>`.
2. **Current Page**: `BreadcrumbPage` carries `aria-current="page"` and stays outside tab order.
3. **Screen Reader Separation**: `BreadcrumbSeparator` and decorative `BreadcrumbEllipsis` carry `aria-hidden="true"` and `role="presentation"`.
4. **Tab-Napping Protection**: `BreadcrumbLink` merges `noopener` and `noreferrer` into `rel` automatically when `target="_blank"`.

---

## 5. Component API Summary

- `Breadcrumb`: `BreadcrumbProps extends ComponentPropsWithRef<'nav'>` (`'aria-label': string`, `size?: 'sm' | 'md' | 'lg'`)
- `BreadcrumbList`: `BreadcrumbListProps extends ComponentPropsWithRef<'ol'>`
- `BreadcrumbItem`: `BreadcrumbItemProps extends ComponentPropsWithRef<'li'>`
- `BreadcrumbLink`: `BreadcrumbLinkProps extends ComponentPropsWithRef<'a'>` (`as?: ElementType`, `href?: string`)
- `BreadcrumbPage`: `BreadcrumbPageProps extends ComponentPropsWithRef<'span'>`
- `BreadcrumbSeparator`: `BreadcrumbSeparatorProps extends ComponentPropsWithRef<'li'>`
- `BreadcrumbEllipsis`: `BreadcrumbEllipsisProps extends ComponentPropsWithRef<'span'>` (`label?: string`, `children?: ReactNode`)

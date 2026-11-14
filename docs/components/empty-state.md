# EmptyState Specification

## 1. Component Overview
The `EmptyState` primitive provides a structured zero-data presentation for empty collections, first-time user experiences, cleared search filters, or permission-restricted views. It supports compound compartments (`EmptyState`, `EmptyStateIcon`, `EmptyStateTitle`, `EmptyStateDescription`, `EmptyStateActions`) alongside direct convenience props (`icon`, `iconVariant`, `title`, `titleAs`, `description`, `actions`), 4 surface container variants (`default`, `dashed`, `subtle`, `borderless`), and 3 density sizes (`sm`, `md`, `lg`).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/empty-state/`. Zero third-party dependencies.
- **WAI-ARIA Accessibility**:
  - Defaults to `role="status"` with `aria-live="polite"`; overriding `role` (e.g., `role="region"`) automatically omits default `aria-live="polite"` unless explicitly provided.
  - Heading tag customization via `titleAs` convenience prop or polymorphic `as` prop (`h2`, `h3`, `h4`, `p`) on `<EmptyStateTitle>`.
  - Icon container decorated with `aria-hidden="true"` while allowing custom illustrations.
- **Spacing & Tokens**:
  - Consumes primitive spacing tokens (`--space-4` through `--space-16`).
  - Surface cards consume `--radius-card` and semantic surface backgrounds (`--color-surface`, `--color-surface-raised`).
  - Text colors consume canonical tokens: `var(--color-text-primary)` for titles, `var(--color-text-secondary)` for descriptions.
  - Border tokens: `var(--color-border-subtle)` / `var(--color-border-strong)`, with `@media (forced-colors: active)` frame visibility.
  - 100% shadow-free in dashboard mode.
- **RTL, Arabic Clearance & Logical Geometry**:
  - 100% CSS logical properties (`margin-block`, `padding-block`, `padding-inline`, `max-inline-size`).
  - Explicit `:lang(ar)` font stack (`--font-family-arabic`), `letter-spacing: var(--letter-spacing-normal)`, and line-height clearance (`--line-height-arabic-tight`, `--line-height-arabic-relaxed`) to prevent diacritic truncation.

## 3. Component API
### `<EmptyState size={size} variant={variant} icon={icon} iconVariant={iconVariant} title={title} titleAs={titleAs} description={description} actions={actions} />`
- `size?: 'sm' | 'md' | 'lg'`: Density padding and icon scaling (`sm`, `md` default, `lg`).
- `variant?: 'default' | 'dashed' | 'subtle' | 'borderless'`: Surface frame style (`default` = subtle border, `dashed` = 1px dashed perimeter, `subtle` = soft raised background, `borderless` = transparent frame for embedded tables/cards).
- `icon?: ReactNode`: Convenience icon or illustration slot.
- `iconVariant?: 'surface' | 'ghost'`: Icon frame style when passing convenience `icon`.
- `title?: ReactNode`: Convenience heading slot.
- `titleAs?: ElementType`: Heading tag override (`h3` default) when passing convenience `title`.
- `description?: ReactNode`: Convenience descriptive text slot.
- `actions?: ReactNode`: Convenience action buttons slot.
- `children?: ReactNode`: Compound children alternative.

### Compound Compartments:
- `<EmptyStateIcon variant={surface | ghost}>{children}</EmptyStateIcon>`
- `<EmptyStateTitle as={'h2' | 'h3' | 'h4' | 'p'}>{children}</EmptyStateTitle>`
- `<EmptyStateDescription>{children}</EmptyStateDescription>`
- `<EmptyStateActions>{children}</EmptyStateActions>`

## 4. State Matrix
- **Sizes**: `sm` (compact cards, tables), `md` (standard sections), `lg` (full-page hero views)
- **Variants**: `default` (standard subtle border), `dashed` (dropzone/draft style), `subtle` (soft elevated background), `borderless` (embedded container frame)
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (`lang="ar"` Arabic tracking & diacritic clearance verified)

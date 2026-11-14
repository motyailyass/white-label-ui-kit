# Pagination

**Layer:** Core UI (`src/components/ui/pagination/`)  
**Elements:** WAI-ARIA `<nav>` landmark containing a wrapped `<ul>` list of polymorphic page links (`<a>`, `<button>`, or router slot), auto-mirrored directional chevrons, and accessible ellipsis indicators.

---

## Import

```tsx
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  type PaginationProps,
  type PaginationShape,
  type PaginationSize,
} from '@/components/ui/pagination';
```

---

## Architecture & Guarantees

- **React 19 `ref` as prop**: All 7 exports (`Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`) accept native `ref` directly via `ComponentPropsWithRef<...>` without `forwardRef`.
- **Zero Hardcoded English Labels**: `Pagination` requires localized `aria-label`, `PaginationPrevious`/`PaginationNext` accept localized `label` (or custom `children` + `aria-label`), and `PaginationEllipsis` requires localized `label`.
- **Shared Density & Shape Context**: `<Pagination size="sm" | "md" | "lg" shape="rounded" | "pill">` propagates `size` to `PaginationLink`, `PaginationPrevious`, `PaginationNext`, and `PaginationEllipsis`, and propagates `shape` to all link/button items (`'rounded'` consumes `--radius-control`, `'pill'` consumes `--radius-full` `9999px`), with per-item overrides allowed.
- **Disabled Safety & Link Security**:
  - When `disabled` is true, native `<button>` receives `disabled={true}`, native `<a>` omits `href` while retaining `role="link" aria-disabled="true" tabIndex={-1}`, and clicks are explicitly guarded (`e.preventDefault(); e.stopPropagation()`).
  - External links with `target="_blank"` automatically receive `rel="noopener noreferrer"`.
- **Accessible Ellipsis**: Renders only the `…` glyph with `aria-hidden="true"` while keeping `<span className={styles.srOnly}>{label}</span>` outside `aria-hidden` so screen readers actually hear it.
- **RTL Mirroring, Touch Targets & Arabic Clearance**: Uses auto-mirrored `chevron-left`/`chevron-right` directional icons, coarse-pointer 48×48px `--control-touch-target-min` hit targets, `@media (prefers-reduced-motion: reduce)` transition disabling, and `:lang(ar)` Arabic font + line-height clearance—zero Dashboard shadows.

---

## API Reference

### `Pagination`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `'aria-label'` | `string` | **Required** | Localized accessible name for the `<nav>` landmark. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Shared height/font density (`32px`, `36px`, `40px`) propagated via context. |
| `shape` | `'rounded' \| 'pill'` | `'rounded'` | Corner radius variant (`--radius-control` for `'rounded'`, `--radius-full` / `9999px` for `'pill'`) propagated to link/button items. |
| `ref` | `Ref<HTMLElement>` | — | Native `<nav>` element ref. |

### `PaginationLink`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `isActive` | `boolean` | `false` | Marks current page with `aria-current="page"` and active border/surface styling. |
| `disabled` | `boolean` | `false` | Disables interaction (`disabled`, `aria-disabled="true"`, `tabIndex={-1}`, click guard). |
| `size` | `'sm' \| 'md' \| 'lg'` | Inherited from `<Pagination>` | Overrides parent density size. |
| `shape` | `'rounded' \| 'pill'` | Inherited from `<Pagination>` | Overrides parent corner shape (`--radius-control` or `--radius-full`). |
| `as` | `ElementType` | `'a'` | Polymorphic element (`'button'`, router link component, etc.). |
| `ref` | `Ref<HTMLAnchorElement>` | — | Target element ref. |

### `PaginationPrevious` & `PaginationNext`

Accept `PaginationLinkProps` plus localized `label: string` (or `children` paired with `aria-label`). Automatically include mirrored directional chevron icons (`aria-hidden="true"`).

### `PaginationEllipsis`

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `label` | `string` | **Required** | Screen-reader text rendered inside `.srOnly`. |
| `size` | `'sm' \| 'md' \| 'lg'` | Inherited from `<Pagination>` | Aligns ellipsis slot dimensions with adjacent buttons. |
| `ref` | `Ref<HTMLSpanElement>` | — | Native `<span>` ref. |

---

## Example Usage

```tsx
<Pagination aria-label={t('common.paginationLandmark')} size="md">
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious
        as="button"
        type="button"
        label={t('common.previous')}
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      />
    </PaginationItem>
    <PaginationItem>
      <PaginationLink as="button" type="button" isActive={page === 1} onClick={() => setPage(1)}>
        1
      </PaginationLink>
    </PaginationItem>
    <PaginationItem>
      <PaginationEllipsis label={t('common.morePages')} />
    </PaginationItem>
    <PaginationItem>
      <PaginationNext
        as="button"
        type="button"
        label={t('common.next')}
        disabled={page === total}
        onClick={() => setPage(page + 1)}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

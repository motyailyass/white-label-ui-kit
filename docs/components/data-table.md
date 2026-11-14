# Data Table Specification

## 1. Component Overview
The `DataTable` primitive provides accessible tabular data visualization for dashboards and websites. It exports 10 compound primitives (`TableContainer`, `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableEmpty`) supporting column sorting, multi-row selection, sticky header scrolling, striped row striping, and 3 density scales (`compact`, `default`, `comfortable`).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/data-table/`. Zero third-party data-grid dependencies and zero hardcoded English fallback copy (`TableEmpty` requires localized `children`).
- **React 19 `ref` Forwarding**: All 10 primitives accept `ref` directly via `ComponentPropsWithRef<T>` without `forwardRef`.
- **Semantic HTML5 & WAI-ARIA**: Honest `<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<th scope="col">`, `<td >`, and `<caption>` semantics. Sortable headers emit `aria-sort="ascending" | "descending" | "none"` and keyboard-accessible `<button type="button">` triggers with `aria-hidden="true"` sort indicators (`chevron-up`/`chevron-down` dual stack when unsorted, `arrow-up` / `arrow-down` when active).
- **Scroll Containment & Sticky Header**: `TableContainer` composes `<ScrollArea>` (`scrollbar-width: thin` / `6px` custom webkit track) so overflowing tables never show heavy native scrollbars. Setting `stickyHeader` switches `ScrollArea` orientation to `both` (`max-block-size: 15.5rem`) alongside `TableHeader sticky` (`position: sticky; inset-block-start: 0; z-index: var(--z-sticky)`).
- **Unified Card Composition**: Connected patterns (`DataTableGallery`) wrap toolbar controls, `<TableContainer borderless>`, and the integrated pagination bar inside a single `<Card padding="none">` shell separated by `--color-border-subtle` dividers, compose `<EmptyState>` inside `<TableEmpty>` with recovery actions, use `<Dropdown>` for the rows-per-page menu (zero OS native select popups), hide `<Pagination>` when `0` entries exist, and keep `<TableFooter>` summary rows opt-in.
- **Tokens, Arabic Script & Reduced Motion**: 100% logical CSS properties, canonical color/surface tokens, `:lang(ar)` Arabic font family + normal letter spacing on uppercase column headers, `@media (prefers-reduced-motion: reduce)` transition disabling, and zero box-shadows in Dashboard.
- **Density Sizing**:
  - `compact`: `var(--space-2)` block padding, `var(--space-3)` inline padding (tight analytical views)
  - `default`: `var(--space-3)` block padding, `var(--space-4)` inline padding (standard dashboard views)
  - `comfortable`: `var(--space-4)` block padding, `var(--space-5)` inline padding (spacious website/editorial views)

## 3. Component API
### `<TableContainer stickyHeader={boolean} borderless={boolean} scrollAreaLabel={string} />`
- `stickyHeader?: boolean` (default: `false`) — constrains vertical block height (`15.5rem`) for vertical scrolling inside `ScrollArea` alongside `<TableHeader sticky />`.
- `borderless?: boolean` (default: `false`) — removes the standalone outer border and card radius when embedded inside a `<Card>` shell.
- `scrollAreaLabel?: string` — localized accessible label forwarded to the inner `ScrollArea` region landmark.

### `<Table density={density} striped={boolean} />`
- `density?: 'compact' | 'default' | 'comfortable'` (default: `'default'`)
- `striped?: boolean` (default: `false`) — alternating row subtle surface tint.

### `<TableHeader sticky={boolean} />`
- `sticky?: boolean` (default: `false`) — pins header cells at `inset-block-start: 0` inside a scrolling `TableContainer`.

### `<TableHead sortDirection={sortDirection} onSort={onSort} align={align} />`
- `sortDirection?: 'ascending' | 'descending' | 'none'`
- `onSort?: () => void`
- `align?: 'start' | 'center' | 'end'` (default: `'start'`)

### `<TableRow selected={boolean} interactive={boolean} />`
- `selected?: boolean` (sets `aria-selected="true"` and `data-state="selected"`)
- `interactive?: boolean` (adds hover background, pointer cursor, and `data-interactive="true"`)

### `<TableCell align={align} truncate={boolean} />`
- `align?: 'start' | 'center' | 'end'` (default: `'start'`)
- `truncate?: boolean` (single-line ellipsis with `max-inline-size: 16rem`)

### `<TableEmpty colSpan={number}>...</TableEmpty>`
- `colSpan: number` (**Required**)
- `children: ReactNode` (**Required**) — localized zero-result message spanning all columns.

## 4. State Matrix
- **Densities**: `compact`, `default`, `comfortable` (`data-density`)
- **Row States**: Default, Hover (`.row_interactive`), Selected (`aria-selected="true"`), Striped (`data-striped="true"`)
- **Sort States**: None, Ascending (`aria-sort="ascending"`), Descending (`aria-sort="descending"`)
- **Theme**: Light & Dark (high-contrast border lines and readable text)
- **Direction & Script**: LTR (`en`/`fr`) & RTL (`ar` — logical alignment, normal tracking on `:lang(ar)` headers)

# FilterBar Primitive Specification

## 1. Overview
The `FilterBar` primitive provides a composable, accessible filter and search toolbar for data tables, resource catalogs, and dashboards. It coordinates search inputs, faceted filter triggers (`aria-pressed`), active filter tag chips (`category` + `label`), clear actions, and polite live-region result summaries.

## 2. Anatomy
```tsx
import {
  FilterBar,
  FilterBarClear,
  FilterBarGroup,
  FilterBarItem,
  FilterBarMain,
  FilterBarSummary,
  FilterBarTag,
  FilterBarTags,
  SearchInput,
} from '@/components/ui';

export function Example() {
  return (
    <FilterBar aria-label="Invoice filters">
      <FilterBarMain>
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search records..." size="sm" />
        <FilterBarGroup>
          <FilterBarItem active count={1}>Status</FilterBarItem>
          <FilterBarItem>Region</FilterBarItem>
        </FilterBarGroup>
        <FilterBarSummary>Showing 24 of 148 entries</FilterBarSummary>
      </FilterBarMain>
      <FilterBarTags>
        <FilterBarTag category="Status" label="Paid" onRemove={() => removeFilter('status')} />
        <FilterBarClear onClear={clearAll}>Clear all</FilterBarClear>
      </FilterBarTags>
    </FilterBar>
  );
}
```

## 3. Props Reference

### `FilterBar`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `aria-label` | `string` | `undefined` | Accessible label for the `role="toolbar"` container |

### `FilterBarItem`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `active` | `boolean` | `false` | Sets `aria-pressed={active}` and `data-active="true"` when active |
| `count` | `number` | `undefined` | Renders a numeric badge when `count > 0` |
| `icon` | `ReactNode` | `undefined` | Optional leading icon slot |
| `disabled` | `boolean` | `false` | Disables the filter trigger button |

### `FilterBarTag`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `category` | `string` | `undefined` | Optional facet category prefix (e.g., `"Status"`) |
| `label` | `string` | — | Active filter value label (e.g., `"Paid"`) |
| `onRemove` | `() => void` | `undefined` | Callback fired when the tag's remove button is clicked |
| `removeAriaLabel` | `string` | — (required with `onRemove`) | Localized accessible label for the remove button |
| `disabled` | `boolean` | `false` | Disables the tag remove button |

### `FilterBarClear`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `onClear` | `() => void` | `undefined` | Callback fired when clearing all active filters |
| `children` | `ReactNode` | — (required) | Localized clear button label |

### `FilterBarSummary`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | — | Result count summary announced via `role="status" aria-live="polite"` |

## 4. Keyboard, Accessibility & Token Contracts
- Container exposes `role="toolbar"` and `aria-label`.
- `FilterBarItem` exposes `aria-pressed={active}` and consumes `--control-height-sm` (`32px`).
- Count badge consumes `--font-size-xs` (`12px`) with `font-variant-numeric: tabular-nums` (Rule 16).
- Focus rings on `.filterItem:focus-visible`, `.tagRemove:focus-visible`, and `.clearButton:focus-visible` apply `transition: none` (Rule 18).
- Dashboard is 100% shadow-free (Rule 12); all spacing and layout rules use CSS logical properties (Rule 7).

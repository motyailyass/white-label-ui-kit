# SearchInput Specification

## 1. Component Overview
The `SearchInput` primitive is a specialized, pure single-line text input tailored for search querying, filtering, and rapid global navigation. It packages a leading search icon, token-aware control sizing, global keyboard shortcut interception (e.g. `/`), and an optional trailing suffix slot (such as a clear button or keyboard badge).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Located in `src/components/ui/search-input/`. Fully decoupled from i18n, router, or search engine state. Labels, placeholders, and shortcuts are provided via props.
- **Native Semantic Semantics**: Renders `<input type="search">` with native incremental search event handling and clear button behaviors.
- **Icon Integration**: Renders the canonical `<Icon name="search" />` primitive in a non-interactive slot (`aria-hidden="true"`).
- **Keyboard Shortcuts**: Optional `shortcut` prop (e.g. `/`) registers a window-level keyboard listener that automatically focuses the input when pressed outside active editable fields (`input`, `textarea`, `isContentEditable`).
- **Control Sizing**: Consumes the shared 6-step control sizing scale (`xs`, `sm`, `md`, `lg`, `xl`, `2xl`) and touch target policies (`auto`, `comfortable`).
- **Dashboard Shadow Prohibition**: 100% shadow-free. Visual boundaries rely on `--color-border-subtle`, resting surface background, and high-contrast focus rings.

## 3. Component API

### `<SearchInput />`
Inherits native `React.ComponentPropsWithoutRef<'input'>` (excluding `size`, `type`, `prefix`) and `ControlSizingProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `'default' \| 'subtle'` | `'default'` | Visual variant: standard control border or soft toolbar/sidebar border. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `'sm'` | Control density and height from the token scale. |
| `touchTarget` | `'auto' \| 'comfortable'` | `'auto'` | Touch target dimension policy (48px minimum when comfortable). |
| `shortcut` | `string` | `undefined` | Keyboard shortcut key (e.g. `'/'`) to automatically focus the search field. |
| `icon` | `React.ReactNode` | `undefined` | Custom icon slot replacing the default search icon. |
| `suffix` | `React.ReactNode` | `undefined` | Trailing content slot (e.g., custom clear button or status indicator). |
| `onSearch` | `(value: string) => void` | `undefined` | High-level callback emitted whenever the input value changes. |
| `placeholder` | `string` | `undefined` | Localized placeholder text. |
| `value` | `string` | `undefined` | Controlled value. |
| `defaultValue` | `string` | `undefined` | Uncontrolled default value. |

## 4. Accessibility & Keyboard Contracts
- Renders `type="search"` with optional accessible `aria-label` or explicit `<label htmlFor="...">` linkage.
- Shortcut badges render in a `<kbd>` tag marked `aria-hidden="true"`; the hint is visual only and injects no language-specific copy.
- Keyboard focus is communicated exclusively through high-contrast visible focus rings consuming `--focus-ring-width` and `--color-border-focus`.
- Fully supports RTL directions via CSS logical properties (`padding-inline-start`, `padding-inline-end`, `border-inline-end`).

## 5. Usage Examples

```tsx
import { SearchInput } from '@/components/ui/search-input';

// Basic search with global shortcut
<SearchInput
  placeholder="Search resources..."
  shortcut="/"
  onSearch={(query) => console.log('Searching for:', query)}
/>

// Toolbar subtle variant with custom clear button
<SearchInput
  variant="subtle"
  size="sm"
  placeholder="Filter list..."
  value={filter}
  onChange={(e) => setFilter(e.target.value)}
  suffix={
    filter ? (
      <Button variant="ghost" size="xs" iconOnly onClick={() => setFilter('')}>
        <Icon name="close" size={14} />
      </Button>
    ) : null
  }
/>
```

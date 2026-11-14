# Kbd Specification

## 1. Component Overview
The `Kbd` primitive represents keyboard input, shortcuts, and key combinations. Rendered with the semantic HTML `<kbd>` element, it supports 3 density sizes (`sm`, `md`, `lg`), 3 visual variants (`outline`, `subtle`, `ghost`), and companion layout components (`KbdGroup`, `KbdSeparator`) for assembling composite keyboard shortcuts (e.g. `⌘ + K` or `Ctrl + S`).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/kbd/`. Zero third-party headless libraries.
- **Semantic HTML & Accessibility**:
  - Uses native `<kbd>` tag with `data-size` and `data-variant` attributes.
  - Companion `KbdGroup` uses an inline container with logical spacing.
  - `KbdSeparator` defaults to `+` with `aria-hidden="true"` so screen readers are not confused by decorative arithmetic signs.
  - High-contrast forced-colors support via `@media (forced-colors: active)`.
- **RTL & Bidi Isolation**:
  - Keyboard shortcut sequences (e.g., `Ctrl + S`, `⌘ + K`) maintain left-to-right order even in Arabic/RTL documents using `direction: ltr; unicode-bidi: isolate;` on both `<kbd>` and `<KbdGroup>`.
- **Tokens & Geometry**:
  - Monospace font stack via `var(--font-family-mono)`.
  - Approved token scale: `sm` (1.125rem / 18px height, `var(--font-size-xs)` / 12px), `md` (1.375rem / 22px height, `var(--font-size-xs)` / 12px), `lg` (1.75rem / 28px height, `var(--font-size-sm)` / 14px).
  - 100% shadow-free in dashboard mode (visual separation via `var(--color-surface-raised)` and `var(--color-border-subtle)` / `var(--color-border-strong)`).
  - 100% CSS logical properties (`padding-inline`, `min-block-size`, `min-inline-size`).
- **Dark Mode Parity**: Automatically adapts across Light and Dark themes via semantic tokens.

## 3. Component API

### `<Kbd />`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Height density (`sm` = 18px, `md` = 22px, `lg` = 28px). |
| `variant` | `'outline' \| 'subtle' \| 'ghost'` | `'outline'` | Visual surface style. |
| `children` | `ReactNode` | — | Shortcut character or glyph. |
| `className` | `string` | — | Optional CSS class name. |
| `data-testid` | `string` | — | Test selector. |

### `<KbdGroup />`
Inline container for multi-key shortcuts.
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | — | Sequence of `Kbd` and `KbdSeparator` elements. |
| `className` | `string` | — | Optional CSS class name. |
| `data-testid` | `string` | — | Test selector. |

### `<KbdSeparator />`
Decorative separator between keys.
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `children` | `ReactNode` | `'+'` | Separator glyph. |
| `aria-hidden` | `boolean` | `true` | Hidden from assistive tech by default. |
| `className` | `string` | — | Optional CSS class name. |
| `data-testid` | `string` | — | Test selector. |

## 4. Usage Examples

### Single Key
```tsx
import { Kbd } from '@/components/ui';

export function QuickClose() {
  return <Kbd size="sm">Esc</Kbd>;
}
```

### Key Combination with Separator
```tsx
import { Kbd, KbdGroup, KbdSeparator } from '@/components/ui';

export function SearchShortcut() {
  return (
    <KbdGroup aria-label="Press Command K to search">
      <Kbd size="sm">⌘</Kbd>
      <KbdSeparator />
      <Kbd size="sm">K</Kbd>
    </KbdGroup>
  );
}
```

## 5. State Matrix
- **Sizes**: `sm` (18px), `md` (22px), `lg` (28px)
- **Variants**: `outline`, `subtle`, `ghost`
- **Theme**: Light & Dark (evaluated via semantic tokens)
- **Direction**: LTR & RTL (preserves LTR order for shortcut combinations)
- **Forced Colors**: Active (uses system `CanvasText` for borders and foreground)

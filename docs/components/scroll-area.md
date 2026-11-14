# ScrollArea Primitive Specification

## 1. Overview
The `ScrollArea` primitive provides custom cross-browser scrollable viewports with standardized styling, keyboard scroll navigation, and orientation support (`vertical`, `horizontal`, or `both`) without causing layout shifts.

## 2. Anatomy
```tsx
import { ScrollArea, ScrollBar } from '@/components/ui';

export function Example() {
  return (
    <ScrollArea orientation="vertical" maxHeight={240} aria-label="Activity feed">
      <div className={styles.list}>
        {items.map((item) => (
          <div key={item.id}>{item.title}</div>
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}
```

## 3. Props Reference

### `ScrollArea`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `'vertical' \| 'horizontal' \| 'both'` | `'vertical'` | Scrollable direction axis |
| `maxHeight` | `number \| string` | `undefined` | Viewport max block size in px or CSS length |
| `maxWidth` | `number \| string` | `undefined` | Viewport max inline size in px or CSS length |
| `viewportRef` | `React.Ref<HTMLDivElement>` | `undefined` | Ref forwarded directly to the scroll viewport |
| `viewportClassName` | `string` | `undefined` | Additional class name applied to the scroll viewport |
| `viewportTabIndex` | `number` | `0` | Tab index for keyboard scrollability (`-1` for nested controls) |
| `viewportRole` | `AriaRole` | `'region'` | ARIA role for the scrollable container (`'presentation'` for listboxes) |
| `aria-label` | `string` | `'Scrollable content'` | Accessible label for screen readers |
| `children` | `ReactNode` | required | Scrollable content elements |

### `ScrollBar`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Visual track orientation indicator |
| `className` | `string` | `undefined` | Custom styling hook |

## 4. Keyboard & Accessibility Contracts
- Viewport exposes `tabIndex={0}` and `aria-label` so keyboard users can navigate via `ArrowUp`/`ArrowDown`/`ArrowLeft`/`ArrowRight`/`PageUp`/`PageDown`.
- Native browser scrolling mechanics are preserved to support touch gestures, kinetic scrolling, and assistive technologies.
- Focus indicator displays an outline with `transition: none` adhering to Rule 18 (immediate focus indicators).
- When embedding within complex widgets (such as command palettes or comboboxes), pass `viewportRole="presentation"` and `viewportTabIndex={-1}` to prevent redundant region announcements.

## 5. Visual & Token Specifications
- **Track & Thumb**:
  - CSS standard `scrollbar-width: thin;`
  - Standard `scrollbar-color: var(--color-border-subtle) transparent;`
  - WebKit pseudo-elements for precision height/width (6px) with rounded pill geometry (`--radius-full`).
  - Hover: thumb transitions smoothly to `--color-text-muted`.
- **Shadow Policy (Rule 12)**:
  - Dashboard is 100% shadow-free. Visual separation is achieved strictly through borders and surfaces (`--color-surface`, `--color-surface-raised`, `--color-border-subtle`).
- **Direction & Logical Properties**:
  - 100% CSS logical properties (`inline-size`, `block-size`, `padding-inline`, `padding-block`).
  - Horizontal scrolling naturally mirrors in RTL layouts.

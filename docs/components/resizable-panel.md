# ResizablePanel Primitive Specification

## 1. Overview
The `ResizablePanel` primitive provides split-view layouts allowing users to resize adjacent panels via an accessible draggable separator handle with pointer capture, keyboard stepping, and min/max constraints without causing layout shifts.

## 2. Anatomy
```tsx
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui';

export function Example() {
  return (
    <ResizablePanelGroup orientation="horizontal" onLayout={(sizes) => console.log(sizes)}>
      <ResizablePanel order={0} defaultSize={30} minSize={20} maxSize={50}>
        <div>Navigation & Tree</div>
      </ResizablePanel>
      <ResizableHandle handleIndex={0} withHandle />
      <ResizablePanel order={1} defaultSize={70}>
        <div>Editor & Canvas</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
```

## 3. Props Reference

### `ResizablePanelGroup`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Splitting orientation axis |
| `onLayout` | `(sizes: number[]) => void` | `undefined` | Callback fired when panel sizes update (in percentages) |
| `children` | `ReactNode` | required | Child `ResizablePanel` and `ResizableHandle` components |
| `className` | `string` | `undefined` | Custom styling hook |

### `ResizablePanel`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `order` | `number` | `0` | Zero-based index indicating panel position in group |
| `defaultSize` | `number` | `50` | Initial panel size percentage (0–100) |
| `minSize` | `number` | `10` | Minimum panel percentage clamp |
| `maxSize` | `number` | `90` | Maximum panel percentage clamp |
| `children` | `ReactNode` | required | Content rendered inside the panel |

### `ResizableHandle`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `handleIndex` | `number` | `0` | Zero-based index of the panel to the left/top of this handle |
| `withHandle` | `boolean` | `false` | Renders a visual grip notch in the center of the handle |
| `disabled` | `boolean` | `false` | Disables drag interactions and removes from keyboard tab order |
| `className` | `string` | `undefined` | Custom styling hook |

## 4. Keyboard & Accessibility Contracts
- Handle has `role="separator"`, `tabIndex={0}`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-orientation`.
- `ArrowLeft` / `ArrowRight` (or `ArrowUp` / `ArrowDown`) steps size by 2%.
- In RTL containers (`dir="rtl"`), `ArrowLeft` and `ArrowRight` inverted behavior is applied automatically.
- `Home` collapses to minimum size, `End` expands to maximum size.
- Pointer capture (`setPointerCapture`) prevents cursor loss when dragging rapidly outside the handle bounds.
- Focus indicator displays an outline with `transition: none` adhering to Rule 18 (immediate focus indicators).

## 5. Visual & Token Specifications
- **Layout**: Flexible layout tracks with percentage-based sizing.
- **Handle**:
  - Interactive hit target: 8px. Visual indicator: 1px subtle border.
  - Optional central grip notch pill (`--radius-sm`).
  - Active / hover: `--color-border-focus`.
  - Layers consume `--_z-layer-raised: 1` within the group's isolated stacking context, adhering to Rule 17.
- **Shadow Policy (Rule 12)**:
  - Dashboard is 100% shadow-free. Depth is achieved via surface contrast (`--color-surface-raised`, `--color-surface`) and subtle borders.
- **Direction & Logical Properties**:
  - 100% CSS logical properties (`inline-size`, `block-size`, `margin-inline`, `margin-block`).

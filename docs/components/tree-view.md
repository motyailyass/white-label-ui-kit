# TreeView Primitive Specification

## 1. Overview
The `TreeView` primitive represents hierarchical data structures—such as file directories, access control hierarchies, or document outlines—with expandable/collapsible branch nodes, selectable leaf items, trailing `meta` badges, and full WAI-ARIA tree keyboard navigation (`ArrowDown`, `ArrowUp`, `ArrowRight`, `ArrowLeft`, `Home`, `End`, `Enter`, `Space`) with automatic RTL mirroring.

## 2. Anatomy
```tsx
import { TreeNode, TreeView } from '@/components/ui';

export function Example() {
  return (
    <TreeView
      aria-label="Project Explorer"
      selectedId={selected}
      onSelect={setSelected}
      defaultExpandedIds={['src']}
    >
      <TreeNode id="src" label="src" icon="folder" meta="2 files">
        <TreeNode id="app" label="app.tsx" icon="attachment" meta="4.2 KB" />
        <TreeNode id="index" label="index.ts" icon="attachment" meta="1.8 KB" />
      </TreeNode>
      <TreeNode id="package" label="package.json" icon="attachment" meta="2.1 KB" />
    </TreeView>
  );
}
```

## 3. Props Reference

### `TreeView`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `selectedId` | `string` | `undefined` | Controlled selected node ID |
| `defaultSelectedId` | `string` | `undefined` | Initial uncontrolled selected node ID |
| `onSelect` | `(id: string) => void` | `undefined` | Callback fired when a node is selected |
| `expandedIds` | `string[]` | `undefined` | Controlled array of expanded branch node IDs |
| `defaultExpandedIds` | `string[]` | `[]` | Initial uncontrolled expanded branch node IDs |
| `onExpandedChange` | `(expandedIds: string[]) => void` | `undefined` | Callback fired when branch expansion changes |
| `disabled` | `boolean` | `false` | Disables all tree nodes |
| `aria-label` | `string` | `'Tree navigation'` | Accessible label for the `role="tree"` container |

### `TreeNode`
| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | — | Unique identifier for the tree node |
| `label` | `ReactNode` | — | Primary node label |
| `icon` | `IconName \| Exclude<ReactNode, string>` | `undefined` | Strictly typed `IconName` or custom JSX icon element |
| `meta` | `ReactNode` | `undefined` | Optional trailing metadata badge or count |
| `disabled` | `boolean` | `false` | Disables interaction for this node |

## 4. Keyboard, Accessibility & Token Contracts
- Container exposes `role="tree"` and `aria-label`; branch children render inside `<ul role="group">`.
- Each `<li role="treeitem">` exposes `aria-selected` and (on branches) `aria-expanded`.
- Full WAI-ARIA keyboard traversal:
  - `ArrowDown` / `ArrowUp`: Moves focus to the next / previous visible enabled node.
  - `Home` / `End`: Moves focus to the first / last visible enabled node.
  - `ArrowRight` (`ArrowLeft` in `dir="rtl"`): Expands a closed branch, or moves focus to the first child of an already open branch.
  - `ArrowLeft` (`ArrowRight` in `dir="rtl"`): Collapses an open branch, or moves focus to the parent branch of a closed branch or leaf node.
  - `Enter` / `Space`: Selects the focused node and toggles expansion if it is a branch.
- Selected nodes consume `--color-primary-subtle` and `--color-primary-subtle-foreground`.
- Focus rings on `.nodeRow:focus-visible` apply `transition: none` (Rule 18).

---
trigger: glob
globs: "**/src/**/*.ts, **/src/**/*.tsx"
description: "Icon usage and the shared Hugeicons registry."
---
# Icons

Hugeicons is installed once and imported by one folder: `src/components/icons/`.

## Use

```tsx
import { Icon } from '@/components/icons';

<Icon name="inbox" />                       // size follows font-size
<Icon name="search" size={16} />            // explicit size
<Icon name="warning" label="Warning" />     // announced to screen readers
<Icon name="chevron-right" />               // arrow/chevron flips in RTL
```

- Pass icons as nodes: `icon={<Icon name="inbox" />}`.
- Decorative icons are aria-hidden by default; add label only when the icon is the only content of a control.
- Directional glyphs are registered with `directional()` and flip under `dir="rtl"`. Never flip them with your own CSS.

## Add an icon

1. Find it on hugeicons.com (free, stroke-rounded).
2. Confirm the export in `node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts`.
3. Add one line to `registry.ts` under the matching group.
4. Reference it by the semantic name, never by the vendor name.

## Never

- Import `@hugeicons/*` outside `src/components/icons/` — lint fails.
- Put raw `<svg>` in `app/`, `layouts/`, `shell/`, or `patterns/`; use `<Icon>`. Inline `<svg>` is allowed only in `components/ui/` (structural glyphs like spinners) and `components/icons/`.
- Re-export Hugeicons components or types from the icons barrel.
- Bulk-import unused icons into the registry.


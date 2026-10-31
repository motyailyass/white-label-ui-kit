---
trigger: glob
globs: "**/src/**/*.ts, **/src/**/*.tsx, **/src/**/*.css"
description: "Icon usage, directional RTL mirroring, and the shared Hugeicons registry."
---
# 32-icons: Icon Usage & Registry

Hugeicons is installed once and imported by one folder: `src/components/icons/`.

## Use

```tsx
import { Icon } from '@/components/icons';

<Icon name="inbox" />                       // size follows font-size (1em)
<Icon name="search" size={16} />            // explicit size when outside a sized control
<Icon name="warning" label="Warning" />     // announced to screen readers (localized via t())
<Icon name="chevron-right" />               // directional glyph flips automatically in RTL
```

- Pass icons as nodes: `startIcon={<Icon name="inbox" />}`. Inside controls, prefer CSS `--control-icon-size-*` over hardcoded pixel `size`.
- Decorative icons are `aria-hidden="true"` by default; pass a localized `label` ONLY when the icon conveys standalone meaning without adjacent text/button `aria-label`.
- Directional glyphs are registered with `directional()` in `registry.ts` and mirror automatically under `dir="rtl"` (emitting `data-mirror-rtl="true"` for inspection/tests). Never flip icons manually in component CSS, and never invent `<MirroredIcon>` wrappers.

## Add an icon

1. Find it on hugeicons.com (free, stroke-rounded).
2. Confirm the export in `node_modules/@hugeicons/core-free-icons/dist/types/index.d.ts`.
3. Add one line to `dashboard/src/components/icons/registry.ts` under the matching group, then run `pnpm run sync:shared`.
4. Reference it by the semantic name, never by the vendor name.

## Never

- Import `@hugeicons/*` outside `src/components/icons/` — lint fails.
- Put raw `<svg>` in `app/`, `layouts/`, `shell/`, `patterns/`, `components/website/`, or `wireframes/`; always use `<Icon>`. Inline `<svg>` is allowed ONLY in `components/ui/` (structural glyphs like spinners) and `components/icons/`.
- Re-export Hugeicons components or types from the icons barrel.
- Bulk-import unused icons into the registry.


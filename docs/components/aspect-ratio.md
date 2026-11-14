# AspectRatio Specification

## 1. Component Overview
The `AspectRatio` primitive displays content (images, videos, embeds, maps, custom cards) at a designated width-to-height ratio. It maintains consistent dimensional geometry across fluid and responsive parent containers.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/aspect-ratio/`. Zero third-party dependencies, zero application context.
- **Modern CSS**: Uses native CSS `aspect-ratio` property with absolute positioning geometry for nested child elements and media (`img`, `video`, `iframe`).
- **Normalized Ratio Syntax**: Accepts numeric values (e.g. `16 / 9`, `1`), slash ratio strings (`"16 / 9"`), or colon ratio strings (`"16:9"`). Colon strings are automatically normalized to `"16 / 9"` to prevent CSS parsing rejections.
- **Child Stretching & Media Fit**: Direct children automatically stretch to fill the aspect container (`inline-size: 100%; block-size: 100%`), and media elements (`img`, `video`, `iframe`) apply `object-fit: cover`.
- **Tokens & Geometry**:
  - Container consumes `--radius-card` or custom border-radius via standard CSS.
  - Overflow handling (`overflow: hidden`) prevents media bleed without clipping parent focus rings.
  - 100% shadow-free in dashboard mode.
  - 100% CSS logical properties (`inline-size`, `block-size`, `inset`).

## 3. Component API
### `<AspectRatio ratio={ratio} className={className} style={style}>{children}</AspectRatio>`
- `ratio?: number | string`: Aspect ratio defined as a number (e.g., `16 / 9`, `4 / 3`, `1`), slash ratio string (`"16 / 9"`), or colon ratio string (`"16:9"`, default: `16 / 9`).
- `children: ReactNode`: Embedded content (image, video, iframe, or custom markup).
- `className?: string`: Outer wrapper class override.
- `style?: CSSProperties`: Optional inline style overrides (merges cleanly with `--aspect-ratio`).
- `data-testid?: string`: Test locator hook forwarded to outer element.
- Spreads any remaining `ComponentPropsWithoutRef<'div'>` (e.g., `id`, `aria-label`).

## 4. Supported Ratio Presets
- `16/9` (1.778): Standard widescreen landscape video and embeds.
- `4/3` (1.333): Classic photo, illustration, and card media.
- `1/1` (1.000): Square product previews, avatars, and icons.
- `21/9` (2.333): Ultrawide cinematic banners and hero showcases.

## 5. Studio & Gallery Parity
- **Interactive Controls**: Direction (`LTR` / `RTL`), Aspect Ratio (`16:9`, `4:3`, `1:1`, `21:9`), and Content Type (`Media Graphic`, `Custom Card`).
- **i18n & RTL Parity**: Fully wired to `useI18n()` and `specimenT`, rendering authentic Arabic typography and labels in RTL preview.
- **Inspector Specs**: Displays component state, computed decimal value, modern CSS rules, and containment contracts.

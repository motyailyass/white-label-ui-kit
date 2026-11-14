# ThemeToggle Specification

## 1. Component Overview
The `ThemeToggle` primitive is a pure interactive button that triggers application theme transitions (e.g. toggling between light and dark modes). It encapsulates icon state, accessible labels, pressed states, and control sizing tokens while remaining entirely detached from runtime provider context.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Located in `src/components/ui/theme-toggle/`. Does not import `@/providers` or `@/i18n`. Current state, localized text, and change handlers are passed in via props by connected patterns (such as `ThemeSwitcher`).
- **Semantic Toggle Button**: Renders `<button type="button">` with `aria-pressed={isDark}` to honestly communicate the toggle state to assistive technologies.
- **Icon Representation**: Leverages the canonical `<Icon name="sun" />` and `<Icon name="moon" />` primitives, swapping based on `resolvedTheme`.
- **Zero Motion Glitches**: Theme switches do not animate whole-page backgrounds or colors; focus outlines appear immediately without transitions.
- **100% Shadow-Free in Dashboard**: Adheres to the strict dashboard shadow prohibition. Depth and states are communicated via surface hover (`--color-surface-hover`) and borders.

## 3. Component API

### `<ThemeToggle />`
Inherits native `React.ComponentPropsWithoutRef<'button'>` (excluding `children`) and `ControlSizingProps`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `theme` | `'light' \| 'dark' \| 'system'` | `'system'` | Configured application theme preference. |
| `resolvedTheme` | `'light' \| 'dark'` | `'light'` | Effective theme active on the page after resolving system preferences. |
| `onToggle` | `() => void` | `undefined` | Callback invoked when the user clicks the button without default prevention. |
| `showLabel` | `boolean` | `true` | Whether to display a textual label beside the sun/moon icon. |
| `lightLabel` | `string` | `undefined` | Localized label displayed when the current resolved theme is dark (prompting switch to light). |
| `darkLabel` | `string` | `undefined` | Localized label displayed when the current resolved theme is light (prompting switch to dark). |
| `ariaLabel` | `string` | `undefined` | Accessible label for icon-only instances or screen readers. |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl'` | `undefined` | Control size scale preset (defaults to product scale). |
| `touchTarget` | `'auto' \| 'comfortable'` | `'auto'` | Interaction area sizing policy. |

## 4. Accessibility & Interaction Contracts
- Communicates two-state toggle status using `aria-pressed`.
- Icon is marked `aria-hidden="true"` so screen readers rely on either visible label text or `aria-label`.
- Fully navigatable and activatable via keyboard (`Space` and `Enter`).
- Direction-neutral geometry with logical padding and flex gap.

## 5. Usage Examples

```tsx
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Pure primitive wired with local state or custom provider
<ThemeToggle
  resolvedTheme={isDarkMode ? 'dark' : 'light'}
  onToggle={() => setIsDarkMode((prev) => !prev)}
  lightLabel="Switch to Light Mode"
  darkLabel="Switch to Dark Mode"
  ariaLabel="Toggle color theme"
/>

// Icon-only compact version for toolbars
<ThemeToggle
  showLabel={false}
  size="sm"
  resolvedTheme="dark"
  ariaLabel="Toggle theme"
  onToggle={toggleTheme}
/>
```

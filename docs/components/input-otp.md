# InputOtp Specification

## 1. Component Overview
The `InputOtp` primitive renders a segmented one-time password / PIN code input. It coordinates multiple discrete input slots with auto-advance on typing, auto-retreat on backspace, keyboard arrow navigation, automatic clipboard paste distribution, and optional separator dividers.

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/input-otp/`. Zero third-party dependencies, zero application context.
- **WAI-ARIA Accessibility**:
  - Container element renders `role="group"` with accessible `aria-label`.
  - Individual slots expose `inputMode="numeric"` or `inputMode="text"`, `autoComplete="one-time-code"`, and slot position announcements (`aria-label="Digit 1 of 6"` or custom `slotAriaLabel`).
  - High-contrast `@media (forced-colors: active)` mode with `Highlight` focus outlines and `GrayText` disabled states.
- **Smart Focus Enforcement & Keyboard Handling**:
  - Clicking any empty slot ahead of the current input automatically snaps focus to the first empty slot, preventing skipped slots and disconnected holes.
  - Typing a digit immediately shifts focus to the succeeding slot with race-condition-safe synchronous value tracking.
  - Backspace clears the active slot or shifts back to clear the preceding slot.
  - ArrowLeft and ArrowRight navigate between slots, taking local `dir="rtl"` into account.
  - Pasting a full code distributes characters cleanly across slots from the current index and triggers `onComplete` when fully populated.
- **Layout Variants**:
  - `variant="separated"` (default): discrete individual rounded square boxes with gaps.
  - `variant="grouped"`: single connected pill container with internal vertical borders (grouped into segments around `separatorIndex`).
- **Tokens & Geometry**:
  - Slot dimensions consume control tokens: `sm` (36px), `md` (44px), `lg` (52px).
  - Border and focus rings consume `--color-border-subtle` and `--focus-ring-width` with `--color-border-focus`.
  - 100% shadow-free in dashboard mode.
  - 100% CSS logical properties.
  - Zero raw hex color fallbacks.

## 3. Component API
### `<InputOtp length={6} value={value} onChange={onChange} onComplete={onComplete} size={size} variant={variant} disabled={disabled} error={error} mask={mask} slotAriaLabel={slotAriaLabel} />`
- `length?: number`: Number of slots (default: `6`).
- `value?: string`: Controlled PIN value.
- `defaultValue?: string`: Uncontrolled initial value.
- `onChange?: (value: string) => void`: Callback fired on any slot value change.
- `onComplete?: (value: string) => void`: Callback fired when all slots are filled.
- `size?: 'sm' | 'md' | 'lg'`: Slot density scale (default: `md`).
- `variant?: 'separated' | 'grouped'`: Slot layout style (default: `'separated'`).
- `disabled?: boolean`: Disables all input slots (`data-disabled="true"`).
- `error?: boolean`: Renders error border and focus ring (`data-error="true"`).
- `mask?: boolean`: Masks characters natively via `type="password"`.
- `type?: 'numeric' | 'alphanumeric'`: Allowed input characters (default: `'numeric'`).
- `separatorIndex?: number`: Position to insert visual divider dash (e.g. `3` for 3-3 split).
- `slotAriaLabel?: (index: number, total: number) => string`: Accessible label generator for slots.
- `data-testid?: string`: Test hook attribute forwarded to root element.

## 4. State Matrix
- **Lengths**: 4, 6 digits
- **Variants**: `separated` (individual boxes), `grouped` (connected bar)
- **Sizes**: `sm` (36px), `md` (44px), `lg` (52px)
- **States**: Empty, Partial, Filled / Complete (`data-complete="true"`), Focused, Disabled, Error
- **Theme**: Light & Dark (evaluated via canonical color tokens)
- **Direction**: LTR & RTL (logical properties and direction-aware mirrored arrow keys)

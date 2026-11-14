# DatePicker Specification

## 1. Component Overview
The `DatePicker` primitive provides an accessible, keyboard-operable calendar dropdown for selecting calendar dates. It couples a button trigger with an accessible WAI-ARIA date grid popover (`role="dialog"` + `role="grid"`), month navigation controls, optional clear button, validation/disabled states, and the shared six-step `ControlSizingProps` scale (`xs` through `2xl`).

## 2. Architecture & Design Principles
- **Purity & White-Label**: Pure markup and styling in `src/components/ui/date-picker/`. Zero third-party date dependencies and zero `@/providers` / `@/i18n` imports. Uses standard native `Date` objects and `Intl.DateTimeFormat`.
- **Product-Owned Sizing & Touch Targets**: Extends `ControlSizingProps` (`size`, `touchTarget = 'auto'`). When `size` is omitted, CSS binds to `--control-*-default` (`md` 36px in Dashboard, `xl` 48px in Website). Enforces `48×48px` minimum interaction targets under `touchTarget="comfortable"` or coarse pointers.
- **WAI-ARIA Accessibility**:
  - Trigger: `<button type="button">` with `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`, and `aria-invalid` when `invalid`. Optional clear button sits cleanly before the pinned trailing chevron (`[×] [▾]`) with zero chevron jump.
  - Calendar Surface: `role="dialog"` with `aria-modal="false"`, `aria-label`, Tab containment across enabled dialog controls, and interactive Month/Year header controls supporting direct drill-down into 3×4 Month and Year decade views (`Escape` steps back to day grid before closing).
  - Date Grid: `role="grid"` with `<div role="row">` rows, locale-derived `role="columnheader"` labels (`Intl.DateTimeFormat`), and `role="gridcell"` buttons.
  - Day Buttons: Roving `tabIndex={0 | -1}` moving DOM focus on open and navigation, `aria-selected`, `aria-current="date"`, and `aria-disabled` (preserving keyboard focus across constrained ranges without allowing selection).
  - Keyboard Navigation:
    - `ArrowLeft` / `ArrowRight`: Previous / next day or period cell (automatically mirrored for ancestor `dir="rtl"`).
    - `ArrowUp` / `ArrowDown`: Previous / next week (`-7` / `+7` days) or row (`±3` in month/year grids).
    - `PageUp` / `PageDown`: Previous / next month (with day-of-month clamping).
    - `Home` / `End`: First / last day of the current viewed month (or first / last cell in month/year grids).
    - `Enter` / `Space`: Select focused day (unless `aria-disabled`), month, or year.
    - `Escape`: Return from month/year view to day grid, or close popover and restore focus to trigger.
- **Tokens, Contrast & Reduced Motion**:
  - Popover consumes `var(--color-surface-raised)`, `var(--color-border-subtle)`, `var(--radius-card)`, and `var(--z-dropdown)`.
  - 2px balanced focus contract on `.trigger`, semantic disabled/danger states, `@media (prefers-reduced-motion: reduce)`, `@media (forced-colors: active)`, `:dir(rtl)` navigation arrow mirroring, and `:lang(ar)` Arabic font/tracking/line-height rules.
  - 100% shadow-free in dashboard mode.

## 3. Component API
### `<DatePicker value={value} defaultValue={defaultValue} onChange={onChange} minDate={minDate} maxDate={maxDate} size={size} touchTarget={touchTarget} invalid={invalid} disabled={disabled} clearable={clearable} />`
- `value?: Date | string | null` / `defaultValue?: Date | string | null`: Selected date (`Date` instance or `YYYY-MM-DD` string).
- `onChange?: (date: Date | null, isoString: string) => void`: Callback fired on selection or clear.
- `minDate?: Date | string` / `maxDate?: Date | string`: Inclusive selectable bounds; out-of-bounds month/year cells and header navigation buttons disable automatically.
- `size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`: Optional explicit control size (omit to inherit product default).
- `touchTarget?: 'auto' | 'comfortable'`: Interaction target policy (`auto` adapts on coarse pointers; `comfortable` enforces 48px minimum).
- `invalid?: boolean`: Validation error state (`aria-invalid="true"`).
- `disabled?: boolean`: Disables trigger and calendar.
- `clearable?: boolean`: Displays clear button when a value is present and enabled.
- `clearLabel?: string`, `previousMonthLabel?: string`, `nextMonthLabel?: string`, `previousYearLabel?: string`, `nextYearLabel?: string`, `previousYearsLabel?: string`, `nextYearsLabel?: string`, `selectMonthLabel?: string`, `selectYearLabel?: string`: Localized accessible labels supplied by connected callers.
- `weekdays?: readonly string[]`: Optional custom 7-day header labels; defaults to locale-formatted short weekdays via `Intl.DateTimeFormat(locale, { weekday: 'short' })`.
- `locale?: string`: BCP-47 locale tag for formatting month/day/weekday labels (defaults to `'en-US'`).
- `formatDate?: (date: Date) => string`: Optional custom trigger date formatter.

## 4. State Matrix
- **Control Sizing**: Product default (`md` 36px in Dashboard, `xl` 48px in Website) and explicit `xs`..`2xl`
- **States**: Default / Unselected, Selected, Focused, Invalid, Disabled, Open Popover, Constrained Bounds (`minDate` / `maxDate`)
- **Theme & A11y**: Light, Dark, `@media (prefers-reduced-motion: reduce)`, `@media (forced-colors: active)`
- **Direction**: LTR & RTL (`dir="rtl"`, `:lang(ar)` Arabic script clearance, mirrored arrow navigation)

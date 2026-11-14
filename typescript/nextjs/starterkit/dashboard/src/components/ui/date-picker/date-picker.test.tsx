import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DatePicker } from './date-picker';

describe('DatePicker Primitive', () => {
  it('renders trigger with placeholder, accessible attributes, and omits data-size by default', () => {
    render(<DatePicker placeholder="Pick a date" data-testid="date-picker" />);

    const root = screen.getByTestId('date-picker');
    expect(root.getAttribute('data-size')).toBeNull();
    expect(root.getAttribute('data-touch-target')).toBe('auto');

    const trigger = screen.getByRole('button', { name: /pick a date/i });
    expect(trigger.getAttribute('type')).toBe('button');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('supports explicit ControlSizingProps and hidden form value input', () => {
    render(
      <DatePicker
        defaultValue="2026-11-10"
        size="xl"
        touchTarget="comfortable"
        name="reservationDate"
        data-testid="date-picker"
      />,
    );

    const root = screen.getByTestId('date-picker');
    expect(root.getAttribute('data-size')).toBe('xl');
    expect(root.getAttribute('data-touch-target')).toBe('comfortable');

    const hiddenInput = root.querySelector(
      'input[type="hidden"][name="reservationDate"]',
    ) as HTMLInputElement;
    expect(hiddenInput).toBeTruthy();
    expect(hiddenInput.value).toBe('2026-11-10');
  });

  it('opens calendar dialog, focuses active day cell, and exposes WAI-ARIA rows', async () => {
    const user = userEvent.setup();
    render(
      <DatePicker
        defaultValue="2026-11-10"
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        clearLabel="Clear date"
      />,
    );

    const trigger = screen.getByRole('button', { name: /nov 10, 2026/i });
    await user.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const dialog = screen.getByRole('dialog');
    expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);

    const grid = screen.getByRole('grid');
    expect(grid.getAttribute('tabindex')).toBeNull();
    expect(screen.getAllByRole('row').length).toBe(7); // 1 header row + 6 week rows
    expect(screen.getAllByRole('columnheader').length).toBe(7);

    const day10 = grid.querySelector('button[data-date="2026-11-10"]') as HTMLButtonElement;
    expect(day10).toBeTruthy();
    expect(document.activeElement).toBe(day10);
    expect(day10.getAttribute('aria-selected')).toBe('true');
  });

  it('navigates dates via keyboard and selects with Enter, or restores focus on Escape', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DatePicker
        defaultValue="2026-11-10"
        onChange={handleChange}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        clearLabel="Clear date"
      />,
    );

    const trigger = screen.getByRole('button', { name: /nov 10, 2026/i });
    await user.click(trigger);

    // Move +1 day (ArrowRight -> 11) and +1 week (ArrowDown -> 18)
    await user.keyboard('{ArrowRight}{ArrowDown}');
    const day18 = screen.getByRole('grid').querySelector('button[data-date="2026-11-18"]');
    expect(document.activeElement).toBe(day18);

    // Escape closes dialog and restores focus to trigger
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(trigger);

    // Re-open, navigate Home (Nov 1), then press Enter to commit
    await user.click(trigger);
    await user.keyboard('{Home}{Enter}');
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '2026-11-01');
    expect(document.activeElement).toBe(trigger);
  });

  it('maintains keyboard roving focus when controlled value is a Date instance', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DatePicker
        value={new Date(2026, 10, 10)}
        onChange={handleChange}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        clearLabel="Clear date"
      />,
    );

    await user.click(screen.getByRole('button', { name: /nov 10, 2026/i }));
    await user.keyboard('{ArrowRight}');
    expect(document.activeElement?.getAttribute('data-date')).toBe('2026-11-11');
    await user.keyboard('{Enter}');
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '2026-11-11');
  });

  it('reverses ArrowLeft and ArrowRight inside subtree dir="rtl" containers', async () => {
    const user = userEvent.setup();
    render(
      <div dir="rtl">
        <DatePicker
          defaultValue="2026-11-10"
          locale="ar-EG"
          previousMonthLabel="الشهر السابق"
          nextMonthLabel="الشهر التالي"
          clearLabel="مسح التاريخ"
          data-testid="rtl-picker"
        />
      </div>,
    );

    const trigger = screen.getByTestId('rtl-picker').querySelector('button') as HTMLButtonElement;
    await user.click(trigger);

    // In RTL, ArrowLeft advances to the next day (11), ArrowRight moves back
    await user.keyboard('{ArrowLeft}');
    const day11 = screen.getByRole('grid').querySelector('button[data-date="2026-11-11"]');
    expect(document.activeElement).toBe(day11);

    await user.keyboard('{ArrowRight}');
    const day10 = screen.getByRole('grid').querySelector('button[data-date="2026-11-10"]');
    expect(document.activeElement).toBe(day10);
  });

  it('enforces minDate and maxDate constraints and disables out-of-bounds month navigation', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DatePicker
        defaultValue="2026-11-10"
        minDate="2026-11-05"
        maxDate="2026-11-25"
        onChange={handleChange}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        clearLabel="Clear date"
      />,
    );

    await user.click(screen.getByRole('button', { name: /nov 10, 2026/i }));

    const prevMonthBtn = screen.getByRole('button', { name: 'Previous month' });
    const nextMonthBtn = screen.getByRole('button', { name: 'Next month' });
    expect((prevMonthBtn as HTMLButtonElement).disabled).toBe(true);
    expect((nextMonthBtn as HTMLButtonElement).disabled).toBe(true);

    const day04 = screen
      .getByRole('grid')
      .querySelector('button[data-date="2026-11-04"]') as HTMLButtonElement;
    expect(day04.getAttribute('aria-disabled')).toBe('true');

    await user.click(day04);
    expect(handleChange).not.toHaveBeenCalled();

    const day15 = screen
      .getByRole('grid')
      .querySelector('button[data-date="2026-11-15"]') as HTMLButtonElement;
    expect(day15.getAttribute('aria-disabled')).toBeNull();
    await user.click(day15);
    expect(handleChange).toHaveBeenCalledWith(expect.any(Date), '2026-11-15');
  });

  it('supports invalid and disabled states plus clearable reset and ref forwarding', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    const ref = createRef<HTMLDivElement>();

    const { rerender } = render(
      <DatePicker
        ref={ref}
        defaultValue="2026-11-10"
        invalid
        onChange={handleChange}
        clearable
        clearLabel="Clear date"
        data-testid="state-picker"
      />,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('data-invalid')).toBe('true');
    expect(screen.getByRole('button', { name: /nov 10, 2026/i }).getAttribute('aria-invalid')).toBe(
      'true',
    );

    await user.click(screen.getByRole('button', { name: /clear date/i }));
    expect(handleChange).toHaveBeenCalledWith(null, '');

    rerender(
      <DatePicker
        ref={ref}
        defaultValue="2026-11-10"
        disabled
        placeholder="Disabled date"
        clearable
        clearLabel="Clear date"
        data-testid="state-picker"
      />,
    );

    expect(ref.current?.getAttribute('data-disabled')).toBe('true');
    expect(screen.queryByRole('button', { name: /clear date/i })).toBeNull();
  });

  it('supports direct month and year drill-down navigation with bounds and Escape back to days', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DatePicker
        defaultValue="2026-11-10"
        minDate="2025-06-01"
        maxDate="2026-12-31"
        onChange={handleChange}
        previousMonthLabel="Previous month"
        nextMonthLabel="Next month"
        previousYearLabel="Previous year"
        nextYearLabel="Next year"
        previousYearsLabel="Previous years"
        nextYearsLabel="Next years"
        selectMonthLabel="Choose month"
        selectYearLabel="Choose year"
        clearLabel="Clear date"
      />,
    );

    const trigger = screen.getByRole('button', { name: /nov 10, 2026/i });
    await user.click(trigger);

    // Open Month view from header
    await user.click(screen.getByRole('button', { name: 'Choose month: November' }));
    expect(screen.getByRole('group', { name: 'Choose month' })).toBeTruthy();

    // Open Year view from Month view header
    await user.click(screen.getByRole('button', { name: 'Choose year: 2026' }));
    const yearsGroup = screen.getByRole('group', { name: 'Choose year' });
    expect(yearsGroup).toBeTruthy();

    // 2024 and 2027 are outside 2025-06-01..2026-12-31
    expect(
      (yearsGroup.querySelector('button[data-year="2024"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (yearsGroup.querySelector('button[data-year="2027"]') as HTMLButtonElement).disabled,
    ).toBe(true);

    // Pick 2025 -> transitions to Months view of 2025, where Jan..May (0..4) are disabled
    await user.click(yearsGroup.querySelector('button[data-year="2025"]') as HTMLButtonElement);
    const monthsGroup = screen.getByRole('group', { name: 'Choose month' });
    expect(
      (monthsGroup.querySelector('button[data-month="4"]') as HTMLButtonElement).disabled,
    ).toBe(true);
    expect(
      (monthsGroup.querySelector('button[data-month="5"]') as HTMLButtonElement).disabled,
    ).toBe(false);

    // Pick June (month index 5) -> returns to Day grid in June 2025
    await user.click(monthsGroup.querySelector('button[data-month="5"]') as HTMLButtonElement);
    expect(screen.getByRole('grid', { name: 'June 2025' })).toBeTruthy();

    // Escape in sub-view returns to Day grid instead of closing popover
    await user.click(screen.getByRole('button', { name: 'Choose month: June' }));
    expect(screen.queryByRole('grid')).toBeNull();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('grid', { name: 'June 2025' })).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();

    // Clicking active Month caption button toggles back to Day grid
    await user.click(screen.getByRole('button', { name: 'Choose month: June' }));
    expect(screen.queryByRole('grid')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Choose month: June' }));
    expect(screen.getByRole('grid', { name: 'June 2025' })).toBeTruthy();
  });
});

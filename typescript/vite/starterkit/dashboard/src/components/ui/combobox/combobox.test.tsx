import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Combobox, type ComboboxOption } from './combobox';

const testOptions: ComboboxOption[] = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom', disabled: true },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
];

describe('Combobox Primitive — Single Select', () => {
  it('renders with role="combobox", aria-expanded="false", and aria-autocomplete="list"', () => {
    render(<Combobox options={testOptions} placeholder="Select country" />);
    const input = screen.getByRole('combobox');
    expect(input).toBeDefined();
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('placeholder')).toBe('Select country');
  });

  it('opens floating listbox on focus and expands aria-expanded="true"', async () => {
    const user = userEvent.setup();
    render(<Combobox options={testOptions} />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    expect(input.getAttribute('aria-expanded')).toBe('true');
    expect(screen.getByRole('listbox')).toBeDefined();
    expect(screen.getAllByRole('option')).toHaveLength(testOptions.length);
  });

  it('filters visible options based on search query', async () => {
    const user = userEvent.setup();
    render(<Combobox options={testOptions} />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.type(input, 'uni');

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2); // United States & United Kingdom
    expect(screen.getByRole('option', { name: /uni.*ted states/i })).toBeDefined();
    expect(screen.getByRole('option', { name: /uni.*ted kingdom/i })).toBeDefined();
  });

  it('selects an option on mouse click and commits value', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(<Combobox options={testOptions} onValueChange={handleValueChange} />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    const canadaOption = screen.getByText('Canada');
    await user.click(canadaOption);

    expect(handleValueChange).toHaveBeenCalledWith('ca', expect.objectContaining({ label: 'Canada' }));
    expect((input as HTMLInputElement).value).toBe('Canada');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('navigates options via ArrowDown/ArrowUp and selects via Enter, skipping disabled items', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(<Combobox options={testOptions} onValueChange={handleValueChange} />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    // ArrowDown 1 -> United States (index 0)
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toContain('-option-0');

    // ArrowDown 2 -> Canada (index 1)
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toContain('-option-1');

    // ArrowDown 3 -> skips UK (disabled) -> Germany (index 3)
    await user.keyboard('{ArrowDown}');
    expect(input.getAttribute('aria-activedescendant')).toContain('-option-3');

    // Enter commits Germany
    await user.keyboard('{Enter}');
    expect(handleValueChange).toHaveBeenCalledWith('de', expect.objectContaining({ label: 'Germany' }));
    expect((input as HTMLInputElement).value).toBe('Germany');
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes popup and restores selection on Escape', async () => {
    const user = userEvent.setup();
    render(<Combobox options={testOptions} defaultValue="ca" />);
    const input = screen.getByRole('combobox') as HTMLInputElement;

    expect(input.value).toBe('Canada');
    await user.click(input);
    await user.type(input, 'xyz');
    expect(input.getAttribute('aria-expanded')).toBe('true');

    await user.keyboard('{Escape}');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.value).toBe('Canada');
  });

  it('clears selection when clear button is clicked', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(
      <Combobox
        options={testOptions}
        defaultValue="us"
        clearable
        clearAriaLabel="Clear selection"
        onValueChange={handleValueChange}
      />,
    );
    const clearBtn = screen.getByRole('button', { name: /clear selection/i });
    await user.click(clearBtn);

    expect(handleValueChange).toHaveBeenCalledWith('', null);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('renders hidden input when name prop is supplied for form submission', () => {
    const { container } = render(
      <form>
        <Combobox options={testOptions} name="country" defaultValue="ca" />
      </form>,
    );
    const hiddenInput = container.querySelector('input[type="hidden"]') as HTMLInputElement;
    expect(hiddenInput).toBeDefined();
    expect(hiddenInput.name).toBe('country');
    expect(hiddenInput.value).toBe('ca');
  });

  it('forwards ref to the native text input element', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Combobox options={testOptions} ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('highlights matching search query substring in option labels', async () => {
    const user = userEvent.setup();
    const { container } = render(<Combobox options={testOptions} />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    await user.type(input, 'can');

    const marks = container.querySelectorAll('mark');
    expect(marks.length).toBeGreaterThanOrEqual(1);
    expect(marks[0]?.textContent?.toLowerCase()).toBe('can');
  });

  it('pre-focuses and assigns roving activedescendant to selected option on open', async () => {
    const user = userEvent.setup();
    render(<Combobox options={testOptions} defaultValue="ca" />);
    const input = screen.getByRole('combobox');

    await user.click(input);
    expect(screen.getByRole('option', { name: /canada/i })).toBeDefined();
    expect(input.getAttribute('aria-activedescendant')).toContain('-option-0');
  });
});

describe('Combobox Primitive — Multi-Select (Tags / Chips Mode)', () => {
  it('renders interactive removable tag chips for selected items', () => {
    render(
      <Combobox
        multiple
        options={testOptions}
        defaultValue={['us', 'ca']}
      />,
    );
    expect(screen.getByText('United States')).toBeDefined();
    expect(screen.getByText('Canada')).toBeDefined();
    expect(screen.getByRole('button', { name: /remove united states/i })).toBeDefined();
    expect(screen.getByRole('button', { name: /remove canada/i })).toBeDefined();
  });

  it('allows picking multiple options without closing popup immediately', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(
      <Combobox
        multiple
        options={testOptions}
        onValueChange={handleValueChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);

    // Pick United States
    await user.click(screen.getByText('United States'));
    expect(handleValueChange).toHaveBeenCalledWith(['us'], [expect.objectContaining({ value: 'us' })]);
    expect(input.getAttribute('aria-expanded')).toBe('true'); // Stays open!

    // Pick Germany
    await user.click(screen.getByText('Germany'));
    expect(handleValueChange).toHaveBeenCalledWith(
      ['us', 'de'],
      expect.arrayContaining([
        expect.objectContaining({ value: 'us' }),
        expect.objectContaining({ value: 'de' }),
      ]),
    );
  });

  it('removes a selected chip when its remove button is clicked', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(
      <Combobox
        multiple
        options={testOptions}
        defaultValue={['us', 'ca']}
        onValueChange={handleValueChange}
      />,
    );
    const removeBtn = screen.getByRole('button', { name: /remove united states/i });
    await user.click(removeBtn);

    expect(handleValueChange).toHaveBeenCalledWith(['ca'], [expect.objectContaining({ value: 'ca' })]);
  });

  it('removes the last selected chip on Backspace when the search input is empty', async () => {
    const user = userEvent.setup();
    const handleValueChange = vi.fn();
    render(
      <Combobox
        multiple
        options={testOptions}
        defaultValue={['us', 'ca']}
        onValueChange={handleValueChange}
      />,
    );
    const input = screen.getByRole('combobox');
    await user.click(input);
    expect((input as HTMLInputElement).value).toBe('');

    await user.keyboard('{Backspace}');
    expect(handleValueChange).toHaveBeenCalledWith(['us'], [expect.objectContaining({ value: 'us' })]);
  });
});

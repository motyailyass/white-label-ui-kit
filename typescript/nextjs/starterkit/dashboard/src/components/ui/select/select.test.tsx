import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './select';

describe('Select Primitive', () => {
  it('renders a native select element with omitted data-size and default data-touch-target="auto"', () => {
    render(
      <Select aria-label="Country">
        <option value="us">United States</option>
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: /country/i });

    expect(select.tagName).toBe('SELECT');
    expect(select.getAttribute('data-size')).toBeNull();
    expect(select.getAttribute('data-touch-target')).toBe('auto');
    expect(select.getAttribute('multiple')).toBeNull();
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <Select size={size} aria-label={`Size ${size}`}>
          <option value="1">Option 1</option>
        </Select>,
      );
      const select = screen.getByRole('combobox', { name: `Size ${size}` });
      expect(select.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(
      <Select touchTarget="comfortable" aria-label="Target">
        <option value="1">1</option>
      </Select>,
    );
    let select = screen.getByRole('combobox', { name: /target/i });
    expect(select.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(
      <Select touchTarget="auto" aria-label="Target">
        <option value="1">1</option>
      </Select>,
    );
    select = screen.getByRole('combobox', { name: /target/i });
    expect(select.getAttribute('data-touch-target')).toBe('auto');
  });

  it('forwards ref directly to the native HTMLSelectElement', () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select ref={ref} aria-label="Ref test">
        <option value="test">Test</option>
      </Select>,
    );

    expect(ref.current).toBeInstanceOf(HTMLSelectElement);
    expect(ref.current?.tagName).toBe('SELECT');
  });

  it('supports native <option>, disabled <option>, and <optgroup> children', () => {
    render(
      <Select aria-label="Groups">
        <optgroup label="North America">
          <option value="us">United States</option>
          <option value="ca" disabled>
            Canada (Unavailable)
          </option>
        </optgroup>
        <optgroup label="Europe">
          <option value="fr">France</option>
        </optgroup>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: /groups/i }) as HTMLSelectElement;
    expect(select.options).toHaveLength(3);
    expect(select.options[1].disabled).toBe(true);
  });

  it('supports uncontrolled defaultValue and native form reset', async () => {
    const user = userEvent.setup();

    render(
      <form data-testid="form">
        <Select name="fruit" defaultValue="banana" aria-label="Fruit">
          <option value="apple">Apple</option>
          <option value="banana">Banana</option>
          <option value="cherry">Cherry</option>
        </Select>
        <button type="reset">Reset</button>
      </form>,
    );

    const select = screen.getByRole('combobox', { name: /fruit/i }) as HTMLSelectElement;
    expect(select.value).toBe('banana');

    await user.selectOptions(select, 'cherry');
    expect(select.value).toBe('cherry');

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(select.value).toBe('banana');
  });

  it('supports controlled value and onChange', async () => {
    const user = userEvent.setup();

    function ControlledSelect() {
      const [val, setVal] = useState('fr');
      return (
        <Select aria-label="Lang" value={val} onChange={(e) => setVal(e.target.value)}>
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ar">Arabic</option>
        </Select>
      );
    }

    render(<ControlledSelect />);
    const select = screen.getByRole('combobox', { name: /lang/i }) as HTMLSelectElement;
    expect(select.value).toBe('fr');

    await user.selectOptions(select, 'ar');
    expect(select.value).toBe('ar');
  });

  it('supports native disabled state and suppresses user selection', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Select disabled aria-label="Disabled test" onChange={handleChange} defaultValue="1">
        <option value="1">1</option>
        <option value="2">2</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: /disabled test/i }) as HTMLSelectElement;
    expect(select.disabled).toBe(true);
    expect(select.hasAttribute('disabled')).toBe(true);

    await user.selectOptions(select, '2');
    expect(select.value).toBe('1');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('focuses when external label is clicked', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <label htmlFor="country-id">Select Country</label>
        <Select id="country-id">
          <option value="ma">Morocco</option>
        </Select>
      </div>,
    );

    const select = screen.getByRole('combobox', { name: /select country/i });
    const label = screen.getByText(/select country/i);

    expect(document.activeElement).not.toBe(select);
    await user.click(label);
    expect(document.activeElement).toBe(select);
  });

  it('participates in FormData with enabled selection and excludes disabled select', () => {
    const { container } = render(
      <form data-testid="form">
        <Select name="enabledSelect" defaultValue="opt1">
          <option value="opt1">Option 1</option>
        </Select>
        <Select name="disabledSelect" defaultValue="opt2" disabled>
          <option value="opt2">Option 2</option>
        </Select>
        <Select name="optionalEmpty" defaultValue="">
          <option value="">None</option>
          <option value="opt3">Option 3</option>
        </Select>
      </form>,
    );

    const form = container.querySelector('form') as HTMLFormElement;
    const formData = new FormData(form);

    expect(formData.get('enabledSelect')).toBe('opt1');
    expect(formData.get('disabledSelect')).toBeNull();
    expect(formData.get('optionalEmpty')).toBe('');
  });

  it('enforces native required validation behavior', () => {
    render(
      <Select aria-label="Required select" required defaultValue="">
        <option value="">Choose an option</option>
        <option value="valid">Valid Option</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: /required select/i }) as HTMLSelectElement;
    expect(select.validity.valueMissing).toBe(true);
    expect(select.validity.valid).toBe(false);

    select.value = 'valid';
    expect(select.validity.valueMissing).toBe(false);
    expect(select.validity.valid).toBe(true);
  });

  it('filters multiple and readOnly props at runtime', () => {
    const rawProps = {
      multiple: true,
      readOnly: true,
    } as unknown as Record<string, unknown>;

    render(
      <Select aria-label="Forbidden props" {...rawProps}>
        <option value="1">1</option>
      </Select>,
    );

    const select = screen.getByRole('combobox', { name: /forbidden props/i });
    expect(select.getAttribute('multiple')).toBeNull();
    expect(select.getAttribute('readonly')).toBeNull();
  });
});

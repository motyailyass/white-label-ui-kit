import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox Primitive', () => {
  it('renders a native input[type="checkbox"] with omitted size for CSS default alias', () => {
    render(<Checkbox aria-label="Accept Terms" />);
    const input = screen.getByRole('checkbox', { name: /accept terms/i });
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.getAttribute('type')).toBe('checkbox');

    const root = input.closest('span');
    expect(root?.getAttribute('data-size')).toBeNull();
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Checkbox size={size} aria-label={`Size ${size}`} />);
      const input = screen.getByRole('checkbox', { name: `Size ${size}` });
      const root = input.closest('span');
      expect(root?.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(<Checkbox touchTarget="comfortable" aria-label="Touch" />);
    let input = screen.getByRole('checkbox', { name: /touch/i });
    let root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Checkbox touchTarget="auto" aria-label="Touch" />);
    input = screen.getByRole('checkbox', { name: /touch/i });
    root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('supports uncontrolled defaultChecked state', () => {
    render(<Checkbox defaultChecked aria-label="Uncontrolled" />);
    const input = screen.getByRole('checkbox', { name: /uncontrolled/i }) as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('supports controlled checked state and fires onChange', async () => {
    const user = userEvent.setup();
    function ControlledTest() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          aria-label="Controlled"
        />
      );
    }

    render(<ControlledTest />);
    const input = screen.getByRole('checkbox', { name: /controlled/i }) as HTMLInputElement;
    expect(input.checked).toBe(false);

    await user.click(input);
    expect(input.checked).toBe(true);

    await user.click(input);
    expect(input.checked).toBe(false);
  });

  it('synchronizes the native indeterminate DOM property', () => {
    const { rerender } = render(<Checkbox indeterminate aria-label="Tri-state" />);
    const input = screen.getByRole('checkbox', { name: /tri-state/i }) as HTMLInputElement;
    expect(input.indeterminate).toBe(true);

    rerender(<Checkbox indeterminate={false} aria-label="Tri-state" />);
    expect(input.indeterminate).toBe(false);
  });

  it('resynchronizes native indeterminate DOM property when rerendered with the same prop value after user click', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Checkbox indeterminate aria-label="Mixed Prop" />);
    const input = screen.getByRole('checkbox', { name: /mixed prop/i }) as HTMLInputElement;
    expect(input.indeterminate).toBe(true);

    // User clicks native checkbox -> native browser behavior sets input.indeterminate = false
    await user.click(input);
    expect(input.indeterminate).toBe(false);

    // Rerender component with the same prop indeterminate={true} (e.g. locale change or parent rerender)
    rerender(<Checkbox indeterminate aria-label="Mixed Prop" />);
    // Must resynchronize to true on commit
    expect(input.indeterminate).toBe(true);
  });

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} aria-label="Ref target" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
  });

  it('suppresses events and clicks when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox disabled onChange={handleChange} aria-label="Disabled" />);
    const input = screen.getByRole('checkbox', { name: /disabled/i }) as HTMLInputElement;

    expect(input.disabled).toBe(true);
    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it('toggles on Space key but does NOT toggle on Enter key', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox onChange={handleChange} aria-label="Keyboard" />);
    const input = screen.getByRole('checkbox', { name: /keyboard/i }) as HTMLInputElement;

    input.focus();
    expect(document.activeElement).toBe(input);

    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);

    await user.keyboard('{Enter}');
    // Enter does NOT toggle native checkboxes
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);
  });

  it('toggles when clicking associated external <label htmlFor>', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Checkbox id="terms-agree" />
        <label htmlFor="terms-agree">I accept the license terms</label>
      </div>,
    );

    const input = screen.getByRole('checkbox', { name: /i accept the license terms/i }) as HTMLInputElement;
    const label = screen.getByText(/i accept the license terms/i);

    expect(input.checked).toBe(false);
    await user.click(label);
    expect(input.checked).toBe(true);

    await user.click(label);
    expect(input.checked).toBe(false);
  });

  it('forwards aria-invalid and aria-describedby attributes', () => {
    render(
      <div>
        <Checkbox
          id="billing-opt"
          aria-invalid="true"
          aria-describedby="billing-help billing-error"
          aria-label="Billing Option"
        />
        <p id="billing-help">Optional billing notifications</p>
        <p id="billing-error">Selection is required</p>
      </div>,
    );

    const input = screen.getByRole('checkbox', { name: /billing option/i });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('billing-help billing-error');
  });

  it('participates correctly in native form submit and form reset lifecycles', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(
      <form onSubmit={handleSubmit} data-testid="test-form">
        <Checkbox name="subscribe" value="yes" defaultChecked aria-label="Subscribe" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>,
    );

    const input = screen.getByRole('checkbox', { name: /subscribe/i }) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    const resetBtn = screen.getByRole('button', { name: /reset/i });

    expect(input.checked).toBe(true);

    // Uncheck and reset
    await user.click(input);
    expect(input.checked).toBe(false);

    await user.click(resetBtn);
    expect(input.checked).toBe(true);

    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });
});

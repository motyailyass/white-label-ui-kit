import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Radio } from './radio';

describe('Radio Primitive', () => {
  it('renders a native input[type="radio"] with omitted size for CSS default alias', () => {
    render(<Radio aria-label="Option A" value="a" />);
    const input = screen.getByRole('radio', { name: /option a/i });
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.getAttribute('type')).toBe('radio');

    const root = input.closest('span');
    expect(root?.getAttribute('data-size')).toBeNull();
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <Radio size={size} aria-label={`Size ${size}`} value={size} />,
      );
      const input = screen.getByRole('radio', { name: `Size ${size}` });
      const root = input.closest('span');
      expect(root?.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(
      <Radio touchTarget="comfortable" aria-label="Touch" value="touch" />,
    );
    let input = screen.getByRole('radio', { name: /touch/i });
    let root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Radio touchTarget="auto" aria-label="Touch" value="touch" />);
    input = screen.getByRole('radio', { name: /touch/i });
    root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('supports uncontrolled defaultChecked state', () => {
    render(<Radio defaultChecked aria-label="Uncontrolled" value="uncontrolled" />);
    const input = screen.getByRole('radio', { name: /uncontrolled/i }) as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('supports controlled checked state and fires onChange', async () => {
    const user = userEvent.setup();
    function ControlledTest() {
      const [selectedValue, setSelectedValue] = useState('option-1');
      return (
        <div>
          <Radio
            name="demo"
            value="option-1"
            checked={selectedValue === 'option-1'}
            onChange={(e) => setSelectedValue(e.target.value)}
            aria-label="Option 1"
          />
          <Radio
            name="demo"
            value="option-2"
            checked={selectedValue === 'option-2'}
            onChange={(e) => setSelectedValue(e.target.value)}
            aria-label="Option 2"
          />
        </div>
      );
    }

    render(<ControlledTest />);
    const radio1 = screen.getByRole('radio', { name: /option 1/i }) as HTMLInputElement;
    const radio2 = screen.getByRole('radio', { name: /option 2/i }) as HTMLInputElement;

    expect(radio1.checked).toBe(true);
    expect(radio2.checked).toBe(false);

    await user.click(radio2);
    expect(radio1.checked).toBe(false);
    expect(radio2.checked).toBe(true);
  });

  it('enforces native mutual exclusivity in a shared name group', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Radio name="billing" value="monthly" defaultChecked aria-label="Monthly" />
        <Radio name="billing" value="annual" aria-label="Annual" />
      </div>,
    );

    const monthly = screen.getByRole('radio', { name: /monthly/i }) as HTMLInputElement;
    const annual = screen.getByRole('radio', { name: /annual/i }) as HTMLInputElement;

    expect(monthly.checked).toBe(true);
    expect(annual.checked).toBe(false);

    await user.click(annual);
    expect(monthly.checked).toBe(false);
    expect(annual.checked).toBe(true);
  });

  it('clicking an already selected radio does not deselect or toggle off', async () => {
    const user = userEvent.setup();
    render(<Radio defaultChecked aria-label="Persistent" value="persist" />);
    const radio = screen.getByRole('radio', { name: /persistent/i }) as HTMLInputElement;

    expect(radio.checked).toBe(true);
    await user.click(radio);
    expect(radio.checked).toBe(true);
  });

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Radio ref={ref} aria-label="Ref target" value="ref-val" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('radio');
  });

  it('suppresses events and clicks when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Radio disabled onChange={handleChange} aria-label="Disabled" value="disabled" />,
    );
    const input = screen.getByRole('radio', { name: /disabled/i }) as HTMLInputElement;

    expect(input.disabled).toBe(true);
    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it('selects on Space key but does NOT select or toggle on Enter key', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Radio
        name="key-group"
        value="keyboard-opt"
        onChange={handleChange}
        aria-label="Keyboard"
      />,
    );
    const input = screen.getByRole('radio', { name: /keyboard/i }) as HTMLInputElement;

    input.focus();
    expect(document.activeElement).toBe(input);

    await user.keyboard('{Enter}');
    // Enter does NOT activate native radio buttons
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);

    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);
  });

  it('selects when clicking associated external <label htmlFor>', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Radio id="plan-opt" name="plans" value="pro" />
        <label htmlFor="plan-opt">Professional Plan</label>
      </div>,
    );

    const input = screen.getByRole('radio', {
      name: /professional plan/i,
    }) as HTMLInputElement;
    const label = screen.getByText(/professional plan/i);

    expect(input.checked).toBe(false);
    await user.click(label);
    expect(input.checked).toBe(true);
  });

  it('forwards aria-invalid and aria-describedby attributes', () => {
    render(
      <div>
        <Radio
          id="shipping-express"
          name="shipping"
          value="express"
          aria-invalid="true"
          aria-describedby="shipping-help shipping-error"
          aria-label="Express Shipping"
        />
        <p id="shipping-help">Delivered within 24 hours</p>
        <p id="shipping-error">Option unavailable in your region</p>
      </div>,
    );

    const input = screen.getByRole('radio', { name: /express shipping/i });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      'shipping-help shipping-error',
    );
  });

  it('participates correctly in native form submit and form reset lifecycles', async () => {
    const user = userEvent.setup();
    let capturedData: Record<string, string> = {};

    const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      capturedData = Object.fromEntries(formData.entries()) as Record<string, string>;
    });

    render(
      <form onSubmit={handleSubmit} data-testid="test-form">
        <Radio name="tier" value="free" defaultChecked aria-label="Free Tier" />
        <Radio name="tier" value="pro" aria-label="Pro Tier" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>,
    );

    const freeRadio = screen.getByRole('radio', { name: /free tier/i }) as HTMLInputElement;
    const proRadio = screen.getByRole('radio', { name: /pro tier/i }) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    const resetBtn = screen.getByRole('button', { name: /reset/i });

    expect(freeRadio.checked).toBe(true);
    expect(proRadio.checked).toBe(false);

    // Initial submission has tier: 'free'
    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(capturedData).toEqual({ tier: 'free' });

    // Switch to 'pro' and submit
    await user.click(proRadio);
    expect(freeRadio.checked).toBe(false);
    expect(proRadio.checked).toBe(true);

    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(2);
    expect(capturedData).toEqual({ tier: 'pro' });

    // Reset restores initial defaultChecked
    await user.click(resetBtn);
    expect(freeRadio.checked).toBe(true);
    expect(proRadio.checked).toBe(false);
  });
});

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Switch, type SwitchProps } from './switch';

describe('Switch Primitive', () => {
  it('renders a native input[type="checkbox"][role="switch"] with omitted size for CSS default alias', () => {
    render(<Switch aria-label="Toggle notifications" />);
    const input = screen.getByRole('switch', { name: /toggle notifications/i });
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input.getAttribute('type')).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');

    const root = input.closest('span');
    expect(root?.getAttribute('data-size')).toBeNull();
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(
        <Switch size={size} aria-label={`Size ${size}`} />,
      );
      const input = screen.getByRole('switch', { name: `Size ${size}` });
      const root = input.closest('span');
      expect(root?.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(
      <Switch touchTarget="comfortable" aria-label="Touch" />,
    );
    let input = screen.getByRole('switch', { name: /touch/i });
    let root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Switch touchTarget="auto" aria-label="Touch" />);
    input = screen.getByRole('switch', { name: /touch/i });
    root = input.closest('span');
    expect(root?.getAttribute('data-touch-target')).toBe('auto');
  });

  it('supports uncontrolled defaultChecked state', () => {
    render(<Switch defaultChecked aria-label="Uncontrolled" />);
    const input = screen.getByRole('switch', { name: /uncontrolled/i }) as HTMLInputElement;
    expect(input.checked).toBe(true);
  });

  it('supports controlled checked state and fires onChange', async () => {
    const user = userEvent.setup();
    function ControlledTest() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          aria-label="Controlled"
        />
      );
    }

    render(<ControlledTest />);
    const input = screen.getByRole('switch', { name: /controlled/i }) as HTMLInputElement;
    expect(input.checked).toBe(false);

    await user.click(input);
    expect(input.checked).toBe(true);

    await user.click(input);
    expect(input.checked).toBe(false);
  });

  it('clicking toggles state between checked and unchecked', async () => {
    const user = userEvent.setup();
    render(<Switch aria-label="Toggleable" />);
    const input = screen.getByRole('switch', { name: /toggleable/i }) as HTMLInputElement;

    expect(input.checked).toBe(false);
    await user.click(input);
    expect(input.checked).toBe(true);

    await user.click(input);
    expect(input.checked).toBe(false);
  });

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch ref={ref} aria-label="Ref target" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.type).toBe('checkbox');
    expect(ref.current?.getAttribute('role')).toBe('switch');
  });

  it('suppresses events and clicks when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch disabled onChange={handleChange} aria-label="Disabled" />,
    );
    const input = screen.getByRole('switch', { name: /disabled/i }) as HTMLInputElement;

    expect(input.disabled).toBe(true);
    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it('respects inherited disabled state from <fieldset disabled>', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <fieldset disabled>
        <Switch onChange={handleChange} aria-label="Fieldset Disabled" />
      </fieldset>,
    );
    const input = screen.getByRole('switch', { name: /fieldset disabled/i }) as HTMLInputElement;

    await user.click(input);
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);
  });

  it('toggles on Space key but does NOT toggle on Enter key', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <Switch onChange={handleChange} aria-label="Keyboard" />,
    );
    const input = screen.getByRole('switch', { name: /keyboard/i }) as HTMLInputElement;

    input.focus();
    expect(document.activeElement).toBe(input);

    // Enter key does NOT activate checkboxes or switches natively
    await user.keyboard('{Enter}');
    expect(handleChange).not.toHaveBeenCalled();
    expect(input.checked).toBe(false);

    // Space key activates and toggles
    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(input.checked).toBe(true);

    await user.keyboard(' ');
    expect(handleChange).toHaveBeenCalledTimes(2);
    expect(input.checked).toBe(false);
  });

  it('toggles when clicking associated external <label htmlFor>', async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Switch id="airplane-mode" />
        <label htmlFor="airplane-mode">Airplane Mode</label>
      </div>,
    );

    const input = screen.getByRole('switch', {
      name: /airplane mode/i,
    }) as HTMLInputElement;
    const label = screen.getByText(/airplane mode/i);

    expect(input.checked).toBe(false);
    await user.click(label);
    expect(input.checked).toBe(true);

    await user.click(label);
    expect(input.checked).toBe(false);
  });

  it('forwards aria-invalid and aria-describedby attributes', () => {
    render(
      <div>
        <Switch
          id="security-setting"
          aria-invalid="true"
          aria-describedby="security-help security-error"
          aria-label="Two-factor authentication"
        />
        <p id="security-help">Protects your account with an extra verification step.</p>
        <p id="security-error">Two-factor auth is mandatory for administrator accounts.</p>
      </div>,
    );

    const input = screen.getByRole('switch', { name: /two-factor authentication/i });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe(
      'security-help security-error',
    );
  });

  it('validates native required attribute: optional is valid when off; required is invalid until on', async () => {
    const user = userEvent.setup();
    render(
      <form data-testid="val-form">
        <Switch id="opt-switch" name="opt" aria-label="Optional Switch" />
        <Switch id="req-switch" name="req" required aria-label="Required Switch" />
      </form>,
    );

    const optInput = screen.getByRole('switch', { name: /optional switch/i }) as HTMLInputElement;
    const reqInput = screen.getByRole('switch', { name: /required switch/i }) as HTMLInputElement;

    // Optional switch: valid when off
    expect(optInput.checkValidity()).toBe(true);
    expect(optInput.validity.valid).toBe(true);

    // Required switch: invalid when off, valueMissing is true
    expect(reqInput.checkValidity()).toBe(false);
    expect(reqInput.validity.valueMissing).toBe(true);

    // Toggle required switch on -> now valid
    await user.click(reqInput);
    expect(reqInput.checked).toBe(true);
    expect(reqInput.checkValidity()).toBe(true);
    expect(reqInput.validity.valid).toBe(true);
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
        <Switch name="telemetry" defaultChecked aria-label="Telemetry" />
        <Switch name="newsletter" aria-label="Newsletter" />
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
      </form>,
    );

    const telemetry = screen.getByRole('switch', { name: /telemetry/i }) as HTMLInputElement;
    const newsletter = screen.getByRole('switch', { name: /newsletter/i }) as HTMLInputElement;
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    const resetBtn = screen.getByRole('button', { name: /reset/i });

    expect(telemetry.checked).toBe(true);
    expect(newsletter.checked).toBe(false);

    // Initial submission has telemetry: 'on', and newsletter is omitted (standard HTML form behavior)
    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(capturedData).toEqual({ telemetry: 'on' });

    // Toggle telemetry off, newsletter on
    await user.click(telemetry);
    await user.click(newsletter);
    expect(telemetry.checked).toBe(false);
    expect(newsletter.checked).toBe(true);

    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(2);
    expect(capturedData).toEqual({ newsletter: 'on' });

    // Reset restores initial defaultChecked
    await user.click(resetBtn);
    expect(telemetry.checked).toBe(true);
    expect(newsletter.checked).toBe(false);
  });

  it('supports custom value in form submission', async () => {
    const user = userEvent.setup();
    let capturedData: Record<string, string> = {};

    const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      capturedData = Object.fromEntries(formData.entries()) as Record<string, string>;
    });

    render(
      <form onSubmit={handleSubmit}>
        <Switch name="mode" value="high-performance" defaultChecked aria-label="High Performance" />
        <button type="submit">Submit</button>
      </form>,
    );

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    await user.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(capturedData).toEqual({ mode: 'high-performance' });
  });

  it('filters forbidden ARIA and read-only attributes at runtime and locks type and role', () => {
    // Cast invalid props that could be passed by JavaScript or cast callers
    const invalidProps = {
      'aria-checked': 'mixed',
      'aria-readonly': 'true',
      role: 'button',
      readOnly: true,
      type: 'radio',
    } as unknown as SwitchProps;

    render(<Switch {...invalidProps} aria-label="Filtered" />);
    const input = screen.getByRole('switch', { name: /filtered/i });

    // type="checkbox" and role="switch" must remain locked
    expect(input.getAttribute('type')).toBe('checkbox');
    expect(input.getAttribute('role')).toBe('switch');

    // aria-checked, aria-readonly, and readOnly must NOT be forwarded to the DOM
    expect(input.getAttribute('aria-checked')).toBeNull();
    expect(input.getAttribute('aria-readonly')).toBeNull();
    expect(input.getAttribute('readonly')).toBeNull();
  });
});

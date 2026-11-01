import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Input } from './input';

describe('Input Primitive', () => {
  it('renders a native input with default type="text" and omitted size', () => {
    render(<Input aria-label="Username" />);
    const input = screen.getByRole('textbox', { name: /username/i });

    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('type')).toBe('text');
    expect(input.getAttribute('data-size')).toBeNull();
    expect(input.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;
    for (const size of sizes) {
      const { unmount } = render(<Input size={size} aria-label={`Size ${size}`} />);
      const input = screen.getByRole('textbox', { name: `Size ${size}` });
      expect(input.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(<Input touchTarget="comfortable" aria-label="Touch" />);
    let input = screen.getByRole('textbox', { name: /touch/i });
    expect(input.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Input touchTarget="auto" aria-label="Touch" />);
    input = screen.getByRole('textbox', { name: /touch/i });
    expect(input.getAttribute('data-touch-target')).toBe('auto');
  });

  it('supports controlled editing and fires onChange', async () => {
    const user = userEvent.setup();

    function ControlledInput() {
      const [val, setVal] = useState('initial');
      return <Input aria-label="Controlled" value={val} onChange={(e) => setVal(e.target.value)} />;
    }

    render(<ControlledInput />);
    const input = screen.getByRole('textbox', { name: /controlled/i }) as HTMLInputElement;
    expect(input.value).toBe('initial');

    await user.clear(input);
    expect(input.value).toBe('');

    await user.type(input, 'updated text');
    expect(input.value).toBe('updated text');
  });

  it('supports uncontrolled editing with defaultValue', async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Uncontrolled" defaultValue="preset" />);
    const input = screen.getByRole('textbox', { name: /uncontrolled/i }) as HTMLInputElement;
    expect(input.value).toBe('preset');

    await user.type(input, ' addition');
    expect(input.value).toBe('preset addition');
  });

  it('forwards ref directly to native HTMLInputElement', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} aria-label="Target" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('fires onFocus and onBlur callbacks', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(<Input aria-label="Events" onFocus={handleFocus} onBlur={handleBlur} />);
    const input = screen.getByRole('textbox', { name: /events/i });

    await user.click(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('suppresses user typing and focus when disabled', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<Input disabled aria-label="Disabled" onChange={handleChange} />);
    const input = screen.getByRole('textbox', { name: /disabled/i }) as HTMLInputElement;

    expect(input.disabled).toBe(true);
    expect(input.hasAttribute('disabled')).toBe(true);

    // Attempting to type on disabled element should not change value or trigger change
    await user.type(input, 'test');
    expect(input.value).toBe('');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('allows focus and selection but suppresses user typing when readOnly', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <Input readOnly aria-label="ReadOnly" defaultValue="Locked Value" onChange={handleChange} />,
    );
    const input = screen.getByRole('textbox', { name: /readonly/i }) as HTMLInputElement;

    expect(input.readOnly).toBe(true);
    expect(input.hasAttribute('readonly')).toBe(true);

    // Can receive focus
    input.focus();
    expect(document.activeElement).toBe(input);

    // Typing does not modify value
    await user.type(input, 'abc');
    expect(input.value).toBe('Locked Value');
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('supports native aria-invalid attribute', () => {
    const { rerender } = render(<Input aria-label="Validation" aria-invalid="true" />);
    let input = screen.getByRole('textbox', { name: /validation/i });
    expect(input.getAttribute('aria-invalid')).toBe('true');

    rerender(<Input aria-label="Validation" aria-invalid={false} />);
    input = screen.getByRole('textbox', { name: /validation/i });
    expect(input.getAttribute('aria-invalid')).toBe('false');
  });

  it('forwards aria-describedby for helper and error text linkage', () => {
    render(
      <div>
        <label htmlFor="user-field">Email</label>
        <Input id="user-field" aria-describedby="email-hint email-error" />
        <span id="email-hint">Enter your work email</span>
        <span id="email-error">Email is invalid</span>
      </div>,
    );

    const input = screen.getByRole('textbox', { name: /email/i });
    expect(input.getAttribute('aria-describedby')).toBe('email-hint email-error');
  });

  it('renders supported native types', () => {
    const { unmount } = render(<Input type="email" aria-label="Email" />);
    expect(screen.getByRole('textbox', { name: /email/i }).getAttribute('type')).toBe('email');
    unmount();

    render(<Input type="search" aria-label="Search" />);
    expect(screen.getByRole('searchbox', { name: /search/i }).getAttribute('type')).toBe('search');
  });

  it('participates correctly in form submission and reset lifecycle', async () => {
    const user = userEvent.setup();
    let submittedData: Record<string, string> = {};

    const handleSubmit = vi.fn((e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      submittedData = Object.fromEntries(formData.entries()) as Record<string, string>;
    });

    render(
      <form onSubmit={handleSubmit}>
        <Input name="activeField" defaultValue="activeValue" aria-label="Active" />
        <Input name="readOnlyField" readOnly defaultValue="readOnlyValue" aria-label="ReadOnly" />
        <Input name="disabledField" disabled defaultValue="disabledValue" aria-label="Disabled" />
        <button type="reset">Reset</button>
        <button type="submit">Submit</button>
      </form>,
    );

    // 1. Submit form: active and readOnly are submitted; disabled is excluded
    await user.click(screen.getByRole('button', { name: /submit/i }));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
    expect(submittedData.activeField).toBe('activeValue');
    expect(submittedData.readOnlyField).toBe('readOnlyValue');
    expect(submittedData.disabledField).toBeUndefined();

    // 2. Modify active field and reset form
    const activeInput = screen.getByRole('textbox', { name: /active/i }) as HTMLInputElement;
    await user.clear(activeInput);
    await user.type(activeInput, 'modifiedValue');
    expect(activeInput.value).toBe('modifiedValue');

    await user.click(screen.getByRole('button', { name: /reset/i }));
    expect(activeInput.value).toBe('activeValue');
  });
});

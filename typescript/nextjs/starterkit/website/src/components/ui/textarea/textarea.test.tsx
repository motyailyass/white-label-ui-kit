import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { createRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textarea } from './textarea';

describe('Textarea Primitive', () => {
  afterEach(cleanup);

  it('renders a native textarea with default rows={4} and omitted size', () => {
    render(<Textarea aria-label="Description" />);
    const textarea = screen.getByRole('textbox', { name: 'Description' });

    expect(textarea.tagName).toBe('TEXTAREA');
    expect(textarea.getAttribute('rows')).toBe('4');
    expect(textarea.getAttribute('data-size')).toBeNull();
    expect(textarea.getAttribute('data-touch-target')).toBe('auto');
  });

  it('renders explicit size across all six scale steps', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const;

    for (const size of sizes) {
      const { unmount } = render(
        <Textarea aria-label={`Textarea ${size}`} size={size} />,
      );
      const textarea = screen.getByRole('textbox', {
        name: `Textarea ${size}`,
      });
      expect(textarea.getAttribute('data-size')).toBe(size);
      unmount();
    }
  });

  it('supports touchTarget="comfortable" and defaults to "auto"', () => {
    const { rerender } = render(
      <Textarea aria-label="Touch" touchTarget="comfortable" />,
    );
    let textarea = screen.getByRole('textbox', { name: 'Touch' });
    expect(textarea.getAttribute('data-touch-target')).toBe('comfortable');

    rerender(<Textarea aria-label="Touch" />);
    textarea = screen.getByRole('textbox', { name: 'Touch' });
    expect(textarea.getAttribute('data-touch-target')).toBe('auto');
  });

  it('supports controlled multiline editing and fires onChange', async () => {
    const user = userEvent.setup();

    function ControlledComponent() {
      const [val, setVal] = useState('Line 1');
      return (
        <Textarea
          aria-label="Notes"
          value={val}
          onChange={(e) => setVal(e.target.value)}
        />
      );
    }

    render(<ControlledComponent />);
    const textarea = screen.getByRole('textbox', { name: 'Notes' });
    expect((textarea as HTMLTextAreaElement).value).toBe('Line 1');

    await user.type(textarea, '{Enter}Line 2');
    expect((textarea as HTMLTextAreaElement).value).toBe('Line 1\nLine 2');
  });

  it('supports uncontrolled editing with defaultValue', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Bio" defaultValue="Initial biography" />);
    const textarea = screen.getByRole('textbox', { name: 'Bio' });
    expect((textarea as HTMLTextAreaElement).value).toBe('Initial biography');

    await user.clear(textarea);
    await user.type(textarea, 'Updated bio');
    expect((textarea as HTMLTextAreaElement).value).toBe('Updated bio');
  });

  it('forwards ref directly to native HTMLTextAreaElement', () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea ref={ref} aria-label="Ref target" />);
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
    expect(ref.current?.tagName).toBe('TEXTAREA');
  });

  it('fires onFocus and onBlur callbacks', async () => {
    const user = userEvent.setup();
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();

    render(
      <Textarea
        aria-label="Focus target"
        onFocus={handleFocus}
        onBlur={handleBlur}
      />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Focus target' });

    await user.click(textarea);
    expect(handleFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it('suppresses user typing and focus when disabled', async () => {
    const user = userEvent.setup();
    render(<Textarea aria-label="Disabled field" disabled defaultValue="Fixed" />);
    const textarea = screen.getByRole('textbox', { name: 'Disabled field' });

    expect((textarea as HTMLTextAreaElement).disabled).toBe(true);
    await user.click(textarea);
    expect(document.activeElement).not.toBe(textarea);

    await user.type(textarea, ' New Text');
    expect((textarea as HTMLTextAreaElement).value).toBe('Fixed');
  });

  it('allows focus and selection but suppresses user typing when readOnly', async () => {
    const user = userEvent.setup();
    render(
      <Textarea
        aria-label="Read-only field"
        readOnly
        defaultValue="Read only text"
      />,
    );
    const textarea = screen.getByRole('textbox', { name: 'Read-only field' });

    await user.click(textarea);
    expect(document.activeElement).toBe(textarea);

    await user.type(textarea, ' Attempted edit');
    expect((textarea as HTMLTextAreaElement).value).toBe('Read only text');
  });

  it('supports native aria-invalid attribute', () => {
    render(<Textarea aria-label="Error field" aria-invalid="true" />);
    const textarea = screen.getByRole('textbox', { name: 'Error field' });
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('forwards aria-describedby for helper and error text linkage', () => {
    render(
      <>
        <Textarea aria-label="Description" aria-describedby="help-text" />
        <span id="help-text">Maximum 500 characters</span>
      </>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Description' });
    expect(textarea.getAttribute('aria-describedby')).toBe('help-text');
  });

  it('supports custom rows attribute overrides', () => {
    render(<Textarea aria-label="Custom Rows" rows={8} />);
    const textarea = screen.getByRole('textbox', { name: 'Custom Rows' });
    expect(textarea.getAttribute('rows')).toBe('8');
  });

  it('participates correctly in form submission and reset lifecycle', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    function TestForm() {
      return (
        <form onSubmit={handleSubmit} data-testid="test-form">
          <Textarea name="feedback" defaultValue="Initial message" />
          <button type="submit">Submit</button>
          <button type="reset">Reset</button>
        </form>
      );
    }

    render(<TestForm />);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const submitBtn = screen.getByRole('button', { name: 'Submit' });
    const resetBtn = screen.getByRole('button', { name: 'Reset' });

    // Submit initial
    await user.click(submitBtn);
    expect(handleSubmit).toHaveBeenCalledTimes(1);

    // Edit content
    await user.clear(textarea);
    await user.type(textarea, 'Updated feedback text');
    expect(textarea.value).toBe('Updated feedback text');

    // Reset form: restores defaultValue
    await user.click(resetBtn);
    expect(textarea.value).toBe('Initial message');
  });
});

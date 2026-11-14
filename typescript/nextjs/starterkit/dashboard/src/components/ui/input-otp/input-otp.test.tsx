import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InputOtp } from './input-otp';

const otpA11y = {
  'aria-label': 'Verification code',
  slotAriaLabel: (index: number, total: number) => `Slot ${index} of ${total}`,
};

describe('InputOtp Primitive', () => {
  it('renders role="group" container with 6 slots and data attributes by default', () => {
    render(<InputOtp {...otpA11y} data-testid="otp-group" />);

    const group = screen.getByRole('group');
    expect(group).toBeTruthy();
    expect(group.getAttribute('data-size')).toBe('md');
    expect(group.getAttribute('data-length')).toBe('6');

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
  });

  it('updates value on typing and advances to next slot', () => {
    const handleChange = vi.fn();
    render(<InputOtp {...otpA11y} onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '4' } });

    expect(handleChange).toHaveBeenCalledWith('4');
  });

  it('fires onComplete callback when fully populated', () => {
    const handleComplete = vi.fn();
    render(<InputOtp {...otpA11y} length={4} onComplete={handleComplete} defaultValue="123" />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[3], { target: { value: '9' } });

    expect(handleComplete).toHaveBeenCalledWith('1239');
  });

  it('distributes pasted clipboard text across slots', () => {
    const handleChange = vi.fn();
    render(<InputOtp {...otpA11y} length={6} onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    fireEvent.paste(inputs[0], {
      clipboardData: {
        getData: () => '849201',
      },
    });

    expect(handleChange).toHaveBeenCalledWith('849201');
  });

  it('navigates slots with arrow keys taking direction into account', () => {
    const { container } = render(
      <div dir="rtl">
        <InputOtp {...otpA11y} length={4} defaultValue="1234" />
      </div>,
    );

    const inputs = container.querySelectorAll('input');
    inputs[1].focus();
    expect(document.activeElement).toBe(inputs[1]);

    // In RTL, ArrowRight moves visually left (index - 1 in array = 0)
    fireEvent.keyDown(inputs[1], { key: 'ArrowRight' });
    expect(document.activeElement).toBe(inputs[0]);

    // In RTL, ArrowLeft moves visually right (index + 1 in array = 1)
    fireEvent.keyDown(inputs[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('handles backspace deletion and retreat to previous slot', () => {
    const handleChange = vi.fn();
    render(<InputOtp {...otpA11y} length={4} defaultValue="12" onChange={handleChange} />);

    const inputs = screen.getAllByRole('textbox');
    inputs[2].focus();

    // Backspace on empty slot 2 retreats to slot 1 and clears it
    fireEvent.keyDown(inputs[2], { key: 'Backspace' });
    expect(handleChange).toHaveBeenCalledWith('1');
    expect(document.activeElement).toBe(inputs[1]);
  });

  it('renders password input type when mask is enabled', () => {
    const { container } = render(<InputOtp {...otpA11y} mask defaultValue="123456" />);

    const inputs = container.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(6);
    expect((inputs[0] as HTMLInputElement).value).toBe('1');
  });

  it('renders visual separator when separatorIndex is provided', () => {
    const { container } = render(<InputOtp {...otpA11y} length={6} separatorIndex={3} />);

    const separator = container.querySelector('[data-separator="true"]');
    expect(separator).toBeTruthy();
    expect(separator?.textContent).toBe('—');
  });

  it('reflects error and disabled states via attributes', () => {
    render(<InputOtp {...otpA11y} error disabled data-testid="otp-error-disabled" />);

    const group = screen.getByTestId('otp-error-disabled');
    expect(group.getAttribute('data-error')).toBe('true');
    expect(group.getAttribute('data-disabled')).toBe('true');

    const inputs = screen.getAllByRole('textbox');
    expect((inputs[0] as HTMLInputElement).disabled).toBe(true);
  });

  it('snaps focus to the first empty slot when focusing ahead', () => {
    render(<InputOtp {...otpA11y} length={6} defaultValue="42" />);

    const inputs = screen.getAllByRole('textbox');
    // Focusing slot 5 when slots 2, 3, 4 are empty redirects focus to slot 2
    fireEvent.focus(inputs[5]);
    expect(document.activeElement).toBe(inputs[2]);
  });

  it('renders grouped variant with slot groups and separator split', () => {
    const { container } = render(
      <InputOtp
        {...otpA11y}
        length={6}
        variant="grouped"
        separatorIndex={3}
        data-testid="grouped-otp"
      />,
    );

    const group = screen.getByTestId('grouped-otp');
    expect(group.getAttribute('data-variant')).toBe('grouped');

    const slotGroups = container.querySelectorAll('[class*="slotGroup"]');
    expect(slotGroups.length).toBe(2);

    const inputs = screen.getAllByRole('textbox');
    expect(inputs.length).toBe(6);
  });

  it('forwards ref to container HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(<InputOtp {...otpA11y} ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('uses only caller-provided names for the group and slots', () => {
    render(<InputOtp {...otpA11y} length={4} />);

    expect(screen.getByRole('group', { name: 'Verification code' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Slot 1 of 4' })).toBeTruthy();
    expect(screen.getByRole('textbox', { name: 'Slot 4 of 4' })).toBeTruthy();
    expect(screen.queryByLabelText(/digit \d of/i)).toBeNull();
  });

  it('supports aria-labelledby for the group', () => {
    render(
      <>
        <span id="otp-heading">Enter your code</span>
        <InputOtp aria-labelledby="otp-heading" slotAriaLabel={otpA11y.slotAriaLabel} />
      </>,
    );

    const group = screen.getByRole('group', { name: 'Enter your code' });
    expect(group.hasAttribute('aria-label')).toBe(false);
  });
});

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RadioGroup, RadioGroupItem } from './radio-group';

describe('RadioGroup', () => {
  it('renders radiogroup container with role and orientation', () => {
    render(
      <RadioGroup orientation="horizontal" data-testid="group">
        <RadioGroupItem value="apple">Apple</RadioGroupItem>
        <RadioGroupItem value="orange">Orange</RadioGroupItem>
      </RadioGroup>,
    );

    const group = screen.getByTestId('group');
    expect(group.getAttribute('role')).toBe('radiogroup');
    expect(group.getAttribute('aria-orientation')).toBe('horizontal');
    expect(group.getAttribute('data-orientation')).toBe('horizontal');
  });

  it('shares common name and manages selection', () => {
    const handleChange = vi.fn();

    render(
      <RadioGroup name="fruits" defaultValue="apple" onValueChange={handleChange}>
        <RadioGroupItem value="apple" data-testid="apple-radio">
          Apple
        </RadioGroupItem>
        <RadioGroupItem value="orange" data-testid="orange-radio">
          Orange
        </RadioGroupItem>
      </RadioGroup>,
    );

    const appleRadio = screen.getByTestId('apple-radio') as HTMLInputElement;
    const orangeRadio = screen.getByTestId('orange-radio') as HTMLInputElement;

    expect(appleRadio.name).toBe('fruits');
    expect(orangeRadio.name).toBe('fruits');
    expect(appleRadio.checked).toBe(true);
    expect(orangeRadio.checked).toBe(false);

    // Click orange
    fireEvent.click(orangeRadio);
    expect(handleChange).toHaveBeenCalledWith('orange');
  });

  it('cascades disabled state from group to items', () => {
    render(
      <RadioGroup disabled>
        <RadioGroupItem value="opt1" data-testid="opt1">
          Option 1
        </RadioGroupItem>
      </RadioGroup>,
    );

    const radio = screen.getByTestId('opt1') as HTMLInputElement;
    expect(radio.disabled).toBe(true);
  });
});

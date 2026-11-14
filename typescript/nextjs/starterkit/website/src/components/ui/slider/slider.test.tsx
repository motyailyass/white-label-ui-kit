import { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Slider } from './slider';

describe('Slider Primitive', () => {
  it('renders role="slider" with correct WAI-ARIA boundaries', () => {
    render(
      <Slider aria-label="Volume" min={0} max={100} defaultValue={40} data-testid="slider-root" />,
    );

    const thumb = screen.getByRole('slider');
    expect(thumb).toBeTruthy();
    expect(thumb.getAttribute('aria-valuemin')).toBe('0');
    expect(thumb.getAttribute('aria-valuemax')).toBe('100');
    expect(thumb.getAttribute('aria-valuenow')).toBe('40');
    expect(thumb.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('supports aria-valuetext and formatValue callback', () => {
    const { rerender } = render(
      <Slider aria-label="Volume" min={0} max={100} value={50} aria-valuetext="Fifty percent" />,
    );
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Fifty percent');

    rerender(
      <Slider aria-label="Volume" min={0} max={100} value={75} formatValue={(v) => `$${v}.00`} />,
    );
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('$75.00');
  });

  it('adjusts value via arrow keyboard navigation', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        min={0}
        max={100}
        step={5}
        defaultValue={50}
        onChange={handleChange}
      />,
    );

    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith(55);

    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenLastCalledWith(50);

    fireEvent.keyDown(thumb, { key: 'ArrowUp' });
    expect(handleChange).toHaveBeenLastCalledWith(55);

    fireEvent.keyDown(thumb, { key: 'ArrowDown' });
    expect(handleChange).toHaveBeenLastCalledWith(50);
  });

  it('inverts horizontal arrow keys when container has dir="rtl"', () => {
    const handleChange = vi.fn();
    const { container } = render(
      <div dir="rtl">
        <Slider
          aria-label="Volume"
          min={0}
          max={100}
          step={5}
          defaultValue={50}
          onChange={handleChange}
        />
      </div>,
    );

    // Mock getComputedStyle for the root slider element to report direction: rtl
    const sliderRoot = container.querySelector('[role="slider"]')?.parentElement as HTMLElement;
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el) => {
      if (el === sliderRoot) {
        return { direction: 'rtl' } as CSSStyleDeclaration;
      }
      return { direction: 'ltr' } as CSSStyleDeclaration;
    });

    const thumb = screen.getByRole('slider');
    // In RTL, ArrowRight decreases value
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith(45);

    // In RTL, ArrowLeft increases value
    fireEvent.keyDown(thumb, { key: 'ArrowLeft' });
    expect(handleChange).toHaveBeenLastCalledWith(50);

    vi.restoreAllMocks();
  });

  it('handles PageUp, PageDown, Home, and End keys', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        min={0}
        max={100}
        step={5}
        defaultValue={50}
        onChange={handleChange}
      />,
    );

    const thumb = screen.getByRole('slider');
    // PageUp adds 10 steps (5 * 10 = 50) -> 50 + 50 = 100
    fireEvent.keyDown(thumb, { key: 'PageUp' });
    expect(handleChange).toHaveBeenLastCalledWith(100);

    // PageDown subtracts 10 steps (5 * 10 = 50) -> 100 - 50 = 50
    fireEvent.keyDown(thumb, { key: 'PageDown' });
    expect(handleChange).toHaveBeenLastCalledWith(50);

    // Home jumps to min (0)
    fireEvent.keyDown(thumb, { key: 'Home' });
    expect(handleChange).toHaveBeenLastCalledWith(0);

    // End jumps to max (100)
    fireEvent.keyDown(thumb, { key: 'End' });
    expect(handleChange).toHaveBeenLastCalledWith(100);
  });

  it('preserves floating point precision for decimal steps', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        min={0}
        max={1}
        step={0.1}
        defaultValue={0.2}
        onChange={handleChange}
      />,
    );

    const thumb = screen.getByRole('slider');
    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(handleChange).toHaveBeenLastCalledWith(0.3); // Strictly 0.3, not 0.30000000000000004
  });

  it('applies density sizes and data attributes correctly', () => {
    const { rerender } = render(<Slider aria-label="Volume" size="sm" data-testid="slider" />);
    const root = screen.getByTestId('slider');
    expect(root.getAttribute('data-size')).toBe('sm');
    expect(root.className).toContain('sizeSm');

    rerender(<Slider aria-label="Volume" size="lg" data-testid="slider" />);
    expect(root.getAttribute('data-size')).toBe('lg');
    expect(root.className).toContain('sizeLg');
  });

  it('handles disabled state properly', () => {
    const handleChange = vi.fn();
    render(
      <Slider
        aria-label="Volume"
        disabled
        defaultValue={30}
        onChange={handleChange}
        data-testid="slider"
      />,
    );

    const root = screen.getByTestId('slider');
    expect(root.getAttribute('data-disabled')).toBe('');

    const thumb = screen.getByRole('slider');
    expect(thumb.getAttribute('tabindex')).toBe('-1');
    expect(thumb.getAttribute('aria-disabled')).toBe('true');

    fireEvent.keyDown(thumb, { key: 'ArrowRight' });
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders a hidden input when name is provided for forms', () => {
    const { container } = render(<Slider aria-label="Volume" name="volume" defaultValue={65} />);
    const input = container.querySelector('input[type="hidden"]') as HTMLInputElement;

    expect(input).toBeTruthy();
    expect(input.name).toBe('volume');
    expect(input.value).toBe('65');
  });

  it('forwards ref to container HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Slider aria-label="Volume" ref={ref} />);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('names the slider from aria-label or aria-labelledby and never injects a default name', () => {
    const { rerender } = render(<Slider aria-label="Brightness" defaultValue={10} />);
    expect(screen.getByRole('slider', { name: 'Brightness' })).toBeTruthy();

    rerender(
      <>
        <span id="slider-heading">Contrast</span>
        <Slider aria-labelledby="slider-heading" defaultValue={10} />
      </>,
    );
    const slider = screen.getByRole('slider', { name: 'Contrast' });
    expect(slider.hasAttribute('aria-label')).toBe(false);
  });
});

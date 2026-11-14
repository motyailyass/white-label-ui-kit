import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress, ProgressLabel, ProgressValue } from './progress';

describe('Progress Primitive', () => {
  it('renders determinate progress bar with accessible WAI-ARIA values and CSS scale property', () => {
    const { container } = render(
      <Progress
        value={45}
        min={0}
        max={100}
        size="lg"
        variant="success"
        label="Storage Used"
        showValue
      />,
    );

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute('aria-valuenow')).toBe('45');
    expect(progressbar.getAttribute('aria-valuemin')).toBe('0');
    expect(progressbar.getAttribute('aria-valuemax')).toBe('100');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('45%');
    expect(progressbar.getAttribute('data-size')).toBe('lg');
    expect(progressbar.getAttribute('data-variant')).toBe('success');
    expect(progressbar.getAttribute('data-state')).toBe('determinate');

    const label = screen.getByText('Storage Used');
    expect(label.getAttribute('id')).toBeTruthy();
    expect(progressbar.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'));
    expect(screen.getByText('45%')).toBeTruthy();

    const indicator = container.querySelector('[style*="--_progress-scale"]') as HTMLElement | null;
    expect(indicator?.style.getPropertyValue('--_progress-scale')).toBe('0.45');
  });

  it('clamps values exceeding min/max bounds and guards zero-span or NaN values', () => {
    const { rerender } = render(
      <Progress value={150} min={0} max={100} aria-label="Progress bounds" />,
    );
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('100');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('100%');

    rerender(<Progress value={-20} min={0} max={100} aria-label="Progress bounds" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('0');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('0%');

    rerender(<Progress value={10} min={10} max={10} aria-label="Zero span" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuenow')).toBe('10');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('0%');

    rerender(<Progress value={Number.NaN} aria-label="NaN fallback" />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('data-state')).toBe('indeterminate');
    expect(progressbar.getAttribute('aria-valuenow')).toBeNull();
    expect(progressbar.getAttribute('aria-busy')).toBe('true');
  });

  it('renders indeterminate mode and supports custom valueText with showValue', () => {
    render(
      <Progress value={null} label="Loading data..." valueText="Synchronizing..." showValue />,
    );

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeTruthy();
    expect(progressbar.getAttribute('data-state')).toBe('indeterminate');
    expect(progressbar.getAttribute('aria-valuenow')).toBeNull();
    expect(progressbar.getAttribute('aria-busy')).toBe('true');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('Synchronizing...');
    expect(screen.getByText('Synchronizing...')).toBeTruthy();
  });

  it('supports custom valueText for determinate step formats', () => {
    render(<Progress value={2} min={0} max={4} valueText="Step 2 of 4" showValue />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.getAttribute('aria-valuetext')).toBe('Step 2 of 4');
    expect(screen.getByText('Step 2 of 4')).toBeTruthy();
  });

  it('wires compound sub-components ProgressLabel and ProgressValue automatically', () => {
    render(
      <Progress value={60}>
        <div>
          <ProgressLabel>Upload</ProgressLabel>
          <ProgressValue>60%</ProgressValue>
        </div>
      </Progress>,
    );

    const progressbar = screen.getByRole('progressbar');
    const label = screen.getByText('Upload');
    expect(label.getAttribute('id')).toBeTruthy();
    expect(progressbar.getAttribute('aria-labelledby')).toBe(label.getAttribute('id'));
    expect(screen.getByText('60%')).toBeTruthy();
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={30} aria-label="Ref test" />);

    expect(ref.current instanceof HTMLDivElement).toBe(true);
  });
});

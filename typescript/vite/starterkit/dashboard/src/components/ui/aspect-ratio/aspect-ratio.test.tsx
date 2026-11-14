import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AspectRatio } from './aspect-ratio';

describe('AspectRatio Primitive', () => {
  it('renders container with default aspect ratio', () => {
    render(
      <AspectRatio data-testid="aspect-ratio">
        <div>Content</div>
      </AspectRatio>,
    );

    const el = screen.getByTestId('aspect-ratio');
    expect(el).toBeTruthy();
    expect(screen.getByText('Content')).toBeTruthy();
  });

  it('sets custom ratio as CSS custom property and data attribute', () => {
    const { rerender } = render(
      <AspectRatio ratio={4 / 3} data-testid="ratio">
        <div>Photo</div>
      </AspectRatio>,
    );

    const el = screen.getByTestId('ratio');
    expect(el.getAttribute('data-ratio')).toBe(String(4 / 3));

    rerender(
      <AspectRatio ratio="1 / 1" data-testid="ratio">
        <div>Square</div>
      </AspectRatio>,
    );
    expect(el.getAttribute('data-ratio')).toBe('1 / 1');
  });

  it('normalizes colon ratio strings into valid CSS aspect-ratio syntax', () => {
    const { rerender } = render(
      <AspectRatio ratio="16:9" data-testid="ratio-colon">
        <div>Video</div>
      </AspectRatio>,
    );

    const el = screen.getByTestId('ratio-colon');
    expect(el.getAttribute('data-ratio')).toBe('16 / 9');
    expect(el.style.getPropertyValue('--aspect-ratio')).toBe('16 / 9');

    rerender(
      <AspectRatio ratio="21:9" data-testid="ratio-colon">
        <div>Cinema</div>
      </AspectRatio>,
    );
    expect(el.getAttribute('data-ratio')).toBe('21 / 9');
  });

  it('merges custom styles and preserves additional HTML attributes', () => {
    render(
      <AspectRatio
        data-testid="aspect-custom"
        className="custom-aspect"
        aria-label="Video player container"
        style={{ opacity: 0.8 }}
      >
        <div>Player</div>
      </AspectRatio>,
    );

    const el = screen.getByTestId('aspect-custom');
    expect(el.className).toContain('custom-aspect');
    expect(el.getAttribute('aria-label')).toBe('Video player container');
    expect(el.style.opacity).toBe('0.8');
    expect(el.style.getPropertyValue('--aspect-ratio')).toBe(String(16 / 9));
  });

  it('forwards ref to HTMLDivElement', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <AspectRatio ref={ref}>
        <div>Ref Target</div>
      </AspectRatio>,
    );

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });
});

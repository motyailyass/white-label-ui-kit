import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Skeleton, type SkeletonAnimation, type SkeletonVariant } from './skeleton';

describe('Skeleton Primitive', () => {
  it('renders decorative placeholder with aria-hidden="true" and no extra inline style by default', () => {
    const { container } = render(<Skeleton />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.getAttribute('data-variant')).toBe('text');
    expect(el.getAttribute('data-animation')).toBe('pulse');
    expect(el.tagName.toLowerCase()).toBe('span');
    expect(el.getAttribute('style')).toBeNull();
  });

  it('renders all 4 visual shape variants with expected default elements', () => {
    const expectations: Array<[SkeletonVariant, string]> = [
      ['text', 'span'],
      ['circular', 'div'],
      ['rectangular', 'div'],
      ['rounded', 'div'],
    ];

    for (const [variant, expectedTag] of expectations) {
      const { container, unmount } = render(<Skeleton variant={variant} />);
      const el = container.firstElementChild;
      expect(el?.tagName.toLowerCase()).toBe(expectedTag);
      expect(el?.getAttribute('data-variant')).toBe(variant);
      unmount();
    }
  });

  it('supports polymorphic tag overrides via the as prop', () => {
    const { container } = render(<Skeleton variant="rounded" as="section" />);
    expect(container.firstElementChild?.tagName.toLowerCase()).toBe('section');
  });

  it('applies custom dimensions via scoped CSS variables while preserving caller styles', () => {
    const { container } = render(<Skeleton width={120} height="2rem" style={{ opacity: 0.9 }} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--_sk-width')).toBe('120px');
    expect(el.style.getPropertyValue('--_sk-height')).toBe('2rem');
    expect(el.style.opacity).toBe('0.9');
  });

  it('supports all animation modes: pulse, wave, and none', () => {
    const modes: SkeletonAnimation[] = ['pulse', 'wave', 'none'];
    for (const animation of modes) {
      const { container, unmount } = render(<Skeleton animation={animation} />);
      expect(container.firstElementChild?.getAttribute('data-animation')).toBe(animation);
      unmount();
    }
  });

  it('supports RTL container context and forwards ref correctly', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <div dir="rtl" lang="ar">
        <Skeleton ref={ref} variant="rounded" animation="wave" width="100%" height={48} />
      </div>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('aria-hidden')).toBe('true');
  });
});

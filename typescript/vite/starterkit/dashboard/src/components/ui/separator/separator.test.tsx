import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { Separator } from './separator';

describe('Separator Primitive', () => {
  it('renders a horizontal hr by default with role="none" when decorative', () => {
    const { container } = render(<Separator />);
    const hr = container.querySelector('hr');
    expect(hr).toBeTruthy();
    expect(hr?.getAttribute('role')).toBe('none');
    expect(hr?.getAttribute('data-orientation')).toBe('horizontal');
    expect(hr?.getAttribute('data-decorative')).toBe('true');
    expect(hr?.hasAttribute('aria-orientation')).toBe(false);
  });

  it('renders semantic role="separator" and aria-orientation when decorative={false}', () => {
    render(<Separator decorative={false} />);
    const sep = screen.getByRole('separator');
    expect(sep).toBeTruthy();
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal');
    expect(sep.getAttribute('data-decorative')).toBe('false');
  });

  it('renders vertical separator correctly', () => {
    render(<Separator orientation="vertical" decorative={false} />);
    const sep = screen.getByRole('separator');
    expect(sep.tagName.toLowerCase()).toBe('div');
    expect(sep.getAttribute('aria-orientation')).toBe('vertical');
    expect(sep.getAttribute('data-orientation')).toBe('vertical');
  });

  it('links semantic divider label dynamically via aria-labelledby unless custom aria-label is supplied', () => {
    const { rerender } = render(<Separator label="OR" decorative={false} />);
    const sep = screen.getByRole('separator', { name: 'OR' });
    const labelSpan = screen.getByText('OR');
    expect(labelSpan.id).toBeTruthy();
    expect(sep.getAttribute('aria-labelledby')).toBe(labelSpan.id);
    expect(sep.getAttribute('data-label-align')).toBe('center');

    rerender(<Separator label="OR" decorative={false} aria-label="Alternative sign-in options" />);
    const customNamedSep = screen.getByRole('separator', { name: 'Alternative sign-in options' });
    expect(customNamedSep.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('supports start, center, and end label alignments plus children alias', () => {
    const { rerender } = render(
      <Separator label="Section" labelAlign="start" decorative={false} />,
    );
    expect(screen.getByRole('separator').getAttribute('data-label-align')).toBe('start');

    rerender(
      <Separator labelAlign="end" decorative={false}>
        End Label
      </Separator>,
    );
    const endSep = screen.getByRole('separator', { name: 'End Label' });
    expect(endSep.getAttribute('data-label-align')).toBe('end');
  });

  it('supports RTL dir="rtl" and Arabic lang="ar" divider labels', () => {
    render(
      <Separator
        dir="rtl"
        lang="ar"
        decorative={false}
        label={
          <>
            أو المتابعة عبر{' '}
            <span lang="en" dir="ltr">
              SSO
            </span>
          </>
        }
      />,
    );
    const sep = screen.getByRole('separator');
    expect(sep.getAttribute('dir')).toBe('rtl');
    expect(sep.getAttribute('lang')).toBe('ar');
    expect(screen.getByText('SSO').getAttribute('lang')).toBe('en');
  });

  it('forwards ref correctly across bare horizontal, labeled, and vertical variants', () => {
    const hrRef = createRef<HTMLElement>();
    const { rerender } = render(<Separator ref={hrRef} />);
    expect(hrRef.current).toBeInstanceOf(HTMLHRElement);

    const divRef = createRef<HTMLElement>();
    rerender(<Separator ref={divRef} label="OR" />);
    expect(divRef.current).toBeInstanceOf(HTMLDivElement);

    const vertRef = createRef<HTMLElement>();
    rerender(<Separator ref={vertRef} orientation="vertical" />);
    expect(vertRef.current).toBeInstanceOf(HTMLDivElement);
  });
});

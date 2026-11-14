import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Kbd, KbdGroup, KbdSeparator } from './kbd';

describe('Kbd Primitive', () => {
  it('renders semantic <kbd> element with children and data attributes', () => {
    render(<Kbd data-testid="kbd-el">⌘</Kbd>);

    const el = screen.getByTestId('kbd-el');
    expect(el.tagName).toBe('KBD');
    expect(el.textContent).toBe('⌘');
    expect(el.getAttribute('data-size')).toBe('md');
    expect(el.getAttribute('data-variant')).toBe('outline');
  });

  it('applies density sizes correctly via classes and data-size attribute', () => {
    const { rerender } = render(
      <Kbd size="sm" data-testid="kbd">
        Ctrl
      </Kbd>,
    );
    const el = screen.getByTestId('kbd');
    expect(el.className).toContain('sizeSm');
    expect(el.getAttribute('data-size')).toBe('sm');

    rerender(
      <Kbd size="lg" data-testid="kbd">
        Ctrl
      </Kbd>,
    );
    expect(el.className).toContain('sizeLg');
    expect(el.getAttribute('data-size')).toBe('lg');
  });

  it('applies style variants correctly via classes and data-variant attribute', () => {
    const { rerender } = render(
      <Kbd variant="outline" data-testid="kbd">
        Shift
      </Kbd>,
    );
    const el = screen.getByTestId('kbd');
    expect(el.className).toContain('variantOutline');
    expect(el.getAttribute('data-variant')).toBe('outline');

    rerender(
      <Kbd variant="subtle" data-testid="kbd">
        Shift
      </Kbd>,
    );
    expect(el.className).toContain('variantSubtle');
    expect(el.getAttribute('data-variant')).toBe('subtle');

    rerender(
      <Kbd variant="ghost" data-testid="kbd">
        Shift
      </Kbd>,
    );
    expect(el.className).toContain('variantGhost');
    expect(el.getAttribute('data-variant')).toBe('ghost');
  });

  it('renders KbdGroup with KbdSeparator and multiple keys', () => {
    const groupRef = createRef<HTMLSpanElement>();
    const sepRef = createRef<HTMLSpanElement>();

    render(
      <KbdGroup ref={groupRef} data-testid="kbd-group">
        <Kbd>Ctrl</Kbd>
        <KbdSeparator ref={sepRef} data-testid="kbd-sep" />
        <Kbd>K</Kbd>
      </KbdGroup>,
    );

    const group = screen.getByTestId('kbd-group');
    expect(group).toBeTruthy();
    expect(group.children.length).toBe(3);
    expect(groupRef.current).toBe(group);

    const sep = screen.getByTestId('kbd-sep');
    expect(sep.textContent).toBe('+');
    expect(sep.getAttribute('aria-hidden')).toBe('true');
    expect(sepRef.current).toBe(sep);
  });

  it('forwards ref to HTMLElement for Kbd and custom props', () => {
    const ref = createRef<HTMLElement>();
    render(
      <Kbd ref={ref} title="Enter key" id="kbd-enter">
        Enter
      </Kbd>,
    );

    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName).toBe('KBD');
    expect(ref.current?.id).toBe('kbd-enter');
    expect(ref.current?.title).toBe('Enter key');
  });
});

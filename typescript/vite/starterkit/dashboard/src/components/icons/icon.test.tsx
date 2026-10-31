import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Icon } from './icon';

describe('Icon component (Hugeicons wrapper)', () => {
  it('renders a decorative icon by default with aria-hidden="true"', () => {
    const { container } = render(<Icon name="search" />);
    const svg = container.querySelector('svg');
    expect(svg).toBeDefined();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('role')).toBeNull();
  });

  it('renders an accessible icon with role="img" and aria-label when label is provided', () => {
    const { container } = render(<Icon name="warning" label="Warning alert" />);
    const svg = container.querySelector('svg');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('aria-label')).toBe('Warning alert');
    expect(svg?.getAttribute('aria-hidden')).toBeNull();
  });

  it('applies the mirror class for directional glyphs', () => {
    const { container: directionalContainer } = render(<Icon name="chevron-right" />);
    const directionalSvg = directionalContainer.querySelector('svg');
    expect(directionalSvg?.getAttribute('class')).toContain('mirror');

    const { container: staticContainer } = render(<Icon name="search" />);
    const staticSvg = staticContainer.querySelector('svg');
    expect(staticSvg?.getAttribute('class')).not.toContain('mirror');
  });
});

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
    expect(directionalSvg?.getAttribute('data-mirror-rtl')).toBe('true');

    const { container: logoutContainer } = render(<Icon name="logout" />);
    const logoutSvg = logoutContainer.querySelector('svg');
    expect(logoutSvg?.getAttribute('class')).toContain('mirror');
    expect(logoutSvg?.getAttribute('data-mirror-rtl')).toBe('true');

    const { container: milestoneContainer } = render(<Icon name="milestone" />);
    const milestoneSvg = milestoneContainer.querySelector('svg');
    expect(milestoneSvg?.getAttribute('class')).toContain('mirror');
    expect(milestoneSvg?.getAttribute('data-mirror-rtl')).toBe('true');

    const { container: staticContainer } = render(<Icon name="search" />);
    const staticSvg = staticContainer.querySelector('svg');
    expect(staticSvg?.getAttribute('class')).not.toContain('mirror');
    expect(staticSvg?.getAttribute('data-mirror-rtl')).toBeNull();
  });

  it('renders newly added action and system icons', () => {
    const { container: addContainer } = render(<Icon name="add" />);
    expect(addContainer.querySelector('svg')).toBeDefined();

    const { container: downloadContainer } = render(<Icon name="download" />);
    expect(downloadContainer.querySelector('svg')).toBeDefined();

    const { container: uploadContainer } = render(<Icon name="upload" />);
    expect(uploadContainer.querySelector('svg')).toBeDefined();

    const { container: bellContainer } = render(<Icon name="bell" />);
    expect(bellContainer.querySelector('svg')).toBeDefined();

    const { container: slidersContainer } = render(<Icon name="sliders" />);
    expect(slidersContainer.querySelector('svg')).toBeDefined();

    const { container: chartContainer } = render(<Icon name="chart" />);
    expect(chartContainer.querySelector('svg')).toBeDefined();

    const { container: search01Container } = render(<Icon name="search-01" />);
    expect(search01Container.querySelector('svg')).toBeDefined();

    const { container: loaderContainer } = render(<Icon name="loader" />);
    expect(loaderContainer.querySelector('svg')).toBeDefined();

    const { container: loaderCircleContainer } = render(<Icon name="loader-circle" />);
    expect(loaderCircleContainer.querySelector('svg')).toBeDefined();

    const { container: spinnerContainer } = render(<Icon name="spinner" />);
    expect(spinnerContainer.querySelector('svg')).toBeDefined();
  });
});

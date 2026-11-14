import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from './empty-state';

describe('EmptyState Primitive', () => {
  it('renders convenience props with correct accessibility role', () => {
    render(
      <EmptyState
        icon={<span data-testid="icon">🔍</span>}
        title="No Results Found"
        description="Try adjusting your search criteria."
        actions={<button type="button">Reset Filters</button>}
      />,
    );

    const container = screen.getByRole('status');
    expect(container).toBeTruthy();
    expect(screen.getByTestId('icon')).toBeTruthy();
    expect(screen.getByText('No Results Found')).toBeTruthy();
    expect(screen.getByText('Try adjusting your search criteria.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Reset Filters' })).toBeTruthy();
  });

  it('renders compound sub-components properly', () => {
    render(
      <EmptyState>
        <EmptyStateIcon data-testid="empty-icon">📁</EmptyStateIcon>
        <EmptyStateTitle as="h2" data-testid="empty-title">
          No Projects
        </EmptyStateTitle>
        <EmptyStateDescription data-testid="empty-desc">
          Get started by creating your first project.
        </EmptyStateDescription>
        <EmptyStateActions data-testid="empty-actions">
          <button type="button">New Project</button>
        </EmptyStateActions>
      </EmptyState>,
    );

    expect(screen.getByTestId('empty-icon')).toBeTruthy();
    const heading = screen.getByTestId('empty-title');
    expect(heading.tagName).toBe('H2');
    expect(heading.textContent).toBe('No Projects');
    expect(screen.getByTestId('empty-desc').textContent).toBe(
      'Get started by creating your first project.',
    );
    expect(screen.getByTestId('empty-actions')).toBeTruthy();
  });

  it('applies variant and size classes', () => {
    const { rerender } = render(
      <EmptyState variant="dashed" size="sm" data-testid="empty-state" />,
    );

    const el = screen.getByTestId('empty-state');
    expect(el.className).toContain('variantDashed');
    expect(el.className).toContain('sizeSm');

    rerender(<EmptyState variant="subtle" size="lg" data-testid="empty-state" />);
    expect(el.className).toContain('variantSubtle');
    expect(el.className).toContain('sizeLg');
  });

  it('supports ghost variant for EmptyStateIcon', () => {
    render(
      <EmptyState>
        <EmptyStateIcon variant="ghost" data-testid="ghost-icon">
          <span>✨</span>
        </EmptyStateIcon>
      </EmptyState>,
    );

    const iconEl = screen.getByTestId('ghost-icon');
    expect(iconEl.className).toContain('iconGhost');
  });

  it('forwards ref to the HTMLDivElement container', () => {
    const ref = createRef<HTMLDivElement>();
    render(<EmptyState ref={ref}>Empty</EmptyState>);

    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current?.getAttribute('role')).toBe('status');
    expect(ref.current?.getAttribute('aria-live')).toBe('polite');
  });

  it('supports borderless variant, titleAs, iconVariant, dir="rtl", and role override without aria-live leak', () => {
    render(
      <EmptyState
        variant="borderless"
        size="lg"
        dir="rtl"
        role="region"
        aria-label="Workspace Empty"
        title="لا توجد عناصر"
        titleAs="h2"
        icon={<span data-testid="borderless-icon">★</span>}
        iconVariant="ghost"
        data-testid="empty-borderless"
      />,
    );

    const region = screen.getByRole('region', { name: 'Workspace Empty' });
    expect(region.getAttribute('data-variant')).toBe('borderless');
    expect(region.getAttribute('data-size')).toBe('lg');
    expect(region.getAttribute('dir')).toBe('rtl');
    expect(region.hasAttribute('aria-live')).toBe(false);

    const heading = screen.getByRole('heading', { level: 2, name: 'لا توجد عناصر' });
    expect(heading).toBeTruthy();

    const iconWrapper = screen.getByTestId('borderless-icon').parentElement as HTMLElement;
    expect(iconWrapper.className).toContain('iconGhost');
  });
});

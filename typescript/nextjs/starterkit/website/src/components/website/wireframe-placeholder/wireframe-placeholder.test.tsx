import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { WireframePlaceholder } from './wireframe-placeholder';

describe('WireframePlaceholder', () => {
  it('renders default wireframe placeholder with image icon', () => {
    const { container } = render(<WireframePlaceholder data-testid="wf-ph" />);
    const el = screen.getByTestId('wf-ph');
    expect(el).toBeInTheDocument();
    expect(el.getAttribute('data-rounded')).toBe('feature');
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders custom label when provided', () => {
    render(<WireframePlaceholder label="Wireframe Hero Visual" />);
    expect(screen.getByText('Wireframe Hero Visual')).toBeInTheDocument();
  });

  it('supports custom children', () => {
    render(
      <WireframePlaceholder>
        <div data-testid="custom-child">Mockup Content</div>
      </WireframePlaceholder>,
    );
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { WebsiteCard } from './website-card';

describe('WebsiteCard', () => {
  it('renders with default elevation "none"', () => {
    render(<WebsiteCard>Card Content</WebsiteCard>);
    const card = screen.getByRole('article');
    expect(card).toBeDefined();
    expect(card.getAttribute('data-elevation')).toBe('none');
    expect(card.textContent).toBe('Card Content');
  });

  it('renders raised elevation when specified', () => {
    render(<WebsiteCard elevation="raised">Raised Card</WebsiteCard>);
    const card = screen.getByRole('article');
    expect(card.getAttribute('data-elevation')).toBe('raised');
  });

  it('renders floating elevation when specified', () => {
    render(<WebsiteCard elevation="floating">Floating Card</WebsiteCard>);
    const card = screen.getByRole('article');
    expect(card.getAttribute('data-elevation')).toBe('floating');
  });

  it('forwards ref to the underlying article element', () => {
    const ref = createRef<HTMLElement>();
    render(<WebsiteCard ref={ref}>Ref Card</WebsiteCard>);
    expect(ref.current).toBeInstanceOf(HTMLElement);
    expect(ref.current?.tagName.toLowerCase()).toBe('article');
  });

  it('merges custom className', () => {
    render(<WebsiteCard className="custom-class">Custom Card</WebsiteCard>);
    const card = screen.getByRole('article');
    expect(card.classList.contains('custom-class')).toBe(true);
  });
});

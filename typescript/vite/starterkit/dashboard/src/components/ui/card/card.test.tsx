import { fireEvent, render, screen } from '@testing-library/react';
import React, { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  type CardElement,
  type CardFooterAlign,
  type CardHeadingElement,
  type CardPadding,
  type CardVariant,
} from './index';

describe('Card Primitive', () => {
  it('renders complete compound structure correctly', () => {
    render(
      <Card data-testid="card-root">
        <CardHeader data-testid="card-header">
          <CardTitle data-testid="card-title">Analytics Overview</CardTitle>
          <CardDescription data-testid="card-desc">Monthly performance metrics</CardDescription>
        </CardHeader>
        <CardContent data-testid="card-content">
          <p>Chart data goes here</p>
        </CardContent>
        <CardFooter data-testid="card-footer">
          <button type="button">Export</button>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('card-root')).toBeDefined();
    expect(screen.getByTestId('card-header')).toBeDefined();
    expect(screen.getByText('Analytics Overview')).toBeDefined();
    expect(screen.getByText('Monthly performance metrics')).toBeDefined();
    expect(screen.getByText('Chart data goes here')).toBeDefined();
    expect(screen.getByTestId('card-footer')).toBeDefined();
  });

  it('applies all surface variants via data-variant attribute', () => {
    const variants: CardVariant[] = ['default', 'subtle', 'raised', 'interactive'];

    variants.forEach((variant) => {
      const { unmount } = render(
        <Card variant={variant} data-testid={`card-${variant}`}>
          Content
        </Card>,
      );
      const el = screen.getByTestId(`card-${variant}`);
      expect(el.getAttribute('data-variant')).toBe(variant);
      unmount();
    });
  });

  it('applies padding density scale via data-padding attribute', () => {
    const paddings: CardPadding[] = ['none', 'sm', 'md', 'lg'];

    paddings.forEach((padding) => {
      const { unmount } = render(
        <Card padding={padding} data-testid={`card-${padding}`}>
          Content
        </Card>,
      );
      const el = screen.getByTestId(`card-${padding}`);
      expect(el.getAttribute('data-padding')).toBe(padding);
      unmount();
    });
  });

  it('supports polymorphic root elements via as prop', () => {
    const elements: CardElement[] = ['div', 'article', 'section', 'aside'];

    elements.forEach((as) => {
      const { unmount } = render(
        <Card as={as} data-testid={`card-${as}`}>
          Content
        </Card>,
      );
      const el = screen.getByTestId(`card-${as}`);
      expect(el.tagName.toLowerCase()).toBe(as);
      unmount();
    });
  });

  it('supports polymorphic heading elements on CardTitle', () => {
    const headings: CardHeadingElement[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span'];

    headings.forEach((as) => {
      const { unmount } = render(
        <CardTitle as={as} data-testid={`title-${as}`}>
          Title
        </CardTitle>,
      );
      const el = screen.getByTestId(`title-${as}`);
      expect(el.tagName.toLowerCase()).toBe(as);
      unmount();
    });
  });

  it('applies divider attributes on CardHeader and CardFooter', () => {
    render(
      <Card>
        <CardHeader divider data-testid="header-divider">
          <CardTitle>Header</CardTitle>
        </CardHeader>
        <CardFooter divider data-testid="footer-divider">
          <span>Footer</span>
        </CardFooter>
      </Card>,
    );

    expect(screen.getByTestId('header-divider').getAttribute('data-divider')).toBe('true');
    expect(screen.getByTestId('footer-divider').getAttribute('data-divider')).toBe('true');
  });

  it('applies alignment options on CardFooter', () => {
    const alignments: CardFooterAlign[] = ['end', 'between', 'start', 'stretch'];

    alignments.forEach((align) => {
      const { unmount } = render(
        <CardFooter align={align} data-testid={`footer-${align}`}>
          Actions
        </CardFooter>,
      );
      const el = screen.getByTestId(`footer-${align}`);
      expect(el.getAttribute('data-align')).toBe(align);
      unmount();
    });
  });

  it('handles interactive click and keyboard activation', () => {
    const handleClick = vi.fn();
    render(
      <Card interactive onClick={handleClick} data-testid="interactive-card">
        Clickable Card
      </Card>,
    );

    const card = screen.getByTestId('interactive-card');
    expect(card.getAttribute('tabindex')).toBe('0');
    expect(card.getAttribute('role')).toBe('button');

    fireEvent.click(card);
    expect(handleClick).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(3);
  });

  it('does not trigger card keyboard activation from nested interactive controls', () => {
    const handleCardClick = vi.fn();
    render(
      <Card interactive onClick={handleCardClick} data-testid="interactive-card-nested">
        <CardContent>Body</CardContent>
        <CardFooter>
          <button type="button">Inner action</button>
        </CardFooter>
      </Card>,
    );

    const innerButton = screen.getByRole('button', { name: 'Inner action' });
    fireEvent.keyDown(innerButton, { key: 'Enter' });
    fireEvent.keyDown(innerButton, { key: ' ' });
    expect(handleCardClick).not.toHaveBeenCalled();
  });

  it('forwards refs correctly to DOM elements', () => {
    const rootRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLDivElement>();
    const titleRef = createRef<HTMLHeadingElement>();
    const descRef = createRef<HTMLParagraphElement>();
    const contentRef = createRef<HTMLDivElement>();
    const footerRef = createRef<HTMLDivElement>();

    render(
      <Card ref={rootRef}>
        <CardHeader ref={headerRef}>
          <CardTitle ref={titleRef}>Title</CardTitle>
          <CardDescription ref={descRef}>Desc</CardDescription>
        </CardHeader>
        <CardContent ref={contentRef}>Content</CardContent>
        <CardFooter ref={footerRef}>Footer</CardFooter>
      </Card>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(titleRef.current).toBeInstanceOf(HTMLHeadingElement);
    expect(descRef.current).toBeInstanceOf(HTMLParagraphElement);
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement);
    expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
  });
});

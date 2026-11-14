import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import {
  StatCard,
  StatCardDescription,
  StatCardFooter,
  StatCardHeader,
  StatCardIcon,
  StatCardTitle,
  StatCardTrend,
  StatCardValue,
} from './stat-card';

describe('StatCard Primitive', () => {
  it('renders compound stat card with title, value, decorative icon, and footer trend', () => {
    render(
      <StatCard data-testid="card">
        <StatCardHeader>
          <StatCardTitle>Total Revenue</StatCardTitle>
          <StatCardIcon data-testid="stat-icon">★</StatCardIcon>
        </StatCardHeader>
        <StatCardValue>$45,231.89</StatCardValue>
        <StatCardFooter>
          <StatCardTrend direction="up">+20.1%</StatCardTrend>
          <StatCardDescription>from last month</StatCardDescription>
        </StatCardFooter>
      </StatCard>,
    );

    const card = screen.getByTestId('card');
    expect(card.getAttribute('data-variant')).toBe('default');
    expect(card.getAttribute('data-size')).toBe('md');
    expect(screen.getByText('Total Revenue')).toBeTruthy();
    expect(screen.getByText('$45,231.89')).toBeTruthy();
    expect(screen.getByText('+20.1%')).toBeTruthy();
    expect(screen.getByText('from last month')).toBeTruthy();
    expect(screen.getByTestId('stat-icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('applies surface variants and density size data attributes', () => {
    const { rerender } = render(<StatCard data-testid="card" variant="default" size="sm" />);
    expect(screen.getByTestId('card').getAttribute('data-variant')).toBe('default');
    expect(screen.getByTestId('card').getAttribute('data-size')).toBe('sm');

    rerender(<StatCard data-testid="card" variant="raised" size="md" />);
    expect(screen.getByTestId('card').getAttribute('data-variant')).toBe('raised');
    expect(screen.getByTestId('card').getAttribute('data-size')).toBe('md');

    rerender(<StatCard data-testid="card" variant="subtle" size="lg" />);
    expect(screen.getByTestId('card').getAttribute('data-variant')).toBe('subtle');
    expect(screen.getByTestId('card').getAttribute('data-size')).toBe('lg');
  });

  it('renders trend direction states, pill mode, custom icon, and accessible label', () => {
    const { rerender } = render(
      <StatCardTrend data-testid="trend" direction="up" pill label="Increased by">
        +12%
      </StatCardTrend>,
    );
    const trend = screen.getByTestId('trend');
    expect(trend.getAttribute('data-direction')).toBe('up');
    expect(trend.getAttribute('data-pill')).toBe('true');
    expect(screen.getByText('Increased by')).toBeTruthy();

    rerender(
      <StatCardTrend
        data-testid="trend"
        direction="down"
        icon={<span data-testid="custom-icon">▼</span>}
      >
        -5%
      </StatCardTrend>,
    );
    expect(trend.getAttribute('data-direction')).toBe('down');
    expect(trend.getAttribute('data-pill')).toBeNull();
    expect(screen.getByTestId('custom-icon')).toBeTruthy();

    rerender(
      <StatCardTrend data-testid="trend" direction="neutral">
        0%
      </StatCardTrend>,
    );
    expect(trend.getAttribute('data-direction')).toBe('neutral');
  });

  it('supports polymorphic card container and title tag', () => {
    render(
      <StatCard as="article" data-testid="article-card">
        <StatCardTitle as="h3">Metric Heading</StatCardTitle>
      </StatCard>,
    );

    expect(screen.getByTestId('article-card').tagName).toBe('ARTICLE');
    expect(screen.getByRole('heading', { level: 3, name: 'Metric Heading' })).toBeTruthy();
  });

  it('renders cleanly inside RTL context and forwards refs across all subcomponents', () => {
    const rootRef = createRef<HTMLDivElement>();
    const headerRef = createRef<HTMLDivElement>();
    const titleRef = createRef<HTMLSpanElement>();
    const iconRef = createRef<HTMLSpanElement>();
    const valueRef = createRef<HTMLDivElement>();
    const footerRef = createRef<HTMLDivElement>();
    const trendRef = createRef<HTMLSpanElement>();
    const descRef = createRef<HTMLParagraphElement>();

    render(
      <div dir="rtl" lang="ar">
        <StatCard ref={rootRef}>
          <StatCardHeader ref={headerRef}>
            <StatCardTitle ref={titleRef}>إجمالي الإيرادات</StatCardTitle>
            <StatCardIcon ref={iconRef}>★</StatCardIcon>
          </StatCardHeader>
          <StatCardValue ref={valueRef}>$84,250</StatCardValue>
          <StatCardFooter ref={footerRef}>
            <StatCardTrend ref={trendRef} direction="up">
              +12.4%
            </StatCardTrend>
            <StatCardDescription ref={descRef}>مقارنة بالشهر الماضي</StatCardDescription>
          </StatCardFooter>
        </StatCard>
      </div>,
    );

    expect(rootRef.current).toBeInstanceOf(HTMLDivElement);
    expect(headerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(titleRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(iconRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(valueRef.current).toBeInstanceOf(HTMLDivElement);
    expect(footerRef.current).toBeInstanceOf(HTMLDivElement);
    expect(trendRef.current).toBeInstanceOf(HTMLSpanElement);
    expect(descRef.current).toBeInstanceOf(HTMLParagraphElement);
  });
});

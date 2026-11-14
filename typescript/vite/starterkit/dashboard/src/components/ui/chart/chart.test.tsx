import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarChart, ChartContainer, ChartLegend, DonutChart, LineChart } from './chart';

describe('Chart Components', () => {
  it('ChartContainer renders accessible figure landmark', () => {
    render(
      <ChartContainer aria-label="Quarterly Revenue" data-testid="container">
        <div>Content</div>
      </ChartContainer>,
    );

    const container = screen.getByTestId('container');
    expect(container.tagName).toBe('FIGURE');
    expect(container.getAttribute('role')).toBe('region');
    expect(container.getAttribute('aria-label')).toBe('Quarterly Revenue');
  });

  it('BarChart renders SVG bars, accessible table, and displays tooltip on focus', () => {
    const data = [
      { label: 'Q1', value: 100 },
      { label: 'Q2', value: 250 },
      { label: 'Q3', value: 180 },
    ];

    render(<BarChart data={data} aria-label="Quarterly Sales" data-testid="barchart" />);

    const wrapper = screen.getByTestId('barchart');
    const svg = wrapper.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg!.getAttribute('role')).toBe('img');

    const bars = wrapper.querySelectorAll('rect');
    expect(bars.length).toBe(3);
    expect(bars[0].getAttribute('aria-label')).toBe('Q1: 100');

    // Focus first bar to reveal tooltip
    fireEvent.focus(bars[0]);
    const tooltip = screen.getByTestId('chart-tooltip');
    expect(tooltip.textContent).toContain('Q1: 100');

    fireEvent.blur(bars[0]);
    expect(screen.queryByTestId('chart-tooltip')).toBeNull();

    // Screen reader accessible table
    const table = wrapper.querySelector('table');
    expect(table).not.toBeNull();
    const rows = table!.querySelectorAll('tbody tr');
    expect(rows.length).toBe(3);
  });

  it('LineChart renders SVG line path, interactive points, and supports single-point datasets', () => {
    const data = [
      { label: 'Jan', value: 10 },
      { label: 'Feb', value: 40 },
      { label: 'Mar', value: 25 },
    ];

    const { rerender } = render(
      <LineChart data={data} aria-label="Monthly Traffic" data-testid="linechart" />,
    );

    const wrapper = screen.getByTestId('linechart');
    const paths = wrapper.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);

    const points = wrapper.querySelectorAll('circle');
    expect(points.length).toBe(3);

    fireEvent.focus(points[1]);
    expect(screen.getByTestId('chart-tooltip').textContent).toContain('Feb: 40');

    // Rerender with single data point
    rerender(
      <LineChart
        data={[{ label: 'Only', value: 50 }]}
        aria-label="Single Point"
        data-testid="linechart"
      />,
    );
    expect(wrapper.querySelectorAll('circle').length).toBe(1);
  });

  it('DonutChart renders segments and updates center label/value on focus', () => {
    const data = [
      { label: 'Desktop', value: 60 },
      { label: 'Mobile', value: 40 },
    ];

    render(
      <DonutChart
        data={data}
        centerLabel="Visits"
        centerValue="100k"
        formatValue={(v) => `${v}%`}
        aria-label="Device Breakdown"
        data-testid="donutchart"
      />,
    );

    const wrapper = screen.getByTestId('donutchart');
    const segments = wrapper.querySelectorAll('circle');
    expect(segments.length).toBe(2);

    expect(wrapper.textContent).toContain('100k');
    expect(wrapper.textContent).toContain('Visits');

    fireEvent.focus(segments[0]);
    expect(wrapper.textContent).toContain('60%');
    expect(wrapper.textContent).toContain('Desktop');
  });

  it('ChartLegend renders color indicators and item labels', () => {
    const items = [
      { label: 'Direct', color: 'var(--chart-1)', value: '40%' },
      { label: 'Organic', color: 'var(--chart-2)', value: '60%' },
    ];

    render(<ChartLegend items={items} data-testid="legend" />);

    const legend = screen.getByTestId('legend');
    expect(legend.getAttribute('role')).toBe('list');
    expect(legend.textContent).toContain('Direct');
    expect(legend.textContent).toContain('Organic');
    expect(legend.textContent).toContain('(40%)');
  });
});

'use client';

import {
  type CSSProperties,
  type ComponentPropsWithoutRef,
  type FocusEvent,
  type MouseEvent,
  forwardRef,
  useId,
  useMemo,
  useState,
} from 'react';
import { cn } from '@/lib/cn';
import styles from './chart.module.css';

/* -------------------------------------------------------------------------- */
/* Types & Shared Helpers                                                     */
/* -------------------------------------------------------------------------- */

export interface ChartDataItem {
  label: string;
  value: number;
  color?: string;
}

export interface ChartLegendItem {
  label: string;
  color: string;
  value?: string | number;
}

interface ActiveTooltipPoint {
  index: number;
  label: string;
  value: number;
  svgX: number;
  inlinePct: number;
  blockPct: number;
}

const DEFAULT_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
];

const CARTESIAN_PADDING = { top: 20, right: 20, bottom: 32, left: 56 } as const;
const CARTESIAN_VIEW_WIDTH = 560;
const GRID_STEPS = 4;

function defaultFormatValue(val: number): string {
  return val.toLocaleString();
}

function isElementRTL(el: Element): boolean {
  const dirAncestor = el.closest('[dir]');
  if (dirAncestor) {
    return dirAncestor.getAttribute('dir') === 'rtl';
  }
  return typeof document !== 'undefined' && document.documentElement.dir === 'rtl';
}

function computeNiceMaxValue(data: ChartDataItem[]): number {
  const rawMax = Math.max(...data.map((d) => d.value), 1);
  const order = Math.pow(10, Math.floor(Math.log10(rawMax)));
  return Math.ceil(rawMax / order) * order;
}

function createTooltipPoint(
  el: Element,
  index: number,
  label: string,
  value: number,
  svgX: number,
  svgY: number,
  viewHeight: number,
): ActiveTooltipPoint {
  const rawXPct = (svgX / CARTESIAN_VIEW_WIDTH) * 100;
  const inlinePct = isElementRTL(el) ? 100 - rawXPct : rawXPct;
  const blockPct = (svgY / viewHeight) * 100;
  return { index, label, value, svgX, inlinePct, blockPct };
}

function preventMouseDownFocus(e: MouseEvent<SVGElement>) {
  e.preventDefault();
}

function CartesianGridAndBaseline({
  chartWidth,
  chartHeight,
  maxValue,
  showGrid,
  formatValue,
}: {
  chartWidth: number;
  chartHeight: number;
  maxValue: number;
  showGrid: boolean;
  formatValue: (val: number) => string;
}) {
  return (
    <>
      {Array.from({ length: GRID_STEPS + 1 }, (_, idx) => {
        const val = (maxValue / GRID_STEPS) * (GRID_STEPS - idx);
        const y = CARTESIAN_PADDING.top + (idx / GRID_STEPS) * chartHeight;
        return (
          <g key={`grid-${idx}`}>
            {showGrid && idx < GRID_STEPS ? (
              <line
                x1={CARTESIAN_PADDING.left}
                y1={y}
                x2={CARTESIAN_PADDING.left + chartWidth}
                y2={y}
                className={styles.gridLine}
              />
            ) : null}
            <text
              x={CARTESIAN_PADDING.left - 10}
              y={y + 4}
              textAnchor="end"
              className={styles.axisText}
            >
              {formatValue(val)}
            </text>
          </g>
        );
      })}
      <line
        x1={CARTESIAN_PADDING.left}
        y1={CARTESIAN_PADDING.top + chartHeight}
        x2={CARTESIAN_PADDING.left + chartWidth}
        y2={CARTESIAN_PADDING.top + chartHeight}
        className={styles.axisLine}
      />
    </>
  );
}

function ChartTooltipOverlay({
  activeItem,
  formatValue,
}: {
  activeItem: ActiveTooltipPoint | null;
  formatValue: (val: number) => string;
}) {
  if (!activeItem) return null;
  return (
    <div
      className={styles.tooltip}
      data-testid="chart-tooltip"
      style={
        {
          '--tooltip-x': `${activeItem.inlinePct}%`,
          '--tooltip-y': `${activeItem.blockPct}%`,
        } as CSSProperties
      }
    >
      <strong>{activeItem.label}</strong>: {formatValue(activeItem.value)}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* ChartContainer                                                             */
/* -------------------------------------------------------------------------- */

export interface ChartContainerProps extends ComponentPropsWithoutRef<'figure'> {
  'data-testid'?: string;
}

export const ChartContainer = forwardRef<HTMLElement, ChartContainerProps>(function ChartContainer(
  { children, className, 'data-testid': testId, ...rest },
  ref,
) {
  return (
    <figure
      ref={ref}
      role="region"
      className={cn(styles.container, className)}
      data-testid={testId}
      {...rest}
    >
      {children}
    </figure>
  );
});

ChartContainer.displayName = 'ChartContainer';

/* -------------------------------------------------------------------------- */
/* BarChart                                                                   */
/* -------------------------------------------------------------------------- */

export interface BarChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  data: ChartDataItem[];
  height?: number;
  color?: string;
  showGrid?: boolean;
  formatValue?: (val: number) => string;
  'data-testid'?: string;
}

export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    data,
    height = 240,
    color = 'var(--chart-1)',
    showGrid = true,
    formatValue = defaultFormatValue,
    'aria-label': ariaLabel,
    className,
    style,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const [activeItem, setActiveItem] = useState<ActiveTooltipPoint | null>(null);

  const chartWidth = CARTESIAN_VIEW_WIDTH - CARTESIAN_PADDING.left - CARTESIAN_PADDING.right;
  const chartHeight = height - CARTESIAN_PADDING.top - CARTESIAN_PADDING.bottom;
  const maxValue = useMemo(() => computeNiceMaxValue(data), [data]);

  const barWidth = useMemo(() => {
    if (data.length === 0) return 24;
    const available = chartWidth / data.length;
    return Math.min(Math.max(available * 0.56, 10), 44);
  }, [chartWidth, data.length]);

  const wrapperStyle = {
    ...style,
    '--chart-min-height': `${height}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(styles.chartWrapper, className)}
      data-testid={testId}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${CARTESIAN_VIEW_WIDTH} ${height}`}
        className={styles.svg}
        role="img"
        aria-label={ariaLabel}
      >
        {ariaLabel ? <title>{ariaLabel}</title> : null}

        <CartesianGridAndBaseline
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          maxValue={maxValue}
          showGrid={showGrid}
          formatValue={formatValue}
        />

        {data.map((item, idx) => {
          const slotWidth = chartWidth / data.length;
          const x = CARTESIAN_PADDING.left + idx * slotWidth + (slotWidth - barWidth) / 2;
          const barHeight = (item.value / maxValue) * chartHeight;
          const y = CARTESIAN_PADDING.top + chartHeight - barHeight;
          const barColor = item.color ?? color;
          const isDimmed = activeItem !== null && activeItem.index !== idx;

          return (
            <g key={`bar-${idx}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                fill={barColor}
                className={cn(styles.bar, isDimmed && styles.barDimmed)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${item.label}: ${formatValue(item.value)}`}
                onMouseDown={preventMouseDownFocus}
                onMouseEnter={(e: MouseEvent<SVGRectElement>) =>
                  setActiveItem(
                    createTooltipPoint(
                      e.currentTarget,
                      idx,
                      item.label,
                      item.value,
                      x + barWidth / 2,
                      y,
                      height,
                    ),
                  )
                }
                onMouseLeave={() => setActiveItem(null)}
                onFocus={(e: FocusEvent<SVGRectElement>) =>
                  setActiveItem(
                    createTooltipPoint(
                      e.currentTarget,
                      idx,
                      item.label,
                      item.value,
                      x + barWidth / 2,
                      y,
                      height,
                    ),
                  )
                }
                onBlur={() => setActiveItem(null)}
              />
              <text
                x={x + barWidth / 2}
                y={CARTESIAN_PADDING.top + chartHeight + 20}
                textAnchor="middle"
                className={styles.axisText}
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      <table className={styles.srOnly} aria-label={ariaLabel}>
        <tbody>
          {data.map((item, idx) => (
            <tr key={`sr-${idx}`}>
              <th scope="row">{item.label}</th>
              <td>{formatValue(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ChartTooltipOverlay activeItem={activeItem} formatValue={formatValue} />
    </div>
  );
});

BarChart.displayName = 'BarChart';

/* -------------------------------------------------------------------------- */
/* LineChart                                                                  */
/* -------------------------------------------------------------------------- */

export interface LineChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  data: ChartDataItem[];
  height?: number;
  showArea?: boolean;
  showGrid?: boolean;
  color?: string;
  formatValue?: (val: number) => string;
  'data-testid'?: string;
}

export const LineChart = forwardRef<HTMLDivElement, LineChartProps>(function LineChart(
  {
    data,
    height = 240,
    showArea = true,
    showGrid = true,
    color = 'var(--chart-1)',
    formatValue = defaultFormatValue,
    'aria-label': ariaLabel,
    className,
    style,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const rawId = useId();
  const gradientId = useMemo(() => `chart-area-${rawId.replace(/:/g, '')}`, [rawId]);
  const [activeItem, setActiveItem] = useState<ActiveTooltipPoint | null>(null);

  const chartWidth = CARTESIAN_VIEW_WIDTH - CARTESIAN_PADDING.left - CARTESIAN_PADDING.right;
  const chartHeight = height - CARTESIAN_PADDING.top - CARTESIAN_PADDING.bottom;
  const maxValue = useMemo(() => computeNiceMaxValue(data), [data]);

  const points = useMemo(() => {
    if (data.length === 0) return [];
    if (data.length === 1) {
      const single = data[0];
      return [
        {
          x: CARTESIAN_PADDING.left + chartWidth / 2,
          y: CARTESIAN_PADDING.top + chartHeight - (single.value / maxValue) * chartHeight,
          label: single.label,
          value: single.value,
        },
      ];
    }
    return data.map((item, idx) => ({
      x: CARTESIAN_PADDING.left + (idx / (data.length - 1)) * chartWidth,
      y: CARTESIAN_PADDING.top + chartHeight - (item.value / maxValue) * chartHeight,
      label: item.label,
      value: item.value,
    }));
  }, [data, chartWidth, chartHeight, maxValue]);

  const linePath = useMemo(() => {
    if (points.length < 2) return '';
    return points.reduce(
      (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
      '',
    );
  }, [points]);

  const areaPath = useMemo(() => {
    if (points.length < 2) return '';
    const first = points[0];
    const last = points[points.length - 1];
    const baseline = CARTESIAN_PADDING.top + chartHeight;
    return `${linePath} L ${last.x} ${baseline} L ${first.x} ${baseline} Z`;
  }, [linePath, points, chartHeight]);

  const wrapperStyle = {
    ...style,
    '--chart-min-height': `${height}px`,
    '--chart-color': color,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(styles.chartWrapper, className)}
      data-testid={testId}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${CARTESIAN_VIEW_WIDTH} ${height}`}
        className={styles.svg}
        role="img"
        aria-label={ariaLabel}
      >
        {ariaLabel ? <title>{ariaLabel}</title> : null}

        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <CartesianGridAndBaseline
          chartWidth={chartWidth}
          chartHeight={chartHeight}
          maxValue={maxValue}
          showGrid={showGrid}
          formatValue={formatValue}
        />

        {showArea && areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
        {linePath ? <path d={linePath} className={styles.line} /> : null}

        {activeItem ? (
          <line
            x1={activeItem.svgX}
            y1={CARTESIAN_PADDING.top}
            x2={activeItem.svgX}
            y2={CARTESIAN_PADDING.top + chartHeight}
            className={styles.crosshair}
          />
        ) : null}

        {points.map((pt, idx) => {
          const isActive = activeItem?.index === idx;
          return (
            <g key={`pt-${idx}`}>
              <circle
                cx={pt.x}
                cy={pt.y}
                className={cn(styles.point, isActive && styles.pointActive)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${pt.label}: ${formatValue(pt.value)}`}
                onMouseDown={preventMouseDownFocus}
                onMouseEnter={(e: MouseEvent<SVGCircleElement>) =>
                  setActiveItem(
                    createTooltipPoint(
                      e.currentTarget,
                      idx,
                      pt.label,
                      pt.value,
                      pt.x,
                      pt.y,
                      height,
                    ),
                  )
                }
                onMouseLeave={() => setActiveItem(null)}
                onFocus={(e: FocusEvent<SVGCircleElement>) =>
                  setActiveItem(
                    createTooltipPoint(
                      e.currentTarget,
                      idx,
                      pt.label,
                      pt.value,
                      pt.x,
                      pt.y,
                      height,
                    ),
                  )
                }
                onBlur={() => setActiveItem(null)}
              />
              <text
                x={pt.x}
                y={CARTESIAN_PADDING.top + chartHeight + 20}
                textAnchor="middle"
                className={styles.axisText}
              >
                {pt.label}
              </text>
            </g>
          );
        })}
      </svg>

      <table className={styles.srOnly} aria-label={ariaLabel}>
        <tbody>
          {data.map((item, idx) => (
            <tr key={`sr-${idx}`}>
              <th scope="row">{item.label}</th>
              <td>{formatValue(item.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <ChartTooltipOverlay activeItem={activeItem} formatValue={formatValue} />
    </div>
  );
});

LineChart.displayName = 'LineChart';

/* -------------------------------------------------------------------------- */
/* DonutChart                                                                 */
/* -------------------------------------------------------------------------- */

export interface DonutChartProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  data: ChartDataItem[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  formatValue?: (val: number) => string;
  'data-testid'?: string;
}

export const DonutChart = forwardRef<HTMLDivElement, DonutChartProps>(function DonutChart(
  {
    data,
    size = 220,
    strokeWidth = 26,
    centerLabel,
    centerValue,
    formatValue = defaultFormatValue,
    'aria-label': ariaLabel,
    className,
    style,
    'data-testid': testId,
    ...rest
  },
  ref,
) {
  const [activeItem, setActiveItem] = useState<{
    index: number;
    label: string;
    value: number;
  } | null>(null);

  const radius = (size - strokeWidth - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = useMemo(() => data.reduce((sum, item) => sum + item.value, 0), [data]);

  const segments = useMemo(() => {
    let accumulated = 0;
    const gap = data.length > 1 ? 2 : 0;
    return data.map((item, idx) => {
      const ratio = total > 0 ? item.value / total : 0;
      const arcLength = Math.max(ratio * circumference - gap, 0);
      const strokeDasharray = `${arcLength} ${circumference}`;
      const strokeDashoffset = -accumulated * circumference;
      accumulated += ratio;
      const color = item.color || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
      return { ...item, strokeDasharray, strokeDashoffset, color, ratio };
    });
  }, [data, total, circumference]);

  const displayValue = activeItem
    ? formatValue(activeItem.value)
    : centerValue || (total > 0 ? formatValue(total) : '');
  const displayLabel = activeItem ? activeItem.label : centerLabel;

  const wrapperStyle = {
    ...style,
    '--chart-min-height': `${size}px`,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={cn(styles.chartWrapper, className)}
      data-testid={testId}
      style={wrapperStyle}
      {...rest}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        className={cn(styles.svg, styles.svgAuto)}
        role="img"
        aria-label={ariaLabel}
      >
        {ariaLabel ? <title>{ariaLabel}</title> : null}

        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((seg, idx) => {
            const isActive = activeItem?.index === idx;
            const isDimmed = activeItem !== null && !isActive;
            return (
              <circle
                key={`donut-${idx}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={seg.color}
                strokeWidth={isActive ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                className={cn(styles.donutSegment, isDimmed && styles.donutSegmentDimmed)}
                tabIndex={0}
                role="graphics-symbol"
                aria-label={`${seg.label}: ${formatValue(seg.value)} (${Math.round(seg.ratio * 100)}%)`}
                onMouseDown={preventMouseDownFocus}
                onMouseEnter={() =>
                  setActiveItem({ index: idx, label: seg.label, value: seg.value })
                }
                onMouseLeave={() => setActiveItem(null)}
                onFocus={() => setActiveItem({ index: idx, label: seg.label, value: seg.value })}
                onBlur={() => setActiveItem(null)}
              />
            );
          })}
        </g>

        <text
          x={size / 2}
          y={displayLabel ? size / 2 - 6 : size / 2}
          className={cn(styles.donutCenter, styles.donutValue)}
        >
          {displayValue}
        </text>
        {displayLabel ? (
          <text
            x={size / 2}
            y={size / 2 + 16}
            className={cn(styles.donutCenter, styles.donutLabel)}
          >
            {displayLabel}
          </text>
        ) : null}
      </svg>

      <table className={styles.srOnly} aria-label={ariaLabel}>
        <tbody>
          {segments.map((seg, idx) => (
            <tr key={`sr-${idx}`}>
              <th scope="row">{seg.label}</th>
              <td>{formatValue(seg.value)}</td>
              <td>{Math.round(seg.ratio * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

DonutChart.displayName = 'DonutChart';

/* -------------------------------------------------------------------------- */
/* ChartLegend                                                                */
/* -------------------------------------------------------------------------- */

export interface ChartLegendProps extends ComponentPropsWithoutRef<'div'> {
  items: ChartLegendItem[];
  'data-testid'?: string;
}

export const ChartLegend = forwardRef<HTMLDivElement, ChartLegendProps>(function ChartLegend(
  { items, className, 'data-testid': testId, 'aria-label': ariaLabel, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      role="list"
      aria-label={ariaLabel}
      className={cn(styles.legend, className)}
      data-testid={testId}
      {...rest}
    >
      {items.map((item, idx) => (
        <div key={`legend-${idx}`} role="listitem" className={styles.legendItem}>
          <span
            className={styles.legendColor}
            style={{ '--legend-color': item.color } as CSSProperties}
            aria-hidden="true"
          />
          <span>{item.label}</span>
          {item.value !== undefined ? (
            <span className={styles.legendValue}>({item.value})</span>
          ) : null}
        </div>
      ))}
    </div>
  );
});

ChartLegend.displayName = 'ChartLegend';

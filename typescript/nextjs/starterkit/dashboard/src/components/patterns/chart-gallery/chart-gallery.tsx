'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  BarChart,
  ChartContainer,
  type ChartDataItem,
  ChartLegend,
  type ChartLegendItem,
  DonutChart,
  LineChart,
} from '@/components/ui';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './chart-gallery.module.css';

export interface ChartGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type ChartType = 'bar' | 'line' | 'donut';

interface LocalizedDataPoint {
  labelEn: string;
  labelAr: string;
  value: number;
}

const BAR_ITEMS: LocalizedDataPoint[] = [
  { labelEn: 'Jan', labelAr: 'يناير', value: 420 },
  { labelEn: 'Feb', labelAr: 'فبراير', value: 680 },
  { labelEn: 'Mar', labelAr: 'مارس', value: 590 },
  { labelEn: 'Apr', labelAr: 'أبريل', value: 840 },
  { labelEn: 'May', labelAr: 'مايو', value: 720 },
  { labelEn: 'Jun', labelAr: 'يونيو', value: 950 },
];

const LINE_ITEMS: LocalizedDataPoint[] = [
  { labelEn: 'Mon', labelAr: 'الإثنين', value: 120 },
  { labelEn: 'Tue', labelAr: 'الثلاثاء', value: 180 },
  { labelEn: 'Wed', labelAr: 'الأربعاء', value: 240 },
  { labelEn: 'Thu', labelAr: 'الخميس', value: 210 },
  { labelEn: 'Fri', labelAr: 'الجمعة', value: 320 },
  { labelEn: 'Sat', labelAr: 'السبت', value: 290 },
  { labelEn: 'Sun', labelAr: 'الأحد', value: 380 },
];

const DONUT_ITEMS: LocalizedDataPoint[] = [
  { labelEn: 'Organic', labelAr: 'عضوي', value: 45 },
  { labelEn: 'Direct', labelAr: 'مباشر', value: 30 },
  { labelEn: 'Referral', labelAr: 'إحالات', value: 15 },
  { labelEn: 'Social', labelAr: 'اجتماعي', value: 10 },
];

function localizePoints(items: LocalizedDataPoint[], isRtl: boolean): ChartDataItem[] {
  return items.map((item) => ({
    label: isRtl ? item.labelAr : item.labelEn,
    value: item.value,
  }));
}

export function ChartGallery({ linkComponent }: ChartGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(true);

  const isRtl = specimenDir === 'rtl';

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setChartType('bar');
    setShowGrid(true);
    setShowLegend(true);
  }, []);

  const barData = useMemo(() => localizePoints(BAR_ITEMS, isRtl), [isRtl]);
  const lineData = useMemo(() => localizePoints(LINE_ITEMS, isRtl), [isRtl]);
  const donutData = useMemo(() => localizePoints(DONUT_ITEMS, isRtl), [isRtl]);

  const activeLegendItems: ChartLegendItem[] = useMemo(() => {
    if (chartType === 'bar') {
      return [{ label: isRtl ? 'الإيرادات' : 'Revenue', color: 'var(--chart-1)' }];
    }
    if (chartType === 'line') {
      return [{ label: isRtl ? 'المستخدمون النشطون' : 'Active Users', color: 'var(--chart-1)' }];
    }
    return DONUT_ITEMS.map((item, idx) => ({
      label: isRtl ? item.labelAr : item.labelEn,
      color: `var(--chart-${idx + 1})`,
      value: `${item.value}%`,
    }));
  }, [chartType, isRtl]);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const typeOptions: StudioSegmentedOption<ChartType>[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'donut', label: 'Donut' },
  ];

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Chart Type', value: chartType },
          { label: 'Gridlines', value: showGrid ? 'true' : 'false' },
          { label: 'Legend', value: showLegend ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & Tokens',
        items: [
          { label: 'Landmark', value: '<figure role="region" aria-label="...">' },
          { label: 'SVG Role', value: 'role="img" + focusable graphics-symbol nodes' },
          { label: 'Screen Readers', value: 'Hidden <table> with row headers and values' },
          { label: 'Palette', value: '--chart-1 through --chart-5' },
        ],
      },
    ],
    [chartType, showGrid, showLegend, specimenDir],
  );

  const jsxSnippet = useMemo(() => {
    if (chartType === 'bar') {
      return `<ChartContainer aria-label="Monthly Revenue">
  <BarChart
    data={[
      { label: 'Jan', value: 420 },
      { label: 'Feb', value: 680 },
      { label: 'Mar', value: 590 },
      { label: 'Apr', value: 840 },
      { label: 'May', value: 720 },
      { label: 'Jun', value: 950 },
    ]}${!showGrid ? '\n    showGrid={false}' : ''}
    formatValue={(v) => \`$\${v}k\`}
  />${
    showLegend ? `\n  <ChartLegend items={[{ label: 'Revenue', color: 'var(--chart-1)' }]} />` : ''
  }
</ChartContainer>`;
    }
    if (chartType === 'line') {
      return `<ChartContainer aria-label="Weekly Active Users">
  <LineChart
    data={[
      { label: 'Mon', value: 120 },
      { label: 'Tue', value: 180 },
      { label: 'Wed', value: 240 },
      { label: 'Thu', value: 210 },
      { label: 'Fri', value: 320 },
      { label: 'Sat', value: 290 },
      { label: 'Sun', value: 380 },
    ]}
    showArea${!showGrid ? '\n    showGrid={false}' : ''}
  />${
    showLegend
      ? `\n  <ChartLegend items={[{ label: 'Active Users', color: 'var(--chart-1)' }]} />`
      : ''
  }
</ChartContainer>`;
    }
    return `<ChartContainer aria-label="Traffic Channels">
  <DonutChart
    data={[
      { label: 'Organic', value: 45 },
      { label: 'Direct', value: 30 },
      { label: 'Referral', value: 15 },
      { label: 'Social', value: 10 },
    ]}
    centerLabel="Total"
    centerValue="100%"
    formatValue={(v) => \`\${v}%\`}
  />${
    showLegend
      ? `\n  <ChartLegend
    items={[
      { label: 'Organic', color: 'var(--chart-1)', value: '45%' },
      { label: 'Direct', color: 'var(--chart-2)', value: '30%' },
      { label: 'Referral', color: 'var(--chart-3)', value: '15%' },
      { label: 'Social', color: 'var(--chart-4)', value: '10%' },
    ]}
  />`
      : ''
  }
</ChartContainer>`;
  }, [chartType, showGrid, showLegend]);

  const aiPrompt = useMemo(() => {
    return `Generate a white-label React ${chartType} chart using White-Label UI Kit:
- Primitives: ChartContainer, ${chartType === 'bar' ? 'BarChart' : chartType === 'line' ? 'LineChart' : 'DonutChart'}${showLegend ? ', ChartLegend' : ''}
- Accessible figure landmark, SVG role="img", keyboard-focusable data points with tooltip inspection, and screen-reader table
- Direction: ${specimenDir.toUpperCase()}`;
  }, [chartType, showLegend, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.chartTypeLabel')}
        value={chartType}
        options={typeOptions}
        onChange={setChartType}
      />

      {chartType !== 'donut' ? (
        <StudioToggleRow
          label={t('common.studio.chartToggleGridlines')}
          checked={showGrid}
          onCheckedChange={setShowGrid}
          testId="toggle-chart-grid"
        />
      ) : null}

      <StudioToggleRow
        label={t('common.studio.chartToggleLegend')}
        checked={showLegend}
        onCheckedChange={setShowLegend}
        testId="toggle-chart-legend"
      />
    </>
  );

  const chartTitleText =
    chartType === 'bar'
      ? isRtl
        ? 'الإيرادات الشهرية'
        : 'Monthly Revenue'
      : chartType === 'line'
        ? isRtl
          ? 'المستخدمون النشطون أسبوعياً'
          : 'Weekly Active Users'
        : isRtl
          ? 'قنوات الزيارات'
          : 'Traffic Channels';

  const kpiSummaryText = chartType === 'bar' ? '$4,200k' : chartType === 'line' ? '1,740' : '100%';

  return (
    <GalleryStudioLayout
      activeRoute="chart"
      title={t('common.studio.chartTitle')}
      subtitle={t('common.studio.chartSubtitle')}
      testId="gallery-chart"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="chart.module.css"
          jsxFileName="chart.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.headerRow}>
            <h3 className={styles.chartTitle}>{chartTitleText}</h3>
            <span className={styles.kpiValue} dir="ltr">
              {kpiSummaryText}
            </span>
          </div>

          <ChartContainer aria-label={chartTitleText} data-testid="interactive-chart">
            {chartType === 'bar' ? (
              <BarChart
                data={barData}
                height={240}
                showGrid={showGrid}
                formatValue={(v) => `$${v}k`}
                aria-label={chartTitleText}
                data-testid="chart-bar"
              />
            ) : null}

            {chartType === 'line' ? (
              <LineChart
                data={lineData}
                height={240}
                showArea
                showGrid={showGrid}
                aria-label={chartTitleText}
                data-testid="chart-line"
              />
            ) : null}

            {chartType === 'donut' ? (
              <DonutChart
                data={donutData}
                size={210}
                centerLabel={isRtl ? 'الإجمالي' : 'Total'}
                centerValue="100%"
                formatValue={(v) => `${v}%`}
                aria-label={chartTitleText}
                data-testid="chart-donut"
              />
            ) : null}

            {showLegend ? (
              <ChartLegend items={activeLegendItems} data-testid="chart-legend" />
            ) : null}
          </ChartContainer>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

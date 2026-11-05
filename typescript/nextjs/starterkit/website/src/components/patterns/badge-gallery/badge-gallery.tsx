'use client';

import {
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import {
  Badge,
  type BadgeShape,
  type BadgeSize,
  type BadgeVariant,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useI18n, useTheme } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './badge-gallery.module.css';

export type BadgeSpecimenDirection = 'ltr' | 'rtl';

export interface BadgeGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function BadgeGallery({ linkComponent }: BadgeGalleryProps) {
  const { t } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<BadgeSpecimenDirection>('ltr');
  const [variant, setVariant] = useState<BadgeVariant>('primary');
  const [size, setSize] = useState<BadgeSize>('md');
  const [shape, setShape] = useState<BadgeShape>('pill');
  const [hasDot, setHasDot] = useState(false);
  const [hasDotPulse, setHasDotPulse] = useState(false);
  const [hasIcon, setHasIcon] = useState(false);
  const [isDismissible, setIsDismissible] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);

  // Interactive filter tags state for showcase
  const [activeTags, setActiveTags] = useState<string[]>([
    'TypeScript',
    'Next.js',
    'CSS Modules',
  ]);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setVariant('primary');
    setSize('md');
    setShape('pill');
    setHasDot(false);
    setHasDotPulse(false);
    setHasIcon(false);
    setIsDismissible(false);
    setIsRemoved(false);
    setActiveTags(['TypeScript', 'Next.js', 'CSS Modules']);
  }, []);

  // Options for segmented controls
  const dirOptions: readonly StudioSegmentedOption<BadgeSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const variantOptions: readonly StudioSegmentedOption<BadgeVariant>[] = [
    { value: 'default', label: 'Default', testId: 'opt-variant-default' },
    { value: 'primary', label: 'Primary', testId: 'opt-variant-primary' },
    { value: 'success', label: 'Success', testId: 'opt-variant-success' },
    { value: 'warning', label: 'Warning', testId: 'opt-variant-warning' },
    { value: 'danger', label: 'Danger', testId: 'opt-variant-danger' },
    { value: 'info', label: 'Info', testId: 'opt-variant-info' },
    { value: 'outline', label: 'Outline', testId: 'opt-variant-outline' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<BadgeSize>[] = [
    { value: 'sm', label: 'SM (20px)', testId: 'opt-size-sm' },
    { value: 'md', label: 'MD (24px)', testId: 'opt-size-md' },
    { value: 'lg', label: 'LG (28px)', testId: 'opt-size-lg' },
  ];

  const shapeOptions: readonly StudioSegmentedOption<BadgeShape>[] = [
    { value: 'pill', label: 'Pill', testId: 'opt-shape-pill' },
    { value: 'rounded', label: 'Rounded', testId: 'opt-shape-rounded' },
  ];

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (variant !== 'default') propsList.push(`variant="${variant}"`);
    if (size !== 'md') propsList.push(`size="${size}"`);
    if (shape !== 'pill') propsList.push(`shape="${shape}"`);
    if (hasDot) propsList.push('dot');
    if (hasDotPulse) propsList.push('dotPulse');
    if (hasIcon) propsList.push('startIcon={<Icon name="feature" />}');
    if (isDismissible) {
      propsList.push('onRemove={() => handleRemove()}');
      propsList.push('removeAriaLabel="Remove item"');
    }

    const formattedProps = propsList.length === 0 ? '' : ` ${propsList.join(' ')}`;
    const label = specimenDir === 'rtl' ? 'نشر نشط' : 'Active Deployment';

    return `<Badge${formattedProps}>\n  ${label}\n</Badge>`;
  }, [variant, size, shape, hasDot, hasDotPulse, hasIcon, isDismissible, specimenDir]);

  const cssModuleSnippet = `/* Custom badge consumer styling */
.badgeContainer {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
}`;

  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label status badge using the kit's pure Badge primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/badge\` directly.
- Variant: ${variant} using semantic status tokens.
- Density: ${size} (${size === 'sm' ? '20px' : size === 'md' ? '24px' : '28px'} minimum block size).
- Shape: ${shape} (${shape === 'pill' ? 'var(--radius-full)' : 'var(--radius-control)'}).
- Tabular Numbers: Numerical counters apply \`font-variant-numeric: tabular-nums\`.
- Zero Dashboard Shadows: 100% shadow-free boundary.
`;
  }, [jsxSnippet, variant, size, shape]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const heightMap: Record<BadgeSize, string> = {
      sm: '20px (1.25rem)',
      md: '24px (1.5rem)',
      lg: '28px (1.75rem)',
    };
    const fontMap: Record<BadgeSize, string> = {
      sm: '12px (--font-size-xs)',
      md: '12px (--font-size-xs)',
      lg: '14px (--font-size-sm)',
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'variant', value: variant },
          { label: 'size', value: size },
          { label: 'shape', value: shape },
          { label: 'dot', value: hasDot ? 'true' : 'false' },
          { label: 'dotPulse', value: hasDotPulse ? 'true' : 'false' },
          { label: 'dismissible', value: isDismissible ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: 'minBlockSize', value: heightMap[size] },
          { label: 'fontSize', value: fontMap[size] },
          { label: 'radius', value: shape === 'pill' ? '9999px (--radius-full)' : '6px (--radius-control)' },
          { label: 'shadowPolicy', value: '100% Shadow-Free (Dashboard)' },
          { label: 'numerals', value: 'font-variant-numeric: tabular-nums' },
        ],
      },
    ];
  }, [variant, size, shape, hasDot, hasDotPulse, isDismissible, t]);

  const activeLabel = specimenDir === 'rtl' ? 'نشر نشط' : 'Active Deployment';

  return (
    <GalleryStudioLayout
      activeRoute="badge"
      title={t('common.studio.badgeTitle') || 'Badge Studio'}
      subtitle={
        t('common.studio.badgeSubtitle') ||
        'Inspect semantic status variants, 3-step density sizing, status dots with pulse animations, tabular counters, and dismissible tags.'
      }
      testId="badge-studio"
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <div className={styles.controlsPanel}>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label="Semantic Variant"
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label="Density Size"
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label="Corner Shape"
            value={shape}
            options={shapeOptions}
            onChange={setShape}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label="Status Dot Indicator"
            checked={hasDot}
            onCheckedChange={setHasDot}
            testId="toggle-badge-dot"
          />

          {hasDot && (
            <StudioToggleRow
              label="Pulse Animation"
              checked={hasDotPulse}
              onCheckedChange={setHasDotPulse}
              testId="toggle-badge-dot-pulse"
            />
          )}

          <StudioToggleRow
            label="Leading Icon Slot"
            checked={hasIcon}
            onCheckedChange={setHasIcon}
            testId="toggle-badge-icon"
          />

          <StudioToggleRow
            label="Dismissible Action Tag"
            checked={isDismissible}
            onCheckedChange={(val) => {
              setIsDismissible(val);
              setIsRemoved(false);
            }}
            testId="toggle-badge-dismissible"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="status-badge.tsx"
          cssFileName="status-badge.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
      >
        {/* Main Specimen Box */}
        <div className={styles.specimenCard}>
          <div className={styles.specimenStage}>
            {!isRemoved ? (
              <Badge
                variant={variant}
                size={size}
                shape={shape}
                dot={hasDot}
                dotPulse={hasDotPulse}
                startIcon={hasIcon ? <Icon name="feature" /> : undefined}
                onRemove={isDismissible ? () => setIsRemoved(true) : undefined}
                removeAriaLabel={specimenDir === 'rtl' ? 'إزالة الشارة' : 'Remove badge'}
              >
                {activeLabel}
              </Badge>
            ) : (
              <button
                type="button"
                className={styles.resetTagBtn}
                onClick={() => setIsRemoved(false)}
              >
                {specimenDir === 'rtl' ? '↺ إعادة إظهار الشارة' : '↺ Restore dismissed badge'}
              </button>
            )}
          </div>
        </div>

        {/* Real-World Production Matrix Showcase */}
        <div className={styles.showcaseSection}>
          <h3 className={styles.showcaseHeading}>
            {specimenDir === 'rtl' ? 'مصفوفة الحالات الواقعية' : 'Real-World Production Matrix'}
          </h3>

          <div className={styles.matrixGrid}>
            {/* 1. All 7 Semantic Variants */}
            <div className={styles.matrixCard}>
              <h4 className={styles.matrixCardTitle}>
                {specimenDir === 'rtl' ? 'الأنماط الدلالية السبعة' : 'All 7 Semantic Variants'}
              </h4>
              <div className={styles.matrixCardContent}>
                <Badge variant="default">{specimenDir === 'rtl' ? 'افتراضي' : 'Default'}</Badge>
                <Badge variant="primary">{specimenDir === 'rtl' ? 'رئيسي' : 'Primary'}</Badge>
                <Badge variant="success">{specimenDir === 'rtl' ? 'ناجح' : 'Success'}</Badge>
                <Badge variant="warning">{specimenDir === 'rtl' ? 'تحذير' : 'Warning'}</Badge>
                <Badge variant="danger">{specimenDir === 'rtl' ? 'خطر' : 'Danger'}</Badge>
                <Badge variant="info">{specimenDir === 'rtl' ? 'معلومات' : 'Info'}</Badge>
                <Badge variant="outline">{specimenDir === 'rtl' ? 'مخطط' : 'Outline'}</Badge>
              </div>
            </div>

            {/* 2. Sizing Scale */}
            <div className={styles.matrixCard}>
              <h4 className={styles.matrixCardTitle}>
                {specimenDir === 'rtl' ? 'سلم المقاسات' : 'Density Scale (sm / md / lg)'}
              </h4>
              <div className={styles.matrixCardContent}>
                <Badge size="sm" variant="primary">SM 20px</Badge>
                <Badge size="md" variant="primary">MD 24px</Badge>
                <Badge size="lg" variant="primary">LG 28px</Badge>
              </div>
            </div>

            {/* 3. Status Indicators with Pulse */}
            <div className={styles.matrixCard}>
              <h4 className={styles.matrixCardTitle}>
                {specimenDir === 'rtl' ? 'مؤشرات الحالة النابضة' : 'Status Dots & Live Pulse'}
              </h4>
              <div className={styles.matrixCardContent}>
                <Badge variant="success" dot dotPulse>
                  {specimenDir === 'rtl' ? 'قيد التشغيل' : 'Operational'}
                </Badge>
                <Badge variant="warning" dot>
                  {specimenDir === 'rtl' ? 'تدهور جزئي' : 'Degraded'}
                </Badge>
                <Badge variant="danger" dot>
                  {specimenDir === 'rtl' ? 'متوقف' : 'Outage'}
                </Badge>
                <Badge variant="info" dot dotPulse>
                  {specimenDir === 'rtl' ? 'جاري البناء' : 'Building'}
                </Badge>
              </div>
            </div>

            {/* 4. Tabular Numerical Counters */}
            <div className={styles.matrixCard}>
              <h4 className={styles.matrixCardTitle}>
                {specimenDir === 'rtl' ? 'عدادات الأرقام المجدولة' : 'Tabular Numerical Counters'}
              </h4>
              <div className={styles.matrixCardContent}>
                <Badge variant="default" size="sm">3</Badge>
                <Badge variant="primary" size="sm">42</Badge>
                <Badge variant="danger" size="sm">99+</Badge>
                <Badge variant="outline" size="md">1,280</Badge>
              </div>
            </div>

            {/* 5. Removable Tag Filters */}
            <div className={styles.matrixCard}>
              <h4 className={styles.matrixCardTitle}>
                {specimenDir === 'rtl' ? 'وسوم التصفية القابلة للحذف' : 'Dismissible Filter Tags'}
              </h4>
              <div className={styles.matrixCardContent}>
                {activeTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    shape="rounded"
                    onRemove={() =>
                      setActiveTags((prev) => prev.filter((t) => t !== tag))
                    }
                    removeAriaLabel={`Remove ${tag} filter`}
                  >
                    {tag}
                  </Badge>
                ))}
                {activeTags.length === 0 && (
                  <button
                    type="button"
                    className={styles.resetTagBtn}
                    onClick={() =>
                      setActiveTags(['TypeScript', 'Next.js', 'CSS Modules'])
                    }
                  >
                    {specimenDir === 'rtl' ? '↺ إعادة تعيين الوسوم' : '↺ Reset filters'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

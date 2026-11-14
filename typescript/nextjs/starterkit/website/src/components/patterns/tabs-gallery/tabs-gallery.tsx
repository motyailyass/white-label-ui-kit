'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  type TabsActivationMode,
  type TabsOrientation,
  type TabsSize,
  type TabsVariant,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  translate,
  type SupportedLocale,
  type TranslationKey,
} from '@/i18n';
import { cn } from '@/lib/cn';
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
import styles from './tabs-gallery.module.css';

export type TabsSpecimenDirection = 'ltr' | 'rtl';
export type TabsStageView = 'single' | 'matrix';
export type TabsScenario = 'default' | 'badges' | 'icons';

export interface TabsGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function TabsGallery({ linkComponent }: TabsGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<TabsSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<TabsStageView>('single');
  const [scenario, setScenario] = useState<TabsScenario>('default');
  const [variant, setVariant] = useState<TabsVariant>('line');
  const [size, setSize] = useState<TabsSize>('md');
  const [orientation, setOrientation] = useState<TabsOrientation>('horizontal');
  const [activationMode, setActivationMode] = useState<TabsActivationMode>('automatic');
  const [fullWidth, setFullWidth] = useState(false);

  // Active Tab state per composition
  const [activeDefaultTab, setActiveDefaultTab] = useState('overview');
  const [activeBadgeTab, setActiveBadgeTab] = useState('all');
  const [activeIconTab, setActiveIconTab] = useState('general');

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setScenario('default');
    setVariant('line');
    setSize('md');
    setOrientation('horizontal');
    setActivationMode('automatic');
    setFullWidth(false);
    setActiveDefaultTab('overview');
    setActiveBadgeTab('all');
    setActiveIconTab('general');
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Controls Options
  const dirOptions: readonly StudioSegmentedOption<TabsSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<TabsStageView>[] = [
    { value: 'single', label: t('common.studio.tabsViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.tabsViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const scenarioOptions: readonly StudioSegmentedOption<TabsScenario>[] = [
    { value: 'default', label: t('common.studio.tabsScenarioDefault'), testId: 'opt-scen-default' },
    { value: 'badges', label: t('common.studio.tabsScenarioBadges'), testId: 'opt-scen-badges' },
    { value: 'icons', label: t('common.studio.tabsScenarioIcons'), testId: 'opt-scen-icons' },
  ];

  const variantOptions: readonly StudioSegmentedOption<TabsVariant>[] = [
    { value: 'line', label: t('common.studio.tabsVariantLine'), testId: 'opt-var-line' },
    { value: 'segment', label: t('common.studio.tabsVariantSegment'), testId: 'opt-var-segment' },
    {
      value: 'enclosed',
      label: t('common.studio.tabsVariantEnclosed'),
      testId: 'opt-var-enclosed',
    },
  ];

  const sizeOptions: readonly StudioSegmentedOption<TabsSize>[] = [
    { value: 'sm', label: t('common.studio.tabsSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.tabsSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.tabsSizeLg'), testId: 'opt-size-lg' },
  ];

  const orientationOptions: readonly StudioSegmentedOption<TabsOrientation>[] = [
    {
      value: 'horizontal',
      label: t('common.studio.tabsOrientationHorizontal'),
      testId: 'opt-orient-horizontal',
    },
    {
      value: 'vertical',
      label: t('common.studio.tabsOrientationVertical'),
      testId: 'opt-orient-vertical',
    },
  ];

  const activationOptions: readonly StudioSegmentedOption<TabsActivationMode>[] = [
    { value: 'automatic', label: t('common.studio.tabsActivationAuto'), testId: 'opt-act-auto' },
    { value: 'manual', label: t('common.studio.tabsActivationManual'), testId: 'opt-act-manual' },
  ];

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (variant !== 'line') propsList.push(`variant="${variant}"`);
    if (size !== 'md') propsList.push(`size="${size}"`);
    if (orientation !== 'horizontal') propsList.push(`orientation="${orientation}"`);
    if (activationMode !== 'automatic') propsList.push(`activationMode="${activationMode}"`);

    const formattedProps = propsList.length === 0 ? '' : ` ${propsList.join(' ')}`;
    const fullWidthProp = fullWidth ? ' fullWidth' : '';

    if (scenario === 'badges') {
      return `<Tabs defaultValue="${activeBadgeTab}"${formattedProps}>
  <TabsList${fullWidthProp} aria-label="${specimenT('common.studio.tabsListAriaBadges')}">
    <TabsTrigger value="all">
      <span>${specimenT('common.studio.tabsTabAll')}</span>
      <Badge variant="default" size="sm">128</Badge>
    </TabsTrigger>
    <TabsTrigger value="active">
      <span>${specimenT('common.studio.tabsTabActive')}</span>
      <Badge variant="primary" size="sm">94</Badge>
    </TabsTrigger>
    <TabsTrigger value="pending">
      <span>${specimenT('common.studio.tabsTabPending')}</span>
      <Badge variant="warning" size="sm">22</Badge>
    </TabsTrigger>
  </TabsList>
  <TabsContent value="${activeBadgeTab}">
    {/* ${activeBadgeTab} */}
  </TabsContent>
</Tabs>`;
    }

    if (scenario === 'icons') {
      return `<Tabs defaultValue="${activeIconTab}"${formattedProps}>
  <TabsList${fullWidthProp} aria-label="${specimenT('common.studio.tabsListAriaIcons')}">
    <TabsTrigger value="general" startIcon={<Icon name="sliders" />}>
      ${specimenT('common.studio.tabsTabGeneral')}
    </TabsTrigger>
    <TabsTrigger value="security" startIcon={<Icon name="feature" />}>
      ${specimenT('common.studio.tabsTabSecurity')}
    </TabsTrigger>
    <TabsTrigger value="notifications" startIcon={<Icon name="inbox" />}>
      <span>${specimenT('common.studio.tabsTabNotifications')}</span>
      <Badge variant="danger" size="sm" dot>3</Badge>
    </TabsTrigger>
  </TabsList>
  <TabsContent value="${activeIconTab}">
    {/* ${activeIconTab} */}
  </TabsContent>
</Tabs>`;
    }

    return `<Tabs defaultValue="${activeDefaultTab}"${formattedProps}>
  <TabsList${fullWidthProp} aria-label="${specimenT('common.studio.tabsListAriaDefault')}">
    <TabsTrigger value="overview">${specimenT('common.studio.tabsTabOverview')}</TabsTrigger>
    <TabsTrigger value="details">${specimenT('common.studio.tabsTabDetails')}</TabsTrigger>
    <TabsTrigger value="activity">${specimenT('common.studio.tabsTabActivity')}</TabsTrigger>
    <TabsTrigger value="settings">${specimenT('common.studio.tabsTabSettings')}</TabsTrigger>
  </TabsList>
  <TabsContent value="${activeDefaultTab}">
    {/* ${activeDefaultTab} */}
  </TabsContent>
</Tabs>`;
  }, [
    scenario,
    variant,
    size,
    orientation,
    activationMode,
    fullWidth,
    activeBadgeTab,
    activeIconTab,
    activeDefaultTab,
    specimenT,
  ]);

  const cssModuleSnippet = `/* Custom tab container styling */
.customTabsContainer {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  inline-size: 100%;
}`;

  const aiAgentPrompt = useMemo(() => {
    return `Implement an accessible tabs navigation system using the kit's pure Tabs primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/tabs\` compound exports directly.
- Composition: ${scenario}.
- Variant: ${variant} using semantic surface and indicator tokens.
- Control Sizing Scale: ${size} (--control-height-${size}, --control-padding-${size}, --control-font-size-${size}).
- Orientation: ${orientation} with WAI-ARIA roving tabindex and RTL-aware arrow navigation.
- Zero Dashboard Shadows: 100% shadow-free boundary; separation strictly via borders and surfaces.
- Logical Properties: 100% CSS logical padding and compartment boundaries.
`;
  }, [jsxSnippet, scenario, variant, size, orientation]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const sizeMap: Record<TabsSize, string> = {
      sm: '32px (--control-height-sm)',
      md: '36px (--control-height-md)',
      lg: '40px (--control-height-lg)',
    };
    const variantMap: Record<TabsVariant, string> = {
      line: '2px var(--color-primary)',
      segment: 'var(--color-surface-subtle) + var(--color-surface)',
      enclosed: 'var(--color-surface) + var(--color-border-subtle)',
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.tabsSpecScenario'), value: scenario },
          { label: t('common.studio.tabsSpecVariant'), value: variant },
          { label: t('common.studio.tabsSpecSize'), value: size },
          { label: t('common.studio.tabsSpecOrientation'), value: orientation },
          { label: t('common.studio.tabsSpecActivation'), value: activationMode },
          {
            label: t('common.studio.tabsSpecFullWidth'),
            value: fullWidth
              ? t('common.studio.tabsSpecBoolTrue')
              : t('common.studio.tabsSpecBoolFalse'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.tabsSpecVariantToken'), value: variantMap[variant] },
          { label: t('common.studio.tabsSpecSizingToken'), value: sizeMap[size] },
          { label: t('common.studio.tabsSpecRadiusRole'), value: 'var(--radius-control)' },
          {
            label: t('common.studio.tabsSpecFocusRing'),
            value: 'var(--focus-ring-width) solid var(--color-border-focus)',
          },
          {
            label: t('common.studio.tabsSpecShadowPolicy'),
            value: t('common.studio.tabsSpecShadowValue'),
          },
        ],
      },
    ];
  }, [scenario, variant, size, orientation, activationMode, fullWidth, t]);

  return (
    <GalleryStudioLayout
      activeRoute="tabs"
      title={t('common.studio.tabsTitle')}
      subtitle={t('common.studio.tabsSubtitle')}
      testId="tabs-studio"
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
            label={t('common.studio.tabsViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.tabsScenarioLabel')}
            value={scenario}
            options={scenarioOptions}
            onChange={setScenario}
          />

          <StudioSegmentedControl
            label={t('common.studio.tabsVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label={t('common.studio.tabsSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.tabsOrientationLabel')}
            value={orientation}
            options={orientationOptions}
            onChange={setOrientation}
          />

          <StudioSegmentedControl
            label={t('common.studio.tabsActivationLabel')}
            value={activationMode}
            options={activationOptions}
            onChange={setActivationMode}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.tabsFullWidthLabel')}
            checked={fullWidth}
            onCheckedChange={setFullWidth}
            testId="toggle-full-width"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="dashboard-tabs.tsx"
          cssFileName="dashboard-tabs.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              {scenario === 'default' && (
                <Tabs
                  value={activeDefaultTab}
                  onValueChange={setActiveDefaultTab}
                  variant={variant}
                  size={size}
                  orientation={orientation}
                  activationMode={activationMode}
                  className={styles.fullWidth}
                  data-testid="studio-tabs"
                >
                  <TabsList
                    fullWidth={fullWidth}
                    aria-label={specimenT('common.studio.tabsListAriaDefault')}
                  >
                    <TabsTrigger value="overview">
                      {specimenT('common.studio.tabsTabOverview')}
                    </TabsTrigger>
                    <TabsTrigger value="details">
                      {specimenT('common.studio.tabsTabDetails')}
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                      {specimenT('common.studio.tabsTabActivity')}
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                      {specimenT('common.studio.tabsTabSettings')}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelOverviewTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelOverviewDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="details">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelDetailsTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelDetailsDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelActivityTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelActivityDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="settings">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelSettingsTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelSettingsDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {scenario === 'badges' && (
                <Tabs
                  value={activeBadgeTab}
                  onValueChange={setActiveBadgeTab}
                  variant={variant}
                  size={size}
                  orientation={orientation}
                  activationMode={activationMode}
                  className={styles.fullWidth}
                  data-testid="studio-tabs"
                >
                  <TabsList
                    fullWidth={fullWidth}
                    aria-label={specimenT('common.studio.tabsListAriaBadges')}
                  >
                    <TabsTrigger value="all">
                      <span>{specimenT('common.studio.tabsTabAll')}</span>
                      <Badge variant="default" size="sm">
                        <BidiText dir="ltr">128</BidiText>
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      <span>{specimenT('common.studio.tabsTabActive')}</span>
                      <Badge variant="primary" size="sm">
                        <BidiText dir="ltr">94</BidiText>
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                      <span>{specimenT('common.studio.tabsTabPending')}</span>
                      <Badge variant="warning" size="sm">
                        <BidiText dir="ltr">22</BidiText>
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelAllTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelAllDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="active">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelActiveTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelActiveDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="pending">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelPendingTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelPendingDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {scenario === 'icons' && (
                <Tabs
                  value={activeIconTab}
                  onValueChange={setActiveIconTab}
                  variant={variant}
                  size={size}
                  orientation={orientation}
                  activationMode={activationMode}
                  className={styles.fullWidth}
                  data-testid="studio-tabs"
                >
                  <TabsList
                    fullWidth={fullWidth}
                    aria-label={specimenT('common.studio.tabsListAriaIcons')}
                  >
                    <TabsTrigger value="general" startIcon={<Icon name="sliders" />}>
                      {specimenT('common.studio.tabsTabGeneral')}
                    </TabsTrigger>
                    <TabsTrigger value="security" startIcon={<Icon name="feature" />}>
                      {specimenT('common.studio.tabsTabSecurity')}
                    </TabsTrigger>
                    <TabsTrigger value="notifications" startIcon={<Icon name="inbox" />}>
                      <span>{specimenT('common.studio.tabsTabNotifications')}</span>
                      <Badge variant="danger" size="sm" dot>
                        <BidiText dir="ltr">3</BidiText>
                      </Badge>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="general">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelGeneralTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelGeneralDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="security">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelSecurityTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelSecurityDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>

                  <TabsContent value="notifications">
                    <Card variant="subtle" padding="md">
                      <CardHeader>
                        <CardTitle as="h4">
                          {specimenT('common.studio.tabsPanelNotificationsTitle')}
                        </CardTitle>
                        <CardDescription>
                          {specimenT('common.studio.tabsPanelNotificationsDesc')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.matrixContainer} data-testid="tabs-matrix-grid">
            <section className={styles.matrixGroup} aria-labelledby="tabs-variants-heading">
              <h3 id="tabs-variants-heading" className={styles.matrixGroupTitle}>
                {specimenT('common.studio.tabsMatrixVariantsTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                {(['line', 'segment', 'enclosed'] as const).map((varItem) => (
                  <div key={varItem} className={styles.matrixCard}>
                    <p className={styles.matrixCardLabel}>
                      <BidiText dir="ltr">{`variant="${varItem}"`}</BidiText>
                    </p>
                    <Tabs defaultValue="a" variant={varItem} size="sm">
                      <TabsList aria-label={varItem}>
                        <TabsTrigger value="a">
                          {specimenT('common.studio.tabsTabOverview')}
                        </TabsTrigger>
                        <TabsTrigger value="b">
                          {specimenT('common.studio.tabsTabDetails')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.matrixGroup} aria-labelledby="tabs-sizes-heading">
              <h3 id="tabs-sizes-heading" className={styles.matrixGroupTitle}>
                {specimenT('common.studio.tabsMatrixSizesTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                {(['sm', 'md', 'lg'] as const).map((sizeItem) => (
                  <div key={sizeItem} className={styles.matrixCard}>
                    <p className={styles.matrixCardLabel}>
                      <BidiText dir="ltr">{`size="${sizeItem}"`}</BidiText>
                    </p>
                    <Tabs defaultValue="a" variant={variant} size={sizeItem}>
                      <TabsList aria-label={sizeItem}>
                        <TabsTrigger value="a">
                          {specimenT('common.studio.tabsTabOverview')}
                        </TabsTrigger>
                        <TabsTrigger value="b">
                          {specimenT('common.studio.tabsTabDetails')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

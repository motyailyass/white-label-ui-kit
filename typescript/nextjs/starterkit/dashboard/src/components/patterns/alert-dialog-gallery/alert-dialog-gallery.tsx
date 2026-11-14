'use client';

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Icon, type IconName } from '@/components/icons';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  type AlertDialogFooterBackground,
  type AlertDialogFooterLayout,
  AlertDialogHeader,
  AlertDialogMedia,
  type AlertDialogMediaVariant,
  type AlertDialogSize,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  translate,
  type SupportedLocale,
  type TranslationKey,
} from '@/i18n';
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
import styles from './alert-dialog-gallery.module.css';

export type AlertDialogSpecimenDirection = 'ltr' | 'rtl';
export type AlertDialogStageView = 'single' | 'matrix';
export type AlertDialogScenario = 'delete' | 'revoke' | 'discard';
export type AlertDialogActionVariant = 'danger' | 'primary' | 'secondary';
export type AlertDialogSeparators = 'default' | 'both' | 'none' | 'header-only';

export interface AlertDialogGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const MATRIX_SCENARIOS: readonly {
  scenario: AlertDialogScenario;
  mediaVariant: AlertDialogMediaVariant;
  actionVariant: AlertDialogActionVariant;
}[] = [
  { scenario: 'delete', mediaVariant: 'danger', actionVariant: 'danger' },
  { scenario: 'revoke', mediaVariant: 'warning', actionVariant: 'danger' },
  { scenario: 'discard', mediaVariant: 'info', actionVariant: 'primary' },
];

const MATRIX_LAYOUTS: readonly {
  layout: AlertDialogFooterLayout;
  background: AlertDialogFooterBackground;
  label: string;
}[] = [
  { layout: 'split', background: 'seamless', label: 'layout="split" · seamless' },
  { layout: 'end', background: 'docked', label: 'layout="end" · docked' },
  { layout: 'stacked', background: 'seamless', label: 'layout="stacked" · seamless' },
  { layout: 'between', background: 'docked', label: 'layout="between" · docked' },
];

function getScenarioIconName(scenario: AlertDialogScenario): IconName {
  switch (scenario) {
    case 'delete':
      return 'danger';
    case 'revoke':
      return 'warning';
    case 'discard':
      return 'info-circle';
  }
}

export function AlertDialogGallery({ linkComponent }: AlertDialogGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const scenariosHeadingId = useId();
  const layoutsHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<AlertDialogSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<AlertDialogStageView>('single');
  const [scenario, setScenario] = useState<AlertDialogScenario>('delete');
  const [size, setSize] = useState<AlertDialogSize>('md');
  const [actionVariant, setActionVariant] = useState<AlertDialogActionVariant>('danger');
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [headerAlign, setHeaderAlign] = useState<'start' | 'center'>('start');
  const [separators, setSeparators] = useState<AlertDialogSeparators>('none');
  const [footerLayout, setFooterLayout] = useState<AlertDialogFooterLayout>('split');
  const [footerBackground, setFooterBackground] = useState<AlertDialogFooterBackground>('seamless');
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const isRtl = specimenDir === 'rtl';
  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const hasHeaderSeparator = separators === 'both' || separators === 'header-only';
  const hasFooterSeparator = separators === 'default' || separators === 'both';

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setScenario('delete');
    setSize('md');
    setActionVariant('danger');
    setShowIcon(true);
    setHeaderAlign('start');
    setSeparators('none');
    setFooterLayout('split');
    setFooterBackground('seamless');
    setLastAction(null);
  }, [direction]);

  const handleScenarioChange = useCallback((newScenario: AlertDialogScenario) => {
    setScenario(newScenario);
    if (newScenario === 'delete' || newScenario === 'revoke') {
      setActionVariant('danger');
    } else {
      setActionVariant('primary');
    }
  }, []);

  // Controls options
  const dirOptions: readonly StudioSegmentedOption<AlertDialogSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<AlertDialogStageView>[] = [
    { value: 'single', label: t('common.studio.alertDialogViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.alertDialogViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const scenarioOptions: readonly StudioSegmentedOption<AlertDialogScenario>[] = [
    {
      value: 'delete',
      label: t('common.studio.alertDialogScenarioDelete'),
      testId: 'opt-scen-delete',
    },
    {
      value: 'revoke',
      label: t('common.studio.alertDialogScenarioRevoke'),
      testId: 'opt-scen-revoke',
    },
    {
      value: 'discard',
      label: t('common.studio.alertDialogScenarioDiscard'),
      testId: 'opt-scen-discard',
    },
  ];

  const sizeOptions: readonly StudioSegmentedOption<AlertDialogSize>[] = [
    { value: 'sm', label: t('common.studio.alertDialogSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.alertDialogSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.alertDialogSizeLg'), testId: 'opt-size-lg' },
  ];

  const variantOptions: readonly StudioSegmentedOption<AlertDialogActionVariant>[] = [
    {
      value: 'danger',
      label: t('common.studio.alertDialogVariantDanger'),
      testId: 'opt-var-danger',
    },
    {
      value: 'primary',
      label: t('common.studio.alertDialogVariantPrimary'),
      testId: 'opt-var-primary',
    },
    {
      value: 'secondary',
      label: t('common.studio.alertDialogVariantSecondary'),
      testId: 'opt-var-secondary',
    },
  ];

  const separatorOptions: readonly StudioSegmentedOption<AlertDialogSeparators>[] = [
    { value: 'none', label: t('common.studio.alertDialogSepNone'), testId: 'opt-sep-none' },
    {
      value: 'default',
      label: t('common.studio.alertDialogSepDefault'),
      testId: 'opt-sep-default',
    },
    {
      value: 'header-only',
      label: t('common.studio.alertDialogSepHeader'),
      testId: 'opt-sep-header',
    },
    { value: 'both', label: t('common.studio.alertDialogSepBoth'), testId: 'opt-sep-both' },
  ];

  const footerLayoutOptions: readonly StudioSegmentedOption<AlertDialogFooterLayout>[] = [
    {
      value: 'split',
      label: t('common.studio.alertDialogLayoutSplit'),
      testId: 'opt-layout-split',
    },
    { value: 'end', label: t('common.studio.alertDialogLayoutEnd'), testId: 'opt-layout-end' },
    {
      value: 'stacked',
      label: t('common.studio.alertDialogLayoutStacked'),
      testId: 'opt-layout-stacked',
    },
    {
      value: 'between',
      label: t('common.studio.alertDialogLayoutBetween'),
      testId: 'opt-layout-between',
    },
  ];

  const footerBgOptions: readonly StudioSegmentedOption<AlertDialogFooterBackground>[] = [
    {
      value: 'seamless',
      label: t('common.studio.alertDialogBgSeamless'),
      testId: 'opt-bg-seamless',
    },
    { value: 'docked', label: t('common.studio.alertDialogBgDocked'), testId: 'opt-bg-docked' },
  ];

  const alignOptions: readonly StudioSegmentedOption<'start' | 'center'>[] = [
    { value: 'start', label: t('common.studio.alertDialogAlignStart'), testId: 'opt-align-start' },
    {
      value: 'center',
      label: t('common.studio.alertDialogAlignCenter'),
      testId: 'opt-align-center',
    },
  ];

  const renderScenarioTitle = useCallback(
    (targetScenario: AlertDialogScenario): ReactNode => {
      switch (targetScenario) {
        case 'delete':
          return specimenT('common.studio.alertDialogDeleteTitle');
        case 'revoke':
          return specimenT('common.studio.alertDialogRevokeTitle');
        case 'discard':
          return specimenT('common.studio.alertDialogDiscardTitle');
      }
    },
    [specimenT],
  );

  const renderScenarioDescription = useCallback(
    (targetScenario: AlertDialogScenario): ReactNode => {
      switch (targetScenario) {
        case 'delete':
          return specimenT('common.studio.alertDialogDeleteDesc');
        case 'revoke':
          return (
            <>
              {specimenT('common.studio.alertDialogRevokeDescBefore')}
              <BidiText dir="ltr">HTTP 401 Unauthorized</BidiText>
              {specimenT('common.studio.alertDialogRevokeDescAfter')}
            </>
          );
        case 'discard':
          return (
            <>
              {specimenT('common.studio.alertDialogDiscardDescBefore')}
              <BidiText dir="ltr">4</BidiText>
              {specimenT('common.studio.alertDialogDiscardDescAfter')}
            </>
          );
      }
    },
    [specimenT],
  );

  const renderScenarioConfirmLabel = useCallback(
    (targetScenario: AlertDialogScenario): string => {
      switch (targetScenario) {
        case 'delete':
          return specimenT('common.studio.alertDialogDeleteConfirm');
        case 'revoke':
          return specimenT('common.studio.alertDialogRevokeConfirm');
        case 'discard':
          return specimenT('common.studio.alertDialogDiscardConfirm');
      }
    },
    [specimenT],
  );

  const handleConfirmScenario = useCallback(
    (targetScenario: AlertDialogScenario) => {
      const key: TranslationKey =
        targetScenario === 'delete'
          ? 'common.studio.alertDialogStatusDeleted'
          : targetScenario === 'revoke'
            ? 'common.studio.alertDialogStatusRevoked'
            : 'common.studio.alertDialogStatusDiscarded';
      setLastAction(specimenT(key));
    },
    [specimenT],
  );

  // Dynamic JSX snippet
  const jsxSnippet = useMemo(() => {
    const sizeProp = size !== 'md' ? ` size="${size}"` : '';
    const variantProp = actionVariant !== 'danger' ? ` variant="${actionVariant}"` : '';
    const alignProp = headerAlign !== 'start' ? ` align="${headerAlign}"` : '';
    const headerSepProp = hasHeaderSeparator ? ' separator={true}' : '';
    const footerLayoutProp = footerLayout !== 'end' ? ` layout="${footerLayout}"` : '';
    const footerBgProp = footerBackground !== 'seamless' ? ` background="${footerBackground}"` : '';
    const defaultFooterSep = footerBackground === 'docked';
    const footerSepProp =
      hasFooterSeparator !== defaultFooterSep ? ` separator={${hasFooterSeparator}}` : '';

    const mediaVariant =
      actionVariant === 'danger' ? 'danger' : actionVariant === 'secondary' ? 'warning' : 'info';
    const mediaIcon =
      actionVariant === 'danger'
        ? 'danger'
        : actionVariant === 'secondary'
          ? 'warning'
          : 'info-circle';

    const iconSnippet = showIcon
      ? `      <AlertDialogMedia variant="${mediaVariant}">\n        <Icon name="${mediaIcon}" />\n      </AlertDialogMedia>\n`
      : '';

    return `<AlertDialog>
  <AlertDialogTrigger as={Button} variant="${actionVariant}">
    {triggerLabel}
  </AlertDialogTrigger>
  <AlertDialogContent${sizeProp}>
    <AlertDialogHeader${alignProp}${headerSepProp}>
${iconSnippet}      <AlertDialogTitle>{title}</AlertDialogTitle>
      <AlertDialogDescription>{description}</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter${footerLayoutProp}${footerBgProp}${footerSepProp}>
      <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
      <AlertDialogAction${variantProp} onClick={handleConfirm}>
        {confirmLabel}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>`;
  }, [
    size,
    actionVariant,
    headerAlign,
    hasHeaderSeparator,
    footerLayout,
    footerBackground,
    hasFooterSeparator,
    showIcon,
  ]);

  // CSS Module snippet
  const cssModuleSnippet = useMemo(
    () => `/* Scoped overrides if custom dimensions are required */
.customAlertDialog {
  --_dialog-max-width: ${size === 'sm' ? '24rem' : size === 'lg' ? '36rem' : '30rem'};
}`,
    [size],
  );

  // AI Agent Prompt
  const aiAgentPrompt = useMemo(
    () =>
      `Build a critical confirmation flow using @/components/ui AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, and AlertDialogAction. Use size="${size}", actionVariant="${actionVariant}", footerLayout="${footerLayout}", headerSeparator=${hasHeaderSeparator}, footerSeparator=${hasFooterSeparator}, localized strings via t(), <BidiText dir="ltr"> around technical codes, and zero box-shadows on Dashboard.`,
    [size, actionVariant, footerLayout, hasHeaderSeparator, hasFooterSeparator],
  );

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.alertDialogSpecArchGroup'),
        items: [
          {
            label: t('common.studio.alertDialogSpecPrimitive'),
            value: '@/components/ui/alert-dialog',
          },
          {
            label: t('common.studio.alertDialogSpecRole'),
            value: 'role="alertdialog" (aria-modal="true")',
          },
          { label: t('common.studio.alertDialogSpecFooterLayout'), value: footerLayout },
          { label: t('common.studio.alertDialogSpecSeparators'), value: separators },
          { label: t('common.studio.alertDialogSpecHeaderAlign'), value: headerAlign },
          {
            label: t('common.studio.alertDialogSpecStatusIcon'),
            value: showIcon
              ? t('common.studio.alertDialogSpecIconEnabled')
              : t('common.studio.alertDialogSpecIconDisabled'),
          },
          {
            label: t('common.studio.alertDialogSpecInitialFocus'),
            value: t('common.studio.alertDialogSpecFocusCancel'),
          },
          { label: t('common.studio.alertDialogSpecThemeMode'), value: resolvedTheme },
        ],
      },
      {
        title: t('common.studio.alertDialogSpecTokensGroup'),
        items: [
          {
            label: t('common.studio.alertDialogSpecSurfaceRole'),
            value: 'var(--color-surface-raised)',
          },
          { label: t('common.studio.alertDialogSpecFooterSurface'), value: 'var(--color-surface)' },
          {
            label: t('common.studio.alertDialogSpecBorderRole'),
            value: 'var(--color-border-subtle)',
          },
          { label: t('common.studio.alertDialogSpecBackdropRole'), value: 'var(--color-overlay)' },
          { label: t('common.studio.alertDialogSpecRadiusRole'), value: 'var(--radius-dialog)' },
          {
            label: t('common.studio.alertDialogSpecWidthTokens'),
            value: 'sm: 24rem, md: 30rem, lg: 36rem',
          },
        ],
      },
    ];
  }, [footerLayout, separators, headerAlign, showIcon, resolvedTheme, t]);

  return (
    <GalleryStudioLayout
      activeRoute="alert-dialog"
      title={t('common.studio.alertDialogTitle')}
      subtitle={t('common.studio.alertDialogSubtitle')}
      testId="alert-dialog-studio"
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
            label={t('common.studio.alertDialogViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.alertDialogFooterLayoutLabel')}
                value={footerLayout}
                options={footerLayoutOptions}
                onChange={setFooterLayout}
                columns={2}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogFooterBgLabel')}
                value={footerBackground}
                options={footerBgOptions}
                onChange={setFooterBackground}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogSeparatorsLabel')}
                value={separators}
                options={separatorOptions}
                onChange={setSeparators}
                columns={2}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogAlignLabel')}
                value={headerAlign}
                options={alignOptions}
                onChange={setHeaderAlign}
              />

              <StudioToggleRow
                label={t('common.studio.alertDialogToggleIcon')}
                checked={showIcon}
                onCheckedChange={setShowIcon}
                testId="toggle-status-icon"
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogScenarioLabel')}
                value={scenario}
                options={scenarioOptions}
                onChange={handleScenarioChange}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogSizeLabel')}
                value={size}
                options={sizeOptions}
                onChange={setSize}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertDialogVariantLabel')}
                value={actionVariant}
                options={variantOptions}
                onChange={setActionVariant}
              />
            </>
          )}
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          specGroups={specGroups}
          jsxFileName="delete-confirmation-dialog.tsx"
          cssFileName="delete-confirmation-dialog.module.css"
        />
      }
    >
      <div
        dir={specimenDir}
        lang={specimenLangAttr}
        className={cn(styles.canvasArea, isRtl && styles.canvasRtl)}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              {/* Live In-Canvas Surface Inspection */}
              <div
                className={styles.inlineCard}
                data-size={size}
                data-testid="inline-alert-dialog-card"
              >
                <AlertDialogHeader align={headerAlign} separator={hasHeaderSeparator}>
                  {showIcon && (
                    <AlertDialogMedia
                      variant={
                        scenario === 'delete'
                          ? 'danger'
                          : scenario === 'revoke'
                            ? 'warning'
                            : 'info'
                      }
                    >
                      <Icon name={getScenarioIconName(scenario)} />
                    </AlertDialogMedia>
                  )}
                  <AlertDialogTitle>{renderScenarioTitle(scenario)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {renderScenarioDescription(scenario)}
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter
                  layout={footerLayout}
                  background={footerBackground}
                  separator={hasFooterSeparator}
                >
                  <AlertDialogCancel
                    onClick={() =>
                      setLastAction(specimenT('common.studio.alertDialogStatusCancelled'))
                    }
                  >
                    {specimenT('common.studio.alertDialogCancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant={actionVariant}
                    onClick={() => handleConfirmScenario(scenario)}
                  >
                    {renderScenarioConfirmLabel(scenario)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </div>

              {/* Browser Top-Layer Modal Trigger */}
              <div className={styles.triggerModalBar}>
                <AlertDialog
                  onOpenChange={(open, details) => {
                    if (!open && details && details.reason === 'escape') {
                      setLastAction(
                        `${specimenT('common.studio.alertDialogStatusClosedVia')} ${details.reason}`,
                      );
                    }
                  }}
                >
                  <AlertDialogTrigger
                    as={Button}
                    variant={scenario === 'discard' ? 'secondary' : 'danger'}
                    data-testid="open-alert-dialog-btn"
                  >
                    {specimenT('common.studio.alertDialogOpenModalBtn')}
                  </AlertDialogTrigger>

                  <AlertDialogContent
                    size={size}
                    dir={specimenDir}
                    lang={specimenLangAttr}
                    data-testid="specimen-alert-dialog"
                  >
                    <AlertDialogHeader align={headerAlign} separator={hasHeaderSeparator}>
                      {showIcon && (
                        <AlertDialogMedia
                          variant={
                            scenario === 'delete'
                              ? 'danger'
                              : scenario === 'revoke'
                                ? 'warning'
                                : 'info'
                          }
                        >
                          <Icon name={getScenarioIconName(scenario)} />
                        </AlertDialogMedia>
                      )}
                      <AlertDialogTitle>{renderScenarioTitle(scenario)}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {renderScenarioDescription(scenario)}
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter
                      layout={footerLayout}
                      background={footerBackground}
                      separator={hasFooterSeparator}
                    >
                      <AlertDialogCancel
                        data-testid="specimen-cancel-btn"
                        onClick={() =>
                          setLastAction(specimenT('common.studio.alertDialogStatusCancelled'))
                        }
                      >
                        {specimenT('common.studio.alertDialogCancel')}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        variant={actionVariant}
                        data-testid="specimen-action-btn"
                        onClick={() => handleConfirmScenario(scenario)}
                      >
                        {renderScenarioConfirmLabel(scenario)}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {lastAction && (
                  <span className={styles.lastActionStatus} data-testid="last-action-indicator">
                    {lastAction}
                  </span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.matrixContainer} data-testid="alert-dialog-matrix-grid">
            <section className={styles.matrixGroup} aria-labelledby={scenariosHeadingId}>
              <h2 id={scenariosHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.alertDialogMatrixScenariosHeading')}
              </h2>
              <div className={styles.matrixGrid}>
                {MATRIX_SCENARIOS.map((entry) => (
                  <div key={entry.scenario} className={styles.matrixCard}>
                    <span className={styles.matrixCardLabel} dir="ltr">
                      {`${entry.scenario} · media="${entry.mediaVariant}"`}
                    </span>
                    <div
                      className={styles.matrixInlineSurface}
                      data-testid={`matrix-scenario-${entry.scenario}`}
                    >
                      <AlertDialogHeader align="start" separator={false}>
                        <AlertDialogMedia variant={entry.mediaVariant}>
                          <Icon name={getScenarioIconName(entry.scenario)} />
                        </AlertDialogMedia>
                        <AlertDialogTitle>{renderScenarioTitle(entry.scenario)}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {renderScenarioDescription(entry.scenario)}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter layout="end" background="seamless" separator={false}>
                        <AlertDialogCancel>
                          {specimenT('common.studio.alertDialogCancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant={entry.actionVariant}>
                          {renderScenarioConfirmLabel(entry.scenario)}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.matrixGroup} aria-labelledby={layoutsHeadingId}>
              <h2 id={layoutsHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.alertDialogMatrixLayoutsHeading')}
              </h2>
              <div className={styles.matrixGrid}>
                {MATRIX_LAYOUTS.map((entry) => (
                  <div key={entry.layout} className={styles.matrixCard}>
                    <span className={styles.matrixCardLabel} dir="ltr">
                      {entry.label}
                    </span>
                    <div
                      className={styles.matrixInlineSurface}
                      data-testid={`matrix-layout-${entry.layout}`}
                    >
                      <AlertDialogHeader align="start" separator={false}>
                        <AlertDialogTitle>{renderScenarioTitle('delete')}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {renderScenarioDescription('delete')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter
                        layout={entry.layout}
                        background={entry.background}
                        separator={entry.background === 'docked'}
                      >
                        <AlertDialogCancel>
                          {specimenT('common.studio.alertDialogCancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction variant="danger">
                          {renderScenarioConfirmLabel('delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
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

'use client';

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Button,
  type AlertSize,
  type AlertStatus,
  type AlertVariant,
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
import styles from './alert-gallery.module.css';

export type AlertSpecimenDirection = 'ltr' | 'rtl';
export type AlertStageView = 'single' | 'matrix';

export interface AlertGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const ALL_STATUSES: readonly AlertStatus[] = ['info', 'success', 'warning', 'danger'];
const ALL_VARIANTS: readonly AlertVariant[] = ['subtle', 'bordered', 'solid'];
const ALL_SIZES: readonly AlertSize[] = ['sm', 'md', 'lg'];

export function AlertGallery({ linkComponent }: AlertGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const variantsHeadingId = useId();
  const sizesHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<AlertSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<AlertStageView>('single');
  const [status, setStatus] = useState<AlertStatus>('warning');
  const [variant, setVariant] = useState<AlertVariant>('subtle');
  const [size, setSize] = useState<AlertSize>('md');
  const [dismissible, setDismissible] = useState<boolean>(true);
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [showAction, setShowAction] = useState<boolean>(true);
  const [isSpecimenOpen, setIsSpecimenOpen] = useState<boolean>(true);

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

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setStatus('warning');
    setVariant('subtle');
    setSize('md');
    setDismissible(true);
    setShowIcon(true);
    setShowAction(true);
    setIsSpecimenOpen(true);
  }, [direction]);

  const handleStatusChange = useCallback((nextStatus: AlertStatus) => {
    setStatus(nextStatus);
    setIsSpecimenOpen(true);
  }, []);

  const handleVariantChange = useCallback((nextVariant: AlertVariant) => {
    setVariant(nextVariant);
    setIsSpecimenOpen(true);
  }, []);

  const handleSizeChange = useCallback((nextSize: AlertSize) => {
    setSize(nextSize);
    setIsSpecimenOpen(true);
  }, []);

  // Controls Options
  const dirOptions: readonly StudioSegmentedOption<AlertSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<AlertStageView>[] = [
    { value: 'single', label: t('common.studio.alertViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.alertViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const statusOptions: readonly StudioSegmentedOption<AlertStatus>[] = [
    { value: 'info', label: t('common.studio.alertStatusInfo'), testId: 'opt-status-info' },
    {
      value: 'success',
      label: t('common.studio.alertStatusSuccess'),
      testId: 'opt-status-success',
    },
    {
      value: 'warning',
      label: t('common.studio.alertStatusWarning'),
      testId: 'opt-status-warning',
    },
    { value: 'danger', label: t('common.studio.alertStatusDanger'), testId: 'opt-status-danger' },
  ];

  const variantOptions: readonly StudioSegmentedOption<AlertVariant>[] = [
    { value: 'subtle', label: t('common.studio.alertVariantSubtle'), testId: 'opt-var-subtle' },
    {
      value: 'bordered',
      label: t('common.studio.alertVariantBordered'),
      testId: 'opt-var-bordered',
    },
    { value: 'solid', label: t('common.studio.alertVariantSolid'), testId: 'opt-var-solid' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<AlertSize>[] = [
    { value: 'sm', label: t('common.studio.alertSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.alertSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.alertSizeLg'), testId: 'opt-size-lg' },
  ];

  const renderScenarioContent = useCallback(
    (scenarioStatus: AlertStatus, includeAction: boolean): ReactNode => {
      switch (scenarioStatus) {
        case 'warning':
          return (
            <>
              <AlertTitle>{specimenT('common.studio.alertWarnTitle')}</AlertTitle>
              <AlertDescription>
                {specimenT('common.studio.alertWarnDescBefore')}
                <BidiText dir="ltr">84%</BidiText>
                {specimenT('common.studio.alertWarnDescAfter')}
              </AlertDescription>
              {includeAction && (
                <AlertAction>
                  <Button variant="secondary" size="sm">
                    {specimenT('common.studio.alertWarnAction')}
                  </Button>
                </AlertAction>
              )}
            </>
          );
        case 'danger':
          return (
            <>
              <AlertTitle>{specimenT('common.studio.alertDangerTitle')}</AlertTitle>
              <AlertDescription>{specimenT('common.studio.alertDangerDesc')}</AlertDescription>
              {includeAction && (
                <AlertAction>
                  <Button variant="secondary" size="sm">
                    {specimenT('common.studio.alertDangerAction')}
                  </Button>
                </AlertAction>
              )}
            </>
          );
        case 'success':
          return (
            <>
              <AlertTitle>{specimenT('common.studio.alertSuccessTitle')}</AlertTitle>
              <AlertDescription>{specimenT('common.studio.alertSuccessDesc')}</AlertDescription>
              {includeAction && (
                <AlertAction>
                  <Button variant="secondary" size="sm">
                    {specimenT('common.studio.alertSuccessAction')}
                  </Button>
                </AlertAction>
              )}
            </>
          );
        case 'info':
          return (
            <>
              <AlertTitle>{specimenT('common.studio.alertInfoTitle')}</AlertTitle>
              <AlertDescription>
                {specimenT('common.studio.alertInfoDescBefore')}
                <BidiText dir="ltr">02:00–04:00 UTC</BidiText>
                {specimenT('common.studio.alertInfoDescAfter')}
              </AlertDescription>
              {includeAction && (
                <AlertAction>
                  <Button variant="secondary" size="sm">
                    {specimenT('common.studio.alertInfoAction')}
                  </Button>
                </AlertAction>
              )}
            </>
          );
      }
    },
    [specimenT],
  );

  // Code Inspector Payloads
  const jsxSnippet = useMemo(() => {
    const props = [
      `status="${status}"`,
      `variant="${variant}"`,
      `size="${size}"`,
      dismissible ? `dismissible closeLabel={t('common.studio.alertCloseLabel')}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  AlertAction,
  Button,
} from '@/components/ui';

<Alert ${props}>
  ${showIcon ? '<AlertIcon />\n  ' : ''}<div className={styles.bodyStack}>
    <AlertTitle>{title}</AlertTitle>
    <AlertDescription>{description}</AlertDescription>${
      showAction
        ? `\n    <AlertAction>\n      <Button variant="secondary" size="sm">{actionLabel}</Button>\n    </AlertAction>`
        : ''
    }
  </div>
</Alert>`;
  }, [status, variant, size, dismissible, showIcon, showAction]);

  const cssModuleSnippet = useMemo(
    () => `.alertContainer {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1 1 0%;
  min-inline-size: 0;
  border-radius: var(--radius-card);
  padding-block: var(--space-3);
  padding-inline: var(--space-4);
}`,
    [],
  );

  const aiAgentPrompt = useMemo(
    () =>
      `Build a reusable NotificationAlert wrapper using @/components/ui Alert, AlertIcon, AlertTitle, AlertDescription, AlertAction, and Button. Use status="${status}", variant="${variant}", size="${size}", dismissible=${dismissible}, localized closeLabel via t(), RTL-safe CSS logical properties, and <BidiText dir="ltr"> around technical numbers.`,
    [status, variant, size, dismissible],
  );

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    const roleValue = status === 'danger' ? 'alert' : 'status';
    const liveValue = status === 'danger' ? 'assertive' : 'polite';
    const surfaceValue =
      variant === 'solid'
        ? `--color-${status} (${resolvedTheme})`
        : variant === 'bordered'
          ? `var(--color-surface) + var(--color-${status})`
          : `var(--color-${status}-subtle)`;

    return [
      {
        title: t('common.studio.alertSpecA11yGroup'),
        items: [
          { label: t('common.studio.alertSpecRole'), value: roleValue },
          { label: t('common.studio.alertSpecLiveRegion'), value: liveValue },
          { label: t('common.studio.alertSpecLabelledBy'), value: 'react-useId-linked' },
          { label: t('common.studio.alertSpecDismissible'), value: String(dismissible) },
        ],
      },
      {
        title: t('common.studio.alertSpecTokensGroup'),
        items: [
          {
            label: t('common.studio.alertSpecShadowPolicy'),
            value: t('common.studio.alertSpecShadowValue'),
          },
          { label: t('common.studio.alertSpecSurfaceRole'), value: surfaceValue },
          { label: t('common.studio.alertSpecRadiusRole'), value: 'var(--radius-card)' },
          {
            label: t('common.studio.alertSpecLogicalProps'),
            value: 'padding-block, padding-inline, margin-inline',
          },
        ],
      },
    ];
  }, [status, variant, dismissible, resolvedTheme, t]);

  return (
    <GalleryStudioLayout
      activeRoute="alert"
      title={t('common.studio.alertTitle')}
      subtitle={t('common.studio.alertSubtitle')}
      testId="alert-studio"
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
            label={t('common.studio.alertViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.alertStatusLabel')}
                value={status}
                options={statusOptions}
                onChange={handleStatusChange}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertVariantLabel')}
                value={variant}
                options={variantOptions}
                onChange={handleVariantChange}
              />

              <StudioSegmentedControl
                label={t('common.studio.alertSizeLabel')}
                value={size}
                options={sizeOptions}
                onChange={handleSizeChange}
              />
            </>
          )}

          <StudioToggleRow
            label={t('common.studio.alertToggleDismissible')}
            checked={dismissible}
            onCheckedChange={(checked) => {
              setDismissible(checked);
              if (!checked) setIsSpecimenOpen(true);
            }}
            testId="toggle-dismissible"
          />

          <StudioToggleRow
            label={t('common.studio.alertToggleIcon')}
            checked={showIcon}
            onCheckedChange={setShowIcon}
            testId="toggle-icon"
          />

          <StudioToggleRow
            label={t('common.studio.alertToggleAction')}
            checked={showAction}
            onCheckedChange={setShowAction}
            testId="toggle-action"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          specGroups={specGroups}
          jsxFileName="status-alert.tsx"
          cssFileName="status-alert.module.css"
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
              <Alert
                status={status}
                variant={variant}
                size={size}
                open={isSpecimenOpen}
                onOpenChange={setIsSpecimenOpen}
                dismissible={dismissible}
                closeLabel={specimenT('common.studio.alertCloseLabel')}
                data-testid="studio-alert"
                className={styles.fullWidth}
              >
                {showIcon && <AlertIcon />}
                <div className={styles.bodyStack}>{renderScenarioContent(status, showAction)}</div>
              </Alert>

              {!isSpecimenOpen && (
                <div className={styles.reopenBar} data-testid="alert-reopen-bar">
                  <p className={styles.reopenNotice}>
                    {specimenT('common.studio.alertDismissedNotice')}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsSpecimenOpen(true)}
                    data-testid="alert-reopen-btn"
                  >
                    {specimenT('common.studio.alertReopenButton')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.matrixContainer} data-testid="alert-matrix-grid">
            <section className={styles.matrixGroup} aria-labelledby={variantsHeadingId}>
              <h2 id={variantsHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.alertMatrixVariantsHeading')}
              </h2>
              <div className={styles.matrixGrid}>
                {ALL_STATUSES.map((matrixStatus) =>
                  ALL_VARIANTS.map((matrixVariant) => (
                    <div key={`${matrixStatus}-${matrixVariant}`} className={styles.matrixCard}>
                      <span className={styles.matrixCardLabel} dir="ltr">
                        {`${matrixStatus} / ${matrixVariant}`}
                      </span>
                      <Alert
                        status={matrixStatus}
                        variant={matrixVariant}
                        size="md"
                        dismissible={dismissible}
                        closeLabel={specimenT('common.studio.alertCloseLabel')}
                        data-testid={`matrix-alert-${matrixStatus}-${matrixVariant}`}
                        className={styles.fullWidth}
                      >
                        {showIcon && <AlertIcon />}
                        <div className={styles.bodyStack}>
                          {renderScenarioContent(matrixStatus, showAction)}
                        </div>
                      </Alert>
                    </div>
                  )),
                )}
              </div>
            </section>

            <section className={styles.matrixGroup} aria-labelledby={sizesHeadingId}>
              <h2 id={sizesHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.alertMatrixSizesHeading')}
              </h2>
              <div className={styles.matrixGrid}>
                {ALL_SIZES.map((matrixSize) => (
                  <div key={matrixSize} className={styles.matrixCard}>
                    <span className={styles.matrixCardLabel} dir="ltr">
                      {`size="${matrixSize}"`}
                    </span>
                    <Alert
                      status="info"
                      variant="bordered"
                      size={matrixSize}
                      dismissible={dismissible}
                      closeLabel={specimenT('common.studio.alertCloseLabel')}
                      data-testid={`matrix-size-${matrixSize}`}
                      className={styles.fullWidth}
                    >
                      {showIcon && <AlertIcon />}
                      <div className={styles.bodyStack}>
                        {renderScenarioContent('info', showAction)}
                      </div>
                    </Alert>
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

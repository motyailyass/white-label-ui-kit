'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
  Radio,
} from '@/components/ui';
import { defaultMessages, translate, type SupportedLocale, type TranslationKey } from '@/i18n';
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
import styles from './popover-gallery.module.css';

export type PopoverTriggerKind = 'button' | 'icon' | 'chip';
export type PopoverContentMode = 'form' | 'info';
export type PopoverSpecimenDirection = 'ltr' | 'rtl';
export type PopoverPlacementOption =
  | 'bottom-start'
  | 'bottom'
  | 'bottom-end'
  | 'top-start'
  | 'top'
  | 'top-end'
  | 'inline-start'
  | 'inline-end';
export type PopoverStageView = 'single' | 'all-placements';
export type PopoverOffsetOption = '4' | '8' | '12';
export type PopoverMaxWidth = '280' | '340' | '420';

export interface PopoverGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function PopoverGallery({ linkComponent }: PopoverGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();
  const baseId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<PopoverSpecimenDirection>(direction);
  const [triggerKind, setTriggerKind] = useState<PopoverTriggerKind>('button');
  const [contentMode, setContentMode] = useState<PopoverContentMode>('info');
  const [placement, setPlacement] = useState<PopoverPlacementOption>('bottom-start');
  const [offsetStr, setOffsetStr] = useState<PopoverOffsetOption>('8');
  const [stageView, setStageView] = useState<PopoverStageView>('single');
  const [hasHeader, setHasHeader] = useState(false);
  const [hasFooter, setHasFooter] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [modalRole, setModalRole] = useState(false);
  const [autoFlip, setAutoFlip] = useState(true);
  const [maxWidth, setMaxWidth] = useState<PopoverMaxWidth>('340');
  const [studioOpen, setStudioOpen] = useState(false);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  // Specimen Dynamic Form State
  const [selectedEnv, setSelectedEnv] = useState<'production' | 'staging' | 'sandbox'>(
    'production',
  );

  // Multi-placement grid states
  const [gridOpenTop, setGridOpenTop] = useState(false);
  const [gridOpenBottom, setGridOpenBottom] = useState(false);
  const [gridOpenStart, setGridOpenStart] = useState(false);
  const [gridOpenEnd, setGridOpenEnd] = useState(false);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setTriggerKind('button');
    setContentMode('info');
    setPlacement('bottom-start');
    setOffsetStr('8');
    setStageView('single');
    setHasHeader(false);
    setHasFooter(false);
    setShowClose(false);
    setModalRole(false);
    setAutoFlip(true);
    setMaxWidth('340');
    setStudioOpen(false);
    setSelectedEnv('production');
  }, [direction]);

  const handleContentModeChange = useCallback((nextMode: PopoverContentMode) => {
    setContentMode(nextMode);
    setModalRole(nextMode === 'form');
  }, []);

  const dirOptions: readonly StudioSegmentedOption<PopoverSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const triggerKindOptions: readonly StudioSegmentedOption<PopoverTriggerKind>[] = [
    {
      value: 'button',
      label: t('common.studio.popoverTriggerButton'),
      testId: 'opt-trig-button',
    },
    {
      value: 'icon',
      label: t('common.studio.popoverTriggerIcon'),
      testId: 'opt-trig-icon',
    },
    {
      value: 'chip',
      label: t('common.studio.popoverTriggerChip'),
      testId: 'opt-trig-chip',
    },
  ];

  const contentModeOptions: readonly StudioSegmentedOption<PopoverContentMode>[] = [
    {
      value: 'info',
      label: t('common.studio.popoverContentInfo'),
      testId: 'opt-mode-info',
    },
    {
      value: 'form',
      label: t('common.studio.popoverContentForm'),
      testId: 'opt-mode-form',
    },
  ];

  const placementOptions: readonly StudioSegmentedOption<PopoverPlacementOption>[] = useMemo(
    () => [
      {
        value: 'bottom-start',
        label: t('common.studio.popoverPlaceBottomStart'),
        testId: 'opt-place-bs',
      },
      { value: 'bottom', label: t('common.studio.popoverPlaceBottom'), testId: 'opt-place-bc' },
      {
        value: 'bottom-end',
        label: t('common.studio.popoverPlaceBottomEnd'),
        testId: 'opt-place-be',
      },
      {
        value: 'top-start',
        label: t('common.studio.popoverPlaceTopStart'),
        testId: 'opt-place-ts',
      },
      { value: 'top', label: t('common.studio.popoverPlaceTop'), testId: 'opt-place-tc' },
      { value: 'top-end', label: t('common.studio.popoverPlaceTopEnd'), testId: 'opt-place-te' },
      {
        value: 'inline-start',
        label: t('common.studio.popoverPlaceInlineStart'),
        testId: 'opt-place-is',
      },
      {
        value: 'inline-end',
        label: t('common.studio.popoverPlaceInlineEnd'),
        testId: 'opt-place-ie',
      },
    ],
    [t],
  );

  const offsetOptions: readonly StudioSegmentedOption<PopoverOffsetOption>[] = [
    { value: '4', label: '4px', testId: 'opt-offset-4' },
    { value: '8', label: '8px', testId: 'opt-offset-8' },
    { value: '12', label: '12px', testId: 'opt-offset-12' },
  ];

  const viewOptions: readonly StudioSegmentedOption<PopoverStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    {
      value: 'all-placements',
      label: t('common.studio.popoverViewAllPlacements'),
      testId: 'opt-view-all-placements',
    },
  ];

  const maxWidthOptions: readonly StudioSegmentedOption<PopoverMaxWidth>[] = [
    { value: '280', label: '280px', testId: 'opt-w-280' },
    { value: '340', label: '340px', testId: 'opt-w-340' },
    { value: '420', label: '420px', testId: 'opt-w-420' },
  ];

  const effectiveRole = modalRole ? 'dialog' : 'none';
  const parsedOffset = parseInt(offsetStr, 10);
  const parsedMaxWidth = parseInt(maxWidth, 10);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const triggerLabel =
    contentMode === 'form'
      ? specimenT('common.studio.popoverTriggerFilter')
      : specimenT('common.studio.popoverTriggerInfo');

  const popoverTitleText =
    contentMode === 'form'
      ? specimenT('common.studio.popoverTitleFilter')
      : specimenT('common.studio.popoverTitleInfo');

  const popoverDescText =
    contentMode === 'form'
      ? specimenT('common.studio.popoverDescFilter')
      : specimenT('common.studio.popoverDescInfo');

  const closeLabelText = specimenT('common.studio.popoverCloseBtnAria');
  const cancelLabelText = specimenT('common.cancel');
  const saveLabelText = specimenT('common.save');

  // Dynamic code snippets
  const jsxSnippet = useMemo(() => {
    const uiImports = [
      triggerKind !== 'chip' || hasFooter ? 'Button' : null,
      'Popover',
      'PopoverBody',
      showClose || hasFooter ? 'PopoverClose' : null,
      'PopoverContent',
      hasHeader ? 'PopoverDescription' : null,
      hasFooter ? 'PopoverFooter' : null,
      hasHeader ? 'PopoverHeader' : null,
      hasHeader ? 'PopoverTitle' : null,
      'PopoverTrigger',
    ].filter((name): name is string => Boolean(name));

    const needsIconImport = triggerKind === 'icon' || triggerKind === 'chip';
    const imports = [
      `import { ${uiImports.join(', ')} } from '@/components/ui';`,
      needsIconImport ? `import { Icon } from '@/components/icons';` : null,
      triggerKind === 'chip' ? `import styles from './my-popover-panel.module.css';` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const propsList: string[] = [];
    if (placement !== 'bottom-start') propsList.push(`placement="${placement}"`);
    if (offsetStr !== '8') propsList.push(`offset={${offsetStr}}`);
    if (!autoFlip) propsList.push('autoFlip={false}');

    const popoverProps = propsList.length > 0 ? ` ${propsList.join(' ')}` : '';
    const roleAttr = modalRole ? ` role="dialog" aria-label="${popoverTitleText}"` : '';
    const widthAttr = maxWidth !== '340' ? ` maxWidth={${maxWidth}}` : '';

    const triggerMarkup =
      triggerKind === 'icon'
        ? `<Button variant="secondary" iconOnly aria-label="${triggerLabel}">
      <Icon name="sliders" />
    </Button>`
        : triggerKind === 'chip'
          ? `<button type="button" className={styles.actionPill}>
      <Icon name="sliders" size={14} />
      <span>${triggerLabel}</span>
    </button>`
          : `<Button variant="primary">${triggerLabel}</Button>`;

    const contentChildren = [
      showClose ? `    <PopoverClose closeLabel="${closeLabelText}" />` : null,
      hasHeader
        ? `    <PopoverHeader>
      <PopoverTitle>${popoverTitleText}</PopoverTitle>
      <PopoverDescription>${popoverDescText}</PopoverDescription>
    </PopoverHeader>`
        : null,
      `    <PopoverBody>
      {/* ${contentMode === 'form' ? 'Interactive form controls' : 'Contextual disclosure content'} */}
    </PopoverBody>`,
      hasFooter
        ? `    <PopoverFooter>
      <PopoverClose asChild>
        <Button variant="secondary" size="sm">${cancelLabelText}</Button>
      </PopoverClose>
      <Button variant="primary" size="sm">${saveLabelText}</Button>
    </PopoverFooter>`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `${imports}

<Popover${popoverProps}>
  <PopoverTrigger asChild>
    ${triggerMarkup}
  </PopoverTrigger>
  <PopoverContent${roleAttr}${widthAttr}>
${contentChildren}
  </PopoverContent>
</Popover>`;
  }, [
    placement,
    offsetStr,
    autoFlip,
    modalRole,
    popoverTitleText,
    popoverDescText,
    maxWidth,
    triggerKind,
    triggerLabel,
    hasHeader,
    hasFooter,
    showClose,
    contentMode,
    closeLabelText,
    cancelLabelText,
    saveLabelText,
  ]);

  const cssModuleSnippet = useMemo(() => {
    if (triggerKind !== 'chip') return null;
    return `.actionPill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding-inline: var(--space-3);
  padding-block: var(--space-1);
  border-radius: var(--radius-full);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-control);
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}`;
  }, [triggerKind]);

  const aiAgentPrompt = useMemo(
    () => `Generate an accessible non-modal Popover component using the UI Kit Popover primitive.
Requirements:
- Native HTML Popover top-layer positioning (popover="auto") with coordinate anchoring and CSS fallback layer var(--z-overlay)
- placement="${placement}", offset={${offsetStr}}, autoFlip={${autoFlip}}, dir="${specimenDir}"
- maxWidth={${maxWidth}}
- role="${effectiveRole}" (${modalRole ? 'focuses first interactive element on open' : 'keeps focus on trigger'})
- Zero external libraries; purely consumes token contracts and CSS logical properties
- 100% shadow-free in dashboard routes; visual depth via --color-surface-raised and --color-border-subtle`,
    [placement, offsetStr, autoFlip, specimenDir, maxWidth, effectiveRole, modalRole],
  );

  const specGroups: readonly StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.popoverSpecCategoryAnchoring'),
        items: [
          { label: t('common.studio.popoverSpecLayer'), value: '--z-overlay (300) / Top Layer' },
          { label: t('common.studio.popoverSpecPlacement'), value: placement },
          { label: t('common.studio.popoverSpecOffset'), value: `${offsetStr}px` },
          {
            label: t('common.studio.popoverSpecAutoFlip'),
            value: autoFlip ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          { label: t('common.studio.popoverSpecWritingMode'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          {
            label: t('common.studio.popoverSpecRole'),
            value:
              effectiveRole === 'dialog'
                ? t('common.studio.popoverSpecRoleDialog')
                : t('common.studio.popoverSpecRoleNone'),
          },
          {
            label: t('common.studio.popoverSpecTrigger'),
            value:
              triggerKind === 'icon'
                ? t('common.studio.popoverTriggerIcon')
                : triggerKind === 'chip'
                  ? t('common.studio.popoverTriggerChip')
                  : t('common.studio.popoverTriggerButton'),
          },
          { label: t('common.studio.popoverSpecMaxWidth'), value: `${maxWidth}px` },
          {
            label: t('common.studio.popoverSpecSlots'),
            value: `${hasHeader ? t('common.studio.popoverSpecHasHeader') : t('common.studio.popoverSpecNoHeader')} / ${hasFooter ? t('common.studio.popoverSpecHasFooter') : t('common.studio.popoverSpecNoFooter')} / ${showClose ? t('common.studio.popoverSpecHasClose') : t('common.studio.popoverSpecNoClose')}`,
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.popoverSpecSurface'), value: 'var(--color-surface-raised)' },
          {
            label: t('common.studio.specRadius'),
            value: t('common.studio.popoverSpecRadiusValue'),
          },
          {
            label: t('common.studio.popoverSpecShadowPolicy'),
            value: t('common.studio.popoverSpecShadowValue'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryEnv'),
        items: [
          { label: t('common.studio.specTheme'), value: resolvedTheme },
          { label: t('common.studio.specLocale'), value: locale },
          { label: t('common.studio.specDirection'), value: direction.toUpperCase() },
        ],
      },
    ],
    [
      t,
      placement,
      offsetStr,
      autoFlip,
      specimenDir,
      effectiveRole,
      triggerKind,
      maxWidth,
      hasHeader,
      hasFooter,
      showClose,
      resolvedTheme,
      locale,
      direction,
    ],
  );

  const renderTriggerElement = () => {
    if (triggerKind === 'icon') {
      return (
        <Button
          variant="secondary"
          iconOnly
          aria-label={triggerLabel}
          data-testid="studio-active-popover-trigger"
        >
          <Icon name="sliders" />
        </Button>
      );
    }

    if (triggerKind === 'chip') {
      return (
        <button
          type="button"
          className={styles.actionPill}
          data-testid="studio-active-popover-trigger"
        >
          <Icon name="sliders" size={14} />
          <span>{triggerLabel}</span>
        </button>
      );
    }

    return (
      <Button variant="primary" data-testid="studio-active-popover-trigger">
        {triggerLabel}
      </Button>
    );
  };

  const renderPopoverBodyContent = () => {
    if (contentMode === 'info') {
      return <p className={styles.surfaceText}>{specimenT('common.studio.popoverInfoBody')}</p>;
    }

    return (
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{specimenT('common.studio.popoverFilterEnv')}</legend>
        <div className={styles.fieldRow}>
          <Radio
            id={`${baseId}-env-prod`}
            name={`${baseId}-env`}
            value="production"
            checked={selectedEnv === 'production'}
            onChange={() => setSelectedEnv('production')}
            data-testid="filter-env-prod-radio"
          />
          <label htmlFor={`${baseId}-env-prod`} className={styles.label}>
            {specimenT('common.studio.popoverFilterEnvProd')}
          </label>
        </div>
        <div className={styles.fieldRow}>
          <Radio
            id={`${baseId}-env-staging`}
            name={`${baseId}-env`}
            value="staging"
            checked={selectedEnv === 'staging'}
            onChange={() => setSelectedEnv('staging')}
            data-testid="filter-env-staging-radio"
          />
          <label htmlFor={`${baseId}-env-staging`} className={styles.label}>
            {specimenT('common.studio.popoverFilterEnvStaging')}
          </label>
        </div>
        <div className={styles.fieldRow}>
          <Radio
            id={`${baseId}-env-sandbox`}
            name={`${baseId}-env`}
            value="sandbox"
            checked={selectedEnv === 'sandbox'}
            onChange={() => setSelectedEnv('sandbox')}
            data-testid="filter-env-sandbox-radio"
          />
          <label htmlFor={`${baseId}-env-sandbox`} className={styles.label}>
            {specimenT('common.studio.popoverFilterEnvSandbox')}
          </label>
        </div>
      </fieldset>
    );
  };

  const roleProps =
    effectiveRole === 'dialog'
      ? { role: 'dialog' as const, 'aria-label': popoverTitleText }
      : { role: 'none' as const };

  return (
    <GalleryStudioLayout
      activeRoute="popover"
      title={t('common.studio.popoverTitle')}
      subtitle={t('common.studio.popoverSubtitle')}
      testId="popover-gallery"
      radiusPreset="preset"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.popoverTriggerKindLabel')}
            value={triggerKind}
            options={triggerKindOptions}
            onChange={setTriggerKind}
          />

          <StudioSegmentedControl
            label={t('common.studio.popoverContentTypeLabel')}
            value={contentMode}
            options={contentModeOptions}
            onChange={handleContentModeChange}
          />

          <StudioSegmentedControl
            label={t('common.studio.popoverPlacementLabel')}
            value={placement}
            options={placementOptions}
            onChange={setPlacement}
          />

          <StudioSegmentedControl
            label={t('common.studio.popoverOffsetLabel')}
            value={offsetStr}
            options={offsetOptions}
            onChange={setOffsetStr}
          />

          <StudioSegmentedControl
            label={t('common.studio.popoverCanvasViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.popoverHeaderToggle')}
            checked={hasHeader}
            onCheckedChange={setHasHeader}
            testId="toggle-popover-header"
          />

          <StudioToggleRow
            label={t('common.studio.popoverFooterToggle')}
            checked={hasFooter}
            onCheckedChange={setHasFooter}
            testId="toggle-popover-footer"
          />

          <StudioToggleRow
            label={t('common.studio.popoverCloseToggle')}
            checked={showClose}
            onCheckedChange={setShowClose}
            testId="toggle-popover-close"
          />

          <StudioToggleRow
            label={t('common.studio.popoverDialogRoleToggle')}
            checked={modalRole}
            onCheckedChange={setModalRole}
            testId="toggle-popover-dialog-role"
          />

          <StudioToggleRow
            label={t('common.studio.popoverAutoFlipToggle')}
            checked={autoFlip}
            onCheckedChange={setAutoFlip}
            testId="toggle-popover-autoflip"
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.popoverMaxWidthLabel')}
            value={maxWidth}
            options={maxWidthOptions}
            onChange={setMaxWidth}
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-popover-panel.tsx"
          cssFileName="my-popover-panel.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        <p className={styles.stageHelpText}>{t('common.studio.popoverStageHint')}</p>

        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow} lang={specimenLangAttr}>
            <Popover
              placement={placement}
              offset={parsedOffset}
              autoFlip={autoFlip}
              role={effectiveRole}
              open={studioOpen}
              onOpenChange={setStudioOpen}
            >
              <PopoverTrigger asChild>{renderTriggerElement()}</PopoverTrigger>
              <PopoverContent
                {...roleProps}
                maxWidth={parsedMaxWidth}
                data-testid="studio-active-popover-content"
              >
                {showClose && (
                  <PopoverClose
                    closeLabel={closeLabelText}
                    data-testid="studio-popover-close-btn"
                  />
                )}

                {hasHeader && (
                  <PopoverHeader>
                    <PopoverTitle>{popoverTitleText}</PopoverTitle>
                    <PopoverDescription>{popoverDescText}</PopoverDescription>
                  </PopoverHeader>
                )}

                <PopoverBody>{renderPopoverBodyContent()}</PopoverBody>

                {hasFooter && (
                  <PopoverFooter>
                    <PopoverClose asChild>
                      <Button variant="secondary" size="sm" data-testid="studio-popover-cancel-btn">
                        {cancelLabelText}
                      </Button>
                    </PopoverClose>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setStudioOpen(false)}
                      data-testid="studio-popover-apply-btn"
                    >
                      {saveLabelText}
                    </Button>
                  </PopoverFooter>
                )}
              </PopoverContent>
            </Popover>
          </div>
        ) : (
          <div className={styles.allPlacementsGrid} lang={specimenLangAttr}>
            {[
              {
                p: 'top' as const,
                open: gridOpenTop,
                setOpen: setGridOpenTop,
                labelKey: 'common.studio.popoverPlaceTop' as const,
              },
              {
                p: 'bottom' as const,
                open: gridOpenBottom,
                setOpen: setGridOpenBottom,
                labelKey: 'common.studio.popoverPlaceBottom' as const,
              },
              {
                p: 'inline-start' as const,
                open: gridOpenStart,
                setOpen: setGridOpenStart,
                labelKey: 'common.studio.popoverPlaceInlineStart' as const,
              },
              {
                p: 'inline-end' as const,
                open: gridOpenEnd,
                setOpen: setGridOpenEnd,
                labelKey: 'common.studio.popoverPlaceInlineEnd' as const,
              },
            ].map(({ p, open, setOpen, labelKey }) => (
              <div key={p} className={styles.placementCard}>
                <span className={styles.placementCardLabel} dir="ltr">
                  placement=&quot;{p}&quot;
                </span>
                <Popover
                  placement={p}
                  offset={parsedOffset}
                  autoFlip={autoFlip}
                  role={effectiveRole}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      data-testid={`studio-placement-trigger-${p}`}
                    >
                      {specimenT(labelKey)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    {...roleProps}
                    maxWidth={280}
                    data-testid={`studio-placement-content-${p}`}
                  >
                    <PopoverBody>
                      <p className={styles.surfaceText}>
                        {specimenT('common.studio.popoverPlacementCardBody')}{' '}
                        <code dir="ltr">{p}</code>
                      </p>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </div>
            ))}
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

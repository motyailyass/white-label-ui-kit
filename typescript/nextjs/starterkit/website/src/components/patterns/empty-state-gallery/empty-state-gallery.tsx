'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  type EmptyStateIconVariant,
  type EmptyStateSize,
  EmptyStateTitle,
  type EmptyStateVariant,
} from '@/components/ui';
import { defaultMessages, type SupportedLocale, type TranslationKey, translate } from '@/i18n';
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
import styles from './empty-state-gallery.module.css';

export interface EmptyStateGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type ScenarioType = 'projects' | 'search' | 'orders';

export function EmptyStateGallery({ linkComponent }: EmptyStateGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [scenario, setScenario] = useState<ScenarioType>('projects');
  const [variant, setVariant] = useState<EmptyStateVariant>('default');
  const [size, setSize] = useState<EmptyStateSize>('md');
  const [showIcon, setShowIcon] = useState<boolean>(true);
  const [iconVariant, setIconVariant] = useState<EmptyStateIconVariant>('surface');
  const [showActions, setShowActions] = useState<boolean>(true);
  const [lastActionKey, setLastActionKey] = useState<TranslationKey | null>(null);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;

  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setScenario('projects');
    setVariant('default');
    setSize('md');
    setShowIcon(true);
    setIconVariant('surface');
    setShowActions(true);
    setLastActionKey(null);
  }, [direction]);

  const handleScenarioChange = (next: ScenarioType) => {
    setScenario(next);
    setLastActionKey(null);
  };

  const handleShowActionsChange = (checked: boolean) => {
    setShowActions(checked);
    if (!checked) {
      setLastActionKey(null);
    }
  };

  const dirOptions: readonly StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'empty-state-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'empty-state-dir-rtl' },
    ],
    [t],
  );

  const scenarioOptions: readonly StudioSegmentedOption<ScenarioType>[] = useMemo(
    () => [
      {
        value: 'projects',
        label: t('common.studio.emptyStateScenarioProjects'),
        testId: 'empty-state-scenario-projects',
      },
      {
        value: 'search',
        label: t('common.studio.emptyStateScenarioSearch'),
        testId: 'empty-state-scenario-search',
      },
      {
        value: 'orders',
        label: t('common.studio.emptyStateScenarioOrders'),
        testId: 'empty-state-scenario-orders',
      },
    ],
    [t],
  );

  const variantOptions: readonly StudioSegmentedOption<EmptyStateVariant>[] = useMemo(
    () => [
      {
        value: 'default',
        label: t('common.studio.emptyStateVariantDefault'),
        testId: 'empty-state-variant-default',
      },
      {
        value: 'dashed',
        label: t('common.studio.emptyStateVariantDashed'),
        testId: 'empty-state-variant-dashed',
      },
      {
        value: 'subtle',
        label: t('common.studio.emptyStateVariantSubtle'),
        testId: 'empty-state-variant-subtle',
      },
      {
        value: 'borderless',
        label: t('common.studio.emptyStateVariantBorderless'),
        testId: 'empty-state-variant-borderless',
      },
    ],
    [t],
  );

  const sizeOptions: readonly StudioSegmentedOption<EmptyStateSize>[] = useMemo(
    () => [
      {
        value: 'sm',
        label: t('common.studio.emptyStateSizeSm'),
        testId: 'empty-state-size-sm',
      },
      {
        value: 'md',
        label: t('common.studio.emptyStateSizeMd'),
        testId: 'empty-state-size-md',
      },
      {
        value: 'lg',
        label: t('common.studio.emptyStateSizeLg'),
        testId: 'empty-state-size-lg',
      },
    ],
    [t],
  );

  const iconVariantOptions: readonly StudioSegmentedOption<EmptyStateIconVariant>[] = useMemo(
    () => [
      {
        value: 'surface',
        label: t('common.studio.emptyStateIconSurface'),
        testId: 'empty-state-icon-surface',
      },
      {
        value: 'ghost',
        label: t('common.studio.emptyStateIconGhost'),
        testId: 'empty-state-icon-ghost',
      },
    ],
    [t],
  );

  const scenarioConfig = useMemo<{
    iconName: 'search' | 'inbox' | 'folder';
    title: string;
    desc: string;
    primaryActionKey?: TranslationKey;
    secondaryActionKey?: TranslationKey;
  }>(() => {
    switch (scenario) {
      case 'search':
        return {
          iconName: 'search',
          title: specimenT('common.studio.emptyStateNoResultsTitle'),
          desc: specimenT('common.studio.emptyStateNoResultsDesc'),
          primaryActionKey: 'common.studio.emptyStateActionReset',
        };
      case 'orders':
        return {
          iconName: 'inbox',
          title: specimenT('common.studio.emptyStateNoOrdersTitle'),
          desc: specimenT('common.studio.emptyStateNoOrdersDesc'),
        };
      case 'projects':
      default:
        return {
          iconName: 'folder',
          title: specimenT('common.studio.emptyStateNoProjectsTitle'),
          desc: specimenT('common.studio.emptyStateNoProjectsDesc'),
          primaryActionKey: 'common.studio.emptyStateActionPrimary',
          secondaryActionKey: 'common.studio.emptyStateActionSecondary',
        };
    }
  }, [scenario, specimenT]);

  const { primaryActionKey, secondaryActionKey } = scenarioConfig;
  const primaryActionLabel = primaryActionKey ? specimenT(primaryActionKey) : undefined;
  const secondaryActionLabel = secondaryActionKey ? specimenT(secondaryActionKey) : undefined;

  const jsxSnippet = useMemo(() => {
    const iconSnippet = showIcon
      ? `\n  <EmptyStateIcon variant="${iconVariant}">\n    <Icon name="${scenarioConfig.iconName}" />\n  </EmptyStateIcon>`
      : '';
    const actionsSnippet =
      showActions && (primaryActionLabel || secondaryActionLabel)
        ? `\n  <EmptyStateActions>${primaryActionLabel ? `\n    <Button variant="primary">${primaryActionLabel}</Button>` : ''}${secondaryActionLabel ? `\n    <Button variant="secondary">${secondaryActionLabel}</Button>` : ''}\n  </EmptyStateActions>`
        : '';

    return `<EmptyState variant="${variant}" size="${size}">${iconSnippet}
  <EmptyStateTitle>${scenarioConfig.title}</EmptyStateTitle>
  <EmptyStateDescription>
    ${scenarioConfig.desc}
  </EmptyStateDescription>${actionsSnippet}
</EmptyState>`;
  }, [
    variant,
    size,
    showIcon,
    iconVariant,
    showActions,
    scenarioConfig,
    primaryActionLabel,
    secondaryActionLabel,
  ]);

  const aiPrompt = useMemo(() => {
    return `Build an accessible EmptyState placeholder using UI Kit primitives: variant="${variant}" (default|dashed|subtle|borderless), size="${size}" (sm|md|lg), scenario="${scenario}", iconVisible=${showIcon}, iconVariant="${iconVariant}", actionsVisible=${showActions}, direction="${specimenDir}", locale="${specimenLocale}".`;
  }, [variant, size, scenario, showIcon, iconVariant, showActions, specimenDir, specimenLocale]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.emptyStateSpecConfigTitle'),
        items: [
          { label: t('common.studio.emptyStateVariant'), value: variant },
          { label: t('common.studio.emptyStateSize'), value: size },
          { label: t('common.studio.emptyStateScenario'), value: scenario },
          { label: t('common.studio.emptyStateIconVariant'), value: iconVariant },
          { label: t('common.studio.emptyStateSpecDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.emptyStateSpecA11yTitle'),
        items: [
          { label: t('common.studio.emptyStateSpecContainerRole'), value: 'role="status"' },
          { label: t('common.studio.emptyStateSpecAriaLive'), value: 'aria-live="polite"' },
          { label: t('common.studio.emptyStateSpecIconPresentation'), value: 'aria-hidden="true"' },
          {
            label: t('common.studio.emptyStateSpecHeadingTag'),
            value: '<EmptyStateTitle as="h3">',
          },
        ],
      },
    ];
  }, [variant, size, scenario, iconVariant, specimenDir, t]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        columns={2}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.emptyStateScenario')}
        value={scenario}
        columns={3}
        options={scenarioOptions}
        onChange={handleScenarioChange}
      />

      <StudioSegmentedControl
        label={t('common.studio.emptyStateVariant')}
        value={variant}
        columns={2}
        options={variantOptions}
        onChange={setVariant}
      />

      <StudioSegmentedControl
        label={t('common.studio.emptyStateSize')}
        value={size}
        columns={3}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioToggleRow
        label={t('common.studio.emptyStateShowIcon')}
        checked={showIcon}
        onCheckedChange={setShowIcon}
        testId="empty-state-icon-toggle"
      />

      {showIcon && (
        <StudioSegmentedControl
          label={t('common.studio.emptyStateIconVariant')}
          value={iconVariant}
          columns={2}
          options={iconVariantOptions}
          onChange={setIconVariant}
        />
      )}

      <StudioToggleRow
        label={t('common.studio.emptyStateShowActions')}
        checked={showActions}
        onCheckedChange={handleShowActionsChange}
        testId="empty-state-actions-toggle"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="empty-state"
      title={t('common.studio.emptyStateTitle')}
      subtitle={t('common.studio.emptyStateSubtitle')}
      testId="gallery-empty-state"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="empty-state.module.css"
          jsxFileName="empty-state.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.specimenCanvas}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="empty-state-canvas"
      >
        <EmptyState variant={variant} size={size} data-testid="live-empty-state">
          {showIcon && (
            <EmptyStateIcon variant={iconVariant}>
              <Icon name={scenarioConfig.iconName} />
            </EmptyStateIcon>
          )}

          <EmptyStateTitle>{scenarioConfig.title}</EmptyStateTitle>

          <EmptyStateDescription>{scenarioConfig.desc}</EmptyStateDescription>

          {showActions && (primaryActionKey || secondaryActionKey) && (
            <EmptyStateActions>
              {primaryActionKey && (
                <Button
                  variant="primary"
                  data-testid="empty-state-primary-cta"
                  onClick={() => setLastActionKey(primaryActionKey)}
                >
                  {primaryActionLabel}
                </Button>
              )}
              {secondaryActionKey && (
                <Button
                  variant="secondary"
                  data-testid="empty-state-secondary-cta"
                  onClick={() => setLastActionKey(secondaryActionKey)}
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </EmptyStateActions>
          )}
        </EmptyState>

        {lastActionKey && (
          <div className={styles.actionNotice} data-testid="empty-state-action-notice">
            <Icon name="check" size={14} />
            <span>
              {specimenT('common.studio.emptyStateActionFeedbackPrefix')}:{' '}
              <strong>{specimenT(lastActionKey)}</strong>
            </span>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

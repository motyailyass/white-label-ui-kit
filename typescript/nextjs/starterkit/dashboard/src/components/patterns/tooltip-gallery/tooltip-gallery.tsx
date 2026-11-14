'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { Button, Tooltip, type TooltipPlacement, type TooltipVariant } from '@/components/ui';
import { defaultMessages, translate, type SupportedLocale, type TranslationKey } from '@/i18n';
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
import styles from './tooltip-gallery.module.css';

export type TooltipSpecimenDirection = 'ltr' | 'rtl';
export type TooltipTriggerType = 'icon-button' | 'text-button' | 'action-pill';
export type TooltipDelayOption = '0' | '250' | '500';

export interface TooltipGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function TooltipGallery({ linkComponent }: TooltipGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<TooltipSpecimenDirection>(direction);
  const [placement, setPlacement] = useState<TooltipPlacement>('top');
  const [variant, setVariant] = useState<TooltipVariant>('contrast');
  const [triggerType, setTriggerType] = useState<TooltipTriggerType>('icon-button');
  const [hasArrow, setHasArrow] = useState(true);
  const [selectedShortcut, setSelectedShortcut] = useState<string>('⌘K');
  const [delayDurationStr, setDelayDurationStr] = useState<TooltipDelayOption>('250');
  const [isDisabled, setIsDisabled] = useState(false);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setPlacement('top');
    setVariant('contrast');
    setTriggerType('icon-button');
    setHasArrow(true);
    setSelectedShortcut('⌘K');
    setDelayDurationStr('250');
    setIsDisabled(false);
  }, [direction]);

  const delayDuration = parseInt(delayDurationStr, 10);
  const activeShortcut = selectedShortcut === 'none' ? undefined : selectedShortcut;

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Options for segmented controls
  const dirOptions: readonly StudioSegmentedOption<TooltipSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const placementOptions: readonly StudioSegmentedOption<TooltipPlacement>[] = useMemo(
    () => [
      { value: 'top', label: t('common.studio.tooltipPlaceTop'), testId: 'opt-placement-top' },
      {
        value: 'bottom',
        label: t('common.studio.tooltipPlaceBottom'),
        testId: 'opt-placement-bottom',
      },
      {
        value: 'start',
        label: t('common.studio.tooltipPlaceStart'),
        testId: 'opt-placement-start',
      },
      { value: 'end', label: t('common.studio.tooltipPlaceEnd'), testId: 'opt-placement-end' },
      { value: 'left', label: t('common.studio.tooltipPlaceLeft'), testId: 'opt-placement-left' },
      {
        value: 'right',
        label: t('common.studio.tooltipPlaceRight'),
        testId: 'opt-placement-right',
      },
    ],
    [t],
  );

  const variantOptions: readonly StudioSegmentedOption<TooltipVariant>[] = useMemo(
    () => [
      {
        value: 'contrast',
        label: t('common.studio.tooltipVariantContrast'),
        testId: 'opt-variant-contrast',
      },
      {
        value: 'subtle',
        label: t('common.studio.tooltipVariantSubtle'),
        testId: 'opt-variant-subtle',
      },
    ],
    [t],
  );

  const triggerOptions: readonly StudioSegmentedOption<TooltipTriggerType>[] = useMemo(
    () => [
      {
        value: 'icon-button',
        label: t('common.studio.tooltipTriggerIconBtn'),
        testId: 'opt-trigger-icon',
      },
      {
        value: 'text-button',
        label: t('common.studio.tooltipTriggerTextBtn'),
        testId: 'opt-trigger-text',
      },
      {
        value: 'action-pill',
        label: t('common.studio.tooltipTriggerPill'),
        testId: 'opt-trigger-pill',
      },
    ],
    [t],
  );

  const shortcutOptions: readonly StudioSegmentedOption<string>[] = useMemo(
    () => [
      { value: 'none', label: t('common.studio.tooltipShortcutNone'), testId: 'opt-shortcut-none' },
      { value: '⌘K', label: '⌘K', testId: 'opt-shortcut-cmdk' },
      { value: 'Shift+?', label: 'Shift+?', testId: 'opt-shortcut-shift' },
      { value: 'Esc', label: 'Esc', testId: 'opt-shortcut-esc' },
    ],
    [t],
  );

  const delayOptions: readonly StudioSegmentedOption<TooltipDelayOption>[] = useMemo(
    () => [
      { value: '0', label: t('common.studio.tooltipDelayInstant'), testId: 'opt-delay-0' },
      { value: '250', label: t('common.studio.tooltipDelayDefault'), testId: 'opt-delay-250' },
      { value: '500', label: t('common.studio.tooltipDelaySlow'), testId: 'opt-delay-500' },
    ],
    [t],
  );

  const sampleContent = specimenT('common.studio.tooltipSampleContent');
  const sampleTextTrigger = specimenT('common.studio.tooltipSampleTextTrigger');
  const samplePillTrigger = specimenT('common.studio.tooltipSamplePillTrigger');
  const sampleIconAria = specimenT('common.studio.tooltipSampleIconAria');

  // Dynamic JSX Code Snippet
  const jsxSnippet = useMemo(() => {
    const uiImports = triggerType === 'action-pill' ? 'Tooltip' : 'Button, Tooltip';
    const needsIconImport = triggerType === 'icon-button' || triggerType === 'action-pill';
    const imports = [
      `import { ${uiImports} } from '@/components/ui';`,
      needsIconImport ? `import { Icon } from '@/components/icons';` : null,
      triggerType === 'action-pill'
        ? `import styles from './quick-search-tooltip.module.css';`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const propsList: string[] = [`content="${sampleContent}"`];
    if (placement !== 'top') propsList.push(`placement="${placement}"`);
    if (variant !== 'contrast') propsList.push(`variant="${variant}"`);
    if (!hasArrow) propsList.push('arrow={false}');
    if (activeShortcut) propsList.push(`shortcut="${activeShortcut}"`);
    if (delayDuration !== 250) propsList.push(`delayDuration={${delayDuration}}`);
    if (isDisabled) propsList.push('disabled');

    const formattedProps =
      propsList.length <= 2 ? propsList.join(' ') : `\n  ${propsList.join('\n  ')}\n`;

    let triggerCode = `<Button variant="secondary" iconOnly aria-label="${sampleIconAria}">\n    <Icon name="search" size={16} />\n  </Button>`;
    if (triggerType === 'text-button') {
      triggerCode = `<Button variant="secondary">\n    ${sampleTextTrigger}\n  </Button>`;
    } else if (triggerType === 'action-pill') {
      triggerCode = `<button type="button" className={styles.actionPill}>\n    <Icon name="settings" size={14} />\n    <span>${samplePillTrigger}</span>\n  </button>`;
    }

    return `${imports}

export function QuickSearchTooltip() {
  return (
    <Tooltip ${formattedProps}>
      ${triggerCode}
    </Tooltip>
  );
}`;
  }, [
    placement,
    variant,
    hasArrow,
    activeShortcut,
    delayDuration,
    isDisabled,
    triggerType,
    sampleContent,
    sampleIconAria,
    sampleTextTrigger,
    samplePillTrigger,
  ]);

  const cssModuleSnippet = useMemo(() => {
    if (triggerType !== 'action-pill') {
      return null;
    }

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
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  cursor: pointer;
}`;
  }, [triggerType]);

  // AI Agent Prompt
  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label contextual Tooltip using the kit's pure Tooltip primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`Tooltip\` from \`@/components/ui\`.
- Placement: ${placement} with viewport collision auto-flip and dir="${specimenDir}" resolution.
- Variant: ${variant} (${variant === 'contrast' ? 'uses --color-primary / --color-primary-foreground' : 'uses --color-surface-raised / --color-border-subtle'}).
- Shortcut: ${activeShortcut ?? 'None'} (rendered in <kbd> with isolated LTR text).
- Delay: ${delayDuration}ms hover warm-up delay; 0ms immediate appearance on keyboard focus.
- WAI-ARIA & WCAG 1.4.13: role="tooltip" paired with aria-describedby, dismissible via Escape, hoverable content.
- Zero Dashboard Shadows: 100% shadow-free boundary (--z-tooltip: 600).
`;
  }, [jsxSnippet, placement, specimenDir, variant, activeShortcut, delayDuration]);

  // Measured Spec Groups (100% Localized)
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const surfaceToken =
      variant === 'contrast' ? 'var(--color-primary)' : 'var(--color-surface-raised)';
    const textToken =
      variant === 'contrast' ? 'var(--color-primary-foreground)' : 'var(--color-text-primary)';

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.tooltipSpecPlacement'), value: placement },
          {
            label: t('common.studio.tooltipSpecVariant'),
            value:
              variant === 'contrast'
                ? t('common.studio.tooltipVariantContrast')
                : t('common.studio.tooltipVariantSubtle'),
          },
          {
            label: t('common.studio.tooltipSpecArrow'),
            value: hasArrow ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          {
            label: t('common.studio.tooltipSpecShortcut'),
            value: activeShortcut ?? t('common.studio.tooltipShortcutNone'),
          },
          { label: t('common.studio.tooltipSpecDelay'), value: `${delayDuration}ms` },
          {
            label: t('common.studio.tooltipSpecDisabled'),
            value: isDisabled ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
        ],
      },
      {
        title: t('common.studio.tooltipSpecCategoryA11y'),
        items: [
          { label: t('common.studio.tooltipSpecRole'), value: 'role="tooltip"' },
          {
            label: t('common.studio.tooltipSpecAriaDescribedby'),
            value: t('common.studio.tooltipSpecAriaDescribedbyValue'),
          },
          {
            label: t('common.studio.tooltipSpecDismissible'),
            value: t('common.studio.tooltipSpecDismissibleValue'),
          },
          {
            label: t('common.studio.tooltipSpecHoverable'),
            value: t('common.studio.tooltipSpecHoverableValue'),
          },
          {
            label: t('common.studio.tooltipSpecKeyboardFocus'),
            value: t('common.studio.tooltipSpecKeyboardFocusValue'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.tooltipSpecSurface'), value: surfaceToken },
          { label: t('common.studio.tooltipSpecText'), value: textToken },
          {
            label: t('common.studio.specRadius'),
            value: t('common.studio.tooltipSpecRadiusValue'),
          },
          { label: t('common.studio.tooltipSpecLayer'), value: '--z-tooltip (600)' },
          {
            label: t('common.studio.tooltipSpecShadowPolicy'),
            value: t('common.studio.tooltipSpecShadowValue'),
          },
        ],
      },
    ];
  }, [placement, variant, hasArrow, activeShortcut, delayDuration, isDisabled, t]);

  const renderActiveTrigger = () => {
    if (triggerType === 'text-button') {
      return (
        <Button variant="secondary" data-testid="studio-tooltip-trigger">
          {sampleTextTrigger}
        </Button>
      );
    }
    if (triggerType === 'action-pill') {
      return (
        <button type="button" className={styles.actionPill} data-testid="studio-tooltip-trigger">
          <Icon name="settings" size={14} />
          <span>{samplePillTrigger}</span>
        </button>
      );
    }
    return (
      <Button
        variant="secondary"
        iconOnly
        aria-label={sampleIconAria}
        data-testid="studio-tooltip-trigger"
      >
        <Icon name="search" size={16} />
      </Button>
    );
  };

  return (
    <GalleryStudioLayout
      activeRoute="tooltip"
      title={t('common.studio.tooltipTitle')}
      subtitle={t('common.studio.tooltipSubtitle')}
      testId="tooltip-studio"
      previewDir={specimenDir}
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
            label={t('common.studio.tooltipPlacementLabel')}
            value={placement}
            options={placementOptions}
            onChange={setPlacement}
          />

          <StudioSegmentedControl
            label={t('common.studio.tooltipVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.tooltipTriggerLabel')}
            value={triggerType}
            options={triggerOptions}
            onChange={setTriggerType}
          />

          <StudioSegmentedControl
            label={t('common.studio.tooltipShortcutLabel')}
            value={selectedShortcut}
            options={shortcutOptions}
            onChange={setSelectedShortcut}
          />

          <StudioSegmentedControl
            label={t('common.studio.tooltipDelayLabel')}
            value={delayDurationStr}
            options={delayOptions}
            onChange={setDelayDurationStr}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.tooltipArrowToggle')}
            checked={hasArrow}
            onCheckedChange={setHasArrow}
            testId="toggle-tooltip-arrow"
          />

          <StudioToggleRow
            label={t('common.studio.tooltipDisabledToggle')}
            checked={isDisabled}
            onCheckedChange={setIsDisabled}
            testId="toggle-tooltip-disabled"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="quick-search-tooltip.tsx"
          cssFileName="quick-search-tooltip.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.canvasArea} dir={specimenDir} lang={specimenLangAttr}>
        <div className={styles.stageCard}>
          <p className={styles.stageHelpText}>{t('common.studio.tooltipStageHint')}</p>

          <div className={styles.specimenStage}>
            <Tooltip
              content={sampleContent}
              placement={placement}
              variant={variant}
              arrow={hasArrow}
              shortcut={activeShortcut}
              delayDuration={delayDuration}
              disabled={isDisabled}
              dir={specimenDir}
            >
              {renderActiveTrigger()}
            </Tooltip>
          </div>

          <div className={styles.skipDelaySection}>
            <div className={styles.skipDelayHeader}>
              <Icon name="info" size={14} />
              <span>
                <strong>{t('common.studio.skipDelayTitle')}:</strong>{' '}
                {t('common.studio.skipDelayDesc')}
              </span>
            </div>
            <div
              className={styles.skipDelayToolbar}
              role="toolbar"
              aria-label={t('common.studio.tooltipToolbarAria')}
            >
              <Tooltip
                content={specimenT('common.studio.tooltipToolbarSearch')}
                placement="top"
                variant={variant}
                arrow={hasArrow}
                shortcut="⌘K"
                delayDuration={delayDuration}
                dir={specimenDir}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={specimenT('common.studio.tooltipToolbarSearchAria')}
                  data-testid="skip-delay-search-btn"
                >
                  <Icon name="search" size={14} />
                </Button>
              </Tooltip>

              <Tooltip
                content={specimenT('common.studio.tooltipToolbarPrefs')}
                placement="top"
                variant={variant}
                arrow={hasArrow}
                shortcut="⌘,"
                delayDuration={delayDuration}
                dir={specimenDir}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={specimenT('common.studio.tooltipToolbarPrefsAria')}
                  data-testid="skip-delay-prefs-btn"
                >
                  <Icon name="sliders" size={14} />
                </Button>
              </Tooltip>

              <Tooltip
                content={specimenT('common.studio.tooltipToolbarSettings')}
                placement="top"
                variant={variant}
                arrow={hasArrow}
                shortcut="⌘S"
                delayDuration={delayDuration}
                dir={specimenDir}
              >
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={specimenT('common.studio.tooltipToolbarSettingsAria')}
                  data-testid="skip-delay-settings-btn"
                >
                  <Icon name="settings" size={14} />
                </Button>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  Tooltip,
  type TooltipPlacement,
  type TooltipVariant,
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
import styles from './tooltip-gallery.module.css';

export type TooltipSpecimenDirection = 'ltr' | 'rtl';
export type TooltipTriggerType = 'icon-button' | 'text-button' | 'action-pill';
export type TooltipDelayOption = '0' | '250' | '500';

export interface TooltipGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function TooltipGallery({ linkComponent }: TooltipGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<TooltipSpecimenDirection>('ltr');
  const [placement, setPlacement] = useState<TooltipPlacement>('top');
  const [variant, setVariant] = useState<TooltipVariant>('contrast');
  const [triggerType, setTriggerType] = useState<TooltipTriggerType>('icon-button');
  const [hasArrow, setHasArrow] = useState(true);
  const [selectedShortcut, setSelectedShortcut] = useState<string>('⌘K');
  const [delayDurationStr, setDelayDurationStr] = useState<TooltipDelayOption>('250');
  const [isDisabled, setIsDisabled] = useState(false);

  // Specimen measured specs
  const specimenRef = useRef<HTMLDivElement | null>(null);
  const [measuredSpecs, setMeasuredSpecs] = useState<{
    bg: string;
    text: string;
    radius: string;
    zIndex: string;
  } | null>(null);

  useEffect(() => {
    // Measure sample tooltip element if available or simulate styling metrics
    if (typeof window !== 'undefined') {
      const isDark = resolvedTheme === 'dark';
      setMeasuredSpecs({
        bg: variant === 'contrast' ? (isDark ? '#27272a' : '#18181b') : isDark ? '#18181b' : '#ffffff',
        text: variant === 'contrast' ? '#ffffff' : isDark ? '#f4f4f5' : '#09090b',
        radius: '6px (--radius-control)',
        zIndex: '600 (--z-tooltip)',
      });
    }
  }, [variant, resolvedTheme, placement]);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setPlacement('top');
    setVariant('contrast');
    setTriggerType('icon-button');
    setHasArrow(true);
    setSelectedShortcut('⌘K');
    setDelayDurationStr('250');
    setIsDisabled(false);
  }, []);

  const delayDuration = parseInt(delayDurationStr, 10);
  const activeShortcut = selectedShortcut === 'none' ? undefined : selectedShortcut;

  // Options for segmented controls
  const dirOptions: readonly StudioSegmentedOption<TooltipSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const placementOptions: readonly StudioSegmentedOption<TooltipPlacement>[] = [
    { value: 'top', label: 'Top', testId: 'opt-placement-top' },
    { value: 'bottom', label: 'Bottom', testId: 'opt-placement-bottom' },
    { value: 'left', label: 'Left', testId: 'opt-placement-left' },
    { value: 'right', label: 'Right', testId: 'opt-placement-right' },
  ];

  const variantOptions: readonly StudioSegmentedOption<TooltipVariant>[] = [
    { value: 'contrast', label: 'Contrast (Dark)', testId: 'opt-variant-contrast' },
    { value: 'subtle', label: 'Subtle (Surface)', testId: 'opt-variant-subtle' },
  ];

  const triggerOptions: readonly StudioSegmentedOption<TooltipTriggerType>[] = [
    { value: 'icon-button', label: 'Icon Button', testId: 'opt-trigger-icon' },
    { value: 'text-button', label: 'Text Button', testId: 'opt-trigger-text' },
    { value: 'action-pill', label: 'Action Pill', testId: 'opt-trigger-pill' },
  ];

  const shortcutOptions: readonly StudioSegmentedOption<string>[] = [
    { value: 'none', label: 'None', testId: 'opt-shortcut-none' },
    { value: '⌘K', label: '⌘K', testId: 'opt-shortcut-cmdk' },
    { value: 'Shift+?', label: 'Shift+?', testId: 'opt-shortcut-shift' },
    { value: 'Esc', label: 'Esc', testId: 'opt-shortcut-esc' },
  ];

  const delayOptions: readonly StudioSegmentedOption<TooltipDelayOption>[] = [
    { value: '0', label: '0ms (Instant)', testId: 'opt-delay-0' },
    { value: '250', label: '250ms (Def)', testId: 'opt-delay-250' },
    { value: '500', label: '500ms (Slow)', testId: 'opt-delay-500' },
  ];

  // Dynamic JSX Code Snippet
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = ['content="Quick search across documents"'];
    if (placement !== 'top') propsList.push(`placement="${placement}"`);
    if (variant !== 'contrast') propsList.push(`variant="${variant}"`);
    if (!hasArrow) propsList.push('arrow={false}');
    if (activeShortcut) propsList.push(`shortcut="${activeShortcut}"`);
    if (delayDuration !== 250) propsList.push(`delayDuration={${delayDuration}}`);
    if (isDisabled) propsList.push('disabled');

    const formattedProps = propsList.length <= 2 ? propsList.join(' ') : `\n  ${propsList.join('\n  ')}\n`;

    let triggerCode = '<Button variant="secondary" size="md" aria-label="Search">\n    <Icon name="search" />\n  </Button>';
    if (triggerType === 'text-button') {
      triggerCode = '<Button variant="secondary" size="md">\n    Search documents\n  </Button>';
    } else if (triggerType === 'action-pill') {
      triggerCode = '<span className={styles.actionPill}>\n    <Icon name="settings" /> Settings\n  </span>';
    }

    return `<Tooltip ${formattedProps}>\n  ${triggerCode}\n</Tooltip>`;
  }, [placement, variant, hasArrow, activeShortcut, delayDuration, isDisabled, triggerType]);

  const cssModuleSnippet = `/* Custom positioning & trigger integration */
.triggerArea {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4);
}

.actionPill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding-inline: var(--space-2);
  padding-block: var(--space-1);
  border-radius: var(--radius-full);
  background-color: var(--color-surface-subtle);
  border: 1px solid var(--color-border-subtle);
  font-size: var(--font-size-xs);
  cursor: pointer;
}`;

  // AI Agent Prompt
  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label contextual Tooltip using the kit's pure Tooltip primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/tooltip\` directly.
- Placement: ${placement} with auto-flip collision detection.
- Variant: ${variant} (${variant === 'contrast' ? 'inverted dark surface' : 'raised surface with subtle border'}).
- Shortcut: ${activeShortcut ?? 'None'}.
- Delay: ${delayDuration}ms hover warm-up delay; 0ms immediate appearance on keyboard focus.
- WAI-ARIA & WCAG 1.4.13: role="tooltip" paired with aria-describedby, dismissible via Escape, hoverable content.
- Zero Dashboard Shadows: 100% shadow-free boundary.
`;
  }, [jsxSnippet, placement, variant, activeShortcut, delayDuration]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'placement', value: placement },
          { label: 'variant', value: variant },
          { label: 'arrow', value: hasArrow ? 'true' : 'false' },
          { label: 'shortcut', value: activeShortcut ?? 'none' },
          { label: 'delayDuration', value: `${delayDuration}ms` },
          { label: 'disabled', value: isDisabled ? 'true' : 'false' },
        ],
      },
      {
        title: 'Accessibility & WCAG 1.4.13',
        items: [
          { label: 'role', value: 'tooltip' },
          { label: 'aria-describedby', value: 'dynamic useId() linkage' },
          { label: 'dismissible', value: 'Escape key immediate close' },
          { label: 'hoverable', value: 'pointer moves into bubble without close' },
          { label: 'keyboardFocus', value: '0ms immediate appearance' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: 'surface', value: measuredSpecs?.bg ?? '#18181b' },
          { label: 'text', value: measuredSpecs?.text ?? '#ffffff' },
          { label: 'radius', value: measuredSpecs?.radius ?? '6px' },
          { label: 'zIndex', value: measuredSpecs?.zIndex ?? '600' },
          { label: 'shadowPolicy', value: '100% Shadow-Free (Dashboard)' },
        ],
      },
    ];
  }, [placement, variant, hasArrow, activeShortcut, delayDuration, isDisabled, measuredSpecs, t]);

  const activeContentText =
    specimenDir === 'rtl' ? 'البحث السريع في المستندات' : 'Quick search across documents';
  const adjacentContentText =
    specimenDir === 'rtl' ? 'الإعدادات العامة والتفضيلات' : 'Settings and preferences';

  const renderActiveTrigger = () => {
    if (triggerType === 'text-button') {
      return (
        <Button variant="secondary" size="md">
          {specimenDir === 'rtl' ? 'توجيه المؤشر هنا' : 'Hover over me'}
        </Button>
      );
    }
    if (triggerType === 'action-pill') {
      return (
        <span className={styles.actionPill} tabIndex={0} role="button">
          <Icon name="settings" />
          <span>{specimenDir === 'rtl' ? 'الإعدادات' : 'Preferences'}</span>
        </span>
      );
    }
    return (
      <Button variant="secondary" size="md" aria-label="Quick search">
        <Icon name="search" />
      </Button>
    );
  };

  return (
    <GalleryStudioLayout
      activeRoute="tooltip"
      title={t('common.studio.tooltipTitle') || 'Tooltip Studio'}
      subtitle={
        t('common.studio.tooltipSubtitle') ||
        'Inspect accessible hover and focus tooltips, test 4-way collision placements, warm-up and skip delays, keyboard shortcuts, and copy exact code.'
      }
      testId="tooltip-studio"
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
            label="Placement"
            value={placement}
            options={placementOptions}
            onChange={setPlacement}
          />

          <StudioSegmentedControl
            label="Visual Variant"
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label="Trigger Type"
            value={triggerType}
            options={triggerOptions}
            onChange={setTriggerType}
          />

          <StudioSegmentedControl
            label="Keyboard Shortcut Badge"
            value={selectedShortcut}
            options={shortcutOptions}
            onChange={setSelectedShortcut}
          />

          <StudioSegmentedControl
            label="Hover Warm-up Delay"
            value={delayDurationStr}
            options={delayOptions}
            onChange={setDelayDurationStr}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label="Directional Arrow Notch"
            checked={hasArrow}
            onCheckedChange={setHasArrow}
            testId="toggle-tooltip-arrow"
          />

          <StudioToggleRow
            label="Disabled State"
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
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        ref={specimenRef}
      >
        <div className={styles.stageCard}>
          <div className={styles.stageHelpText}>
            Hover with cursor or navigate via <strong>Tab</strong> to reveal tooltip. Press <strong>Escape</strong> to dismiss.
          </div>

          <div className={styles.triggerRow}>
            {/* Primary Interactive Specimen */}
            <Tooltip
              content={activeContentText}
              placement={placement}
              variant={variant}
              arrow={hasArrow}
              shortcut={activeShortcut}
              delayDuration={delayDuration}
              disabled={isDisabled}
            >
              {renderActiveTrigger()}
            </Tooltip>

            {/* Adjacent Specimen for Skip-Delay Testing */}
            <Tooltip
              content={adjacentContentText}
              placement={placement}
              variant={variant}
              arrow={hasArrow}
              shortcut="⌘,"
              delayDuration={delayDuration}
              disabled={isDisabled}
            >
              <Button variant="secondary" size="md" aria-label="Settings">
                <Icon name="settings" />
              </Button>
            </Tooltip>
          </div>

          <div className={styles.skipDelayHint}>
            💡 <strong>Skip-Delay Test:</strong> Move your cursor directly from the first button to the second to verify instant opening without repeating the 250ms warm-up delay.
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

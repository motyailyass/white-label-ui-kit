'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui';
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
import styles from './dropdown-gallery.module.css';

export type DropdownSpecimenDirection = 'ltr' | 'rtl';
export type DropdownPlacementOption =
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end'
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'inline-start'
  | 'inline-end';
export type DropdownOffsetOption = '4' | '8' | '12';
export type DropdownMinWidthOption = '160' | '220' | '280';
export type DropdownStageView = 'single' | 'all-placements';
type CommandId = 'idle' | 'edit' | 'duplicate' | 'archive' | 'delete';

export interface DropdownGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function DropdownGallery({ linkComponent }: DropdownGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<DropdownSpecimenDirection>(direction);
  const [placement, setPlacement] = useState<DropdownPlacementOption>('bottom-start');
  const [offsetStr, setOffsetStr] = useState<DropdownOffsetOption>('4');
  const [minWidthStr, setMinWidthStr] = useState<DropdownMinWidthOption>('220');
  const [stageView, setStageView] = useState<DropdownStageView>('single');
  const [showGroups, setShowGroups] = useState(true);
  const [showIconsShortcuts, setShowIconsShortcuts] = useState(true);
  const [showDisabled, setShowDisabled] = useState(true);
  const [showDanger, setShowDanger] = useState(true);
  const [autoFlip, setAutoFlip] = useState(true);
  const [loop, setLoop] = useState(true);
  const [studioOpen, setStudioOpen] = useState(false);
  const [lastCommand, setLastCommand] = useState<CommandId>('idle');

  // Placements Grid Open States
  const [gridOpenBottomStart, setGridOpenBottomStart] = useState(false);
  const [gridOpenTopStart, setGridOpenTopStart] = useState(false);
  const [gridOpenInlineStart, setGridOpenInlineStart] = useState(false);
  const [gridOpenInlineEnd, setGridOpenInlineEnd] = useState(false);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setPlacement('bottom-start');
    setOffsetStr('4');
    setMinWidthStr('220');
    setStageView('single');
    setShowGroups(true);
    setShowIconsShortcuts(true);
    setShowDisabled(true);
    setShowDanger(true);
    setAutoFlip(true);
    setLoop(true);
    setStudioOpen(false);
    setLastCommand('idle');
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<DropdownSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const placementOptions: readonly StudioSegmentedOption<DropdownPlacementOption>[] = useMemo(
    () => [
      {
        value: 'bottom-start',
        label: t('common.studio.dropdownPlaceBottomStart'),
        testId: 'opt-place-bs',
      },
      {
        value: 'bottom-center',
        label: t('common.studio.dropdownPlaceBottomCenter'),
        testId: 'opt-place-bc',
      },
      {
        value: 'bottom-end',
        label: t('common.studio.dropdownPlaceBottomEnd'),
        testId: 'opt-place-be',
      },
      {
        value: 'top-start',
        label: t('common.studio.dropdownPlaceTopStart'),
        testId: 'opt-place-ts',
      },
      {
        value: 'top-center',
        label: t('common.studio.dropdownPlaceTopCenter'),
        testId: 'opt-place-tc',
      },
      { value: 'top-end', label: t('common.studio.dropdownPlaceTopEnd'), testId: 'opt-place-te' },
      {
        value: 'inline-start',
        label: t('common.studio.dropdownPlaceInlineStart'),
        testId: 'opt-place-is',
      },
      {
        value: 'inline-end',
        label: t('common.studio.dropdownPlaceInlineEnd'),
        testId: 'opt-place-ie',
      },
    ],
    [t],
  );

  const offsetOptions: readonly StudioSegmentedOption<DropdownOffsetOption>[] = [
    { value: '4', label: '4px', testId: 'opt-offset-4' },
    { value: '8', label: '8px', testId: 'opt-offset-8' },
    { value: '12', label: '12px', testId: 'opt-offset-12' },
  ];

  const minWidthOptions: readonly StudioSegmentedOption<DropdownMinWidthOption>[] = [
    { value: '160', label: '160px', testId: 'opt-mw-160' },
    { value: '220', label: '220px', testId: 'opt-mw-220' },
    { value: '280', label: '280px', testId: 'opt-mw-280' },
  ];

  const viewOptions: readonly StudioSegmentedOption<DropdownStageView>[] = [
    { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
    {
      value: 'all-placements',
      label: t('common.studio.dropdownViewAllPlacements'),
      testId: 'opt-view-all-placements',
    },
  ];

  const parsedOffset = parseInt(offsetStr, 10);
  const parsedMinWidth = parseInt(minWidthStr, 10);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const commandLabelKeyMap: Record<CommandId, TranslationKey> = {
    idle: 'common.studio.dropdownLastCommandIdle',
    edit: 'common.studio.dropdownItemEdit',
    duplicate: 'common.studio.dropdownItemDuplicate',
    archive: 'common.studio.dropdownItemArchive',
    delete: 'common.studio.dropdownItemDelete',
  };

  const jsxSnippet = useMemo(() => {
    const uiImports = [
      'Button',
      'Dropdown',
      'DropdownContent',
      ...(showGroups ? ['DropdownGroup'] : []),
      'DropdownItem',
      ...(showGroups ? ['DropdownLabel'] : []),
      ...(showGroups && showDanger ? ['DropdownSeparator'] : []),
      'DropdownTrigger',
    ].join(', ');

    const iconImport = showIconsShortcuts ? `import { Icon } from '@/components/icons';\n` : '';

    const editStartIcon = showIconsShortcuts
      ? ` startIcon={<Icon name="sliders" size={16} />} shortcut="⌘E"`
      : '';
    const duplicateStartIcon = showIconsShortcuts
      ? ` startIcon={<Icon name="add" size={16} />} shortcut="⌘D"`
      : '';
    const archiveStartIcon = showIconsShortcuts
      ? ` startIcon={<Icon name="folder" size={16} />}`
      : '';
    const dangerStartIcon = showIconsShortcuts
      ? ` startIcon={<Icon name="danger" size={16} />} shortcut="Del"`
      : '';

    const triggerLabel = specimenT('common.studio.dropdownTriggerActions');
    const workspaceLabel = specimenT('common.studio.dropdownGroupWorkspace');
    const dangerGroupLabel = specimenT('common.studio.dropdownGroupDanger');
    const editLabel = specimenT('common.studio.dropdownItemEdit');
    const duplicateLabel = specimenT('common.studio.dropdownItemDuplicate');
    const archiveLabel = specimenT('common.studio.dropdownItemArchive');
    const deleteLabel = specimenT('common.studio.dropdownItemDelete');

    const workspaceItems = [
      `<DropdownItem${editStartIcon} onSelect={handleEdit}>${editLabel}</DropdownItem>`,
      `<DropdownItem${duplicateStartIcon} onSelect={handleDuplicate}>${duplicateLabel}</DropdownItem>`,
      ...(showDisabled
        ? [`<DropdownItem disabled${archiveStartIcon}>${archiveLabel}</DropdownItem>`]
        : []),
    ];

    const workspaceBlock = showGroups
      ? `        <DropdownGroup>
          <DropdownLabel>${workspaceLabel}</DropdownLabel>
          ${workspaceItems.join('\n          ')}
        </DropdownGroup>`
      : `        ${workspaceItems.join('\n        ')}`;

    const dangerItem = `<DropdownItem variant="danger"${dangerStartIcon} onSelect={handleDelete}>${deleteLabel}</DropdownItem>`;
    const dangerBlock = showDanger
      ? showGroups
        ? `
        <DropdownSeparator />
        <DropdownGroup>
          <DropdownLabel>${dangerGroupLabel}</DropdownLabel>
          ${dangerItem}
        </DropdownGroup>`
        : `
        ${dangerItem}`
      : '';

    return `${iconImport}import { ${uiImports} } from '@/components/ui';

export function ResourceActionsMenu() {
  return (
    <Dropdown
      placement="${placement}"
      offset={${offsetStr}}
      autoFlip={${autoFlip}}
      dir="${specimenDir}"
    >
      <DropdownTrigger asChild>
        <Button variant="secondary">${triggerLabel}</Button>
      </DropdownTrigger>

      <DropdownContent minWidth={${minWidthStr}} loop={${loop}}>
${workspaceBlock}${dangerBlock}
      </DropdownContent>
    </Dropdown>
  );
}`;
  }, [
    placement,
    offsetStr,
    autoFlip,
    specimenDir,
    minWidthStr,
    loop,
    showGroups,
    showIconsShortcuts,
    showDisabled,
    showDanger,
    specimenT,
  ]);

  const aiAgentPrompt = useMemo(
    () => `Generate an accessible action Dropdown menu using the UI Kit Dropdown primitive.
Requirements:
- Native HTML Popover top-layer positioning (popover="auto") with coordinate anchoring and CSS fallback layer var(--z-dropdown)
- WAI-ARIA role="menu" / role="menuitem" roving tabindex navigation (ArrowDown, ArrowUp, Home, End, Enter/Space, Escape, Tab)
- placement="${placement}", offset={${offsetStr}}, autoFlip={${autoFlip}}, dir="${specimenDir}"
- DropdownContent minWidth={${minWidthStr}}, loop={${loop}}
- Disabled items remain focusable for discovery (aria-disabled="true") while blocking activation
- Zero external libraries; purely consumes token contracts and CSS logical properties
- 100% shadow-free in dashboard routes; visual depth via --color-surface-raised and --color-border-subtle`,
    [placement, offsetStr, autoFlip, specimenDir, minWidthStr, loop],
  );

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const enabledSlots = [
      showGroups ? t('common.studio.dropdownSpecSlotGroups') : null,
      showIconsShortcuts ? t('common.studio.dropdownSpecSlotShortcuts') : null,
      showDisabled ? t('common.studio.dropdownSpecSlotDisabled') : null,
      showDanger ? t('common.studio.dropdownSpecSlotDanger') : null,
    ].filter(Boolean);

    return [
      {
        title: t('common.studio.dropdownSpecCategoryAnchoring'),
        items: [
          { label: t('common.studio.dropdownSpecLayer'), value: '--z-dropdown (200) / Top Layer' },
          { label: t('common.studio.dropdownSpecPlacement'), value: placement },
          { label: t('common.studio.dropdownSpecOffset'), value: `${offsetStr}px` },
          {
            label: t('common.studio.dropdownSpecAutoFlip'),
            value: autoFlip ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          { label: t('common.studio.dropdownSpecWritingMode'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          {
            label: t('common.studio.dropdownSpecRole'),
            value: t('common.studio.dropdownSpecRoleMenu'),
          },
          { label: t('common.studio.dropdownSpecMinWidth'), value: `${minWidthStr}px` },
          {
            label: t('common.studio.dropdownSpecLoop'),
            value: loop ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          {
            label: t('common.studio.dropdownSpecComposition'),
            value:
              enabledSlots.length > 0
                ? enabledSlots.join(' / ')
                : t('common.studio.disabledOption'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.dropdownSpecSurface'), value: 'var(--color-surface-raised)' },
          {
            label: t('common.studio.specRadius'),
            value: t('common.studio.dropdownSpecRadiusValue'),
          },
          {
            label: t('common.studio.dropdownSpecShadowPolicy'),
            value: t('common.studio.dropdownSpecShadowValue'),
          },
        ],
      },
    ];
  }, [
    t,
    placement,
    offsetStr,
    autoFlip,
    specimenDir,
    minWidthStr,
    loop,
    showGroups,
    showIconsShortcuts,
    showDisabled,
    showDanger,
  ]);

  const workspaceItemsJsx = (
    <>
      <DropdownItem
        startIcon={showIconsShortcuts ? <Icon name="sliders" size={16} /> : undefined}
        shortcut={showIconsShortcuts ? '⌘E' : undefined}
        onSelect={() => setLastCommand('edit')}
        data-testid="studio-dropdown-item-edit"
      >
        {specimenT('common.studio.dropdownItemEdit')}
      </DropdownItem>
      <DropdownItem
        startIcon={showIconsShortcuts ? <Icon name="add" size={16} /> : undefined}
        shortcut={showIconsShortcuts ? '⌘D' : undefined}
        onSelect={() => setLastCommand('duplicate')}
        data-testid="studio-dropdown-item-duplicate"
      >
        {specimenT('common.studio.dropdownItemDuplicate')}
      </DropdownItem>
      <DropdownItem
        href="https://example.com/docs"
        target="_blank"
        startIcon={showIconsShortcuts ? <Icon name="external-link" size={16} /> : undefined}
        data-testid="studio-dropdown-item-link"
      >
        {specimenT('common.studio.dropdownItemLink')}
      </DropdownItem>
      {showDisabled && (
        <DropdownItem
          disabled
          startIcon={showIconsShortcuts ? <Icon name="folder" size={16} /> : undefined}
          onSelect={() => setLastCommand('archive')}
          data-testid="studio-dropdown-item-disabled"
        >
          {specimenT('common.studio.dropdownItemArchive')}
        </DropdownItem>
      )}
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="dropdown"
      title={t('common.studio.dropdownTitle')}
      subtitle={t('common.studio.dropdownSubtitle')}
      testId="dropdown-gallery"
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
            label={t('common.studio.dropdownPlacementLabel')}
            value={placement}
            options={placementOptions}
            onChange={setPlacement}
          />

          <StudioSegmentedControl
            label={t('common.studio.dropdownOffsetLabel')}
            value={offsetStr}
            options={offsetOptions}
            onChange={setOffsetStr}
          />

          <StudioSegmentedControl
            label={t('common.studio.dropdownMinWidthLabel')}
            value={minWidthStr}
            options={minWidthOptions}
            onChange={setMinWidthStr}
          />

          <StudioSegmentedControl
            label={t('common.studio.dropdownCanvasViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.dropdownGroupsToggle')}
            checked={showGroups}
            onCheckedChange={setShowGroups}
            testId="toggle-dropdown-groups"
          />

          <StudioToggleRow
            label={t('common.studio.dropdownIconsShortcutsToggle')}
            checked={showIconsShortcuts}
            onCheckedChange={setShowIconsShortcuts}
            testId="toggle-dropdown-icons"
          />

          <StudioToggleRow
            label={t('common.studio.dropdownDisabledItemToggle')}
            checked={showDisabled}
            onCheckedChange={setShowDisabled}
            testId="toggle-dropdown-disabled"
          />

          <StudioToggleRow
            label={t('common.studio.dropdownDangerItemToggle')}
            checked={showDanger}
            onCheckedChange={setShowDanger}
            testId="toggle-dropdown-danger"
          />

          <StudioToggleRow
            label={t('common.studio.dropdownAutoFlipToggle')}
            checked={autoFlip}
            onCheckedChange={setAutoFlip}
            testId="toggle-dropdown-autoflip"
          />

          <StudioToggleRow
            label={t('common.studio.dropdownLoopToggle')}
            checked={loop}
            onCheckedChange={setLoop}
            testId="toggle-dropdown-loop"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="resource-actions-menu.tsx"
          cssFileName="resource-actions-menu.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stageActionArea}>
        <p className={styles.stageHelpText}>{t('common.studio.dropdownStageHint')}</p>

        {stageView === 'single' ? (
          <div className={styles.singleSpecimenRow} dir={specimenDir} lang={specimenLangAttr}>
            <div className={styles.specimenStack}>
              <Dropdown
                placement={placement}
                offset={parsedOffset}
                autoFlip={autoFlip}
                dir={specimenDir}
                open={studioOpen}
                onOpenChange={setStudioOpen}
              >
                <DropdownTrigger asChild>
                  <Button
                    variant="secondary"
                    endIcon={<Icon name="chevron-down" size={14} />}
                    data-testid="studio-dropdown-trigger"
                  >
                    {specimenT('common.studio.dropdownTriggerActions')}
                  </Button>
                </DropdownTrigger>

                <DropdownContent
                  minWidth={parsedMinWidth}
                  loop={loop}
                  data-testid="studio-active-dropdown-content"
                >
                  {showGroups ? (
                    <DropdownGroup>
                      <DropdownLabel>
                        {specimenT('common.studio.dropdownGroupWorkspace')}
                      </DropdownLabel>
                      {workspaceItemsJsx}
                    </DropdownGroup>
                  ) : (
                    workspaceItemsJsx
                  )}

                  {showGroups && showDanger && <DropdownSeparator />}

                  {showDanger &&
                    (showGroups ? (
                      <DropdownGroup>
                        <DropdownLabel>
                          {specimenT('common.studio.dropdownGroupDanger')}
                        </DropdownLabel>
                        <DropdownItem
                          variant="danger"
                          startIcon={
                            showIconsShortcuts ? <Icon name="danger" size={16} /> : undefined
                          }
                          shortcut={showIconsShortcuts ? 'Del' : undefined}
                          onSelect={() => setLastCommand('delete')}
                          data-testid="studio-dropdown-item-danger"
                        >
                          {specimenT('common.studio.dropdownItemDelete')}
                        </DropdownItem>
                      </DropdownGroup>
                    ) : (
                      <DropdownItem
                        variant="danger"
                        startIcon={
                          showIconsShortcuts ? <Icon name="danger" size={16} /> : undefined
                        }
                        shortcut={showIconsShortcuts ? 'Del' : undefined}
                        onSelect={() => setLastCommand('delete')}
                        data-testid="studio-dropdown-item-danger"
                      >
                        {specimenT('common.studio.dropdownItemDelete')}
                      </DropdownItem>
                    ))}
                </DropdownContent>
              </Dropdown>

              <p
                className={styles.statusPill}
                role="status"
                aria-live="polite"
                data-testid="studio-dropdown-status"
              >
                {specimenT('common.studio.dropdownLastCommand')}{' '}
                <span className={styles.statusValue} data-testid="studio-dropdown-status-value">
                  {specimenT(commandLabelKeyMap[lastCommand])}
                </span>
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.allPlacementsGrid} dir={specimenDir} lang={specimenLangAttr}>
            {[
              {
                p: 'bottom-start' as const,
                open: gridOpenBottomStart,
                setOpen: setGridOpenBottomStart,
                labelKey: 'common.studio.dropdownPlaceBottomStart' as const,
              },
              {
                p: 'top-start' as const,
                open: gridOpenTopStart,
                setOpen: setGridOpenTopStart,
                labelKey: 'common.studio.dropdownPlaceTopStart' as const,
              },
              {
                p: 'inline-start' as const,
                open: gridOpenInlineStart,
                setOpen: setGridOpenInlineStart,
                labelKey: 'common.studio.dropdownPlaceInlineStart' as const,
              },
              {
                p: 'inline-end' as const,
                open: gridOpenInlineEnd,
                setOpen: setGridOpenInlineEnd,
                labelKey: 'common.studio.dropdownPlaceInlineEnd' as const,
              },
            ].map(({ p, open, setOpen, labelKey }) => (
              <div key={p} className={styles.placementCard}>
                <span className={styles.placementCardLabel} dir="ltr">
                  placement=&quot;{p}&quot;
                </span>
                <Dropdown
                  placement={p}
                  offset={parsedOffset}
                  autoFlip={autoFlip}
                  dir={specimenDir}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <DropdownTrigger asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      endIcon={<Icon name="chevron-down" size={14} />}
                      data-testid={`studio-placement-trigger-${p}`}
                    >
                      {specimenT(labelKey)}
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent minWidth={160} data-testid={`studio-placement-content-${p}`}>
                    <DropdownItem>
                      {specimenT('common.studio.dropdownPlacementCardItem')}
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>
            ))}
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

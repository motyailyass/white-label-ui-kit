'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/icons';
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandFooter,
  type CommandFooterTip,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Kbd,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  type SupportedLocale,
  type TranslationKey,
  translate,
} from '@/i18n';
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
import styles from './command-palette-gallery.module.css';

export interface CommandPaletteGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type CommandGroupId = 'Navigation' | 'Actions' | 'Settings';

interface CommandAction {
  id: string;
  labelKey: TranslationKey;
  group: CommandGroupId;
  shortcut: string;
  icon: IconName;
}

const GROUP_DEFS: readonly { id: CommandGroupId; headingKey: TranslationKey }[] = [
  { id: 'Navigation', headingKey: 'common.studio.cmdGroupNavigation' },
  { id: 'Actions', headingKey: 'common.studio.cmdGroupActions' },
  { id: 'Settings', headingKey: 'common.studio.cmdGroupSettings' },
] as const;

const COMMAND_ACTIONS: readonly CommandAction[] = [
  {
    id: 'nav-dashboard',
    labelKey: 'common.studio.cmdActionDashboard',
    group: 'Navigation',
    shortcut: '⌘D',
    icon: 'home',
  },
  {
    id: 'nav-analytics',
    labelKey: 'common.studio.cmdActionAnalytics',
    group: 'Navigation',
    shortcut: '⌘A',
    icon: 'chart',
  },
  {
    id: 'nav-customers',
    labelKey: 'common.studio.cmdActionCustomers',
    group: 'Navigation',
    shortcut: '⌘C',
    icon: 'user-group-03',
  },
  {
    id: 'nav-billing',
    labelKey: 'common.studio.cmdActionBilling',
    group: 'Navigation',
    shortcut: '⌘B',
    icon: 'building',
  },
  {
    id: 'act-invoice',
    labelKey: 'common.studio.cmdActionNewInvoice',
    group: 'Actions',
    shortcut: '⌘N',
    icon: 'plus',
  },
  {
    id: 'act-export',
    labelKey: 'common.studio.cmdActionExportAudit',
    group: 'Actions',
    shortcut: '⌘E',
    icon: 'download',
  },
  {
    id: 'act-message',
    labelKey: 'common.studio.cmdActionAnnouncement',
    group: 'Actions',
    shortcut: '⌘M',
    icon: 'inbox',
  },
  {
    id: 'set-profile',
    labelKey: 'common.studio.cmdActionOrgProfile',
    group: 'Settings',
    shortcut: '⌘O',
    icon: 'settings',
  },
  {
    id: 'set-theme',
    labelKey: 'common.studio.cmdActionTheme',
    group: 'Settings',
    shortcut: '⌘T',
    icon: 'sun',
  },
  {
    id: 'set-api',
    labelKey: 'common.studio.cmdActionApiKeys',
    group: 'Settings',
    shortcut: '⌘K',
    icon: 'api',
  },
] as const;

export function CommandPaletteGallery({ linkComponent }: CommandPaletteGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastExecuted, setLastExecuted] = useState<{
    labelKey: TranslationKey;
    groupKey: TranslationKey;
  } | null>(null);
  const [showFooterTips, setShowFooterTips] = useState(true);
  const [showShortcuts, setShowShortcuts] = useState(true);

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
    setIsOpen(false);
    setSearchQuery('');
    setLastExecuted(null);
    setShowFooterTips(true);
    setShowShortcuts(true);
  }, [direction]);

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const dirOptions: readonly StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'command-palette-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'command-palette-dir-rtl' },
    ],
    [t],
  );

  const visibleGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return GROUP_DEFS.map((groupDef) => {
      const groupHeading = specimenT(groupDef.headingKey);
      const actions = COMMAND_ACTIONS.filter((action) => {
        if (action.group !== groupDef.id) return false;
        if (!q) return true;
        const label = specimenT(action.labelKey);
        return (
          label.toLowerCase().includes(q) ||
          groupHeading.toLowerCase().includes(q) ||
          action.shortcut.toLowerCase().includes(q)
        );
      });
      return { ...groupDef, groupHeading, actions };
    }).filter((g) => g.actions.length > 0);
  }, [searchQuery, specimenT]);

  const handleSelectAction = (action: CommandAction, groupKey: TranslationKey) => {
    setLastExecuted({ labelKey: action.labelKey, groupKey });
  };

  const footerTips: readonly CommandFooterTip[] = useMemo(
    () => [
      { shortcut: '↑↓', label: specimenT('common.studio.cmdFooterNavigate') },
      { shortcut: '↵', label: specimenT('common.studio.cmdFooterSelect') },
      { shortcut: 'esc', label: specimenT('common.studio.cmdFooterClose') },
    ],
    [specimenT],
  );

  const executedSummary = lastExecuted
    ? `${specimenT(lastExecuted.labelKey)} (${specimenT(lastExecuted.groupKey)})`
    : t('common.studio.cmdSpecNone');

  const specGroups: readonly StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.cmdSpecGroupConfig'),
        items: [
          {
            label: t('common.studio.cmdSpecState'),
            value: isOpen ? t('common.studio.cmdStatusOpen') : t('common.studio.cmdStatusClosed'),
          },
          { label: t('common.studio.cmdSpecActions'), value: t('common.studio.cmdSpecActionsVal') },
          { label: t('common.studio.cmdSpecShortcut'), value: '⌘K / Ctrl+K' },
          { label: t('common.studio.cmdSpecLastExecuted'), value: executedSummary },
        ],
      },
      {
        title: t('common.studio.cmdSpecGroupA11y'),
        items: [
          {
            label: t('common.studio.cmdSpecAriaPattern'),
            value: t('common.studio.cmdSpecAriaPatternVal'),
          },
          { label: t('common.studio.cmdSpecRoving'), value: t('common.studio.cmdSpecRovingVal') },
          {
            label: t('common.studio.cmdSpecTopLayer'),
            value: t('common.studio.cmdSpecTopLayerVal'),
          },
          { label: t('common.studio.cmdSpecFocus'), value: t('common.studio.cmdSpecFocusVal') },
        ],
      },
    ],
    [executedSummary, isOpen, t],
  );

  const jsxSnippet = useMemo(() => {
    const dialogAria = specimenT('common.studio.cmdDialogAriaLabel');
    const inputPlaceholder = specimenT('common.studio.cmdInputPlaceholder');
    const clearLabel = specimenT('common.studio.cmdClearInput');
    const emptyMsg = specimenT('common.studio.cmdEmptyMessage');
    const navHeading = specimenT('common.studio.cmdGroupNavigation');

    return `<CommandDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  aria-label="${dialogAria}"
>
  <CommandInput
    value={searchQuery}
    onValueChange={setSearchQuery}
    aria-label="${specimenT('common.studio.cmdInputAriaLabel')}"
    placeholder="${inputPlaceholder}"
    clearLabel="${clearLabel}"
  />
  <CommandList>
    {navActions.length > 0 && (
      <CommandGroup heading="${navHeading}">
        {navActions.map((item) => (
          <CommandItem
            key={item.id}
            value={item.id}
            icon={<Icon name={item.icon} />}
            ${showShortcuts ? 'shortcut={<CommandShortcut>{item.shortcut}</CommandShortcut>}\n            ' : ''}onSelect={() => execute(item)}
          >
            {item.label}
          </CommandItem>
        ))}
      </CommandGroup>
    )}
    {visibleCount === 0 && <CommandEmpty>${emptyMsg}</CommandEmpty>}
  </CommandList>
  ${showFooterTips ? '<CommandFooter tips={footerTips} />' : '{/* Footer hidden */}'}
</CommandDialog>`;
  }, [showFooterTips, showShortcuts, specimenT]);

  const aiPrompt = useMemo(
    () =>
      `Build an accessible CommandPalette modal dialog: combobox + listbox WAI-ARIA pattern, DOM-ordered roving arrow navigation (ArrowDown/ArrowUp/Home/End/Enter), IME guard, synchronous <dialog> top-layer focus capture & trigger restoration, shortcuts=${showShortcuts}, footerTips=${showFooterTips}, direction=${specimenDir}.`,
    [showFooterTips, showShortcuts, specimenDir],
  );

  return (
    <GalleryStudioLayout
      activeRoute="command-palette"
      title={t('common.studio.commandPaletteTitle')}
      subtitle={t('common.studio.commandPaletteSubtitle')}
      testId="command-palette-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            columns={2}
            onChange={setSpecimenDir}
            options={dirOptions}
          />

          <StudioToggleRow
            label={t('common.studio.cmdToggleFooter')}
            checked={showFooterTips}
            onCheckedChange={setShowFooterTips}
            testId="toggle-command-footer"
          />

          <StudioToggleRow
            label={t('common.studio.cmdToggleShortcuts')}
            checked={showShortcuts}
            onCheckedChange={setShowShortcuts}
            testId="toggle-command-shortcuts"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="command-palette-dialog.tsx"
          cssFileName="command-palette.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="command-palette-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {/* Trigger Stage Card */}
        <div className={styles.triggerCard}>
          <div className={styles.triggerInfo}>
            <h3 className={styles.triggerTitle}>{specimenT('common.studio.cmdTriggerTitle')}</h3>
            <p className={styles.triggerDesc}>
              {specimenT('common.studio.cmdTriggerDesc')}{' '}
              <span className={styles.kbdPair}>
                <BidiText dir="ltr">
                  <Kbd size="md" variant="outline">
                    ⌘K
                  </Kbd>
                </BidiText>
                <span aria-hidden="true">/</span>
                <BidiText dir="ltr">
                  <Kbd size="md" variant="outline">
                    Ctrl+K
                  </Kbd>
                </BidiText>
              </span>
            </p>
          </div>

          <div className={styles.actionRow}>
            <Button
              variant="primary"
              onClick={() => setIsOpen(true)}
              data-testid="command-palette-open-btn"
            >
              {specimenT('common.studio.cmdOpenButton')}
            </Button>

            <span className={styles.statusPill} data-testid="command-palette-status">
              <span>{specimenT('common.studio.cmdStatusLabel')}:</span>
              <strong className={styles.statusValue}>
                {isOpen
                  ? specimenT('common.studio.cmdStatusOpen')
                  : specimenT('common.studio.cmdStatusClosed')}
              </strong>
            </span>
          </div>

          {lastExecuted && (
            <div className={styles.recentActionNotice} data-testid="command-palette-executed">
              <Icon name="check" size={16} />
              <span>
                {specimenT('common.studio.cmdExecutedPrefix')}: <strong>{executedSummary}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Live Top-Layer Command Palette Instance */}
        <CommandDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          dir={specimenDir}
          lang={specimenLangAttr}
          aria-label={specimenT('common.studio.cmdDialogAriaLabel')}
          data-testid="command-palette-dialog"
        >
          <CommandInput
            value={searchQuery}
            onValueChange={setSearchQuery}
            aria-label={specimenT('common.studio.cmdInputAriaLabel')}
            placeholder={specimenT('common.studio.cmdInputPlaceholder')}
            clearLabel={specimenT('common.studio.cmdClearInput')}
            data-testid="command-palette-input"
          />

          <CommandList>
            {visibleGroups.length === 0 ? (
              <CommandEmpty data-testid="command-palette-empty">
                {specimenT('common.studio.cmdEmptyMessage')}
              </CommandEmpty>
            ) : (
              visibleGroups.map((group, groupIndex) => (
                <Fragment key={group.id}>
                  {groupIndex > 0 && <CommandSeparator />}
                  <CommandGroup heading={group.groupHeading}>
                    {group.actions.map((action) => (
                      <CommandItem
                        key={action.id}
                        value={action.id}
                        icon={<Icon name={action.icon} size={16} />}
                        shortcut={
                          showShortcuts ? (
                            <CommandShortcut>{action.shortcut}</CommandShortcut>
                          ) : undefined
                        }
                        onSelect={() => handleSelectAction(action, group.headingKey)}
                        data-testid={`command-palette-item-${action.id}`}
                      >
                        {specimenT(action.labelKey)}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Fragment>
              ))
            )}
          </CommandList>

          {showFooterTips && <CommandFooter tips={footerTips} />}
        </CommandDialog>
      </div>
    </GalleryStudioLayout>
  );
}

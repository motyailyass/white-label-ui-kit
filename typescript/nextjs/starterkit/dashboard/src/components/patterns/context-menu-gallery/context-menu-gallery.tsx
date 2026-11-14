'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon, type IconName } from '@/components/icons';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui';
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
import styles from './context-menu-gallery.module.css';

export type ContextMenuScenario = 'file' | 'invoice' | 'editor';

export interface ContextMenuGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface ActionItem {
  id: string;
  label: string;
  icon: IconName;
  shortcut?: string;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

const DATA_EN = {
  helperText:
    'Right-click or press Shift+F10 on the specimen surface to open the contextual action menu:',
  lastActionLabel: 'Last Triggered Action:',
  none: 'None',
  scenarios: {
    file: {
      label: 'File Asset',
      fileName: 'Architecture_Overview.pdf',
      subtext: '2.4 MB • Modified 2h ago',
      menuLabel: 'File Actions',
      items: [
        { id: 'download', label: 'Download', icon: 'download' as IconName, shortcut: '⌘D' },
        { id: 'share', label: 'Share Link', icon: 'link-square-01' as IconName, shortcut: '⌘S' },
        { id: 'folder', label: 'Organize in Folder', icon: 'folder' as IconName },
        { id: 'duplicate', label: 'Duplicate Asset', icon: 'task' as IconName, disabled: true },
        {
          id: 'delete',
          label: 'Move to Trash',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
    invoice: {
      label: 'Table Record',
      rowId: 'Invoice #INV-2041',
      subtitle: 'Acme Cloud Infrastructure Ltd.',
      amount: '$1,420.00',
      badge: 'Paid',
      menuLabel: 'Record Operations',
      items: [
        { id: 'view', label: 'View Details', icon: 'info' as IconName, shortcut: '⌘O' },
        { id: 'export', label: 'Export PDF', icon: 'download' as IconName, shortcut: '⌘P' },
        {
          id: 'reminder',
          label: 'Send Payment Reminder',
          icon: 'inbox' as IconName,
          disabled: true,
        },
        { id: 'settings', label: 'Audit Log & History', icon: 'settings' as IconName },
        {
          id: 'delete',
          label: 'Archive Record',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
    editor: {
      label: 'Editor Canvas',
      title: 'Workspace Design Canvas',
      subtitle: 'Right-click anywhere across this active workspace to trigger system actions.',
      menuLabel: 'Workspace Tools',
      items: [
        { id: 'inspect', label: 'Inspect Component', icon: 'search' as IconName, shortcut: '⌥⌘I' },
        { id: 'refresh', label: 'Reload Preview', icon: 'loader' as IconName, shortcut: '⌘R' },
        {
          id: 'forward',
          label: 'Step Forward',
          icon: 'arrow-right' as IconName,
          shortcut: '⌘]',
          disabled: true,
        },
        { id: 'share', label: 'Publish Snapshot', icon: 'link-square-01' as IconName },
        {
          id: 'clear',
          label: 'Clear Local Cache',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
  },
};

const DATA_AR = {
  helperText:
    'انقر بزر الفأرة الأيمن أو اضغط Shift+F10 على السطح التفاعلي لفتح قائمة الإجراءات السياقية:',
  lastActionLabel: 'آخر إجراء تم تنفيذه:',
  none: 'لا يوجد',
  scenarios: {
    file: {
      label: 'ملف وثيقة',
      fileName: 'ملف_المخطط_المعماري.pdf',
      subtext: '٢٫٤ ميجابايت • تم التعديل منذ ساعتين',
      menuLabel: 'إجراءات الملف',
      items: [
        { id: 'download', label: 'تنزيل', icon: 'download' as IconName, shortcut: '⌘D' },
        { id: 'share', label: 'مشاركة الرابط', icon: 'link-square-01' as IconName, shortcut: '⌘S' },
        { id: 'folder', label: 'تنظيم في مجلد', icon: 'folder' as IconName },
        { id: 'duplicate', label: 'تكرار العنصر', icon: 'task' as IconName, disabled: true },
        {
          id: 'delete',
          label: 'نقل إلى سلة المهملات',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
    invoice: {
      label: 'سجل جدول',
      rowId: 'فاتورة #INV-2041',
      subtitle: 'شركة أكمي للبنية التحتية السحابية',
      amount: '١٬٤٢٠٫٠٠ $',
      badge: 'مدفوعة',
      menuLabel: 'عمليات السجل',
      items: [
        { id: 'view', label: 'عرض التفاصيل', icon: 'info' as IconName, shortcut: '⌘O' },
        { id: 'export', label: 'تصدير PDF', icon: 'download' as IconName, shortcut: '⌘P' },
        { id: 'reminder', label: 'إرسال تذكير بالدفع', icon: 'inbox' as IconName, disabled: true },
        { id: 'settings', label: 'سجل التدقيق والتاريخ', icon: 'settings' as IconName },
        {
          id: 'delete',
          label: 'أرشفة السجل',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
    editor: {
      label: 'مساحة العمل',
      title: 'مساحة عمل التصميم والمكونات',
      subtitle: 'انقر بزر الفأرة الأيمن في أي نقطة داخل مساحة العمل لتفعيل الأدوات السياقية.',
      menuLabel: 'أدوات مساحة العمل',
      items: [
        { id: 'inspect', label: 'فحص المكون', icon: 'search' as IconName, shortcut: '⌥⌘I' },
        { id: 'refresh', label: 'تحديث المعاينة', icon: 'loader' as IconName, shortcut: '⌘R' },
        {
          id: 'forward',
          label: 'خطوة للأمام',
          icon: 'arrow-left' as IconName,
          shortcut: '⌘]',
          disabled: true,
        },
        { id: 'share', label: 'نشر لقطة للشاشة', icon: 'link-square-01' as IconName },
        {
          id: 'clear',
          label: 'مسح الذاكرة المؤقتة',
          icon: 'danger' as IconName,
          variant: 'danger' as const,
        },
      ],
    },
  },
};

export function ContextMenuGallery({ linkComponent }: ContextMenuGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [scenario, setScenario] = useState<ContextMenuScenario>('file');
  const [showShortcuts, setShowShortcuts] = useState<boolean>(true);
  const [showIcons, setShowIcons] = useState<boolean>(true);
  const [hasDisabled, setHasDisabled] = useState<boolean>(true);
  const [hasDanger, setHasDanger] = useState<boolean>(true);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const isRtl = specimenDir === 'rtl';
  const data = isRtl ? DATA_AR : DATA_EN;
  const currentScenario = data.scenarios[scenario];

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setScenario('file');
    setShowShortcuts(true);
    setShowIcons(true);
    setHasDisabled(true);
    setHasDanger(true);
    setLastAction(null);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const scenarioOptions: StudioSegmentedOption<ContextMenuScenario>[] = useMemo(() => {
    return [
      { value: 'file', label: isRtl ? 'ملف وثيقة' : 'File Asset' },
      { value: 'invoice', label: isRtl ? 'سجل بيانات' : 'Data Record' },
      { value: 'editor', label: isRtl ? 'مساحة عمل' : 'Editor Canvas' },
    ];
  }, [isRtl]);

  const activeItems = useMemo(() => {
    return currentScenario.items.filter((item: ActionItem) => {
      if (!hasDanger && item.variant === 'danger') return false;
      if (!hasDisabled && item.disabled) return false;
      return true;
    });
  }, [currentScenario.items, hasDanger, hasDisabled]);

  const jsxSnippet = useMemo(() => {
    const itemsMarkup = activeItems
      .map((item: ActionItem) => {
        const iconMarkup = showIcons ? `\n    <Icon name="${item.icon}" size={16} />` : '';
        const shortcutMarkup =
          showShortcuts && item.shortcut
            ? `\n    <ContextMenuShortcut>${item.shortcut}</ContextMenuShortcut>`
            : '';
        const disabledAttr = item.disabled ? ' disabled' : '';
        const variantAttr = item.variant ? ` variant="${item.variant}"` : '';

        return `  <ContextMenuItem onSelect={() => setAction('${item.label}')}${variantAttr}${disabledAttr}>${iconMarkup}
    <span>${item.label}</span>${shortcutMarkup}
  </ContextMenuItem>`;
      })
      .join('\n');

    return `<ContextMenu>
  <ContextMenuTrigger className={styles.${scenario === 'file' ? 'fileCard' : scenario === 'invoice' ? 'tableRow' : 'editorCanvas'}}>
    {/* Real-world target surface */}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuLabel>${currentScenario.menuLabel}</ContextMenuLabel>
    <ContextMenuSeparator />
${itemsMarkup}
  </ContextMenuContent>
</ContextMenu>`;
  }, [activeItems, currentScenario.menuLabel, scenario, showIcons, showShortcuts]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible context menu using White-Label UI Kit:
- Language & Direction: ${isRtl ? 'Arabic (RTL)' : 'English (LTR)'}
- Scenario: ${scenario} (${currentScenario.label})
- Viewport boundary clamping on secondary-click
- Keyboard navigation: ArrowDown/Up, Home/End, Escape to dismiss
- Features: Icons (${showIcons}), Shortcuts (${showShortcuts}), Destructive item (${hasDanger})
- Compound components: ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuLabel, ContextMenuShortcut`;
  }, [isRtl, scenario, currentScenario.label, showIcons, showShortcuts, hasDanger]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Target Scenario', value: currentScenario.label },
          { label: 'Leading Icons', value: showIcons ? 'Enabled' : 'Disabled' },
          { label: 'Shortcuts', value: showShortcuts ? 'Visible' : 'Hidden' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
          { label: 'Last Action', value: lastAction ?? data.none },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Menu Container', value: 'role="menu" aria-orientation="vertical"' },
          { label: 'Menu Items', value: 'role="menuitem" tabIndex={-1}' },
          { label: 'Keyboard Navigation', value: 'Arrow keys cycle items; Escape dismisses' },
          { label: 'Clamping', value: 'Clamped within viewport boundaries' },
        ],
      },
    ];
  }, [currentScenario.label, showIcons, showShortcuts, specimenDir, lastAction]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={isRtl ? 'سيناريو الهدف' : 'Target Scenario'}
        value={scenario}
        options={scenarioOptions}
        onChange={setScenario}
      />

      <StudioToggleRow
        label={isRtl ? 'إظهار اختصارات المفاتيح' : 'Keyboard Shortcuts'}
        checked={showShortcuts}
        onCheckedChange={setShowShortcuts}
      />

      <StudioToggleRow
        label={isRtl ? 'إظهار أيقونات البداية' : 'Leading Icons'}
        checked={showIcons}
        onCheckedChange={setShowIcons}
      />

      <StudioToggleRow
        label={isRtl ? 'تضمين عناصر معطلة' : 'Include Disabled Item'}
        checked={hasDisabled}
        onCheckedChange={setHasDisabled}
      />

      <StudioToggleRow
        label={isRtl ? 'تضمين إجراء تحذيري' : 'Include Destructive Action'}
        checked={hasDanger}
        onCheckedChange={setHasDanger}
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="context-menu"
      title={t('common.studio.contextMenuTitle')}
      subtitle={t('common.studio.contextMenuSubtitle')}
      testId="gallery-context-menu"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="context-menu.module.css"
          jsxFileName="context-menu.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.stageHeader}>
            <p className={styles.helperText}>{data.helperText}</p>
            <div className={styles.lastActionPill}>
              <span>{data.lastActionLabel}</span>
              <span className={styles.lastActionValue}>{lastAction ?? data.none}</span>
            </div>
          </div>

          <ContextMenu>
            <ContextMenuTrigger data-testid="interactive-context-trigger">
              {scenario === 'file' && (
                <div className={styles.fileCard}>
                  <div className={styles.fileIconWrapper}>
                    <Icon name="attachment" size={24} />
                  </div>
                  <div className={styles.fileMeta}>
                    <span className={styles.fileName}>{data.scenarios.file.fileName}</span>
                    <span className={styles.fileSubtext}>{data.scenarios.file.subtext}</span>
                  </div>
                </div>
              )}

              {scenario === 'invoice' && (
                <div className={styles.tableRow}>
                  <div className={styles.tableCellPrimary}>
                    <span className={styles.tableRowId}>{data.scenarios.invoice.rowId}</span>
                    <span className={styles.tableRowSubtitle}>
                      {data.scenarios.invoice.subtitle}
                    </span>
                  </div>
                  <div className={styles.tableCellSecondary}>
                    <span className={styles.tableAmount}>{data.scenarios.invoice.amount}</span>
                    <span className={styles.tableBadge}>{data.scenarios.invoice.badge}</span>
                  </div>
                </div>
              )}

              {scenario === 'editor' && (
                <div className={styles.editorCanvas}>
                  <Icon name="sliders" size={28} />
                  <p className={styles.editorTitle}>{data.scenarios.editor.title}</p>
                  <p className={styles.editorSubtitle}>{data.scenarios.editor.subtitle}</p>
                </div>
              )}
            </ContextMenuTrigger>

            <ContextMenuContent data-testid="interactive-context-content">
              <ContextMenuLabel>{currentScenario.menuLabel}</ContextMenuLabel>
              <ContextMenuSeparator />
              {activeItems.map((item: ActionItem) => (
                <ContextMenuItem
                  key={item.id}
                  variant={item.variant}
                  disabled={item.disabled}
                  onSelect={() => setLastAction(item.label)}
                >
                  <span className={styles.itemLabelContent}>
                    {showIcons && <Icon name={item.icon} size={16} />}
                    <span>{item.label}</span>
                  </span>
                  {showShortcuts && item.shortcut && (
                    <ContextMenuShortcut>
                      <span dir="ltr">{item.shortcut}</span>
                    </ContextMenuShortcut>
                  )}
                </ContextMenuItem>
              ))}
            </ContextMenuContent>
          </ContextMenu>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

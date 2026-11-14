'use client';

import { useCallback, useMemo, useState } from 'react';
import { ScrollArea, type ScrollAreaOrientation, ScrollBar } from '@/components/ui';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
} from '../gallery-studio';
import styles from './scroll-area-gallery.module.css';

export interface ScrollAreaGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const ACTIVITY_ITEMS_EN = [
  { id: '1', title: 'v2.4.0 Release notes published', time: '10m ago' },
  { id: '2', title: 'Security patch advisory 2026-11', time: '25m ago' },
  { id: '3', title: 'Database automatic backup completed', time: '1h ago' },
  { id: '4', title: 'New team member accepted invite', time: '2h ago' },
  { id: '5', title: 'Edge cluster deployment verified', time: '3h ago' },
  { id: '6', title: 'SSL certificate renewed automatically', time: '5h ago' },
  { id: '7', title: 'Billing monthly invoice settled', time: '1d ago' },
  { id: '8', title: 'Audit stream compliance verified', time: '2d ago' },
  { id: '9', title: 'Production container registry pruned', time: '3d ago' },
  { id: '10', title: 'Webhooks secret rotated successfully', time: '4d ago' },
];

const ACTIVITY_ITEMS_AR = [
  { id: '1', title: 'نشر ملاحظات الإصدار v2.4.0', time: 'منذ 10 د' },
  { id: '2', title: 'تنبيه أمني دوري 2026-11', time: 'منذ 25 د' },
  { id: '3', title: 'اكتمل النسخ الاحتياطي التلقائي للقاعدة', time: 'منذ ساعة' },
  { id: '4', title: 'انضم عضو جديد إلى فريق العمل', time: 'منذ ساعتين' },
  { id: '5', title: 'تم التحقق من نشر المجموعة الطرفية', time: 'منذ 3 س' },
  { id: '6', title: 'تجديد شهادة تشفير SSL تلقائياً', time: 'منذ 5 س' },
  { id: '7', title: 'تمت تسوية الفاتورة الشهرية بنجاح', time: 'منذ يوم' },
  { id: '8', title: 'التحقق من معايير امتثال سجل التدقيق', time: 'منذ يومين' },
  { id: '9', title: 'تنظيف حاويات الإنتاج غير المستخدمة', time: 'منذ 3 أيام' },
  { id: '10', title: 'تدوير مفتاح أسرار خطافات الويب بنجاح', time: 'منذ 4 أيام' },
];

const TAGS_EN = [
  'Next.js 15',
  'React 19',
  'TypeScript 5.7',
  'WAI-ARIA 1.2',
  'CSS Logical Properties',
  'Zero Shadows',
  'White-Label Architecture',
  'Bi-directional RTL/LTR',
  'High Contrast Mode',
  'Touch Target 48px',
];

const TAGS_AR = [
  'نكست جي إس 15',
  'رياكت 19',
  'تايب سكريبت 5.7',
  'معايير WAI-ARIA 1.2',
  'خصائص CSS المنطقية',
  'واجهة خالية من الظلال 100%',
  'بنية العلامات البيضاء النقية',
  'دعم ثنائي الاتجاه RTL/LTR',
  'وضع التباين العالي',
  'أهداف اللمس 48 بكسل',
];

const TABLE_DATA_EN = [
  {
    id: 'EV-101',
    event: 'User Login MFA',
    user: 'admin@system.io',
    status: 'Success',
    timestamp: '2026-11-13 02:15:00 UTC',
  },
  {
    id: 'EV-102',
    event: 'API Key Generated',
    user: 'dev_ops@system.io',
    status: 'Success',
    timestamp: '2026-11-13 01:42:19 UTC',
  },
  {
    id: 'EV-103',
    event: 'Rate Limit Throttled',
    user: 'client_app_v4',
    status: 'Warning',
    timestamp: '2026-11-13 01:10:04 UTC',
  },
  {
    id: 'EV-104',
    event: 'DB Index Rebuilt',
    user: 'system_daemon',
    status: 'Success',
    timestamp: '2026-11-13 00:05:32 UTC',
  },
  {
    id: 'EV-105',
    event: 'Firewall Rule Synced',
    user: 'sec_bot',
    status: 'Success',
    timestamp: '2026-11-12 23:30:11 UTC',
  },
  {
    id: 'EV-106',
    event: 'Storage Volume Expanded',
    user: 'infra_mgr',
    status: 'Success',
    timestamp: '2026-11-12 22:18:45 UTC',
  },
];

const TABLE_DATA_AR = [
  {
    id: 'EV-101',
    event: 'تسجيل دخول متعدد العوامل',
    user: 'admin@system.io',
    status: 'ناجح',
    timestamp: '2026-11-13 02:15:00 ت.ع.م',
  },
  {
    id: 'EV-102',
    event: 'توليد مفتاح واجهة برمجة',
    user: 'dev_ops@system.io',
    status: 'ناجح',
    timestamp: '2026-11-13 01:42:19 ت.ع.م',
  },
  {
    id: 'EV-103',
    event: 'تجاوز حد معدل الطلبات',
    user: 'client_app_v4',
    status: 'تحذير',
    timestamp: '2026-11-13 01:10:04 ت.ع.م',
  },
  {
    id: 'EV-104',
    event: 'إعادة بناء فهارس البيانات',
    user: 'system_daemon',
    status: 'ناجح',
    timestamp: '2026-11-13 00:05:32 ت.ع.م',
  },
  {
    id: 'EV-105',
    event: 'مزامنة قواعد جدار الحماية',
    user: 'sec_bot',
    status: 'ناجح',
    timestamp: '2026-11-12 23:30:11 ت.ع.م',
  },
  {
    id: 'EV-106',
    event: 'توسيع سعة وحدة التخزين',
    user: 'infra_mgr',
    status: 'ناجح',
    timestamp: '2026-11-12 22:18:45 ت.ع.م',
  },
];

export function ScrollAreaGallery({ linkComponent }: ScrollAreaGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [orientation, setOrientation] = useState<ScrollAreaOrientation>('vertical');
  const [maxHeight, setMaxHeight] = useState<number>(240);

  const isRtl = specimenDir === 'rtl';

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setOrientation('vertical');
    setMaxHeight(240);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const orientationOptions: StudioSegmentedOption<ScrollAreaOrientation>[] = [
    { value: 'vertical', label: t('common.studio.scrollAreaVertical') },
    { value: 'horizontal', label: t('common.studio.scrollAreaHorizontal') },
    { value: 'both', label: t('common.studio.scrollAreaBoth') },
  ];

  const heightOptions: StudioSegmentedOption<string>[] = [
    { value: '180', label: '180px' },
    { value: '240', label: '240px' },
    { value: '320', label: '320px' },
  ];

  const activities = isRtl ? ACTIVITY_ITEMS_AR : ACTIVITY_ITEMS_EN;
  const tags = isRtl ? TAGS_AR : TAGS_EN;
  const tableRows = isRtl ? TABLE_DATA_AR : TABLE_DATA_EN;

  const headerTitle = useMemo(() => {
    if (isRtl) {
      if (orientation === 'vertical') return 'موجز سجل الأنشطة والتدقيق';
      if (orientation === 'horizontal') return 'شريط تصنيفات ووسوم النظام';
      return 'مصفوفة سجلات أحداث النظام';
    }
    if (orientation === 'vertical') return 'Audit & Activity Stream';
    if (orientation === 'horizontal') return 'Horizontal System Tags';
    return 'System Event Log Matrix';
  }, [isRtl, orientation]);

  const jsxSnippet = useMemo(() => {
    if (orientation === 'horizontal') {
      return `<ScrollArea orientation="horizontal" className={styles.scrollContainer} aria-label="System tags">
  <div className={styles.horizontalList}>
    {tags.map((tag) => (
      <span key={tag} className={styles.chipItem}>
        {tag}
      </span>
    ))}
  </div>
  <ScrollBar orientation="horizontal" />
</ScrollArea>`;
    }

    if (orientation === 'both') {
      return `<ScrollArea orientation="both" maxHeight={${maxHeight}} className={styles.scrollContainer} aria-label="Event log matrix">
  <div className={styles.tableWrapper}>
    <table className={styles.dataTable}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Event</th>
          <th>User</th>
          <th>Status</th>
          <th>Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.id}</td>
            <td>{row.event}</td>
            <td>{row.user}</td>
            <td>{row.status}</td>
            <td>{row.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
  <ScrollBar orientation="vertical" />
  <ScrollBar orientation="horizontal" />
</ScrollArea>`;
    }

    return `<ScrollArea orientation="vertical" maxHeight={${maxHeight}} className={styles.scrollContainer} aria-label="Recent activity">
  <div className={styles.listGroup}>
    {items.map((item) => (
      <div key={item.id} className={styles.listItem}>
        <div className={styles.itemMain}>
          <span className={styles.statusDot} aria-hidden="true" />
          <span className={styles.itemTitle}>{item.title}</span>
        </div>
        <time className={styles.itemTimestamp}>{item.time}</time>
      </div>
    ))}
  </div>
  <ScrollBar orientation="vertical" />
</ScrollArea>`;
  }, [orientation, maxHeight]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible scroll area using White-Label UI Kit:
- Orientation: ${orientation}
- Max Height: ${maxHeight}px
- Direction: ${specimenDir.toUpperCase()}
- Styled with CSS standard scrollbar-width: thin and 100% logical properties
- Zero shadow compliance for clean surfaces`;
  }, [orientation, maxHeight, specimenDir]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Layout & Axis',
        items: [
          { label: 'Orientation', value: orientation },
          {
            label: 'Max Block Size',
            value: orientation === 'horizontal' ? 'Intrinsic' : `${maxHeight}px`,
          },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & Tokens',
        items: [
          { label: 'Region Semantics', value: 'role="region"' },
          { label: 'Keyboard Focusable', value: 'tabIndex={0}' },
          { label: 'Scrollbar Width', value: 'scrollbar-width: thin' },
          { label: 'Track Styling', value: 'var(--color-border-subtle)' },
        ],
      },
    ];
  }, [orientation, maxHeight, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.scrollAreaOrientation')}
        value={orientation}
        options={orientationOptions}
        onChange={setOrientation}
      />

      {orientation !== 'horizontal' && (
        <StudioSegmentedControl
          label={t('common.studio.scrollAreaMaxHeight')}
          value={String(maxHeight)}
          options={heightOptions}
          onChange={(val) => setMaxHeight(Number(val))}
        />
      )}
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="scroll-area"
      title={t('common.studio.scrollAreaTitle')}
      subtitle={t('common.studio.scrollAreaSubtitle')}
      testId="gallery-scroll-area"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="scroll-area.module.css"
          jsxFileName="scroll-area.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.viewportHeader}>
            <span className={styles.headerTitle}>{headerTitle}</span>
            <span className={styles.headerMeta}>
              {orientation.toUpperCase()}
              {orientation !== 'horizontal' ? ` • Max ${maxHeight}px` : ''}
            </span>
          </div>

          <ScrollArea
            orientation={orientation}
            maxHeight={orientation === 'horizontal' ? undefined : maxHeight}
            className={styles.scrollContainer}
            data-testid="interactive-scroll-area"
            aria-label={headerTitle}
          >
            {orientation === 'horizontal' && (
              <div className={styles.horizontalList}>
                {tags.map((tag) => (
                  <span key={tag} className={styles.chipItem}>
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {orientation === 'vertical' && (
              <div className={styles.listGroup}>
                {activities.map((item) => (
                  <div key={item.id} className={styles.listItem}>
                    <div className={styles.itemMain}>
                      <span className={styles.statusDot} aria-hidden="true" />
                      <span className={styles.itemTitle}>{item.title}</span>
                    </div>
                    <time className={styles.itemTimestamp}>{item.time}</time>
                  </div>
                ))}
              </div>
            )}

            {orientation === 'both' && (
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th className={styles.tableTh}>ID</th>
                      <th className={styles.tableTh}>Event</th>
                      <th className={styles.tableTh}>User</th>
                      <th className={styles.tableTh}>Status</th>
                      <th className={styles.tableTh}>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.id}>
                        <td className={styles.tableTd}>{row.id}</td>
                        <td className={styles.tableTd}>{row.event}</td>
                        <td className={styles.tableTd}>{row.user}</td>
                        <td className={styles.tableTd}>
                          <span
                            className={
                              row.status === 'Success' || row.status === 'ناجح'
                                ? `${styles.statusBadge} ${styles.statusBadgeSuccess}`
                                : styles.statusBadge
                            }
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className={styles.tableTd}>{row.timestamp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <ScrollBar orientation={orientation === 'both' ? 'vertical' : orientation} />
            {orientation === 'both' && <ScrollBar orientation="horizontal" />}
          </ScrollArea>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Spinner,
  Timeline,
  TimelineBody,
  TimelineConnector,
  TimelineContent,
  TimelineHeader,
  TimelineItem,
  TimelinePoint,
  type TimelineStatus,
  TimelineTime,
  TimelineTitle,
} from '@/components/ui';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
} from '../gallery-studio';
import styles from './timeline-gallery.module.css';

export interface TimelineGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface TimelineEvent {
  id: string;
  title: string;
  time: string;
  dateTime: string;
  body: string;
  status: TimelineStatus;
}

const EVENTS_EN: Record<TimelineStatus, TimelineEvent[]> = {
  active: [
    {
      id: 'fork',
      title: 'Repository Fork Created',
      time: '2h ago',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'Workspace branch initialized from upstream baseline.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'Automated Checks Passed',
      time: '1h ago',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'All unit test suites and accessibility audits exited cleanly.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'Edge Deployment',
      time: 'Just now',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'Broadcasting container image to regional edge clusters.',
      status: 'active',
    },
  ],
  complete: [
    {
      id: 'fork',
      title: 'Repository Fork Created',
      time: '2h ago',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'Workspace branch initialized from upstream baseline.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'Automated Checks Passed',
      time: '1h ago',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'All unit test suites and accessibility audits exited cleanly.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'Edge Deployment',
      time: 'Just now',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'Deployed across all global regions.',
      status: 'complete',
    },
  ],
  danger: [
    {
      id: 'fork',
      title: 'Repository Fork Created',
      time: '2h ago',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'Workspace branch initialized from upstream baseline.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'Automated Checks Passed',
      time: '1h ago',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'All unit test suites and accessibility audits exited cleanly.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'Edge Deployment',
      time: 'Just now',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'Failed to verify container checksum during distribution.',
      status: 'danger',
    },
  ],
  default: [
    {
      id: 'fork',
      title: 'Repository Fork Created',
      time: '2h ago',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'Workspace branch initialized from upstream baseline.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'Automated Checks Passed',
      time: '1h ago',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'All unit test suites and accessibility audits exited cleanly.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'Edge Deployment',
      time: 'Pending',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'Queued for pipeline execution.',
      status: 'default',
    },
  ],
};

const EVENTS_AR: Record<TimelineStatus, TimelineEvent[]> = {
  active: [
    {
      id: 'fork',
      title: 'تم إنشاء تفريع للمستودع',
      time: 'منذ ساعتين',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'تمت تهيئة فرع مساحة العمل بنجاح من المستودع الرئيسي.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'اجتياز الفحوصات الآلية',
      time: 'منذ ساعة',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'اكتملت جميع مجموعات الاختبارات وفحص إمكانية الوصول بنجاح.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'النشر على الخوادم الطرفية',
      time: 'الآن',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'جاري توزيع صورة الحاوية عبر المجموعات الطرفية الإقليمية.',
      status: 'active',
    },
  ],
  complete: [
    {
      id: 'fork',
      title: 'تم إنشاء تفريع للمستودع',
      time: 'منذ ساعتين',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'تمت تهيئة فرع مساحة العمل بنجاح من المستودع الرئيسي.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'اجتياز الفحوصات الآلية',
      time: 'منذ ساعة',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'اكتملت جميع مجموعات الاختبارات وفحص إمكانية الوصول بنجاح.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'النشر على الخوادم الطرفية',
      time: 'الآن',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'تم النشر بنجاح عبر جميع المناطق الجغرافية العالمية.',
      status: 'complete',
    },
  ],
  danger: [
    {
      id: 'fork',
      title: 'تم إنشاء تفريع للمستودع',
      time: 'منذ ساعتين',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'تمت تهيئة فرع مساحة العمل بنجاح من المستودع الرئيسي.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'اجتياز الفحوصات الآلية',
      time: 'منذ ساعة',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'اكتملت جميع مجموعات الاختبارات وفحص إمكانية الوصول بنجاح.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'النشر على الخوادم الطرفية',
      time: 'الآن',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'فشل التحقق من المجموع الاختباري للحاوية أثناء التوزيع.',
      status: 'danger',
    },
  ],
  default: [
    {
      id: 'fork',
      title: 'تم إنشاء تفريع للمستودع',
      time: 'منذ ساعتين',
      dateTime: '2026-11-10T09:15:00Z',
      body: 'تمت تهيئة فرع مساحة العمل بنجاح من المستودع الرئيسي.',
      status: 'complete',
    },
    {
      id: 'checks',
      title: 'اجتياز الفحوصات الآلية',
      time: 'منذ ساعة',
      dateTime: '2026-11-10T10:30:00Z',
      body: 'اكتملت جميع مجموعات الاختبارات وفحص إمكانية الوصول بنجاح.',
      status: 'complete',
    },
    {
      id: 'deploy',
      title: 'النشر على الخوادم الطرفية',
      time: 'معلق',
      dateTime: '2026-11-10T11:50:00Z',
      body: 'في انتظار بدء تنفيذ خط الأنابيب.',
      status: 'default',
    },
  ],
};

export function TimelineGallery({ linkComponent }: TimelineGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [pipelineStatus, setPipelineStatus] = useState<TimelineStatus>('active');

  const isRtl = specimenDir === 'rtl';

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setPipelineStatus('active');
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const statusOptions: StudioSegmentedOption<TimelineStatus>[] = useMemo(() => {
    return [
      { value: 'complete', label: isRtl ? 'مكتمل' : 'Complete' },
      { value: 'active', label: isRtl ? 'قيد التنفيذ' : 'In Progress' },
      { value: 'danger', label: isRtl ? 'فشل' : 'Failed' },
      { value: 'default', label: isRtl ? 'معلق' : 'Pending' },
    ];
  }, [isRtl]);

  const events = isRtl ? EVENTS_AR[pipelineStatus] : EVENTS_EN[pipelineStatus];

  const jsxSnippet = useMemo(() => {
    const itemsCode = events
      .map((evt) => {
        const pointInner =
          evt.status === 'active'
            ? '<Spinner size="xs" variant="primary" />'
            : `<Icon name="${evt.status === 'danger' ? 'warning' : 'check'}" size={14} />`;

        return `  <TimelineItem status="${evt.status}">
    <TimelineConnector>
      <TimelinePoint>
        ${pointInner}
      </TimelinePoint>
    </TimelineConnector>
    <TimelineContent>
      <TimelineHeader>
        <TimelineTitle>${evt.title}</TimelineTitle>
        <TimelineTime dateTime="${evt.dateTime}">${evt.time}</TimelineTime>
      </TimelineHeader>
      <TimelineBody>${evt.body}</TimelineBody>
    </TimelineContent>
  </TimelineItem>`;
      })
      .join('\n\n');

    return `<Timeline aria-label="${isRtl ? 'المخطط الزمني للأحداث' : 'Activity timeline'}">
${itemsCode}
</Timeline>`;
  }, [events, isRtl]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible chronological activity timeline using White-Label UI Kit:
- Language & Direction: ${isRtl ? 'Arabic (RTL)' : 'English (LTR)'}
- Pipeline Status: ${pipelineStatus} (complete, active, danger, default)
- Active Loading State: Pure animated <Spinner size="xs" variant="primary" />
- Compound components: Timeline, TimelineItem, TimelineConnector, TimelinePoint, Spinner, TimelineContent, TimelineHeader, TimelineTitle, TimelineTime, TimelineBody`;
  }, [isRtl, pipelineStatus]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Pipeline State', value: pipelineStatus },
          { label: 'Direction', value: specimenDir.toUpperCase() },
          { label: 'Script', value: isRtl ? 'Arabic (العربية)' : 'Latin' },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          {
            label: 'List Container',
            value: `<ol role="list" aria-label="${isRtl ? 'المخطط الزمني للأحداث' : 'Activity timeline'}">`,
          },
          { label: 'Decorative Track', value: 'aria-hidden="true"' },
          { label: 'Semantic Time', value: '<time dateTime="..."> tag' },
        ],
      },
    ];
  }, [pipelineStatus, specimenDir, isRtl]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.timelineStatus')}
        value={pipelineStatus}
        options={statusOptions}
        onChange={setPipelineStatus}
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="timeline"
      title={t('common.studio.timelineTitle')}
      subtitle={t('common.studio.timelineSubtitle')}
      testId="gallery-timeline"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="timeline.module.css"
          jsxFileName="timeline.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <Timeline
            data-testid="interactive-timeline"
            aria-label={isRtl ? 'المخطط الزمني للأحداث' : 'Activity timeline'}
          >
            {events.map((evt) => (
              <TimelineItem key={evt.id} status={evt.status}>
                <TimelineConnector>
                  <TimelinePoint>
                    {evt.status === 'complete' && <Icon name="check" size={14} />}
                    {evt.status === 'danger' && <Icon name="warning" size={14} />}
                    {evt.status === 'active' && <Spinner size="xs" variant="primary" />}
                  </TimelinePoint>
                </TimelineConnector>
                <TimelineContent>
                  <TimelineHeader>
                    <TimelineTitle>{evt.title}</TimelineTitle>
                    <TimelineTime dateTime={evt.dateTime}>{evt.time}</TimelineTime>
                  </TimelineHeader>
                  <TimelineBody>{evt.body}</TimelineBody>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import { StatusDot, type StatusDotSize, type StatusDotStatus } from '@/components/ui';
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
import styles from './status-dot-gallery.module.css';

export interface StatusDotGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function StatusDotGallery({ linkComponent }: StatusDotGalleryProps) {
  const { t, locale } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [status, setStatus] = useState<StatusDotStatus>('online');
  const [size, setSize] = useState<StatusDotSize>('md');
  const [ping, setPing] = useState<boolean>(true);
  const [showLabel, setShowLabel] = useState<boolean>(true);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;

  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setStatus('online');
    setSize('md');
    setPing(true);
    setShowLabel(true);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'status-dot-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'status-dot-dir-rtl' },
    ],
    [t],
  );

  const statusOptions: StudioSegmentedOption<StatusDotStatus>[] = useMemo(
    () => [
      {
        value: 'online',
        label: t('common.studio.statusDotStatusOnline'),
        testId: 'status-dot-status-online',
      },
      {
        value: 'busy',
        label: t('common.studio.statusDotStatusBusy'),
        testId: 'status-dot-status-busy',
      },
      {
        value: 'away',
        label: t('common.studio.statusDotStatusAway'),
        testId: 'status-dot-status-away',
      },
      {
        value: 'offline',
        label: t('common.studio.statusDotStatusOffline'),
        testId: 'status-dot-status-offline',
      },
      {
        value: 'info',
        label: t('common.studio.statusDotStatusInfo'),
        testId: 'status-dot-status-info',
      },
    ],
    [t],
  );

  const sizeOptions: StudioSegmentedOption<StatusDotSize>[] = useMemo(
    () => [
      { value: 'sm', label: t('common.studio.statusDotSizeSm'), testId: 'status-dot-size-sm' },
      { value: 'md', label: t('common.studio.statusDotSizeMd'), testId: 'status-dot-size-md' },
      { value: 'lg', label: t('common.studio.statusDotSizeLg'), testId: 'status-dot-size-lg' },
    ],
    [t],
  );

  const statusLabelsMap: Record<StatusDotStatus, string> = useMemo(
    () => ({
      online: specimenT('common.studio.statusDotLabelOnline'),
      busy: specimenT('common.studio.statusDotLabelBusy'),
      away: specimenT('common.studio.statusDotLabelAway'),
      offline: specimenT('common.studio.statusDotLabelOffline'),
      info: specimenT('common.studio.statusDotLabelInfo'),
    }),
    [specimenT],
  );

  const statusLabel = useMemo(() => {
    return statusLabelsMap[status];
  }, [status, statusLabelsMap]);

  const jsxSnippet = useMemo(() => {
    return `<StatusDot status="${status}" size="${size}"${ping ? ' ping' : ''}${
      showLabel ? ` label="${statusLabel}"` : ` aria-label="${statusLabel}"`
    } />`;
  }, [status, size, ping, showLabel, statusLabel]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible live status indicator dot using White-Label UI Kit:
- Status: ${status} (online, busy, away, offline, info)
- Size: ${size} (sm: 6px, md: 8px, lg: 10px)
- Ping Animation: ${ping ? 'Enabled (radial radar wave)' : 'Disabled'}
- Accessibility: role="status" container with aria-label
- Motion: animated ping disables automatically under prefers-reduced-motion: reduce
- 100% CSS logical properties, dark mode compliant`;
  }, [status, size, ping]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const activeStatusOption = statusOptions.find((o) => o.value === status);
    const activeSizeOption = sizeOptions.find((o) => o.value === size);

    return [
      {
        title: t('common.studio.statusDotSpecConfigTitle'),
        items: [
          { label: t('common.studio.statusDotStatus'), value: activeStatusOption?.label ?? status },
          { label: t('common.studio.statusDotSize'), value: activeSizeOption?.label ?? size },
          {
            label: t('common.studio.statusDotSpecPing'),
            value: ping ? t('common.studio.enabled') : t('common.studio.disabledOption'),
          },
          {
            label: t('common.studio.statusDotSpecVisibleLabel'),
            value: showLabel ? statusLabel : t('common.studio.statusDotSpecNone'),
          },
          { label: t('common.studio.specDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.statusDotSpecA11yTitle'),
        items: [
          { label: t('common.studio.statusDotSpecRole'), value: 'role="status"' },
          { label: t('common.studio.statusDotSpecAriaLabel'), value: statusLabel },
          { label: t('common.studio.statusDotSpecGlyph'), value: 'aria-hidden="true"' },
        ],
      },
    ];
  }, [status, size, ping, showLabel, statusLabel, specimenDir, statusOptions, sizeOptions, t]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.statusDotStatus')}
        value={status}
        options={statusOptions}
        onChange={setStatus}
      />

      <StudioSegmentedControl
        label={t('common.studio.statusDotSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioToggleRow
        label={t('common.studio.statusDotPing')}
        checked={ping}
        onCheckedChange={setPing}
        testId="toggle-status-dot-ping"
      />

      <StudioToggleRow
        label={t('common.studio.statusDotShowLabel')}
        checked={showLabel}
        onCheckedChange={setShowLabel}
        testId="toggle-status-dot-label"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="status-dot"
      title={t('common.studio.statusDotTitle')}
      subtitle={t('common.studio.statusDotSubtitle')}
      testId="gallery-status-dot"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="status-dot.module.css"
          jsxFileName="status-dot.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={specimenLangAttr}>
        <div className={styles.specimenBox}>
          <StatusDot
            status={status}
            size={size}
            ping={ping}
            label={showLabel ? statusLabel : undefined}
            aria-label={showLabel ? undefined : statusLabel}
            statusLabels={statusLabelsMap}
            data-testid="live-status-dot"
          />
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  type HoverCardPlacement,
  HoverCardTrigger,
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
import styles from './hover-card-gallery.module.css';

export interface HoverCardGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const PROFILE_EN = {
  helperText: 'Hover or focus the mention link to inspect user bio & credentials:',
  avatarInitials: 'SM',
  name: 'Sophia Mansour',
  handle: '@sophia',
  bio: 'Lead Systems Architect crafting white-label design systems & multi-tenant platforms.',
  followingCount: '1,420',
  followingLabel: 'Following',
  followersCount: '18.2k',
  followersLabel: 'Followers',
};

const PROFILE_AR = {
  helperText: 'مرر المؤشر أو انتقل إلى رابط الإشارة لعرض الملف الشخصي والصلاحيات:',
  avatarInitials: 'ص.م',
  name: 'صوفيا منصور',
  handle: '@sophia',
  bio: 'مهندسة معمارية أولى للأنظمة تطور منصات وتطبيقات واسعة النطاق وأنظمة تصميم متكاملة.',
  followingCount: '١٬٤٢٠',
  followingLabel: 'تتابعهم',
  followersCount: '١٨٫٢ ألف',
  followersLabel: 'متابعاً',
};

export function HoverCardGallery({ linkComponent }: HoverCardGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [placement, setPlacement] = useState<HoverCardPlacement>('bottom');
  const [openDelay, setOpenDelay] = useState<number>(150);

  const isRtl = specimenDir === 'rtl';
  const profile = isRtl ? PROFILE_AR : PROFILE_EN;

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setPlacement('bottom');
    setOpenDelay(150);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const placementOptions: StudioSegmentedOption<HoverCardPlacement>[] = [
    { value: 'top', label: 'Top' },
    { value: 'bottom', label: 'Bottom' },
    { value: 'start', label: 'Start' },
    { value: 'end', label: 'End' },
  ];

  const delayOptions: StudioSegmentedOption<string>[] = [
    { value: '0', label: '0ms (Instant)' },
    { value: '150', label: '150ms' },
    { value: '300', label: '300ms' },
  ];

  const jsxSnippet = useMemo(() => {
    return `<HoverCard placement="${placement}" openDelay={${openDelay}} closeDelay={150}>
  <HoverCardTrigger className={styles.triggerLink}>
    ${profile.handle}
  </HoverCardTrigger>
  <HoverCardContent>
    <div className={styles.cardContentInner}>
      <div className={styles.authorHeader}>
        <div className={styles.authorAvatar}>${profile.avatarInitials}</div>
        <div className={styles.authorMeta}>
          <span className={styles.authorName}>${profile.name}</span>
          <span className={styles.authorHandle}>${profile.handle}</span>
        </div>
      </div>
      <p className={styles.authorBio}>
        ${profile.bio}
      </p>
      <div className={styles.statsRow}>
        <span className={styles.statItem}><strong>${profile.followingCount}</strong> ${profile.followingLabel}</span>
        <span className={styles.statItem}><strong>${profile.followersCount}</strong> ${profile.followersLabel}</span>
      </div>
    </div>
  </HoverCardContent>
</HoverCard>`;
  }, [placement, openDelay, profile]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible floating preview hover card using White-Label UI Kit:
- Language & Direction: ${isRtl ? 'Arabic (RTL)' : 'English (LTR)'}
- Placement: ${placement} (top, bottom, start, end)
- Open delay: ${openDelay}ms
- Close delay: 150ms
- Safe pointer bridge between trigger and content
- Keyboard accessible: aria-haspopup="dialog", aria-expanded, Escape to dismiss
- Compound components: HoverCard, HoverCardTrigger, HoverCardContent`;
  }, [isRtl, placement, openDelay]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Placement', value: placement },
          { label: 'Open Delay', value: `${openDelay}ms` },
          { label: 'Close Delay', value: '150ms' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Trigger Semantics', value: 'aria-haspopup="dialog"' },
          { label: 'Content Role', value: 'role="dialog" aria-modal="false"' },
          { label: 'Escape Key', value: 'Dismisses card immediately' },
        ],
      },
    ];
  }, [placement, openDelay, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.hoverCardPlacement')}
        value={placement}
        options={placementOptions}
        onChange={setPlacement}
      />

      <StudioSegmentedControl
        label={t('common.studio.hoverCardOpenDelay')}
        value={String(openDelay)}
        options={delayOptions}
        onChange={(val) => setOpenDelay(Number(val))}
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="hover-card"
      title={t('common.studio.hoverCardTitle')}
      subtitle={t('common.studio.hoverCardSubtitle')}
      testId="gallery-hover-card"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="hover-card.module.css"
          jsxFileName="hover-card.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <p className={styles.helperText}>{profile.helperText}</p>

          <HoverCard
            placement={placement}
            openDelay={openDelay}
            closeDelay={150}
            data-testid="interactive-hover-card"
          >
            <HoverCardTrigger className={styles.triggerLink}>{profile.handle}</HoverCardTrigger>
            <HoverCardContent>
              <div className={styles.cardContentInner}>
                <div className={styles.authorHeader}>
                  <div className={styles.authorAvatar}>{profile.avatarInitials}</div>
                  <div className={styles.authorMeta}>
                    <span className={styles.authorName}>{profile.name}</span>
                    <span className={styles.authorHandle}>{profile.handle}</span>
                  </div>
                </div>
                <p className={styles.authorBio}>{profile.bio}</p>
                <div className={styles.statsRow}>
                  <span className={styles.statItem}>
                    <strong>{profile.followingCount}</strong> {profile.followingLabel}
                  </span>
                  <span className={styles.statItem}>
                    <strong>{profile.followersCount}</strong> {profile.followersLabel}
                  </span>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  AvatarGroup,
  type AvatarShape,
  type AvatarSize,
  type AvatarStatus,
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
import styles from './avatar-gallery.module.css';

export type AvatarSpecimenDirection = 'ltr' | 'rtl';
export type AvatarStageView = 'single' | 'matrix';
export type AvatarFallbackMode = 'image' | 'broken' | 'initials' | 'anonymous';

export interface AvatarGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const SAMPLE_PHOTO =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80';
const BROKEN_PHOTO = 'data:image/png;base64,invalid-image-payload';

export function AvatarGallery({ linkComponent }: AvatarGalleryProps) {
  const { t, locale, direction } = useI18n();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<AvatarSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<AvatarStageView>('single');
  const [size, setSize] = useState<AvatarSize>('md');
  const [shape, setShape] = useState<AvatarShape>('circle');
  const [status, setStatus] = useState<AvatarStatus | 'none'>('online');
  const [fallbackMode, setFallbackMode] = useState<AvatarFallbackMode>('image');
  const [isGroup, setIsGroup] = useState(false);

  // Sync specimen preview direction when global LanguageSwitcher changes direction
  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setSize('md');
    setShape('circle');
    setStatus('online');
    setFallbackMode('image');
    setIsGroup(false);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Localized Segmented Control Options
  const dirOptions: readonly StudioSegmentedOption<AvatarSpecimenDirection>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
    ],
    [t],
  );

  const stageViewOptions: readonly StudioSegmentedOption<AvatarStageView>[] = useMemo(
    () => [
      { value: 'single', label: t('common.studio.avatarViewSingle'), testId: 'opt-view-single' },
      { value: 'matrix', label: t('common.studio.avatarViewMatrix'), testId: 'opt-view-matrix' },
    ],
    [t],
  );

  const sizeOptions: readonly StudioSegmentedOption<AvatarSize>[] = useMemo(
    () => [
      { value: 'xs', label: t('common.studio.avatarSizeXs'), testId: 'opt-size-xs' },
      { value: 'sm', label: t('common.studio.avatarSizeSm'), testId: 'opt-size-sm' },
      { value: 'md', label: t('common.studio.avatarSizeMd'), testId: 'opt-size-md' },
      { value: 'lg', label: t('common.studio.avatarSizeLg'), testId: 'opt-size-lg' },
      { value: 'xl', label: t('common.studio.avatarSizeXl'), testId: 'opt-size-xl' },
      { value: '2xl', label: t('common.studio.avatarSize2xl'), testId: 'opt-size-2xl' },
    ],
    [t],
  );

  const shapeOptions: readonly StudioSegmentedOption<AvatarShape>[] = useMemo(
    () => [
      { value: 'circle', label: t('common.studio.avatarShapeCircle'), testId: 'opt-shape-circle' },
      {
        value: 'rounded',
        label: t('common.studio.avatarShapeRounded'),
        testId: 'opt-shape-rounded',
      },
    ],
    [t],
  );

  const statusOptions: readonly StudioSegmentedOption<AvatarStatus | 'none'>[] = useMemo(
    () => [
      { value: 'none', label: t('common.studio.avatarStatusNone'), testId: 'opt-status-none' },
      {
        value: 'online',
        label: t('common.studio.avatarStatusOnline'),
        testId: 'opt-status-online',
      },
      { value: 'away', label: t('common.studio.avatarStatusAway'), testId: 'opt-status-away' },
      { value: 'busy', label: t('common.studio.avatarStatusBusy'), testId: 'opt-status-busy' },
      {
        value: 'offline',
        label: t('common.studio.avatarStatusOffline'),
        testId: 'opt-status-offline',
      },
    ],
    [t],
  );

  const fallbackOptions: readonly StudioSegmentedOption<AvatarFallbackMode>[] = useMemo(
    () => [
      {
        value: 'image',
        label: t('common.studio.avatarFallbackImage'),
        testId: 'opt-fallback-image',
      },
      {
        value: 'broken',
        label: t('common.studio.avatarFallbackBroken'),
        testId: 'opt-fallback-broken',
      },
      {
        value: 'initials',
        label: t('common.studio.avatarFallbackInitials'),
        testId: 'opt-fallback-initials',
      },
      {
        value: 'anonymous',
        label: t('common.studio.avatarFallbackAnon'),
        testId: 'opt-fallback-anon',
      },
    ],
    [t],
  );

  const sampleName = specimenT('common.studio.avatarSampleName');
  const member1 = specimenT('common.studio.avatarSampleMember1');
  const member2 = specimenT('common.studio.avatarSampleMember2');
  const member3 = specimenT('common.studio.avatarSampleMember3');
  const member4 = specimenT('common.studio.avatarSampleMember4');
  const member5 = specimenT('common.studio.avatarSampleMember5');
  const overflowAria = specimenT('common.studio.avatarSampleOverflowAria');

  const getSpecimenStatusLabel = useCallback(
    (s: AvatarStatus) => {
      const statusMap: Record<AvatarStatus, TranslationKey> = {
        online: 'common.studio.avatarStatusOnline',
        away: 'common.studio.avatarStatusAway',
        busy: 'common.studio.avatarStatusBusy',
        offline: 'common.studio.avatarStatusOffline',
      };
      return `${specimenT('common.studio.avatarStatusAriaPrefix')} ${specimenT(statusMap[s])}`;
    },
    [specimenT],
  );

  const activeStatus = status !== 'none' ? status : undefined;

  // Dynamic specimen properties based on fallback mode
  const specimenProps = useMemo(() => {
    switch (fallbackMode) {
      case 'image':
        return { src: SAMPLE_PHOTO, name: sampleName, alt: sampleName };
      case 'broken':
        return { src: BROKEN_PHOTO, name: sampleName, alt: sampleName };
      case 'initials':
        return { name: sampleName };
      case 'anonymous':
      default:
        return {};
    }
  }, [fallbackMode, sampleName]);

  // Dynamic JSX Snippet
  const jsxSnippet = useMemo(() => {
    if (isGroup) {
      return `import { Avatar, AvatarGroup } from '@/components/ui';

export function TeamAvatarStack() {
  return (
    <AvatarGroup max={3} size="${size}" shape="${shape}" overflowAriaLabel="${overflowAria}">
      <Avatar src="/avatars/member-1.jpg" name="${sampleName}" />
      <Avatar name="${member1}" />
      <Avatar name="${member2}" />
      <Avatar name="${member3}" />
      <Avatar name="${member4}" />
    </AvatarGroup>
  );
}`;
    }

    const propsList: string[] = [];
    if (fallbackMode === 'image') {
      propsList.push('src="/avatars/profile.jpg"');
      propsList.push(`alt="${sampleName}"`);
    } else if (fallbackMode === 'broken') {
      propsList.push('src="/avatars/missing.jpg"');
      propsList.push(`name="${sampleName}"`);
    } else if (fallbackMode === 'initials') {
      propsList.push(`name="${sampleName}"`);
    }

    if (size !== 'md') propsList.push(`size="${size}"`);
    if (shape !== 'circle') propsList.push(`shape="${shape}"`);
    if (activeStatus) {
      propsList.push(`status="${activeStatus}"`);
      propsList.push(`statusAriaLabel="${getSpecimenStatusLabel(activeStatus)}"`);
    }

    const body =
      propsList.length === 0
        ? '<Avatar />'
        : propsList.length <= 2
          ? `<Avatar ${propsList.join(' ')} />`
          : `<Avatar\n      ${propsList.join('\n      ')}\n    />`;

    return `import { Avatar } from '@/components/ui';

export function UserAvatar() {
  return (
    ${body}
  );
}`;
  }, [
    isGroup,
    size,
    shape,
    overflowAria,
    sampleName,
    member1,
    member2,
    member3,
    member4,
    fallbackMode,
    activeStatus,
    getSpecimenStatusLabel,
  ]);

  const aiAgentPrompt = useMemo(() => {
    return `Implement a white-label user identity element using the kit's pure Avatar primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`Avatar\` and \`AvatarGroup\` from \`@/components/ui\`.
- Sizing Scale: ${size} (${
      size === 'xs'
        ? '24px'
        : size === 'sm'
          ? '32px'
          : size === 'md'
            ? '40px'
            : size === 'lg'
              ? '48px'
              : size === 'xl'
                ? '56px'
                : '64px'
    } diameter).
- Geometry: ${shape} (${shape === 'circle' ? 'var(--radius-full)' : 'var(--radius-control)'}).
- Fallback Hierarchy: Image → Initials monogram → Anonymous icon.
- Boundary Cutouts: Overlapping groups and status dots use \`2px solid var(--color-surface)\`.
- Shadow Policy: 100% shadow-free in both Dashboard and Website starters.
`;
  }, [jsxSnippet, size, shape]);

  // Measured Spec Groups (100% Localized)
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const sizeMap: Record<AvatarSize, string> = {
      xs: '24px (1.5rem)',
      sm: '32px (2rem)',
      md: '40px (2.5rem)',
      lg: '48px (3rem)',
      xl: '56px (3.5rem)',
      '2xl': '64px (4rem)',
    };
    const fontMap: Record<AvatarSize, string> = {
      xs: '12px (var(--font-size-xs))',
      sm: '12px (var(--font-size-xs))',
      md: '14px (var(--font-size-sm))',
      lg: '18px (var(--font-size-lg))',
      xl: '20px (var(--font-size-xl))',
      '2xl': '24px (var(--font-size-2xl))',
    };
    const overlapMap: Record<AvatarSize, string> = {
      xs: '-8px (-0.5rem)',
      sm: '-10px (-0.625rem)',
      md: '-12px (-0.75rem)',
      lg: '-14px (-0.875rem)',
      xl: '-16px (-1rem)',
      '2xl': '-18px (-1.125rem)',
    };

    const statusLabelMap: Record<AvatarStatus | 'none', string> = {
      none: t('common.studio.avatarStatusNone'),
      online: t('common.studio.avatarStatusOnline'),
      away: t('common.studio.avatarStatusAway'),
      busy: t('common.studio.avatarStatusBusy'),
      offline: t('common.studio.avatarStatusOffline'),
    };

    const fallbackLabelMap: Record<AvatarFallbackMode, string> = {
      image: t('common.studio.avatarFallbackImage'),
      broken: t('common.studio.avatarFallbackBroken'),
      initials: t('common.studio.avatarFallbackInitials'),
      anonymous: t('common.studio.avatarFallbackAnon'),
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.avatarSpecSize'), value: size },
          {
            label: t('common.studio.avatarSpecShape'),
            value:
              shape === 'circle'
                ? t('common.studio.avatarShapeCircle')
                : t('common.studio.avatarShapeRounded'),
          },
          { label: t('common.studio.avatarSpecStatus'), value: statusLabelMap[status] },
          { label: t('common.studio.avatarSpecFallback'), value: fallbackLabelMap[fallbackMode] },
          {
            label: t('common.studio.avatarSpecGroupMode'),
            value: isGroup
              ? t('common.studio.avatarSpecGroupStacked')
              : t('common.studio.avatarSpecGroupSingle'),
          },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.avatarSpecDiameter'), value: sizeMap[size] },
          { label: t('common.studio.avatarSpecMonogramFont'), value: fontMap[size] },
          { label: t('common.studio.avatarSpecStackOverlap'), value: overlapMap[size] },
          {
            label: t('common.studio.avatarSpecCutoutBorder'),
            value: '2px solid var(--color-surface)',
          },
          {
            label: t('common.studio.avatarSpecShadowPolicy'),
            value: t('common.studio.avatarSpecShadowValue'),
          },
        ],
      },
    ];
  }, [fallbackMode, isGroup, shape, size, status, t]);

  return (
    <GalleryStudioLayout
      activeRoute="avatar"
      title={t('common.studio.avatarTitle')}
      subtitle={t('common.studio.avatarSubtitle')}
      testId="avatar-studio"
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
            label={t('common.studio.avatarCanvasViewLabel')}
            value={stageView}
            options={stageViewOptions}
            onChange={setStageView}
          />

          <StudioSegmentedControl
            label={t('common.studio.avatarSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.avatarShapeLabel')}
            value={shape}
            options={shapeOptions}
            onChange={setShape}
          />

          <StudioSegmentedControl
            label={t('common.studio.avatarStatusLabel')}
            value={status}
            options={statusOptions}
            onChange={setStatus}
          />

          <StudioSegmentedControl
            label={t('common.studio.avatarFallbackLabel')}
            value={fallbackMode}
            options={fallbackOptions}
            onChange={setFallbackMode}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.avatarGroupToggle')}
            checked={isGroup}
            onCheckedChange={setIsGroup}
            testId="toggle-group"
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="user-avatar.tsx"
          cssFileName="user-avatar.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.canvasArea} dir={specimenDir} lang={specimenLangAttr}>
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              {isGroup ? (
                <AvatarGroup
                  data-testid="studio-avatar-group"
                  max={3}
                  size={size}
                  shape={shape}
                  overflowAriaLabel={overflowAria}
                >
                  <Avatar
                    src={SAMPLE_PHOTO}
                    name={sampleName}
                    status={activeStatus}
                    statusAriaLabel={
                      activeStatus ? getSpecimenStatusLabel(activeStatus) : undefined
                    }
                  />
                  <Avatar name={member1} />
                  <Avatar name={member2} />
                  <Avatar name={member3} />
                  <Avatar name={member4} />
                </AvatarGroup>
              ) : (
                <Avatar
                  data-testid="studio-avatar"
                  size={size}
                  shape={shape}
                  status={activeStatus}
                  statusAriaLabel={activeStatus ? getSpecimenStatusLabel(activeStatus) : undefined}
                  {...specimenProps}
                />
              )}
            </div>
          </div>
        ) : (
          <div className={styles.matrixGrid} data-testid="avatar-matrix-grid">
            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.avatarMatrixScaleTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Avatar size="xs" name={member1} shape={shape} />
                <Avatar size="sm" name={member2} shape={shape} />
                <Avatar size="md" name={member3} shape={shape} />
                <Avatar size="lg" name={member4} shape={shape} />
                <Avatar size="xl" name={member5} shape={shape} />
                <Avatar size="2xl" name={sampleName} shape={shape} />
              </div>
            </div>

            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.avatarMatrixFallbackTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Avatar
                  size="lg"
                  src={SAMPLE_PHOTO}
                  alt={sampleName}
                  name={sampleName}
                  shape={shape}
                />
                <Avatar size="lg" name={member1} shape={shape} />
                <Avatar size="lg" name={member3} shape={shape} />
                <Avatar size="lg" shape={shape} />
              </div>
            </div>

            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.avatarMatrixStatusTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <Avatar
                  size="md"
                  name={member1}
                  shape={shape}
                  status="online"
                  statusAriaLabel={getSpecimenStatusLabel('online')}
                />
                <Avatar
                  size="md"
                  name={member2}
                  shape={shape}
                  status="away"
                  statusAriaLabel={getSpecimenStatusLabel('away')}
                />
                <Avatar
                  size="md"
                  name={member3}
                  shape={shape}
                  status="busy"
                  statusAriaLabel={getSpecimenStatusLabel('busy')}
                />
                <Avatar
                  size="md"
                  name={member4}
                  shape={shape}
                  status="offline"
                  statusAriaLabel={getSpecimenStatusLabel('offline')}
                />
              </div>
            </div>

            <div className={styles.matrixCard}>
              <h3 className={styles.matrixCardTitle}>
                {specimenT('common.studio.avatarMatrixGroupTitle')}
              </h3>
              <div className={styles.matrixCardContent}>
                <AvatarGroup max={4} size="md" shape={shape} overflowAriaLabel={overflowAria}>
                  <Avatar src={SAMPLE_PHOTO} name={sampleName} />
                  <Avatar name={member1} />
                  <Avatar name={member2} />
                  <Avatar name={member3} />
                  <Avatar name={member4} />
                  <Avatar name={member5} />
                </AvatarGroup>
              </div>
            </div>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

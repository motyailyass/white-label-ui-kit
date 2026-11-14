'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { AspectRatio } from '@/components/ui';
import { type SupportedLocale, type TranslationKey, defaultMessages, translate } from '@/i18n';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
} from '../gallery-studio';
import styles from './aspect-ratio-gallery.module.css';

export interface AspectRatioGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type RatioKey = '16/9' | '4/3' | '1/1' | '21/9';
type ContentType = 'graphic' | 'card';

export function AspectRatioGallery({ linkComponent }: AspectRatioGalleryProps) {
  const { t, locale } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [ratioKey, setRatioKey] = useState<RatioKey>('16/9');
  const [contentType, setContentType] = useState<ContentType>('graphic');

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;

  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setRatioKey('16/9');
    setContentType('graphic');
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      {
        value: 'ltr',
        label: t('common.studio.specimenDirLtr'),
        testId: 'aspect-ratio-dir-ltr',
      },
      {
        value: 'rtl',
        label: t('common.studio.specimenDirRtl'),
        testId: 'aspect-ratio-dir-rtl',
      },
    ],
    [t],
  );

  const ratioOptions: StudioSegmentedOption<RatioKey>[] = useMemo(
    () => [
      {
        value: '16/9',
        label: t('common.studio.aspectRatioRatio16_9'),
        testId: 'aspect-ratio-ratio-16-9',
      },
      {
        value: '4/3',
        label: t('common.studio.aspectRatioRatio4_3'),
        testId: 'aspect-ratio-ratio-4-3',
      },
      {
        value: '1/1',
        label: t('common.studio.aspectRatioRatio1_1'),
        testId: 'aspect-ratio-ratio-1-1',
      },
      {
        value: '21/9',
        label: t('common.studio.aspectRatioRatio21_9'),
        testId: 'aspect-ratio-ratio-21-9',
      },
    ],
    [t],
  );

  const contentOptions: StudioSegmentedOption<ContentType>[] = useMemo(
    () => [
      {
        value: 'graphic',
        label: t('common.studio.aspectRatioContentGraphic'),
        testId: 'aspect-ratio-content-graphic',
      },
      {
        value: 'card',
        label: t('common.studio.aspectRatioContentCard'),
        testId: 'aspect-ratio-content-card',
      },
    ],
    [t],
  );

  const calculatedRatio = useMemo(() => {
    switch (ratioKey) {
      case '4/3':
        return 4 / 3;
      case '1/1':
        return 1;
      case '21/9':
        return 21 / 9;
      case '16/9':
      default:
        return 16 / 9;
    }
  }, [ratioKey]);

  const displayRatio = useMemo(() => ratioKey.replace('/', ':'), [ratioKey]);

  const jsxSnippet = useMemo(() => {
    const formattedProp = ratioKey === '1/1' ? '1' : `"${displayRatio}"`;
    return `<AspectRatio ratio={${formattedProp}}>
  <div className={styles.mediaContainer}>
    <span>${contentType === 'graphic' ? 'Cinematic Video Player' : 'Custom Card'}</span>
  </div>
</AspectRatio>`;
  }, [ratioKey, displayRatio, contentType]);

  const aiPrompt = useMemo(() => {
    return `Create a responsive aspect ratio container using White-Label UI Kit:
- Ratio: ${displayRatio} (${calculatedRatio.toFixed(2)})
- Native CSS aspect-ratio with overflow: hidden
- Content auto-fills absolute canvas container
- 100% CSS logical properties, shadow-free in dashboard`;
  }, [displayRatio, calculatedRatio]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.aspectRatioSpecConfigTitle'),
        items: [
          { label: t('common.studio.aspectRatioRatio'), value: displayRatio },
          {
            label: t('common.studio.aspectRatioSpecCalculated'),
            value: calculatedRatio.toFixed(3),
          },
          {
            label: t('common.studio.aspectRatioSpecContentPreset'),
            value: contentType,
          },
          {
            label: t('common.studio.aspectRatioSpecDirection'),
            value: specimenDir.toUpperCase(),
          },
        ],
      },
      {
        title: t('common.studio.aspectRatioSpecLayoutTitle'),
        items: [
          {
            label: t('common.studio.aspectRatioSpecCssProp'),
            value: `aspect-ratio: ${displayRatio.replace(':', ' / ')}`,
          },
          {
            label: t('common.studio.aspectRatioSpecOverflow'),
            value: 'overflow: hidden',
          },
          {
            label: t('common.studio.aspectRatioSpecContainment'),
            value: 'position: absolute; inset: 0',
          },
        ],
      },
    ];
  }, [t, displayRatio, calculatedRatio, contentType, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.aspectRatioRatio')}
        value={ratioKey}
        options={ratioOptions}
        onChange={setRatioKey}
      />

      <StudioSegmentedControl
        label={t('common.studio.aspectRatioContentType')}
        value={contentType}
        options={contentOptions}
        onChange={setContentType}
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="aspect-ratio"
      title={t('common.studio.aspectRatioTitle')}
      subtitle={t('common.studio.aspectRatioSubtitle')}
      testId="gallery-aspect-ratio"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="aspect-ratio.module.css"
          jsxFileName="aspect-ratio.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={specimenLangAttr}>
        <div className={styles.specimenBox}>
          <div className={styles.ratioFrame}>
            <AspectRatio ratio={calculatedRatio} data-testid="live-aspect-ratio">
              {contentType === 'graphic' ? (
                <div className={styles.mediaCanvas} data-testid="aspect-ratio-media-canvas">
                  <div className={styles.mediaHeader}>
                    <span className={styles.ratioBadge}>{displayRatio}</span>
                    <span className={styles.qualityBadge}>
                      {specimenT('common.studio.aspectRatioResolution')}
                    </span>
                  </div>
                  <div className={styles.mediaCenter}>
                    <div className={styles.playButton} aria-hidden="true">
                      <Icon name="play" />
                    </div>
                  </div>
                  <div className={styles.mediaFooter}>
                    <p className={styles.mediaTitle}>
                      {specimenT('common.studio.aspectRatioMediaTitle')}
                    </p>
                    <div className={styles.mediaMeta}>
                      <span className={styles.timeBadge}>
                        {specimenT('common.studio.aspectRatioBadgeTime')}
                      </span>
                      <span>•</span>
                      <span className={styles.ratioSubtext} data-testid="aspect-ratio-subtext">
                        {specimenT('common.studio.aspectRatioSubtextGraphic')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.cardCanvas} data-testid="aspect-ratio-card-canvas">
                  <div className={styles.cardHeader}>
                    <span className={styles.cardCategory}>
                      <Icon name="image" />
                      <span>UI Kit • Tokens</span>
                    </span>
                    <span className={styles.ratioBadge}>{displayRatio}</span>
                  </div>
                  <div className={styles.cardBody}>
                    <h4 className={styles.cardTitle}>
                      {specimenT('common.studio.aspectRatioCardTitle')}
                    </h4>
                    <p className={styles.cardDesc}>
                      {specimenT('common.studio.aspectRatioCardDescText')}
                    </p>
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.ratioSubtext} data-testid="aspect-ratio-subtext">
                      {specimenT('common.studio.aspectRatioSubtextCard')}
                    </span>
                    <span className={styles.timeBadge}>
                      {specimenT('common.studio.aspectRatioBadgeTime')}
                    </span>
                  </div>
                </div>
              )}
            </AspectRatio>
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

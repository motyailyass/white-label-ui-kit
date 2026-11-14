'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Badge,
  Button,
  Toast,
  ToastAction,
  ToastDescription,
  type ToastPosition,
  ToastTitle,
  type ToastVariant,
  ToastViewport,
} from '@/components/ui';
import { defaultMessages, type SupportedLocale, type TranslationKey, translate } from '@/i18n';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './toast-gallery.module.css';

export interface ToastGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface ActiveToastItem {
  id: string;
  variant: ToastVariant;
  hasAction: boolean;
  duration: number;
}

const VARIANT_CONTENT_KEYS: Record<
  ToastVariant,
  { title: TranslationKey; description: TranslationKey; action: TranslationKey }
> = {
  info: {
    title: 'common.studio.toastSampleInfoTitle',
    description: 'common.studio.toastSampleInfoDesc',
    action: 'common.studio.toastActionDetails',
  },
  success: {
    title: 'common.studio.toastSampleSuccessTitle',
    description: 'common.studio.toastSampleSuccessDesc',
    action: 'common.studio.toastActionDetails',
  },
  warning: {
    title: 'common.studio.toastSampleWarningTitle',
    description: 'common.studio.toastSampleWarningDesc',
    action: 'common.studio.toastActionDetails',
  },
  danger: {
    title: 'common.studio.toastSampleDangerTitle',
    description: 'common.studio.toastSampleDangerDesc',
    action: 'common.studio.toastActionRetry',
  },
};

export function ToastGallery({ linkComponent }: ToastGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [position, setPosition] = useState<ToastPosition>('bottom-end');
  const [variant, setVariant] = useState<ToastVariant>('success');
  const [duration, setDuration] = useState<number>(5000);
  const [hasAction, setHasAction] = useState(true);
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [toasts, setToasts] = useState<ActiveToastItem[]>([]);

  const toastIdRef = useRef(0);

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
    setPosition('bottom-end');
    setVariant('success');
    setDuration(5000);
    setHasAction(true);
    setShowCloseButton(true);
    setToasts([]);
  }, [direction]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const triggerToast = useCallback(() => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [
      ...prev,
      {
        id,
        variant,
        hasAction,
        duration,
      },
    ]);
  }, [variant, hasAction, duration]);

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.toastSpecGroupConfig'),
        items: [
          { label: t('common.studio.toastSpecPlacement'), value: position },
          { label: t('common.studio.toastSpecVariant'), value: variant },
          {
            label: t('common.studio.toastSpecDuration'),
            value:
              duration === 0 ? t('common.studio.toastSpecDurationPersistent') : `${duration}ms`,
          },
          { label: t('common.studio.toastSpecActiveCount'), value: String(toasts.length) },
        ],
      },
      {
        title: t('common.studio.toastSpecGroupA11y'),
        items: [
          {
            label: t('common.studio.toastSpecAriaRoles'),
            value:
              variant === 'danger' || variant === 'warning'
                ? t('common.studio.toastSpecRoleAlert')
                : t('common.studio.toastSpecRoleStatus'),
          },
          {
            label: t('common.studio.toastSpecLandmark'),
            value: t('common.studio.toastSpecLandmarkVal'),
          },
          {
            label: t('common.studio.toastSpecZIndex'),
            value: t('common.studio.toastSpecZIndexVal'),
          },
          { label: t('common.studio.toastSpecPause'), value: t('common.studio.toastSpecPauseVal') },
        ],
      },
    ],
    [duration, position, t, toasts.length, variant],
  );

  const jsxSnippet = useMemo(() => {
    const sampleKeys = VARIANT_CONTENT_KEYS[variant];
    const closeProps = showCloseButton
      ? `    showCloseButton\n    closeLabel="${specimenT('common.studio.toastCloseAriaLabel')}"\n`
      : '    showCloseButton={false}\n';
    const actionBlock = hasAction
      ? `    <ToastAction onClick={() => {}}>${specimenT(sampleKeys.action)}</ToastAction>\n`
      : '';

    return `<ToastViewport position="${position}" label="${specimenT('common.studio.toastRegionLabel')}">
  <Toast
    variant="${variant}"
    duration={${duration}}
${closeProps}    onDismiss={() => dismissToast()}
  >
    <ToastTitle>${specimenT(sampleKeys.title)}</ToastTitle>
    <ToastDescription>${specimenT(sampleKeys.description)}</ToastDescription>
${actionBlock}  </Toast>
</ToastViewport>`;
  }, [duration, hasAction, position, showCloseButton, specimenT, variant]);

  const aiPrompt = useMemo(
    () =>
      `Build an accessible status Toast notification at position="${position}" with variant="${variant}", duration=${duration}ms (pauses on hover and internal focus), hasAction=${hasAction}, showCloseButton=${showCloseButton}, logical RTL alignment, and named ToastViewport region landmark.`,
    [position, variant, duration, hasAction, showCloseButton],
  );

  const staticVariants: readonly ToastVariant[] = ['info', 'success', 'warning', 'danger'];

  return (
    <GalleryStudioLayout
      activeRoute="toast"
      title={t('common.studio.toastTitle')}
      subtitle={t('common.studio.toastSubtitle')}
      testId="toast-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl<'ltr' | 'rtl'>
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            columns={2}
            onChange={setSpecimenDir}
            options={[
              { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'toast-dir-ltr' },
              { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'toast-dir-rtl' },
            ]}
          />

          <StudioSegmentedControl<ToastPosition>
            label={t('common.studio.toastPositionLabel')}
            value={position}
            columns={2}
            onChange={setPosition}
            options={[
              {
                value: 'bottom-end',
                label: t('common.studio.toastPosBottomEnd'),
                testId: 'toast-pos-bottom-end',
              },
              {
                value: 'bottom-start',
                label: t('common.studio.toastPosBottomStart'),
                testId: 'toast-pos-bottom-start',
              },
              {
                value: 'top-end',
                label: t('common.studio.toastPosTopEnd'),
                testId: 'toast-pos-top-end',
              },
              {
                value: 'top-start',
                label: t('common.studio.toastPosTopStart'),
                testId: 'toast-pos-top-start',
              },
              {
                value: 'top-center',
                label: t('common.studio.toastPosTopCenter'),
                testId: 'toast-pos-top-center',
              },
              {
                value: 'bottom-center',
                label: t('common.studio.toastPosBottomCenter'),
                testId: 'toast-pos-bottom-center',
              },
            ]}
          />

          <StudioSegmentedControl<ToastVariant>
            label={t('common.studio.toastVariantLabel')}
            value={variant}
            columns={2}
            onChange={setVariant}
            options={[
              {
                value: 'info',
                label: t('common.studio.toastVariantInfo'),
                testId: 'toast-var-info',
              },
              {
                value: 'success',
                label: t('common.studio.toastVariantSuccess'),
                testId: 'toast-var-success',
              },
              {
                value: 'warning',
                label: t('common.studio.toastVariantWarning'),
                testId: 'toast-var-warning',
              },
              {
                value: 'danger',
                label: t('common.studio.toastVariantDanger'),
                testId: 'toast-var-danger',
              },
            ]}
          />

          <StudioSegmentedControl<string>
            label={t('common.studio.toastDurationLabel')}
            value={String(duration)}
            columns={2}
            onChange={(val) => setDuration(Number(val))}
            options={[
              {
                value: '3000',
                label: t('common.studio.toastDuration3s'),
                testId: 'toast-dur-3000',
              },
              {
                value: '5000',
                label: t('common.studio.toastDuration5s'),
                testId: 'toast-dur-5000',
              },
              {
                value: '8000',
                label: t('common.studio.toastDuration8s'),
                testId: 'toast-dur-8000',
              },
              {
                value: '0',
                label: t('common.studio.toastDurationPersistent'),
                testId: 'toast-dur-0',
              },
            ]}
          />

          <StudioToggleRow
            label={t('common.studio.toastToggleAction')}
            checked={hasAction}
            onCheckedChange={setHasAction}
            testId="toggle-toast-action"
          />

          <StudioToggleRow
            label={t('common.studio.toastToggleClose')}
            checked={showCloseButton}
            onCheckedChange={setShowCloseButton}
            testId="toggle-toast-close"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          jsxFileName="notification-toast.tsx"
          cssFileName="toast.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="toast-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        <div className={styles.triggerCard}>
          <h3 className={styles.triggerTitle}>{specimenT('common.studio.toastLauncherHeading')}</h3>
          <p className={styles.triggerDesc}>{specimenT('common.studio.toastLauncherDesc')}</p>

          <div className={styles.actionRow}>
            <Button variant="primary" onClick={triggerToast} data-testid="trigger-toast-btn">
              {specimenT('common.studio.toastTriggerButton')}
            </Button>
            {toasts.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => setToasts([])}
                data-testid="clear-toasts-btn"
              >
                {specimenT('common.studio.toastClearAll')} ({toasts.length})
              </Button>
            )}
            <Badge
              variant={toasts.length > 0 ? 'info' : 'default'}
              data-testid="toast-active-badge"
            >
              {specimenT('common.studio.toastActiveCount')}: {toasts.length}
            </Badge>
          </div>
        </div>

        {/* Static overview of all 4 semantic variants */}
        <div className={styles.staticPreviewArea}>
          <h3 className={styles.triggerTitle}>{specimenT('common.studio.toastOverviewHeading')}</h3>
          <ul className={styles.previewGrid} data-testid="toast-static-grid">
            {staticVariants.map((itemVariant) => {
              const keys = VARIANT_CONTENT_KEYS[itemVariant];
              return (
                <Toast
                  key={itemVariant}
                  variant={itemVariant}
                  showCloseButton={false}
                  duration={0}
                  data-testid={`static-toast-${itemVariant}`}
                >
                  <ToastTitle>{specimenT(keys.title)}</ToastTitle>
                  <ToastDescription>{specimenT(keys.description)}</ToastDescription>
                </Toast>
              );
            })}
          </ul>
        </div>

        {/* Live screen-anchored Toast Viewport */}
        <ToastViewport
          position={position}
          label={specimenT('common.studio.toastRegionLabel')}
          dir={specimenDir}
          lang={specimenLangAttr}
          data-testid="toast-viewport"
        >
          {toasts.map((item) => {
            const keys = VARIANT_CONTENT_KEYS[item.variant];
            return (
              <Toast
                key={item.id}
                variant={item.variant}
                duration={item.duration}
                onDismiss={() => dismissToast(item.id)}
                data-testid={`live-toast-${item.id}`}
                {...(showCloseButton
                  ? {
                      showCloseButton: true as const,
                      closeLabel: specimenT('common.studio.toastCloseAriaLabel'),
                    }
                  : { showCloseButton: false as const })}
              >
                <ToastTitle>{specimenT(keys.title)}</ToastTitle>
                <ToastDescription>{specimenT(keys.description)}</ToastDescription>
                {item.hasAction && (
                  <ToastAction
                    onClick={() => dismissToast(item.id)}
                    data-testid={`live-toast-action-${item.id}`}
                  >
                    {specimenT(keys.action)}
                  </ToastAction>
                )}
              </Toast>
            );
          })}
        </ToastViewport>
      </div>
    </GalleryStudioLayout>
  );
}

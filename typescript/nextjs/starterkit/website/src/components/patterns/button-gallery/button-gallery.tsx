'use client';

import React, { useCallback, useId, useState } from 'react';
import { Icon } from '@/components/icons';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import type { TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import styles from './button-gallery.module.css';

type FormActionId = 'none' | 'submit' | 'nonSubmit';

const FORM_ACTION_KEY: Record<FormActionId, TranslationKey> = {
  none: 'common.gallery.eventNone',
  submit: 'common.gallery.eventSubmit',
  nonSubmit: 'common.gallery.eventNonSubmit',
};

type SimulatedAsyncState = 'idle' | 'pending' | 'success' | 'retry';

const ASYNC_NOTICE_KEY: Record<SimulatedAsyncState, TranslationKey | null> = {
  idle: null,
  pending: 'common.simulatedPending',
  success: 'common.simulatedSuccess',
  retry: 'common.retry',
};

export function ButtonGallery() {
  const { t } = useI18n();

  // 7. Loading Interaction State (identifier stored in state; translated during render)
  const [asyncState, setAsyncState] = useState<SimulatedAsyncState>('idle');

  const handleSimulatedAsync = useCallback(async () => {
    if (asyncState === 'pending') return;
    setAsyncState('pending');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setAsyncState('success');
    } catch {
      setAsyncState('retry');
    }
  }, [asyncState]);

  // 8. Form Behavior State (identifier stored in state; translated during render)
  const [formSubmitCount, setFormSubmitCount] = useState(0);
  const [lastActionId, setLastActionId] = useState<FormActionId>('none');

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitCount((prev) => prev + 1);
    setLastActionId('submit');
  }, []);

  const handleNonSubmitClick = useCallback(() => {
    setLastActionId('nonSubmit');
  }, []);

  const overviewId = useId();
  const variantsId = useId();
  const sizesId = useId();
  const defaultsId = useId();
  const statesId = useId();
  const iconsId = useId();
  const loadingId = useId();
  const formId = useId();
  const localizationId = useId();
  const themeId = useId();
  const responsiveId = useId();
  const usageId = useId();
  const defaultButtonId = useId();
  const loadingButtonId = useId();

  const activeNoticeKey = ASYNC_NOTICE_KEY[asyncState];

  return (
    <main className={styles.galleryContainer} data-testid="button-gallery">
      {/* Gallery Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.gallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.gallery.subtitle')}</p>
      </header>

      {/* 1. Overview */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.gallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.overviewDesc')}</p>
        <div className={styles.buttonRow}>
          <Button variant="primary">{t('common.save')}</Button>
          <Button variant="secondary">{t('common.cancel')}</Button>
        </div>
      </section>

      {/* 2. Semantic Variants */}
      <section className={styles.section} aria-labelledby={variantsId}>
        <h2 id={variantsId} className={styles.sectionTitle}>
          {t('common.gallery.variantsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.variantsDesc')}</p>
        <div className={styles.buttonRow}>
          <Button variant="primary">{t('common.gallery.variantPrimary')}</Button>
          <Button variant="secondary">{t('common.gallery.variantSecondary')}</Button>
          <Button variant="subtle">{t('common.gallery.variantSubtle')}</Button>
          <Button variant="ghost">{t('common.gallery.variantGhost')}</Button>
          <Button variant="danger">{t('common.delete')}</Button>
        </div>
      </section>

      {/* 3. Six-Step Sizing Scale */}
      <section className={styles.section} aria-labelledby={sizesId}>
        <h2 id={sizesId} className={styles.sectionTitle}>
          {t('common.gallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.sizesDesc')}</p>
        <div className={styles.buttonRow}>
          <Button size="xs">XS (28px)</Button>
          <Button size="sm">SM (32px)</Button>
          <Button size="md">MD (36px)</Button>
          <Button size="lg">LG (40px)</Button>
          <Button size="xl">XL (48px)</Button>
          <Button size="2xl">2XL (56px)</Button>
        </div>
      </section>

      {/* 4. Product-Owned Defaults */}
      <section className={styles.section} aria-labelledby={defaultsId}>
        <h2 id={defaultsId} className={styles.sectionTitle}>
          {t('common.gallery.defaultsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.defaultsDesc')}</p>
        <div className={styles.buttonRow}>
          <Button id={defaultButtonId} data-testid="specimen-btn-default" variant="primary">
            {t('common.gallery.defaultOmitted')}
          </Button>
          <Button variant="secondary">{t('common.gallery.secondaryDefault')}</Button>
        </div>
      </section>

      {/* 5. Interaction States */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.gallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.statesDesc')}</p>
        <div className={styles.columnGrid}>
          <div className={styles.cardItem}>
            <span className={styles.itemLabel}>{t('common.gallery.restingLabel')}</span>
            <Button variant="secondary">{t('common.gallery.restingState')}</Button>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.itemLabel}>{t('common.gallery.disabledLabel')}</span>
            <Button variant="secondary" disabled>
              {t('common.gallery.disabledState')}
            </Button>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.itemLabel}>{t('common.gallery.staticLoadingLabel')}</span>
            <Button variant="secondary" loading>
              {t('common.gallery.loadingState')}
            </Button>
          </div>
        </div>
      </section>

      {/* 6. Icon Slots & Icon-Only Actions */}
      <section className={styles.section} aria-labelledby={iconsId}>
        <h2 id={iconsId} className={styles.sectionTitle}>
          {t('common.gallery.iconsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.iconsDesc')}</p>
        <div className={styles.buttonRow}>
          <Button startIcon={<Icon name="add" />} variant="primary">
            {t('common.gallery.leadingIcon')}
          </Button>
          <Button endIcon={<Icon name="arrow-right" />} variant="secondary">
            {t('common.gallery.trailingDirectionalIcon')}
          </Button>
          <Button
            startIcon={<Icon name="check" />}
            endIcon={<Icon name="arrow-right" />}
            variant="subtle"
          >
            {t('common.gallery.bothIcons')}
          </Button>
          <Button
            size="xl"
            startIcon={<Icon name="add" />}
            variant="secondary"
            data-testid="specimen-btn-xl-icon"
          >
            {t('common.gallery.explicitSizeIcon')}
          </Button>
          <Button variant="ghost" aria-label={t('common.search')} title={t('common.search')}>
            <Icon name="search" />
          </Button>
        </div>
      </section>

      {/* 7. Loading Interaction & Zero Layout Shift */}
      <section className={styles.section} aria-labelledby={loadingId}>
        <h2 id={loadingId} className={styles.sectionTitle}>
          {t('common.gallery.loadingTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.loadingDesc')}</p>
        <div className={styles.buttonRow}>
          <Button
            id={loadingButtonId}
            data-testid="specimen-interactive-loading"
            variant="primary"
            loading={asyncState === 'pending'}
            onClick={handleSimulatedAsync}
            startIcon={<Icon name="check" />}
          >
            {t('common.save')}
          </Button>
        </div>
        {activeNoticeKey && (
          <div role="status" aria-live="polite" className={styles.statusMessage}>
            {t(activeNoticeKey)}
          </div>
        )}
      </section>

      {/* 8. Form Behavior & Submission Safety */}
      <section className={styles.section} aria-labelledby={formId}>
        <h2 id={formId} className={styles.sectionTitle}>
          {t('common.gallery.formTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.formDesc')}</p>
        <form onSubmit={handleFormSubmit} className={styles.formBox}>
          <div className={styles.buttonRow}>
            <Button type="button" variant="secondary" onClick={handleNonSubmitClick}>
              {t('common.cancel')} (type=&quot;button&quot;)
            </Button>
            <Button type="submit" variant="primary">
              {t('common.submit')} (type=&quot;submit&quot;)
            </Button>
          </div>
          <div className={styles.itemLabel}>
            {t('common.gallery.submissions')}: {formSubmitCount} | {t('common.gallery.lastEvent')}:{' '}
            {t(FORM_ACTION_KEY[lastActionId])}
          </div>
        </form>
      </section>

      {/* 9. Localization & Long Labels */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.gallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.localizationDesc')}</p>
        <div className={styles.buttonRow}>
          <Button variant="primary">{t('common.gallery.exportReportLong')}</Button>
          <Button variant="secondary" endIcon={<Icon name="arrow-right" />}>
            {t('common.gallery.proceedNextStep')}
          </Button>
        </div>
      </section>

      {/* 10. Theme & Brand Adaptation */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.gallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.themeDesc')}</p>
        <div className={styles.buttonRow}>
          <Button variant="primary">{t('common.gallery.primaryBrandSurface')}</Button>
          <Button variant="subtle">{t('common.gallery.subtleAccent')}</Button>
          <Button variant="secondary">{t('common.gallery.neutralSurfaceStep')}</Button>
        </div>
      </section>

      {/* 11. Responsive Behavior & Touch Targets */}
      <section className={styles.section} aria-labelledby={responsiveId}>
        <h2 id={responsiveId} className={styles.sectionTitle}>
          {t('common.gallery.responsiveTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.responsiveDesc')}</p>
        <div className={styles.buttonRow}>
          <Button size="xs" touchTarget="auto">
            {t('common.gallery.xsAuto')}
          </Button>
          <Button size="xs" touchTarget="comfortable">
            {t('common.gallery.xsComfortable')}
          </Button>
        </div>
      </section>

      {/* 12. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.gallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.gallery.usageDesc')}</p>
        <pre className={styles.codeBox}>
          <code>{`import { Button } from '@/components/ui';
import { Icon } from '@/components/icons';

// 1. Standard action with leading icon
<Button variant="primary" startIcon={<Icon name="check" />}>
  Save Changes
</Button>

// 2. Async action with layout-stable loading
<Button variant="primary" loading={isPending} onClick={handleSave}>
  Save
</Button>

// 3. Form submit trigger
<Button type="submit" variant="primary">
  Submit
</Button>`}</code>
        </pre>
      </section>
    </main>
  );
}

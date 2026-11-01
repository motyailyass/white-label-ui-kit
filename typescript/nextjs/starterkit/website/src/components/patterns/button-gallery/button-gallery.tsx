'use client';

import React, { useCallback, useId, useState } from 'react';
import { Icon } from '@/components/icons';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/providers';
import styles from './button-gallery.module.css';

export function ButtonGallery() {
  const { t, locale, isRtl } = useI18n();

  // 7. Loading Interaction State
  const [isLoadingActive, setIsLoadingActive] = useState(false);
  const [loadingNotice, setLoadingNotice] = useState<string | null>(null);

  const handleSimulatedAsync = useCallback(async () => {
    if (isLoadingActive) return;
    setIsLoadingActive(true);
    setLoadingNotice(t('common.simulatedPending'));
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLoadingNotice(t('common.simulatedSuccess'));
    } catch {
      setLoadingNotice(t('common.retry'));
    } finally {
      setIsLoadingActive(false);
    }
  }, [isLoadingActive, t]);

  // 8. Form Behavior State
  const [formSubmitCount, setFormSubmitCount] = useState(0);
  const [lastAction, setLastAction] = useState<string>('None');

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitCount((prev) => prev + 1);
    setLastAction('Form Submitted via type="submit"');
  }, []);

  const handleNonSubmitClick = useCallback(() => {
    setLastAction('Non-submit action clicked (did not trigger form submit)');
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
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="subtle">Subtle</Button>
          <Button variant="ghost">Ghost</Button>
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
          <Button id="gallery-btn-default" variant="primary">
            Product Default (Omitted Size)
          </Button>
          <Button variant="secondary">Secondary Default</Button>
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
            <span className={styles.itemLabel}>Resting</span>
            <Button variant="secondary">Resting State</Button>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.itemLabel}>Disabled</span>
            <Button variant="secondary" disabled>
              Disabled State
            </Button>
          </div>
          <div className={styles.cardItem}>
            <span className={styles.itemLabel}>Static Loading</span>
            <Button variant="secondary" loading>
              Loading State
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
            Leading Icon
          </Button>
          <Button endIcon={<Icon name="arrow-right" />} variant="secondary">
            Trailing Directional Icon
          </Button>
          <Button
            startIcon={<Icon name="check" />}
            endIcon={<Icon name="arrow-right" />}
            variant="subtle"
          >
            Both Icons
          </Button>
          <Button variant="ghost" aria-label={t('common.refresh')} title={t('common.refresh')}>
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
            id="gallery-interactive-loading"
            variant="primary"
            loading={isLoadingActive}
            onClick={handleSimulatedAsync}
            startIcon={<Icon name="check" />}
          >
            {t('common.save')}
          </Button>
        </div>
        {loadingNotice && (
          <div role="status" aria-live="polite" className={styles.statusMessage}>
            {loadingNotice}
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
            Submissions: {formSubmitCount} | Last Event: {lastAction}
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
          <Button variant="primary">
            {locale === 'ar'
              ? 'تصدير التقرير المالي المفصل لشهر أكتوبر'
              : locale === 'fr'
                ? "Exporter le rapport financier détaillé d'octobre"
                : 'Export Detailed Financial October Report'}
          </Button>
          <Button variant="secondary" endIcon={<Icon name="arrow-right" />}>
            {isRtl ? 'الانتقال إلى الخطوة التالية' : 'Proceed to Next Step'}
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
          <Button variant="primary">Primary Brand Surface</Button>
          <Button variant="subtle">Subtle Accent</Button>
          <Button variant="secondary">Neutral Surface Step</Button>
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
            XS Auto (Expands on coarse pointer)
          </Button>
          <Button size="xs" touchTarget="comfortable">
            XS Comfortable (Enforces 48px)
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

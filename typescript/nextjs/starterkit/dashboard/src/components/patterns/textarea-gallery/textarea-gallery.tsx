'use client';

import React, { useCallback, useId, useState } from 'react';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import styles from './textarea-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset';

const FORM_STATUS_KEY: Record<FormStatusId, TranslationKey> = {
  none: 'common.textareaGallery.formEventNone',
  pending: 'common.textareaGallery.formEventPending',
  success: 'common.textareaGallery.formEventSuccess',
  reset: 'common.textareaGallery.formEventReset',
};

export function TextareaGallery() {
  const { t } = useI18n();

  // Controlled mode demonstration state
  const [controlledVal, setControlledVal] = useState(
    'Initial controlled multiline text.\nLine two of notes.',
  );

  // Form demo state
  const [formMessage, setFormMessage] = useState('');
  const [formError, setFormError] = useState(false);
  const [formStatusId, setFormStatusId] = useState<FormStatusId>('none');

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formMessage.trim()) {
        setFormError(true);
        return;
      }
      setFormError(false);
      setFormStatusId('pending');
      setTimeout(() => {
        setFormStatusId('success');
      }, 600);
    },
    [formMessage],
  );

  const handleFormReset = useCallback(() => {
    setFormMessage('');
    setFormError(false);
    setFormStatusId('reset');
  }, []);

  const overviewId = useId();
  const densityId = useId();
  const rowsId = useId();
  const statesId = useId();
  const helpErrorId = useId();
  const modesId = useId();
  const localizationId = useId();
  const directionId = useId();
  const responsiveId = useId();
  const formId = useId();
  const usageId = useId();

  const feedbackHelpId = useId();
  const feedbackErrorId = useId();

  return (
    <main className={styles.galleryContainer} data-testid="textarea-gallery">
      {/* Gallery Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.textareaGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.textareaGallery.subtitle')}</p>
      </header>

      {/* 1. Overview */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.textareaGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.overviewDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor="specimen-default" className={styles.label}>
            {t('common.textareaGallery.defaultOmittedLabel')}
          </label>
          <Textarea
            id="specimen-default"
            placeholder={t('common.textareaGallery.defaultOmittedPlaceholder')}
          />
        </div>
      </section>

      {/* 2. Six-Step Density Scale */}
      <section className={styles.section} aria-labelledby={densityId}>
        <h2 id={densityId} className={styles.sectionTitle}>
          {t('common.textareaGallery.densityTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.densityDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-xs" className={styles.label}>
              XS Density
            </label>
            <Textarea
              id="specimen-xs"
              size="xs"
              rows={4}
              defaultValue="XS density multiline text."
              aria-label="XS textarea"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-sm" className={styles.label}>
              SM Density
            </label>
            <Textarea
              id="specimen-sm"
              size="sm"
              rows={4}
              defaultValue="SM density multiline text."
              aria-label="SM textarea"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-md" className={styles.label}>
              MD Density
            </label>
            <Textarea
              id="specimen-md"
              size="md"
              rows={4}
              defaultValue="MD density multiline text."
              aria-label="MD textarea"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-lg" className={styles.label}>
              LG Density
            </label>
            <Textarea
              id="specimen-lg"
              size="lg"
              rows={4}
              defaultValue="LG density multiline text."
              aria-label="LG textarea"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-xl" className={styles.label}>
              XL Density
            </label>
            <Textarea
              id="specimen-xl"
              size="xl"
              rows={4}
              defaultValue="XL density multiline text."
              aria-label="XL textarea"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-2xl" className={styles.label}>
              2XL Density
            </label>
            <Textarea
              id="specimen-2xl"
              size="2xl"
              rows={4}
              defaultValue="2XL density multiline text."
              aria-label="2XL textarea"
            />
          </div>
        </div>
      </section>

      {/* 3. Native Row Counts */}
      <section className={styles.section} aria-labelledby={rowsId}>
        <h2 id={rowsId} className={styles.sectionTitle}>
          {t('common.textareaGallery.rowsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.rowsDesc')}</p>
        <div className={styles.rowFlex}>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-rows-2" className={styles.label}>
              {t('common.textareaGallery.rowsTwoLabel')}
            </label>
            <Textarea
              id="specimen-rows-2"
              rows={2}
              defaultValue="Two visible lines of text by default."
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-rows-4" className={styles.label}>
              {t('common.textareaGallery.rowsFourLabel')}
            </label>
            <Textarea
              id="specimen-rows-4"
              rows={4}
              defaultValue="Four visible lines of text by default."
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-rows-6" className={styles.label}>
              {t('common.textareaGallery.rowsSixLabel')}
            </label>
            <Textarea
              id="specimen-rows-6"
              rows={6}
              defaultValue="Six visible lines of text by default."
            />
          </div>
        </div>
      </section>

      {/* 4. Operational States */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.textareaGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.statesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-resting" className={styles.label}>
              {t('common.textareaGallery.restingLabel')}
            </label>
            <Textarea id="specimen-resting" defaultValue="Resting editable content" />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-disabled" className={styles.label}>
              {t('common.textareaGallery.disabledLabel')}
            </label>
            <Textarea
              id="specimen-disabled"
              disabled
              defaultValue={t('common.textareaGallery.disabledValue')}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-readonly" className={styles.label}>
              {t('common.textareaGallery.readOnlyLabel')}
            </label>
            <Textarea
              id="specimen-readonly"
              readOnly
              defaultValue={t('common.textareaGallery.readOnlyValue')}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-required" className={styles.label}>
              {t('common.textareaGallery.requiredLabel')}
            </label>
            <Textarea
              id="specimen-required"
              required
              placeholder={t('common.textareaGallery.requiredPlaceholder')}
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-invalid" className={styles.label}>
              {t('common.textareaGallery.invalidLabel')}
            </label>
            <Textarea
              id="specimen-invalid"
              aria-invalid="true"
              placeholder={t('common.textareaGallery.invalidPlaceholder')}
            />
          </div>
        </div>
      </section>

      {/* 5. Help & Error Relationships */}
      <section className={styles.section} aria-labelledby={helpErrorId}>
        <h2 id={helpErrorId} className={styles.sectionTitle}>
          {t('common.textareaGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.helpErrorDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor="specimen-helped" className={styles.label}>
            {t('common.textareaGallery.descriptionLabel')}
          </label>
          <Textarea
            id="specimen-helped"
            rows={4}
            placeholder={t('common.textareaGallery.descriptionPlaceholder')}
            aria-describedby={`${feedbackHelpId} ${feedbackErrorId}`}
          />
          <p id={feedbackHelpId} className={styles.helpText}>
            {t('common.textareaGallery.descriptionHelp')}
          </p>
          <p id={feedbackErrorId} className={styles.errorText}>
            {t('common.textareaGallery.descriptionError')}
          </p>
        </div>
      </section>

      {/* 6. Controlled vs Uncontrolled */}
      <section className={styles.section} aria-labelledby={modesId}>
        <h2 id={modesId} className={styles.sectionTitle}>
          {t('common.textareaGallery.modesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.modesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-controlled" className={styles.label}>
              {t('common.textareaGallery.controlledLabel')}
            </label>
            <Textarea
              id="specimen-controlled"
              rows={4}
              value={controlledVal}
              onChange={(e) => setControlledVal(e.target.value)}
            />
            <span className={styles.helpText}>Length: {controlledVal.length} chars</span>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-uncontrolled" className={styles.label}>
              {t('common.textareaGallery.uncontrolledLabel')}
            </label>
            <Textarea
              id="specimen-uncontrolled"
              rows={4}
              defaultValue={t('common.textareaGallery.uncontrolledDefaultValue')}
            />
          </div>
        </div>
      </section>

      {/* 7. Localization & Arabic Specimen */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.textareaGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.localizationDesc')}</p>
        <div className={styles.fieldGroup} lang="ar" dir="rtl">
          <label htmlFor="specimen-arabic" className={styles.label}>
            {t('common.textareaGallery.arabicFeedbackLabel')}
          </label>
          <Textarea
            id="specimen-arabic"
            dir="rtl"
            rows={4}
            placeholder={t('common.textareaGallery.arabicFeedbackPlaceholder')}
          />
        </div>
      </section>

      {/* 8. Text Direction & Mixed Data */}
      <section className={styles.section} aria-labelledby={directionId}>
        <h2 id={directionId} className={styles.sectionTitle}>
          {t('common.textareaGallery.directionTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.directionDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor="specimen-mixed-ltr" className={styles.label}>
            {t('common.textareaGallery.mixedCodeLabel')}
          </label>
          <Textarea
            id="specimen-mixed-ltr"
            dir="ltr"
            rows={4}
            defaultValue={`{\n  "service": "telemetry-worker",\n  "status": "active",\n  "retries": 3\n}`}
          />
        </div>
      </section>

      {/* 9. Responsive & Touch Targets */}
      <section className={styles.section} aria-labelledby={responsiveId}>
        <h2 id={responsiveId} className={styles.sectionTitle}>
          {t('common.inputGallery.responsiveTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.responsiveDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-touch-auto" className={styles.label}>
              {t('common.gallery.xsAuto')}
            </label>
            <Textarea
              id="specimen-touch-auto"
              size="xs"
              rows={2}
              touchTarget="auto"
              defaultValue="XS Auto Target"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor="specimen-touch-comfortable" className={styles.label}>
              {t('common.gallery.xsComfortable')}
            </label>
            <Textarea
              id="specimen-touch-comfortable"
              size="xs"
              rows={2}
              touchTarget="comfortable"
              defaultValue="XS Comfortable Target"
            />
          </div>
        </div>
      </section>

      {/* 10. Real Form Demonstration */}
      <section className={styles.section} aria-labelledby={formId}>
        <h2 id={formId} className={styles.sectionTitle}>
          {t('common.textareaGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.formDemoDesc')}</p>
        <form onSubmit={handleFormSubmit} onReset={handleFormReset} className={styles.formContainer}>
          <div className={styles.fieldGroup}>
            <label htmlFor="form-message" className={styles.label}>
              {t('common.textareaGallery.formMessageLabel')}
            </label>
            <Textarea
              id="form-message"
              rows={4}
              value={formMessage}
              onChange={(e) => {
                setFormMessage(e.target.value);
                if (formError) setFormError(false);
              }}
              placeholder={t('common.textareaGallery.formMessagePlaceholder')}
              aria-invalid={formError ? 'true' : undefined}
            />
            {formError ? (
              <p className={styles.errorText} role="alert">
                {t('common.textareaGallery.formMessageError')}
              </p>
            ) : (
              <p className={styles.helpText}>{t('common.textareaGallery.formMessageHelp')}</p>
            )}
          </div>
          <div className={styles.buttonRow}>
            <Button type="submit" variant="primary">
              {t('common.textareaGallery.formSubmitButton')}
            </Button>
            <Button type="reset" variant="secondary">
              {t('common.textareaGallery.formResetButton')}
            </Button>
          </div>
          <div className={styles.statusMessage} role="status">
            <strong>{t('common.textareaGallery.formStatusPrefix')}:</strong>{' '}
            {t(FORM_STATUS_KEY[formStatusId])}
          </div>
          <span className={styles.helpText}>{t('common.textareaGallery.formDisclaimer')}</span>
        </form>
      </section>

      {/* 11. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.textareaGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.textareaGallery.usageDesc')}</p>
        <pre className={styles.codeBox}>
          <code>{`import { Textarea } from '@/components/ui/textarea';

// Standard 4-row textarea with product preset density
<Textarea
  id="feedback"
  rows={4}
  placeholder="Enter notes..."
  aria-describedby="feedback-help"
/>`}</code>
        </pre>
      </section>
    </main>
  );
}

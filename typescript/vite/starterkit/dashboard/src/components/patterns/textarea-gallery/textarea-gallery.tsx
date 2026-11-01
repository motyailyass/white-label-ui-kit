'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (formStatusId === 'pending') return;
      if (!formMessage.trim()) {
        setFormError(true);
        return;
      }
      setFormError(false);
      setFormStatusId('pending');

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFormStatusId('success');
        timerRef.current = null;
      }, 600);
    },
    [formMessage, formStatusId],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFormMessage('');
    setFormError(false);
    setFormStatusId('reset');
  }, []);

  const baseId = useId();
  const overviewId = `${baseId}-sec-overview`;
  const densityId = `${baseId}-sec-density`;
  const rowsId = `${baseId}-sec-rows`;
  const statesId = `${baseId}-sec-states`;
  const helpErrorId = `${baseId}-sec-help-error`;
  const modesId = `${baseId}-sec-modes`;
  const localizationId = `${baseId}-sec-localization`;
  const directionId = `${baseId}-sec-direction`;
  const responsiveId = `${baseId}-sec-responsive`;
  const formId = `${baseId}-sec-form`;
  const usageId = `${baseId}-sec-usage`;

  // Field IDs
  const defaultFieldId = `${baseId}-default`;
  const densityXsId = `${baseId}-density-xs`;
  const densitySmId = `${baseId}-density-sm`;
  const densityMdId = `${baseId}-density-md`;
  const densityLgId = `${baseId}-density-lg`;
  const densityXlId = `${baseId}-density-xl`;
  const density2xlId = `${baseId}-density-2xl`;

  const rowsTwoId = `${baseId}-rows-2`;
  const rowsFourId = `${baseId}-rows-4`;
  const rowsSixId = `${baseId}-rows-6`;

  const restingFieldId = `${baseId}-resting`;
  const disabledFieldId = `${baseId}-disabled`;
  const readOnlyFieldId = `${baseId}-readonly`;
  const requiredFieldId = `${baseId}-required`;
  const invalidFieldId = `${baseId}-invalid`;

  const feedbackFieldId = `${baseId}-feedback`;
  const feedbackHelpId = `${feedbackFieldId}-help`;
  const feedbackErrorId = `${feedbackFieldId}-error`;

  const controlledFieldId = `${baseId}-controlled`;
  const uncontrolledFieldId = `${baseId}-uncontrolled`;
  const arabicFieldId = `${baseId}-arabic`;
  const mixedCodeFieldId = `${baseId}-mixed-ltr`;

  const touchAutoFieldId = `${baseId}-touch-auto`;
  const touchComfortableFieldId = `${baseId}-touch-comfortable`;

  const formMessageId = `${baseId}-form-message`;
  const formMessageHelpId = `${formMessageId}-help`;
  const formMessageErrorId = `${formMessageId}-error`;

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
          <label htmlFor={defaultFieldId} className={styles.label}>
            {t('common.textareaGallery.defaultOmittedLabel')}
          </label>
          <Textarea
            id={defaultFieldId}
            placeholder={t('common.textareaGallery.defaultOmittedPlaceholder')}
            data-testid="specimen-default"
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
            <label htmlFor={densityXsId} className={styles.label}>
              {t('common.textareaGallery.densityXs')}
            </label>
            <Textarea
              id={densityXsId}
              size="xs"
              rows={4}
              defaultValue={t('common.textareaGallery.densityXsSpecimen')}
              data-testid="specimen-xs"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={densitySmId} className={styles.label}>
              {t('common.textareaGallery.densitySm')}
            </label>
            <Textarea
              id={densitySmId}
              size="sm"
              rows={4}
              defaultValue={t('common.textareaGallery.densitySmSpecimen')}
              data-testid="specimen-sm"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={densityMdId} className={styles.label}>
              {t('common.textareaGallery.densityMd')}
            </label>
            <Textarea
              id={densityMdId}
              size="md"
              rows={4}
              defaultValue={t('common.textareaGallery.densityMdSpecimen')}
              data-testid="specimen-md"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={densityLgId} className={styles.label}>
              {t('common.textareaGallery.densityLg')}
            </label>
            <Textarea
              id={densityLgId}
              size="lg"
              rows={4}
              defaultValue={t('common.textareaGallery.densityLgSpecimen')}
              data-testid="specimen-lg"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={densityXlId} className={styles.label}>
              {t('common.textareaGallery.densityXl')}
            </label>
            <Textarea
              id={densityXlId}
              size="xl"
              rows={4}
              defaultValue={t('common.textareaGallery.densityXlSpecimen')}
              data-testid="specimen-xl"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={density2xlId} className={styles.label}>
              {t('common.textareaGallery.density2xl')}
            </label>
            <Textarea
              id={density2xlId}
              size="2xl"
              rows={4}
              defaultValue={t('common.textareaGallery.density2xlSpecimen')}
              data-testid="specimen-2xl"
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
            <label htmlFor={rowsTwoId} className={styles.label}>
              {t('common.textareaGallery.rowsTwoLabel')}
            </label>
            <Textarea
              id={rowsTwoId}
              rows={2}
              defaultValue={t('common.textareaGallery.rowsTwoSpecimen')}
              data-testid="specimen-rows-2"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={rowsFourId} className={styles.label}>
              {t('common.textareaGallery.rowsFourLabel')}
            </label>
            <Textarea
              id={rowsFourId}
              rows={4}
              defaultValue={t('common.textareaGallery.rowsFourSpecimen')}
              data-testid="specimen-rows-4"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={rowsSixId} className={styles.label}>
              {t('common.textareaGallery.rowsSixLabel')}
            </label>
            <Textarea
              id={rowsSixId}
              rows={6}
              defaultValue={t('common.textareaGallery.rowsSixSpecimen')}
              data-testid="specimen-rows-6"
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
            <label htmlFor={restingFieldId} className={styles.label}>
              {t('common.textareaGallery.restingLabel')}
            </label>
            <Textarea
              id={restingFieldId}
              defaultValue={t('common.textareaGallery.restingValue')}
              data-testid="specimen-resting"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={disabledFieldId} className={styles.label}>
              {t('common.textareaGallery.disabledLabel')}
            </label>
            <Textarea
              id={disabledFieldId}
              disabled
              defaultValue={t('common.textareaGallery.disabledValue')}
              data-testid="specimen-disabled"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={readOnlyFieldId} className={styles.label}>
              {t('common.textareaGallery.readOnlyLabel')}
            </label>
            <Textarea
              id={readOnlyFieldId}
              readOnly
              defaultValue={t('common.textareaGallery.readOnlyValue')}
              data-testid="specimen-readonly"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={requiredFieldId} className={styles.label}>
              {t('common.textareaGallery.requiredLabel')}
            </label>
            <Textarea
              id={requiredFieldId}
              required
              placeholder={t('common.textareaGallery.requiredPlaceholder')}
              data-testid="specimen-required"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={invalidFieldId} className={styles.label}>
              {t('common.textareaGallery.invalidLabel')}
            </label>
            <Textarea
              id={invalidFieldId}
              aria-invalid="true"
              placeholder={t('common.textareaGallery.invalidPlaceholder')}
              data-testid="specimen-invalid"
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
          <label htmlFor={feedbackFieldId} className={styles.label}>
            {t('common.textareaGallery.descriptionLabel')}
          </label>
          <Textarea
            id={feedbackFieldId}
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
            <label htmlFor={controlledFieldId} className={styles.label}>
              {t('common.textareaGallery.controlledLabel')}
            </label>
            <Textarea
              id={controlledFieldId}
              rows={4}
              value={controlledVal}
              onChange={(e) => setControlledVal(e.target.value)}
              data-testid="specimen-controlled"
            />
            <span className={styles.helpText}>
              {t('common.textareaGallery.lengthPrefix')}: {controlledVal.length}{' '}
              {t('common.textareaGallery.lengthChars')}
            </span>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={uncontrolledFieldId} className={styles.label}>
              {t('common.textareaGallery.uncontrolledLabel')}
            </label>
            <Textarea
              id={uncontrolledFieldId}
              rows={4}
              defaultValue={t('common.textareaGallery.uncontrolledDefaultValue')}
              data-testid="specimen-uncontrolled"
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
          <label htmlFor={arabicFieldId} className={styles.label}>
            {t('common.textareaGallery.arabicFeedbackLabel')}
          </label>
          <Textarea
            id={arabicFieldId}
            dir="rtl"
            rows={4}
            placeholder={t('common.textareaGallery.arabicFeedbackPlaceholder')}
            data-testid="specimen-arabic"
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
          <label htmlFor={mixedCodeFieldId} className={styles.label}>
            {t('common.textareaGallery.mixedCodeLabel')}
          </label>
          <Textarea
            id={mixedCodeFieldId}
            dir="ltr"
            rows={4}
            defaultValue={`{\n  "service": "telemetry-worker",\n  "status": "active",\n  "retries": 3\n}`}
            data-testid="specimen-mixed-ltr"
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
            <label htmlFor={touchAutoFieldId} className={styles.label}>
              {t('common.gallery.xsAuto')}
            </label>
            <Textarea
              id={touchAutoFieldId}
              size="xs"
              rows={2}
              touchTarget="auto"
              defaultValue={t('common.textareaGallery.touchAutoSpecimen')}
              data-testid="specimen-touch-auto"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={touchComfortableFieldId} className={styles.label}>
              {t('common.gallery.xsComfortable')}
            </label>
            <Textarea
              id={touchComfortableFieldId}
              size="xs"
              rows={2}
              touchTarget="comfortable"
              defaultValue={t('common.textareaGallery.touchComfortableSpecimen')}
              data-testid="specimen-touch-comfortable"
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
        <form
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          className={styles.formContainer}
        >
          <div className={styles.fieldGroup}>
            <label htmlFor={formMessageId} className={styles.label}>
              {t('common.textareaGallery.formMessageLabel')}
            </label>
            <Textarea
              id={formMessageId}
              rows={4}
              value={formMessage}
              onChange={(e) => {
                setFormMessage(e.target.value);
                if (formError) setFormError(false);
              }}
              placeholder={t('common.textareaGallery.formMessagePlaceholder')}
              aria-invalid={formError ? 'true' : undefined}
              aria-describedby={formError ? formMessageErrorId : formMessageHelpId}
            />
            {formError ? (
              <p id={formMessageErrorId} className={styles.errorText} role="alert">
                {t('common.textareaGallery.formMessageError')}
              </p>
            ) : (
              <p id={formMessageHelpId} className={styles.helpText}>
                {t('common.textareaGallery.formMessageHelp')}
              </p>
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

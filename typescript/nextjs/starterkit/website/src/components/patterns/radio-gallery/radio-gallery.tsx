'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Radio } from '@/components/ui/radio';
import { BidiText, type TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './radio-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset' | 'error';

const FORM_STATUS_MAP: Record<FormStatusId, TranslationKey> = {
  none: 'common.radioGallery.formEventNone',
  pending: 'common.radioGallery.formEventPending',
  success: 'common.radioGallery.formEventSuccess',
  reset: 'common.radioGallery.formEventReset',
  error: 'common.radioGallery.formEventError',
};

const SIZE_LABELS: Record<string, TranslationKey> = {
  xs: 'common.radioGallery.sizeXsLabel',
  sm: 'common.radioGallery.sizeSmLabel',
  md: 'common.radioGallery.sizeMdLabel',
  lg: 'common.radioGallery.sizeLgLabel',
  xl: 'common.radioGallery.sizeXlLabel',
  '2xl': 'common.radioGallery.size2xlLabel',
};

export function RadioGallery() {
  const { t } = useI18n();

  // Controlled mode state
  const [controlledValue, setControlledValue] = useState('dev');

  // Form demonstration state
  const [formCompute, setFormCompute] = useState<string>('shared');
  const [formStatusId, setFormStatusId] = useState<FormStatusId>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (!formCompute) {
        setFormStatusId('error');
        return;
      }

      setIsSubmitting(true);
      setFormStatusId('pending');

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFormStatusId('success');
        setIsSubmitting(false);
        timerRef.current = null;
      }, 800);
    },
    [isSubmitting, formCompute],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFormCompute('shared');
    setIsSubmitting(false);
    setFormStatusId('reset');
  }, []);

  // Section IDs
  const baseId = useId();
  const overviewId = `${baseId}-sec-overview`;
  const sizesId = `${baseId}-sec-sizes`;
  const controlledId = `${baseId}-sec-controlled`;
  const uncontrolledId = `${baseId}-sec-uncontrolled`;
  const statesId = `${baseId}-sec-states`;
  const helpErrorId = `${baseId}-sec-help-error`;
  const independentId = `${baseId}-sec-independent`;
  const localizationId = `${baseId}-sec-localization`;
  const themeId = `${baseId}-sec-theme`;
  const formDemoId = `${baseId}-sec-form-demo`;
  const usageId = `${baseId}-sec-usage`;

  // Field IDs
  const defaultMonthlyId = `${baseId}-def-monthly`;
  const defaultAnnualId = `${baseId}-def-annual`;
  const ctrlDevId = `${baseId}-ctrl-dev`;
  const ctrlStagingId = `${baseId}-ctrl-staging`;
  const ctrlProdId = `${baseId}-ctrl-prod`;
  const unctrlStarterId = `${baseId}-unctrl-starter`;
  const unctrlProId = `${baseId}-unctrl-pro`;
  const unctrlEnterpriseId = `${baseId}-unctrl-enterprise`;
  const reqCardId = `${baseId}-req-card`;
  const reqBankId = `${baseId}-req-bank`;
  const reqHelpId = `${baseId}-req-help`;
  const reqErrorId = `${baseId}-req-error`;
  const grpA1Id = `${baseId}-grp-a1`;
  const grpA2Id = `${baseId}-grp-a2`;
  const grpB1Id = `${baseId}-grp-b1`;
  const grpB2Id = `${baseId}-grp-b2`;
  const arabicId = `${baseId}-arabic-opt`;
  const arabicHelpId = `${arabicId}-help`;
  const mixedId = `${baseId}-mixed-opt`;
  const longLabelId = `${baseId}-long-label-opt`;
  const formSharedId = `${baseId}-form-shared`;
  const formDedicatedId = `${baseId}-form-dedicated`;
  const formGpuId = `${baseId}-form-gpu`;

  return (
    <main className={styles.galleryContainer} data-testid="radio-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.radioGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.radioGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Product Defaults */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.radioGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.overviewDesc')}</p>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>{t('common.radioGallery.defaultLegend')}</legend>
          <div className={styles.fieldRow}>
            <Radio
              id={defaultMonthlyId}
              name={`${baseId}-default-billing`}
              value="monthly"
              defaultChecked
              data-testid="specimen-default"
            />
            <label htmlFor={defaultMonthlyId} className={styles.label}>
              {t('common.radioGallery.defaultOptionMonthly')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Radio
              id={defaultAnnualId}
              name={`${baseId}-default-billing`}
              value="annual"
              data-testid="specimen-default-alt"
            />
            <label htmlFor={defaultAnnualId} className={styles.label}>
              {t('common.radioGallery.defaultOptionAnnual')}
            </label>
          </div>
        </fieldset>
      </section>

      {/* 2. Six-Step Sizing Scale */}
      <section className={styles.section} aria-labelledby={sizesId}>
        <h2 id={sizesId} className={styles.sectionTitle}>
          {t('common.radioGallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.sizesDesc')}</p>
        <div className={styles.scaleGrid}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((sz) => {
            const sizeFieldId = `${baseId}-size-${sz}`;
            return (
              <div key={sz} className={styles.fieldRow}>
                <Radio
                  id={sizeFieldId}
                  name={`${baseId}-scale-group`}
                  value={sz}
                  size={sz}
                  defaultChecked={sz === 'md'}
                  data-testid={`specimen-size-${sz}`}
                />
                <label htmlFor={sizeFieldId} className={styles.label}>
                  {t(SIZE_LABELS[sz])}
                </label>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Controlled Mode */}
      <section className={styles.section} aria-labelledby={controlledId}>
        <h2 id={controlledId} className={styles.sectionTitle}>
          {t('common.radioGallery.controlledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.controlledDesc')}</p>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {t('common.radioGallery.controlledLegend')}
          </legend>
          <div className={styles.fieldRow}>
            <Radio
              id={ctrlDevId}
              name={`${baseId}-controlled-env`}
              value="dev"
              checked={controlledValue === 'dev'}
              onChange={(e) => setControlledValue(e.target.value)}
              data-testid="specimen-controlled-dev"
            />
            <label htmlFor={ctrlDevId} className={styles.label}>
              {t('common.radioGallery.controlledOptDev')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Radio
              id={ctrlStagingId}
              name={`${baseId}-controlled-env`}
              value="staging"
              checked={controlledValue === 'staging'}
              onChange={(e) => setControlledValue(e.target.value)}
              data-testid="specimen-controlled-staging"
            />
            <label htmlFor={ctrlStagingId} className={styles.label}>
              {t('common.radioGallery.controlledOptStaging')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Radio
              id={ctrlProdId}
              name={`${baseId}-controlled-env`}
              value="prod"
              checked={controlledValue === 'prod'}
              onChange={(e) => setControlledValue(e.target.value)}
              data-testid="specimen-controlled-prod"
            />
            <label htmlFor={ctrlProdId} className={styles.label}>
              {t('common.radioGallery.controlledOptProd')}
            </label>
          </div>
        </fieldset>
        <div className={styles.statusCard}>
          <span>{t('common.radioGallery.controlledStatusPrefix')}:</span>
          <span className={styles.statusValue}>{controlledValue}</span>
        </div>
      </section>

      {/* 4. Uncontrolled Mode & Form Reset */}
      <section className={styles.section} aria-labelledby={uncontrolledId}>
        <h2 id={uncontrolledId} className={styles.sectionTitle}>
          {t('common.radioGallery.uncontrolledTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.radioGallery.uncontrolledDesc')}
        </p>
        <form
          onReset={() => {
            // Native form reset behavior
          }}
          className={styles.fieldset}
        >
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.radioGallery.uncontrolledLegend')}
            </legend>
            <div className={styles.fieldRow}>
              <Radio
                id={unctrlStarterId}
                name="tier-choice"
                value="starter"
                defaultChecked
                data-testid="specimen-uncontrolled-starter"
              />
              <label htmlFor={unctrlStarterId} className={styles.label}>
                {t('common.radioGallery.uncontrolledOptStarter')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={unctrlProId}
                name="tier-choice"
                value="pro"
                data-testid="specimen-uncontrolled-pro"
              />
              <label htmlFor={unctrlProId} className={styles.label}>
                {t('common.radioGallery.uncontrolledOptPro')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={unctrlEnterpriseId}
                name="tier-choice"
                value="enterprise"
                data-testid="specimen-uncontrolled-enterprise"
              />
              <label htmlFor={unctrlEnterpriseId} className={styles.label}>
                {t('common.radioGallery.uncontrolledOptEnterprise')}
              </label>
            </div>
          </fieldset>
          <div>
            <Button
              type="reset"
              variant="secondary"
              size="sm"
              data-testid="specimen-uncontrolled-reset-btn"
            >
              {t('common.radioGallery.uncontrolledResetButton')}
            </Button>
          </div>
        </form>
      </section>

      {/* 5. Operational States & Combined Precedence */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.radioGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.statesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-unchecked`}
              name={`${baseId}-state-demo-1`}
              value="unchecked"
              data-testid="specimen-unchecked"
            />
            <label htmlFor={`${baseId}-state-unchecked`} className={styles.label}>
              {t('common.radioGallery.stateUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-checked`}
              name={`${baseId}-state-demo-2`}
              value="checked"
              defaultChecked
              data-testid="specimen-checked"
            />
            <label htmlFor={`${baseId}-state-checked`} className={styles.label}>
              {t('common.radioGallery.stateCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-disabled-unchecked`}
              name={`${baseId}-state-demo-3`}
              value="disabled-unchecked"
              disabled
              data-testid="specimen-disabled-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-disabled-unchecked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateDisabledUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-disabled-checked`}
              name={`${baseId}-state-demo-4`}
              value="disabled-checked"
              disabled
              defaultChecked
              data-testid="specimen-disabled-checked"
            />
            <label
              htmlFor={`${baseId}-state-disabled-checked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateDisabledCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-invalid-unchecked`}
              name={`${baseId}-state-demo-5`}
              value="invalid-unchecked"
              aria-invalid="true"
              data-testid="specimen-invalid-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-unchecked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateInvalidUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-invalid-checked`}
              name={`${baseId}-state-demo-6`}
              value="invalid-checked"
              aria-invalid="true"
              defaultChecked
              data-testid="specimen-invalid-checked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-checked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateInvalidCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-invalid-disabled-unchecked`}
              name={`${baseId}-state-demo-7`}
              value="invalid-disabled-unchecked"
              aria-invalid="true"
              disabled
              data-testid="specimen-invalid-disabled-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-disabled-unchecked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateInvalidDisabledUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-state-invalid-disabled-checked`}
              name={`${baseId}-state-demo-8`}
              value="invalid-disabled-checked"
              aria-invalid="true"
              disabled
              defaultChecked
              data-testid="specimen-invalid-disabled-checked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-disabled-checked`}
              className={styles.label}
            >
              {t('common.radioGallery.stateInvalidDisabledCheckedLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 6. Required Validation & Accessible Relationships */}
      <section className={styles.section} aria-labelledby={helpErrorId}>
        <h2 id={helpErrorId} className={styles.sectionTitle}>
          {t('common.radioGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.helpErrorDesc')}</p>
        <fieldset
          className={styles.fieldset}
          aria-describedby={`${reqHelpId} ${reqErrorId}`}
        >
          <legend className={styles.legend}>
            {t('common.radioGallery.requiredLegend')}
          </legend>
          <div className={styles.fieldRow}>
            <Radio
              id={reqCardId}
              name={`${baseId}-payment-method`}
              value="card"
              required
              data-testid="specimen-required-card"
            />
            <label htmlFor={reqCardId} className={styles.label}>
              {t('common.radioGallery.requiredOptCard')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Radio
              id={reqBankId}
              name={`${baseId}-payment-method`}
              value="bank"
              required
              data-testid="specimen-required-bank"
            />
            <label htmlFor={reqBankId} className={styles.label}>
              {t('common.radioGallery.requiredOptBank')}
            </label>
          </div>
          <span id={reqHelpId} className={styles.helpText}>
            {t('common.radioGallery.requiredHelpText')}
          </span>
          <span id={reqErrorId} className={styles.errorText} role="alert">
            {t('common.radioGallery.requiredErrorText')}
          </span>
        </fieldset>
      </section>

      {/* 7. Independent Groups */}
      <section className={styles.section} aria-labelledby={independentId}>
        <h2 id={independentId} className={styles.sectionTitle}>
          {t('common.radioGallery.independentTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.radioGallery.independentDesc')}
        </p>
        <div className={styles.gridTwo}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.radioGallery.groupALegend')}
            </legend>
            <div className={styles.fieldRow}>
              <Radio
                id={grpA1Id}
                name={`${baseId}-group-a`}
                value="std"
                defaultChecked
                data-testid="specimen-group-a-1"
              />
              <label htmlFor={grpA1Id} className={styles.label}>
                {t('common.radioGallery.groupAOptStandard')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={grpA2Id}
                name={`${baseId}-group-a`}
                value="exp"
                data-testid="specimen-group-a-2"
              />
              <label htmlFor={grpA2Id} className={styles.label}>
                {t('common.radioGallery.groupAOptExpress')}
              </label>
            </div>
          </fieldset>

          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.radioGallery.groupBLegend')}
            </legend>
            <div className={styles.fieldRow}>
              <Radio
                id={grpB1Id}
                name={`${baseId}-group-b`}
                value="box"
                defaultChecked
                data-testid="specimen-group-b-1"
              />
              <label htmlFor={grpB1Id} className={styles.label}>
                {t('common.radioGallery.groupBOptStandard')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={grpB2Id}
                name={`${baseId}-group-b`}
                value="eco"
                data-testid="specimen-group-b-2"
              />
              <label htmlFor={grpB2Id} className={styles.label}>
                {t('common.radioGallery.groupBOptEco')}
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      {/* 8. Localization, RTL & Long Labels */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.radioGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.radioGallery.localizationDesc')}
        </p>
        <div className={styles.fieldset}>
          {/* Explicit Arabic script container */}
          <div dir="rtl" className={styles.fieldset}>
            <div className={styles.fieldRow}>
              <Radio
                id={arabicId}
                name={`${baseId}-arabic-group`}
                value="arabic"
                defaultChecked
                data-testid="specimen-arabic"
              />
              <label htmlFor={arabicId} className={styles.label}>
                {t('common.radioGallery.arabicSpecimenLabel')}
              </label>
            </div>
            <span id={arabicHelpId} className={styles.helpText}>
              {t('common.radioGallery.arabicSpecimenHelp')}
            </span>
          </div>

          {/* Mixed LTR technical code */}
          <div className={styles.fieldRowSpaced}>
            <Radio
              id={mixedId}
              name={`${baseId}-mixed-group`}
              value="sensor"
              defaultChecked
              data-testid="specimen-mixed-code"
            />
            <label htmlFor={mixedId} className={styles.label}>
              Activate telemetry sensor ID:{' '}
              <BidiText dir="ltr">SENS-84920-X</BidiText>
            </label>
          </div>

          {/* Multi-line wrapping label */}
          <div className={styles.fieldRowSpaced}>
            <Radio
              id={longLabelId}
              name={`${baseId}-long-group`}
              value="long"
              defaultChecked
              data-testid="specimen-long-label"
            />
            <label htmlFor={longLabelId} className={styles.label}>
              {t('common.radioGallery.longLabelSpecimen')}
            </label>
          </div>
        </div>
      </section>

      {/* 9. Touch Targets & Theme Parity */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.radioGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.themeDesc')}</p>
        <div className={styles.fieldset}>
          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-touch-auto`}
              name={`${baseId}-touch-group`}
              value="auto"
              touchTarget="auto"
              defaultChecked
              data-testid="specimen-touch-auto"
            />
            <label htmlFor={`${baseId}-touch-auto`} className={styles.label}>
              {t('common.radioGallery.touchAutoSpecimen')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Radio
              id={`${baseId}-touch-comfortable`}
              name={`${baseId}-touch-group`}
              value="comfortable"
              touchTarget="comfortable"
              data-testid="specimen-touch-comfortable"
            />
            <label
              htmlFor={`${baseId}-touch-comfortable`}
              className={styles.label}
            >
              {t('common.radioGallery.touchComfortableSpecimen')}
            </label>
          </div>
        </div>

        <div className={styles.themeSpecimenRow}>
          <div className={`${styles.themeBox} ${styles.themeBoxLight}`}>
            <span className={styles.label}>Light Theme Specimen</span>
            <div className={styles.fieldRow}>
              <Radio
                id={`${baseId}-light-chk`}
                name={`${baseId}-light-theme`}
                value="1"
                defaultChecked
                data-testid="specimen-theme-light"
              />
              <label htmlFor={`${baseId}-light-chk`} className={styles.label}>
                {t('common.radioGallery.themeCheckedLabel')}
              </label>
            </div>
          </div>
          <div className={`${styles.themeBox} ${styles.themeBoxDark}`}>
            <span className={styles.label}>Dark Theme Specimen</span>
            <div className={styles.fieldRow}>
              <Radio
                id={`${baseId}-dark-chk`}
                name={`${baseId}-dark-theme`}
                value="1"
                defaultChecked
                data-testid="specimen-theme-dark"
              />
              <label htmlFor={`${baseId}-dark-chk`} className={styles.label}>
                {t('common.radioGallery.themeCheckedLabel')}
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Local Form Demonstration */}
      <section className={styles.section} aria-labelledby={formDemoId}>
        <h2 id={formDemoId} className={styles.sectionTitle}>
          {t('common.radioGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.formDemoDesc')}</p>
        <form
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          className={styles.formGrid}
          data-testid="gallery-form"
        >
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.radioGallery.formLegend')}
            </legend>
            <div className={styles.fieldRow}>
              <Radio
                id={formSharedId}
                name="compute-plan"
                value="shared"
                checked={formCompute === 'shared'}
                onChange={(e) => setFormCompute(e.target.value)}
                data-testid="specimen-form-shared"
              />
              <label htmlFor={formSharedId} className={styles.label}>
                {t('common.radioGallery.formOptShared')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={formDedicatedId}
                name="compute-plan"
                value="dedicated"
                checked={formCompute === 'dedicated'}
                onChange={(e) => setFormCompute(e.target.value)}
                data-testid="specimen-form-dedicated"
              />
              <label htmlFor={formDedicatedId} className={styles.label}>
                {t('common.radioGallery.formOptDedicated')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Radio
                id={formGpuId}
                name="compute-plan"
                value="gpu"
                checked={formCompute === 'gpu'}
                onChange={(e) => setFormCompute(e.target.value)}
                data-testid="specimen-form-gpu"
              />
              <label htmlFor={formGpuId} className={styles.label}>
                {t('common.radioGallery.formOptGpu')}
              </label>
            </div>
          </fieldset>

          <div className={styles.formActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="specimen-form-submit-btn"
            >
              {t('common.radioGallery.formSubmitButton')}
            </Button>
            <Button
              type="reset"
              variant="secondary"
              data-testid="specimen-form-reset-btn"
            >
              {t('common.radioGallery.formResetButton')}
            </Button>
          </div>

          <div className={styles.statusCard} data-testid="form-status-display">
            <span>{t('common.radioGallery.formStatusPrefix')}:</span>
            <span className={styles.statusValue}>
              {t(FORM_STATUS_MAP[formStatusId])}
            </span>
          </div>
          <span className={styles.helpText}>
            {t('common.radioGallery.formDisclaimer')}
          </span>
        </form>
      </section>

      {/* 11. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.radioGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.radioGallery.usageDesc')}</p>
        <pre className={styles.codeBlock}>
          {`// Standard Uncontrolled Native Group
<fieldset>
  <legend>Select Delivery Speed</legend>
  <div>
    <Radio id="speed-std" name="speed" value="standard" defaultChecked />
    <label htmlFor="speed-std">Standard Shipping</label>
  </div>
  <div>
    <Radio id="speed-exp" name="speed" value="express" />
    <label htmlFor="speed-exp">Express Shipping</label>
  </div>
</fieldset>

// Controlled Group
const [speed, setSpeed] = useState('standard');

<fieldset>
  <legend>Select Delivery Speed</legend>
  <div>
    <Radio
      id="speed-std"
      name="speed"
      value="standard"
      checked={speed === 'standard'}
      onChange={(e) => setSpeed(e.target.value)}
    />
    <label htmlFor="speed-std">Standard Shipping</label>
  </div>
</fieldset>`}
        </pre>
      </section>
    </main>
  );
}

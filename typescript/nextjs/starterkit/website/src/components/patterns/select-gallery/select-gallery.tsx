'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { BidiText, type TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './select-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset' | 'error';

const FORM_STATUS_MAP: Record<FormStatusId, TranslationKey> = {
  none: 'common.selectGallery.formEventNone',
  pending: 'common.selectGallery.formEventPending',
  success: 'common.selectGallery.formEventSuccess',
  reset: 'common.selectGallery.formEventReset',
  error: 'common.selectGallery.formEventError',
};

const SIZE_LABELS: Record<string, TranslationKey> = {
  xs: 'common.selectGallery.sizeXsLabel',
  sm: 'common.selectGallery.sizeSmLabel',
  md: 'common.selectGallery.sizeMdLabel',
  lg: 'common.selectGallery.sizeLgLabel',
  xl: 'common.selectGallery.sizeXlLabel',
  '2xl': 'common.selectGallery.size2xlLabel',
};

export function SelectGallery() {
  const { t } = useI18n();

  // Controlled mode state
  const [controlledChannel, setControlledChannel] = useState('email');

  // Required section validation state (starts without premature error)
  const [requiredCurrency, setRequiredCurrency] = useState('');
  const [requiredError, setRequiredError] = useState(false);

  // Form demonstration state
  const [formPlan, setFormPlan] = useState('');
  const [formAddon, setFormAddon] = useState('');
  const [formStatusId, setFormStatusId] = useState<FormStatusId>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleRequiredValidate = useCallback(() => {
    if (!requiredCurrency) {
      setRequiredError(true);
    } else {
      setRequiredError(false);
    }
  }, [requiredCurrency]);

  const handleRequiredChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setRequiredCurrency(e.target.value);
    if (e.target.value) {
      setRequiredError(false);
    }
  }, []);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (isSubmitting) return;

      if (!formPlan) {
        setFormStatusId('error');
        return;
      }

      setIsSubmitting(true);
      setFormStatusId('pending');

      timerRef.current = setTimeout(() => {
        setIsSubmitting(false);
        setFormStatusId('success');
      }, 1200);
    },
    [isSubmitting, formPlan],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsSubmitting(false);
    setFormPlan('');
    setFormAddon('');
    setFormStatusId('reset');
  }, []);

  // Stable IDs for accessibility
  const overviewId = useId();
  const controlledId = useId();
  const uncontrolledId = useId();
  const requiredId = useId();
  const requiredHelpId = `${requiredId}-help`;
  const requiredErrorId = `${requiredId}-error`;
  const optgroupsId = useId();
  const arabicId = useId();
  const arabicHelpId = `${arabicId}-help`;
  const mixedTechId = useId();
  const longId = useId();
  const formPlanId = useId();
  const formAddonId = useId();

  return (
    <div className={styles.galleryContainer} data-testid="select-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.selectGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.selectGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Product Defaults */}
      <section className={styles.section} aria-labelledby="section-overview">
        <h2 id="section-overview" className={styles.sectionTitle}>
          {t('common.selectGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.overviewDesc')}</p>

        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <label htmlFor={overviewId} className={styles.label}>
              {t('common.selectGallery.defaultPromptOmitted')}
            </label>
            <Select id={overviewId} data-testid="specimen-default" defaultValue="admin">
              <option value="admin">{t('common.selectGallery.defaultOptionAdmin')}</option>
              <option value="editor">{t('common.selectGallery.defaultOptionEditor')}</option>
              <option value="viewer">{t('common.selectGallery.defaultOptionViewer')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor={`${overviewId}-alt`} className={styles.label}>
              {t('common.selectGallery.defaultPromptAlt')}
            </label>
            <Select
              id={`${overviewId}-alt`}
              data-testid="specimen-default-alt"
              defaultValue="editor"
            >
              <option value="admin">{t('common.selectGallery.defaultOptionAdmin')}</option>
              <option value="editor">{t('common.selectGallery.defaultOptionEditor')}</option>
              <option value="viewer">{t('common.selectGallery.defaultOptionViewer')}</option>
            </Select>
          </div>
        </div>
      </section>

      {/* 2. Six-Step Scale */}
      <section className={styles.section} aria-labelledby="section-sizes">
        <h2 id="section-sizes" className={styles.sectionTitle}>
          {t('common.selectGallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.sizesDesc')}</p>

        <div className={styles.scaleGrid}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((size) => (
            <div key={size} className={styles.fieldRow}>
              <label htmlFor={`select-size-${size}`} className={styles.label}>
                {t(SIZE_LABELS[size])}
              </label>
              <Select
                id={`select-size-${size}`}
                size={size}
                data-testid={`specimen-size-${size}`}
                defaultValue="opt1"
              >
                <option value="opt1">
                  {t('common.selectGallery.scaleOption1')} ({size})
                </option>
                <option value="opt2">
                  {t('common.selectGallery.scaleOption2')} ({size})
                </option>
              </Select>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Controlled Mode */}
      <section className={styles.section} aria-labelledby="section-controlled">
        <h2 id="section-controlled" className={styles.sectionTitle}>
          {t('common.selectGallery.controlledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.controlledDesc')}</p>

        <div className={styles.fieldRow}>
          <label htmlFor={controlledId} className={styles.label}>
            {t('common.selectGallery.controlledLabel')}
          </label>
          <Select
            id={controlledId}
            value={controlledChannel}
            onChange={(e) => setControlledChannel(e.target.value)}
            data-testid="specimen-controlled"
          >
            <option value="email">{t('common.selectGallery.channelEmail')}</option>
            <option value="sms">{t('common.selectGallery.channelSms')}</option>
            <option value="push">{t('common.selectGallery.channelPush')}</option>
          </Select>
        </div>

        <div className={styles.statusCard} data-testid="controlled-status-card">
          <span>{t('common.selectGallery.controlledStatusPrefix')}:</span>
          <span className={styles.statusValue} data-testid="controlled-status-value">
            {controlledChannel}
          </span>
        </div>
      </section>

      {/* 4. Uncontrolled Mode & Form Reset */}
      <section className={styles.section} aria-labelledby="section-uncontrolled">
        <h2 id="section-uncontrolled" className={styles.sectionTitle}>
          {t('common.selectGallery.uncontrolledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.uncontrolledDesc')}</p>

        <form
          className={styles.fieldset}
          onReset={() => {
            /* native reset */
          }}
        >
          <div className={styles.fieldRow}>
            <label htmlFor={uncontrolledId} className={styles.label}>
              {t('common.selectGallery.uncontrolledLabel')}
            </label>
            <Select
              id={uncontrolledId}
              name="workspaceRegion"
              defaultValue="us-west"
              data-testid="specimen-uncontrolled"
            >
              <option value="us-east">{t('common.selectGallery.regionUsEast')}</option>
              <option value="us-west">{t('common.selectGallery.regionUsWest')}</option>
              <option value="eu-central">{t('common.selectGallery.regionEuCentral')}</option>
            </Select>
          </div>
          <div className={styles.formActions}>
            <Button type="reset" size="sm" variant="secondary" data-testid="uncontrolled-reset-btn">
              {t('common.selectGallery.uncontrolledResetButton')}
            </Button>
          </div>
        </form>
      </section>

      {/* 5. Operational States & Combined Precedence */}
      <section className={styles.section} aria-labelledby="section-states">
        <h2 id="section-states" className={styles.sectionTitle}>
          {t('common.selectGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.statesDesc')}</p>

        <div className={styles.scaleGrid}>
          <div className={styles.fieldRow}>
            <label htmlFor="state-resting" className={styles.label}>
              {t('common.selectGallery.stateRestingLabel')}
            </label>
            <Select id="state-resting" data-testid="specimen-resting" defaultValue="val">
              <option value="val">{t('common.selectGallery.stateRestingOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="state-invalid" className={styles.label}>
              {t('common.selectGallery.stateInvalidLabel')}
            </label>
            <Select
              id="state-invalid"
              aria-invalid="true"
              data-testid="specimen-invalid"
              defaultValue="val"
            >
              <option value="val">{t('common.selectGallery.stateInvalidOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="state-disabled" className={styles.label}>
              {t('common.selectGallery.stateDisabledLabel')}
            </label>
            <Select id="state-disabled" disabled data-testid="specimen-disabled" defaultValue="val">
              <option value="val">{t('common.selectGallery.stateDisabledOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="state-disabled-opt" className={styles.label}>
              {t('common.selectGallery.stateDisabledOptionLabel')}
            </label>
            <Select
              id="state-disabled-opt"
              data-testid="specimen-disabled-option"
              defaultValue="active"
            >
              <option value="active">{t('common.selectGallery.stateActiveOption')}</option>
              <option value="dis" disabled>
                {t('common.selectGallery.stateDisabledOption')}
              </option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="state-invalid-dis" className={styles.label}>
              {t('common.selectGallery.stateInvalidDisabledLabel')}
            </label>
            <Select
              id="state-invalid-dis"
              aria-invalid="true"
              disabled
              data-testid="specimen-invalid-disabled"
              defaultValue="val"
            >
              <option value="val">{t('common.selectGallery.stateInvalidDisabledOption')}</option>
            </Select>
          </div>
        </div>
      </section>

      {/* 6. Required Validation & Accessible Relationships */}
      <section className={styles.section} aria-labelledby="section-required">
        <h2 id="section-required" className={styles.sectionTitle}>
          {t('common.selectGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.helpErrorDesc')}</p>

        <div className={styles.fieldRow}>
          <label htmlFor={requiredId} className={styles.label}>
            {t('common.selectGallery.requiredLabel')}
          </label>
          <Select
            id={requiredId}
            required
            value={requiredCurrency}
            onChange={handleRequiredChange}
            aria-invalid={requiredError ? 'true' : undefined}
            aria-describedby={requiredError ? `${requiredHelpId} ${requiredErrorId}` : requiredHelpId}
            data-testid="specimen-required"
          >
            <option value="">{t('common.selectGallery.requiredPrompt')}</option>
            <option value="usd">USD ($)</option>
            <option value="eur">EUR (€)</option>
            <option value="mad">MAD (د.م.)</option>
          </Select>

          <p id={requiredHelpId} className={styles.helpText}>
            {t('common.selectGallery.requiredHelpText')}
          </p>

          {requiredError && (
            <p id={requiredErrorId} role="alert" className={styles.errorText} data-testid="required-error-msg">
              {t('common.selectGallery.requiredErrorText')}
            </p>
          )}

          <div className={styles.formActions}>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={handleRequiredValidate}
              data-testid="required-validate-btn"
            >
              {t('common.selectGallery.requiredValidateButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Option Groups & Disabled Options */}
      <section className={styles.section} aria-labelledby="section-optgroups">
        <h2 id="section-optgroups" className={styles.sectionTitle}>
          {t('common.selectGallery.optgroupsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.optgroupsDesc')}</p>

        <div className={styles.fieldRow}>
          <label htmlFor={optgroupsId} className={styles.label}>
            {t('common.selectGallery.optgroupsLabel')}
          </label>
          <Select id={optgroupsId} data-testid="specimen-optgroups" defaultValue="prod-eu">
            <optgroup label={t('common.selectGallery.optgroupProduction')}>
              <option value="prod-eu">{t('common.selectGallery.envProdEu')}</option>
              <option value="prod-us">{t('common.selectGallery.envProdUs')}</option>
            </optgroup>
            <optgroup label={t('common.selectGallery.optgroupStaging')}>
              <option value="stage-eu">{t('common.selectGallery.envStageEu')}</option>
              <option value="stage-us" disabled>
                {t('common.selectGallery.envStageUs')}
              </option>
            </optgroup>
          </Select>
        </div>
      </section>

      {/* 8. Localization & RTL */}
      <section className={styles.section} aria-labelledby="section-localization">
        <h2 id="section-localization" className={styles.sectionTitle}>
          {t('common.selectGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.localizationDesc')}</p>

        <div className={styles.gridTwo}>
          {/* Arabic Specimen */}
          <div className={styles.fieldRow} dir="rtl">
            <label htmlFor={arabicId} className={styles.label}>
              {t('common.selectGallery.arabicSpecimenLabel')}
            </label>
            <Select
              id={arabicId}
              dir="rtl"
              data-testid="specimen-arabic"
              aria-describedby={arabicHelpId}
              defaultValue="ar"
            >
              <option value="">{t('common.selectGallery.arabicPrompt')}</option>
              <option value="ar">{t('common.selectGallery.arabicOptionAr')}</option>
              <option value="en">{t('common.selectGallery.arabicOptionEn')}</option>
              <option value="fr">{t('common.selectGallery.arabicOptionFr')}</option>
            </Select>
            <p id={arabicHelpId} className={styles.helpText}>
              {t('common.selectGallery.arabicSpecimenHelp')}
            </p>
          </div>

          {/* Mixed Tech Content with BidiText */}
          <div className={styles.fieldRow}>
            <label htmlFor={mixedTechId} className={styles.label}>
              {t('common.selectGallery.mixedTechPrefix')}{' '}
              <BidiText dir="ltr">GW-7700-ALPHA</BidiText>
            </label>
            <Select id={mixedTechId} data-testid="specimen-mixed-tech" defaultValue="gw1">
              <option value="gw1">{t('common.selectGallery.mixedTechOption1')}</option>
              <option value="gw2">{t('common.selectGallery.mixedTechOption2')}</option>
            </Select>
          </div>
        </div>

        {/* Nested LTR override inside RTL context */}
        <div className={styles.fieldset} dir="rtl">
          <legend className={styles.legend}>{t('common.selectGallery.nestedLtrLegend')}</legend>
          <div className={styles.fieldRow} dir="ltr" data-testid="specimen-nested-ltr-container">
            <label htmlFor="nested-ltr-select" className={styles.label}>
              {t('common.selectGallery.nestedLtrLabel')}
            </label>
            <Select id="nested-ltr-select" dir="ltr" data-testid="specimen-nested-ltr" defaultValue="eng">
              <option value="eng">{t('common.selectGallery.nestedLtrOption1')}</option>
              <option value="lat">{t('common.selectGallery.nestedLtrOption2')}</option>
            </Select>
          </div>
        </div>

        {/* Long multiline label reflow */}
        <div className={styles.fieldRow}>
          <label htmlFor={longId} className={styles.label}>
            {t('common.selectGallery.longLabelSpecimen')}
          </label>
          <Select id={longId} data-testid="specimen-long-label" defaultValue="opt1">
            <option value="opt1">{t('common.selectGallery.longOption1')}</option>
            <option value="opt2">{t('common.selectGallery.longOption2')}</option>
          </Select>
        </div>
      </section>

      {/* 9. Touch Targets & Theme Parity */}
      <section className={styles.section} aria-labelledby="section-touch">
        <h2 id="section-touch" className={styles.sectionTitle}>
          {t('common.selectGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.themeDesc')}</p>

        <div className={styles.scaleGrid}>
          <div className={styles.fieldRow}>
            <label htmlFor="touch-comfortable-select" className={styles.label}>
              {t('common.selectGallery.touchComfortableSpecimen')}
            </label>
            <Select
              id="touch-comfortable-select"
              touchTarget="comfortable"
              size="sm"
              data-testid="specimen-touch-comfortable"
              defaultValue="comfort"
            >
              <option value="comfort">{t('common.selectGallery.touchComfortableOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="touch-auto-select" className={styles.label}>
              {t('common.selectGallery.touchAutoSpecimen')}
            </label>
            <Select
              id="touch-auto-select"
              touchTarget="auto"
              size="xs"
              data-testid="specimen-touch-auto"
              defaultValue="auto"
            >
              <option value="auto">{t('common.selectGallery.touchAutoOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="no-icon-select" className={styles.label}>
              {t('common.selectGallery.noIconSpecimen')}
            </label>
            <Select
              id="no-icon-select"
              showIcon={false}
              data-testid="specimen-no-icon"
              defaultValue="plain"
            >
              <option value="plain">{t('common.selectGallery.noIconOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="custom-width-select" className={styles.label}>
              {t('common.selectGallery.customWidthSpecimen')}
            </label>
            <Select
              id="custom-width-select"
              style={{ width: '180px' }}
              data-testid="specimen-custom-width"
              defaultValue="w180"
            >
              <option value="w180">{t('common.selectGallery.customWidthOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="custom-width-class-select" className={styles.label}>
              {t('common.selectGallery.customWidthClassSpecimen')}
            </label>
            <Select
              id="custom-width-class-select"
              className={styles.fixedWidth}
              data-testid="specimen-custom-width-class"
              defaultValue="w200"
            >
              <option value="w200">{t('common.selectGallery.customWidthClassOption')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor="custom-width-rtl-select" className={styles.label}>
              {t('common.selectGallery.customWidthRtlSpecimen')}
            </label>
            <Select
              id="custom-width-rtl-select"
              dir="rtl"
              style={{ width: '180px' }}
              data-testid="specimen-custom-width-rtl"
              defaultValue="w180rtl"
            >
              <option value="w180rtl">{t('common.selectGallery.customWidthRtlOption')}</option>
            </Select>
          </div>
        </div>

        <fieldset disabled className={styles.fieldset}>
          <legend className={styles.legend}>
            {t('common.selectGallery.fieldsetDisabledLegend')}
          </legend>
          <div className={styles.fieldRow}>
            <label htmlFor="fieldset-disabled-select" className={styles.label}>
              {t('common.selectGallery.fieldsetDisabledLabel')}
            </label>
            <Select
              id="fieldset-disabled-select"
              data-testid="specimen-fieldset-disabled"
              defaultValue="fdis"
            >
              <option value="fdis">{t('common.selectGallery.fieldsetDisabledOption')}</option>
            </Select>
          </div>
        </fieldset>
      </section>

      {/* 10. Local Form Demonstration */}
      <section className={styles.section} aria-labelledby="section-form">
        <h2 id="section-form" className={styles.sectionTitle}>
          {t('common.selectGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.formDemoDesc')}</p>

        <form
          className={styles.formGrid}
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          data-testid="select-demo-form"
        >
          <div className={styles.fieldRow}>
            <label htmlFor={formPlanId} className={styles.label}>
              {t('common.selectGallery.formPlanLabel')}
            </label>
            <Select
              id={formPlanId}
              name="subscriptionPlan"
              required
              value={formPlan}
              onChange={(e) => setFormPlan(e.target.value)}
              data-testid="specimen-form-plan"
            >
              <option value="">{t('common.selectGallery.formPlanPrompt')}</option>
              <option value="starter">{t('common.selectGallery.formPlanStarter')}</option>
              <option value="pro">{t('common.selectGallery.formPlanPro')}</option>
              <option value="enterprise">{t('common.selectGallery.formPlanEnterprise')}</option>
            </Select>
          </div>

          <div className={styles.fieldRow}>
            <label htmlFor={formAddonId} className={styles.label}>
              {t('common.selectGallery.formAddonLabel')}
            </label>
            <Select
              id={formAddonId}
              name="dataRetention"
              value={formAddon}
              onChange={(e) => setFormAddon(e.target.value)}
              data-testid="specimen-form-addon"
            >
              <option value="">{t('common.selectGallery.formAddonNone')}</option>
              <option value="extended">{t('common.selectGallery.formAddonExtended')}</option>
              <option value="compliance">{t('common.selectGallery.formAddonCompliance')}</option>
            </Select>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="form-submit-btn"
            >
              {t('common.selectGallery.formSubmitButton')}
            </Button>
            <Button
              type="reset"
              variant="secondary"
              data-testid="form-reset-btn"
            >
              {t('common.selectGallery.formResetButton')}
            </Button>
          </div>

          <div className={styles.statusCard} data-testid="form-status-card">
            <span>{t('common.selectGallery.formStatusPrefix')}:</span>
            <span className={styles.statusValue} data-testid="form-status-value">
              {t(FORM_STATUS_MAP[formStatusId])}
            </span>
          </div>

          <p className={styles.helpText}>{t('common.selectGallery.formDisclaimer')}</p>
        </form>
      </section>

      {/* 11. Code Usage Examples */}
      <section className={styles.section} aria-labelledby="section-usage">
        <h2 id="section-usage" className={styles.sectionTitle}>
          {t('common.selectGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.selectGallery.usageDesc')}</p>

        <pre className={styles.codeBlock}>
          {`// Standard single-select dropdown with token-spaced indicator
<Select name="role" defaultValue="editor">
  <option value="admin">Administrator</option>
  <option value="editor">Editor</option>
  <option value="viewer">Viewer</option>
</Select>

// Required selection with initial empty option
<Select required defaultValue="">
  <option value="">Choose an option...</option>
  <option value="usd">USD ($)</option>
  <option value="eur">EUR (€)</option>
</Select>`}
        </pre>
      </section>
    </div>
  );
}

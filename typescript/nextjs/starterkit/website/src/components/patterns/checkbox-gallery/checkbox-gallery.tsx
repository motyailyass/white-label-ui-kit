'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './checkbox-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset' | 'error';

const FORM_STATUS_MAP: Record<FormStatusId, TranslationKey> = {
  none: 'common.checkboxGallery.formEventNone',
  pending: 'common.checkboxGallery.formEventPending',
  success: 'common.checkboxGallery.formEventSuccess',
  reset: 'common.checkboxGallery.formEventReset',
  error: 'common.checkboxGallery.formEventError',
};

const SIZE_LABELS: Record<string, TranslationKey> = {
  xs: 'common.checkboxGallery.sizeXsLabel',
  sm: 'common.checkboxGallery.sizeSmLabel',
  md: 'common.checkboxGallery.sizeMdLabel',
  lg: 'common.checkboxGallery.sizeLgLabel',
  xl: 'common.checkboxGallery.sizeXlLabel',
  '2xl': 'common.checkboxGallery.size2xlLabel',
};

export function CheckboxGallery() {
  const { t } = useI18n();

  // Controlled mode state
  const [controlledChecked, setControlledChecked] = useState(true);

  // Tri-State Parent/Child demonstration state
  const [childrenState, setChildrenState] = useState({
    email: true,
    sms: false,
    push: false,
  });

  const allSelected = childrenState.email && childrenState.sms && childrenState.push;
  const someSelected = childrenState.email || childrenState.sms || childrenState.push;
  const isParentIndeterminate = someSelected && !allSelected;
  const isParentChecked = allSelected;

  const handleParentToggle = useCallback(() => {
    // If all are selected, unselect all; otherwise select all
    const nextState = !allSelected;
    setChildrenState({
      email: nextState,
      sms: nextState,
      push: nextState,
    });
  }, [allSelected]);

  // Form demonstration state
  const [formMarketing, setFormMarketing] = useState(false);
  const [formSecurity, setFormSecurity] = useState(true);
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

      // Client validation: at least one notification option must be selected
      if (!formMarketing && !formSecurity) {
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
    [isSubmitting, formMarketing, formSecurity],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFormMarketing(false);
    setFormSecurity(true);
    setIsSubmitting(false);
    setFormStatusId('reset');
  }, []);

  // Section IDs
  const baseId = useId();
  const overviewId = `${baseId}-sec-overview`;
  const sizesId = `${baseId}-sec-sizes`;
  const statesId = `${baseId}-sec-states`;
  const indeterminateId = `${baseId}-sec-indeterminate`;
  const helpErrorId = `${baseId}-sec-help-error`;
  const modesId = `${baseId}-sec-modes`;
  const localizationId = `${baseId}-sec-localization`;
  const themeId = `${baseId}-sec-theme`;
  const formDemoId = `${baseId}-sec-form-demo`;
  const usageId = `${baseId}-sec-usage`;

  // Field IDs
  const defaultFieldId = `${baseId}-default`;
  const parentFieldId = `${baseId}-parent`;
  const childEmailId = `${baseId}-child-email`;
  const childSmsId = `${baseId}-child-sms`;
  const childPushId = `${baseId}-child-push`;
  const termsFieldId = `${baseId}-terms`;
  const termsHelpId = `${termsFieldId}-help`;
  const termsErrorId = `${termsFieldId}-error`;
  const controlledFieldId = `${baseId}-controlled`;
  const uncontrolledFieldId = `${baseId}-uncontrolled`;
  const arabicFieldId = `${baseId}-arabic`;
  const arabicHelpId = `${arabicFieldId}-help`;
  const mixedFieldId = `${baseId}-mixed-tech`;
  const formMarketingId = `${baseId}-form-marketing`;
  const formSecurityId = `${baseId}-form-security`;

  return (
    <main className={styles.galleryContainer} data-testid="checkbox-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.checkboxGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.checkboxGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Default Sizing */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.overviewDesc')}</p>
        <div className={styles.fieldStack}>
          <div className={styles.fieldRow}>
            <Checkbox id={defaultFieldId} defaultChecked data-testid="specimen-default" />
            <label htmlFor={defaultFieldId} className={styles.label}>
              {t('common.checkboxGallery.defaultOmittedLabel')}
            </label>
          </div>
          <span className={styles.helpText}>
            {t('common.checkboxGallery.defaultOmittedDesc')}
          </span>
        </div>
      </section>

      {/* 2. Six-Step Sizing Scale */}
      <section className={styles.section} aria-labelledby={sizesId}>
        <h2 id={sizesId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.sizesDesc')}</p>
        <div className={styles.scaleGrid}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((sz) => {
            const sizeFieldId = `${baseId}-size-${sz}`;
            return (
              <div key={sz} className={styles.fieldRow}>
                <Checkbox
                  id={sizeFieldId}
                  size={sz}
                  defaultChecked
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

      {/* 3. Operational States */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.statesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <Checkbox id={`${baseId}-state-unchecked`} data-testid="specimen-unchecked" />
            <label htmlFor={`${baseId}-state-unchecked`} className={styles.label}>
              {t('common.checkboxGallery.stateUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-state-checked`}
              defaultChecked
              data-testid="specimen-checked"
            />
            <label htmlFor={`${baseId}-state-checked`} className={styles.label}>
              {t('common.checkboxGallery.stateCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-state-indeterminate`}
              indeterminate
              data-testid="specimen-indeterminate"
            />
            <label htmlFor={`${baseId}-state-indeterminate`} className={styles.label}>
              {t('common.checkboxGallery.stateIndeterminateLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-state-disabled-unchecked`}
              disabled
              data-testid="specimen-disabled-unchecked"
            />
            <label htmlFor={`${baseId}-state-disabled-unchecked`} className={styles.label}>
              {t('common.checkboxGallery.disabledUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-state-disabled-checked`}
              disabled
              defaultChecked
              data-testid="specimen-disabled-checked"
            />
            <label htmlFor={`${baseId}-state-disabled-checked`} className={styles.label}>
              {t('common.checkboxGallery.disabledCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-state-disabled-indeterminate`}
              disabled
              indeterminate
              data-testid="specimen-disabled-indeterminate"
            />
            <label htmlFor={`${baseId}-state-disabled-indeterminate`} className={styles.label}>
              {t('common.checkboxGallery.disabledIndeterminateLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 4. Parent/Child "Select All" Tri-State Pattern */}
      <section className={styles.section} aria-labelledby={indeterminateId}>
        <h2 id={indeterminateId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.indeterminateTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.indeterminateDesc')}</p>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>
            {t('common.checkboxGallery.selectAllLabel')}
          </legend>

          <div className={styles.fieldRow}>
            <Checkbox
              id={parentFieldId}
              checked={isParentChecked}
              indeterminate={isParentIndeterminate}
              onChange={handleParentToggle}
              data-testid="specimen-parent-checkbox"
            />
            <label htmlFor={parentFieldId} className={styles.label}>
              <strong>{t('common.checkboxGallery.selectAllLabel')}</strong>
            </label>
          </div>

          <div className={styles.childStack}>
            <div className={styles.fieldRow}>
              <Checkbox
                id={childEmailId}
                checked={childrenState.email}
                onChange={(e) =>
                  setChildrenState((prev) => ({ ...prev, email: e.target.checked }))
                }
                data-testid="specimen-child-email"
              />
              <label htmlFor={childEmailId} className={styles.label}>
                {t('common.checkboxGallery.childEmail')}
              </label>
            </div>

            <div className={styles.fieldRow}>
              <Checkbox
                id={childSmsId}
                checked={childrenState.sms}
                onChange={(e) =>
                  setChildrenState((prev) => ({ ...prev, sms: e.target.checked }))
                }
                data-testid="specimen-child-sms"
              />
              <label htmlFor={childSmsId} className={styles.label}>
                {t('common.checkboxGallery.childSms')}
              </label>
            </div>

            <div className={styles.fieldRow}>
              <Checkbox
                id={childPushId}
                checked={childrenState.push}
                onChange={(e) =>
                  setChildrenState((prev) => ({ ...prev, push: e.target.checked }))
                }
                data-testid="specimen-child-push"
              />
              <label htmlFor={childPushId} className={styles.label}>
                {t('common.checkboxGallery.childPush')}
              </label>
            </div>
          </div>
        </fieldset>
      </section>

      {/* 5. Help & Error Relationships */}
      <section className={styles.section} aria-labelledby={helpErrorId}>
        <h2 id={helpErrorId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.helpErrorDesc')}</p>
        <div className={styles.fieldStack}>
          <div className={styles.fieldRow}>
            <Checkbox
              id={termsFieldId}
              aria-invalid="true"
              aria-describedby={`${termsHelpId} ${termsErrorId}`}
              data-testid="specimen-invalid"
            />
            <label htmlFor={termsFieldId} className={styles.label}>
              {t('common.checkboxGallery.termsRequiredLabel')}
            </label>
          </div>
          <span id={termsHelpId} className={styles.helpText}>
            {t('common.checkboxGallery.termsRequiredHelp')}
          </span>
          <span id={termsErrorId} className={styles.errorText} role="alert">
            {t('common.checkboxGallery.termsRequiredError')}
          </span>

          <div className={styles.fieldRowSpaced}>
            <Checkbox
              id={`${baseId}-terms-invalid-checked`}
              aria-invalid="true"
              defaultChecked
              data-testid="specimen-invalid-checked"
            />
            <label htmlFor={`${baseId}-terms-invalid-checked`} className={styles.label}>
              {t('common.checkboxGallery.termsInvalidCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-terms-invalid-indeterminate`}
              aria-invalid="true"
              indeterminate
              data-testid="specimen-invalid-indeterminate"
            />
            <label htmlFor={`${baseId}-terms-invalid-indeterminate`} className={styles.label}>
              {t('common.checkboxGallery.termsInvalidIndeterminateLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-terms-invalid-disabled`}
              aria-invalid="true"
              disabled
              data-testid="specimen-invalid-disabled-unchecked"
            />
            <label htmlFor={`${baseId}-terms-invalid-disabled`} className={styles.label}>
              {t('common.checkboxGallery.termsInvalidDisabledLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-terms-invalid-disabled-checked`}
              aria-invalid="true"
              disabled
              defaultChecked
              data-testid="specimen-invalid-disabled-checked"
            />
            <label htmlFor={`${baseId}-terms-invalid-disabled-checked`} className={styles.label}>
              {t('common.checkboxGallery.termsInvalidDisabledCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Checkbox
              id={`${baseId}-terms-invalid-disabled-indeterminate`}
              aria-invalid="true"
              disabled
              indeterminate
              data-testid="specimen-invalid-disabled-indeterminate"
            />
            <label htmlFor={`${baseId}-terms-invalid-disabled-indeterminate`} className={styles.label}>
              {t('common.checkboxGallery.termsInvalidDisabledIndeterminateLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 6. Controlled vs Uncontrolled */}
      <section className={styles.section} aria-labelledby={modesId}>
        <h2 id={modesId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.modesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.modesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldStack}>
            <div className={styles.fieldRow}>
              <Checkbox
                id={controlledFieldId}
                checked={controlledChecked}
                onChange={(e) => setControlledChecked(e.target.checked)}
                data-testid="specimen-controlled"
              />
              <label htmlFor={controlledFieldId} className={styles.label}>
                {t(
                  controlledChecked
                    ? 'common.checkboxGallery.controlledStateChecked'
                    : 'common.checkboxGallery.controlledStateUnchecked',
                )}
              </label>
            </div>
          </div>

          <div className={styles.fieldStack}>
            <div className={styles.fieldRow}>
              <Checkbox
                id={uncontrolledFieldId}
                defaultChecked
                data-testid="specimen-uncontrolled"
              />
              <label htmlFor={uncontrolledFieldId} className={styles.label}>
                {t('common.checkboxGallery.uncontrolledLabel')}
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Localization & RTL Alignment */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.checkboxGallery.localizationDesc')}
        </p>
        <div className={styles.fieldStack} dir="rtl">
          <div className={styles.fieldRow}>
            <Checkbox
              id={arabicFieldId}
              defaultChecked
              aria-describedby={arabicHelpId}
              data-testid="specimen-arabic"
            />
            <label htmlFor={arabicFieldId} className={styles.label} lang="ar">
              {t('common.checkboxGallery.arabicSpecimenLabel')}
            </label>
          </div>
          <span id={arabicHelpId} className={styles.helpText} lang="ar">
            {t('common.checkboxGallery.arabicSpecimenHelp')}
          </span>

          <div className={styles.fieldRowSpaced}>
            <Checkbox id={mixedFieldId} data-testid="specimen-mixed-tech" />
            <label htmlFor={mixedFieldId} className={styles.label}>
              {t('common.checkboxGallery.mixedTechLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 8. Theme Parity */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.themeDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <Checkbox id={`${baseId}-theme-1`} defaultChecked />
            <label htmlFor={`${baseId}-theme-1`} className={styles.label}>
              {t('common.checkboxGallery.themeCheckedLabel')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Checkbox id={`${baseId}-theme-2`} />
            <label htmlFor={`${baseId}-theme-2`} className={styles.label}>
              {t('common.checkboxGallery.themeUncheckedLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 9. Local Form Demonstration */}
      <section className={styles.section} aria-labelledby={formDemoId}>
        <h2 id={formDemoId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.formDemoDesc')}</p>

        <form onSubmit={handleFormSubmit} onReset={handleFormReset} className={styles.formBox}>
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.checkboxGallery.formTitle')}
            </legend>

            <div className={styles.fieldRow}>
              <Checkbox
                id={formMarketingId}
                name="marketing"
                checked={formMarketing}
                onChange={(e) => setFormMarketing(e.target.checked)}
                data-testid="form-checkbox-marketing"
              />
              <label htmlFor={formMarketingId} className={styles.label}>
                {t('common.checkboxGallery.formMarketingLabel')}
              </label>
            </div>

            <div className={styles.fieldRow}>
              <Checkbox
                id={formSecurityId}
                name="security"
                checked={formSecurity}
                onChange={(e) => setFormSecurity(e.target.checked)}
                data-testid="form-checkbox-security"
              />
              <label htmlFor={formSecurityId} className={styles.label}>
                {t('common.checkboxGallery.formSecurityLabel')}
              </label>
            </div>
          </fieldset>

          <div className={styles.buttonRow}>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {t('common.checkboxGallery.formSubmitButton')}
            </Button>
            <Button type="reset" variant="secondary">
              {t('common.checkboxGallery.formResetButton')}
            </Button>
          </div>

          <div role="status" aria-live="polite" className={styles.statusMessage}>
            <strong>{t('common.checkboxGallery.formStatusPrefix')}:</strong>{' '}
            {t(FORM_STATUS_MAP[formStatusId])}
          </div>
          <span className={styles.helpText}>
            {t('common.checkboxGallery.formDisclaimer')}
          </span>
        </form>
      </section>

      {/* 10. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.checkboxGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.checkboxGallery.usageDesc')}</p>
        <pre className={styles.codeBox}>
          <code>{`import { Checkbox } from '@/components/ui/checkbox';

// 1. Basic checkbox with external associated label
<div className="fieldRow">
  <Checkbox id="terms" name="terms" defaultChecked />
  <label htmlFor="terms">I accept the terms</label>
</div>

// 2. Controlled checkbox with indeterminate mixed state
<Checkbox
  id="select-all"
  checked={allSelected}
  indeterminate={someSelected && !allSelected}
  onChange={handleToggleAll}
/>`}</code>
        </pre>
      </section>
    </main>
  );
}

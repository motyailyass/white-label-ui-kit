'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { LanguageSwitcher, ThemeSwitcher } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import styles from './input-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset';

const FORM_STATUS_MAP: Record<FormStatusId, TranslationKey> = {
  none: 'common.inputGallery.formEventNone',
  pending: 'common.inputGallery.formEventPending',
  success: 'common.inputGallery.formEventSuccess',
  reset: 'common.inputGallery.formEventReset',
};

export function InputGallery() {
  const { t } = useI18n();

  // Controlled mode state
  const [controlledVal, setControlledVal] = useState('Jane Doe');

  // Interactive help & error relationship state
  const [interactiveUsername, setInteractiveUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const isUsernameInvalid = usernameTouched && interactiveUsername.trim().length < 3;

  // Local form demonstration state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatusId, setFormStatusId] = useState<FormStatusId>('none');
  const [formEmailInvalid, setFormEmailInvalid] = useState(false);
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
      if (!formEmail.includes('@') || !formEmail.includes('.')) {
        setFormEmailInvalid(true);
        return;
      }
      setFormEmailInvalid(false);
      setIsSubmitting(true);
      setFormStatusId('pending');

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setFormStatusId('success');
        setIsSubmitting(false);
        timerRef.current = null;
      }, 800);
    },
    [formEmail, isSubmitting],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFormName('');
    setFormEmail('');
    setFormEmailInvalid(false);
    setIsSubmitting(false);
    setFormStatusId('reset');
  }, []);

  const baseId = useId();
  const overviewId = `${baseId}-sec-overview`;
  const sizesId = `${baseId}-sec-sizes`;
  const defaultsId = `${baseId}-sec-defaults`;
  const typesId = `${baseId}-sec-types`;
  const statesId = `${baseId}-sec-states`;
  const helpErrorId = `${baseId}-sec-help-error`;
  const modesId = `${baseId}-sec-modes`;
  const localizationId = `${baseId}-sec-localization`;
  const directionId = `${baseId}-sec-direction`;
  const themeId = `${baseId}-sec-theme`;
  const responsiveId = `${baseId}-sec-responsive`;
  const formDemoId = `${baseId}-sec-form-demo`;
  const usageId = `${baseId}-sec-usage`;

  // Field IDs
  const overviewFieldId = `${baseId}-overview`;
  const defaultFieldId = `${baseId}-default`;
  const emailFieldId = `${baseId}-email`;
  const telFieldId = `${baseId}-tel`;
  const urlFieldId = `${baseId}-url`;
  const searchFieldId = `${baseId}-search`;
  const passwordFieldId = `${baseId}-password`;
  const restingFieldId = `${baseId}-resting`;
  const disabledFieldId = `${baseId}-disabled`;
  const readOnlyFieldId = `${baseId}-readonly`;
  const requiredFieldId = `${baseId}-required`;
  const invalidFieldId = `${baseId}-invalid`;
  const helpErrorFieldId = `${baseId}-help-error-field`;
  const helpTextId = `${helpErrorFieldId}-help`;
  const errorTextId = `${helpErrorFieldId}-error`;
  const controlledFieldId = `${baseId}-controlled`;
  const uncontrolledFieldId = `${baseId}-uncontrolled`;
  const arabicFieldId = `${baseId}-arabic`;
  const mixedFieldId = `${baseId}-mixed-ltr`;
  const themeFieldId = `${baseId}-theme`;
  const touchAutoFieldId = `${baseId}-touch-auto`;
  const touchComfortableFieldId = `${baseId}-touch-comfortable`;

  const formNameId = `${baseId}-form-name`;
  const formEmailId = `${baseId}-form-email`;
  const formEmailHelpId = `${formEmailId}-help`;
  const formEmailErrorId = `${formEmailId}-error`;

  return (
    <main className={styles.galleryContainer} data-testid="input-gallery">
      {/* Gallery Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.inputGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.inputGallery.subtitle')}</p>
      </header>

      {/* 1. Overview */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.inputGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.overviewDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor={overviewFieldId} className={styles.label}>
            {t('common.inputGallery.usernameLabel')}
          </label>
          <Input
            id={overviewFieldId}
            placeholder={t('common.inputGallery.usernamePlaceholder')}
            defaultValue="alex_doe"
          />
        </div>
      </section>

      {/* 2. Six-Step Sizing Scale */}
      <section className={styles.section} aria-labelledby={sizesId}>
        <h2 id={sizesId} className={styles.sectionTitle}>
          {t('common.inputGallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.sizesDesc')}</p>
        <div className={styles.rowFlex}>
          <Input
            size="xs"
            defaultValue={t('common.inputGallery.sizeXs')}
            aria-label={t('common.inputGallery.sizeXsAria')}
          />
          <Input
            size="sm"
            defaultValue={t('common.inputGallery.sizeSm')}
            aria-label={t('common.inputGallery.sizeSmAria')}
          />
          <Input
            size="md"
            defaultValue={t('common.inputGallery.sizeMd')}
            aria-label={t('common.inputGallery.sizeMdAria')}
          />
          <Input
            size="lg"
            defaultValue={t('common.inputGallery.sizeLg')}
            aria-label={t('common.inputGallery.sizeLgAria')}
          />
          <Input
            size="xl"
            defaultValue={t('common.inputGallery.sizeXl')}
            aria-label={t('common.inputGallery.sizeXlAria')}
          />
          <Input
            size="2xl"
            defaultValue={t('common.inputGallery.size2xl')}
            aria-label={t('common.inputGallery.size2xlAria')}
          />
        </div>
      </section>

      {/* 3. Product-Owned Defaults */}
      <section className={styles.section} aria-labelledby={defaultsId}>
        <h2 id={defaultsId} className={styles.sectionTitle}>
          {t('common.inputGallery.defaultsTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.defaultsDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor={defaultFieldId} className={styles.label}>
            {t('common.inputGallery.defaultOmittedLabel')}
          </label>
          <Input
            id={defaultFieldId}
            placeholder={t('common.inputGallery.defaultOmittedPlaceholder')}
          />
        </div>
      </section>

      {/* 4. Native Text-Like Types */}
      <section className={styles.section} aria-labelledby={typesId}>
        <h2 id={typesId} className={styles.sectionTitle}>
          {t('common.inputGallery.typesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.typesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor={emailFieldId} className={styles.label}>
              {t('common.inputGallery.emailLabel')}
            </label>
            <Input
              id={emailFieldId}
              type="email"
              placeholder={t('common.inputGallery.emailPlaceholder')}
              data-testid="field-email"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={telFieldId} className={styles.label}>
              {t('common.inputGallery.telLabel')}
            </label>
            <Input
              id={telFieldId}
              type="tel"
              placeholder={t('common.inputGallery.telPlaceholder')}
              data-testid="field-tel"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={urlFieldId} className={styles.label}>
              {t('common.inputGallery.urlLabel')}
            </label>
            <Input
              id={urlFieldId}
              type="url"
              placeholder={t('common.inputGallery.urlPlaceholder')}
              data-testid="field-url"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={searchFieldId} className={styles.label}>
              {t('common.inputGallery.searchLabel')}
            </label>
            <Input
              id={searchFieldId}
              type="search"
              placeholder={t('common.inputGallery.searchPlaceholder')}
              data-testid="field-search"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={passwordFieldId} className={styles.label}>
              {t('common.inputGallery.passwordLabel')}
            </label>
            <Input
              id={passwordFieldId}
              type="password"
              placeholder={t('common.inputGallery.passwordPlaceholder')}
              data-testid="field-password"
            />
          </div>
        </div>
      </section>

      {/* 5. Operational States */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.inputGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.statesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor={restingFieldId} className={styles.label}>
              {t('common.inputGallery.restingLabel')}
            </label>
            <Input
              id={restingFieldId}
              defaultValue={t('common.inputGallery.restingValue')}
              data-testid="field-resting"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={disabledFieldId} className={styles.label}>
              {t('common.inputGallery.disabledLabel')}
            </label>
            <Input
              id={disabledFieldId}
              disabled
              defaultValue={t('common.inputGallery.disabledValue')}
              data-testid="field-disabled"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={readOnlyFieldId} className={styles.label}>
              {t('common.inputGallery.readOnlyLabel')}
            </label>
            <Input
              id={readOnlyFieldId}
              readOnly
              defaultValue={t('common.inputGallery.readOnlyValue')}
              data-testid="field-readonly"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={requiredFieldId} className={styles.label}>
              {t('common.inputGallery.requiredLabel')}
            </label>
            <Input
              id={requiredFieldId}
              required
              placeholder={t('common.inputGallery.requiredPlaceholder')}
              data-testid="specimen-required"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={invalidFieldId} className={styles.label}>
              {t('common.inputGallery.invalidLabel')}
            </label>
            <Input
              id={invalidFieldId}
              aria-invalid="true"
              placeholder={t('common.inputGallery.invalidPlaceholder')}
              data-testid="specimen-invalid"
            />
          </div>
        </div>
      </section>

      {/* 6. Help & Error Relationships */}
      <section className={styles.section} aria-labelledby={helpErrorId}>
        <h2 id={helpErrorId} className={styles.sectionTitle}>
          {t('common.inputGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.helpErrorDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor={helpErrorFieldId} className={styles.label}>
            {t('common.inputGallery.usernameLabel')}
          </label>
          <Input
            id={helpErrorFieldId}
            value={interactiveUsername}
            onChange={(e) => {
              setInteractiveUsername(e.target.value);
              if (!usernameTouched) setUsernameTouched(true);
            }}
            onBlur={() => setUsernameTouched(true)}
            aria-invalid={isUsernameInvalid || undefined}
            aria-describedby={isUsernameInvalid ? `${helpTextId} ${errorTextId}` : helpTextId}
            placeholder={t('common.inputGallery.usernamePlaceholder')}
          />
          <p id={helpTextId} className={styles.helpText}>
            {t('common.inputGallery.usernameHelp')}
          </p>
          {isUsernameInvalid && (
            <p id={errorTextId} className={styles.errorText}>
              {t('common.inputGallery.usernameError')}
            </p>
          )}
        </div>
      </section>

      {/* 7. Controlled vs Uncontrolled */}
      <section className={styles.section} aria-labelledby={modesId}>
        <h2 id={modesId} className={styles.sectionTitle}>
          {t('common.inputGallery.modesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.modesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldGroup}>
            <label htmlFor={controlledFieldId} className={styles.label}>
              {t('common.inputGallery.controlledLabel')}
            </label>
            <Input
              id={controlledFieldId}
              value={controlledVal}
              onChange={(e) => setControlledVal(e.target.value)}
              data-testid="specimen-controlled"
            />
            <span className={styles.helpText}>
              {t('common.inputGallery.valuePrefix')}: {controlledVal}
            </span>
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={uncontrolledFieldId} className={styles.label}>
              {t('common.inputGallery.uncontrolledLabel')}
            </label>
            <Input
              id={uncontrolledFieldId}
              defaultValue={t('common.inputGallery.uncontrolledDefaultValue')}
              data-testid="specimen-uncontrolled"
            />
          </div>
        </div>
      </section>

      {/* 8. Localization & Long Labels */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.inputGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.localizationDesc')}</p>
        <div className={styles.fieldGroup} lang="ar" dir="rtl">
          <label htmlFor={arabicFieldId} className={styles.label}>
            {t('common.inputGallery.arabicNameLabel')}
          </label>
          <Input
            id={arabicFieldId}
            dir="rtl"
            placeholder={t('common.inputGallery.arabicNamePlaceholder')}
            data-testid="specimen-arabic"
          />
        </div>
      </section>

      {/* 9. Text Direction & Mixed Data */}
      <section className={styles.section} aria-labelledby={directionId}>
        <h2 id={directionId} className={styles.sectionTitle}>
          {t('common.inputGallery.directionTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.directionDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor={mixedFieldId} className={styles.label}>
            {t('common.inputGallery.mixedCodeLabel')}
          </label>
          <Input
            id={mixedFieldId}
            dir="ltr"
            defaultValue="TRK-984210-X"
            data-testid="specimen-mixed-ltr"
          />
        </div>
      </section>

      {/* 10. Theme Parity */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.inputGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.themeDesc')}</p>
        <div className={styles.fieldGroup}>
          <label htmlFor={themeFieldId} className={styles.label}>
            {t('common.inputGallery.emailLabel')}
          </label>
          <Input
            id={themeFieldId}
            defaultValue={t('common.inputGallery.themeValue')}
            data-testid="field-theme"
          />
        </div>
      </section>

      {/* 11. Responsive Behavior & Touch Targets */}
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
            <Input
              id={touchAutoFieldId}
              size="xs"
              touchTarget="auto"
              defaultValue={t('common.gallery.xsAuto')}
              data-testid="specimen-touch-auto"
            />
          </div>
          <div className={styles.fieldGroup}>
            <label htmlFor={touchComfortableFieldId} className={styles.label}>
              {t('common.gallery.xsComfortable')}
            </label>
            <Input
              id={touchComfortableFieldId}
              size="xs"
              touchTarget="comfortable"
              defaultValue={t('common.gallery.xsComfortable')}
              data-testid="specimen-touch-comfortable"
            />
          </div>
        </div>
      </section>

      {/* 12. Real Form Demonstration */}
      <section className={styles.section} aria-labelledby={formDemoId}>
        <h2 id={formDemoId} className={styles.sectionTitle}>
          {t('common.inputGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.formDemoDesc')}</p>

        <form
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          className={styles.formContainer}
        >
          <div className={styles.fieldGroup}>
            <label htmlFor={formNameId} className={styles.label}>
              {t('common.inputGallery.formFullNameLabel')}
            </label>
            <Input
              id={formNameId}
              name="fullName"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={t('common.inputGallery.formFullNamePlaceholder')}
              required
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor={formEmailId} className={styles.label}>
              {t('common.inputGallery.formEmailLabel')}
            </label>
            <Input
              id={formEmailId}
              name="email"
              type="email"
              value={formEmail}
              onChange={(e) => {
                setFormEmail(e.target.value);
                if (formEmailInvalid) setFormEmailInvalid(false);
              }}
              placeholder={t('common.inputGallery.formEmailPlaceholder')}
              aria-invalid={formEmailInvalid || undefined}
              aria-describedby={
                formEmailInvalid ? `${formEmailHelpId} ${formEmailErrorId}` : formEmailHelpId
              }
              required
            />
            <p id={formEmailHelpId} className={styles.helpText}>
              {t('common.inputGallery.formEmailHelp')}
            </p>
            {formEmailInvalid && (
              <p id={formEmailErrorId} className={styles.errorText}>
                {t('common.inputGallery.formEmailError')}
              </p>
            )}
          </div>

          <div className={styles.buttonRow}>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              {t('common.inputGallery.formSubmitButton')}
            </Button>
            <Button type="reset" variant="secondary">
              {t('common.inputGallery.formResetButton')}
            </Button>
          </div>

          <div role="status" aria-live="polite" className={styles.statusMessage}>
            <strong>{t('common.inputGallery.formStatusPrefix')}:</strong>{' '}
            {t(FORM_STATUS_MAP[formStatusId])}
          </div>
        </form>
      </section>

      {/* 13. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.inputGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.usageDesc')}</p>
        <pre className={styles.codeBox}>
          <code>{`import { Input } from '@/components/ui';

// 1. Standard text input with external label
<label htmlFor="user-email">Email Address</label>
<Input id="user-email" type="email" placeholder="user@company.com" />

// 2. Controlled usage with validation
<Input
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  aria-invalid={hasError || undefined}
  aria-describedby="username-hint username-error"
/>

// 3. Compact filter input with explicit size
<Input size="sm" type="search" placeholder="Filter records..." />`}</code>
        </pre>
      </section>
    </main>
  );
}

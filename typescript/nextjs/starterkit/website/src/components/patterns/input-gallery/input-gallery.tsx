'use client';

import React, { useCallback, useId, useState } from 'react';
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

  const handleFormSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formEmail.includes('@') || !formEmail.includes('.')) {
        setFormEmailInvalid(true);
        return;
      }
      setFormEmailInvalid(false);
      setIsSubmitting(true);
      setFormStatusId('pending');

      try {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setFormStatusId('success');
      } finally {
        setIsSubmitting(false);
      }
    },
    [formEmail],
  );

  const handleFormReset = useCallback(() => {
    setFormName('');
    setFormEmail('');
    setFormEmailInvalid(false);
    setIsSubmitting(false);
    setFormStatusId('reset');
  }, []);

  const overviewId = useId();
  const sizesId = useId();
  const defaultsId = useId();
  const typesId = useId();
  const statesId = useId();
  const helpErrorId = useId();
  const modesId = useId();
  const localizationId = useId();
  const directionId = useId();
  const themeId = useId();
  const responsiveId = useId();
  const formDemoId = useId();
  const usageId = useId();

  // Field IDs
  const overviewFieldId = useId();
  const defaultFieldId = useId();
  const helpErrorFieldId = useId();
  const helpTextId = `${helpErrorFieldId}-help`;
  const errorTextId = `${helpErrorFieldId}-error`;

  const formNameId = useId();
  const formEmailId = useId();
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
          <Input size="xs" defaultValue="XS (28px min-height)" aria-label="XS input" />
          <Input size="sm" defaultValue="SM (32px min-height)" aria-label="SM input" />
          <Input size="md" defaultValue="MD (36px min-height)" aria-label="MD input" />
          <Input size="lg" defaultValue="LG (40px min-height)" aria-label="LG input" />
          <Input size="xl" defaultValue="XL (48px min-height)" aria-label="XL input" />
          <Input size="2xl" defaultValue="2XL (56px min-height)" aria-label="2XL input" />
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
            <label className={styles.label}>{t('common.inputGallery.emailLabel')}</label>
            <Input type="email" placeholder={t('common.inputGallery.emailPlaceholder')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.telLabel')}</label>
            <Input type="tel" placeholder={t('common.inputGallery.telPlaceholder')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.urlLabel')}</label>
            <Input type="url" placeholder={t('common.inputGallery.urlPlaceholder')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.searchLabel')}</label>
            <Input type="search" placeholder={t('common.inputGallery.searchPlaceholder')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.passwordLabel')}</label>
            <Input type="password" placeholder={t('common.inputGallery.passwordPlaceholder')} />
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
            <label className={styles.label}>{t('common.inputGallery.restingLabel')}</label>
            <Input defaultValue="Resting editable input" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.disabledLabel')}</label>
            <Input disabled defaultValue={t('common.inputGallery.disabledValue')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.readOnlyLabel')}</label>
            <Input readOnly defaultValue={t('common.inputGallery.readOnlyValue')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.requiredLabel')}</label>
            <Input required placeholder={t('common.inputGallery.requiredPlaceholder')} />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.invalidLabel')}</label>
            <Input aria-invalid="true" placeholder={t('common.inputGallery.invalidPlaceholder')} />
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
            <label className={styles.label}>{t('common.inputGallery.controlledLabel')}</label>
            <Input value={controlledVal} onChange={(e) => setControlledVal(e.target.value)} />
            <span className={styles.helpText}>Value: {controlledVal}</span>
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.inputGallery.uncontrolledLabel')}</label>
            <Input defaultValue={t('common.inputGallery.uncontrolledDefaultValue')} />
          </div>
        </div>
      </section>

      {/* 8. Localization & Long Labels */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.inputGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.localizationDesc')}</p>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t('common.inputGallery.arabicNameLabel')}</label>
          <Input placeholder={t('common.inputGallery.arabicNamePlaceholder')} />
        </div>
      </section>

      {/* 9. Text Direction & Mixed Data */}
      <section className={styles.section} aria-labelledby={directionId}>
        <h2 id={directionId} className={styles.sectionTitle}>
          {t('common.inputGallery.directionTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.directionDesc')}</p>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t('common.inputGallery.mixedCodeLabel')}</label>
          <Input dir="ltr" defaultValue="TRK-984210-X" />
        </div>
      </section>

      {/* 10. Theme Parity */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.inputGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.inputGallery.themeDesc')}</p>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{t('common.inputGallery.emailLabel')}</label>
          <Input defaultValue="theme-parity@example.com" />
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
            <label className={styles.label}>{t('common.gallery.xsAuto')}</label>
            <Input size="xs" touchTarget="auto" defaultValue="XS Auto Target" />
          </div>
          <div className={styles.fieldGroup}>
            <label className={styles.label}>{t('common.gallery.xsComfortable')}</label>
            <Input size="xs" touchTarget="comfortable" defaultValue="XS Comfortable Target" />
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
            <Button type="reset" variant="secondary" disabled={isSubmitting}>
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

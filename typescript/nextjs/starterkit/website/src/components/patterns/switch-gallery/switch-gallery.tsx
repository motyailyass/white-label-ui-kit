'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { BidiText, type TranslationKey } from '@/i18n';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './switch-gallery.module.css';

type FormStatusId = 'none' | 'pending' | 'success' | 'reset' | 'error';

const FORM_STATUS_MAP: Record<FormStatusId, TranslationKey> = {
  none: 'common.switchGallery.formEventNone',
  pending: 'common.switchGallery.formEventPending',
  success: 'common.switchGallery.formEventSuccess',
  reset: 'common.switchGallery.formEventReset',
  error: 'common.switchGallery.formEventError',
};

const SIZE_LABELS: Record<string, TranslationKey> = {
  xs: 'common.switchGallery.sizeXsLabel',
  sm: 'common.switchGallery.sizeSmLabel',
  md: 'common.switchGallery.sizeMdLabel',
  lg: 'common.switchGallery.sizeLgLabel',
  xl: 'common.switchGallery.sizeXlLabel',
  '2xl': 'common.switchGallery.size2xlLabel',
};

export function SwitchGallery() {
  const { t } = useI18n();

  // Controlled mode state
  const [controlledActive, setControlledActive] = useState(true);

  // Required section validation state (starts without premature error)
  const [requiredChecked, setRequiredChecked] = useState(false);
  const [requiredError, setRequiredError] = useState(false);

  // Form demonstration state
  const [formTelemetry, setFormTelemetry] = useState(false);
  const [formDiagnostics, setFormDiagnostics] = useState(false);
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

      if (!formTelemetry && !formDiagnostics) {
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
    [isSubmitting, formTelemetry, formDiagnostics],
  );

  const handleFormReset = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setFormTelemetry(false);
    setFormDiagnostics(false);
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
  const defAirplaneId = `${baseId}-def-airplane`;
  const defDndId = `${baseId}-def-dnd`;
  const ctrlId = `${baseId}-ctrl-telemetry`;
  const unctrlAutosaveId = `${baseId}-unctrl-autosave`;
  const unctrlDiagnosticsId = `${baseId}-unctrl-diagnostics`;
  const reqFirewallId = `${baseId}-req-firewall`;
  const reqHelpId = `${baseId}-req-help`;
  const reqErrorId = `${baseId}-req-error`;
  const indepSyncId = `${baseId}-indep-sync`;
  const fieldsetAdminId = `${baseId}-fieldset-admin`;
  const arabicId = `${baseId}-arabic-opt`;
  const arabicHelpId = `${arabicId}-help`;
  const nestedLtrId = `${baseId}-nested-ltr-opt`;
  const mixedId = `${baseId}-mixed-opt`;
  const longLabelId = `${baseId}-long-label-opt`;
  const formTelemetryId = `${baseId}-form-telemetry`;
  const formDiagnosticsId = `${baseId}-form-diagnostics`;

  return (
    <main className={styles.galleryContainer} data-testid="switch-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.switchGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.switchGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Product Defaults */}
      <section className={styles.section} aria-labelledby={overviewId}>
        <h2 id={overviewId} className={styles.sectionTitle}>
          {t('common.switchGallery.overviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.overviewDesc')}
        </p>
        <div className={styles.fieldset}>
          <div className={styles.fieldRow}>
            <Switch
              id={defAirplaneId}
              name="airplane-mode"
              defaultChecked
              data-testid="specimen-default"
            />
            <label htmlFor={defAirplaneId} className={styles.label}>
              {t('common.switchGallery.defaultOptionAirplane')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Switch
              id={defDndId}
              name="do-not-disturb"
              data-testid="specimen-default-alt"
            />
            <label htmlFor={defDndId} className={styles.label}>
              {t('common.switchGallery.defaultOptionDnd')}
            </label>
          </div>
        </div>
      </section>

      {/* 2. Six-Step Sizing Scale */}
      <section className={styles.section} aria-labelledby={sizesId}>
        <h2 id={sizesId} className={styles.sectionTitle}>
          {t('common.switchGallery.sizesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.switchGallery.sizesDesc')}</p>
        <div className={styles.scaleGrid}>
          {(['xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const).map((sz) => {
            const sizeFieldId = `${baseId}-size-${sz}`;
            return (
              <div key={sz} className={styles.fieldRow}>
                <Switch
                  id={sizeFieldId}
                  name={`scale-${sz}`}
                  size={sz}
                  defaultChecked={sz === 'md' || sz === 'xl'}
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
          {t('common.switchGallery.controlledTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.controlledDesc')}
        </p>
        <div className={styles.fieldset}>
          <div className={styles.fieldRow}>
            <Switch
              id={ctrlId}
              name="telemetry-stream"
              checked={controlledActive}
              onChange={(e) => setControlledActive(e.target.checked)}
              data-testid="specimen-controlled"
            />
            <label htmlFor={ctrlId} className={styles.label}>
              {t('common.switchGallery.controlledLabel')}
            </label>
          </div>
          <div className={styles.statusCard}>
            <span>{t('common.switchGallery.controlledStatusPrefix')}:</span>
            <span className={styles.statusValue}>
              {controlledActive
                ? t('common.switchGallery.controlledStatusActive')
                : t('common.switchGallery.controlledStatusInactive')}
            </span>
          </div>
        </div>
      </section>

      {/* 4. Uncontrolled Mode & Form Reset */}
      <section className={styles.section} aria-labelledby={uncontrolledId}>
        <h2 id={uncontrolledId} className={styles.sectionTitle}>
          {t('common.switchGallery.uncontrolledTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.uncontrolledDesc')}
        </p>
        <form
          onReset={() => {
            // Native form reset behavior restores defaultChecked
          }}
          className={styles.fieldset}
        >
          <div className={styles.fieldRow}>
            <Switch
              id={unctrlAutosaveId}
              name="autosave"
              defaultChecked
              data-testid="specimen-uncontrolled-autosave"
            />
            <label htmlFor={unctrlAutosaveId} className={styles.label}>
              {t('common.switchGallery.uncontrolledOptAutosave')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Switch
              id={unctrlDiagnosticsId}
              name="diagnostics"
              data-testid="specimen-uncontrolled-diagnostics"
            />
            <label htmlFor={unctrlDiagnosticsId} className={styles.label}>
              {t('common.switchGallery.uncontrolledOptDiagnostics')}
            </label>
          </div>
          <div>
            <Button
              type="reset"
              variant="secondary"
              size="sm"
              data-testid="specimen-uncontrolled-reset-btn"
            >
              {t('common.switchGallery.uncontrolledResetButton')}
            </Button>
          </div>
        </form>
      </section>

      {/* 5. Operational States & Combined Precedence */}
      <section className={styles.section} aria-labelledby={statesId}>
        <h2 id={statesId} className={styles.sectionTitle}>
          {t('common.switchGallery.statesTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.switchGallery.statesDesc')}</p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-unchecked`}
              name="state-demo-1"
              data-testid="specimen-unchecked"
            />
            <label htmlFor={`${baseId}-state-unchecked`} className={styles.label}>
              {t('common.switchGallery.stateUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-checked`}
              name="state-demo-2"
              defaultChecked
              data-testid="specimen-checked"
            />
            <label htmlFor={`${baseId}-state-checked`} className={styles.label}>
              {t('common.switchGallery.stateCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-disabled-unchecked`}
              name="state-demo-3"
              disabled
              data-testid="specimen-disabled-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-disabled-unchecked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateDisabledUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-disabled-checked`}
              name="state-demo-4"
              disabled
              defaultChecked
              data-testid="specimen-disabled-checked"
            />
            <label
              htmlFor={`${baseId}-state-disabled-checked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateDisabledCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-invalid-unchecked`}
              name="state-demo-5"
              aria-invalid="true"
              data-testid="specimen-invalid-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-unchecked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateInvalidUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-invalid-checked`}
              name="state-demo-6"
              aria-invalid="true"
              defaultChecked
              data-testid="specimen-invalid-checked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-checked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateInvalidCheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-invalid-disabled-unchecked`}
              name="state-demo-7"
              aria-invalid="true"
              disabled
              data-testid="specimen-invalid-disabled-unchecked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-disabled-unchecked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateInvalidDisabledUncheckedLabel')}
            </label>
          </div>

          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-state-invalid-disabled-checked`}
              name="state-demo-8"
              aria-invalid="true"
              disabled
              defaultChecked
              data-testid="specimen-invalid-disabled-checked"
            />
            <label
              htmlFor={`${baseId}-state-invalid-disabled-checked`}
              className={styles.label}
            >
              {t('common.switchGallery.stateInvalidDisabledCheckedLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 6. Required Validation & Accessible Relationships */}
      <section className={styles.section} aria-labelledby={helpErrorId}>
        <h2 id={helpErrorId} className={styles.sectionTitle}>
          {t('common.switchGallery.helpErrorTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.helpErrorDesc')}
        </p>
        <div className={styles.fieldset}>
          <div className={styles.fieldRow}>
            <Switch
              id={reqFirewallId}
              name="firewall"
              required
              checked={requiredChecked}
              aria-invalid={requiredError ? 'true' : 'false'}
              aria-describedby={requiredError ? `${reqHelpId} ${reqErrorId}` : reqHelpId}
              onChange={(e) => {
                setRequiredChecked(e.target.checked);
                setRequiredError(false);
              }}
              data-testid="specimen-required"
            />
            <label htmlFor={reqFirewallId} className={styles.label}>
              {t('common.switchGallery.requiredLabel')}
            </label>
          </div>
          <span id={reqHelpId} className={styles.helpText}>
            {t('common.switchGallery.requiredHelpText')}
          </span>
          {requiredError && (
            <span id={reqErrorId} className={styles.errorText} role="alert">
              {t('common.switchGallery.requiredErrorText')}
            </span>
          )}
          <div className={styles.formActions}>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!requiredChecked) {
                  setRequiredError(true);
                } else {
                  setRequiredError(false);
                }
              }}
              data-testid="specimen-required-validate-btn"
            >
              {t('common.switchGallery.requiredValidateButton')}
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Independent Switches & Disabled Fieldset */}
      <section className={styles.section} aria-labelledby={independentId}>
        <h2 id={independentId} className={styles.sectionTitle}>
          {t('common.switchGallery.independentTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.independentDesc')}
        </p>
        <div className={styles.gridTwo}>
          <div className={styles.fieldset}>
            <div className={styles.fieldRow}>
              <Switch
                id={indepSyncId}
                name="independent-sync"
                defaultChecked
                data-testid="specimen-independent-1"
              />
              <label htmlFor={indepSyncId} className={styles.label}>
                {t('common.switchGallery.independentActiveLabel')}
              </label>
            </div>
          </div>

          <fieldset disabled className={styles.fieldset}>
            <legend className={styles.legend}>
              {t('common.switchGallery.fieldsetDisabledLegend')}
            </legend>
            <div className={styles.fieldRow}>
              <Switch
                id={fieldsetAdminId}
                name="admin-override"
                data-testid="specimen-fieldset-disabled"
              />
              <label htmlFor={fieldsetAdminId} className={styles.label}>
                {t('common.switchGallery.fieldsetDisabledOption')}
              </label>
            </div>
          </fieldset>
        </div>
      </section>

      {/* 8. Localization, RTL & Long Labels */}
      <section className={styles.section} aria-labelledby={localizationId}>
        <h2 id={localizationId} className={styles.sectionTitle}>
          {t('common.switchGallery.localizationTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.localizationDesc')}
        </p>
        <div className={styles.fieldset}>
          {/* Explicit Arabic script container */}
          <div dir="rtl" className={styles.fieldset}>
            <div className={styles.fieldRow}>
              <Switch
                id={arabicId}
                name="arabic-setting"
                defaultChecked
                data-testid="specimen-arabic"
              />
              <label htmlFor={arabicId} className={styles.label}>
                {t('common.switchGallery.arabicSpecimenLabel')}
              </label>
            </div>
            <span id={arabicHelpId} className={styles.helpText}>
              {t('common.switchGallery.arabicSpecimenHelp')}
            </span>

            {/* Nested LTR direction region inside RTL */}
            <div dir="ltr" className={styles.fieldRowSpaced}>
              <Switch
                id={nestedLtrId}
                name="nested-ltr-setting"
                defaultChecked
                data-testid="specimen-nested-ltr"
              />
              <label htmlFor={nestedLtrId} className={styles.label}>
                {t('common.switchGallery.nestedLtrLabel')}
              </label>
            </div>
          </div>

          {/* Mixed LTR technical code */}
          <div className={styles.fieldRowSpaced}>
            <Switch
              id={mixedId}
              name="mixed-sensor-setting"
              defaultChecked
              data-testid="specimen-mixed-code"
            />
            <label htmlFor={mixedId} className={styles.label}>
              {t('common.switchGallery.mixedTechPrefix')}{' '}
              <BidiText dir="ltr">SENS-84920-X</BidiText>
            </label>
          </div>

          {/* Multi-line wrapping label */}
          <div className={styles.fieldRowSpaced}>
            <Switch
              id={longLabelId}
              name="long-feature-setting"
              defaultChecked
              data-testid="specimen-long-label"
            />
            <label htmlFor={longLabelId} className={styles.label}>
              {t('common.switchGallery.longLabelSpecimen')}
            </label>
          </div>
        </div>
      </section>

      {/* 9. Touch Targets & Theme Parity */}
      <section className={styles.section} aria-labelledby={themeId}>
        <h2 id={themeId} className={styles.sectionTitle}>
          {t('common.switchGallery.themeTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.switchGallery.themeDesc')}</p>
        <div className={styles.fieldset}>
          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-touch-auto`}
              name="touch-auto-switch"
              touchTarget="auto"
              defaultChecked
              data-testid="specimen-touch-auto"
            />
            <label htmlFor={`${baseId}-touch-auto`} className={styles.label}>
              {t('common.switchGallery.touchAutoSpecimen')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-touch-comfortable`}
              name="touch-comfortable-switch"
              touchTarget="comfortable"
              data-testid="specimen-touch-comfortable"
            />
            <label
              htmlFor={`${baseId}-touch-comfortable`}
              className={styles.label}
            >
              {t('common.switchGallery.touchComfortableSpecimen')}
            </label>
          </div>
        </div>

        <div className={styles.gridTwo}>
          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-theme-checked`}
              name="theme-checked-switch"
              defaultChecked
              data-testid="specimen-theme-checked"
            />
            <label htmlFor={`${baseId}-theme-checked`} className={styles.label}>
              {t('common.switchGallery.themeCheckedLabel')}
            </label>
          </div>
          <div className={styles.fieldRow}>
            <Switch
              id={`${baseId}-theme-unchecked`}
              name="theme-unchecked-switch"
              data-testid="specimen-theme-unchecked"
            />
            <label htmlFor={`${baseId}-theme-unchecked`} className={styles.label}>
              {t('common.switchGallery.themeUncheckedLabel')}
            </label>
          </div>
        </div>
      </section>

      {/* 10. Local Form Demonstration */}
      <section className={styles.section} aria-labelledby={formDemoId}>
        <h2 id={formDemoId} className={styles.sectionTitle}>
          {t('common.switchGallery.formDemoTitle')}
        </h2>
        <p className={styles.sectionDesc}>
          {t('common.switchGallery.formDemoDesc')}
        </p>
        <form
          onSubmit={handleFormSubmit}
          onReset={handleFormReset}
          className={styles.formGrid}
          data-testid="gallery-form"
        >
          <div className={styles.fieldset}>
            <div className={styles.fieldRow}>
              <Switch
                id={formTelemetryId}
                name="telemetry-stream"
                checked={formTelemetry}
                onChange={(e) => setFormTelemetry(e.target.checked)}
                data-testid="specimen-form-telemetry"
              />
              <label htmlFor={formTelemetryId} className={styles.label}>
                {t('common.switchGallery.formTelemetryLabel')}
              </label>
            </div>
            <div className={styles.fieldRow}>
              <Switch
                id={formDiagnosticsId}
                name="crash-diagnostics"
                checked={formDiagnostics}
                onChange={(e) => setFormDiagnostics(e.target.checked)}
                data-testid="specimen-form-diagnostics"
              />
              <label htmlFor={formDiagnosticsId} className={styles.label}>
                {t('common.switchGallery.formDiagnosticsLabel')}
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <Button
              type="submit"
              disabled={isSubmitting}
              data-testid="specimen-form-submit-btn"
            >
              {t('common.switchGallery.formSubmitButton')}
            </Button>
            <Button
              type="reset"
              variant="secondary"
              data-testid="specimen-form-reset-btn"
            >
              {t('common.switchGallery.formResetButton')}
            </Button>
          </div>

          <div className={styles.statusCard} data-testid="form-status-display">
            <span>{t('common.switchGallery.formStatusPrefix')}:</span>
            <span className={styles.statusValue}>
              {t(FORM_STATUS_MAP[formStatusId])}
            </span>
          </div>
          <span className={styles.helpText}>
            {t('common.switchGallery.formDisclaimer')}
          </span>
        </form>
      </section>

      {/* 11. Code Usage Examples */}
      <section className={styles.section} aria-labelledby={usageId}>
        <h2 id={usageId} className={styles.sectionTitle}>
          {t('common.switchGallery.usageTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.switchGallery.usageDesc')}</p>
        <pre className={styles.codeBlock}>
          {`// Standard Uncontrolled Setting
<div>
  <Switch id="airplane-mode" name="airplane" defaultChecked />
  <label htmlFor="airplane-mode">Airplane Mode</label>
</div>

// Controlled Setting
const [active, setActive] = useState(false);

<div>
  <Switch
    id="telemetry"
    name="telemetry"
    checked={active}
    onChange={(e) => setActive(e.target.checked)}
  />
  <label htmlFor="telemetry">Live Telemetry</label>
</div>`}
        </pre>
      </section>
    </main>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { type ControlSize, DatePicker } from '@/components/ui';
import { BidiText, defaultMessages, type SupportedLocale, translate } from '@/i18n';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './date-picker-gallery.module.css';

export interface DatePickerGalleryProps {
  linkComponent?: StudioLinkComponent;
}

type DatePickerSizeChoice = ControlSize | 'default';
type DatePickerStageView = 'single' | 'all-sizes';
type DatePickerTouchTarget = 'auto' | 'comfortable';

const DEFAULT_SPECIMEN_DATE = new Date(2026, 10, 10);
const MIN_SPECIMEN_ISO = '2026-11-05';
const MAX_SPECIMEN_ISO = '2026-11-25';
const ALL_SIZES: readonly ControlSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

const INTL_LOCALE_BY_SUPPORTED: Record<SupportedLocale, string> = {
  en: 'en-US',
  fr: 'fr-FR',
  ar: 'ar-u-ca-gregory-nu-latn',
};

function formatIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function DatePickerGallery({ linkComponent }: DatePickerGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [stageView, setStageView] = useState<DatePickerStageView>('single');
  const [selectedDate, setSelectedDate] = useState<Date | null>(DEFAULT_SPECIMEN_DATE);
  const [size, setSize] = useState<DatePickerSizeChoice>('default');
  const [touchTarget, setTouchTarget] = useState<DatePickerTouchTarget>('auto');
  const [clearable, setClearable] = useState<boolean>(true);
  const [invalid, setInvalid] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);
  const [isConstrained, setIsConstrained] = useState<boolean>(false);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenIntlLocale = INTL_LOCALE_BY_SUPPORTED[specimenLocale];

  const specimenT = useCallback(
    (key: Parameters<typeof t>[0]) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setSelectedDate(DEFAULT_SPECIMEN_DATE);
    setSize('default');
    setTouchTarget('auto');
    setClearable(true);
    setInvalid(false);
    setDisabled(false);
    setIsConstrained(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'date-picker-dir-ltr' },
      { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'date-picker-dir-rtl' },
    ],
    [t],
  );

  const viewOptions: readonly StudioSegmentedOption<DatePickerStageView>[] = useMemo(
    () => [
      { value: 'single', label: t('common.studio.viewSingle'), testId: 'opt-view-single' },
      { value: 'all-sizes', label: t('common.studio.viewAllSizes'), testId: 'opt-view-all-sizes' },
    ],
    [t],
  );

  const sizeOptions: readonly StudioSegmentedOption<DatePickerSizeChoice>[] = useMemo(
    () => [
      { value: 'default', label: t('common.studio.sizeDefault'), testId: 'opt-size-default' },
      { value: 'xs', label: t('common.studio.sizeXs'), testId: 'opt-size-xs' },
      { value: 'sm', label: t('common.studio.sizeSm'), testId: 'opt-size-sm' },
      { value: 'md', label: t('common.studio.sizeMd'), testId: 'opt-size-md' },
      { value: 'lg', label: t('common.studio.sizeLg'), testId: 'opt-size-lg' },
      { value: 'xl', label: t('common.studio.sizeXl'), testId: 'opt-size-xl' },
      { value: '2xl', label: t('common.studio.size2xl'), testId: 'opt-size-2xl' },
    ],
    [t],
  );

  const touchOptions: readonly StudioSegmentedOption<DatePickerTouchTarget>[] = useMemo(
    () => [
      { value: 'auto', label: t('common.studio.touchAuto'), testId: 'opt-touch-auto' },
      {
        value: 'comfortable',
        label: t('common.studio.touchComfortable'),
        testId: 'opt-touch-comfortable',
      },
    ],
    [t],
  );

  const minDate = isConstrained ? MIN_SPECIMEN_ISO : undefined;
  const maxDate = isConstrained ? MAX_SPECIMEN_ISO : undefined;

  const isoString = useMemo(() => {
    if (!selectedDate) return null;
    return formatIso(selectedDate);
  }, [selectedDate]);

  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return specimenT('common.studio.datePickerNone');
    return new Intl.DateTimeFormat(specimenIntlLocale, {
      dateStyle: 'medium',
    }).format(selectedDate);
  }, [selectedDate, specimenIntlLocale, specimenT]);

  const resolvedControlSize: ControlSize | undefined = size === 'default' ? undefined : size;
  const specimenPlaceholder = specimenT('common.studio.datePickerPlaceholder');
  const specimenClearLabel = specimenT('common.studio.comboboxClearAria');
  const specimenPrevLabel = specimenT('common.studio.datePickerPrevMonthAria');
  const specimenNextLabel = specimenT('common.studio.datePickerNextMonthAria');
  const specimenPrevYearLabel = specimenT('common.studio.datePickerPrevYearAria');
  const specimenNextYearLabel = specimenT('common.studio.datePickerNextYearAria');
  const specimenPrevYearsLabel = specimenT('common.studio.datePickerPrevYearsAria');
  const specimenNextYearsLabel = specimenT('common.studio.datePickerNextYearsAria');
  const specimenSelectMonthLabel = specimenT('common.studio.datePickerSelectMonthAria');
  const specimenSelectYearLabel = specimenT('common.studio.datePickerSelectYearAria');
  const specimenInputAria = specimenT('common.studio.datePickerInputAria');
  const resolvedTriggerAriaLabel = selectedDate
    ? `${specimenInputAria}: ${formattedDisplay}`
    : specimenInputAria;

  const jsxSnippet = useMemo(() => {
    const optionalLines = [
      size !== 'default' ? `  size="${size}"` : null,
      touchTarget !== 'auto' ? `  touchTarget="${touchTarget}"` : null,
      invalid ? '  invalid' : null,
      disabled ? '  disabled' : null,
      !clearable ? '  clearable={false}' : null,
      isConstrained ? `  minDate="${MIN_SPECIMEN_ISO}"\n  maxDate="${MAX_SPECIMEN_ISO}"` : null,
    ]
      .filter(Boolean)
      .join('\n');

    return `<DatePicker
  value={selectedDate}
  onChange={(date) => setSelectedDate(date)}
  locale="${specimenIntlLocale}"
  placeholder="${specimenPlaceholder}"
  clearLabel="${specimenClearLabel}"
  previousMonthLabel="${specimenPrevLabel}"
  nextMonthLabel="${specimenNextLabel}"
  aria-label="${specimenInputAria}"${optionalLines ? `\n${optionalLines}` : ''}
/>`;
  }, [
    size,
    touchTarget,
    invalid,
    disabled,
    clearable,
    isConstrained,
    specimenIntlLocale,
    specimenPlaceholder,
    specimenClearLabel,
    specimenPrevLabel,
    specimenNextLabel,
    specimenInputAria,
  ]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible DatePicker using UI Kit primitives:
- Size: ${size === 'default' ? 'product default (md in Dashboard, xl in Website)' : size}
- Touch Target: ${touchTarget}
- Clearable: ${clearable}, Invalid: ${invalid}, Disabled: ${disabled}
- Min/Max Date Bounds: ${isConstrained ? `${MIN_SPECIMEN_ISO} to ${MAX_SPECIMEN_ISO}` : 'None'}
- Locale: ${specimenIntlLocale} (${specimenDir.toUpperCase()})
- WAI-ARIA role="grid" with week role="row" elements, roving day focus, RTL ArrowLeft/ArrowRight inversion, and zero dashboard shadows.`;
  }, [
    size,
    touchTarget,
    clearable,
    invalid,
    disabled,
    isConstrained,
    specimenIntlLocale,
    specimenDir,
  ]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.datePickerSpecConfigTitle'),
        items: [
          {
            label: t('common.studio.datePickerSize'),
            value: size === 'default' ? t('common.studio.sizeDefault') : size,
          },
          { label: t('common.studio.btnTouchTargetLabel'), value: touchTarget },
          {
            label: t('common.studio.datePickerSpecSelectedIso'),
            value: isoString ?? t('common.studio.datePickerNone'),
          },
          { label: t('common.studio.datePickerClearable'), value: String(clearable) },
          { label: t('common.studio.datePickerInvalid'), value: String(invalid) },
          { label: t('common.studio.datePickerDisabled'), value: String(disabled) },
          { label: t('common.studio.datePickerConstrained'), value: String(isConstrained) },
          { label: t('common.studio.specDirection'), value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: t('common.studio.datePickerSpecA11yTitle'),
        items: [
          { label: t('common.studio.datePickerSpecTriggerPopup'), value: 'aria-haspopup="dialog"' },
          { label: t('common.studio.datePickerSpecCalendarGrid'), value: 'role="grid"' },
          { label: t('common.studio.datePickerSpecColumnHeaders'), value: 'role="columnheader"' },
          { label: t('common.studio.datePickerSpecSelectedDay'), value: 'aria-selected="true"' },
          { label: t('common.studio.datePickerSpecTodayDay'), value: 'aria-current="date"' },
        ],
      },
    ];
  }, [size, touchTarget, isoString, clearable, invalid, disabled, isConstrained, specimenDir, t]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        columns={2}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.datePickerStageView')}
        value={stageView}
        columns={2}
        options={viewOptions}
        onChange={setStageView}
      />

      {stageView === 'single' && (
        <StudioSegmentedControl
          label={t('common.studio.datePickerSize')}
          value={size}
          options={sizeOptions}
          onChange={setSize}
        />
      )}

      <StudioSegmentedControl
        label={t('common.studio.btnTouchTargetLabel')}
        value={touchTarget}
        columns={2}
        options={touchOptions}
        onChange={setTouchTarget}
      />

      <StudioToggleRow
        label={t('common.studio.datePickerClearable')}
        checked={clearable}
        onCheckedChange={setClearable}
        testId="toggle-date-picker-clearable"
      />

      <StudioToggleRow
        label={t('common.studio.datePickerInvalid')}
        checked={invalid}
        onCheckedChange={setInvalid}
        testId="toggle-date-picker-invalid"
      />

      <StudioToggleRow
        label={t('common.studio.datePickerDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-date-picker-disabled"
      />

      <StudioToggleRow
        label={t('common.studio.datePickerConstrained')}
        checked={isConstrained}
        onCheckedChange={setIsConstrained}
        testId="toggle-date-picker-constrained"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="date-picker"
      title={t('common.studio.datePickerTitle')}
      subtitle={t('common.studio.datePickerSubtitle')}
      testId="gallery-date-picker"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="date-picker.module.css"
          jsxFileName="date-picker.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.specimenCanvas}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="date-picker-canvas"
      >
        {stageView === 'single' ? (
          <div className={styles.specimenBox}>
            <DatePicker
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={minDate}
              maxDate={maxDate}
              size={resolvedControlSize}
              touchTarget={touchTarget}
              clearable={clearable}
              invalid={invalid}
              disabled={disabled}
              locale={specimenIntlLocale}
              placeholder={specimenPlaceholder}
              clearLabel={specimenClearLabel}
              previousMonthLabel={specimenPrevLabel}
              nextMonthLabel={specimenNextLabel}
              previousYearLabel={specimenPrevYearLabel}
              nextYearLabel={specimenNextYearLabel}
              previousYearsLabel={specimenPrevYearsLabel}
              nextYearsLabel={specimenNextYearsLabel}
              selectMonthLabel={specimenSelectMonthLabel}
              selectYearLabel={specimenSelectYearLabel}
              aria-label={resolvedTriggerAriaLabel}
              data-testid="live-date-picker"
            />

            <div className={styles.valueCard} data-testid="date-picker-value-card">
              <span>{t('common.studio.datePickerSelectedLabel')}:</span>
              <span className={styles.valueEm}>
                {formattedDisplay}
                {isoString ? (
                  <>
                    {' '}
                    (<BidiText dir="ltr">{isoString}</BidiText>)
                  </>
                ) : null}
              </span>
            </div>
          </div>
        ) : (
          <div className={styles.comparisonGrid}>
            {ALL_SIZES.map((step) => (
              <div key={step} className={styles.sizeItem}>
                <span className={styles.itemLabel}>{step.toUpperCase()}</span>
                <DatePicker
                  size={step}
                  touchTarget={touchTarget}
                  defaultValue={DEFAULT_SPECIMEN_DATE}
                  locale={specimenIntlLocale}
                  placeholder={specimenPlaceholder}
                  clearLabel={specimenClearLabel}
                  previousMonthLabel={specimenPrevLabel}
                  nextMonthLabel={specimenNextLabel}
                  previousYearLabel={specimenPrevYearLabel}
                  nextYearLabel={specimenNextYearLabel}
                  previousYearsLabel={specimenPrevYearsLabel}
                  nextYearsLabel={specimenNextYearsLabel}
                  selectMonthLabel={specimenSelectMonthLabel}
                  selectYearLabel={specimenSelectYearLabel}
                  aria-label={`${specimenInputAria} (${step})`}
                  data-testid={`date-picker-size-${step}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

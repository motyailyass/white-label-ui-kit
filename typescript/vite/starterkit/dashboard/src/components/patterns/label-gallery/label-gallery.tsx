'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Badge, Input, Label, type LabelSize } from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  type SupportedLocale,
  translate,
  type TranslationKey,
} from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n, useTheme } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './label-gallery.module.css';

export type LabelSpecimenDirection = 'ltr' | 'rtl';
export type LabelStageView = 'single' | 'matrix';
export type LabelSizeOption = 'auto' | LabelSize;

export interface LabelGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function LabelGallery({ linkComponent }: LabelGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  const stageInputId = useId();
  const densityHeadingId = useId();
  const statesHeadingId = useId();
  const autoInputId = useId();
  const smInputId = useId();
  const mdInputId = useId();
  const lgInputId = useId();
  const reqInputId = useId();
  const customInputId = useId();
  const disabledInputId = useId();
  const badgeInputId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<LabelSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<LabelStageView>('single');
  const [sizeOption, setSizeOption] = useState<LabelSizeOption>('auto');
  const [isRequired, setIsRequired] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [customIndicator, setCustomIndicator] = useState(false);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  const explicitSize: LabelSize | undefined = sizeOption === 'auto' ? undefined : sizeOption;

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setSizeOption('auto');
    setIsRequired(true);
    setIsDisabled(false);
    setCustomIndicator(false);
  }, [direction]);

  const dirOptions: readonly StudioSegmentedOption<LabelSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<LabelStageView>[] = [
    { value: 'single', label: t('common.studio.labelViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.labelViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<LabelSizeOption>[] = [
    { value: 'auto', label: t('common.studio.labelSizeAuto'), testId: 'opt-size-auto' },
    { value: 'sm', label: t('common.studio.labelSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.labelSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.labelSizeLg'), testId: 'opt-size-lg' },
  ];

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.labelSpecGroupAssoc'),
        items: [
          { label: t('common.studio.labelSpecElement'), value: '<label>' },
          { label: t('common.studio.labelSpecHtmlFor'), value: stageInputId },
          { label: t('common.studio.labelSpecDirection'), value: specimenDir.toUpperCase() },
          {
            label: t('common.studio.labelSpecRequired'),
            value: isRequired
              ? t('common.studio.labelSpecTrue')
              : t('common.studio.labelSpecFalse'),
          },
        ],
      },
      {
        title: t('common.studio.labelSpecGroupTokens'),
        items: [
          { label: t('common.studio.labelSpecTheme'), value: resolvedTheme },
          {
            label: t('common.studio.labelSpecSizeProp'),
            value: explicitSize ?? t('common.studio.labelSpecSizeAutoVal'),
          },
          {
            label: t('common.studio.labelSpecDisabled'),
            value: isDisabled
              ? t('common.studio.labelSpecTrue')
              : t('common.studio.labelSpecFalse'),
          },
        ],
      },
    ],
    [stageInputId, specimenDir, isRequired, resolvedTheme, explicitSize, isDisabled, t],
  );

  const jsxSnippet = useMemo(() => {
    const reqProp = isRequired
      ? customIndicator
        ? `\n  required\n  requiredIndicator=" ${specimenT('common.studio.labelCustomRequiredText')}"`
        : '\n  required'
      : '';
    const disProp = isDisabled ? '\n  disabled' : '';
    const sizeProp = explicitSize ? `\n  size="${explicitSize}"` : '';

    return `<div className={styles.fieldGroup}>
  <Label
    htmlFor={fieldId}${sizeProp}${reqProp}${disProp}
  >
    {t('field.emailAddress')}
  </Label>
  <Input
    id={fieldId}
    type="email"
    disabled={${isDisabled}}
    required={${isRequired}}
  />
</div>`;
  }, [explicitSize, isRequired, customIndicator, isDisabled, specimenT]);

  const cssModuleSnippet = `.fieldGroup {
  display: flex;
  flex-direction: column;
  gap: var(--space-1-5);
  inline-size: 100%;
}`;

  const aiAgentPrompt = useMemo(
    () => `Create an accessible form field group using @/components/ui Label and Input:
- Associate Label via React.useId() htmlFor={fieldId} matching Input id={fieldId}
- Size: ${explicitSize ? `size="${explicitSize}"` : 'omitted (inherits product --typography-label-* defaults)'}
- Required: ${isRequired ? 'true (aria-hidden indicator)' : 'false'}
- Disabled: ${isDisabled ? 'true' : 'false'}
- Direction: ${specimenDir}
- Localized strings via t(), 100% CSS logical properties, zero dashboard shadows.`,
    [explicitSize, isRequired, isDisabled, specimenDir],
  );

  const customReqText = ` ${specimenT('common.studio.labelCustomRequiredText')}`;

  return (
    <GalleryStudioLayout
      activeRoute="label"
      title={t('common.studio.labelTitle')}
      subtitle={t('common.studio.labelSubtitle')}
      testId="label-studio"
      linkComponent={linkComponent}
      onReset={handleReset}
      controls={
        <div className={styles.controlGroup}>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label={t('common.studio.labelViewModeLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <>
              <StudioSegmentedControl
                label={t('common.studio.labelDensityLabel')}
                value={sizeOption}
                options={sizeOptions}
                onChange={setSizeOption}
                columns={2}
              />

              <hr className={styles.controlDivider} />

              <StudioToggleRow
                label={t('common.studio.labelToggleRequired')}
                checked={isRequired}
                onCheckedChange={setIsRequired}
                testId="toggle-label-required"
              />

              {isRequired && (
                <StudioToggleRow
                  label={t('common.studio.labelToggleCustomIndicator')}
                  checked={customIndicator}
                  onCheckedChange={setCustomIndicator}
                  testId="toggle-label-custom-indicator"
                />
              )}

              <StudioToggleRow
                label={t('common.studio.labelToggleDisabled')}
                checked={isDisabled}
                onCheckedChange={setIsDisabled}
                testId="toggle-label-disabled"
              />
            </>
          )}
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="form-field.tsx"
          cssFileName="form-field.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
        data-testid="label-canvas"
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              <Label
                htmlFor={stageInputId}
                size={explicitSize}
                required={isRequired}
                requiredIndicator={customIndicator ? customReqText : '*'}
                disabled={isDisabled}
                data-testid="specimen-label"
              >
                {specimenT('common.studio.labelEmailLabel')}
              </Label>
              <div className={styles.inputMock}>
                <Input
                  id={stageInputId}
                  type="email"
                  placeholder={specimenT('common.studio.labelEmailPlaceholder')}
                  disabled={isDisabled}
                  required={isRequired}
                  data-testid="specimen-label-input"
                />
              </div>
              <p className={styles.focusHint}>{specimenT('common.studio.labelFocusHint')}</p>
            </div>
          </div>
        ) : (
          <div className={styles.sectionBlock} data-testid="label-matrix-grid">
            <section className={styles.sectionBlock} aria-labelledby={densityHeadingId}>
              <h2 id={densityHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.labelShowcaseHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelAutoTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={autoInputId} required data-testid="matrix-label-auto">
                      {specimenT('common.studio.labelAutoField')}
                    </Label>
                    <Input
                      id={autoInputId}
                      placeholder={specimenT('common.studio.labelAutoPlaceholder')}
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelSmallTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={smInputId} size="sm" required data-testid="matrix-label-sm">
                      {specimenT('common.studio.labelSmallField')}
                    </Label>
                    <Input
                      id={smInputId}
                      size="sm"
                      placeholder={specimenT('common.studio.labelSmallPlaceholder')}
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelMdTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={mdInputId} size="md" required data-testid="matrix-label-md">
                      {specimenT('common.studio.labelMdField')}
                    </Label>
                    <Input
                      id={mdInputId}
                      size="md"
                      placeholder={specimenT('common.studio.labelMdPlaceholder')}
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelLargeTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={lgInputId} size="lg" required data-testid="matrix-label-lg">
                      {specimenT('common.studio.labelLargeField')}
                    </Label>
                    <Input
                      id={lgInputId}
                      size="lg"
                      placeholder={specimenT('common.studio.labelLargePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className={styles.sectionBlock} aria-labelledby={statesHeadingId}>
              <h2 id={statesHeadingId} className={styles.sectionHeading}>
                {specimenT('common.studio.labelMatrixStatesHeading')}
              </h2>
              <div className={styles.specimenGrid}>
                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelStateRequiredTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={reqInputId} required>
                      {specimenT('common.studio.labelStateRequiredField')}
                    </Label>
                    <Input
                      id={reqInputId}
                      placeholder={specimenT('common.studio.labelStateRequiredPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelStateCustomTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={customInputId} required requiredIndicator={customReqText}>
                      {specimenT('common.studio.labelStateCustomField')}
                    </Label>
                    <Input
                      id={customInputId}
                      type="email"
                      placeholder={specimenT('common.studio.labelEmailPlaceholder')}
                      required
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelStateDisabledTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={disabledInputId} disabled>
                      {specimenT('common.studio.labelStateDisabledField')}
                    </Label>
                    <Input
                      id={disabledInputId}
                      disabled
                      placeholder={specimenT('common.studio.labelStateDisabledPlaceholder')}
                    />
                  </div>
                </div>

                <div className={styles.showcaseCard}>
                  <h3 className={styles.showcaseTitle}>
                    {specimenT('common.studio.labelStateBadgeTitle')}
                  </h3>
                  <div className={styles.showcaseBody}>
                    <Label htmlFor={badgeInputId}>
                      {specimenT('common.studio.labelStateBadgeField')}
                      <BidiText dir="ltr">SSO</BidiText>
                      <Badge variant="outline" size="sm">
                        {specimenT('common.studio.labelStateBadgeTag')}
                      </Badge>
                    </Label>
                    <Input
                      id={badgeInputId}
                      placeholder={specimenT('common.studio.labelStateBadgePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

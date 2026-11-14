'use client';

import { useCallback, useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Icon } from '@/components/icons';
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
  Badge,
  Button,
  type AccordionChevronPosition,
  type AccordionSize,
  type AccordionType,
  type AccordionVariant,
} from '@/components/ui';
import {
  BidiText,
  defaultMessages,
  translate,
  type SupportedLocale,
  type TranslationKey,
} from '@/i18n';
import { cn } from '@/lib/cn';
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
import styles from './accordion-gallery.module.css';

export type AccordionSpecimenDirection = 'ltr' | 'rtl';
export type AccordionStageView = 'single' | 'matrix';
export type AccordionScenario = 'faq' | 'settings' | 'invoice';
export type AccordionPreviewSize = 'sm' | 'md' | 'lg';

export interface AccordionGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function AccordionGallery({ linkComponent }: AccordionGalleryProps) {
  const { t, locale, direction } = useI18n();
  const variantsHeadingId = useId();
  const sizesHeadingId = useId();

  // Studio Interactive State
  const [specimenDir, setSpecimenDir] = useState<AccordionSpecimenDirection>(direction);
  const [stageView, setStageView] = useState<AccordionStageView>('single');
  const [scenario, setScenario] = useState<AccordionScenario>('faq');
  const [variant, setVariant] = useState<AccordionVariant>('default');
  const [size, setSize] = useState<AccordionPreviewSize>('md');
  const [expansionType, setExpansionType] = useState<AccordionType>('single');
  const [collapsible, setCollapsible] = useState(true);
  const [chevronPosition, setChevronPosition] = useState<AccordionChevronPosition>('end');

  // Active open values
  const [singleValue, setSingleValue] = useState<string>('item-1');
  const [multipleValues, setMultipleValues] = useState<string[]>(['item-1']);

  useEffect(() => {
    setSpecimenDir(direction);
  }, [direction]);

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setStageView('single');
    setScenario('faq');
    setVariant('default');
    setSize('md');
    setExpansionType('single');
    setCollapsible(true);
    setChevronPosition('end');
    setSingleValue('item-1');
    setMultipleValues(['item-1']);
  }, [direction]);

  const specimenLocale: SupportedLocale =
    specimenDir === 'rtl' ? 'ar' : locale === 'ar' ? 'en' : locale;
  const specimenLangAttr = specimenLocale !== locale ? specimenLocale : undefined;
  const specimenT = useCallback(
    (key: TranslationKey) => translate(defaultMessages, specimenLocale, key),
    [specimenLocale],
  );

  // Controls Options
  const dirOptions: readonly StudioSegmentedOption<AccordionSpecimenDirection>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
    { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
  ];

  const viewOptions: readonly StudioSegmentedOption<AccordionStageView>[] = [
    { value: 'single', label: t('common.studio.accordionViewSingle'), testId: 'opt-view-single' },
    { value: 'matrix', label: t('common.studio.accordionViewMatrix'), testId: 'opt-view-matrix' },
  ];

  const scenarioOptions: readonly StudioSegmentedOption<AccordionScenario>[] = [
    { value: 'faq', label: t('common.studio.accordionScenarioFaq'), testId: 'opt-scen-faq' },
    {
      value: 'settings',
      label: t('common.studio.accordionScenarioSettings'),
      testId: 'opt-scen-settings',
    },
    {
      value: 'invoice',
      label: t('common.studio.accordionScenarioInvoice'),
      testId: 'opt-scen-invoice',
    },
  ];

  const variantOptions: readonly StudioSegmentedOption<AccordionVariant>[] = [
    {
      value: 'default',
      label: t('common.studio.accordionVariantDefault'),
      testId: 'opt-var-default',
    },
    {
      value: 'enclosed',
      label: t('common.studio.accordionVariantEnclosed'),
      testId: 'opt-var-enclosed',
    },
    {
      value: 'flush',
      label: t('common.studio.accordionVariantFlush'),
      testId: 'opt-var-flush',
    },
  ];

  const sizeOptions: readonly StudioSegmentedOption<AccordionPreviewSize>[] = [
    { value: 'sm', label: t('common.studio.accordionSizeSm'), testId: 'opt-size-sm' },
    { value: 'md', label: t('common.studio.accordionSizeMd'), testId: 'opt-size-md' },
    { value: 'lg', label: t('common.studio.accordionSizeLg'), testId: 'opt-size-lg' },
  ];

  const expansionOptions: readonly StudioSegmentedOption<AccordionType>[] = [
    { value: 'single', label: t('common.studio.accordionTypeSingle'), testId: 'opt-type-single' },
    {
      value: 'multiple',
      label: t('common.studio.accordionTypeMultiple'),
      testId: 'opt-type-multiple',
    },
  ];

  const chevronOptions: readonly StudioSegmentedOption<AccordionChevronPosition>[] = [
    { value: 'end', label: t('common.studio.accordionChevronEnd'), testId: 'opt-chev-end' },
    { value: 'start', label: t('common.studio.accordionChevronStart'), testId: 'opt-chev-start' },
  ];

  // Dynamic JSX Snippet based on active scenario and variant
  const jsxSnippet = useMemo(() => {
    const propsList: string[] = [];
    if (expansionType === 'multiple') {
      propsList.push('type="multiple"');
      propsList.push(`defaultValue={['item-1']}`);
    } else {
      propsList.push('type="single"');
      propsList.push(`defaultValue="item-1"`);
      if (!collapsible) propsList.push('collapsible={false}');
      else propsList.push('collapsible');
    }

    if (variant !== 'default') propsList.push(`variant="${variant}"`);
    propsList.push(`size="${size}"`);
    if (chevronPosition !== 'end') propsList.push(`chevronPosition="${chevronPosition}"`);

    const formattedProps = propsList.length === 0 ? '' : ` ${propsList.join(' ')}`;

    if (scenario === 'settings') {
      return `<Accordion${formattedProps}>
  <AccordionItem value="sso">
    <AccordionHeader as="h3">
      <AccordionTrigger startIcon={<Icon name="feature" />}>
        ${specimenT('common.studio.accordionSettingsSsoTitle')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionSettingsSsoDesc')}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="api">
    <AccordionHeader as="h3">
      <AccordionTrigger startIcon={<Icon name="sliders" />}>
        ${specimenT('common.studio.accordionSettingsApiTitle')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionSettingsApiQuotaLabel')}: 10,000 req/min
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="audit">
    <AccordionHeader as="h3">
      <AccordionTrigger startIcon={<Icon name="bookmark" />}>
        ${specimenT('common.studio.accordionSettingsAuditTitle')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionSettingsAuditDesc')}
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
    }

    if (scenario === 'invoice') {
      return `<Accordion${formattedProps}>
  <AccordionItem value="items">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        <span>${specimenT('common.studio.accordionInvoiceItemsTitle')}</span>
        <Badge variant="primary" size="sm">
          <BidiText dir="ltr">4</BidiText> ${specimenT('common.studio.accordionInvoiceItemsCountUnit')}
        </Badge>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionInvoiceRowCore')}: $24,000.00
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="tax">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        <span>${specimenT('common.studio.accordionInvoiceTaxTitle')}</span>
        <Badge variant="default" size="sm">
          ${specimenT('common.studio.accordionInvoiceTaxBadge')} <BidiText dir="ltr">10%</BidiText>
        </Badge>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionInvoiceRowVat')}: $3,360.00
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="shipping">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        <span>${specimenT('common.studio.accordionInvoiceBillingTitle')}</span>
        <Badge variant="success" size="sm">
          ${specimenT('common.studio.accordionInvoiceBillingBadge')}
        </Badge>
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionInvoiceBillingDesc')}
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
    }

    return `<Accordion${formattedProps}>
  <AccordionItem value="item-1">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        ${specimenT('common.studio.accordionFaqQ1')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionFaqA1')}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-2">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        ${specimenT('common.studio.accordionFaqQ2')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionFaqA2')}
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="item-3">
    <AccordionHeader as="h3">
      <AccordionTrigger>
        ${specimenT('common.studio.accordionFaqQ3')}
      </AccordionTrigger>
    </AccordionHeader>
    <AccordionContent>
      ${specimenT('common.studio.accordionFaqA3')}
    </AccordionContent>
  </AccordionItem>
</Accordion>`;
  }, [expansionType, collapsible, variant, size, chevronPosition, scenario, specimenT]);

  const cssModuleSnippet = `/* Custom accordion container layout */
.faqSection {
  inline-size: 100%;
  max-inline-size: 42rem;
  margin-inline: auto;
}`;

  const aiAgentPrompt = useMemo(() => {
    return `Implement an accessible disclosure accordion using the kit's pure Accordion primitive:

\`\`\`tsx
${jsxSnippet}
\`\`\`

Requirements & Tokens:
- Pure UI Boundary: Consume \`@/components/ui/accordion\` compound exports directly.
- Scenario: ${scenario}.
- Variant: ${variant}.
- Control Sizing: ${size} (--control-height-${size}).
- Mode: ${expansionType}.
- WAI-ARIA: W3C Accordion pattern, aria-expanded, aria-controls, root-scoped roving arrow navigation.
- Zero Dashboard Shadows: 100% shadow-free surface hierarchy.
- Logical Properties: 100% CSS logical padding, spacing, and :lang(ar) line-height clearance.`;
  }, [jsxSnippet, scenario, variant, size, expansionType]);

  // Measured Spec Groups
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    const sizeMap: Record<AccordionPreviewSize, string> = {
      sm: t('common.studio.accordionSpecSizingSm'),
      md: t('common.studio.accordionSpecSizingMd'),
      lg: t('common.studio.accordionSpecSizingLg'),
    };
    const variantMap: Record<AccordionVariant, string> = {
      default: t('common.studio.accordionSpecVariantDefault'),
      enclosed: t('common.studio.accordionSpecVariantEnclosed'),
      flush: t('common.studio.accordionSpecVariantFlush'),
    };

    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: t('common.studio.accordionSpecScenario'), value: scenario },
          { label: t('common.studio.accordionSpecVariant'), value: variant },
          { label: t('common.studio.accordionSpecSize'), value: size },
          { label: t('common.studio.accordionSpecType'), value: expansionType },
          {
            label: t('common.studio.accordionSpecCollapsible'),
            value: collapsible
              ? t('common.studio.accordionSpecBoolTrue')
              : t('common.studio.accordionSpecBoolFalse'),
          },
          { label: t('common.studio.accordionSpecChevron'), value: chevronPosition },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          { label: t('common.studio.accordionSpecVariantTokens'), value: variantMap[variant] },
          { label: t('common.studio.accordionSpecSizingTokens'), value: sizeMap[size] },
          {
            label: t('common.studio.accordionSpecRadiusRole'),
            value: 'var(--radius-card) / var(--radius-control)',
          },
          {
            label: t('common.studio.accordionSpecChevronMotion'),
            value: t('common.studio.accordionSpecChevronMotionVal'),
          },
          {
            label: t('common.studio.accordionSpecShadowPolicy'),
            value: t('common.studio.accordionSpecShadowValue'),
          },
        ],
      },
    ];
  }, [scenario, variant, size, expansionType, collapsible, chevronPosition, t]);

  const handleScenarioChange = useCallback((nextScenario: AccordionScenario) => {
    setScenario(nextScenario);
    if (nextScenario === 'settings') {
      setSingleValue('sso');
      setMultipleValues(['sso']);
    } else if (nextScenario === 'invoice') {
      setSingleValue('items');
      setMultipleValues(['items']);
    } else {
      setSingleValue('item-1');
      setMultipleValues(['item-1']);
    }
  }, []);

  const renderAccordion = (content: ReactNode, testId?: string) => {
    if (expansionType === 'multiple') {
      return (
        <Accordion
          type="multiple"
          value={multipleValues}
          onValueChange={setMultipleValues}
          variant={variant}
          size={size}
          chevronPosition={chevronPosition}
          data-testid={testId}
          className={styles.fullWidth}
        >
          {content}
        </Accordion>
      );
    }

    return (
      <Accordion
        type="single"
        value={singleValue}
        onValueChange={(val) => setSingleValue(val || '')}
        collapsible={collapsible}
        variant={variant}
        size={size}
        chevronPosition={chevronPosition}
        data-testid={testId}
        className={styles.fullWidth}
      >
        {content}
      </Accordion>
    );
  };

  return (
    <GalleryStudioLayout
      activeRoute="accordion"
      title={t('common.studio.accordionTitle')}
      subtitle={t('common.studio.accordionSubtitle')}
      testId="accordion-studio"
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <div className={styles.controlsPanel}>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={dirOptions}
            onChange={setSpecimenDir}
          />

          <StudioSegmentedControl
            label={t('common.studio.accordionViewLabel')}
            value={stageView}
            options={viewOptions}
            onChange={setStageView}
          />

          {stageView === 'single' && (
            <StudioSegmentedControl
              label={t('common.studio.accordionScenarioLabel')}
              value={scenario}
              options={scenarioOptions}
              onChange={handleScenarioChange}
            />
          )}

          <StudioSegmentedControl
            label={t('common.studio.accordionVariantLabel')}
            value={variant}
            options={variantOptions}
            onChange={setVariant}
          />

          <StudioSegmentedControl
            label={t('common.studio.accordionSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <StudioSegmentedControl
            label={t('common.studio.accordionTypeLabel')}
            value={expansionType}
            options={expansionOptions}
            onChange={setExpansionType}
          />

          {expansionType === 'single' && stageView === 'single' && (
            <StudioToggleRow
              label={t('common.studio.accordionCollapsibleLabel')}
              checked={collapsible}
              onCheckedChange={setCollapsible}
              testId="toggle-collapsible"
            />
          )}

          <StudioSegmentedControl
            label={t('common.studio.accordionChevronLabel')}
            value={chevronPosition}
            options={chevronOptions}
            onChange={setChevronPosition}
          />
        </div>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="faq-accordion.tsx"
          cssFileName="faq-accordion.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={cn(styles.canvasArea, specimenDir === 'rtl' && styles.canvasRtl)}
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        {stageView === 'single' ? (
          <div className={styles.specimenCard}>
            <div className={styles.specimenStage}>
              {scenario === 'faq' &&
                renderAccordion(
                  <>
                    <AccordionItem value="item-1">
                      <AccordionHeader>
                        <AccordionTrigger>
                          {specimenT('common.studio.accordionFaqQ1')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <p className={styles.sampleProse}>
                          {specimenT('common.studio.accordionFaqA1')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionHeader>
                        <AccordionTrigger>
                          {specimenT('common.studio.accordionFaqQ2')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <p className={styles.sampleProse}>
                          {specimenT('common.studio.accordionFaqA2')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-3">
                      <AccordionHeader>
                        <AccordionTrigger>
                          {specimenT('common.studio.accordionFaqQ3')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <p className={styles.sampleProse}>
                          {specimenT('common.studio.accordionFaqA3')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-4">
                      <AccordionHeader>
                        <AccordionTrigger>
                          {specimenT('common.studio.accordionFaqQ4')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <p className={styles.sampleProse}>
                          {specimenT('common.studio.accordionFaqA4')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </>,
                  'studio-accordion',
                )}

              {scenario === 'settings' &&
                renderAccordion(
                  <>
                    <AccordionItem value="sso">
                      <AccordionHeader>
                        <AccordionTrigger startIcon={<Icon name="feature" />}>
                          {specimenT('common.studio.accordionSettingsSsoTitle')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className={styles.settingBox}>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionSettingsSsoDesc')}
                          </p>
                          <div className={styles.actionRow}>
                            <Button variant="primary" size="sm">
                              {specimenT('common.studio.accordionSettingsSsoPrimary')}
                            </Button>
                            <Button variant="secondary" size="sm">
                              {specimenT('common.studio.accordionSettingsSsoSecondary')}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="api">
                      <AccordionHeader>
                        <AccordionTrigger startIcon={<Icon name="sliders" />}>
                          {specimenT('common.studio.accordionSettingsApiTitle')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className={styles.settingBox}>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionSettingsApiQuotaLabel')}:{' '}
                            <BidiText dir="ltr">10,000 req/min</BidiText>
                          </p>
                          <div className={styles.actionRow}>
                            <Button variant="secondary" size="sm">
                              {specimenT('common.studio.accordionSettingsApiAction')}
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="audit">
                      <AccordionHeader>
                        <AccordionTrigger startIcon={<Icon name="bookmark" />}>
                          {specimenT('common.studio.accordionSettingsAuditTitle')}
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className={styles.settingBox}>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionSettingsAuditDesc')}
                          </p>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionSettingsAuditPeriodLabel')}:{' '}
                            <BidiText dir="ltr">365</BidiText>
                          </p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </>,
                  'studio-accordion',
                )}

              {scenario === 'invoice' &&
                renderAccordion(
                  <>
                    <AccordionItem value="items">
                      <AccordionHeader>
                        <AccordionTrigger>
                          <span className={styles.triggerTitleGroup}>
                            <span>{specimenT('common.studio.accordionInvoiceItemsTitle')}</span>
                            <Badge variant="primary" size="sm">
                              <BidiText dir="ltr">4</BidiText>{' '}
                              {specimenT('common.studio.accordionInvoiceItemsCountUnit')}
                            </Badge>
                          </span>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className={styles.invoiceTable}>
                          <div className={styles.invoiceRow}>
                            <span>{specimenT('common.studio.accordionInvoiceRowCore')}</span>
                            <span className={styles.invoiceVal}>
                              <BidiText dir="ltr">$24,000.00</BidiText>
                            </span>
                          </div>
                          <div className={styles.invoiceRow}>
                            <span>
                              {specimenT('common.studio.accordionInvoiceRowSeats')} (
                              <BidiText dir="ltr">50x</BidiText>)
                            </span>
                            <span className={styles.invoiceVal}>
                              <BidiText dir="ltr">$6,000.00</BidiText>
                            </span>
                          </div>
                          <div className={styles.invoiceRow}>
                            <span>{specimenT('common.studio.accordionInvoiceRowSla')}</span>
                            <span className={styles.invoiceVal}>
                              <BidiText dir="ltr">$3,600.00</BidiText>
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="tax">
                      <AccordionHeader>
                        <AccordionTrigger>
                          <span className={styles.triggerTitleGroup}>
                            <span>{specimenT('common.studio.accordionInvoiceTaxTitle')}</span>
                            <Badge variant="default" size="sm">
                              {specimenT('common.studio.accordionInvoiceTaxBadge')}{' '}
                              <BidiText dir="ltr">10%</BidiText>
                            </Badge>
                          </span>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <div className={styles.invoiceTable}>
                          <div className={styles.invoiceRow}>
                            <span>{specimenT('common.studio.accordionInvoiceRowVat')}</span>
                            <span className={styles.invoiceVal}>
                              <BidiText dir="ltr">$3,360.00</BidiText>
                            </span>
                          </div>
                          <div className={styles.invoiceRow}>
                            <span>{specimenT('common.studio.accordionInvoiceRowDigital')}</span>
                            <span className={styles.invoiceVal}>
                              <BidiText dir="ltr">$0.00</BidiText>
                            </span>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="shipping">
                      <AccordionHeader>
                        <AccordionTrigger>
                          <span className={styles.triggerTitleGroup}>
                            <span>{specimenT('common.studio.accordionInvoiceBillingTitle')}</span>
                            <Badge variant="success" size="sm">
                              {specimenT('common.studio.accordionInvoiceBillingBadge')}
                            </Badge>
                          </span>
                        </AccordionTrigger>
                      </AccordionHeader>
                      <AccordionContent>
                        <p className={styles.sampleProse}>
                          {specimenT('common.studio.accordionInvoiceBillingDesc')}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  </>,
                  'studio-accordion',
                )}
            </div>
          </div>
        ) : (
          <div className={styles.matrixContainer} data-testid="accordion-matrix-grid">
            <section className={styles.matrixGroup} aria-labelledby={variantsHeadingId}>
              <h3 id={variantsHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.accordionMatrixVariantsTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                {(['default', 'enclosed', 'flush'] as const).map((varItem) => (
                  <div key={varItem} className={styles.matrixCard}>
                    <p className={styles.matrixCardLabel}>
                      <BidiText dir="ltr">{`variant="${varItem}"`}</BidiText>
                    </p>
                    <Accordion
                      type="single"
                      collapsible
                      defaultValue="v1"
                      variant={varItem}
                      size="sm"
                      chevronPosition={chevronPosition}
                    >
                      <AccordionItem value="v1">
                        <AccordionHeader as="h4">
                          <AccordionTrigger>
                            {specimenT('common.studio.accordionFaqQ1')}
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionFaqA1')}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="v2">
                        <AccordionHeader as="h4">
                          <AccordionTrigger>
                            {specimenT('common.studio.accordionFaqQ2')}
                          </AccordionTrigger>
                        </AccordionHeader>
                        <AccordionContent>
                          <p className={styles.sampleProse}>
                            {specimenT('common.studio.accordionFaqA2')}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.matrixGroup} aria-labelledby={sizesHeadingId}>
              <h3 id={sizesHeadingId} className={styles.matrixGroupTitle}>
                {specimenT('common.studio.accordionMatrixSizesTitle')}
              </h3>
              <div className={styles.matrixGrid}>
                {(['sm', 'md', 'lg'] as const satisfies readonly AccordionSize[]).map(
                  (sizeItem) => (
                    <div key={sizeItem} className={styles.matrixCard}>
                      <p className={styles.matrixCardLabel}>
                        <BidiText dir="ltr">{`size="${sizeItem}"`}</BidiText>
                      </p>
                      <Accordion
                        type="single"
                        collapsible
                        defaultValue="s1"
                        variant={variant}
                        size={sizeItem}
                        chevronPosition={chevronPosition}
                      >
                        <AccordionItem value="s1">
                          <AccordionHeader as="h4">
                            <AccordionTrigger>
                              {specimenT('common.studio.accordionFaqQ3')}
                            </AccordionTrigger>
                          </AccordionHeader>
                          <AccordionContent>
                            <p className={styles.sampleProse}>
                              {specimenT('common.studio.accordionFaqA3')}
                            </p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ),
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </GalleryStudioLayout>
  );
}

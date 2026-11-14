'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Step,
  StepDescription,
  StepIndicator,
  StepLabelGroup,
  StepSeparator,
  StepTitle,
  Stepper,
  type StepperOrientation,
  type StepperSize,
} from '@/components/ui';
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
import styles from './stepper-gallery.module.css';

export type StepContentMode = 'full' | 'title' | 'indicator';

export interface StepperGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const STEP_DATA = [
  { title: 'Account', description: 'Organization info' },
  { title: 'Profile', description: 'Team permissions' },
  { title: 'Billing', description: 'Tier & quotas' },
  { title: 'Review', description: 'Confirm & launch' },
];

export function StepperGallery({ linkComponent }: StepperGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [activeStep, setActiveStep] = useState<number>(1);
  const [orientation, setOrientation] = useState<StepperOrientation>('horizontal');
  const [size, setSize] = useState<StepperSize>('md');
  const [contentMode, setContentMode] = useState<StepContentMode>('full');
  const [clickable, setClickable] = useState<boolean>(true);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setActiveStep(1);
    setOrientation('horizontal');
    setSize('md');
    setContentMode('full');
    setClickable(true);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const orientationOptions: StudioSegmentedOption<StepperOrientation>[] = [
    { value: 'horizontal', label: t('common.studio.stepperHorizontal') },
    { value: 'vertical', label: t('common.studio.stepperVertical') },
  ];

  const sizeOptions: StudioSegmentedOption<StepperSize>[] = [
    { value: 'sm', label: 'SM (28px)' },
    { value: 'md', label: 'MD (36px)' },
    { value: 'lg', label: 'LG (44px)' },
  ];

  const contentOptions: StudioSegmentedOption<StepContentMode>[] = [
    { value: 'full', label: 'Full' },
    { value: 'title', label: 'Title Only' },
    { value: 'indicator', label: 'Indicator' },
  ];

  const stepOptions: StudioSegmentedOption<string>[] = [
    { value: '0', label: 'Step 1' },
    { value: '1', label: 'Step 2' },
    { value: '2', label: 'Step 3' },
    { value: '3', label: 'Step 4' },
  ];

  const jsxSnippet = useMemo(() => {
    const stepsCode = STEP_DATA.map((step, idx) => {
      const hasSeparator = idx < STEP_DATA.length - 1;
      const separatorLine = hasSeparator ? '\n    <StepSeparator />' : '';

      if (contentMode === 'indicator') {
        return `  <Step stepIndex={${idx}} aria-label="Step ${idx + 1}: ${step.title}">
    <StepIndicator />${separatorLine}
  </Step>`;
      }

      if (contentMode === 'title') {
        return `  <Step stepIndex={${idx}}>
    <StepIndicator />
    <StepTitle>${step.title}</StepTitle>${separatorLine}
  </Step>`;
      }

      return `  <Step stepIndex={${idx}}>
    <StepIndicator />
    <StepLabelGroup>
      <StepTitle>${step.title}</StepTitle>
      <StepDescription>${step.description}</StepDescription>
    </StepLabelGroup>${separatorLine}
  </Step>`;
    }).join('\n');

    return `<Stepper activeStep={${activeStep}} orientation="${orientation}" size="${size}"${clickable ? ' clickable onStepClick={setActiveStep}' : ''}>
${stepsCode}
</Stepper>`;
  }, [activeStep, orientation, size, contentMode, clickable]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible step wizard indicator using White-Label UI Kit:
- Orientation: ${orientation} (horizontal, vertical)
- Size: ${size} (sm: 28px, md: 36px, lg: 44px)
- Content Display: ${contentMode} (full, title, indicator)
- Active Step Index: ${activeStep} of 4
- Clickable Navigation: ${clickable ? 'true' : 'false'}
- Compound components: Stepper, Step, StepIndicator${contentMode !== 'indicator' ? ', StepTitle' : ''}${contentMode === 'full' ? ', StepLabelGroup, StepDescription' : ''}, StepSeparator`;
  }, [activeStep, orientation, size, contentMode, clickable]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Active Step', value: `${activeStep + 1} of 4` },
          { label: 'Orientation', value: orientation },
          { label: 'Size', value: size },
          {
            label: 'Content Mode',
            value:
              contentMode === 'full'
                ? 'Full (Title + Description)'
                : contentMode === 'title'
                  ? 'Title Only'
                  : 'Indicator Only',
          },
          { label: 'Clickable', value: clickable ? 'true' : 'false' },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'List Container', value: '<ol role="list" aria-label="Progress">' },
          { label: 'Active Item', value: 'aria-current="step"' },
          { label: 'Decorative Elements', value: 'aria-hidden="true"' },
        ],
      },
    ];
  }, [activeStep, orientation, size, contentMode, clickable]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.stepperOrientation')}
        value={orientation}
        options={orientationOptions}
        onChange={setOrientation}
      />

      <StudioSegmentedControl
        label={t('common.studio.stepperSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioSegmentedControl
        label={t('common.studio.stepperContentDisplay')}
        value={contentMode}
        options={contentOptions}
        onChange={setContentMode}
      />

      <StudioSegmentedControl
        label={t('common.studio.stepperActiveStep')}
        value={String(activeStep)}
        options={stepOptions}
        onChange={(val) => setActiveStep(Number(val))}
      />

      <StudioToggleRow
        label={t('common.studio.stepperClickable')}
        checked={clickable}
        onCheckedChange={setClickable}
        testId="toggle-stepper-clickable"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="stepper"
      title={t('common.studio.stepperTitle')}
      subtitle={t('common.studio.stepperSubtitle')}
      testId="gallery-stepper"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="stepper.module.css"
          jsxFileName="stepper.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir}>
        <div className={styles.specimenBox}>
          <Stepper
            activeStep={activeStep}
            orientation={orientation}
            size={size}
            clickable={clickable}
            onStepClick={setActiveStep}
            data-testid="interactive-stepper"
          >
            {STEP_DATA.map((step, idx) => (
              <Step
                key={step.title}
                stepIndex={idx}
                aria-label={
                  contentMode === 'indicator' ? `Step ${idx + 1}: ${step.title}` : undefined
                }
              >
                <StepIndicator />
                {contentMode === 'full' && (
                  <StepLabelGroup>
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </StepLabelGroup>
                )}
                {contentMode === 'title' && <StepTitle>{step.title}</StepTitle>}
                {idx < STEP_DATA.length - 1 && <StepSeparator />}
              </Step>
            ))}
          </Stepper>

          <div className={styles.stepActions}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setActiveStep((prev) => Math.max(0, prev - 1))}
              disabled={activeStep === 0}
            >
              Previous Step
            </Button>
            <span className={styles.stepCounter}>Step {activeStep + 1} of 4</span>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setActiveStep((prev) => Math.min(3, prev + 1))}
              disabled={activeStep === 3}
            >
              Next Step
            </Button>
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

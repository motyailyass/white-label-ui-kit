'use client';

import { useCallback, useMemo, useState } from 'react';
import { Slider, type SliderSize } from '@/components/ui';
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
import styles from './slider-gallery.module.css';

export interface SliderGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function SliderGallery({ linkComponent }: SliderGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [value, setValue] = useState<number>(65);
  const [size, setSize] = useState<SliderSize>('md');
  const [step, setStep] = useState<number>(1);
  const [disabled, setDisabled] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setValue(65);
    setSize('md');
    setStep(1);
    setDisabled(false);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const sizeOptions: StudioSegmentedOption<SliderSize>[] = [
    { value: 'sm', label: 'SM (4px track)' },
    { value: 'md', label: 'MD (6px track)' },
    { value: 'lg', label: 'LG (8px track)' },
  ];

  const stepOptions: StudioSegmentedOption<string>[] = [
    { value: '1', label: 'Continuous (1)' },
    { value: '5', label: 'Step 5' },
    { value: '10', label: 'Step 10' },
    { value: '25', label: 'Quarter (25)' },
  ];

  const jsxSnippet = useMemo(() => {
    return `<Slider
  value={${value}}
  onChange={setValue}
  min={0}
  max={100}
  step={${step}}
  size="${size}"${disabled ? '\n  disabled' : ''}
  aria-label={t('slider.label')}
/>`;
  }, [value, step, size, disabled]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible range slider with White-Label UI Kit:
- Size: ${size} (sm, md, lg)
- Boundaries: min=0, max=100, step=${step}
- WAI-ARIA role="slider" with aria-valuenow, valuemin, valuemax
- Smooth pointer capture for drag interactions
- 100% CSS logical properties, shadow-free in dashboard, dark mode compliant`;
  }, [size, step]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component State & Props',
        items: [
          { label: 'Current Value', value: String(value) },
          { label: 'Track Size', value: size },
          { label: 'Stepping', value: String(step) },
          { label: 'Disabled', value: String(disabled) },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Role', value: 'role="slider"' },
          { label: 'Orientation', value: 'aria-orientation="horizontal"' },
          { label: 'Keyboard Stepping', value: 'Arrows / PageUp / Home / End' },
        ],
      },
    ];
  }, [value, size, step, disabled, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.sliderSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioSegmentedControl
        label={t('common.studio.sliderStep')}
        value={String(step)}
        options={stepOptions}
        onChange={(val) => setStep(Number(val))}
      />

      <StudioToggleRow
        label={t('common.studio.sliderDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-slider-disabled"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="slider"
      title={t('common.studio.sliderTitle')}
      subtitle={t('common.studio.sliderSubtitle')}
      testId="gallery-slider"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="slider.module.css"
          jsxFileName="slider.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir}>
        <div className={styles.sliderContainer}>
          <Slider
            value={value}
            onChange={setValue}
            min={0}
            max={100}
            step={step}
            size={size}
            disabled={disabled}
            aria-label={t('common.studio.sliderAriaLabel')}
            data-testid="live-slider"
          />
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

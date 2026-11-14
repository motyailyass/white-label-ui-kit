'use client';

import { useCallback, useMemo, useState } from 'react';
import { InputOtp, type InputOtpSize, type InputOtpVariant } from '@/components/ui';
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
import styles from './input-otp-gallery.module.css';

export interface InputOtpGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function InputOtpGallery({ linkComponent }: InputOtpGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [length, setLength] = useState<number>(6);
  const [size, setSize] = useState<InputOtpSize>('md');
  const [variant, setVariant] = useState<InputOtpVariant>('separated');
  const [value, setValue] = useState<string>('42');
  const [mask, setMask] = useState<boolean>(false);
  const [hasSeparator, setHasSeparator] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setLength(6);
    setSize('md');
    setVariant('separated');
    setValue('42');
    setMask(false);
    setHasSeparator(true);
    setIsError(false);
    setIsComplete(false);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = useMemo(
    () => [
      {
        value: 'ltr',
        label: t('common.studio.specimenDirLtr'),
        testId: 'input-otp-dir-ltr',
      },
      {
        value: 'rtl',
        label: t('common.studio.specimenDirRtl'),
        testId: 'input-otp-dir-rtl',
      },
    ],
    [t],
  );

  const lengthOptions: StudioSegmentedOption<string>[] = useMemo(
    () => [
      {
        value: '4',
        label: t('common.studio.inputOtpLength4'),
        testId: 'input-otp-length-4',
      },
      {
        value: '6',
        label: t('common.studio.inputOtpLength6'),
        testId: 'input-otp-length-6',
      },
    ],
    [t],
  );

  const sizeOptions: StudioSegmentedOption<InputOtpSize>[] = useMemo(
    () => [
      {
        value: 'sm',
        label: t('common.studio.inputOtpSizeSm'),
        testId: 'input-otp-size-sm',
      },
      {
        value: 'md',
        label: t('common.studio.inputOtpSizeMd'),
        testId: 'input-otp-size-md',
      },
      {
        value: 'lg',
        label: t('common.studio.inputOtpSizeLg'),
        testId: 'input-otp-size-lg',
      },
    ],
    [t],
  );

  const variantOptions: StudioSegmentedOption<InputOtpVariant>[] = useMemo(
    () => [
      {
        value: 'separated',
        label: t('common.studio.inputOtpVariantSeparated'),
        testId: 'input-otp-variant-separated',
      },
      {
        value: 'grouped',
        label: t('common.studio.inputOtpVariantGrouped'),
        testId: 'input-otp-variant-grouped',
      },
    ],
    [t],
  );

  const separatorIndex = hasSeparator && length === 6 ? 3 : undefined;

  const jsxSnippet = useMemo(() => {
    return `<InputOtp
  length={${length}}
  value={otp}
  onChange={setOtp}
  onComplete={(code) => console.log('Verified:', code)}
  size="${size}"${variant === 'grouped' ? '\n  variant="grouped"' : ''}${mask ? '\n  mask' : ''}${
    separatorIndex !== undefined ? `\n  separatorIndex={${separatorIndex}}` : ''
  }${isError ? '\n  error' : ''}
/>`;
  }, [length, size, variant, mask, separatorIndex, isError]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible one-time passcode PIN input using White-Label UI Kit:
- Length: ${length} slots
- Layout Style: ${variant}
- Density Size: ${size} (sm, md, lg)
- Features: smart focus enforcement, auto-advance, auto-retreat on backspace, clipboard paste
- Masking: ${mask ? 'Enabled (•)' : 'Disabled'}
- Split Separator: ${separatorIndex !== undefined ? 'Active (3-3)' : 'None'}
- Error State: ${isError ? 'Error active' : 'None'}
- 100% CSS logical properties, shadow-free in dashboard, dark mode compliant`;
  }, [length, variant, size, mask, separatorIndex, isError]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.inputOtpSpecConfigTitle'),
        items: [
          {
            label: t('common.studio.inputOtpSpecLength'),
            value: `${length} slots`,
          },
          { label: t('common.studio.inputOtpVariant'), value: variant },
          { label: t('common.studio.inputOtpSpecSize'), value: size },
          {
            label: t('common.studio.inputOtpSpecCurrentValue'),
            value: value || '(empty)',
          },
          {
            label: t('common.studio.inputOtpSpecCompleted'),
            value: isComplete ? 'Yes' : 'No',
          },
          {
            label: t('common.studio.inputOtpSpecMasked'),
            value: mask ? 'Yes' : 'No',
          },
          {
            label: t('common.studio.inputOtpSpecDirection'),
            value: specimenDir.toUpperCase(),
          },
        ],
      },
      {
        title: t('common.studio.inputOtpSpecAriaTitle'),
        items: [
          {
            label: t('common.studio.inputOtpSpecContainerRole'),
            value: 'role="group"',
          },
          {
            label: t('common.studio.inputOtpSpecInputMode'),
            value: 'inputmode="numeric"',
          },
          {
            label: t('common.studio.inputOtpSpecAutoComplete'),
            value: 'autocomplete="one-time-code"',
          },
        ],
      },
    ];
  }, [t, length, variant, size, value, isComplete, mask, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.inputOtpVariant')}
        value={variant}
        options={variantOptions}
        onChange={setVariant}
      />

      <StudioSegmentedControl
        label={t('common.studio.inputOtpLength')}
        value={String(length)}
        options={lengthOptions}
        onChange={(val) => {
          const l = Number(val);
          setLength(l);
          setValue((prev) => prev.slice(0, l));
          setIsComplete(false);
        }}
      />

      <StudioSegmentedControl
        label={t('common.studio.inputOtpSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioToggleRow
        label={t('common.studio.inputOtpMask')}
        checked={mask}
        onCheckedChange={setMask}
        testId="toggle-input-otp-mask"
      />

      <StudioToggleRow
        label={t('common.studio.inputOtpSeparator')}
        checked={hasSeparator}
        onCheckedChange={setHasSeparator}
        testId="toggle-input-otp-separator"
      />

      <StudioToggleRow
        label={t('common.studio.inputOtpError')}
        checked={isError}
        onCheckedChange={setIsError}
        testId="toggle-input-otp-error"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="input-otp"
      title={t('common.studio.inputOtpTitle')}
      subtitle={t('common.studio.inputOtpSubtitle')}
      testId="gallery-input-otp"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="input-otp.module.css"
          jsxFileName="input-otp.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir}>
        <InputOtp
          length={length}
          size={size}
          variant={variant}
          value={value}
          mask={mask}
          error={isError}
          separatorIndex={separatorIndex}
          onChange={(val) => {
            setValue(val);
            setIsComplete(val.length === length);
          }}
          onComplete={() => setIsComplete(true)}
          aria-label={t('common.studio.inputOtpAriaLabel')}
          slotAriaLabel={(index, total) =>
            t('common.studio.inputOtpSlotAriaLabel', { index, total })
          }
          data-testid="live-input-otp"
        />
      </div>
    </GalleryStudioLayout>
  );
}

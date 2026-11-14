'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  type ControlSize,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  type ToggleVariant,
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
import styles from './toggle-gallery.module.css';

export interface ToggleGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function ToggleGallery({ linkComponent }: ToggleGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [mode, setMode] = useState<'group' | 'single'>('group');
  const [size, setSize] = useState<ControlSize>('md');
  const [variant, setVariant] = useState<ToggleVariant>('outline');
  const [groupType, setGroupType] = useState<'single' | 'multiple'>('single');
  const [singleValue, setSingleValue] = useState<string>('center');
  const [multipleValue, setMultipleValue] = useState<string[]>(['bold']);
  const [isJoined, setIsJoined] = useState<boolean>(true);
  const [singlePressed, setSinglePressed] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setMode('group');
    setSize('md');
    setVariant('outline');
    setGroupType('single');
    setSingleValue('center');
    setMultipleValue(['bold']);
    setIsJoined(true);
    setSinglePressed(false);
    setDisabled(false);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const modeOptions: StudioSegmentedOption<'group' | 'single'>[] = [
    { value: 'group', label: 'Toggle Group' },
    { value: 'single', label: 'Single Toggle' },
  ];

  const sizeOptions: StudioSegmentedOption<ControlSize>[] = [
    { value: 'xs', label: 'XS (28px)' },
    { value: 'sm', label: 'SM (32px)' },
    { value: 'md', label: 'MD (36px)' },
    { value: 'lg', label: 'LG (40px)' },
    { value: 'xl', label: 'XL (48px)' },
    { value: '2xl', label: '2XL (56px)' },
  ];

  const variantOptions: StudioSegmentedOption<ToggleVariant>[] = [
    { value: 'default', label: 'Default' },
    { value: 'outline', label: 'Outline' },
    { value: 'subtle', label: 'Subtle' },
  ];

  const groupTypeOptions: StudioSegmentedOption<'single' | 'multiple'>[] = [
    { value: 'single', label: 'Single Select' },
    { value: 'multiple', label: 'Multi Select' },
  ];

  const jsxSnippet = useMemo(() => {
    if (mode === 'single') {
      return `<Toggle
  pressed={${singlePressed}}
  onPressedChange={setPressed}
  size="${size}"
  variant="${variant}"${disabled ? '\n  disabled' : ''}
>
  <Icon name="bookmark" />
  <span>${singlePressed ? 'Bookmarked' : 'Bookmark'}</span>
</Toggle>`;
    }

    if (groupType === 'single') {
      return `<ToggleGroup type="single" value="${singleValue}" size="${size}" variant="${variant}"${
        isJoined ? '' : ' joined={false}'
      }${disabled ? ' disabled' : ''}>
  <ToggleGroupItem value="left">Left</ToggleGroupItem>
  <ToggleGroupItem value="center">Center</ToggleGroupItem>
  <ToggleGroupItem value="right">Right</ToggleGroupItem>
</ToggleGroup>`;
    }
    return `<ToggleGroup type="multiple" value={${JSON.stringify(multipleValue)}} size="${size}" variant="${variant}"${
      isJoined ? '' : ' joined={false}'
    }${disabled ? ' disabled' : ''}>
  <ToggleGroupItem value="bold">B</ToggleGroupItem>
  <ToggleGroupItem value="italic">I</ToggleGroupItem>
  <ToggleGroupItem value="underline">U</ToggleGroupItem>
</ToggleGroup>`;
  }, [
    mode,
    singlePressed,
    size,
    variant,
    disabled,
    groupType,
    singleValue,
    isJoined,
    multipleValue,
  ]);

  const aiPrompt = useMemo(() => {
    if (mode === 'single') {
      return `Create an accessible standalone toggle using White-Label UI Kit:
- Size: ${size} (xs, sm, md, lg, xl, 2xl)
- Variant: ${variant} (default, outline, subtle)
- WAI-ARIA aria-pressed semantics with native button
- 100% CSS logical properties, shadow-free in dashboard, dark mode compliant`;
    }
    return `Create an accessible toggle group using White-Label UI Kit:
- Selection Type: ${groupType} (single or multiple)
- Size: ${size} (xs, sm, md, lg, xl, 2xl)
- Variant: ${variant} (default, outline, subtle)
- Joined Border: ${isJoined ? 'true' : 'false'}
- WAI-ARIA aria-pressed semantics with role="group"
- 100% CSS logical properties, shadow-free in dashboard, dark mode compliant`;
  }, [mode, size, variant, groupType, isJoined]);

  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    if (mode === 'single') {
      return [
        {
          title: 'Component State & Props',
          items: [
            { label: 'Control Size', value: size },
            { label: 'Variant', value: variant },
            { label: 'Pressed', value: String(singlePressed) },
            { label: 'Disabled', value: String(disabled) },
            { label: 'Direction', value: specimenDir.toUpperCase() },
          ],
        },
        {
          title: 'Accessibility & WAI-ARIA',
          items: [
            { label: 'Element', value: '<button type="button">' },
            { label: 'Item Semantics', value: `aria-pressed="${singlePressed}"` },
            { label: 'Data State', value: `data-state="${singlePressed ? 'on' : 'off'}"` },
          ],
        },
      ];
    }
    return [
      {
        title: 'Component State & Props',
        items: [
          { label: 'Control Size', value: size },
          { label: 'Variant', value: variant },
          { label: 'Selection Model', value: groupType },
          {
            label: 'Selected State',
            value:
              groupType === 'single'
                ? singleValue || '(none)'
                : multipleValue.join(', ') || '(none)',
          },
          { label: 'Disabled', value: String(disabled) },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Container Role', value: 'role="group"' },
          { label: 'Item Semantics', value: 'aria-pressed="true | false"' },
          { label: 'Data State', value: 'data-state="on | off"' },
        ],
      },
    ];
  }, [
    mode,
    size,
    variant,
    singlePressed,
    disabled,
    specimenDir,
    groupType,
    singleValue,
    multipleValue,
  ]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.toggleMode')}
        value={mode}
        options={modeOptions}
        onChange={setMode}
      />

      <StudioSegmentedControl
        label={t('common.studio.toggleSize')}
        value={size}
        options={sizeOptions}
        onChange={setSize}
      />

      <StudioSegmentedControl
        label={t('common.studio.toggleVariant')}
        value={variant}
        options={variantOptions}
        onChange={setVariant}
      />

      {mode === 'group' ? (
        <>
          <StudioSegmentedControl
            label={t('common.studio.toggleGroupType')}
            value={groupType}
            options={groupTypeOptions}
            onChange={setGroupType}
          />

          <StudioToggleRow
            label={t('common.studio.toggleGroupJoined')}
            checked={isJoined}
            onCheckedChange={setIsJoined}
            testId="toggle-group-joined"
          />
        </>
      ) : null}

      <StudioToggleRow
        label={t('common.studio.toggleDisabled')}
        checked={disabled}
        onCheckedChange={setDisabled}
        testId="toggle-disabled"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="toggle"
      title={t('common.studio.toggleTitle')}
      subtitle={t('common.studio.toggleSubtitle')}
      testId="gallery-toggle"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName={mode === 'single' ? 'toggle.module.css' : 'toggle-group.module.css'}
          jsxFileName={mode === 'single' ? 'toggle.tsx' : 'toggle-group.tsx'}
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir}>
        <div className={styles.specimenContainer}>
          {mode === 'single' ? (
            <Toggle
              pressed={singlePressed}
              onPressedChange={setSinglePressed}
              variant={variant}
              size={size}
              disabled={disabled}
              data-testid="live-toggle"
            >
              <Icon name="bookmark" />
              <span>{singlePressed ? 'Bookmarked' : 'Bookmark'}</span>
            </Toggle>
          ) : groupType === 'single' ? (
            <ToggleGroup
              type="single"
              value={singleValue}
              onValueChange={setSingleValue}
              size={size}
              variant={variant}
              joined={isJoined}
              disabled={disabled}
              data-testid="live-toggle-group"
            >
              <ToggleGroupItem value="left">Left</ToggleGroupItem>
              <ToggleGroupItem value="center">Center</ToggleGroupItem>
              <ToggleGroupItem value="right">Right</ToggleGroupItem>
              <ToggleGroupItem value="justify">Justify</ToggleGroupItem>
            </ToggleGroup>
          ) : (
            <ToggleGroup
              type="multiple"
              value={multipleValue}
              onValueChange={setMultipleValue}
              size={size}
              variant={variant}
              joined={isJoined}
              disabled={disabled}
              data-testid="live-toggle-group"
            >
              <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
              <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
              <ToggleGroupItem value="underline">Underline</ToggleGroupItem>
              <ToggleGroupItem value="strikethrough">Strikethrough</ToggleGroupItem>
            </ToggleGroup>
          )}
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

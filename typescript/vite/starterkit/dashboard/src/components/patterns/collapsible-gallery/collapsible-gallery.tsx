'use client';

import { useCallback, useMemo, useState } from 'react';
import { Icon } from '@/components/icons';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui';
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
import styles from './collapsible-gallery.module.css';

export interface CollapsibleGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function CollapsibleGallery({ linkComponent }: CollapsibleGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isDisabled, setIsDisabled] = useState<boolean>(false);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setIsOpen(true);
    setIsDisabled(false);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const stateOptions: StudioSegmentedOption<'open' | 'closed'>[] = [
    { value: 'open', label: t('common.studio.collapsibleOpen') },
    { value: 'closed', label: t('common.studio.collapsibleClosed') },
  ];

  const jsxSnippet = useMemo(() => {
    return `<Collapsible open={${isOpen}} onOpenChange={setIsOpen}${isDisabled ? ' disabled' : ''}>
  <CollapsibleTrigger className={styles.triggerButton}>
    <span>Disclosure Trigger</span>
    <Icon name="chevron-down" />
  </CollapsibleTrigger>
  <CollapsibleContent>
    <div className={styles.contentBox}>
      Collapsible content panel that expands and collapses smoothly.
    </div>
  </CollapsibleContent>
</Collapsible>`;
  }, [isOpen, isDisabled]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible collapsible disclosure panel using White-Label UI Kit:
- Open state: ${isOpen ? 'open' : 'closed'}
- Disabled: ${isDisabled ? 'true' : 'false'}
- Smooth CSS Grid 0fr -> 1fr animation
- Compound components: Collapsible, CollapsibleTrigger, CollapsibleContent`;
  }, [isOpen, isDisabled]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Current State', value: isOpen ? 'open' : 'closed' },
          { label: 'Disabled', value: isDisabled ? 'true' : 'false' },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Trigger Semantics', value: 'aria-expanded="true | false"' },
          { label: 'Controls Linkage', value: 'aria-controls <-> id' },
          { label: 'Content Semantics', value: 'role="region" aria-labelledby' },
        ],
      },
    ];
  }, [isOpen, isDisabled, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.collapsibleState')}
        value={isOpen ? 'open' : 'closed'}
        options={stateOptions}
        onChange={(val) => setIsOpen(val === 'open')}
      />

      <StudioToggleRow
        label={t('common.studio.collapsibleDisabled')}
        checked={isDisabled}
        onCheckedChange={setIsDisabled}
        testId="toggle-collapsible-disabled"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="collapsible"
      title={t('common.studio.collapsibleTitle')}
      subtitle={t('common.studio.collapsibleSubtitle')}
      testId="gallery-collapsible"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="collapsible.module.css"
          jsxFileName="collapsible.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir}>
        <div className={styles.specimenContainer}>
          <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            disabled={isDisabled}
            data-testid="interactive-collapsible"
          >
            <CollapsibleTrigger className={styles.triggerButton} data-testid="collapsible-trigger">
              <span className={styles.triggerLabel}>Disclosure Trigger</span>
              <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                <Icon name="chevron-down" size={16} />
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent data-testid="collapsible-content">
              <div className={styles.contentBox}>
                Collapsible content panel that expands and collapses smoothly.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

'use client';

import { useCallback, useMemo, useState } from 'react';
import {
  type PanelOrientation,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
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
import styles from './resizable-panel-gallery.module.css';

export type PanelLayoutPreset = '2-panel' | '3-panel';

export interface ResizablePanelGalleryProps {
  linkComponent?: StudioLinkComponent;
}

export function ResizablePanelGallery({ linkComponent }: ResizablePanelGalleryProps) {
  const { t } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [orientation, setOrientation] = useState<PanelOrientation>('horizontal');
  const [layoutPreset, setLayoutPreset] = useState<PanelLayoutPreset>('2-panel');
  const [withHandle, setWithHandle] = useState<boolean>(true);
  const [currentSizes, setCurrentSizes] = useState<number[]>([35, 65]);
  const [resetCount, setResetCount] = useState<number>(0);

  const isRtl = specimenDir === 'rtl';

  const handleLayoutPresetChange = useCallback((preset: PanelLayoutPreset) => {
    setLayoutPreset(preset);
    if (preset === '2-panel') {
      setCurrentSizes([35, 65]);
    } else {
      setCurrentSizes([25, 50, 25]);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setOrientation('horizontal');
    setLayoutPreset('2-panel');
    setWithHandle(true);
    setCurrentSizes([35, 65]);
    setResetCount((prev) => prev + 1);
  }, []);

  const dirOptions: StudioSegmentedOption<'ltr' | 'rtl'>[] = [
    { value: 'ltr', label: t('common.studio.specimenDirLtr') },
    { value: 'rtl', label: t('common.studio.specimenDirRtl') },
  ];

  const orientationOptions: StudioSegmentedOption<PanelOrientation>[] = [
    { value: 'horizontal', label: t('common.studio.resizableHorizontal') },
    { value: 'vertical', label: t('common.studio.resizableVertical') },
  ];

  const layoutOptions: StudioSegmentedOption<PanelLayoutPreset>[] = [
    { value: '2-panel', label: '2 Panels (Split)' },
    { value: '3-panel', label: '3 Panels (Workspace)' },
  ];

  const panelsData = useMemo(() => {
    if (isRtl) {
      return {
        panel0: { title: 'مستكشف التنقل', subtitle: 'اسحب المقبض أو استخدم الأسهم' },
        panel1: { title: 'محرر مساحة العمل', subtitle: 'مساحة مرنة متجاوبة' },
        panel2: { title: 'لوحة الفحص والخصائص', subtitle: 'معاينة شجرة الخصائص' },
        headerTitle: 'مساحة عمل تفاعلية مقسمة',
      };
    }
    return {
      panel0: { title: 'Navigation Explorer', subtitle: 'Drag handle or use arrow keys' },
      panel1: { title: 'Editor & Canvas', subtitle: 'Responsive flex track layout' },
      panel2: { title: 'Inspector & Properties', subtitle: 'Component node inspector' },
      headerTitle: 'Interactive Split Workspace',
    };
  }, [isRtl]);

  const sizesSummary = useMemo(() => {
    return currentSizes.map((s) => `${Math.round(s)}%`).join(' / ');
  }, [currentSizes]);

  const jsxSnippet = useMemo(() => {
    if (layoutPreset === '3-panel') {
      return `<ResizablePanelGroup orientation="${orientation}" onLayout={setSizes}>
  <ResizablePanel order={0} defaultSize={25} minSize={15} maxSize={40}>
    <div className={styles.sidebar}>Explorer (${Math.round(currentSizes[0] ?? 25)}%)</div>
  </ResizablePanel>
  <ResizableHandle handleIndex={0}${withHandle ? ' withHandle' : ''} />
  <ResizablePanel order={1} defaultSize={50} minSize={30} maxSize={70}>
    <div className={styles.main}>Editor (${Math.round(currentSizes[1] ?? 50)}%)</div>
  </ResizablePanel>
  <ResizableHandle handleIndex={1}${withHandle ? ' withHandle' : ''} />
  <ResizablePanel order={2} defaultSize={25} minSize={15} maxSize={40}>
    <div className={styles.inspector}>Inspector (${Math.round(currentSizes[2] ?? 25)}%)</div>
  </ResizablePanel>
</ResizablePanelGroup>`;
    }

    return `<ResizablePanelGroup orientation="${orientation}" onLayout={setSizes}>
  <ResizablePanel order={0} defaultSize={35} minSize={20} maxSize={60}>
    <div className={styles.sidebar}>Navigation Explorer (${Math.round(currentSizes[0] ?? 35)}%)</div>
  </ResizablePanel>
  <ResizableHandle handleIndex={0}${withHandle ? ' withHandle' : ''} />
  <ResizablePanel order={1} defaultSize={65}>
    <div className={styles.main}>Editor & Canvas (${Math.round(currentSizes[1] ?? 65)}%)</div>
  </ResizablePanel>
</ResizablePanelGroup>`;
  }, [orientation, layoutPreset, withHandle, currentSizes]);

  const aiPrompt = useMemo(() => {
    return `Create an accessible resizable split-pane layout using White-Label UI Kit:
- Orientation: ${orientation} (horizontal, vertical)
- Layout Preset: ${layoutPreset} (${layoutPreset === '2-panel' ? '2 Panels: 35%/65%' : '3 Panels: 25%/50%/25%'})
- Handle Visual Grip Notch: ${withHandle ? 'true' : 'false'}
- Keyboard accessible: Arrow keys step size by 2%, Home/End jump to bounds
- Direction: ${specimenDir.toUpperCase()}`;
  }, [orientation, layoutPreset, withHandle, specimenDir]);

  const specGroups: StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: 'Component Parameters',
        items: [
          { label: 'Orientation', value: orientation },
          { label: 'Panel Layout', value: layoutPreset === '2-panel' ? '2 Panels' : '3 Panels' },
          { label: 'Current Split', value: sizesSummary },
          { label: 'Direction', value: specimenDir.toUpperCase() },
        ],
      },
      {
        title: 'Accessibility & WAI-ARIA',
        items: [
          { label: 'Separator Role', value: 'role="separator"' },
          { label: 'Current Value', value: `aria-valuenow="${Math.round(currentSizes[0] ?? 35)}"` },
          { label: 'Keyboard Stepping', value: 'Arrow keys (2% step), Home/End' },
          { label: 'Pointer Tracking', value: 'Global window pointer events' },
        ],
      },
    ];
  }, [orientation, layoutPreset, sizesSummary, currentSizes, specimenDir]);

  const controls = (
    <>
      <StudioSegmentedControl
        label={t('common.studio.specimenDirectionLabel')}
        value={specimenDir}
        options={dirOptions}
        onChange={setSpecimenDir}
      />

      <StudioSegmentedControl
        label={t('common.studio.resizableOrientation')}
        value={orientation}
        options={orientationOptions}
        onChange={setOrientation}
      />

      <StudioSegmentedControl
        label={t('common.studio.resizablePanelLayout')}
        value={layoutPreset}
        options={layoutOptions}
        onChange={handleLayoutPresetChange}
      />

      <StudioToggleRow
        label={t('common.studio.resizableHandleNotch')}
        checked={withHandle}
        onCheckedChange={setWithHandle}
        testId="toggle-resizable-handle"
      />
    </>
  );

  return (
    <GalleryStudioLayout
      activeRoute="resizable-panel"
      title={t('common.studio.resizablePanelTitle')}
      subtitle={t('common.studio.resizablePanelSubtitle')}
      testId="gallery-resizable-panel"
      controls={controls}
      onReset={handleReset}
      previewDir={specimenDir}
      linkComponent={linkComponent}
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxSnippet}
          cssCode={null}
          cssFileName="resizable-panel.module.css"
          jsxFileName="resizable-panel.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.specimenCanvas} dir={specimenDir} lang={isRtl ? 'ar' : 'en'}>
        <div className={styles.specimenBox}>
          <div className={styles.viewportHeader}>
            <span className={styles.headerTitle}>{panelsData.headerTitle}</span>
            <span className={styles.headerMeta}>
              {orientation.toUpperCase()} • {sizesSummary}
            </span>
          </div>

          <div className={styles.panelContainer}>
            <ResizablePanelGroup
              key={`${layoutPreset}-${resetCount}`}
              orientation={orientation}
              onLayout={setCurrentSizes}
              data-testid="interactive-resizable-group"
            >
              <ResizablePanel
                order={0}
                defaultSize={layoutPreset === '2-panel' ? 35 : 25}
                minSize={layoutPreset === '2-panel' ? 20 : 15}
                maxSize={layoutPreset === '2-panel' ? 60 : 40}
              >
                <div className={styles.panelContent}>
                  <p className={styles.panelTitle}>{panelsData.panel0.title}</p>
                  <p className={styles.panelSubtitle}>{panelsData.panel0.subtitle}</p>
                </div>
              </ResizablePanel>

              <ResizableHandle
                handleIndex={0}
                withHandle={withHandle}
                data-testid="interactive-handle-0"
              />

              <ResizablePanel
                order={1}
                defaultSize={layoutPreset === '2-panel' ? 65 : 50}
                minSize={layoutPreset === '2-panel' ? 40 : 30}
                maxSize={layoutPreset === '2-panel' ? 80 : 70}
              >
                <div className={`${styles.panelContent} ${styles.panelContentAlt}`}>
                  <p className={styles.panelTitle}>{panelsData.panel1.title}</p>
                  <p className={styles.panelSubtitle}>{panelsData.panel1.subtitle}</p>
                </div>
              </ResizablePanel>

              {layoutPreset === '3-panel' && (
                <>
                  <ResizableHandle
                    handleIndex={1}
                    withHandle={withHandle}
                    data-testid="interactive-handle-1"
                  />
                  <ResizablePanel order={2} defaultSize={25} minSize={15} maxSize={40}>
                    <div className={styles.panelContent}>
                      <p className={styles.panelTitle}>{panelsData.panel2.title}</p>
                      <p className={styles.panelSubtitle}>{panelsData.panel2.subtitle}</p>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </div>
        </div>
      </div>
    </GalleryStudioLayout>
  );
}

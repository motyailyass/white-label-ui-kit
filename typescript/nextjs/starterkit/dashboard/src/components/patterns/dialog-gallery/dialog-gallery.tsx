'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  Combobox,
  type ComboboxOption,
  type ControlSize,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  type DialogSize,
  DialogTitle,
  Input,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useI18n, useTheme } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSegmentedOption,
  StudioSelectField,
  type StudioSelectOption,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './dialog-gallery.module.css';

export type DialogArchetype = 'standard' | 'confirmation' | 'form' | 'scrollable';
export type DialogSeparators = 'default' | 'none' | 'header-only' | 'footer-only';
export type DialogFooterLayout = 'end' | 'split' | 'center' | 'between' | 'stacked';

export interface DialogGalleryProps {
  linkComponent?: StudioLinkComponent;
}

interface DialogPresetDef {
  id: DialogArchetype;
  labelKey:
    | 'common.studio.dlgPresetStandard'
    | 'common.studio.dlgPresetConfirmation'
    | 'common.studio.dlgPresetForm'
    | 'common.studio.dlgPresetScrollable';
  defaultSize: DialogSize;
  defaultSeparators: DialogSeparators;
  defaultFooterLayout: DialogFooterLayout;
  defaultFooterBg: 'seamless' | 'docked';
}

const DIALOG_PRESETS: readonly DialogPresetDef[] = [
  {
    id: 'standard',
    labelKey: 'common.studio.dlgPresetStandard',
    defaultSize: 'md',
    defaultSeparators: 'default',
    defaultFooterLayout: 'end',
    defaultFooterBg: 'seamless',
  },
  {
    id: 'confirmation',
    labelKey: 'common.studio.dlgPresetConfirmation',
    defaultSize: 'sm',
    defaultSeparators: 'none',
    defaultFooterLayout: 'split',
    defaultFooterBg: 'seamless',
  },
  {
    id: 'form',
    labelKey: 'common.studio.dlgPresetForm',
    defaultSize: 'md',
    defaultSeparators: 'default',
    defaultFooterLayout: 'end',
    defaultFooterBg: 'seamless',
  },
  {
    id: 'scrollable',
    labelKey: 'common.studio.dlgPresetScrollable',
    defaultSize: 'lg',
    defaultSeparators: 'default',
    defaultFooterLayout: 'between',
    defaultFooterBg: 'docked',
  },
];

export function DialogGallery({ linkComponent }: DialogGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Variant Controls
  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [archetype, setArchetype] = useState<DialogArchetype>('confirmation');
  const [size, setSize] = useState<DialogSize>('sm');
  const [separators, setSeparators] = useState<DialogSeparators>('none');
  const [footerLayout, setFooterLayout] = useState<DialogFooterLayout>('split');
  const [footerBackground, setFooterBackground] = useState<'seamless' | 'docked'>('seamless');
  const [footerBtnSize, setFooterBtnSize] = useState<ControlSize | 'default'>('default');
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(false);
  const [preventEscapeClose, setPreventEscapeClose] = useState(false);

  // Live top-layer modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form Fields inside Dialog
  const [workspaceInput, setWorkspaceInput] = useState('Acme Production');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('editor');

  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseId = useId();

  const triggerToast = useCallback((msg: string) => {
    setFeedbackToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setFeedbackToast(null);
    }, 2500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const handleArchetypeChange = useCallback((nextArchetype: DialogArchetype) => {
    const preset = DIALOG_PRESETS.find((p) => p.id === nextArchetype) ?? DIALOG_PRESETS[0];
    setArchetype(preset.id);
    setSize(preset.defaultSize);
    setSeparators(preset.defaultSeparators);
    setFooterLayout(preset.defaultFooterLayout);
    setFooterBackground(preset.defaultFooterBg);
  }, []);

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    handleArchetypeChange('confirmation');
    setFooterBtnSize('default');
    setShowCloseButton(true);
    setCloseOnBackdropClick(false);
    setPreventEscapeClose(false);
  }, [handleArchetypeChange]);

  const hasHeaderSeparator = separators === 'default' || separators === 'header-only';
  const hasFooterSeparator = separators === 'default' || separators === 'footer-only';
  const footerSizeProp = footerBtnSize === 'default' ? undefined : footerBtnSize;

  const getFooterLayoutClass = (layout: DialogFooterLayout) => {
    switch (layout) {
      case 'split':
        return styles.footerLayoutSplit;
      case 'center':
        return styles.footerLayoutCenter;
      case 'between':
        return styles.footerLayoutBetween;
      case 'stacked':
        return styles.footerLayoutStacked;
      default:
        return styles.footerLayoutEnd;
    }
  };

  // Generate dynamic JSX snippet
  const jsxSnippet = useMemo(() => {
    const dialogProps: string[] = ['open={isOpen}', 'onOpenChange={handleOpenChange}'];
    if (size !== 'md') dialogProps.push(`size="${size}"`);
    if (showCloseButton) {
      dialogProps.push('showCloseButton');
      dialogProps.push('closeLabel="Close dialog"');
    }
    if (closeOnBackdropClick) dialogProps.push('closeOnBackdropClick');
    if (preventEscapeClose) dialogProps.push('preventEscapeClose');

    const headerClass = !hasHeaderSeparator ? ' className={styles.headerNoBorder}' : '';
    const footerClasses: string[] = [];
    if (!hasFooterSeparator) footerClasses.push('styles.footerNoBorder');
    if (footerLayout === 'split') footerClasses.push('styles.footerSplit');
    else if (footerLayout === 'center') footerClasses.push('styles.footerCenter');
    else if (footerLayout === 'between') footerClasses.push('styles.footerBetween');
    else if (footerLayout === 'stacked') footerClasses.push('styles.footerStacked');

    const footerClassProp =
      footerClasses.length > 0 ? ` className={cn(${footerClasses.join(', ')})}` : '';
    const footerBgProp = footerBackground === 'docked' ? ' background="docked"' : '';
    const btnSizeProp = footerBtnSize !== 'default' ? ` size="${footerBtnSize}"` : '';

    return `<Dialog ${dialogProps.join(' ')}>
  <DialogHeader${headerClass}>
    <DialogTitle>${archetype === 'confirmation' ? 'Delete project?' : 'Edit workspace'}</DialogTitle>
    ${archetype !== 'confirmation' ? '<DialogDescription>Update your workspace details.</DialogDescription>' : ''}
  </DialogHeader>
  <DialogBody>
    ${archetype === 'confirmation' ? '<p>This project and all its resources will be permanently removed.</p>' : '{/* Form controls */}'}
  </DialogBody>
  <DialogFooter${footerBgProp}${footerClassProp}>
    <Button variant="secondary"${btnSizeProp} onClick={handleCancel}>Cancel</Button>
    <Button variant="${archetype === 'confirmation' ? 'danger' : 'primary'}"${btnSizeProp} onClick={handleConfirm}>
      ${archetype === 'confirmation' ? 'Delete project' : 'Save'}
    </Button>
  </DialogFooter>
</Dialog>`;
  }, [
    size,
    showCloseButton,
    closeOnBackdropClick,
    preventEscapeClose,
    hasHeaderSeparator,
    hasFooterSeparator,
    footerLayout,
    footerBackground,
    footerBtnSize,
    archetype,
  ]);

  // Generate dynamic CSS Module snippet
  const cssModuleSnippet = useMemo(() => {
    const rules: string[] = [];

    if (!hasHeaderSeparator) {
      rules.push('.headerNoBorder {\n  border-block-end: none;\n}');
    }

    if (!hasFooterSeparator) {
      rules.push('.footerNoBorder {\n  border-block-start: none;\n}');
    }

    if (footerLayout === 'split') {
      rules.push(`.footerSplit {
  justify-content: stretch;
}

.footerSplit > button {
  flex: 1 1 50%;
  justify-content: center;
}`);
    } else if (footerLayout === 'center') {
      rules.push('.footerCenter {\n  justify-content: center;\n}');
    } else if (footerLayout === 'between') {
      rules.push('.footerBetween {\n  justify-content: space-between;\n}');
    } else if (footerLayout === 'stacked') {
      rules.push(`.footerStacked {
  flex-direction: column;
  align-items: stretch;
}

.footerStacked > button {
  inline-size: 100%;
}`);
    }

    if (rules.length === 0) return null;
    return rules.join('\n\n');
  }, [hasHeaderSeparator, hasFooterSeparator, footerLayout]);

  const aiAgentPrompt = useMemo(() => {
    return `You are composing an accessible modal Dialog using the white-label UI Kit. Follow these exact instructions:

1. Import primitives from root barrel:
   import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, Button } from '@/components/ui';

2. Usage:
   ${jsxSnippet}

3. Structural & Styling Invariants:
   - Built on native <dialog> and showModal() in the browser Top Layer.
   - 100% CSS logical properties (inline-size, block-size, padding-inline, padding-block).
   - Zero dashboard shadows: visual depth via surface steps (--color-surface-raised) and borders (--color-border-subtle).
   - Size: ${size} (sm: 400px, md: 540px, lg: 720px, xl: 960px, full: 100vw).
   - Surface Radius: var(--radius-dialog) (governed by design tokens: 12px dashboard, 16px website).
   - Close Button: ${showCloseButton ? 'showCloseButton with caller-supplied closeLabel (strictly required for accessible name).' : 'Omitted.'}
   - Backdrop Dismissal: ${closeOnBackdropClick ? 'Enabled via closeOnBackdropClick={true}' : 'Disabled by default to protect form inputs.'}

${cssModuleSnippet ? `4. CSS Module overrides:\n${cssModuleSnippet}` : ''}`;
  }, [jsxSnippet, size, showCloseButton, closeOnBackdropClick, cssModuleSnippet]);

  // Computed Specifications table
  const specGroups: readonly StudioSpecGroup[] = useMemo(() => {
    return [
      {
        title: t('common.studio.specCategoryVariant'),
        items: [
          { label: 'size', value: size },
          { label: 'Archetype', value: archetype },
          { label: 'Separators', value: separators },
          { label: 'Footer Layout', value: footerLayout },
          { label: 'Footer Background', value: footerBackground },
          { label: 'Footer Btn Size', value: footerBtnSize },
          { label: 'showCloseButton', value: showCloseButton ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          {
            label: '--radius-dialog',
            value: 'var(--radius-dialog)',
          },
          { label: 'Backdrop Scrim', value: 'var(--color-overlay)' },
          { label: 'Surface Step', value: 'var(--color-surface-raised)' },
          { label: 'Header Border', value: hasHeaderSeparator ? '1px subtle' : 'none' },
          { label: 'Footer Border', value: hasFooterSeparator ? '1px subtle' : 'none' },
        ],
      },
      {
        title: t('common.studio.specCategoryEnv'),
        items: [
          { label: t('common.studio.specLocale'), value: locale },
          { label: t('common.studio.specDirection'), value: direction.toUpperCase() },
          { label: t('common.studio.specTheme'), value: resolvedTheme },
        ],
      },
    ];
  }, [
    size,
    archetype,
    separators,
    footerLayout,
    footerBackground,
    footerBtnSize,
    showCloseButton,
    hasHeaderSeparator,
    hasFooterSeparator,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Option Matrices (Strictly Localized via t())
  const archetypeOptions: readonly StudioSegmentedOption<DialogArchetype>[] = [
    { value: 'standard', label: t('common.studio.dlgPresetStandard'), testId: 'opt-arch-standard' },
    {
      value: 'confirmation',
      label: t('common.studio.dlgPresetConfirmation'),
      testId: 'opt-arch-confirm',
    },
    { value: 'form', label: t('common.studio.dlgPresetForm'), testId: 'opt-arch-form' },
    {
      value: 'scrollable',
      label: t('common.studio.dlgPresetScrollable'),
      testId: 'opt-arch-scroll',
    },
  ];

  const sizeOptions: readonly StudioSegmentedOption<DialogSize>[] = [
    { value: 'sm', label: 'SM (400px)', testId: 'opt-dlg-size-sm' },
    { value: 'md', label: 'MD (540px)', testId: 'opt-dlg-size-md' },
    { value: 'lg', label: 'LG (720px)', testId: 'opt-dlg-size-lg' },
    { value: 'xl', label: 'XL (960px)', testId: 'opt-dlg-size-xl' },
    { value: 'full', label: 'Full', testId: 'opt-dlg-size-full' },
  ];

  const separatorOptions: readonly StudioSelectOption<DialogSeparators>[] = [
    { value: 'default', label: t('common.studio.sepDefault') },
    { value: 'none', label: t('common.studio.sepNone') },
    { value: 'header-only', label: t('common.studio.sepHeaderOnly') },
    { value: 'footer-only', label: t('common.studio.sepFooterOnly') },
  ];

  const footerLayoutOptions: readonly StudioSelectOption<DialogFooterLayout>[] = [
    { value: 'end', label: t('common.studio.footerEnd') },
    { value: 'split', label: t('common.studio.footerSplit') },
    { value: 'center', label: t('common.studio.footerCenter') },
    { value: 'between', label: t('common.studio.footerBetween') },
    { value: 'stacked', label: t('common.studio.footerStacked') },
  ];

  const footerBgOptions: readonly StudioSegmentedOption<'seamless' | 'docked'>[] = [
    {
      value: 'seamless',
      label: t('common.studio.footerBgSeamless'),
      testId: 'opt-foot-bg-seamless',
    },
    { value: 'docked', label: t('common.studio.footerBgDocked'), testId: 'opt-foot-bg-docked' },
  ];

  const footerBtnSizeOptions: readonly StudioSegmentedOption<ControlSize | 'default'>[] = [
    { value: 'default', label: 'Def', testId: 'opt-foot-size-def' },
    { value: 'sm', label: 'SM', testId: 'opt-foot-size-sm' },
    { value: 'md', label: 'MD', testId: 'opt-foot-size-md' },
    { value: 'lg', label: 'LG', testId: 'opt-foot-size-lg' },
  ];

  const roleComboboxOptions: ComboboxOption[] = useMemo(
    () => [
      { value: 'admin', label: t('common.studio.formRoleAdmin') },
      { value: 'editor', label: t('common.studio.formRoleEditor') },
      { value: 'viewer', label: t('common.studio.formRoleViewer') },
    ],
    [t],
  );

  // Render Inner Content using Real Compound Primitives (Zero text redundancy)
  const renderDialogContent = (isModal: boolean) => {
    const handleClose = () => {
      if (isModal) setIsModalOpen(false);
      triggerToast(t('common.studio.dlgToastClosed'));
    };

    switch (archetype) {
      case 'confirmation':
        return (
          <>
            <DialogHeader className={cn(!hasHeaderSeparator && styles.headerNoBorder)}>
              <DialogTitle>{t('common.studio.confTitle')}</DialogTitle>
              <DialogDescription className={styles.dialogMessage}>
                {t('common.studio.confDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter
              background={footerBackground}
              className={cn(
                !hasFooterSeparator && styles.footerNoBorder,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                ref={isModal ? confirmCancelRef : undefined}
                variant="secondary"
                size={footerSizeProp}
                onClick={handleClose}
                data-testid="dialog-cancel-btn"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                size={footerSizeProp}
                onClick={() => {
                  handleClose();
                  triggerToast(t('common.studio.confConfirm'));
                }}
                data-testid="dialog-confirm-btn"
              >
                {t('common.studio.confConfirm')}
              </Button>
            </DialogFooter>
          </>
        );

      case 'form':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleClose();
              triggerToast(t('common.studio.formSubmittedToast'));
            }}
          >
            <DialogHeader className={cn(!hasHeaderSeparator && styles.headerNoBorder)}>
              <DialogTitle>{t('common.studio.formTitle')}</DialogTitle>
              <DialogDescription>{t('common.studio.formDesc')}</DialogDescription>
            </DialogHeader>
            <DialogBody
              scrollable={false}
              className={cn(!hasHeaderSeparator && styles.bodyNoBorder)}
            >
              <div className={styles.formContent}>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor={`${baseId}-form-name`}>
                    {t('common.studio.formNameLabel')}
                  </label>
                  <Input
                    id={`${baseId}-form-name`}
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    placeholder={t('common.studio.formNamePlaceholder')}
                    required
                    data-testid="dialog-form-name-input"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <label className={styles.fieldLabel} htmlFor={`${baseId}-form-role`}>
                    {t('common.studio.formRoleLabel')}
                  </label>
                  <Combobox
                    id={`${baseId}-form-role`}
                    options={roleComboboxOptions}
                    value={memberRole}
                    onValueChange={(val) => setMemberRole(val as string)}
                    clearable={false}
                    data-testid="dialog-form-role-select"
                  />
                </div>
              </div>
            </DialogBody>
            <DialogFooter
              background={footerBackground}
              className={cn(
                !hasFooterSeparator && styles.footerNoBorder,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                type="button"
                variant="secondary"
                size={footerSizeProp}
                onClick={() => {
                  handleClose();
                  triggerToast(t('common.studio.formCanceledToast'));
                }}
                data-testid="dialog-cancel-btn"
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size={footerSizeProp}
                data-testid="dialog-submit-btn"
              >
                {t('common.studio.formSubmit')}
              </Button>
            </DialogFooter>
          </form>
        );

      case 'scrollable':
        return (
          <>
            <DialogHeader className={cn(!hasHeaderSeparator && styles.headerNoBorder)}>
              <DialogTitle>{t('common.studio.scrollTitle')}</DialogTitle>
              <DialogDescription>{t('common.studio.scrollDesc')}</DialogDescription>
            </DialogHeader>
            <DialogBody data-testid="dialog-scroll-body">
              <div className={styles.scrollableParagraphs}>
                <p>{t('common.studio.scrollParagraph1')}</p>
                <p>{t('common.studio.scrollParagraph2')}</p>
                <p>{t('common.studio.scrollParagraph3')}</p>
                <p>{t('common.studio.scrollParagraph4')}</p>
                <p>{t('common.studio.scrollParagraph5')}</p>
              </div>
            </DialogBody>
            <DialogFooter
              background={footerBackground}
              className={cn(
                !hasFooterSeparator && styles.footerNoBorder,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                variant="secondary"
                size={footerSizeProp}
                onClick={handleClose}
                data-testid="dialog-cancel-btn"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size={footerSizeProp}
                onClick={() => {
                  handleClose();
                  triggerToast(t('common.studio.scrollAccept'));
                }}
                data-testid="dialog-accept-btn"
              >
                {t('common.studio.scrollAccept')}
              </Button>
            </DialogFooter>
          </>
        );

      default:
        return (
          <>
            <DialogHeader className={cn(!hasHeaderSeparator && styles.headerNoBorder)}>
              <DialogTitle>{t('common.studio.stdTitle')}</DialogTitle>
              <DialogDescription>{t('common.studio.stdDesc')}</DialogDescription>
            </DialogHeader>
            <DialogBody
              scrollable={false}
              className={cn(!hasHeaderSeparator && styles.bodyNoBorder)}
            >
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor={`${baseId}-std-input`}>
                  {t('common.studio.stdFieldLabel')}
                </label>
                <Input
                  id={`${baseId}-std-input`}
                  value={workspaceInput}
                  onChange={(e) => setWorkspaceInput(e.target.value)}
                  data-testid="dialog-workspace-input"
                />
              </div>
            </DialogBody>
            <DialogFooter
              background={footerBackground}
              className={cn(
                !hasFooterSeparator && styles.footerNoBorder,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                variant="secondary"
                size={footerSizeProp}
                onClick={handleClose}
                data-testid="dialog-cancel-btn"
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size={footerSizeProp}
                onClick={() => {
                  handleClose();
                  triggerToast(t('common.studio.stdSavedToast'));
                }}
                data-testid="dialog-save-btn"
              >
                {t('common.studio.stdConfirm')}
              </Button>
            </DialogFooter>
          </>
        );
    }
  };

  return (
    <GalleryStudioLayout
      activeRoute="dialog"
      title={t('common.studio.dlgTitle')}
      subtitle={t('common.studio.dlgSubtitle')}
      testId="dialog-gallery"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={[
              { value: 'ltr', label: t('common.studio.specimenDirLtr'), testId: 'opt-dir-ltr' },
              { value: 'rtl', label: t('common.studio.specimenDirRtl'), testId: 'opt-dir-rtl' },
            ]}
            onChange={setSpecimenDir}
          />

          <Button
            size="sm"
            variant="primary"
            startIcon={<Icon name="feature" />}
            onClick={() => setIsModalOpen(true)}
            data-testid="studio-open-live-modal-btn"
            className={styles.sidebarActionBtn}
          >
            {t('common.studio.dlgOpenLiveModal')}
          </Button>

          <hr className={styles.controlDivider} />

          <StudioSegmentedControl
            label={t('common.studio.dlgPresetLabel')}
            value={archetype}
            options={archetypeOptions}
            onChange={handleArchetypeChange}
          />

          <StudioSegmentedControl
            label={t('common.studio.dlgSizeLabel')}
            value={size}
            options={sizeOptions}
            onChange={setSize}
          />

          <hr className={styles.controlDivider} />

          <StudioSelectField
            label={t('common.studio.dlgSeparatorsLabel')}
            value={separators}
            options={separatorOptions}
            onChange={setSeparators}
            testId="select-dialog-separators"
          />

          <StudioSelectField
            label={t('common.studio.dlgFooterLayoutLabel')}
            value={footerLayout}
            options={footerLayoutOptions}
            onChange={setFooterLayout}
            testId="select-dialog-footer-layout"
          />

          <StudioSegmentedControl
            label={t('common.studio.footerBgLabel')}
            value={footerBackground}
            options={footerBgOptions}
            onChange={setFooterBackground}
          />

          <StudioSegmentedControl
            label={t('common.studio.dlgFooterBtnSizeLabel')}
            value={footerBtnSize}
            options={footerBtnSizeOptions}
            onChange={setFooterBtnSize}
          />

          <hr className={styles.controlDivider} />

          <StudioToggleRow
            label={t('common.studio.dlgCloseBtnLabel')}
            checked={showCloseButton}
            onCheckedChange={setShowCloseButton}
            testId="toggle-dialog-close-btn"
          />

          <StudioToggleRow
            label={t('common.studio.dlgBackdropDismissLabel')}
            checked={closeOnBackdropClick}
            onCheckedChange={setCloseOnBackdropClick}
            testId="toggle-dialog-backdrop-dismiss"
          />

          <StudioToggleRow
            label={t('common.studio.dlgPreventEscapeLabel')}
            checked={preventEscapeClose}
            onCheckedChange={setPreventEscapeClose}
            testId="toggle-dialog-prevent-escape"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiAgentPrompt}
          jsxCode={jsxSnippet}
          cssCode={cssModuleSnippet}
          jsxFileName="my-dialog-modal.tsx"
          cssFileName="my-dialog-modal.module.css"
          specGroups={specGroups}
        />
      }
    >
      <div className={styles.stagePreviewWrapper}>
        {feedbackToast && (
          <div role="status" aria-live="polite" className={styles.toastRow}>
            <span>{feedbackToast}</span>
            <Icon name="check" />
          </div>
        )}

        {/* Focused, Clean In-Canvas Dialog Specimen */}
        <div
          className={styles.inlineDialogCard}
          data-size={size}
          data-testid="studio-inline-dialog-preview"
        >
          {renderDialogContent(false)}
        </div>
      </div>

      {/* Real Top-Layer Modal Triggered from Sidebar Button */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        size={size}
        showCloseButton={showCloseButton}
        closeLabel={t('common.close')}
        closeOnBackdropClick={closeOnBackdropClick}
        preventEscapeClose={preventEscapeClose}
        initialFocusRef={archetype === 'confirmation' ? confirmCancelRef : undefined}
        data-testid="studio-live-modal"
      >
        {renderDialogContent(true)}
      </Dialog>
    </GalleryStudioLayout>
  );
}

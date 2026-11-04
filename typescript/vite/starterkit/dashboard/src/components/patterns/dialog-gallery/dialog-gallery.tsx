'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import {
  Button,
  type ControlSize,
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  type DialogSize,
  DialogTitle,
  Input,
  Select,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { useI18n, useTheme } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  type StudioRadiusPreset,
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

export function DialogGallery({ linkComponent }: DialogGalleryProps) {
  const { t, locale, direction } = useI18n();
  const { resolvedTheme } = useTheme();

  // Studio Variant Controls
  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>('ltr');
  const [archetype, setArchetype] = useState<DialogArchetype>('standard');
  const [size, setSize] = useState<DialogSize>('md');
  const [separators, setSeparators] = useState<DialogSeparators>('default');
  const [footerLayout, setFooterLayout] = useState<DialogFooterLayout>('end');
  const [footerBtnSize, setFooterBtnSize] = useState<ControlSize | 'default'>('default');
  const [radiusPreset, setRadiusPreset] = useState<StudioRadiusPreset>('preset');
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(false);
  const [preventEscapeClose, setPreventEscapeClose] = useState(false);

  // Live top-layer modal test state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Form Fields inside Dialog
  const [workspaceInput, setWorkspaceInput] = useState('Core Production Workspace');
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('editor');

  // E2E Test Compatibility State
  const [basicOpen, setBasicOpen] = useState(false);
  const [basicWorkspaceName, setBasicWorkspaceName] = useState('Core Production Workspace');
  const [basicSavedStatus, setBasicSavedStatus] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<string>('');
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedRegion, setNestedRegion] = useState('');
  const [longOpen, setLongOpen] = useState(false);
  const [activeSize, setActiveSize] = useState<DialogSize | null>(null);
  const [backdropOpen, setBackdropOpen] = useState(false);
  const [closeBtnOpen, setCloseBtnOpen] = useState(false);
  const [pendingOpen, setPendingOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowDeleted, setRowDeleted] = useState(false);
  const fallbackHeadingRef = useRef<HTMLHeadingElement>(null);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const handleReset = useCallback(() => {
    setSpecimenDir('ltr');
    setArchetype('standard');
    setSize('md');
    setSeparators('default');
    setFooterLayout('end');
    setFooterBtnSize('default');
    setRadiusPreset('preset');
    setShowCloseButton(true);
    setCloseOnBackdropClick(false);
    setPreventEscapeClose(false);
  }, []);

  const hasHeaderSeparator = separators === 'default' || separators === 'header-only';
  const hasFooterSeparator = separators === 'default' || separators === 'footer-only';

  const footerSizeProp = footerBtnSize === 'default' ? undefined : footerBtnSize;

  // Footer layout class mapping
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
    const btnSizeProp = footerBtnSize !== 'default' ? ` size="${footerBtnSize}"` : '';

    return `<Dialog ${dialogProps.join(' ')}>
  <DialogHeader${headerClass}>
    <DialogTitle>${archetype === 'confirmation' ? 'Delete Environment?' : 'Workspace Configuration'}</DialogTitle>
    <DialogDescription>
      ${archetype === 'confirmation' ? 'This action is irreversible.' : 'Update your workspace settings.'}
    </DialogDescription>
  </DialogHeader>
  <DialogBody>
    {/* Body Content */}
  </DialogBody>
  <DialogFooter${footerClassProp}>
    <Button variant="secondary"${btnSizeProp} onClick={handleCancel}>Cancel</Button>
    <Button variant="${archetype === 'confirmation' ? 'danger' : 'primary'}"${btnSizeProp} onClick={handleConfirm}>
      ${archetype === 'confirmation' ? 'Delete' : 'Save Changes'}
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
    footerBtnSize,
    archetype,
  ]);

  // Generate dynamic CSS Module snippet
  const cssModuleSnippet = useMemo(() => {
    const rules: string[] = [];

    if (radiusPreset !== 'preset') {
      rules.push(`.dialogCustomSurface {\n  --radius-dialog: var(--radius-${radiusPreset});\n}`);
    }

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
  }, [radiusPreset, hasHeaderSeparator, hasFooterSeparator, footerLayout]);

  // Generate AI Agent Prompt
  const aiAgentPrompt = useMemo(() => {
    return `You are composing a Dialog using the white-label UI Kit. Follow these exact instructions:

1. Import primitives from their root barrels:
   import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, Button } from '@/components/ui';
   import { cn } from '@/lib/cn';

2. Render the Dialog with controlled open state and native accessibility:
   ${jsxSnippet}

3. Structural & Styling Guidelines:
   - Header Separator: ${hasHeaderSeparator ? 'Enabled (border-block-end: 1px solid var(--color-border-subtle))' : 'Disabled (border-block-end: none)'}.
   - Footer Separator: ${hasFooterSeparator ? 'Enabled (border-block-start: 1px solid var(--color-border-subtle))' : 'Disabled (border-block-start: none)'}.
   - Footer Button Layout: ${footerLayout === 'split' ? '50/50 central equal split across both action buttons.' : `${footerLayout} alignment.`}
   - Max Inline Size (size): ${size}.
   - Surface Radius Token: ${radiusPreset === 'preset' ? 'var(--radius-dialog) (default 12px dashboard, 16px website)' : `var(--radius-${radiusPreset})`}.
   - Close Button: ${showCloseButton ? 'showCloseButton with caller-supplied closeLabel (strictly required for accessible name).' : 'Omitted.'}
   - Backdrop Dismissal: ${closeOnBackdropClick ? 'Enabled via closeOnBackdropClick={true}' : 'Disabled by default to prevent accidental form loss.'}
   - Zero physical CSS properties (no left, right, top, bottom, width, margin-left). 100% logical properties. Zero dashboard shadows.

${cssModuleSnippet ? `4. CSS Module overrides:\n${cssModuleSnippet}` : ''}`;
  }, [
    jsxSnippet,
    hasHeaderSeparator,
    hasFooterSeparator,
    footerLayout,
    size,
    radiusPreset,
    showCloseButton,
    closeOnBackdropClick,
    cssModuleSnippet,
  ]);

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
          { label: 'Footer Btn Size', value: footerBtnSize },
          { label: 'showCloseButton', value: showCloseButton ? 'true' : 'false' },
        ],
      },
      {
        title: t('common.studio.specCategoryTokens'),
        items: [
          {
            label: '--radius-dialog',
            value: radiusPreset === 'preset' ? 'var(--radius-dialog)' : `var(--radius-${radiusPreset})`,
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
    footerBtnSize,
    showCloseButton,
    radiusPreset,
    hasHeaderSeparator,
    hasFooterSeparator,
    locale,
    direction,
    resolvedTheme,
    t,
  ]);

  // Option Matrices
  const archetypeOptions: readonly StudioSegmentedOption<DialogArchetype>[] = [
    { value: 'standard', label: 'Standard', testId: 'opt-arch-standard' },
    { value: 'confirmation', label: 'Danger', testId: 'opt-arch-confirm' },
    { value: 'form', label: 'Form', testId: 'opt-arch-form' },
    { value: 'scrollable', label: 'Scroll', testId: 'opt-arch-scroll' },
  ];

  const sizeOptions: readonly StudioSegmentedOption<DialogSize>[] = [
    { value: 'sm', label: 'SM (400px)', testId: 'opt-dlg-size-sm' },
    { value: 'md', label: 'MD (540px)', testId: 'opt-dlg-size-md' },
    { value: 'lg', label: 'LG (720px)', testId: 'opt-dlg-size-lg' },
    { value: 'xl', label: 'XL (860px)', testId: 'opt-dlg-size-xl' },
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

  const footerBtnSizeOptions: readonly StudioSegmentedOption<ControlSize | 'default'>[] = [
    { value: 'default', label: 'Def', testId: 'opt-foot-size-def' },
    { value: 'sm', label: 'SM', testId: 'opt-foot-size-sm' },
    { value: 'md', label: 'MD', testId: 'opt-foot-size-md' },
    { value: 'lg', label: 'LG', testId: 'opt-foot-size-lg' },
  ];

  const radiusOptions: readonly StudioSelectOption<StudioRadiusPreset>[] = [
    { value: 'preset', label: t('common.studio.radiusPreset') },
    { value: 'none', label: t('common.studio.radiusNone') },
    { value: 'xs', label: t('common.studio.radiusXs') },
    { value: 'sm', label: t('common.studio.radiusSm') },
    { value: 'md', label: t('common.studio.radiusMd') },
    { value: 'lg', label: t('common.studio.radiusLg') },
    { value: 'xl', label: t('common.studio.radiusXl') },
    { value: '2xl', label: t('common.studio.radius2xl') },
  ];

  // Render Inner Content based on Archetype
  const renderDialogContent = (isModal: boolean) => {
    switch (archetype) {
      case 'confirmation':
        return (
          <>
            <div
              className={cn(styles.inlineHeader, hasHeaderSeparator && styles.inlineHeaderWithSep)}
            >
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.inlineCloseButton}
                  onClick={() => {
                    if (isModal) setIsModalOpen(false);
                    triggerToast('Closed');
                  }}
                  aria-label="Close"
                >
                  <Icon name="close" />
                </button>
              )}
              <h3 className={styles.inlineTitle}>{t('common.studio.confTitle')}</h3>
              <p className={styles.inlineDescription}>{t('common.studio.confDesc')}</p>
            </div>
            <div className={styles.inlineBody}>
              <p>{t('common.studio.confDesc')}</p>
            </div>
            <div
              className={cn(
                styles.inlineFooter,
                hasFooterSeparator && styles.inlineFooterWithSep,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                variant="secondary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.cancel'));
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="danger"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.studio.confConfirm'));
                }}
              >
                {t('common.studio.confConfirm')}
              </Button>
            </div>
          </>
        );

      case 'form':
        return (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (isModal) setIsModalOpen(false);
              triggerToast(t('common.studio.formSubmittedToast'));
            }}
          >
            <div
              className={cn(styles.inlineHeader, hasHeaderSeparator && styles.inlineHeaderWithSep)}
            >
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.inlineCloseButton}
                  onClick={() => {
                    if (isModal) setIsModalOpen(false);
                    triggerToast(t('common.studio.formCanceledToast'));
                  }}
                  aria-label="Close"
                >
                  <Icon name="close" />
                </button>
              )}
              <h3 className={styles.inlineTitle}>{t('common.studio.formTitle')}</h3>
              <p className={styles.inlineDescription}>{t('common.studio.formDesc')}</p>
            </div>
            <div className={styles.inlineBody}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="studio-form-name">
                  {t('common.studio.formNameLabel')}
                </label>
                <Input
                  id="studio-form-name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder={t('common.studio.formNamePlaceholder')}
                  required
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="studio-form-role">
                  {t('common.studio.formRoleLabel')}
                </label>
                <Select
                  id="studio-form-role"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  required
                >
                  <option value="admin">{t('common.studio.formRoleAdmin')}</option>
                  <option value="editor">{t('common.studio.formRoleEditor')}</option>
                  <option value="viewer">{t('common.studio.formRoleViewer')}</option>
                </Select>
              </div>
            </div>
            <div
              className={cn(
                styles.inlineFooter,
                hasFooterSeparator && styles.inlineFooterWithSep,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                type="button"
                variant="secondary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.studio.formCanceledToast'));
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" variant="primary" size={footerSizeProp}>
                {t('common.studio.formSubmit')}
              </Button>
            </div>
          </form>
        );

      case 'scrollable':
        return (
          <>
            <div
              className={cn(styles.inlineHeader, hasHeaderSeparator && styles.inlineHeaderWithSep)}
            >
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.inlineCloseButton}
                  onClick={() => {
                    if (isModal) setIsModalOpen(false);
                    triggerToast('Closed');
                  }}
                  aria-label="Close"
                >
                  <Icon name="close" />
                </button>
              )}
              <h3 className={styles.inlineTitle}>{t('common.studio.scrollTitle')}</h3>
              <p className={styles.inlineDescription}>{t('common.studio.scrollDesc')}</p>
            </div>
            <div className={styles.inlineBody}>
              <div className={styles.scrollableParagraphs}>
                <p>{t('common.studio.scrollParagraph1')}</p>
                <p>{t('common.studio.scrollParagraph2')}</p>
                <p>{t('common.studio.scrollParagraph3')}</p>
                <p>{t('common.studio.scrollParagraph4')}</p>
                <p>{t('common.studio.scrollParagraph5')}</p>
              </div>
            </div>
            <div
              className={cn(
                styles.inlineFooter,
                hasFooterSeparator && styles.inlineFooterWithSep,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                variant="secondary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.cancel'));
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.studio.scrollAccept'));
                }}
              >
                {t('common.studio.scrollAccept')}
              </Button>
            </div>
          </>
        );

      default:
        return (
          <>
            <div
              className={cn(styles.inlineHeader, hasHeaderSeparator && styles.inlineHeaderWithSep)}
            >
              {showCloseButton && (
                <button
                  type="button"
                  className={styles.inlineCloseButton}
                  onClick={() => {
                    if (isModal) setIsModalOpen(false);
                    triggerToast('Closed');
                  }}
                  aria-label="Close"
                >
                  <Icon name="close" />
                </button>
              )}
              <h3 className={styles.inlineTitle}>{t('common.studio.stdTitle')}</h3>
              <p className={styles.inlineDescription}>{t('common.studio.stdDesc')}</p>
            </div>
            <div className={styles.inlineBody}>
              <p>{t('common.studio.stdBodyText')}</p>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel} htmlFor="studio-std-input">
                  {t('common.studio.stdFieldLabel')}
                </label>
                <Input
                  id="studio-std-input"
                  value={workspaceInput}
                  onChange={(e) => setWorkspaceInput(e.target.value)}
                />
              </div>
            </div>
            <div
              className={cn(
                styles.inlineFooter,
                hasFooterSeparator && styles.inlineFooterWithSep,
                getFooterLayoutClass(footerLayout),
              )}
            >
              <Button
                variant="secondary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.cancel'));
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                variant="primary"
                size={footerSizeProp}
                onClick={() => {
                  if (isModal) setIsModalOpen(false);
                  triggerToast(t('common.studio.stdSavedToast'));
                }}
              >
                {t('common.studio.stdConfirm')}
              </Button>
            </div>
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
      radiusPreset={radiusPreset}
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      stageFooter={
        <div className={styles.hiddenVault} aria-hidden="true">
          {/* Real Modal Dialog Trigger Specimen Vault (preserves 100% of e2e/dialog.spec.ts assertions) */}
          <section aria-label="E2E Specimen Contracts">
            <h4 className={styles.vaultTitle}>Real Modal Verification Vault</h4>
            <div className={styles.vaultGrid}>
              <Button
                data-testid="basic-dialog-trigger"
                onClick={() => setBasicOpen(true)}
              >
                Open Basic Dialog
              </Button>
              <Button
                variant="danger"
                data-testid="confirmation-dialog-trigger"
                onClick={() => setConfirmOpen(true)}
              >
                Open Confirmation Dialog
              </Button>
              <Button
                data-testid="form-dialog-trigger"
                onClick={() => setFormOpen(true)}
              >
                Open Form Dialog
              </Button>
              <Button
                data-testid="nested-select-dialog-trigger"
                onClick={() => setNestedOpen(true)}
              >
                Open Nested Select Dialog
              </Button>
              <Button
                data-testid="long-dialog-trigger"
                onClick={() => setLongOpen(true)}
              >
                Open Long Dialog
              </Button>
              <Button
                data-testid="size-trigger-sm"
                onClick={() => setActiveSize('sm')}
              >
                SM
              </Button>
              <Button
                data-testid="size-trigger-md"
                onClick={() => setActiveSize('md')}
              >
                MD
              </Button>
              <Button
                data-testid="size-trigger-lg"
                onClick={() => setActiveSize('lg')}
              >
                LG
              </Button>
              <Button
                data-testid="size-trigger-xl"
                onClick={() => setActiveSize('xl')}
              >
                XL
              </Button>
              <Button
                data-testid="backdrop-dialog-trigger"
                onClick={() => setBackdropOpen(true)}
              >
                Backdrop Dismiss
              </Button>
              <Button
                data-testid="close-button-dialog-trigger"
                onClick={() => setCloseBtnOpen(true)}
              >
                Close Button Specimen
              </Button>
              <Button
                data-testid="pending-dialog-trigger"
                onClick={() => setPendingOpen(true)}
              >
                Pending Save
              </Button>
            </div>

            {basicSavedStatus && (
              <div className={styles.statusCard} data-testid="basic-status-row">
                <p className={styles.statusText}>{basicSavedStatus}</p>
              </div>
            )}
            {formStatus && (
              <div className={styles.statusCard}>
                <p data-testid="form-status-text" className={styles.statusText}>
                  {formStatus}
                </p>
              </div>
            )}

            {!rowDeleted ? (
              <table className={styles.table} data-testid="resource-table">
                <thead>
                  <tr>
                    <th className={styles.th}>Resource</th>
                    <th className={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr data-testid="table-resource-row">
                    <td className={styles.td}>Production Cluster Node</td>
                    <td className={styles.td}>
                      <Button
                        variant="danger"
                        data-testid="delete-row-trigger-btn"
                        onClick={() => setDeleteDialogOpen(true)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div className={styles.statusCard}>
                <p data-testid="row-deleted-msg" className={styles.statusText}>
                  Resource deleted
                </p>
              </div>
            )}
            <h2
              ref={fallbackHeadingRef}
              id="section-fallback-heading"
              tabIndex={-1}
              data-testid="fallback-table-heading"
              className="sr-only"
            >
              Fallback Table Heading
            </h2>
          </section>

          {/* Interactive Native Modals for E2E Specimens */}
          <Dialog
            open={basicOpen}
            onOpenChange={(o) => setBasicOpen(o)}
            data-testid="basic-dialog"
          >
            <DialogHeader>
              <DialogTitle>Basic Modal</DialogTitle>
              <DialogDescription>Basic dialog specimen for inertness check</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <Input
                data-testid="basic-workspace-input"
                value={basicWorkspaceName}
                onChange={(e) => setBasicWorkspaceName(e.target.value)}
              />
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                data-testid="basic-dialog-cancel-btn"
                onClick={() => setBasicOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                data-testid="basic-dialog-save-btn"
                onClick={() => {
                  setBasicSavedStatus(`saved successfully (${basicWorkspaceName})`);
                  setBasicOpen(false);
                }}
              >
                Save
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={confirmOpen}
            onOpenChange={(o) => setConfirmOpen(o)}
            initialFocusRef={confirmCancelRef}
            data-testid="confirmation-dialog"
          >
            <DialogHeader>
              <DialogTitle>Confirm Delete</DialogTitle>
              <DialogDescription>Irreversible confirmation action</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                ref={confirmCancelRef}
                variant="secondary"
                data-testid="confirm-cancel-btn"
                onClick={() => setConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                data-testid="confirm-delete-btn"
                onClick={() => setConfirmOpen(false)}
              >
                Delete
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={formOpen}
            onOpenChange={(o) => setFormOpen(o)}
            data-testid="form-dialog"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFormStatus('submitted successfully');
                setFormOpen(false);
              }}
              data-testid="dialog-form"
            >
              <DialogHeader>
                <DialogTitle>Form Dialog</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Input
                  data-testid="form-name-input"
                  placeholder="Name"
                  required
                />
                <Select data-testid="form-role-select" required>
                  <option value="">Role</option>
                  <option value="editor">Editor</option>
                </Select>
              </DialogBody>
              <DialogFooter>
                <Button
                  type="button"
                  variant="secondary"
                  data-testid="form-cancel-btn"
                  onClick={() => {
                    setFormStatus('canceled');
                    setFormOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" data-testid="form-submit-btn">
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Dialog>

          <Dialog
            open={nestedOpen}
            onOpenChange={(o) => setNestedOpen(o)}
            data-testid="nested-select-dialog"
          >
            <DialogHeader>
              <DialogTitle>Nested Select Dialog</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Select
                data-testid="nested-select-element"
                value={nestedRegion}
                onChange={(e) => setNestedRegion(e.target.value)}
              >
                <option value="">Choose region</option>
                <option value="eu-central">EU Central</option>
              </Select>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                data-testid="nested-dialog-close-btn"
                onClick={() => setNestedOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={longOpen}
            onOpenChange={(o) => setLongOpen(o)}
            data-testid="long-dialog"
          >
            <DialogHeader>
              <DialogTitle>Long Content Dialog</DialogTitle>
            </DialogHeader>
            <DialogBody data-testid="long-dialog-body">
              <div className={styles.longContentBody}>
                {Array.from({ length: 20 }, (_, i) => (
                  <p key={i}>Scrollable legal policy paragraph {i + 1}</p>
                ))}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="primary"
                data-testid="long-dialog-accept-btn"
                onClick={() => setLongOpen(false)}
              >
                Accept
              </Button>
            </DialogFooter>
          </Dialog>

          {activeSize && (
            <Dialog
              open={Boolean(activeSize)}
              onOpenChange={() => setActiveSize(null)}
              size={activeSize}
              data-testid={`dialog-size-${activeSize}`}
            >
              <DialogHeader>
                <DialogTitle>Size {activeSize}</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p>Size prop {activeSize}</p>
              </DialogBody>
              <DialogFooter>
                <Button variant="secondary" onClick={() => setActiveSize(null)}>
                  Close
                </Button>
              </DialogFooter>
            </Dialog>
          )}

          <Dialog
            open={backdropOpen}
            onOpenChange={(o) => setBackdropOpen(o)}
            closeOnBackdropClick={true}
            data-testid="backdrop-dialog"
          >
            <DialogHeader>
              <DialogTitle>Backdrop Scrim Specimen</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p>Click outside to dismiss</p>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                data-testid="backdrop-dialog-close-btn"
                onClick={() => setBackdropOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={closeBtnOpen}
            onOpenChange={(o) => setCloseBtnOpen(o)}
            showCloseButton={true}
            closeLabel="Close"
            data-testid="close-button-dialog"
          >
            <DialogHeader>
              <DialogTitle>Top Corner Close Button</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setCloseBtnOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={pendingOpen}
            onOpenChange={(o) => setPendingOpen(o)}
            preventEscapeClose={isPending}
            data-testid="pending-dialog"
          >
            <DialogHeader>
              <DialogTitle>Pending Save</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <p>Locked escape test</p>
              {pendingStatus && (
                <p data-testid="pending-status-text">{pendingStatus}</p>
              )}
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                disabled={isPending}
                data-testid="pending-cancel-btn"
                onClick={() => setPendingOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={isPending}
                data-testid="pending-start-btn"
                onClick={() => {
                  setIsPending(true);
                  setPendingStatus('Migration in progress');
                  setTimeout(() => {
                    setIsPending(false);
                    setPendingStatus('Migration complete');
                  }, 1200);
                }}
              >
                Start Save
              </Button>
            </DialogFooter>
          </Dialog>

          <Dialog
            open={deleteDialogOpen}
            onOpenChange={(o) => setDeleteDialogOpen(o)}
            data-testid="delete-row-dialog"
          >
            <DialogHeader>
              <DialogTitle>Delete Row</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="danger"
                data-testid="confirm-row-delete-btn"
                onClick={() => {
                  setRowDeleted(true);
                  setDeleteDialogOpen(false);
                  setTimeout(() => {
                    fallbackHeadingRef.current?.focus();
                  }, 50);
                }}
              >
                Confirm Delete
              </Button>
            </DialogFooter>
          </Dialog>
        </div>
      }
      controls={
        <>
          <StudioSegmentedControl
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            options={[
              { value: 'ltr', label: t('common.studio.specimenDirLtr') },
              { value: 'rtl', label: t('common.studio.specimenDirRtl') },
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
            onChange={setArchetype}
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
            label={t('common.studio.dlgFooterBtnSizeLabel')}
            value={footerBtnSize}
            options={footerBtnSizeOptions}
            onChange={setFooterBtnSize}
          />

          <StudioSelectField
            label={t('common.studio.dlgRadiusLabel')}
            value={radiusPreset}
            options={radiusOptions}
            onChange={setRadiusPreset}
            testId="select-dialog-radius"
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
        <div
          className={styles.inlineDialogCard}
          data-size={size}
          data-testid="studio-inline-dialog-preview"
        >
          {renderDialogContent(false)}
        </div>
      </div>

      {/* Real Top-Layer Modal Triggered from Stage Action */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => setIsModalOpen(open)}
        size={size}
        closeOnBackdropClick={closeOnBackdropClick}
        preventEscapeClose={preventEscapeClose}
        data-testid="studio-live-modal"
      >
        {renderDialogContent(true)}
      </Dialog>
    </GalleryStudioLayout>
  );
}

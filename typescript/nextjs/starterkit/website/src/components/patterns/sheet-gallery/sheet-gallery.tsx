'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Badge, Button, Input, Label } from '@/components/ui';
import {
  Sheet,
  SheetBody,
  type SheetCloseReason,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  type SheetSide,
  type SheetSize,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  BidiText,
  defaultMessages,
  type SupportedLocale,
  type TranslationKey,
  translate,
} from '@/i18n';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import {
  GalleryCodeInspector,
  GalleryStudioLayout,
  type StudioLinkComponent,
  StudioSegmentedControl,
  type StudioSpecGroup,
  StudioToggleRow,
} from '../gallery-studio';
import styles from './sheet-gallery.module.css';

type SheetScenario = 'details' | 'form' | 'navigation';

export interface SheetGalleryProps {
  linkComponent?: StudioLinkComponent;
}

const SIZE_PIXELS: Record<SheetSize, string> = {
  sm: '320px',
  md: '400px',
  lg: '540px',
  xl: '720px',
  full: '100%',
};

export function SheetGallery({ linkComponent }: SheetGalleryProps) {
  const { t, locale, direction } = useI18n();

  const [specimenDir, setSpecimenDir] = useState<'ltr' | 'rtl'>(direction);
  const [side, setSide] = useState<SheetSide>('inline-end');
  const [size, setSize] = useState<SheetSize>('md');
  const [scenario, setScenario] = useState<SheetScenario>('details');
  const [showCloseButton, setShowCloseButton] = useState(true);
  const [closeOnBackdropClick, setCloseOnBackdropClick] = useState(true);
  const [preventEscapeClose, setPreventEscapeClose] = useState(false);
  const [open, setOpen] = useState(false);
  const [lastCloseReason, setLastCloseReason] = useState<SheetCloseReason | null>(null);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formNotes, setFormNotes] = useState('');

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

  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const nameFieldId = useId();
  const emailFieldId = useId();
  const notesFieldId = useId();

  const handleReset = useCallback(() => {
    setSpecimenDir(direction);
    setSide('inline-end');
    setSize('md');
    setScenario('details');
    setShowCloseButton(true);
    setCloseOnBackdropClick(true);
    setPreventEscapeClose(false);
    setOpen(false);
    setLastCloseReason(null);
    setFormName('');
    setFormEmail('');
    setFormNotes('');
  }, [direction]);

  const closeReasonLabel = useMemo(() => {
    if (!lastCloseReason) {
      return specimenT('common.studio.sheetReasonNone');
    }
    const reasonMap: Record<SheetCloseReason, TranslationKey> = {
      escape: 'common.studio.sheetReasonEscape',
      backdrop: 'common.studio.sheetReasonBackdrop',
      'close-button': 'common.studio.sheetReasonCloseButton',
      programmatic: 'common.studio.sheetReasonProgrammatic',
    };
    return specimenT(reasonMap[lastCloseReason]);
  }, [lastCloseReason, specimenT]);

  const panelTitle = useMemo(() => {
    if (scenario === 'form') return specimenT('common.studio.sheetPanelHeadingForm');
    if (scenario === 'navigation') return specimenT('common.studio.sheetPanelHeadingNavigation');
    return specimenT('common.studio.sheetPanelHeadingDetails');
  }, [scenario, specimenT]);

  const panelDesc = useMemo(() => {
    if (scenario === 'form') return specimenT('common.studio.sheetPanelDescForm');
    if (scenario === 'navigation') return specimenT('common.studio.sheetPanelDescNavigation');
    return specimenT('common.studio.sheetPanelDescDetails');
  }, [scenario, specimenT]);

  const jsxCode = useMemo(() => {
    const propsLines = [
      '  open={open}',
      '  onOpenChange={(nextOpen) => setOpen(nextOpen)}',
      `  side="${side}"`,
      `  size="${size}"`,
      `  returnFocusRef={triggerRef}`,
    ];
    if (showCloseButton) {
      propsLines.push('  showCloseButton');
      propsLines.push(`  closeLabel="${specimenT('common.studio.sheetCloseAriaLabel')}"`);
    }
    if (!closeOnBackdropClick) {
      propsLines.push('  closeOnBackdropClick={false}');
    }
    if (preventEscapeClose) {
      propsLines.push('  preventEscapeClose');
    }
    if (scenario === 'form') {
      propsLines.push('  initialFocusRef={nameInputRef}');
    }

    return [
      `<Sheet`,
      ...propsLines,
      `>`,
      `  <SheetHeader>`,
      `    <SheetTitle>${panelTitle}</SheetTitle>`,
      `    <SheetDescription>${panelDesc}</SheetDescription>`,
      `  </SheetHeader>`,
      `  <SheetBody>{/* Drawer content */}</SheetBody>`,
      `  <SheetFooter>`,
      `    <Button variant="primary" onClick={() => setOpen(false)}>`,
      `      ${specimenT(scenario === 'form' ? 'common.studio.sheetActionSave' : 'common.studio.sheetActionDone')}`,
      `    </Button>`,
      `  </SheetFooter>`,
      `</Sheet>`,
    ].join('\n');
  }, [
    side,
    size,
    showCloseButton,
    closeOnBackdropClick,
    preventEscapeClose,
    scenario,
    panelTitle,
    panelDesc,
    specimenT,
  ]);

  const aiPrompt = useMemo(
    () =>
      `Build a modal Sheet drawer anchored to side="${side}" with size="${size}" (${SIZE_PIXELS[size]}), showCloseButton=${showCloseButton}, closeOnBackdropClick=${closeOnBackdropClick}, preventEscapeClose=${preventEscapeClose}, logical RTL slide transitions, ref-counted body scroll lock, and trigger focus restoration via returnFocusRef.`,
    [side, size, showCloseButton, closeOnBackdropClick, preventEscapeClose],
  );

  const specGroups: StudioSpecGroup[] = useMemo(
    () => [
      {
        title: t('common.studio.sheetSpecGroupAnatomy'),
        items: [
          { label: t('common.studio.sheetSpecLayer'), value: t('common.studio.sheetSpecLayerVal') },
          {
            label: t('common.studio.sheetSpecBackdrop'),
            value: t('common.studio.sheetSpecBackdropVal'),
          },
          { label: t('common.studio.sheetSpecFocus'), value: t('common.studio.sheetSpecFocusVal') },
          {
            label: t('common.studio.sheetSpecScrollLock'),
            value: t('common.studio.sheetSpecScrollLockVal'),
          },
        ],
      },
      {
        title: t('common.studio.sheetSpecGroupDimensions'),
        items: [
          {
            label: t('common.studio.sheetSpecSizeToken'),
            value: `${size} (${SIZE_PIXELS[size]})`,
          },
          {
            label: t('common.studio.sheetSideLabel'),
            value: side,
          },
          {
            label: t('common.studio.sheetSpecMotion'),
            value: t('common.studio.sheetSpecMotionVal'),
          },
        ],
      },
    ],
    [side, size, t],
  );

  const closeSheetProgrammatic = () => {
    setOpen(false);
    setLastCloseReason('programmatic');
  };

  return (
    <GalleryStudioLayout
      activeRoute="sheet"
      title={t('common.studio.sheetTitle')}
      subtitle={t('common.studio.sheetSubtitle')}
      testId="sheet-studio"
      previewDir={specimenDir}
      onReset={handleReset}
      linkComponent={linkComponent}
      controls={
        <>
          <StudioSegmentedControl<'ltr' | 'rtl'>
            label={t('common.studio.specimenDirectionLabel')}
            value={specimenDir}
            columns={2}
            onChange={setSpecimenDir}
            options={[
              {
                value: 'ltr',
                label: t('common.studio.specimenDirLtr'),
                testId: 'sheet-dir-ltr',
              },
              {
                value: 'rtl',
                label: t('common.studio.specimenDirRtl'),
                testId: 'sheet-dir-rtl',
              },
            ]}
          />

          <StudioSegmentedControl<SheetSide>
            label={t('common.studio.sheetSideLabel')}
            value={side}
            columns={2}
            onChange={setSide}
            options={[
              {
                value: 'inline-end',
                label: t('common.studio.sheetSideInlineEnd'),
                testId: 'sheet-side-inline-end',
              },
              {
                value: 'inline-start',
                label: t('common.studio.sheetSideInlineStart'),
                testId: 'sheet-side-inline-start',
              },
              {
                value: 'top',
                label: t('common.studio.sheetSideTop'),
                testId: 'sheet-side-top',
              },
              {
                value: 'bottom',
                label: t('common.studio.sheetSideBottom'),
                testId: 'sheet-side-bottom',
              },
            ]}
          />

          <StudioSegmentedControl<SheetSize>
            label={t('common.studio.sheetSizeLabel')}
            value={size}
            columns={2}
            onChange={setSize}
            options={[
              { value: 'sm', label: t('common.studio.sheetSizeSm'), testId: 'sheet-size-sm' },
              { value: 'md', label: t('common.studio.sheetSizeMd'), testId: 'sheet-size-md' },
              { value: 'lg', label: t('common.studio.sheetSizeLg'), testId: 'sheet-size-lg' },
              { value: 'xl', label: t('common.studio.sheetSizeXl'), testId: 'sheet-size-xl' },
              {
                value: 'full',
                label: t('common.studio.sheetSizeFull'),
                testId: 'sheet-size-full',
              },
            ]}
          />

          <StudioSegmentedControl<SheetScenario>
            label={t('common.studio.sheetContentLabel')}
            value={scenario}
            columns={3}
            onChange={setScenario}
            options={[
              {
                value: 'details',
                label: t('common.studio.sheetScenarioDetails'),
                testId: 'sheet-scenario-details',
              },
              {
                value: 'form',
                label: t('common.studio.sheetScenarioForm'),
                testId: 'sheet-scenario-form',
              },
              {
                value: 'navigation',
                label: t('common.studio.sheetScenarioNavigation'),
                testId: 'sheet-scenario-navigation',
              },
            ]}
          />

          <StudioToggleRow
            label={t('common.studio.sheetShowCloseBtn')}
            checked={showCloseButton}
            onCheckedChange={setShowCloseButton}
            testId="sheet-toggle-close-btn"
          />

          <StudioToggleRow
            label={t('common.studio.sheetBackdropLabel')}
            checked={closeOnBackdropClick}
            onCheckedChange={setCloseOnBackdropClick}
            testId="sheet-toggle-backdrop"
          />

          <StudioToggleRow
            label={t('common.studio.sheetPreventEscape')}
            checked={preventEscapeClose}
            onCheckedChange={setPreventEscapeClose}
            testId="sheet-toggle-prevent-escape"
          />
        </>
      }
      inspector={
        <GalleryCodeInspector
          aiPrompt={aiPrompt}
          jsxCode={jsxCode}
          cssCode={null}
          cssFileName="sheet.module.css"
          jsxFileName="sheet-example.tsx"
          specGroups={specGroups}
        />
      }
    >
      <div
        className={styles.stageWrapper}
        data-testid="sheet-canvas"
        dir={specimenDir}
        lang={specimenLangAttr}
      >
        <div className={styles.triggerCard}>
          <h2 className={styles.triggerTitle}>{specimenT('common.studio.sheetTitle')}</h2>
          <p className={styles.triggerDesc}>{specimenT('common.studio.sheetCardDesc')}</p>

          <div className={styles.triggerAction}>
            <Button
              ref={triggerRef}
              variant="primary"
              onClick={() => setOpen(true)}
              data-testid="open-sheet-btn"
            >
              {specimenT('common.studio.sheetOpenTrigger')}
            </Button>
          </div>

          <div className={styles.statusRow}>
            <span
              className={cn(styles.statusPill, open && styles.statusPillOpen)}
              data-testid="sheet-status"
            >
              {open
                ? specimenT('common.studio.sheetStatusOpen')
                : specimenT('common.studio.sheetStatusClosed')}
            </span>
            <span className={styles.reasonText} data-testid="sheet-close-reason">
              {specimenT('common.studio.sheetLastClosedReason')}: {closeReasonLabel}
            </span>
          </div>
        </div>
      </div>

      <Sheet
        data-testid="specimen-sheet"
        dir={specimenDir}
        lang={specimenLangAttr}
        open={open}
        onOpenChange={(nextOpen, details) => {
          setOpen(nextOpen);
          if (!nextOpen && details) {
            setLastCloseReason(details.reason);
          }
        }}
        side={side}
        size={size}
        closeOnBackdropClick={closeOnBackdropClick}
        preventEscapeClose={preventEscapeClose}
        returnFocusRef={triggerRef}
        initialFocusRef={scenario === 'form' ? nameInputRef : undefined}
        {...(showCloseButton
          ? {
              showCloseButton: true as const,
              closeLabel: specimenT('common.studio.sheetCloseAriaLabel'),
            }
          : { showCloseButton: false as const })}
      >
        <SheetHeader>
          <SheetTitle>{panelTitle}</SheetTitle>
          <SheetDescription>{panelDesc}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {scenario === 'details' && (
            <div className={styles.detailsStack} data-testid="sheet-body-details">
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  {specimenT('common.studio.sheetDetailsItemName')}
                </span>
                <span className={styles.metaValue}>
                  {specimenT('common.studio.sheetDetailsItemNameVal')}
                </span>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  {specimenT('common.studio.sheetDetailsItemStatus')}
                </span>
                <Badge variant="success">
                  {specimenT('common.studio.sheetDetailsItemStatusVal')}
                </Badge>
              </div>
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>
                  {specimenT('common.studio.sheetDetailsItemOwner')}
                </span>
                <span className={styles.metaValue}>
                  {specimenT('common.studio.sheetDetailsItemOwnerVal')}
                </span>
              </div>
              <div className={styles.summaryBox}>
                <p className={styles.summaryTitle}>
                  {specimenT('common.studio.sheetDetailsItemSummary')}
                </p>
                <p className={styles.summaryBody}>
                  {specimenT('common.studio.sheetDetailsItemSummaryVal')}
                </p>
              </div>
            </div>
          )}

          {scenario === 'form' && (
            <form
              className={styles.formGrid}
              data-testid="sheet-body-form"
              onSubmit={(e) => {
                e.preventDefault();
                closeSheetProgrammatic();
              }}
            >
              <div className={styles.fieldGroup}>
                <Label htmlFor={nameFieldId}>{specimenT('common.studio.sheetFormFieldName')}</Label>
                <Input
                  ref={nameInputRef}
                  id={nameFieldId}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={specimenT('common.studio.sheetFormFieldNamePlaceholder')}
                  data-testid="sheet-form-name"
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor={emailFieldId}>
                  {specimenT('common.studio.sheetFormFieldEmail')}
                </Label>
                <Input
                  id={emailFieldId}
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder={specimenT('common.studio.sheetFormFieldEmailPlaceholder')}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor={notesFieldId}>
                  {specimenT('common.studio.sheetFormFieldNotes')}
                </Label>
                <Input
                  id={notesFieldId}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={specimenT('common.studio.sheetFormFieldNotesPlaceholder')}
                />
              </div>
            </form>
          )}

          {scenario === 'navigation' && (
            <nav
              className={styles.navList}
              aria-label={specimenT('common.studio.sheetPanelHeadingNavigation')}
              data-testid="sheet-body-navigation"
            >
              {(
                [
                  'common.studio.sheetNavOverview',
                  'common.studio.sheetNavAnalytics',
                  'common.studio.sheetNavMembers',
                  'common.studio.sheetNavSettings',
                  'common.studio.sheetNavAuditLog',
                ] as const
              ).map((navKey, idx) => (
                <button
                  key={navKey}
                  type="button"
                  className={cn(styles.navItem, idx === 0 && styles.navItemActive)}
                  onClick={closeSheetProgrammatic}
                >
                  <span className={styles.navItemLabel}>{specimenT(navKey)}</span>
                  <BidiText dir="ltr" className={styles.navItemIndex}>
                    0{idx + 1}
                  </BidiText>
                </button>
              ))}
              <p className={styles.navHint}>{specimenT('common.studio.sheetNavHelpText')}</p>
            </nav>
          )}
        </SheetBody>

        <SheetFooter>
          <Button variant="ghost" onClick={closeSheetProgrammatic} data-testid="sheet-cancel-btn">
            {specimenT('common.studio.sheetActionCancel')}
          </Button>
          <Button
            variant="primary"
            onClick={closeSheetProgrammatic}
            data-testid="sheet-primary-action-btn"
          >
            {specimenT(
              scenario === 'form'
                ? 'common.studio.sheetActionSave'
                : 'common.studio.sheetActionDone',
            )}
          </Button>
        </SheetFooter>
      </Sheet>
    </GalleryStudioLayout>
  );
}

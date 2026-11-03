'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogSize,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './dialog-gallery.module.css';

export function DialogGallery() {
  const { t } = useI18n();

  // 1. Basic Dialog
  const [basicOpen, setBasicOpen] = useState(false);
  const [basicSavedStatus, setBasicSavedStatus] = useState<string | null>(null);
  const basicTitleId = useId();
  const basicDescId = useId();

  // 2. Destructive Confirmation Dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const confirmCancelRef = useRef<HTMLButtonElement>(null);
  const confirmTitleId = useId();
  const confirmDescId = useId();

  // 3. Form Dialog
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formStatus, setFormStatus] = useState<string>('');
  const formTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formTitleId = useId();
  const formDescId = useId();

  // 4. Nested Select Dialog
  const [nestedOpen, setNestedOpen] = useState(false);
  const [nestedRegion, setNestedRegion] = useState('');
  const nestedTitleId = useId();
  const nestedDescId = useId();

  // 5. Long Content Dialog
  const [longOpen, setLongOpen] = useState(false);
  const longTitleId = useId();
  const longDescId = useId();

  // 6. Sizing Dialogs
  const [activeSize, setActiveSize] = useState<DialogSize | null>(null);
  const sizeTitleId = useId();
  const sizeDescId = useId();

  // 7. Backdrop & Close Button Dialogs
  const [backdropOpen, setBackdropOpen] = useState(false);
  const backdropTitleId = useId();
  const backdropDescId = useId();

  const [closeBtnOpen, setCloseBtnOpen] = useState(false);
  const closeBtnTitleId = useId();
  const closeBtnDescId = useId();

  // 8. Pending Save / Non-Dismissible Dialog
  const [pendingOpen, setPendingOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string>('');
  const pendingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTitleId = useId();
  const pendingDescId = useId();

  // 9. Asymmetric Focus Restoration
  const [rowDeleted, setRowDeleted] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const fallbackHeadingRef = useRef<HTMLHeadingElement>(null);
  const deleteTitleId = useId();
  const deleteDescId = useId();

  const handleCancelForm = useCallback(() => {
    if (formTimerRef.current) clearTimeout(formTimerRef.current);
    setFormOpen(false);
    setFormStatus(t('common.dialogGallery.formEventReset'));
  }, [t]);

  const handleFormSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!formName.trim() || !formRole) {
        setFormStatus(t('common.dialogGallery.formEventError'));
        return;
      }
      setFormStatus(t('common.dialogGallery.formEventPending'));
      if (formTimerRef.current) clearTimeout(formTimerRef.current);
      formTimerRef.current = setTimeout(() => {
        setFormStatus(t('common.dialogGallery.formEventSuccess'));
        setFormOpen(false);
      }, 500);
    },
    [formName, formRole, t],
  );

  const handleStartMigration = useCallback(() => {
    setIsPending(true);
    setPendingStatus(t('common.dialogGallery.migrationPendingStatus'));

    if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    pendingTimerRef.current = setTimeout(() => {
      setIsPending(false);
      setPendingStatus(t('common.dialogGallery.migrationCompleteStatus'));
    }, 1500);
  }, [t]);

  const handleDeleteResource = useCallback(() => {
    setRowDeleted(true);
    setDeleteDialogOpen(false);
    // Explicit fallback target when invoking trigger was removed
    setTimeout(() => {
      fallbackHeadingRef.current?.focus();
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (formTimerRef.current) clearTimeout(formTimerRef.current);
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    };
  }, []);

  return (
    <div className={styles.galleryContainer} data-testid="dialog-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.dialogGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.dialogGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Basic Modal */}
      <section className={styles.section} aria-labelledby="section-overview">
        <h2 id="section-overview" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionOverviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionOverviewDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="basic-dialog-trigger"
            onClick={() => setBasicOpen(true)}
          >
            {t('common.dialogGallery.openBasicDialog')}
          </Button>
        </div>

        {basicSavedStatus && (
          <div className={styles.statusRow} data-testid="basic-status-row">
            <span className={styles.statusBadge}>
              {t('common.dialogGallery.basicPolicyStatusPrefix')}
            </span>
            <span className={styles.statusText}>{basicSavedStatus}</span>
          </div>
        )}

        <Dialog
          open={basicOpen}
          onOpenChange={(open) => setBasicOpen(open)}
          aria-labelledby={basicTitleId}
          aria-describedby={basicDescId}
          data-testid="basic-dialog"
        >
          <DialogHeader>
            <DialogTitle id={basicTitleId}>
              {t('common.dialogGallery.basicDialogTitle')}
            </DialogTitle>
            <DialogDescription id={basicDescId}>
              {t('common.dialogGallery.basicDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>{t('common.dialogGallery.basicDialogBody')}</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              data-testid="basic-dialog-cancel-btn"
              onClick={() => setBasicOpen(false)}
            >
              {t('common.dialogGallery.cancelButton')}
            </Button>
            <Button
              variant="primary"
              data-testid="basic-dialog-save-btn"
              onClick={() => {
                setBasicSavedStatus(t('common.dialogGallery.basicSavedNotification'));
                setBasicOpen(false);
              }}
            >
              {t('common.dialogGallery.saveChangesButton')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 2. Destructive Confirmation & Focus Targeting */}
      <section className={styles.section} aria-labelledby="section-confirmation">
        <h2 id="section-confirmation" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionConfirmationTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionConfirmationDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            variant="danger"
            data-testid="confirmation-dialog-trigger"
            onClick={() => setConfirmOpen(true)}
          >
            {t('common.dialogGallery.openConfirmationDialog')}
          </Button>
        </div>

        <Dialog
          open={confirmOpen}
          onOpenChange={(open) => setConfirmOpen(open)}
          initialFocusRef={confirmCancelRef}
          aria-labelledby={confirmTitleId}
          aria-describedby={confirmDescId}
          data-testid="confirmation-dialog"
        >
          <DialogHeader>
            <DialogTitle id={confirmTitleId}>
              {t('common.dialogGallery.confirmationDialogTitle')}
            </DialogTitle>
            <DialogDescription id={confirmDescId}>
              {t('common.dialogGallery.confirmationDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              ref={confirmCancelRef}
              variant="secondary"
              data-testid="confirm-cancel-btn"
              onClick={() => setConfirmOpen(false)}
            >
              {t('common.dialogGallery.cancelButton')}
            </Button>
            <Button
              variant="danger"
              data-testid="confirm-delete-btn"
              onClick={() => setConfirmOpen(false)}
            >
              {t('common.dialogGallery.confirmDeleteButton')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 3. Form Submission & Input Validation */}
      <section className={styles.section} aria-labelledby="section-form">
        <h2 id="section-form" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionFormTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionFormDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="form-dialog-trigger"
            onClick={() => {
              setFormStatus('');
              setFormOpen(true);
            }}
          >
            {t('common.dialogGallery.openFormDialog')}
          </Button>
        </div>
        {formStatus && (
          <div className={styles.statusCard}>
            <span className={styles.statusLabel}>Status</span>
            <p className={styles.statusText} data-testid="form-status-text">
              {formStatus}
            </p>
          </div>
        )}

        <Dialog
          open={formOpen}
          onOpenChange={(open) => {
            if (!open && formTimerRef.current) {
              clearTimeout(formTimerRef.current);
            }
            setFormOpen(open);
          }}
          aria-labelledby={formTitleId}
          aria-describedby={formDescId}
          data-testid="form-dialog"
        >
          <form onSubmit={handleFormSubmit} data-testid="dialog-form">
            <DialogHeader>
              <DialogTitle id={formTitleId}>
                {t('common.dialogGallery.formDialogTitle')}
              </DialogTitle>
              <DialogDescription id={formDescId}>
                {t('common.dialogGallery.formDialogDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className={styles.fieldRow}>
                <label htmlFor="form-member-name" className={styles.label}>
                  {t('common.dialogGallery.formNameLabel')}
                </label>
                <Input
                  id="form-member-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder={t('common.dialogGallery.formNamePlaceholder')}
                  data-testid="form-name-input"
                  required
                />
              </div>
              <div className={styles.fieldRow}>
                <label htmlFor="form-member-role" className={styles.label}>
                  {t('common.dialogGallery.formRoleLabel')}
                </label>
                <Select
                  id="form-member-role"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  data-testid="form-role-select"
                  required
                >
                  <option value="">{t('common.dialogGallery.formRoleSelectPrompt')}</option>
                  <option value="admin">{t('common.dialogGallery.formRoleAdmin')}</option>
                  <option value="editor">{t('common.dialogGallery.formRoleEditor')}</option>
                  <option value="viewer">{t('common.dialogGallery.formRoleViewer')}</option>
                </Select>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                data-testid="form-cancel-btn"
                onClick={handleCancelForm}
              >
                {t('common.dialogGallery.cancelButton')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                data-testid="form-submit-btn"
              >
                {t('common.dialogGallery.formSubmitButton')}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </section>

      {/* 4. Nested Overlay Integration (Select in Dialog) */}
      <section className={styles.section} aria-labelledby="section-nested">
        <h2 id="section-nested" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionNestedOverlayTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionNestedOverlayDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="nested-select-dialog-trigger"
            onClick={() => setNestedOpen(true)}
          >
            {t('common.dialogGallery.openNestedSelectDialog')}
          </Button>
        </div>

        <Dialog
          open={nestedOpen}
          onOpenChange={(open) => setNestedOpen(open)}
          aria-labelledby={nestedTitleId}
          aria-describedby={nestedDescId}
          data-testid="nested-select-dialog"
        >
          <DialogHeader>
            <DialogTitle id={nestedTitleId}>
              {t('common.dialogGallery.nestedSelectDialogTitle')}
            </DialogTitle>
            <DialogDescription id={nestedDescId}>
              {t('common.dialogGallery.nestedSelectDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className={styles.fieldRow}>
              <label htmlFor="nested-region-select" className={styles.label}>
                {t('common.dialogGallery.nestedSelectLabel')}
              </label>
              <Select
                id="nested-region-select"
                value={nestedRegion}
                onChange={(e) => setNestedRegion(e.target.value)}
                data-testid="nested-select-element"
              >
                <option value="">{t('common.dialogGallery.nestedSelectPrompt')}</option>
                <option value="us-east">{t('common.dialogGallery.nestedRegionUsEast')}</option>
                <option value="eu-central">{t('common.dialogGallery.nestedRegionEuCentral')}</option>
                <option value="ap-south">{t('common.dialogGallery.nestedRegionApSouth')}</option>
              </Select>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              data-testid="nested-dialog-close-btn"
              onClick={() => setNestedOpen(false)}
            >
              {t('common.dialogGallery.closeButtonLabel')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 5. Long Content & Scroll Containment */}
      <section className={styles.section} aria-labelledby="section-long">
        <h2 id="section-long" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionLongContentTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionLongContentDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="long-dialog-trigger"
            onClick={() => setLongOpen(true)}
          >
            {t('common.dialogGallery.openLongDialog')}
          </Button>
        </div>

        <Dialog
          open={longOpen}
          onOpenChange={(open) => setLongOpen(open)}
          aria-labelledby={longTitleId}
          aria-describedby={longDescId}
          data-testid="long-dialog"
        >
          <DialogHeader>
            <DialogTitle id={longTitleId}>
              {t('common.dialogGallery.longDialogTitle')}
            </DialogTitle>
            <DialogDescription id={longDescId}>
              {t('common.dialogGallery.longDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody data-testid="long-dialog-body">
            <div className={styles.longContentBody}>
              {Array.from({ length: 15 }, (_, i) => {
                const clauseKey = `common.dialogGallery.termsClause${i + 1}` as const;
                return <p key={i}>{t(clauseKey as any)}</p>;
              })}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="primary"
              data-testid="long-dialog-accept-btn"
              onClick={() => setLongOpen(false)}
            >
              {t('common.dialogGallery.closeButtonLabel')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 6. Sizing Scale Matrix */}
      <section className={styles.section} aria-labelledby="section-sizing">
        <h2 id="section-sizing" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionSizingTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionSizingDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="size-trigger-sm"
            onClick={() => setActiveSize('sm')}
          >
            {t('common.dialogGallery.openSizeSm')}
          </Button>
          <Button
            data-testid="size-trigger-md"
            onClick={() => setActiveSize('md')}
          >
            {t('common.dialogGallery.openSizeMd')}
          </Button>
          <Button
            data-testid="size-trigger-lg"
            onClick={() => setActiveSize('lg')}
          >
            {t('common.dialogGallery.openSizeLg')}
          </Button>
          <Button
            data-testid="size-trigger-xl"
            onClick={() => setActiveSize('xl')}
          >
            {t('common.dialogGallery.openSizeXl')}
          </Button>
          <Button
            data-testid="size-trigger-full"
            onClick={() => setActiveSize('full')}
          >
            {t('common.dialogGallery.openSizeFull')}
          </Button>
        </div>

        {activeSize && (
          <Dialog
            open={Boolean(activeSize)}
            onOpenChange={() => setActiveSize(null)}
            size={activeSize}
            aria-labelledby={sizeTitleId}
            aria-describedby={sizeDescId}
            data-testid={`dialog-size-${activeSize}`}
          >
            <DialogHeader>
              <DialogTitle id={sizeTitleId}>
                {t('common.dialogGallery.sizeSpecimenTitle')} ({activeSize.toUpperCase()})
              </DialogTitle>
              <DialogDescription id={sizeDescId}>
                {t('common.dialogGallery.sizeSpecimenDesc')}
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p>Active size prop: {activeSize}</p>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setActiveSize(null)}
              >
                {t('common.dialogGallery.closeButtonLabel')}
              </Button>
            </DialogFooter>
          </Dialog>
        )}
      </section>

      {/* 7. Backdrop Dismissal & Optional Close Button */}
      <section className={styles.section} aria-labelledby="section-backdrop">
        <h2 id="section-backdrop" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionBackdropTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionBackdropDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="backdrop-dialog-trigger"
            onClick={() => setBackdropOpen(true)}
          >
            {t('common.dialogGallery.openBackdropDialog')}
          </Button>
          <Button
            data-testid="close-button-dialog-trigger"
            onClick={() => setCloseBtnOpen(true)}
          >
            {t('common.dialogGallery.openCloseButtonDialog')}
          </Button>
        </div>

        {/* Backdrop Dismissible Dialog */}
        <Dialog
          open={backdropOpen}
          onOpenChange={(open) => setBackdropOpen(open)}
          closeOnBackdropClick={true}
          aria-labelledby={backdropTitleId}
          aria-describedby={backdropDescId}
          data-testid="backdrop-dialog"
        >
          <DialogHeader>
            <DialogTitle id={backdropTitleId}>
              {t('common.dialogGallery.backdropDialogTitle')}
            </DialogTitle>
            <DialogDescription id={backdropDescId}>
              {t('common.dialogGallery.backdropDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>Click outside the dialog box on the backdrop scrim to dismiss.</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              data-testid="backdrop-dialog-close-btn"
              onClick={() => setBackdropOpen(false)}
            >
              {t('common.dialogGallery.closeButtonLabel')}
            </Button>
          </DialogFooter>
        </Dialog>

        {/* Top-Corner Close Button Dialog */}
        <Dialog
          open={closeBtnOpen}
          onOpenChange={(open) => setCloseBtnOpen(open)}
          showCloseButton={true}
          closeLabel={t('common.dialogGallery.closeButtonLabel')}
          aria-labelledby={closeBtnTitleId}
          aria-describedby={closeBtnDescId}
          data-testid="close-button-dialog"
        >
          <DialogHeader>
            <DialogTitle id={closeBtnTitleId}>
              Top-Corner "X" Close Button Specimen
            </DialogTitle>
            <DialogDescription id={closeBtnDescId}>
              Uses caller-supplied accessible label and type="button" safety.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>The "X" button in the corner triggers dismissal with reason "close-button".</p>
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setCloseBtnOpen(false)}
            >
              {t('common.dialogGallery.closeButtonLabel')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 8. Pending Operation & Escape Guard */}
      <section className={styles.section} aria-labelledby="section-pending">
        <h2 id="section-pending" className={styles.sectionTitle}>
          {t('common.dialogGallery.sectionPendingSaveTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionPendingSaveDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            data-testid="pending-dialog-trigger"
            onClick={() => {
              setIsPending(false);
              setPendingStatus('');
              setPendingOpen(true);
            }}
          >
            {t('common.dialogGallery.openPendingSaveDialog')}
          </Button>
        </div>

        <Dialog
          open={pendingOpen}
          onOpenChange={(open) => setPendingOpen(open)}
          preventEscapeClose={isPending}
          aria-labelledby={pendingTitleId}
          aria-describedby={pendingDescId}
          data-testid="pending-dialog"
        >
          <DialogHeader>
            <DialogTitle id={pendingTitleId}>
              {t('common.dialogGallery.pendingSaveDialogTitle')}
            </DialogTitle>
            <DialogDescription id={pendingDescId}>
              {t('common.dialogGallery.pendingSaveDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p>{t('common.dialogGallery.pendingSaveBody')}</p>
            {pendingStatus && (
              <p data-testid="pending-status-text" className={styles.statusText}>
                {pendingStatus}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button
              variant="secondary"
              disabled={isPending}
              data-testid="pending-cancel-btn"
              onClick={() => setPendingOpen(false)}
            >
              {t('common.dialogGallery.cancelButton')}
            </Button>
            <Button
              variant="primary"
              disabled={isPending}
              data-testid="pending-start-btn"
              onClick={handleStartMigration}
            >
              {t('common.dialogGallery.startSaveButton')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>

      {/* 9. Asymmetric Focus Restoration */}
      <section className={styles.section} aria-labelledby="section-asymmetric">
        <h2
          ref={fallbackHeadingRef}
          id="section-asymmetric"
          tabIndex={-1}
          className={styles.sectionTitle}
          data-testid="fallback-table-heading"
        >
          {t('common.dialogGallery.sectionFocusRestoreTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dialogGallery.sectionFocusRestoreDesc')}</p>

        {!rowDeleted ? (
          <table className={styles.table} data-testid="resource-table">
            <thead>
              <tr>
                <th className={styles.th}>{t('common.dialogGallery.tableHeaderItem')}</th>
                <th className={styles.th}>{t('common.dialogGallery.tableHeaderAction')}</th>
              </tr>
            </thead>
            <tbody>
              <tr data-testid="table-resource-row">
                <td className={styles.td}>{t('common.dialogGallery.tableResourceName')}</td>
                <td className={styles.td}>
                  <Button
                    variant="danger"
                    data-testid="delete-row-trigger-btn"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    {t('common.dialogGallery.deleteRowButton')}
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          <div className={styles.statusCard}>
            <p data-testid="row-deleted-msg" className={styles.statusText}>
              {t('common.dialogGallery.rowDeletedMessage')}
            </p>
          </div>
        )}

        <Dialog
          open={deleteDialogOpen}
          onOpenChange={(open) => setDeleteDialogOpen(open)}
          aria-labelledby={deleteTitleId}
          aria-describedby={deleteDescId}
          data-testid="delete-row-dialog"
        >
          <DialogHeader>
            <DialogTitle id={deleteTitleId}>
              {t('common.dialogGallery.confirmationDialogTitle')}
            </DialogTitle>
            <DialogDescription id={deleteDescId}>
              {t('common.dialogGallery.confirmationDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteDialogOpen(false)}
            >
              {t('common.dialogGallery.cancelButton')}
            </Button>
            <Button
              variant="danger"
              data-testid="confirm-row-delete-btn"
              onClick={handleDeleteResource}
            >
              {t('common.dialogGallery.confirmDeleteButton')}
            </Button>
          </DialogFooter>
        </Dialog>
      </section>
    </div>
  );
}

'use client';

import { useId, useState } from 'react';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverBody,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Radio } from '@/components/ui/radio';
import { Select } from '@/components/ui/select';
import { useI18n } from '@/providers';
import { LanguageSwitcher } from '../language-switcher';
import { ThemeSwitcher } from '../theme-switcher';
import styles from './popover-gallery.module.css';

export function PopoverGallery() {
  const { t } = useI18n();
  const baseId = useId();

  // Specimen 2: Filter Form State
  const [selectedEnv, setSelectedEnv] = useState('production');
  const [appliedEnv, setAppliedEnv] = useState('production');

  // Specimen 5: Outside Click Counter
  const [outsideCounter, setOutsideCounter] = useState(0);

  // Specimen 6: Controlled State & Rejection
  const [controlledOpen, setControlledOpen] = useState(false);
  const [persistedOpen, setPersistedOpen] = useState(false);

  // Specimen 8: Controlled Competing Popovers
  const [competingAOpen, setCompetingAOpen] = useState(false);
  const [competingBOpen, setCompetingBOpen] = useState(false);

  // Specimen 9: Modal Dialog with Inner Popover
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className={styles.galleryContainer} data-testid="popover-gallery">
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>{t('common.popoverGallery.title')}</h1>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
        <p className={styles.subtitle}>{t('common.popoverGallery.subtitle')}</p>
      </header>

      {/* 1. Overview & Basic Disclosure */}
      <section className={styles.section} aria-labelledby={`${baseId}-overview-title`}>
        <h2 id={`${baseId}-overview-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionOverviewTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionOverviewDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-basic-popover-btn">
                {t('common.popoverGallery.openBasicPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="basic-popover-content">
              <PopoverHeader>
                <PopoverTitle>{t('common.popoverGallery.basicPopoverHeading')}</PopoverTitle>
                <PopoverDescription>{t('common.popoverGallery.basicPopoverDesc')}</PopoverDescription>
              </PopoverHeader>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 2. Interactive Filter (role="dialog") */}
      <section className={styles.section} aria-labelledby={`${baseId}-filter-title`}>
        <h2 id={`${baseId}-filter-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionFilterTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionFilterDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover role="dialog">
            <PopoverTrigger asChild>
              <Button variant="primary" data-testid="open-filter-popover-btn">
                {t('common.popoverGallery.openFilterPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              role="dialog"
              aria-label={t('common.popoverGallery.filterPopoverTitle')}
              data-testid="filter-popover-content"
            >
              <PopoverHeader>
                <PopoverTitle>{t('common.popoverGallery.filterPopoverTitle')}</PopoverTitle>
                <PopoverDescription>{t('common.popoverGallery.filterPopoverDesc')}</PopoverDescription>
              </PopoverHeader>
              <PopoverBody>
                <fieldset className={styles.fieldset}>
                  <legend className={styles.legend}>
                    {t('common.popoverGallery.filterEnvLabel')}
                  </legend>
                  <div className={styles.fieldRow}>
                    <Radio
                      id={`${baseId}-env-prod`}
                      name={`${baseId}-env`}
                      value="production"
                      checked={selectedEnv === 'production'}
                      onChange={() => setSelectedEnv('production')}
                      data-testid="filter-env-prod-radio"
                    />
                    <label htmlFor={`${baseId}-env-prod`} className={styles.label}>
                      {t('common.popoverGallery.filterEnvProduction')}
                    </label>
                  </div>
                  <div className={styles.fieldRow}>
                    <Radio
                      id={`${baseId}-env-staging`}
                      name={`${baseId}-env`}
                      value="staging"
                      checked={selectedEnv === 'staging'}
                      onChange={() => setSelectedEnv('staging')}
                      data-testid="filter-env-staging-radio"
                    />
                    <label htmlFor={`${baseId}-env-staging`} className={styles.label}>
                      {t('common.popoverGallery.filterEnvStaging')}
                    </label>
                  </div>
                  <div className={styles.fieldRow}>
                    <Radio
                      id={`${baseId}-env-sandbox`}
                      name={`${baseId}-env`}
                      value="sandbox"
                      checked={selectedEnv === 'sandbox'}
                      onChange={() => setSelectedEnv('sandbox')}
                      data-testid="filter-env-sandbox-radio"
                    />
                    <label htmlFor={`${baseId}-env-sandbox`} className={styles.label}>
                      {t('common.popoverGallery.filterEnvSandbox')}
                    </label>
                  </div>
                </fieldset>
              </PopoverBody>
              <PopoverFooter>
                <PopoverClose asChild>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedEnv('production')}
                    data-testid="filter-reset-btn"
                  >
                    {t('common.popoverGallery.filterResetButton')}
                  </Button>
                </PopoverClose>
                <PopoverClose asChild>
                  <Button
                    variant="primary"
                    onClick={() => setAppliedEnv(selectedEnv)}
                    data-testid="filter-apply-btn"
                  >
                    {t('common.popoverGallery.filterApplyButton')}
                  </Button>
                </PopoverClose>
              </PopoverFooter>
            </PopoverContent>
          </Popover>

          <Popover role="dialog">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-disabled-first-popover-btn">
                {t('common.popoverGallery.openDisabledFirstPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              role="dialog"
              aria-label={t('common.popoverGallery.openDisabledFirstPopover')}
              data-testid="disabled-first-popover-content"
            >
              <PopoverBody>
                <div className={styles.dialogBodyContent}>
                  <Button
                    variant="secondary"
                    className={styles.hiddenAction}
                    data-testid="popover-hidden-first-btn"
                  >
                    {t('common.popoverGallery.disabledFirstAction')}
                  </Button>
                  <Button disabled variant="secondary" data-testid="popover-disabled-first-btn">
                    {t('common.popoverGallery.disabledFirstAction')}
                  </Button>
                  <Button variant="primary" data-testid="popover-enabled-second-btn">
                    {t('common.popoverGallery.enabledSecondAction')}
                  </Button>
                </div>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
        <div className={styles.statusCard}>
          <span className={styles.statusLabel}>{t('common.popoverGallery.filterAppliedStatus')}</span>
          <p className={styles.statusText} data-testid="applied-env-status">
            {appliedEnv}
          </p>
        </div>
      </section>

      {/* 3. Placement Matrix */}
      <section className={styles.section} aria-labelledby={`${baseId}-placement-title`}>
        <h2 id={`${baseId}-placement-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionPlacementTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionPlacementDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover placement="top">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="placement-top-btn">
                {t('common.popoverGallery.placementTop')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="placement-top-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.placementSurfaceText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Popover placement="bottom">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="placement-bottom-btn">
                {t('common.popoverGallery.placementBottom')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="placement-bottom-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.placementSurfaceText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Popover placement="inline-start">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="placement-inline-start-btn">
                {t('common.popoverGallery.placementInlineStart')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="placement-inline-start-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.placementSurfaceText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Popover placement="inline-end">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="placement-inline-end-btn">
                {t('common.popoverGallery.placementInlineEnd')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="placement-inline-end-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.placementSurfaceText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 4. Viewport Edge Collision & Auto-Flip */}
      <section className={styles.section} aria-labelledby={`${baseId}-collision-title`}>
        <h2 id={`${baseId}-collision-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionCollisionTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionCollisionDesc')}</p>
        <div className={styles.collisionContainer}>
          <Popover placement="bottom">
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-collision-popover-btn">
                {t('common.popoverGallery.openCollisionPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="collision-popover-content">
              <PopoverBody>
                <p className={styles.surfaceText}>
                  {t('common.popoverGallery.collisionPopoverText')}
                </p>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 5. Light Dismiss vs Manual Close */}
      <section className={styles.section} aria-labelledby={`${baseId}-light-dismiss-title`}>
        <h2 id={`${baseId}-light-dismiss-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionLightDismissTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionLightDismissDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-manual-close-popover-btn">
                {t('common.popoverGallery.openManualClosePopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="manual-close-popover-content">
              <PopoverHeader>
                <PopoverTitle>{t('common.popoverGallery.openManualClosePopover')}</PopoverTitle>
                <PopoverClose
                  closeLabel={t('common.popoverGallery.closeButtonLabel')}
                  data-testid="manual-popover-x-close-btn"
                />
              </PopoverHeader>
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.placementSurfaceText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Button
            variant="secondary"
            onClick={() => setOutsideCounter((c) => c + 1)}
            data-testid="outside-action-btn"
          >
            {t('common.popoverGallery.outsideActionBtn')} {outsideCounter}
          </Button>
        </div>
      </section>

      {/* 6. Controlled vs Uncontrolled Mode */}
      <section className={styles.section} aria-labelledby={`${baseId}-controlled-title`}>
        <h2 id={`${baseId}-controlled-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionControlledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionControlledDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            variant="secondary"
            onClick={() => setControlledOpen(!controlledOpen)}
            data-popover-toggle
            data-testid="external-toggle-controlled-btn"
          >
            {t('common.popoverGallery.externalToggleBtn')}
          </Button>

          <Popover open={controlledOpen} onOpenChange={setControlledOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="controlled-popover-trigger-btn">
                {t('common.popoverGallery.openBasicPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="controlled-popover-content">
              <PopoverBody>
                <p className={styles.surfaceText}>
                  {t('common.popoverGallery.controlledPopoverText')}
                </p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Popover
            open={persistedOpen}
            onOpenChange={() => {
              // Rejects native close requests: caller keeps state true
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="secondary"
                onClick={() => setPersistedOpen(true)}
                data-testid="open-persisted-popover-btn"
              >
                {t('common.popoverGallery.openPersistedPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="persisted-popover-content">
              <PopoverBody>
                <p className={styles.surfaceText}>
                  {t('common.popoverGallery.persistedPopoverText')}
                </p>
                <Button
                  variant="primary"
                  onClick={() => setPersistedOpen(false)}
                  data-testid="explicit-close-persisted-popover-btn"
                >
                  {t('common.popoverGallery.explicitDismissPersistedBtn')}
                </Button>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 7. Nested Select Integration */}
      <section className={styles.section} aria-labelledby={`${baseId}-nested-select-title`}>
        <h2 id={`${baseId}-nested-select-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionNestedSelectTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionNestedSelectDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-nested-select-popover-btn">
                {t('common.popoverGallery.openNestedSelectPopover')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="nested-select-popover-content">
              <PopoverHeader>
                <PopoverTitle>{t('common.popoverGallery.nestedSelectLabel')}</PopoverTitle>
              </PopoverHeader>
              <PopoverBody>
                <Select
                  id={`${baseId}-region-select`}
                  defaultValue="us-east"
                  data-testid="nested-region-select"
                  aria-label={t('common.popoverGallery.nestedSelectLabel')}
                >
                  <option value="us-east">{t('common.popoverGallery.nestedRegionUsEast')}</option>
                  <option value="eu-central">{t('common.popoverGallery.nestedRegionEuCentral')}</option>
                  <option value="ap-south">{t('common.popoverGallery.nestedRegionApSouth')}</option>
                </Select>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 8. Competing Popovers */}
      <section className={styles.section} aria-labelledby={`${baseId}-competing-title`}>
        <h2 id={`${baseId}-competing-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionCompetingTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionCompetingDesc')}</p>
        <div className={styles.buttonGrid}>
          <Popover open={competingAOpen} onOpenChange={setCompetingAOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-popover-alpha-btn">
                {t('common.popoverGallery.openPopoverA')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="popover-alpha-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.popoverAText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>

          <Popover open={competingBOpen} onOpenChange={setCompetingBOpen}>
            <PopoverTrigger asChild>
              <Button variant="secondary" data-testid="open-popover-beta-btn">
                {t('common.popoverGallery.openPopoverB')}
              </Button>
            </PopoverTrigger>
            <PopoverContent data-testid="popover-beta-content">
              <PopoverBody>
                <p className={styles.surfaceText}>{t('common.popoverGallery.popoverBText')}</p>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </div>
      </section>

      {/* 9. Popover Inside Modal Dialog */}
      <section className={styles.section} aria-labelledby={`${baseId}-inside-dialog-title`}>
        <h2 id={`${baseId}-inside-dialog-title`} className={styles.sectionTitle}>
          {t('common.popoverGallery.sectionInsideDialogTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.popoverGallery.sectionInsideDialogDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            variant="secondary"
            onClick={() => setDialogOpen(true)}
            data-testid="open-parent-dialog-btn"
          >
            {t('common.popoverGallery.openParentDialog')}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
            <DialogHeader>
              <DialogTitle>{t('common.popoverGallery.parentDialogTitle')}</DialogTitle>
              <DialogDescription>{t('common.popoverGallery.parentDialogDesc')}</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div className={styles.dialogBodyContent}>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="primary" data-testid="open-nested-popover-in-dialog-btn">
                      {t('common.popoverGallery.openNestedPopoverInDialog')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent data-testid="nested-popover-in-dialog-content">
                    <PopoverBody>
                      <p className={styles.surfaceText}>
                        {t('common.popoverGallery.nestedPopoverInDialogText')}
                      </p>
                    </PopoverBody>
                  </PopoverContent>
                </Popover>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                data-testid="close-parent-dialog-btn"
              >
                {t('common.popoverGallery.closeDialogButton')}
              </Button>
            </DialogFooter>
          </Dialog>
        </div>
      </section>
    </div>
  );
}

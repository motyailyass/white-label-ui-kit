'use client';

import React, { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import {
  Dropdown,
  DropdownContent,
  DropdownGroup,
  DropdownItem,
  DropdownLabel,
  DropdownSeparator,
  DropdownTrigger,
} from '@/components/ui/dropdown';
import { LanguageSwitcher } from '@/components/patterns/language-switcher';
import { ThemeSwitcher } from '@/components/patterns/theme-switcher';
import { useI18n } from '@/providers';
import styles from './dropdown-gallery.module.css';

export function DropdownGallery() {
  const { t } = useI18n();
  const baseId = useId();

  const [lastExecutedCommand, setLastExecutedCommand] = useState<string>('none');
  const [outsideActionCount, setOutsideActionCount] = useState<number>(0);

  // Controlled states
  const [controlledOpen, setControlledOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <main className={styles.galleryContainer} data-testid="dropdown-gallery">
      {/* Header */}
      <header className={styles.galleryHeader}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.title}>{t('common.dropdownGallery.title')}</h1>
            <p className={styles.subtitle}>{t('common.dropdownGallery.subtitle')}</p>
          </div>
          <div className={styles.controlsRow}>
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      {/* 1. Basic Action Menu */}
      <section className={styles.section} aria-labelledby={`${baseId}-basic-title`}>
        <h2 id={`${baseId}-basic-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionBasicTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionBasicDesc')}</p>
        <div className={styles.buttonGrid}>
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="open-basic-dropdown-btn">
                {t('common.dropdownGallery.triggerActions')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="basic-dropdown-content">
              <DropdownGroup>
                <DropdownLabel>Resource Commands</DropdownLabel>
                <DropdownItem
                  data-testid="item-edit"
                  shortcut="⌘E"
                  onSelect={() => setLastExecutedCommand('edit')}
                >
                  {t('common.dropdownGallery.itemEdit')}
                </DropdownItem>
                <DropdownItem
                  data-testid="item-duplicate"
                  shortcut="⌘D"
                  onSelect={() => setLastExecutedCommand('duplicate')}
                >
                  {t('common.dropdownGallery.itemDuplicate')}
                </DropdownItem>
                <DropdownItem
                  data-testid="item-archive"
                  onSelect={() => setLastExecutedCommand('archive')}
                >
                  {t('common.dropdownGallery.itemArchive')}
                </DropdownItem>
              </DropdownGroup>
              <DropdownSeparator />
              <DropdownGroup>
                <DropdownItem
                  variant="danger"
                  data-testid="item-delete"
                  shortcut="⌫"
                  onSelect={() => setLastExecutedCommand('delete')}
                >
                  {t('common.dropdownGallery.itemDelete')}
                </DropdownItem>
              </DropdownGroup>
            </DropdownContent>
          </Dropdown>

          <p className={styles.statusText} data-testid="executed-command-status">
            {t('common.dropdownGallery.actionExecuted')}{' '}
            <span className={styles.statusActive}>{lastExecutedCommand}</span>
          </p>
        </div>
      </section>

      {/* 2. Navigation Links & External Destinations */}
      <section className={styles.section} aria-labelledby={`${baseId}-links-title`}>
        <h2 id={`${baseId}-links-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionLinksTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionLinksDesc')}</p>
        <div className={styles.buttonGrid}>
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="open-links-dropdown-btn">
                {t('common.dropdownGallery.triggerNavigation')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="links-dropdown-content">
              <DropdownItem href="/dashboard" data-testid="link-dashboard">
                {t('common.dropdownGallery.linkDashboard')}
              </DropdownItem>
              <DropdownItem
                href="https://example.com/docs"
                target="_blank"
                data-testid="link-documentation"
              >
                {t('common.dropdownGallery.linkDocumentation')}
              </DropdownItem>
              <DropdownItem href="/settings" data-testid="link-settings">
                {t('common.dropdownGallery.linkSettings')}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </section>

      {/* 3. Disabled Items & Discovery */}
      <section className={styles.section} aria-labelledby={`${baseId}-disabled-title`}>
        <h2 id={`${baseId}-disabled-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionDisabledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionDisabledDesc')}</p>
        <div className={styles.buttonGrid}>
          <Dropdown>
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="open-disabled-dropdown-btn">
                {t('common.dropdownGallery.triggerDisabledDemo')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="disabled-dropdown-content">
              <DropdownItem
                data-testid="item-enabled-1"
                onSelect={() => setLastExecutedCommand('primary')}
              >
                {t('common.dropdownGallery.itemAvailablePrimary')}
              </DropdownItem>
              <DropdownItem
                disabled={true}
                data-testid="item-disabled"
                onSelect={() => setLastExecutedCommand('disabled-activated')}
              >
                {t('common.dropdownGallery.itemDisabledAction')}
              </DropdownItem>
              <DropdownItem
                data-testid="item-enabled-2"
                onSelect={() => setLastExecutedCommand('secondary')}
              >
                {t('common.dropdownGallery.itemAvailableSecondary')}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </section>

      {/* 4. Placement & Bidirectional Alignment */}
      <section className={styles.section} aria-labelledby={`${baseId}-placement-title`}>
        <h2 id={`${baseId}-placement-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionPlacementTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionPlacementDesc')}</p>
        <div className={styles.buttonGrid}>
          <Dropdown placement="bottom-start">
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="placement-bottom-start-btn">
                {t('common.dropdownGallery.placementBottomStart')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="placement-bottom-start-content">
              <DropdownItem>{t('common.dropdownGallery.itemEdit')}</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Dropdown placement="bottom-end">
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="placement-bottom-end-btn">
                {t('common.dropdownGallery.placementBottomEnd')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="placement-bottom-end-content">
              <DropdownItem>{t('common.dropdownGallery.itemEdit')}</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Dropdown placement="top-start">
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="placement-top-start-btn">
                {t('common.dropdownGallery.placementTopStart')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="placement-top-start-content">
              <DropdownItem>{t('common.dropdownGallery.itemEdit')}</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Dropdown placement="top-end">
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="placement-top-end-btn">
                {t('common.dropdownGallery.placementTopEnd')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="placement-top-end-content">
              <DropdownItem>{t('common.dropdownGallery.itemEdit')}</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </div>
      </section>

      {/* 5. Controlled vs Uncontrolled Mode & Outside Click */}
      <section className={styles.section} aria-labelledby={`${baseId}-controlled-title`}>
        <h2 id={`${baseId}-controlled-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionControlledTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionControlledDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            variant="secondary"
            onClick={() => setControlledOpen(!controlledOpen)}
            data-testid="external-toggle-controlled-btn"
          >
            {t('common.dropdownGallery.externalToggleBtn')}
          </Button>

          <Dropdown open={controlledOpen} onOpenChange={setControlledOpen}>
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="controlled-dropdown-trigger-btn">
                Controlled Menu
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="controlled-dropdown-content">
              <DropdownItem onSelect={() => setLastExecutedCommand('controlled-item')}>
                {t('common.dropdownGallery.controlledMenuText')}
              </DropdownItem>
            </DropdownContent>
          </Dropdown>

          {/* Locked Closed Menu (rejection test) */}
          <Dropdown
            open={false}
            onOpenChange={() => {
              // Rejects open requests: caller keeps state false
            }}
          >
            <DropdownTrigger asChild>
              <Button variant="secondary" data-testid="rejected-open-controlled-trigger-btn">
                {t('common.dropdownGallery.rejectionTrigger')}
              </Button>
            </DropdownTrigger>
            <DropdownContent data-testid="rejected-open-controlled-content">
              <DropdownItem>Should not be reached</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Button
            variant="secondary"
            data-testid="outside-action-btn"
            onClick={() => setOutsideActionCount((c) => c + 1)}
          >
            {t('common.dropdownGallery.outsideActionBtn')} {outsideActionCount}
          </Button>
        </div>
      </section>

      {/* 6. Dropdown Inside Modal Dialog */}
      <section className={styles.section} aria-labelledby={`${baseId}-dialog-title`}>
        <h2 id={`${baseId}-dialog-title`} className={styles.sectionTitle}>
          {t('common.dropdownGallery.sectionInsideDialogTitle')}
        </h2>
        <p className={styles.sectionDesc}>{t('common.dropdownGallery.sectionInsideDialogDesc')}</p>
        <div className={styles.buttonGrid}>
          <Button
            variant="primary"
            onClick={() => setDialogOpen(true)}
            data-testid="open-dialog-with-dropdown-btn"
          >
            {t('common.dropdownGallery.openDialogWithDropdown')}
          </Button>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen} size="md">
            <div data-testid="modal-dialog-surface">
              <h2>{t('common.dropdownGallery.dialogTitle')}</h2>
              <p>{t('common.dropdownGallery.dialogDesc')}</p>

              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <Dropdown>
                  <DropdownTrigger asChild>
                    <Button variant="secondary" data-testid="nested-dialog-dropdown-trigger-btn">
                      {t('common.dropdownGallery.triggerActions')}
                    </Button>
                  </DropdownTrigger>
                  <DropdownContent data-testid="nested-dialog-dropdown-content">
                    <DropdownItem
                      data-testid="nested-dialog-dropdown-item-edit"
                      onSelect={() => setLastExecutedCommand('dialog-edit')}
                    >
                      {t('common.dropdownGallery.itemEdit')}
                    </DropdownItem>
                    <DropdownItem
                      variant="danger"
                      data-testid="nested-dialog-dropdown-item-delete"
                      onSelect={() => setLastExecutedCommand('dialog-delete')}
                    >
                      {t('common.dropdownGallery.itemDelete')}
                    </DropdownItem>
                  </DropdownContent>
                </Dropdown>
              </div>

              <Button
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                data-testid="close-dialog-btn"
              >
                {t('common.dropdownGallery.dialogCloseBtn')}
              </Button>
            </div>
          </Dialog>
        </div>
      </section>
    </main>
  );
}

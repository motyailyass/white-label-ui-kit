'use client';

import type React from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { LayoutUser } from '@/layouts/types';
import { cn } from '@/lib/cn';
import { useI18n, useTheme } from '@/providers';
import { SidebarAvatar } from './sidebar-avatar';
import styles from './sidebar-avatar-popover.module.css';

export interface SidebarAvatarMenuItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  external?: boolean;
  as?: React.ElementType;
}

export interface SidebarAvatarPopoverProps {
  user: LayoutUser;
  items?: SidebarAvatarMenuItem[];
  linkAs?: React.ElementType;
  onLogout?: () => void;
  className?: string;
}

export function SidebarAvatarPopover({
  user,
  items,
  linkAs,
  onLogout,
  className,
}: SidebarAvatarPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverId = useId();

  const { t, locale, setLocale } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const resolvedItems: SidebarAvatarMenuItem[] = items ?? [
    {
      id: 'profile',
      label: t('dashboard.user.profile'),
      href: '/layout-01#profile',
      icon: <Icon name="user-03" size={16} aria-hidden="true" />,
      as: linkAs,
    },
    {
      id: 'preferences',
      label: t('dashboard.user.preferences'),
      href: '/layout-01#preferences',
      icon: <Icon name="settings" size={16} aria-hidden="true" />,
      as: linkAs,
    },
    {
      id: 'organization',
      label: t('dashboard.user.organization'),
      href: '/layout-01#organization',
      icon: <Icon name="building-03" size={16} aria-hidden="true" />,
      as: linkAs,
    },
    {
      id: 'developer-api',
      label: t('dashboard.user.developerApi'),
      href: '/layout-01#api',
      icon: <Icon name="api" size={16} aria-hidden="true" />,
      external: true,
    },
  ];

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [isOpen]);

  // Close on Escape and restore focus
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleToggle = () => setIsOpen((prev) => !prev);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout?.();
  };

  return (
    <div ref={containerRef} className={cn(styles.container, className)}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        onClick={handleToggle}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? popoverId : undefined}
        aria-label={`${user.name} - ${t('dashboard.user.preferences')}`}
      >
        <SidebarAvatar
          name={user.name}
          email={user.email}
          role={user.role}
          avatarUrl={user.avatarUrl}
          initials={user.initials}
          status={user.status}
          imageComponent={user.imageComponent}
          trailing={
            <span className={styles.triggerChevron} aria-hidden="true">
              <Icon name="chevron-down" size={16} />
            </span>
          }
        />
      </button>

      {isOpen && (
        <div
          id={popoverId}
          role="dialog"
          aria-label={t('dashboard.user.preferences')}
          className={styles.popover}
        >
          {/* 1. User Identity Header */}
          <div className={styles.profileHeader}>
            <Avatar
              name={user.name}
              src={user.avatarUrl}
              initials={user.initials}
              status={user.status}
              imageComponent={user.imageComponent}
              size="md"
            />
            <div className={styles.profileInfo}>
              <div className={styles.profileNameRow}>
                <span className={styles.profileName}>{user.name}</span>
              </div>
              {user.email && <span className={styles.profileEmail}>{user.email}</span>}
            </div>
          </div>

          <Separator decorative={false} className={styles.separator} />

          {/* 2. Account & Resource Items */}
          {resolvedItems.map((item) => {
            const ItemComponent = item.external ? 'a' : (item.as ?? 'a');
            return (
              <ItemComponent
                key={item.id}
                href={item.href}
                className={styles.menuItem}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <span className={styles.itemIcon}>{item.icon}</span>}
                <span className={styles.itemLabel}>{item.label}</span>
                {item.external && (
                  <span className={styles.itemTrailing} aria-hidden="true">
                    <Icon name="link-square-01" size={14} />
                  </span>
                )}
              </ItemComponent>
            );
          })}

          <Separator decorative={false} className={styles.separator} />

          {/* 3. Language Switcher (Segmented Control) */}
          <div className={styles.switcherRow}>
            <span className={styles.switcherLabel}>
              <Icon name="languages" size={14} aria-hidden="true" />
              <span>{t('dashboard.user.language')}</span>
            </span>
            <div
              className={styles.segmentedControl}
              role="group"
              aria-label={t('dashboard.user.language')}
            >
              <button
                type="button"
                lang="en"
                className={styles.segmentButton}
                data-active={locale === 'en'}
                aria-pressed={locale === 'en'}
                onClick={() => setLocale('en')}
              >
                EN
              </button>
              <button
                type="button"
                lang="fr"
                className={styles.segmentButton}
                data-active={locale === 'fr'}
                aria-pressed={locale === 'fr'}
                onClick={() => setLocale('fr')}
              >
                FR
              </button>
              <button
                type="button"
                lang="ar"
                className={styles.segmentButton}
                data-active={locale === 'ar'}
                aria-pressed={locale === 'ar'}
                onClick={() => setLocale('ar')}
              >
                AR
              </button>
            </div>
          </div>

          {/* 4. Theme Switcher (Segmented Control) */}
          <div className={styles.switcherRow}>
            <span className={styles.switcherLabel}>
              <Icon name={resolvedTheme === 'dark' ? 'moon' : 'sun'} size={14} aria-hidden="true" />
              <span>{t('dashboard.user.theme')}</span>
            </span>
            <div
              className={styles.segmentedControl}
              role="group"
              aria-label={t('dashboard.user.theme')}
            >
              <button
                type="button"
                className={styles.segmentButton}
                data-active={theme === 'light'}
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
                title={t('common.light')}
                aria-label={t('common.light')}
              >
                <Icon name="sun" size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.segmentButton}
                data-active={theme === 'dark'}
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
                title={t('common.dark')}
                aria-label={t('common.dark')}
              >
                <Icon name="moon" size={12} aria-hidden="true" />
              </button>
              <button
                type="button"
                className={styles.segmentButton}
                data-active={theme === 'system'}
                aria-pressed={theme === 'system'}
                onClick={() => setTheme('system')}
                title={t('common.system')}
              >
                {t('dashboard.user.themeAuto')}
              </button>
            </div>
          </div>

          <Separator decorative={false} className={styles.separator} />

          {/* 5. Logout Action */}
          <button type="button" className={styles.logoutItem} onClick={handleLogout}>
            <span className={styles.itemIcon}>
              <Icon name="logout" size={16} aria-hidden="true" />
            </span>
            <span className={styles.itemLabel}>{t('dashboard.user.logout')}</span>
          </button>
        </div>
      )}
    </div>
  );
}

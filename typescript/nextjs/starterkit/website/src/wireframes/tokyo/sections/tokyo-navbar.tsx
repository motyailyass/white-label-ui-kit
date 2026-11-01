'use client';

import type React from 'react';
import { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '@/components/icons';
import { AppToolbar } from '@/components/patterns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-navbar.module.css';

export interface NavLink {
  label: string;
  href: string;
  as?: React.ElementType;
}

export interface TokyoNavbarProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  brandBadge?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
  navAriaLabel?: string;
  mobileToggleLabel?: string;
  linkAs?: React.ElementType;
}

export function TokyoNavbar({
  brandName,
  brandBadge,
  links,
  ctaLabel,
  ctaHref = '#get-started',
  onCtaClick,
  navAriaLabel,
  mobileToggleLabel,
  linkAs,
  className,
  ...props
}: TokyoNavbarProps) {
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rawId = useId();
  const menuId = `tokyo-mobile-nav-${rawId.replace(/:/g, '')}`;

  const resolvedBrandName = brandName ?? t('website.meta.brandName');
  const resolvedBrandBadge = brandBadge === undefined ? t('website.meta.brandBadge') : brandBadge;
  const resolvedCtaLabel = ctaLabel ?? t('website.nav.getStarted');
  const resolvedNavLabel = navAriaLabel ?? t('website.nav.mainLabel');
  const resolvedToggleLabel = mobileToggleLabel ?? t('common.toggleNavigation');

  const resolvedLinks: NavLink[] = links ?? [
    { label: t('website.nav.features'), href: '#features' },
    { label: t('website.nav.architecture'), href: '#architecture' },
    { label: t('website.nav.pricing'), href: '#pricing' },
    { label: t('website.nav.faq'), href: '#faq' },
  ];

  useEffect(() => {
    if (!mobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const desktopMq = window.matchMedia('(min-width: 769px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };
    desktopMq.addEventListener('change', handleChange);
    return () => desktopMq.removeEventListener('change', handleChange);
  }, []);

  const BrandLink = linkAs ?? 'a';
  const CtaLink = linkAs ?? 'a';

  return (
    <header className={cn(styles.wrapper, className)} {...props}>
      <nav className={styles.navbar} aria-label={resolvedNavLabel}>
        <BrandLink href="/" className={styles.brand}>
          <span>{resolvedBrandName}</span>
          {resolvedBrandBadge && (
            <span className={styles.brandBadge} data-role="badge">
              {resolvedBrandBadge}
            </span>
          )}
        </BrandLink>

        <ul className={styles.links}>
          {resolvedLinks.map((link) => {
            const ItemLink = link.as ?? linkAs ?? 'a';
            return (
              <li key={link.href + link.label}>
                <ItemLink href={link.href} className={styles.link}>
                  {link.label}
                </ItemLink>
              </li>
            );
          })}
        </ul>

        <div className={styles.actions}>
          <AppToolbar />
          <CtaLink href={ctaHref} className={styles.ctaButton} onClick={onCtaClick}>
            {resolvedCtaLabel}
          </CtaLink>

          <Button
            ref={triggerRef}
            type="button"
            variant="ghost"
            size="md"
            touchTarget="auto"
            className={styles.mobileTrigger}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={resolvedToggleLabel}
            aria-expanded={mobileOpen}
            aria-controls={menuId}
          >
            <Icon name={mobileOpen ? 'close' : 'menu'} size={18} />
          </Button>
        </div>
      </nav>

      {/* Non-modal Mobile Disclosure */}
      <div id={menuId} className={styles.mobileMenu} data-open={mobileOpen} hidden={!mobileOpen}>
        {resolvedLinks.map((link) => {
          const ItemLink = link.as ?? linkAs ?? 'a';
          return (
            <ItemLink
              key={link.href + link.label}
              href={link.href}
              className={styles.link}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </ItemLink>
          );
        })}
        <CtaLink
          href={ctaHref}
          className={styles.mobileCta}
          onClick={() => {
            setMobileOpen(false);
            onCtaClick?.();
          }}
        >
          {resolvedCtaLabel}
        </CtaLink>
      </div>
    </header>
  );
}

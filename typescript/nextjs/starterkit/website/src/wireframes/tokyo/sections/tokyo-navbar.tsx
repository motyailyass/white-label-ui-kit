'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './tokyo-navbar.module.css';

export interface NavLink {
  label: string;
  href: string;
}

export interface TokyoNavbarProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  brandBadge?: string;
  links?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
  onCtaClick?: () => void;
}

const defaultLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export function TokyoNavbar({
  brandName = 'Tokyo.dev',
  brandBadge = 'Wireframe',
  links = defaultLinks,
  ctaLabel = 'Get Started',
  ctaHref = '#get-started',
  onCtaClick,
  className,
  ...props
}: TokyoNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className={cn(styles.wrapper, className)} {...props}>
      <nav className={styles.navbar} aria-label="Main navigation">
        <a href="/" className={styles.brand}>
          <span>{brandName}</span>
          {brandBadge && <span className={styles.brandBadge}>{brandBadge}</span>}
        </a>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <a href={ctaHref} className={styles.ctaButton} onClick={onCtaClick}>
            {ctaLabel}
          </a>

          <button
            type="button"
            className={styles.mobileTrigger}
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {mobileOpen ? (
                <>
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </>
              ) : (
                <>
                  <path d="M4 12h16" />
                  <path d="M4 6h16" />
                  <path d="M4 18h16" />
                </>
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={styles.mobileMenu} data-open={mobileOpen}>
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className={styles.link}
            onClick={() => setMobileOpen(false)}
          >
            {link.label}
          </a>
        ))}
      </div>
    </header>
  );
}

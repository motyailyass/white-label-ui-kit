'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import styles from './tokyo-footer.module.css';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface TokyoFooterProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyright?: string;
}

const defaultColumns: FooterColumn[] = [
  {
    title: 'Product',
    links: [
      { label: 'Edge Network', href: '#network' },
      { label: 'Integrations', href: '#integrations' },
      { label: 'Changelog', href: '#changelog' },
      { label: 'Pricing', href: '#pricing' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#docs' },
      { label: 'API Reference', href: '#api' },
      { label: 'CLI Tools', href: '#cli' },
      { label: 'GitHub', href: 'https://github.com' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
    ],
  },
];

export function TokyoFooter({
  brandName = 'Tokyo.dev',
  tagline = 'The high-velocity wireframe blueprint for modern software and engineering products.',
  columns = defaultColumns,
  copyright = '© 2026 Tokyo Starter Kit. All rights reserved.',
  className,
  ...props
}: TokyoFooterProps) {
  return (
    <footer className={cn(styles.footer, className)} {...props}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandName}>{brandName}</div>
            <p className={styles.brandTagline}>{tagline}</p>
            <div className={styles.statusPill}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>All systems operational</span>
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className={styles.colTitle}>{col.title}</div>
              <ul className={styles.linkList}>
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={styles.link}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottomBar}>
          <div>{copyright}</div>
          <button
            type="button"
            style={{
              padding: '2px 8px',
              fontSize: '11px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-border-subtle)',
              background: 'transparent',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
            onClick={() => {
              const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
              document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
            }}
            aria-label="Toggle theme"
          >
            Toggle Theme
          </button>
        </div>
      </div>
    </footer>
  );
}

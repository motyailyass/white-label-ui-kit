'use client';

import type React from 'react';
import { ThemeSwitcher } from '@/components/patterns';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-footer.module.css';

export interface FooterColumn {
  title: string;
  links: { label: string; href: string; as?: React.ElementType }[];
}

export interface TokyoFooterProps extends React.HTMLAttributes<HTMLElement> {
  brandName?: string;
  tagline?: string;
  columns?: FooterColumn[];
  copyright?: string;
  statusText?: string;
  linkAs?: React.ElementType;
}

export function TokyoFooter({
  brandName,
  tagline,
  columns,
  copyright,
  statusText,
  linkAs,
  className,
  ...props
}: TokyoFooterProps) {
  const { t } = useI18n();

  const resolvedBrandName = brandName ?? t('website.meta.brandName');
  const resolvedTagline = tagline ?? t('website.footer.tagline');
  const resolvedCopyright = copyright ?? t('website.footer.copyright');
  const resolvedStatus = statusText ?? t('website.footer.statusOperational');

  const resolvedColumns: FooterColumn[] = columns ?? [
    {
      title: t('website.footer.productTitle'),
      links: [
        { label: t('website.footer.edgeNetwork'), href: '#network' },
        { label: t('website.footer.integrations'), href: '#integrations' },
        { label: t('website.footer.changelog'), href: '#changelog' },
        { label: t('website.footer.pricing'), href: '#pricing' },
      ],
    },
    {
      title: t('website.footer.developersTitle'),
      links: [
        { label: t('website.footer.documentation'), href: '#docs' },
        { label: t('website.footer.apiReference'), href: '#api' },
        { label: t('website.footer.cliTools'), href: '#cli' },
        { label: t('website.footer.github'), href: 'https://github.com' },
      ],
    },
    {
      title: t('website.footer.companyTitle'),
      links: [
        { label: t('website.footer.aboutUs'), href: '#about' },
        { label: t('website.footer.careers'), href: '#careers' },
        { label: t('website.footer.privacyPolicy'), href: '#privacy' },
        { label: t('website.footer.termsOfService'), href: '#terms' },
      ],
    },
  ];

  return (
    <footer className={cn(styles.footer, className)} {...props}>
      <div className={styles.container}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandName}>{resolvedBrandName}</div>
            <p className={styles.brandTagline}>{resolvedTagline}</p>
            <div className={styles.statusPill}>
              <span className={styles.statusDot} aria-hidden="true" />
              <span>{resolvedStatus}</span>
            </div>
          </div>

          {resolvedColumns.map((col) => (
            <div key={col.title}>
              <div className={styles.colTitle} data-role="eyebrow">
                {col.title}
              </div>
              <ul className={styles.linkList}>
                {col.links.map((link) => {
                  const isExternal =
                    link.href.startsWith('http://') || link.href.startsWith('https://');
                  const ItemLink = isExternal ? 'a' : (link.as ?? linkAs ?? 'a');
                  return (
                    <li key={link.href + link.label}>
                      <ItemLink
                        href={link.href}
                        className={styles.link}
                        {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                      >
                        {link.label}
                      </ItemLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className={styles.bottomBar}>
          <div>{resolvedCopyright}</div>
          <ThemeSwitcher size="sm" />
        </div>
      </div>
    </footer>
  );
}

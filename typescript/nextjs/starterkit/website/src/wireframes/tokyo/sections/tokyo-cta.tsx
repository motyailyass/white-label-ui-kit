'use client';

import type React from 'react';
import { useId, useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useI18n } from '@/providers';
import styles from './tokyo-cta.module.css';

export interface TokyoCtaProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  emailLabel?: string;
  successMessage?: string;
  onSubscribe?: (email: string) => void;
}

export function TokyoCta({
  title,
  description,
  placeholder,
  buttonLabel,
  emailLabel,
  successMessage,
  onSubscribe,
  className,
  ...props
}: TokyoCtaProps) {
  const { t } = useI18n();
  const rawId = useId();
  const emailId = `tokyo-cta-email-${rawId.replace(/:/g, '')}`;
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const resolvedTitle = title ?? t('website.cta.title');
  const resolvedDescription = description ?? t('website.cta.description');
  const resolvedPlaceholder = placeholder ?? t('website.cta.placeholder');
  const resolvedButtonLabel = buttonLabel ?? t('website.cta.buttonLabel');
  const resolvedEmailLabel = emailLabel ?? t('website.cta.emailLabel');
  const resolvedSuccessMessage = successMessage ?? t('website.cta.successMessage');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubscribe?.(email);
    setSubmitted(true);
  };

  return (
    <section className={cn(styles.section, className)} id="cta" {...props}>
      <div className={styles.card}>
        <h2 className={styles.title}>{resolvedTitle}</h2>
        <p className={styles.description}>{resolvedDescription}</p>

        {submitted ? (
          <div className={styles.successMessage} role="status" aria-live="polite">
            {resolvedSuccessMessage}
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <label htmlFor={emailId} className="sr-only">
              {resolvedEmailLabel}
            </label>
            <input
              id={emailId}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={resolvedPlaceholder}
              required
              className={styles.input}
            />
            <Button type="submit" variant="primary">
              {resolvedButtonLabel}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

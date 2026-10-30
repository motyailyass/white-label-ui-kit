'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/cn';
import styles from './tokyo-cta.module.css';

export interface TokyoCtaProps extends React.HTMLAttributes<HTMLElement> {
  title?: string;
  description?: string;
  placeholder?: string;
  buttonLabel?: string;
  onSubscribe?: (email: string) => void;
}

export function TokyoCta({
  title = 'Ready to launch your platform?',
  description = 'Join forward-thinking engineers deploying high-velocity applications today.',
  placeholder = 'Enter your work email...',
  buttonLabel = 'Request Access',
  onSubscribe,
  className,
  ...props
}: TokyoCtaProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    onSubscribe?.(email);
    setSubmitted(true);
  };

  return (
    <section className={cn(styles.section, className)} id="cta" {...props}>
      <div className={styles.card}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>

        {submitted ? (
          <div
            style={{
              color: 'var(--color-success)',
              fontWeight: 'var(--font-weight-medium)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            Thank you! We have reserved your access slot.
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={placeholder}
              required
              className={styles.input}
              aria-label="Email address"
            />
            <button type="submit" className={styles.button}>
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

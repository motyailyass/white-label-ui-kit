'use client';

import type React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { setCookie } from '@/lib/cookie';
import {
  formatCurrency as baseFormatCurrency,
  formatDate as baseFormatDate,
  formatNumber as baseFormatNumber,
  formatPercent as baseFormatPercent,
  formatRelativeTime as baseFormatRelativeTime,
  type DateFormatOptions,
  type Direction,
  defaultMessages,
  getDirectionForLocale,
  type I18nContextValue,
  type Locale,
  type LocaleMessages,
  type NumberFormatOptions,
  translate,
} from '@/i18n';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
  defaultLocale?: Locale;
  initialDirection?: Direction;
  defaultDirection?: Direction;
  messages?: Record<string, LocaleMessages>;
  syncHtmlAttributes?: boolean;
}

export function I18nProvider({
  children,
  initialLocale,
  defaultLocale = 'en',
  initialDirection,
  defaultDirection,
  messages = defaultMessages,
  syncHtmlAttributes = true,
}: I18nProviderProps) {
  const activeInitialLocale = initialLocale || defaultLocale;
  const activeInitialDirection =
    initialDirection || defaultDirection || getDirectionForLocale(activeInitialLocale);

  const [locale, setLocaleState] = useState<Locale>(activeInitialLocale);
  const [direction, setDirectionState] = useState<Direction>(activeInitialDirection);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    // Direction derives directly from locale: ar -> rtl, en/fr -> ltr
    const newDir = getDirectionForLocale(newLocale);
    setDirectionState(newDir);

    if (typeof document !== 'undefined') {
      try {
        setCookie('locale', newLocale);
        setCookie('dir', newDir);
        localStorage.setItem('locale', newLocale);
        localStorage.setItem('dir', newDir);
      } catch {
        // Storage unavailable
      }
    }
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    setDirectionState(newDirection);

    if (typeof document !== 'undefined') {
      try {
        setCookie('dir', newDirection);
        localStorage.setItem('dir', newDirection);
      } catch {
        // Storage unavailable
      }
    }
  }, []);

  const toggleDirection = useCallback(() => {
    setDirectionState((prev) => {
      const nextDir = prev === 'rtl' ? 'ltr' : 'rtl';
      if (typeof document !== 'undefined') {
        try {
          setCookie('dir', nextDir);
          localStorage.setItem('dir', nextDir);
        } catch {
          // Storage unavailable
        }
      }
      return nextDir;
    });
  }, []);

  // Sync documentElement dir, lang, and data-direction attributes on the client
  useEffect(() => {
    if (!syncHtmlAttributes || typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('dir', direction);
    root.setAttribute('lang', locale);
    root.setAttribute('data-direction', direction);
  }, [direction, locale, syncHtmlAttributes]);

  const isRtl = direction === 'rtl';

  const t = useCallback(
    (key: string, fallback?: string, params?: Record<string, string | number>) => {
      return translate(messages, locale, key, fallback, params);
    },
    [messages, locale],
  );

  const formatNumber = useCallback(
    (value: number, options?: NumberFormatOptions) => baseFormatNumber(value, locale, options),
    [locale],
  );

  const formatCurrency = useCallback(
    (amount: number, currency = 'USD', options?: Intl.NumberFormatOptions) =>
      baseFormatCurrency(amount, currency, locale, options),
    [locale],
  );

  const formatPercent = useCallback(
    (value: number, options?: Intl.NumberFormatOptions) =>
      baseFormatPercent(value, locale, options),
    [locale],
  );

  const formatDate = useCallback(
    (date: Date | string | number, options?: DateFormatOptions) =>
      baseFormatDate(date, locale, options),
    [locale],
  );

  const formatRelativeTime = useCallback(
    (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) =>
      baseFormatRelativeTime(value, unit, locale, options),
    [locale],
  );

  const contextValue = useMemo<I18nContextValue>(
    () => ({
      direction,
      setDirection,
      toggleDirection,
      locale,
      setLocale,
      isRtl,
      t,
      formatNumber,
      formatCurrency,
      formatPercent,
      formatDate,
      formatRelativeTime,
    }),
    [
      direction,
      setDirection,
      toggleDirection,
      locale,
      setLocale,
      isRtl,
      t,
      formatNumber,
      formatCurrency,
      formatPercent,
      formatDate,
      formatRelativeTime,
    ],
  );

  return <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    return {
      direction: 'ltr',
      setDirection: () => {},
      toggleDirection: () => {},
      locale: 'en',
      setLocale: () => {},
      isRtl: false,
      t: (key, fallback) => fallback || key,
      formatNumber: (val, opt) => baseFormatNumber(val, 'en', opt),
      formatCurrency: (amt, curr, opt) => baseFormatCurrency(amt, curr, 'en', opt),
      formatPercent: (val, opt) => baseFormatPercent(val, 'en', opt),
      formatDate: (date, opt) => baseFormatDate(date, 'en', opt),
      formatRelativeTime: (val, unit, opt) => baseFormatRelativeTime(val, unit, 'en', opt),
    };
  }
  return context;
}

export function useDirection(): {
  direction: Direction;
  setDirection: (direction: Direction) => void;
  toggleDirection: () => void;
  isRtl: boolean;
} {
  const { direction, setDirection, toggleDirection, isRtl } = useI18n();
  return { direction, setDirection, toggleDirection, isRtl };
}

export function useLocale(): {
  locale: Locale;
  setLocale: (locale: Locale) => void;
} {
  const { locale, setLocale } = useI18n();
  return { locale, setLocale };
}

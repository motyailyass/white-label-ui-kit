'use client';

import type React from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  type DateFormatOptions,
  defaultMessages,
  formatCurrency as baseFormatCurrency,
  formatDate as baseFormatDate,
  formatNumber as baseFormatNumber,
  formatPercent as baseFormatPercent,
  formatRelativeTime as baseFormatRelativeTime,
  getDirectionForLocale,
  type I18nContextValue,
  isSupportedLocale,
  type LocaleMessages,
  type NumberFormatOptions,
  type SupportedLocale,
  type TranslationKey,
  translate,
} from '@/i18n';
import { setCookie } from '@/lib/cookie';

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: React.ReactNode;
  initialLocale?: SupportedLocale;
  defaultLocale?: SupportedLocale;
  messages?: Record<string, LocaleMessages>;
  syncHtmlAttributes?: boolean;
  /**
   * Optional host callback invoked after locale changes (e.g. App Router `router.refresh()`).
   * Keeps Next.js router imports strictly out of shared providers.
   */
  onLocaleChange?: (locale: SupportedLocale) => void;
}

export function I18nProvider({
  children,
  initialLocale,
  defaultLocale = 'en',
  messages = defaultMessages,
  syncHtmlAttributes = true,
  onLocaleChange,
}: I18nProviderProps) {
  const validatedInitialLocale =
    initialLocale && isSupportedLocale(initialLocale) ? initialLocale : defaultLocale;

  const [locale, setLocaleState] = useState<SupportedLocale>(validatedInitialLocale);
  const onLocaleChangeRef = useRef(onLocaleChange);
  onLocaleChangeRef.current = onLocaleChange;

  const direction = getDirectionForLocale(locale);
  const isRtl = direction === 'rtl';

  const setLocale = useCallback((newLocale: SupportedLocale) => {
    if (!isSupportedLocale(newLocale)) return;
    setLocaleState(newLocale);

    if (typeof document !== 'undefined') {
      try {
        setCookie('locale', newLocale);
      } catch {
        // Cookie persistence unavailable
      }
    }

    onLocaleChangeRef.current?.(newLocale);
  }, []);

  // Sync documentElement dir, lang, and data-direction attributes on the client
  useEffect(() => {
    if (!syncHtmlAttributes || typeof document === 'undefined') return;

    const root = document.documentElement;
    root.setAttribute('dir', direction);
    root.setAttribute('lang', locale);
    root.setAttribute('data-direction', direction);
  }, [direction, locale, syncHtmlAttributes]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      return translate(messages, locale, key, undefined, params);
    },
    [messages, locale],
  );

  const formatNumber = useCallback(
    (value: number, options?: NumberFormatOptions) => baseFormatNumber(value, locale, options),
    [locale],
  );

  const formatCurrency = useCallback(
    (amount: number, currency: string, options?: Intl.NumberFormatOptions) =>
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
    throw new Error('useI18n must be used within an <I18nProvider>');
  }
  return context;
}

import type { DateFormatOptions, Direction, Locale, NumberFormatOptions } from './types';

/**
 * Common RTL language codes.
 */
const RTL_LOCALES = new Set(['ar', 'fa', 'he', 'ur', 'ckb', 'ps', 'sd', 'ug', 'yi']);

/**
 * Determines whether a given locale or language tag is RTL.
 */
export function getDirectionForLocale(locale: string): Direction {
  if (!locale) return 'ltr';
  const baseLanguage = locale.toLowerCase().split(/[-_]/)[0];
  return RTL_LOCALES.has(baseLanguage) ? 'rtl' : 'ltr';
}

/**
 * Determines whether a locale or direction is RTL.
 */
export function isRtlDirection(localeOrDir: string): boolean {
  if (localeOrDir === 'rtl') return true;
  if (localeOrDir === 'ltr') return false;
  return getDirectionForLocale(localeOrDir) === 'rtl';
}

/**
 * Formats a number using the native Intl.NumberFormat API.
 */
export function formatNumber(
  value: number,
  locale: Locale = 'en',
  options: NumberFormatOptions = {},
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

/**
 * Formats currency using the native Intl.NumberFormat API.
 * Defaults to USD or local currency.
 */
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale: Locale = 'en',
  options: Intl.NumberFormatOptions = {},
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      ...options,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

/**
 * Formats percentages using the native Intl.NumberFormat API.
 */
export function formatPercent(
  value: number,
  locale: Locale = 'en',
  options: Intl.NumberFormatOptions = {},
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      maximumFractionDigits: 1,
      ...options,
    }).format(value);
  } catch {
    return `${value}%`;
  }
}

/**
 * Formats a date using the native Intl.DateTimeFormat API.
 * Supports Gregorian and Islamic/Hijri calendars.
 */
export function formatDate(
  date: Date | string | number,
  locale: Locale = 'en',
  options: DateFormatOptions = { dateStyle: 'medium' },
): string {
  try {
    const dateObj = typeof date === 'object' && date instanceof Date ? date : new Date(date);
    if (Number.isNaN(dateObj.getTime())) {
      return String(date);
    }
    return new Intl.DateTimeFormat(locale, options).format(dateObj);
  } catch {
    return String(date);
  }
}

/**
 * Formats relative time (e.g., "5 minutes ago", "in 2 hours") using Intl.RelativeTimeFormat.
 */
export function formatRelativeTime(
  value: number,
  unit: Intl.RelativeTimeFormatUnit,
  locale: Locale = 'en',
  options: Intl.RelativeTimeFormatOptions = { numeric: 'auto' },
): string {
  try {
    return new Intl.RelativeTimeFormat(locale, options).format(value, unit);
  } catch {
    return `${value} ${unit}`;
  }
}

/**
 * Formats a list of items using Intl.ListFormat.
 */
export function formatList(
  items: string[],
  locale: Locale = 'en',
  options: Intl.ListFormatOptions = { style: 'long', type: 'conjunction' },
): string {
  try {
    if (typeof Intl !== 'undefined' && 'ListFormat' in Intl) {
      return new Intl.ListFormat(locale, options).format(items);
    }
    return items.join(', ');
  } catch {
    return items.join(', ');
  }
}

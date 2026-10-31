import { describe, expect, it } from 'vitest';
import {
  formatCurrency,
  formatDate,
  formatList,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  getDirectionForLocale,
  isRtlDirection,
} from './formatters';

describe('i18n formatters and direction utilities', () => {
  it('correctly detects RTL locales', () => {
    expect(getDirectionForLocale('ar')).toBe('rtl');
    expect(getDirectionForLocale('ar-EG')).toBe('rtl');
    expect(getDirectionForLocale('fa-IR')).toBe('rtl');
    expect(getDirectionForLocale('he')).toBe('rtl');
    expect(getDirectionForLocale('en')).toBe('ltr');
    expect(getDirectionForLocale('fr')).toBe('ltr');
  });

  it('correctly determines isRtlDirection', () => {
    expect(isRtlDirection('rtl')).toBe(true);
    expect(isRtlDirection('ltr')).toBe(false);
    expect(isRtlDirection('ar')).toBe(true);
    expect(isRtlDirection('en-US')).toBe(false);
  });

  it('formats numbers for English and Arabic', () => {
    const formattedEn = formatNumber(12345.67, 'en');
    expect(formattedEn).toContain('12,345.67');

    const formattedAr = formatNumber(12345.67, 'ar');
    expect(formattedAr.length).toBeGreaterThan(0);
  });

  it('preserves data-owned currency across English, French, and Arabic locales', () => {
    const usdEn = formatCurrency(500, 'USD', 'en');
    const usdFr = formatCurrency(500, 'USD', 'fr');
    const usdAr = formatCurrency(500, 'USD', 'ar');

    expect(usdEn).toContain('$');
    expect(usdFr).toMatch(/\$|USD/);
    expect(usdFr).not.toMatch(/€|EUR/);
    expect(usdAr).toMatch(/\$|USD/);
    expect(usdAr).not.toMatch(/€|EUR|SAR|ر\.س/);
  });

  it('formats fractional percentages consistently, including catch fallback', () => {
    expect(formatPercent(0.125, 'en', { maximumFractionDigits: 1 })).toBe('12.5%');
    expect(formatPercent(0.854, 'en')).toBe('85.4%');
    // Force Intl.NumberFormat failure via invalid locale tag to test fallback contract
    expect(formatPercent(0.125, 'invalid_locale_tag_$$$')).toBe('12.5%');
  });

  it('formats dates consistently', () => {
    const testDate = new Date(2025, 5, 15);
    const dateEn = formatDate(testDate, 'en');
    expect(dateEn).toContain('2025');
  });

  it('formats relative time', () => {
    const relTime = formatRelativeTime(-5, 'minute', 'en');
    expect(relTime).toBe('5 minutes ago');
  });

  it('formats list of strings', () => {
    const list = formatList(['Apple', 'Orange', 'Banana'], 'en');
    expect(list).toContain('Apple');
    expect(list).toContain('Banana');
  });
});

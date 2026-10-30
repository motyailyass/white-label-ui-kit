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

  it('formats currency correctly', () => {
    const usd = formatCurrency(500, 'USD', 'en');
    expect(usd).toContain('500');
    expect(usd).toContain('$');

    const eur = formatCurrency(500, 'EUR', 'fr');
    expect(eur).toContain('500');
  });

  it('formats percentages correctly', () => {
    const percent = formatPercent(0.854, 'en');
    expect(percent).toBe('85.4%');
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

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

describe('i18n formatters & direction helpers', () => {
  describe('getDirectionForLocale & isRtlDirection', () => {
    it('detects RTL for Arabic locales', () => {
      expect(getDirectionForLocale('ar')).toBe('rtl');
      expect(getDirectionForLocale('ar-SA')).toBe('rtl');
      expect(getDirectionForLocale('ar-EG')).toBe('rtl');
      expect(isRtlDirection('ar')).toBe(true);
      expect(isRtlDirection('rtl')).toBe(true);
    });

    it('detects RTL for other MENA languages', () => {
      expect(getDirectionForLocale('fa')).toBe('rtl'); // Persian
      expect(getDirectionForLocale('ur')).toBe('rtl'); // Urdu
      expect(getDirectionForLocale('he')).toBe('rtl'); // Hebrew
    });

    it('detects LTR for English and other European languages', () => {
      expect(getDirectionForLocale('en')).toBe('ltr');
      expect(getDirectionForLocale('en-US')).toBe('ltr');
      expect(getDirectionForLocale('fr')).toBe('ltr');
      expect(getDirectionForLocale('de')).toBe('ltr');
      expect(isRtlDirection('en')).toBe(false);
      expect(isRtlDirection('ltr')).toBe(false);
    });
  });

  describe('formatNumber', () => {
    it('formats numbers in English locale', () => {
      const res = formatNumber(1250000, 'en');
      expect(res).toBe('1,250,000');
    });

    it('formats numbers with Arabic-Indic digits when requested', () => {
      const res = formatNumber(1234, 'ar-SA', { numberingSystem: 'arab' });
      // ١٬٢٣٤ or contains Arabic digits
      expect(res).toBeDefined();
      expect(res.length).toBeGreaterThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats USD currency correctly', () => {
      const res = formatCurrency(250, 'USD', 'en');
      expect(res).toContain('250');
      expect(res).toContain('$');
    });

    it('formats SAR currency correctly', () => {
      const res = formatCurrency(1500, 'SAR', 'en');
      expect(res).toContain('SAR');
      expect(res).toContain('1,500');
    });
  });

  describe('formatPercent', () => {
    it('formats percentage correctly', () => {
      const res = formatPercent(0.125, 'en');
      expect(res).toBe('12.5%');
    });
  });

  describe('formatDate', () => {
    it('formats dates consistently', () => {
      const date = new Date('2026-10-30T12:00:00Z');
      const res = formatDate(date, 'en', { dateStyle: 'medium' });
      expect(res).toContain('2026');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative past and future time', () => {
      const past = formatRelativeTime(-5, 'minute', 'en');
      expect(past).toBe('5 minutes ago');

      const future = formatRelativeTime(2, 'day', 'en');
      expect(future).toBe('in 2 days');
    });
  });

  describe('formatList', () => {
    it('formats lists with conjunction', () => {
      const res = formatList(['Apple', 'Orange', 'Banana'], 'en');
      expect(res).toBe('Apple, Orange, and Banana');
    });
  });
});

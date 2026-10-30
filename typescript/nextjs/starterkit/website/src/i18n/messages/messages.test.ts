import { describe, expect, it } from 'vitest';
import { defaultMessages, translate } from './index';

describe('i18n messages and translation engine', () => {
  it('translates nested keys in English', () => {
    const text = translate(defaultMessages, 'en', 'dashboard.overview.title');
    expect(text).toBe('System Overview');
  });

  it('translates nested keys in French', () => {
    const text = translate(defaultMessages, 'fr', 'dashboard.overview.title');
    expect(text).toBe('Aperçu du système');
  });

  it('translates nested keys in Arabic', () => {
    const text = translate(defaultMessages, 'ar', 'dashboard.overview.title');
    expect(text).toBe('نظرة عامة على النظام');
  });

  it('interpolates parameters correctly', () => {
    const customMessages = {
      en: {
        common: {
          test: 'Hello {name}, you have {count} items',
        } as any,
        dashboard: {} as any,
        settings: {} as any,
        errors: {} as any,
      },
      fr: { common: {} as any, dashboard: {} as any, settings: {} as any, errors: {} as any },
      ar: { common: {} as any, dashboard: {} as any, settings: {} as any, errors: {} as any },
    };
    const text = translate(customMessages, 'en', 'common.test', undefined, {
      name: 'Sarah',
      count: 5,
    });
    expect(text).toBe('Hello Sarah, you have 5 items');
  });

  it('falls back to English when a key is missing in another language', () => {
    const text = translate(defaultMessages, 'fr', 'nonexistent.path', 'Fallback text');
    expect(text).toBe('Fallback text');
  });
});

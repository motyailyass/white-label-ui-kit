import { describe, expect, it } from 'vitest';
import { defaultMessages, enMessages, translate } from './index';

describe('dashboard i18n messages and translation engine', () => {
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

  it('includes dashboard and settings namespaces', () => {
    expect('dashboard' in enMessages).toBe(true);
    expect('settings' in enMessages).toBe(true);
  });

  it('interpolates parameters accurately without any casts', () => {
    const sample = {
      en: { test: 'Hello {name}, you have {count} items ({name})' },
    };
    const text = translate(sample, 'en', 'test', undefined, {
      name: 'Sarah',
      count: 5,
    });
    expect(text).toBe('Hello Sarah, you have 5 items (Sarah)');
  });

  it('falls back to fallback text when a key is missing', () => {
    const text = translate(defaultMessages, 'fr', 'nonexistent.path', 'Fallback text');
    expect(text).toBe('Fallback text');
  });
});

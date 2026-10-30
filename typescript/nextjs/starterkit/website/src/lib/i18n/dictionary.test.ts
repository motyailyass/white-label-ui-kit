import { describe, expect, it } from 'vitest';
import { defaultDictionaries, translate } from './dictionary';

describe('i18n dictionary and translate function', () => {
  it('translates nested keys in English', () => {
    const text = translate(defaultDictionaries, 'en', 'dashboard.title');
    expect(text).toBe('System Overview');
  });

  it('translates nested keys in Arabic', () => {
    const text = translate(defaultDictionaries, 'ar', 'dashboard.title');
    expect(text).toBe('نظرة عامة على النظام');
  });

  it('interpolates parameters correctly', () => {
    const dict = {
      en: {
        welcome: 'Hello {name}, you have {count} messages.',
      },
    };
    const text = translate(dict, 'en', 'welcome', undefined, { name: 'Sarah', count: 5 });
    expect(text).toBe('Hello Sarah, you have 5 messages.');
  });

  it('falls back gracefully when key is missing', () => {
    const text = translate(defaultDictionaries, 'en', 'nonexistent.key', 'Fallback String');
    expect(text).toBe('Fallback String');
  });
});

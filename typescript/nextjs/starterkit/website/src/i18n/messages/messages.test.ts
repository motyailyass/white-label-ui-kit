import { describe, expect, it } from 'vitest';
import { defaultMessages, enMessages, translate } from './index';

describe('website i18n messages and translation engine', () => {
  it('translates nested website keys in English', () => {
    const text = translate(defaultMessages, 'en', 'website.hero.title');
    expect(text).toBe('The Next-Gen Edge Platform for Developers');
  });

  it('translates nested website keys in French', () => {
    const text = translate(defaultMessages, 'fr', 'website.hero.title');
    expect(text).toBe('La plateforme Edge nouvelle génération pour les développeurs');
  });

  it('translates nested website keys in Arabic', () => {
    const text = translate(defaultMessages, 'ar', 'website.hero.title');
    expect(text).toBe('منصة الحافة من الجيل القادم للمطورين');
  });

  it('does not include dashboard or settings namespaces in website bundle', () => {
    expect('dashboard' in enMessages).toBe(false);
    expect('settings' in enMessages).toBe(false);
    expect('website' in enMessages).toBe(true);
  });

  it('interpolates parameters accurately without any casts', () => {
    const sample = {
      en: { greeting: 'Welcome {user}, {count} projects active ({user})' },
    };
    const text = translate(sample, 'en', 'greeting', undefined, { user: 'Nadia', count: 3 });
    expect(text).toBe('Welcome Nadia, 3 projects active (Nadia)');
  });

  it('falls back cleanly when a key is missing', () => {
    const text = translate(defaultMessages, 'fr', 'nonexistent.path', 'Fallback text');
    expect(text).toBe('Fallback text');
  });
});

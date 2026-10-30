import { common as arCommon } from './ar/common';
import { dashboard as arDashboard } from './ar/dashboard';
import { errors as arErrors } from './ar/errors';
import { settings as arSettings } from './ar/settings';
import { type CommonMessages, common as enCommon } from './en/common';
import { type DashboardMessages, dashboard as enDashboard } from './en/dashboard';
import { type ErrorsMessages, errors as enErrors } from './en/errors';
import { settings as enSettings, type SettingsMessages } from './en/settings';
import { common as frCommon } from './fr/common';
import { dashboard as frDashboard } from './fr/dashboard';
import { errors as frErrors } from './fr/errors';
import { settings as frSettings } from './fr/settings';

export interface LocaleMessages {
  common: CommonMessages;
  dashboard: DashboardMessages;
  settings: SettingsMessages;
  errors: ErrorsMessages;
}

export const enMessages: LocaleMessages = {
  common: enCommon,
  dashboard: enDashboard,
  settings: enSettings,
  errors: enErrors,
};

export const frMessages: LocaleMessages = {
  common: frCommon,
  dashboard: frDashboard,
  settings: frSettings,
  errors: frErrors,
};

export const arMessages: LocaleMessages = {
  common: arCommon,
  dashboard: arDashboard,
  settings: arSettings,
  errors: arErrors,
};

export const defaultMessages: Record<string, LocaleMessages> = {
  en: enMessages,
  fr: frMessages,
  ar: arMessages,
};

/**
 * Resolves dot-notation paths (e.g. 'dashboard.overview.title') from an object structure.
 */
export function resolvePath(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: any = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translates a key with parameters and English fallback.
 */
export function translate(
  messages: Record<string, LocaleMessages> = defaultMessages,
  locale: string = 'en',
  key: string,
  fallback?: string,
  params?: Record<string, string | number>,
): string {
  const baseLocale = locale.toLowerCase().split(/[-_]/)[0];
  const dict = messages[locale] || messages[baseLocale] || messages.en;

  let text = resolvePath(dict, key) || resolvePath(messages.en, key) || fallback || key;

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
    }
  }

  return text;
}

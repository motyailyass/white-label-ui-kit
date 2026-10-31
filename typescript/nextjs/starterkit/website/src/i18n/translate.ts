/**
 * Resolves dot-notation paths (e.g. 'dashboard.overview.title') from a nested dictionary object.
 */
export function resolvePath(obj: unknown, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === undefined || current === null || typeof current !== 'object') {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translates a key against a locale dictionary map with English fallback and `{param}` interpolation.
 */
export function translate<TMessages extends object>(
  messages: Record<string, TMessages>,
  locale: string = 'en',
  key: string,
  fallback?: string,
  params?: Record<string, string | number>,
): string {
  const baseLocale = locale.toLowerCase().split(/[-_]/)[0];
  const dict = messages[locale] ?? messages[baseLocale] ?? messages.en;

  let text = resolvePath(dict, key) ?? resolvePath(messages.en, key) ?? fallback ?? key;

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replaceAll(`{${pKey}}`, String(pVal));
    }
  }

  return text;
}

export const SUPPORTED_LOCALES = ['en', 'fr', 'ar'] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

export type Direction = 'ltr' | 'rtl';

export function isSupportedLocale(value: unknown): value is SupportedLocale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export type NumberingSystem = 'latn' | 'arab' | 'arabext';

export type MessageShape<T> = {
  readonly [K in keyof T]: T[K] extends string ? string : MessageShape<T[K]>;
};

export interface NumberFormatOptions extends Intl.NumberFormatOptions {
  numberingSystem?: NumberingSystem;
}

export interface CurrencyFormatOptions extends Intl.NumberFormatOptions {
  currency: string;
  numberingSystem?: NumberingSystem;
}

export interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  calendar?: 'gregory' | 'islamic' | 'islamic-umalqura';
}

export interface I18nContextValue {
  direction: Direction;
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  isRtl: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatNumber: (value: number, options?: NumberFormatOptions) => string;
  formatCurrency: (amount: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date | string | number, options?: DateFormatOptions) => string;
  formatRelativeTime: (
    value: number,
    unit: Intl.RelativeTimeFormatUnit,
    options?: Intl.RelativeTimeFormatOptions,
  ) => string;
}

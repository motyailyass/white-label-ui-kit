export type Direction = 'ltr' | 'rtl';

export type SupportedLocale = 'en' | 'fr' | 'ar';

export type Locale = SupportedLocale | string;

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
  setDirection: (direction: Direction) => void;
  toggleDirection: () => void;
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isRtl: boolean;
  t: (key: string, fallback?: string, params?: Record<string, string | number>) => string;
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

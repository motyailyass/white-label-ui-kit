export type Dictionary = Record<string, string | Record<string, any>>;

export interface Dictionaries {
  [locale: string]: Dictionary;
}

/**
 * Built-in default UI strings for common starter kit components and layouts.
 */
export const defaultDictionaries: Dictionaries = {
  en: {
    common: {
      theme: 'Theme',
      direction: 'Direction',
      toggleTheme: 'Toggle theme',
      toggleDirection: 'Toggle direction',
      search: 'Search...',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      save: 'Save',
      cancel: 'Cancel',
      language: 'Language',
    },
    nav: {
      home: 'Home',
      overview: 'Overview',
      dashboard: 'Dashboard',
      analytics: 'Analytics',
      reports: 'Reports',
      customers: 'Customers',
      orders: 'Orders',
      products: 'Products',
      team: 'Team',
      settings: 'Settings',
      platform: 'Platform',
      workspace: 'Workspace',
    },
    dashboard: {
      title: 'System Overview',
      subtitle:
        'Welcome to the non-branded dashboard starter kit layout engine with native RTL & LTR support.',
      totalUsers: 'Total Users',
      activeSessions: 'Active Sessions',
      monthlyRevenue: 'Monthly Revenue',
      thisMonth: 'this month',
      peakLoad: 'peak load',
      updatedToday: 'Updated today',
      bidiTitle: 'Bi-directional Text Handling (Bidi)',
      bidiAccount: 'Account tracking code',
      bidiPhone: 'Support direct line',
      bidiDesc: 'Isolated with <bdi> to guarantee flawless punctuation in any reading direction.',
    },
  },
  ar: {
    common: {
      theme: 'المظهر',
      direction: 'الاتجاه',
      toggleTheme: 'تبديل المظهر',
      toggleDirection: 'تبديل الاتجاه',
      search: 'بحث...',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      save: 'حفظ',
      cancel: 'إلغاء',
      language: 'اللغة',
    },
    nav: {
      home: 'الرئيسية',
      overview: 'نظرة عامة',
      dashboard: 'لوحة التحكم',
      analytics: 'التحليلات',
      reports: 'التقارير',
      customers: 'العملاء',
      orders: 'الطلبات',
      products: 'المنتجات',
      team: 'فريق العمل',
      settings: 'الإعدادات',
      platform: 'المنصة',
      workspace: 'مساحة العمل',
    },
    dashboard: {
      title: 'نظرة عامة على النظام',
      subtitle:
        'مرحباً بك في محرك تخطيط لوحة التحكم، يدعم الاتجاهين RTL و LTR بالكامل دون أي تعديل لاحق.',
      totalUsers: 'إجمالي المستخدمين',
      activeSessions: 'الجلسات النشطة',
      monthlyRevenue: 'الإيرادات الشهرية',
      thisMonth: 'هذا الشهر',
      peakLoad: 'ذروة الاستخدام',
      updatedToday: 'محدّث اليوم',
      bidiTitle: 'معالجة النصوص ثنائية الاتجاه (Bidi)',
      bidiAccount: 'رمز تتبع الحساب',
      bidiPhone: 'الاتصال المباشر بالدعم',
      bidiDesc: 'معزول تلقائياً باستخدام <bdi> لمنع أي تشويه في علامات الترقيم والأقواس.',
    },
  },
};

/**
 * Resolves a dot-notation key (e.g. 'dashboard.totalUsers') from a dictionary.
 */
function resolvePath(obj: any, path: string): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return typeof current === 'string' ? current : undefined;
}

/**
 * Translates a key with interpolation parameters and graceful fallback.
 */
export function translate(
  dictionaries: Dictionaries,
  locale: string,
  key: string,
  fallback?: string,
  params?: Record<string, string | number>,
): string {
  const baseLocale = locale.toLowerCase().split(/[-_]/)[0];
  const dict = dictionaries[locale] || dictionaries[baseLocale] || dictionaries.en;
  let text = resolvePath(dict, key) || resolvePath(dictionaries.en, key) || fallback || key;

  if (params) {
    for (const [pKey, pVal] of Object.entries(params)) {
      text = text.replace(new RegExp(`{${pKey}}`, 'g'), String(pVal));
    }
  }

  return text;
}

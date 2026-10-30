import type { DashboardMessages } from '../en/dashboard';

export const dashboard = {
  overview: {
    title: 'نظرة عامة على النظام',
    subtitle:
      'مرحباً بك في محرك تخطيط لوحة التحكم، يدعم الاتجاهين RTL و LTR بالكامل دون أي تعديل لاحق.',
  },
  metrics: {
    totalUsers: 'إجمالي المستخدمين',
    activeSessions: 'الجلسات النشطة',
    monthlyRevenue: 'الإيرادات المتكررة الشهري',
    thisMonth: 'هذا الشهر',
    peakLoad: 'ذروة الاستخدام',
    updatedToday: 'محدّث اليوم',
  },
  bidi: {
    title: 'معالجة النصوص ثنائية الاتجاه (Bidi)',
    trackingCode: 'رمز التتبع البرمجي للحساب',
    supportLine: 'الاتصال بالدعم الفني',
    description: 'معزول تلقائياً باستخدام <bdi> لمنع أي تشويه في علامات الترقيم والأقواس.',
  },
  nav: {
    overview: 'نظرة عامة',
    dashboard: 'لوحة التحكم',
    analytics: 'التحليلات',
    reports: 'التقارير',
    management: 'الإدارة',
    customers: 'العملاء',
    orders: 'الطلبات',
    products: 'المنتجات',
    preferences: 'التفضيلات',
    team: 'فريق العمل',
    settings: 'الإعدادات',
  },
} satisfies DashboardMessages;

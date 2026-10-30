import type { ErrorsMessages } from '../en/errors';

export const errors = {
  genericTitle: 'حدث خطأ غير متوقع',
  genericDescription: 'حدث خطأ أثناء معالجة طلبك، يرجى إعادة المحاولة.',
  notFoundTitle: 'الصفحة غير موجودة',
  notFoundDescription: 'الصفحة التي تحاول الوصول إليها غير متاحة أو تم نقلها.',
  retryAction: 'إعادة المحاولة',
  goHomeAction: 'العودة للوحة التحكم',
  boundaryTitle: 'خطأ في هذا القسم',
  boundaryDescription: 'تعذر تحميل هذا القسم بشكل صحيح.',
} satisfies ErrorsMessages;

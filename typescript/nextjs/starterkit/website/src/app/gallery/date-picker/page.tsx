import type { Metadata } from 'next';
import { DatePickerGallery } from '@/components/patterns/date-picker-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.datePickerTitle'),
    description: translate(defaultMessages, locale, 'common.studio.datePickerSubtitle'),
  };
}

export default function DatePickerGalleryPage() {
  return <DatePickerGallery />;
}

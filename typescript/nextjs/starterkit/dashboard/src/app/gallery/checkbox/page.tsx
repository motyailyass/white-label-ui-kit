import type { Metadata } from 'next';
import { CheckboxGallery } from '@/components/patterns/checkbox-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.checkboxGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.checkboxGallery.metaDescription'),
  };
}

export default function CheckboxGalleryPage() {
  return <CheckboxGallery />;
}

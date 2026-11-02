import type { Metadata } from 'next';
import { RadioGallery } from '@/components/patterns/radio-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.radioGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.radioGallery.metaDescription'),
  };
}

export default function RadioGalleryPage() {
  return <RadioGallery />;
}

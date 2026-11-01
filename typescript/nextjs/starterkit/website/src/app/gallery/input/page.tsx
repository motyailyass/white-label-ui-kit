import type { Metadata } from 'next';
import { InputGallery } from '@/components/patterns/input-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.inputGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.inputGallery.metaDescription'),
  };
}

export default function InputGalleryPage() {
  return <InputGallery />;
}

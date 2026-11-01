import type { Metadata } from 'next';
import { TextareaGallery } from '@/components/patterns/textarea-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.textareaGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.textareaGallery.metaDescription'),
  };
}

export default function TextareaGalleryPage() {
  return <TextareaGallery />;
}

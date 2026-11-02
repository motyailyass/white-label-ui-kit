import type { Metadata } from 'next';
import { SelectGallery } from '@/components/patterns/select-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.selectGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.selectGallery.metaDescription'),
  };
}

export default function SelectGalleryPage() {
  return <SelectGallery />;
}

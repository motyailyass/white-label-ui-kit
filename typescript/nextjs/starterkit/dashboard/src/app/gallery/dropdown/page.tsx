import type { Metadata } from 'next';
import { DropdownGallery } from '@/components/patterns/dropdown-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.dropdownGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.dropdownGallery.metaDescription'),
  };
}

export default function DropdownGalleryPage() {
  return <DropdownGallery />;
}

import type { Metadata } from 'next';
import { DropdownGallery } from '@/components/patterns/dropdown-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.dropdownTitle'),
    description: translate(defaultMessages, locale, 'common.studio.dropdownSubtitle'),
  };
}

export default function DropdownGalleryPage() {
  return <DropdownGallery />;
}

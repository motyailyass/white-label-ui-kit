import type { Metadata } from 'next';
import { FilterBarGallery } from '@/components/patterns/filter-bar-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.filterBarTitle'),
    description: translate(defaultMessages, locale, 'common.studio.filterBarSubtitle'),
  };
}

export default function FilterBarGalleryPage() {
  return <FilterBarGallery />;
}

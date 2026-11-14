import type { Metadata } from 'next';
import { CollapsibleGallery } from '@/components/patterns/collapsible-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.collapsibleTitle'),
    description: translate(defaultMessages, locale, 'common.studio.collapsibleSubtitle'),
  };
}

export default function CollapsibleGalleryPage() {
  return <CollapsibleGallery />;
}

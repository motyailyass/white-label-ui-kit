import type { Metadata } from 'next';
import { ToggleGallery } from '@/components/patterns/toggle-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.toggleTitle'),
    description: translate(defaultMessages, locale, 'common.studio.toggleSubtitle'),
  };
}

export default function ToggleGalleryPage() {
  return <ToggleGallery />;
}

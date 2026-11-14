import type { Metadata } from 'next';
import { SeparatorGallery } from '@/components/patterns/separator-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.separatorTitle'),
    description: translate(defaultMessages, locale, 'common.studio.separatorSubtitle'),
  };
}

export default function SeparatorGalleryPage() {
  return <SeparatorGallery />;
}

import type { Metadata } from 'next';
import { KbdGallery } from '@/components/patterns/kbd-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.kbdTitle'),
    description: translate(defaultMessages, locale, 'common.studio.kbdSubtitle'),
  };
}

export default function KbdGalleryPage() {
  return <KbdGallery />;
}

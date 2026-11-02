import type { Metadata } from 'next';
import { SwitchGallery } from '@/components/patterns/switch-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.switchGallery.metaTitle'),
    description: translate(defaultMessages, locale, 'common.switchGallery.metaDescription'),
  };
}

export default function SwitchGalleryPage() {
  return <SwitchGallery />;
}

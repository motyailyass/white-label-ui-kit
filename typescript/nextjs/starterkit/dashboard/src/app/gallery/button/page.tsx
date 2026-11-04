import type { Metadata } from 'next';
import { ButtonGallery } from '@/components/patterns/button-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.btnTitle'),
    description: translate(defaultMessages, locale, 'common.studio.btnSubtitle'),
  };
}

export default function ButtonGalleryPage() {
  return <ButtonGallery />;
}

import type { Metadata } from 'next';
import { HoverCardGallery } from '@/components/patterns/hover-card-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.hoverCardTitle'),
    description: translate(defaultMessages, locale, 'common.studio.hoverCardSubtitle'),
  };
}

export default function HoverCardGalleryPage() {
  return <HoverCardGallery />;
}

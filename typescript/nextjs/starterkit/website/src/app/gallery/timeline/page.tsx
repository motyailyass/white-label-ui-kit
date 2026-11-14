import type { Metadata } from 'next';
import { TimelineGallery } from '@/components/patterns/timeline-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.timelineTitle'),
    description: translate(defaultMessages, locale, 'common.studio.timelineSubtitle'),
  };
}

export default function TimelineGalleryPage() {
  return <TimelineGallery />;
}

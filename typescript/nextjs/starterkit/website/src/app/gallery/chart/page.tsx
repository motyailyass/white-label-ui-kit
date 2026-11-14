import type { Metadata } from 'next';
import { ChartGallery } from '@/components/patterns/chart-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.chartTitle'),
    description: translate(defaultMessages, locale, 'common.studio.chartSubtitle'),
  };
}

export default function ChartGalleryPage() {
  return <ChartGallery />;
}

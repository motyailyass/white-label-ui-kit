import type { Metadata } from 'next';
import { SliderGallery } from '@/components/patterns/slider-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.sliderTitle'),
    description: translate(defaultMessages, locale, 'common.studio.sliderSubtitle'),
  };
}

export default function SliderGalleryPage() {
  return <SliderGallery />;
}

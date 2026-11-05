import type { Metadata } from 'next';
import { TooltipGallery } from '@/components/patterns/tooltip-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.tooltipTitle'),
    description: translate(defaultMessages, locale, 'common.studio.tooltipSubtitle'),
  };
}

export default function TooltipGalleryPage() {
  return <TooltipGallery />;
}

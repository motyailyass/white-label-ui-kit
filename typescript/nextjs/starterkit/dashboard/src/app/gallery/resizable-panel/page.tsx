import type { Metadata } from 'next';
import { ResizablePanelGallery } from '@/components/patterns/resizable-panel-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.resizablePanelTitle'),
    description: translate(defaultMessages, locale, 'common.studio.resizablePanelSubtitle'),
  };
}

export default function ResizablePanelGalleryPage() {
  return <ResizablePanelGallery />;
}

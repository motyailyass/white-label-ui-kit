import type { Metadata } from 'next';
import { ContextMenuGallery } from '@/components/patterns/context-menu-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.contextMenuTitle'),
    description: translate(defaultMessages, locale, 'common.studio.contextMenuSubtitle'),
  };
}

export default function ContextMenuGalleryPage() {
  return <ContextMenuGallery />;
}

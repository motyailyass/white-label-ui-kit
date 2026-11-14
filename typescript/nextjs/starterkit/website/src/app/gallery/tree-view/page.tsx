import type { Metadata } from 'next';
import { TreeViewGallery } from '@/components/patterns/tree-view-gallery';
import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from '../../i18n-server';

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerI18nState('en');
  return {
    title: translate(defaultMessages, locale, 'common.studio.treeViewTitle'),
    description: translate(defaultMessages, locale, 'common.studio.treeViewSubtitle'),
  };
}

export default function TreeViewGalleryPage() {
  return <TreeViewGallery />;
}

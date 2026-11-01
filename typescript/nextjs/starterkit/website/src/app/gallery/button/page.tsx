import type { Metadata } from 'next';
import { ButtonGallery } from '@/components/patterns/button-gallery';

export const metadata: Metadata = {
  title: 'Button Component Gallery | Website Starter',
  description: 'Visual demonstration and usage specifications for the Button primitive.',
};

export default function ButtonGalleryPage() {
  return <ButtonGallery />;
}

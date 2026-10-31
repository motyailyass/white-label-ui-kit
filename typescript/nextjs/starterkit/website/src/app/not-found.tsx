'use client';

import Link from 'next/link';
import { NotFoundState } from '@/components/patterns';
import styles from './status-page.module.css';

export default function RootNotFound() {
  return (
    <main className={styles.statusContainer}>
      <NotFoundState as={Link} />
    </main>
  );
}

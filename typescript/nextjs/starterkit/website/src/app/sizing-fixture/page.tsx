import { notFound } from 'next/navigation';
import { ControlSizingFixture } from '@/components/patterns/control-sizing-fixture';
import styles from './sizing-fixture.module.css';

export const dynamic = 'force-dynamic';

export default function SizingFixturePage() {
  // Sizing fixtures belong strictly to development and test infrastructure.
  // Production builds and delivered applications never expose this route unless explicitly enabled.
  if (process.env.NODE_ENV === 'production' && process.env.ENABLE_TEST_FIXTURES !== 'true') {
    notFound();
  }

  return (
    <main className={styles.main}>
      <ControlSizingFixture />
    </main>
  );
}

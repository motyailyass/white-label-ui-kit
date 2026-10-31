import { defaultMessages, translate } from '@/i18n';
import { getServerI18nState } from './i18n-server';
import styles from './loading.module.css';

export default async function RootLoading() {
  const { locale } = await getServerI18nState('en');
  const loadingLabel = translate(defaultMessages, locale, 'common.loading');

  return (
    <main className={styles.loadingContainer}>
      <h1 className="sr-only">{loadingLabel}</h1>
      <div className={styles.spinner} role="status" aria-label={loadingLabel} />
    </main>
  );
}

import styles from './loading.module.css';

export default function RootLoading() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner} role="status" aria-label="Loading" />
    </div>
  );
}

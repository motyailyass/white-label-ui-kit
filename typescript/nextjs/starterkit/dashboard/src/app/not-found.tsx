import { NotFoundState } from '@/components/patterns';

export default function RootNotFound() {
  return (
    <main
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-base)',
      }}
    >
      <NotFoundState />
    </main>
  );
}

export default function RootLoading() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-base)',
        color: 'var(--color-text-muted)',
        fontSize: 'var(--font-size-sm)',
      }}
    >
      <div
        style={{
          width: '24px',
          height: '24px',
          border: '2px solid var(--color-border-subtle)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
    </div>
  );
}

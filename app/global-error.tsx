'use client';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#0f0f0f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Something went wrong</h1>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            {error.digest ? `Error ID: ${error.digest}` : 'An unexpected error occurred.'}
          </p>
          <button
            onClick={unstable_retry}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.75rem 2rem', fontSize: '1rem', cursor: 'pointer' }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}

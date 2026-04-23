'use client';

import Link from 'next/link';

export default function BookingError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="font-display text-5xl tracking-wide mb-3">Booking Unavailable</h1>
        <p className="text-muted-foreground mb-2">
          We couldn&apos;t load the booking page. Please try again or contact us directly.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground mb-6 font-mono">Error: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={unstable_retry}
            className="bg-[#6366f1] hover:bg-[#4f46e5] text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Try again
          </button>
          <Link
            href="/contact"
            className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Contact us
          </Link>
          <Link
            href="/"
            className="bg-muted hover:bg-muted/80 text-foreground font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

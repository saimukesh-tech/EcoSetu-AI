import { clsx } from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('bg-surface-sunken rounded-lg animate-pulse-soft', className)} aria-hidden="true" />;
}

export function SkeletonRows({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={clsx('space-y-3', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
      <span className="sr-only">Loading content…</span>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border-subtle bg-surface-elevated p-5 space-y-3" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-7 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

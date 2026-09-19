import React from 'react';
import { clsx } from 'clsx';

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col items-center text-center py-14 px-6 animate-fade-up', className)}>
      <div className="w-14 h-14 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-h4 mb-1.5">{title}</h3>
      <p className="text-body-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6 animate-fade-up" role="alert">
      <div className="w-14 h-14 rounded-full bg-error-subtle text-error flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        </svg>
      </div>
      <h3 className="text-h4 mb-1.5">{title}</h3>
      <p className="text-body-sm text-text-muted max-w-sm mb-6">{description}</p>
      {action}
    </div>
  );
}

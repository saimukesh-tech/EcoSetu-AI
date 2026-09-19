import React from 'react';
import { clsx } from 'clsx';

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={clsx('flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8', className)}>
      <div>
        {eyebrow && <p className="text-label text-brand-primary uppercase tracking-wide mb-1.5">{eyebrow}</p>}
        <h1 className="text-h2 sm:text-h1 text-text-primary">{title}</h1>
        {description && <p className="text-body-sm text-text-muted mt-1.5 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}

export function SectionHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div>
        <h2 className="text-h4">{title}</h2>
        {description && <p className="text-caption text-text-muted mt-0.5">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

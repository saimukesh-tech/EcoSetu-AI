import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const colorMap: Record<string, string> = {
  primary: 'bg-brand-primary/12 text-brand-primary',
  accent: 'bg-brand-accent/18 text-brand-accent-strong',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  error: 'bg-error-subtle text-error',
  info: 'bg-info-subtle text-info',
  neutral: 'bg-surface-sunken text-text-secondary',
};

export function Badge({ children, color = 'neutral', size = 'md', dot = false }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-semibold rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-caption',
      colorMap[color]
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

const STATUS_MAP: Record<string, { color: BadgeProps['color']; label: string }> = {
  PENDING: { color: 'warning', label: 'Pending' },
  MATCHED: { color: 'info', label: 'Matched' },
  ACCEPTED: { color: 'primary', label: 'Accepted' },
  SCHEDULED: { color: 'info', label: 'Scheduled' },
  CONFIRMED: { color: 'primary', label: 'Confirmed' },
  IN_PROGRESS: { color: 'accent', label: 'In Progress' },
  COMPLETED: { color: 'success', label: 'Completed' },
  CANCELLED: { color: 'error', label: 'Cancelled' },
  DRAFT: { color: 'neutral', label: 'Draft' },
  ACTIVE: { color: 'success', label: 'Active' },
};

export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_MAP[status] || { color: 'neutral' as const, label: status };
  return <Badge color={cfg.color} dot>{cfg.label}</Badge>;
}

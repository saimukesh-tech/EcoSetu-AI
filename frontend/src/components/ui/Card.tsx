import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section';
  style?: React.CSSProperties;
}

export function Card({ children, className, hover = false, padding = 'md', as: Tag = 'div', style }: CardProps) {
  const paddings = { none: '', sm: 'p-4', md: 'p-5 sm:p-6', lg: 'p-7 sm:p-8' };
  return (
    <Tag
      style={style}
      className={clsx(
        'bg-surface-elevated rounded-xl border border-border-subtle shadow-soft',
        hover && 'transition-all duration-200 ease-out hover:shadow-elevated hover:-translate-y-1 hover:border-brand-primary/25 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </Tag>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  tone?: 'primary' | 'accent' | 'info' | 'neutral';
  trend?: { direction: 'up' | 'down'; label: string };
}

export function StatCard({ label, value, sub, icon, tone = 'primary', trend }: StatCardProps) {
  const tones: Record<string, string> = {
    primary: 'bg-brand-primary/10 text-brand-primary',
    accent: 'bg-brand-accent/15 text-brand-accent-strong',
    info: 'bg-info-subtle text-info',
    neutral: 'bg-surface-sunken text-text-secondary',
  };
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label text-text-muted mb-1.5 uppercase tracking-wide">{label}</p>
          <p className="text-h3 text-text-primary tabular-nums">{value}</p>
          {sub && <p className="text-caption text-text-muted mt-1">{sub}</p>}
          {trend && (
            <p className={clsx('text-caption font-semibold mt-1.5 flex items-center gap-1', trend.direction === 'up' ? 'text-success' : 'text-error')}>
              {trend.direction === 'up' ? '↑' : '↓'} {trend.label}
            </p>
          )}
        </div>
        <span className={clsx('p-2.5 rounded-lg shrink-0', tones[tone])}>{icon}</span>
      </div>
    </Card>
  );
}

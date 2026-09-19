import React from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base = clsx(
    'group relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg whitespace-nowrap',
    'transition-all duration-200 ease-out select-none',
    'focus-visible:outline-none focus-visible:shadow-focus-ring',
    'active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 disabled:hover:translate-y-0'
  );

  const variants: Record<string, string> = {
    primary: 'bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover shadow-soft hover:shadow-natural hover:-translate-y-px',
    secondary: 'bg-brand-secondary text-text-on-brand hover:brightness-95 shadow-soft hover:shadow-natural hover:-translate-y-px',
    accent: 'bg-gold-gradient text-brand-forest hover:brightness-105 shadow-soft hover:shadow-natural hover:-translate-y-px',
    outline: 'border-[1.5px] border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary/10',
    ghost: 'text-brand-primary bg-transparent hover:bg-brand-primary/10',
    danger: 'bg-error text-white hover:brightness-95 shadow-soft hover:shadow-natural hover:-translate-y-px',
  };

  const sizes: Record<string, string> = {
    sm: 'px-3.5 py-1.5 text-body-sm',
    md: 'px-5 py-2.5 text-body-sm',
    lg: 'px-6 py-3 text-body',
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      ) : icon && iconPosition === 'left' ? (
        <span className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true">{icon}</span>
      ) : null}
      {loading ? <span>Please wait…</span> : children}
      {!loading && icon && iconPosition === 'right' && (
        <span className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">{icon}</span>
      )}
    </button>
  );
}

export function IconButton({
  icon,
  label,
  variant = 'ghost',
  size = 'md',
  className,
  ...props
}: {
  icon: React.ReactNode;
  label: string;
  variant?: 'ghost' | 'outline' | 'solid';
  size?: 'sm' | 'md' | 'lg';
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const sizes = { sm: 'w-8 h-8', md: 'w-9 h-9', lg: 'w-11 h-11' };
  const variants = {
    ghost: 'text-text-secondary hover:text-brand-primary hover:bg-brand-primary/10',
    outline: 'border border-border text-text-secondary hover:text-brand-primary hover:border-brand-primary',
    solid: 'bg-brand-primary text-text-on-brand hover:bg-brand-primary-hover',
  };
  return (
    <button
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex items-center justify-center rounded-lg transition-all duration-200 ease-out',
        'hover:scale-[1.06] active:scale-[0.94]',
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        sizes[size], variants[variant], className
      )}
      {...props}
    >
      {icon}
    </button>
  );
}

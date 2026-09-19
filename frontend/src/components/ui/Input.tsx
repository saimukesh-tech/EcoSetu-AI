import React, { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

const fieldBase = clsx(
  'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-body-sm text-text-primary placeholder-text-muted',
  'transition-all duration-200 ease-out',
  'hover:border-border-strong',
  'focus:outline-none focus:border-brand-primary focus:shadow-focus-ring'
);

export function Input({ label, error, hint, icon, className, id, required, ...props }: InputProps) {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errId = error ? `${inputId}-error` : undefined;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label text-text-secondary mb-1.5">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">{icon}</span>}
        <input
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={clsx(hintId, errId) || undefined}
          className={clsx(fieldBase, icon && 'pl-10', error && 'border-error focus:border-error', !error && 'border-border', className)}
          {...props}
        />
      </div>
      {error && <p id={errId} className="mt-1.5 text-caption text-error">{error}</p>}
      {hint && !error && <p id={hintId} className="mt-1.5 text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, error, hint, options, className, id, required, ...props }: SelectProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label text-text-secondary mb-1.5">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={!!error || undefined}
          className={clsx(fieldBase, 'appearance-none pr-9', error ? 'border-error' : 'border-border', className)}
          {...props}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
      </div>
      {error && <p className="mt-1.5 text-caption text-error">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Textarea({ label, error, hint, className, id, required, ...props }: TextareaProps) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-label text-text-secondary mb-1.5">
          {label} {required && <span className="text-error">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        className={clsx(fieldBase, 'resize-none', error ? 'border-error' : 'border-border', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-caption text-error">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-caption text-text-muted">{hint}</p>}
    </div>
  );
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label?: string; id?: string }) {
  const autoId = useId();
  const switchId = id || autoId;
  return (
    <label htmlFor={switchId} className="inline-flex items-center gap-2.5 cursor-pointer select-none">
      <button
        id={switchId}
        role="switch"
        aria-checked={checked}
        type="button"
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative w-10 h-6 rounded-full transition-all duration-200 ease-out active:scale-95 focus-visible:outline-none focus-visible:shadow-focus-ring',
          checked ? 'bg-brand-primary' : 'bg-surface-sunken border border-border hover:border-border-strong'
        )}
      >
        <span className={clsx(
          'absolute top-0.5 w-5 h-5 rounded-full bg-surface-elevated shadow-soft transition-transform duration-200 ease-out',
          checked ? 'translate-x-[18px]' : 'translate-x-0.5'
        )} />
      </button>
      {label && <span className="text-body-sm text-text-secondary">{label}</span>}
    </label>
  );
}

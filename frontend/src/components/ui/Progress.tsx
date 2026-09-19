import { clsx } from 'clsx';

export function ProgressBar({ value, tone = 'primary', label }: { value: number; tone?: 'primary' | 'accent'; label?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div>
      {label && <p className="text-caption text-text-muted mb-1">{label}</p>}
      <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', tone === 'primary' ? 'bg-brand-primary' : 'bg-gold-gradient')}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export function ProgressRing({ value, size = 96, strokeWidth = 9, label, sublabel }: { value: number; size?: number; strokeWidth?: number; label?: string; sublabel?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" role="img" aria-label={`${label ?? 'Progress'}: ${clamped}%`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgb(var(--color-surface-sunken))" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="rgb(var(--color-brand-primary))" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-h4 tabular-nums leading-none">{clamped}%</span>
        {sublabel && <span className="text-caption text-text-muted mt-0.5">{sublabel}</span>}
      </div>
    </div>
  );
}

import { clsx } from 'clsx';

export interface WasteCategory {
  key: string;
  label: string;
  value: number;
  color: string; // CSS color value
}

/** Accessible donut chart: SVG arcs + a visually-hidden data table so the
 * breakdown is available to screen readers, not just as color/shape. */
export function WasteDonut({ categories, totalLabel = 'Total' }: { categories: WasteCategory[]; totalLabel?: string }) {
  const total = categories.reduce((s, c) => s + c.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[160px] h-[160px]">
        <svg viewBox="0 0 160 160" width={160} height={160} className="-rotate-90" role="img" aria-hidden="true">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="rgb(var(--color-surface-sunken))" strokeWidth={20} />
          {categories.map((cat) => {
            const fraction = cat.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const el = (
              <circle
                key={cat.key}
                cx="80" cy="80" r={radius} fill="none"
                stroke={cat.color} strokeWidth={20}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAcc}
                strokeLinecap="butt"
              />
            );
            offsetAcc += dash;
            return el;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-h3 tabular-nums leading-none">{total}</span>
          <span className="text-caption text-text-muted mt-1">{totalLabel} (kg)</span>
        </div>
      </div>

      <table className="sr-only">
        <caption>Waste breakdown by category, in kilograms</caption>
        <thead><tr><th>Category</th><th>Kilograms</th></tr></thead>
        <tbody>
          {categories.map(c => <tr key={c.key}><td>{c.label}</td><td>{c.value}</td></tr>)}
        </tbody>
      </table>
    </div>
  );
}

export function WasteBars({ categories }: { categories: WasteCategory[] }) {
  const total = categories.reduce((s, c) => s + c.value, 0) || 1;
  return (
    <div className="space-y-3.5" role="img" aria-label="Waste breakdown bar chart">
      {categories.map(cat => (
        <div key={cat.key}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-body-sm text-text-secondary">{cat.label}</span>
            <span className="text-body-sm font-semibold text-text-primary tabular-nums">{cat.value} kg</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-sunken overflow-hidden">
            <div
              className={clsx('h-full rounded-full transition-all duration-500 ease-out')}
              style={{ width: `${(cat.value / total) * 100}%`, background: cat.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ImpactTrend({ points }: { points: { label: string; value: number }[] }) {
  if (points.length === 0) return null;
  const max = Math.max(...points.map(p => p.value), 1);
  const w = 320;
  const h = 96;
  const stepX = points.length > 1 ? w / (points.length - 1) : 0;
  const coords = points.map((p, i) => [i * stepX, h - (p.value / max) * (h - 12) - 6] as const);
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} preserveAspectRatio="none" role="img" aria-label="Impact over time trend line">
        <path d={path} fill="none" stroke="rgb(var(--color-brand-primary))" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        {coords.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3} fill="rgb(var(--color-brand-primary))" />)}
      </svg>
      <div className="flex justify-between mt-1.5">
        {points.map((p, i) => <span key={i} className="text-[10px] text-text-muted">{p.label}</span>)}
      </div>
    </div>
  );
}

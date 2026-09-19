import { PartyPopper, Trash2, Sparkles, Handshake, Users, Leaf } from 'lucide-react';

interface Stage {
  key: string;
  label: string;
  icon: React.ReactNode;
}

const STAGES: Stage[] = [
  { key: 'celebration', label: 'Celebration', icon: <PartyPopper size={16} /> },
  { key: 'waste', label: 'Waste', icon: <Trash2 size={16} /> },
  { key: 'ai', label: 'AI Insight', icon: <Sparkles size={16} /> },
  { key: 'recovery', label: 'Recovery', icon: <Handshake size={16} /> },
  { key: 'community', label: 'Community', icon: <Users size={16} /> },
  { key: 'impact', label: 'Circular Impact', icon: <Leaf size={16} /> },
];

/**
 * The product's signature visual metaphor:
 * Celebration -> Waste -> AI Insight -> Recovery -> Community -> Circular Impact -> (loops back)
 * Reused (at different sizes) on the landing page and inside dashboards so the
 * whole product shares one consistent circular-economy visual language.
 */
export function CircularJourney({ size = 360, labels = true, animate = true }: { size?: number; labels?: boolean; animate?: boolean }) {
  const cx = 200;
  const cy = 200;
  const r = 148;
  const nodeR = 30;
  const positions = STAGES.map((s, i) => {
    const angle = (Math.PI * 2 * i) / STAGES.length - Math.PI / 2;
    return { ...s, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });

  const pathD = positions
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 400 400" width={size} height={size} role="img" aria-label="Circular journey: celebration to waste, AI insight, recovery, community, and circular impact">
        <title>Celebration → Waste → AI Insight → Recovery → Community → Circular Impact</title>
        <defs>
          <linearGradient id="cj-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(var(--color-brand-secondary))" />
            <stop offset="100%" stopColor="rgb(var(--color-brand-accent))" />
          </linearGradient>
        </defs>

        {/* base ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgb(var(--color-border))" strokeWidth={1.5} strokeDasharray="1 8" strokeLinecap="round" />

        {/* flowing connective path */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#cj-line)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeDasharray="10 14"
          className={animate ? 'animate-flow-dash' : undefined}
          opacity={0.85}
        />

        {/* nodes */}
        {positions.map((p) => (
          <g key={p.key}>
            <circle cx={p.x} cy={p.y} r={nodeR} fill="rgb(var(--color-surface-elevated))" stroke="rgb(var(--color-border))" strokeWidth={1} />
            <foreignObject x={p.x - 14} y={p.y - 14} width={28} height={28}>
              <div className="w-full h-full flex items-center justify-center text-brand-primary">{p.icon}</div>
            </foreignObject>
          </g>
        ))}

        {/* center mark */}
        <circle cx={cx} cy={cy} r={3} fill="rgb(var(--color-brand-accent))" />
      </svg>

      {labels && (
        <div className="pointer-events-none">
          {positions.map((p) => {
            const leftPct = (p.x / 400) * 100;
            const topPct = (p.y / 400) * 100;
            return (
              <span
                key={p.key}
                className="absolute -translate-x-1/2 text-[11px] font-semibold text-text-secondary whitespace-nowrap"
                style={{
                  left: `${leftPct}%`,
                  top: `${topPct}%`,
                  transform: `translate(-50%, ${p.y < cy ? '-140%' : '55%'})`,
                }}
              >
                {p.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useId } from 'react';
import { clsx } from 'clsx';

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
}

export function Tabs({ tabs, active, onChange, className }: { tabs: Tab[]; active: string; onChange: (key: string) => void; className?: string }) {
  const name = useId();
  function handleKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'ArrowRight') onChange(tabs[(idx + 1) % tabs.length].key);
    if (e.key === 'ArrowLeft') onChange(tabs[(idx - 1 + tabs.length) % tabs.length].key);
  }
  return (
    <div className="max-w-full overflow-x-auto scrollbar-hide -mx-0.5 px-0.5">
      <div role="tablist" aria-label="Sections" className={clsx('inline-flex items-center gap-1 p-1 rounded-lg bg-surface-sunken border border-border-subtle w-max', className)}>
        {tabs.map((tab, i) => (
          <button
            key={tab.key}
            role="tab"
            id={`${name}-${tab.key}`}
            aria-selected={active === tab.key}
            tabIndex={active === tab.key ? 0 : -1}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-body-sm font-semibold whitespace-nowrap transition-all duration-180',
              'focus-visible:outline-none focus-visible:shadow-focus-ring',
              active === tab.key ? 'bg-surface-elevated text-brand-primary shadow-soft' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

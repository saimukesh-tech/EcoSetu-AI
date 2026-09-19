import React, { useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';

interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  danger?: boolean;
}

export function Dropdown({ trigger, items, align = 'right' }: { trigger: React.ReactNode; items: DropdownItem[]; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handler);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open} className="focus-visible:outline-none focus-visible:shadow-focus-ring rounded-lg">
        {trigger}
      </button>
      {open && (
        <div
          role="menu"
          className={clsx(
            'absolute top-full mt-2 w-52 z-50 py-1.5 rounded-xl bg-surface-elevated border border-border-subtle shadow-elevated animate-scale-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map(item => (
            <button
              key={item.key}
              role="menuitem"
              onClick={() => { item.onSelect(); setOpen(false); }}
              className={clsx(
                'w-full flex items-center gap-2.5 px-4 py-2 text-body-sm text-left transition-colors duration-200',
                item.danger ? 'text-error hover:bg-error-subtle' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary'
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

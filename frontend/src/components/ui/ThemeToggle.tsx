import React, { useRef, useState, useEffect } from 'react';
import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { clsx } from 'clsx';

type ThemeOption = { value: 'light' | 'dark' | 'system'; label: string; icon: React.ReactNode };

const OPTIONS: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: <Sun size={14} /> },
  { value: 'dark', label: 'Dark', icon: <Moon size={14} /> },
  { value: 'system', label: 'System', icon: <Monitor size={14} /> },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const current = OPTIONS.find(o => o.value === theme) ?? OPTIONS[2];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={clsx(
          'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-body-sm font-medium transition-colors duration-180',
          'bg-surface-sunken text-text-secondary hover:text-text-primary border border-border-subtle',
          'focus-visible:outline-none focus-visible:shadow-focus-ring'
        )}
        aria-label={`Theme: ${current.label}. Change theme`}
      >
        {current.icon}
        <span className="hidden sm:inline text-caption">{current.label}</span>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 top-full mt-1.5 w-36 z-50 bg-surface-elevated rounded-xl shadow-elevated border border-border-subtle py-1 overflow-hidden animate-scale-in">
          {OPTIONS.map(opt => (
            <button
              key={opt.value}
              role="menuitemradio"
              aria-checked={theme === opt.value}
              onClick={() => { setTheme(opt.value); setOpen(false); }}
              className={clsx(
                'w-full flex items-center justify-between px-3 py-2 text-body-sm transition-colors',
                theme === opt.value ? 'bg-brand-primary/10 text-brand-primary font-semibold' : 'text-text-secondary hover:bg-surface-sunken'
              )}
            >
              <span className="flex items-center gap-2">{opt.icon}{opt.label}</span>
              {theme === opt.value && <Check size={12} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

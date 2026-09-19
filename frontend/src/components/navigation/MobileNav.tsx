import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import type { NavItem } from './navConfig';

export function MobileBottomNav({ items }: { items: NavItem[] }) {
  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-elevated border-t border-border-subtle pb-[env(safe-area-inset-bottom)]"
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0,1fr))` }}>
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => clsx(
              'flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-brand-primary' : 'text-text-muted'
            )}
          >
            {item.icon}
            <span>{item.mobileLabel || item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

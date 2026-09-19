import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { BrandLogo } from '../brand/BrandLogo';
import type { NavItem } from './navConfig';
import { settingsNav } from './navConfig';

interface SidebarProps {
  navItems: NavItem[];
  roleLabel: string;
  userName: string;
  userEmail: string;
  photoURL?: string;
  onLogout: () => void;
  onNavigate?: () => void;
}

function navLinkClass(isActive: boolean) {
  return clsx(
    'group relative flex items-center gap-3 pl-4 pr-3.5 py-2.5 rounded-lg text-body-sm font-medium',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:shadow-focus-ring',
    isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-text-secondary hover:bg-surface-sunken hover:text-text-primary hover:translate-x-0.5'
  );
}

function NavActiveBar({ isActive }: { isActive: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={clsx(
        'absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-full bg-brand-primary transition-all duration-200 ease-out',
        isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
      )}
    />
  );
}

export function Sidebar({ navItems, roleLabel, userName, userEmail, photoURL, onLogout, onNavigate }: SidebarProps) {
  return (
    <aside className="flex flex-col h-full w-64 bg-surface-elevated border-r border-border-subtle">
      <div className="px-5 py-5 border-b border-border-subtle">
        <BrandLogo size={38} wordmarkClassName="text-body" />
      </div>

      <div className="mx-4 mt-4 px-3.5 py-2 rounded-lg bg-brand-primary/10">
        <p className="text-caption font-semibold text-brand-primary">{roleLabel}</p>
      </div>

      <nav className="flex-1 px-3 mt-4 space-y-1 overflow-y-auto" aria-label="Primary">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
            {({ isActive }) => (
              <>
                <NavActiveBar isActive={isActive} />
                <span className="transition-transform duration-200 group-hover:scale-110">{item.icon}</span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
        <div className="pt-2 mt-2 border-t border-border-subtle">
          <NavLink to={settingsNav.to} onClick={onNavigate} className={({ isActive }) => navLinkClass(isActive)}>
            {({ isActive }) => (
              <>
                <NavActiveBar isActive={isActive} />
                <span className="transition-transform duration-200 group-hover:scale-110">{settingsNav.icon}</span>
                {settingsNav.label}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      <div className="px-4 pb-5 pt-3 border-t border-border-subtle">
        <div className="flex items-center gap-2.5">
          {photoURL ? (
            <img src={photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-brand-primary text-text-on-brand flex items-center justify-center text-body-sm font-bold shrink-0">
              {(userName?.[0] || userEmail?.[0] || 'U').toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-body-sm font-semibold text-text-primary truncate">{userName}</p>
            <p className="text-caption text-text-muted truncate">{userEmail}</p>
          </div>
          <button onClick={onLogout} aria-label="Sign out" title="Sign out" className="text-text-muted hover:text-error hover:bg-error-subtle transition-all duration-200 hover:scale-110 active:scale-95 p-1.5 rounded-md focus-visible:outline-none focus-visible:shadow-focus-ring">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

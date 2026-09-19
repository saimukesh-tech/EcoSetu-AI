import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { IconButton } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
import { Drawer } from '../ui/Modal';
import { Sidebar } from '../navigation/Sidebar';
import { MobileBottomNav } from '../navigation/MobileNav';
import { BrandLogo } from '../brand/BrandLogo';
import { organizerNav, partnerNav, organizerMobileNav, partnerMobileNav, settingsNav } from '../navigation/navConfig';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isPartner = userProfile?.role === 'RECOVERY_PARTNER';
  const navItems = isPartner ? partnerNav : organizerNav;
  const mobileItems = isPartner ? partnerMobileNav : organizerMobileNav;
  const roleLabel = isPartner ? 'Recovery Partner' : 'Event Organizer';
  const userName = userProfile?.name || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User';

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="sr-only-focusable fixed top-2 left-2 z-[999] bg-surface-elevated text-text-primary px-3 py-2 rounded-lg shadow-elevated">
        Skip to main content
      </a>

      <div className="flex h-screen overflow-hidden">
        <div className="hidden md:flex md:shrink-0">
          <Sidebar
            navItems={navItems}
            roleLabel={roleLabel}
            userName={userName}
            userEmail={currentUser?.email || ''}
            photoURL={currentUser?.photoURL || undefined}
            onLogout={handleLogout}
          />
        </div>

        <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Menu">
          <Sidebar
            navItems={navItems}
            roleLabel={roleLabel}
            userName={userName}
            userEmail={currentUser?.email || ''}
            photoURL={currentUser?.photoURL || undefined}
            onLogout={handleLogout}
            onNavigate={() => setDrawerOpen(false)}
          />
        </Drawer>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-4 md:px-6 py-3 bg-surface-elevated border-b border-border-subtle">
            <div className="flex items-center gap-3 min-w-0">
              <IconButton icon={<Menu size={20} />} label="Open menu" onClick={() => setDrawerOpen(true)} className="md:hidden" />
              <div className="md:hidden">
                <BrandLogo size={30} wordmarkClassName="text-body-sm" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <IconButton icon={<Bell size={18} />} label="Notifications" />
              <Dropdown
                align="right"
                trigger={
                  currentUser?.photoURL ? (
                    <img src={currentUser.photoURL} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-brand-primary text-text-on-brand flex items-center justify-center text-body-sm font-bold">
                      {(userName?.[0] || 'U').toUpperCase()}
                    </div>
                  )
                }
                items={[
                  { key: 'settings', label: settingsNav.label, icon: <SettingsIcon size={15} />, onSelect: () => navigate('/settings') },
                  { key: 'logout', label: 'Sign out', icon: <LogOut size={15} />, onSelect: handleLogout, danger: true },
                ]}
              />
            </div>
          </header>

          <main id="main-content" className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
            {children}
          </main>
        </div>
      </div>

      <MobileBottomNav items={mobileItems} />
    </div>
  );
}

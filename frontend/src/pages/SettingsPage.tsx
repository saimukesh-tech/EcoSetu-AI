import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Switch } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { Sun, Moon, Monitor, User, ShieldCheck, Palette, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { clsx } from 'clsx';

const TABS = [
  { key: 'profile', label: 'Profile', icon: <User size={14} /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette size={14} /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
];

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Light', icon: <Sun size={18} /> },
  { value: 'dark' as const, label: 'Dark', icon: <Moon size={18} /> },
  { value: 'system' as const, label: 'System', icon: <Monitor size={18} /> },
];

export default function SettingsPage() {
  const { currentUser, userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState('profile');
  const [pickupUpdates, setPickupUpdates] = useState(true);
  const [aiTips, setAiTips] = useState(false);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Settings" description="Manage your profile, appearance and notification preferences." />

        <div className="mb-6"><Tabs tabs={TABS} active={tab} onChange={setTab} /></div>

        {tab === 'profile' && (
          <Card>
            <h2 className="text-h4 mb-5">Profile</h2>
            <div className="flex items-center gap-4 mb-6">
              {currentUser?.photoURL ? (
                <img src={currentUser.photoURL} alt="" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-brand-primary text-text-on-brand flex items-center justify-center text-h3 font-bold">
                  {(userProfile?.name?.[0] || currentUser?.email?.[0] || 'U').toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-text-primary">{userProfile?.name || currentUser?.displayName || 'User'}</p>
                <p className="text-caption text-text-muted flex items-center gap-1"><ShieldCheck size={12} />{userProfile?.role === 'RECOVERY_PARTNER' ? 'Recovery Partner' : 'Event Organizer'}</p>
              </div>
            </div>
            <div className="space-y-4">
              <Input label="Full name" defaultValue={userProfile?.name || currentUser?.displayName || ''} />
              <Input label="Email address" defaultValue={currentUser?.email || ''} disabled hint="Managed by your sign-in provider" />
            </div>
            <div className="mt-6"><Button disabled>Save Changes</Button></div>
          </Card>
        )}

        {tab === 'appearance' && (
          <Card>
            <h2 className="text-h4 mb-5">Appearance</h2>
            <p className="text-body-sm text-text-muted mb-4">Choose how EcoSetu AI looks on this device.</p>
            <div role="radiogroup" aria-label="Theme" className="grid grid-cols-3 gap-3">
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  role="radio"
                  aria-checked={theme === opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={clsx(
                    'flex flex-col items-center gap-2 py-5 rounded-xl border-2 transition-colors duration-180',
                    'focus-visible:outline-none focus-visible:shadow-focus-ring',
                    theme === opt.value ? 'border-brand-primary bg-brand-primary/10 text-brand-primary' : 'border-border-subtle text-text-secondary hover:bg-surface-sunken'
                  )}
                >
                  {opt.icon}
                  <span className="text-body-sm font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </Card>
        )}

        {tab === 'notifications' && (
          <Card>
            <h2 className="text-h4 mb-5">Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">Pickup status updates</p>
                  <p className="text-caption text-text-muted">Get notified when a pickup request changes status.</p>
                </div>
                <Switch checked={pickupUpdates} onChange={setPickupUpdates} />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-border-subtle pt-4">
                <div>
                  <p className="text-body-sm font-semibold text-text-primary">AI sustainability tips</p>
                  <p className="text-caption text-text-muted">Occasional suggestions to reduce waste at upcoming events.</p>
                </div>
                <Switch checked={aiTips} onChange={setAiTips} />
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

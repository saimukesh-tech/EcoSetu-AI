import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Recycle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/feedback/Alert';
import { BrandLogo } from '../components/brand/BrandLogo';
import { clsx } from 'clsx';
import { useAuth } from '../contexts/AuthContext';

const roles = [
  {
    id: 'ORGANIZER' as const,
    icon: <Calendar size={26} />,
    title: 'Event Organizer',
    desc: 'I organize weddings, corporate gatherings or festivals and want to manage waste responsibly.',
    benefits: ['AI waste prediction', 'Recovery partner matching', 'Pickup scheduling', 'Impact reports'],
  },
  {
    id: 'RECOVERY_PARTNER' as const,
    icon: <Recycle size={26} />,
    title: 'Recovery Partner',
    desc: 'I represent an NGO, composting facility, floral recycler or other waste-recovery organization.',
    benefits: ['Receive pickup requests', 'Manage capacity', 'Track recovery impact', 'Build a verified profile'],
  },
];

export default function OnboardingPage() {
  const { updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<'ORGANIZER' | 'RECOVERY_PARTNER' | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleContinue() {
    if (!selected) return;
    setLoading(true);
    try {
      await updateUserRole(selected);
    } catch {
      // Non-fatal — proceed seamlessly either way
    } finally {
      setLoading(false);
      navigate(selected === 'ORGANIZER' ? '/dashboard' : '/partner-dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-background-subtle flex flex-col items-center justify-center px-4 py-14">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <BrandLogo size={48} withWordmark={false} className="justify-center mb-4" />
          <h1 className="text-h1 text-text-primary mb-2">How will you use EcoSetu AI?</h1>
          <p className="text-body-sm text-text-muted">Choose your role — you can always ask us to change it later.</p>
        </div>

        <div role="radiogroup" aria-label="Choose your role" className="grid sm:grid-cols-2 gap-5 mb-8">
          {roles.map(role => {
            const active = selected === role.id;
            return (
              <button
                key={role.id}
                role="radio"
                aria-checked={active}
                onClick={() => setSelected(role.id)}
                className={clsx(
                  'text-left bg-surface-elevated rounded-2xl border-2 p-6 transition-all duration-180',
                  'focus-visible:outline-none focus-visible:shadow-focus-ring hover:shadow-natural',
                  active ? 'border-brand-primary shadow-natural' : 'border-border-subtle'
                )}
              >
                <div className={clsx('w-14 h-14 rounded-xl flex items-center justify-center mb-4', active ? 'bg-brand-primary text-text-on-brand' : 'bg-brand-primary/10 text-brand-primary')}>
                  {role.icon}
                </div>
                <h3 className="text-h4 mb-2">{role.title}</h3>
                <p className="text-body-sm text-text-muted mb-4 leading-relaxed">{role.desc}</p>
                <ul className="space-y-1.5">
                  {role.benefits.map(b => (
                    <li key={b} className="flex items-center gap-2 text-body-sm text-text-secondary">
                      <CheckCircle2 size={14} className="text-brand-primary shrink-0" />{b}
                    </li>
                  ))}
                </ul>
                {active && (
                  <div className="mt-4 flex items-center gap-1.5 text-caption font-bold text-brand-primary">
                    <CheckCircle2 size={14} /> Selected
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {!selected && <div className="mb-4"><Alert type="info">Select a role above to continue.</Alert></div>}

        <Button fullWidth size="lg" onClick={handleContinue} disabled={!selected} loading={loading}>
          Continue
        </Button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/feedback/Alert';
import { useAuth } from '../contexts/AuthContext';
import { createEvent } from '../lib/firestore';
import { clsx } from 'clsx';

const eventTypes = [
  { value: '', label: 'Select event type' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'Corporate', label: 'Corporate Event' },
  { value: 'Festival', label: 'Festival / Mela' },
  { value: 'Puja', label: 'Puja / Religious Event' },
  { value: 'Birthday', label: 'Birthday Party' },
  { value: 'Conference', label: 'Conference / Seminar' },
  { value: 'Other', label: 'Other' },
];
const foodTypes = [
  { value: '', label: 'Select food type' },
  { value: 'Veg', label: 'Vegetarian' },
  { value: 'Non-Veg', label: 'Non-Vegetarian' },
  { value: 'Mixed', label: 'Mixed' },
];
const cateringTypes = [
  { value: '', label: 'Select catering type' },
  { value: 'In-house', label: 'In-house / Home Catering' },
  { value: 'External Caterer', label: 'External Caterer' },
  { value: 'Buffet', label: 'Buffet Service' },
  { value: 'Sit-down', label: 'Sit-down Meal' },
];
const decorationTypes = [
  { value: '', label: 'Select decoration type' },
  { value: 'Flowers', label: 'Fresh Flowers Only' },
  { value: 'Flowers + Fabric', label: 'Flowers + Fabric' },
  { value: 'Flowers + Plastic', label: 'Flowers + Plastic' },
  { value: 'Minimal', label: 'Minimal' },
  { value: 'Elaborate', label: 'Elaborate / Multi-category' },
];

const STEPS = [
  { key: 'basics', label: 'Event Basics' },
  { key: 'attendance', label: 'Attendance & Duration' },
  { key: 'food', label: 'Food & Catering' },
  { key: 'decoration', label: 'Decoration' },
  { key: 'location', label: 'Location' },
  { key: 'review', label: 'Review' },
];

function localId() {
  return 'local_' + Math.random().toString(36).slice(2, 10);
}

export default function NewEventPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '',
    type: '',
    date: '',
    location: '',
    guestCount: '',
    duration: '',
    foodType: '',
    cateringType: '',
    decorationType: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function validateStep(i: number): string {
    if (i === 0) {
      if (!form.name.trim()) return 'Please enter an event name.';
      if (!form.type) return 'Please select an event type.';
      if (!form.date) return 'Please select an event date.';
    }
    if (i === 1) {
      if (!form.guestCount || parseInt(form.guestCount) < 1) return 'Please enter a valid guest count.';
    }
    if (i === 4) {
      if (!form.location.trim()) return 'Please enter a location.';
    }
    return '';
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }
  function goBack() {
    setError('');
    setStep(s => Math.max(s - 1, 0));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const uid = currentUser?.uid || 'demo_organizer_123';
    setError('');
    setLoading(true);

    const eventData = {
      name: form.name.trim(),
      type: form.type,
      date: form.date,
      location: form.location.trim(),
      guestCount: parseInt(form.guestCount) || 0,
      duration: parseInt(form.duration) || 4,
      foodType: form.foodType || 'Mixed',
      cateringType: form.cateringType || 'External Caterer',
      decorationType: form.decorationType || 'Flowers + Fabric',
      organizerUid: uid,
      status: 'DRAFT' as const,
    };

    try {
      const id = await createEvent(eventData);
      // Save locally as well to guarantee immediate visibility
      const existing = JSON.parse(localStorage.getItem('uc_events') || '[]');
      existing.unshift({ id, ...eventData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      localStorage.setItem('uc_events', JSON.stringify(existing));
      navigate(`/events/${id}`);
    } catch {
      // Seamless local fallback for offline/demo/unconfigured Firestore
      const id = localId();
      const existing = JSON.parse(localStorage.getItem('uc_events') || '[]');
      existing.unshift({ id, ...eventData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), _local: true });
      localStorage.setItem('uc_events', JSON.stringify(existing));
      navigate(`/events/${id}`);
    } finally {
      setLoading(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-h1 text-text-primary">Create New Event</h1>
          <p className="text-body-sm text-text-muted mt-1">
            Step {step + 1} of {STEPS.length}: {STEPS[step].label}
          </p>
        </div>

        {/* Progress indicator */}
        <ol className="flex items-center gap-1.5 mb-6" aria-label="Event creation progress">
          {STEPS.map((s, i) => (
            <li key={s.key} className="flex-1">
              <div className={clsx('h-1.5 rounded-full transition-colors duration-240', i <= step ? 'bg-brand-primary' : 'bg-surface-sunken')} />
              <span className="sr-only">
                {s.label} {i < step ? '(complete)' : i === step ? '(current)' : ''}
              </span>
            </li>
          ))}
        </ol>

        <Card>
          <form
            onSubmit={
              isLastStep
                ? handleSubmit
                : e => {
                    e.preventDefault();
                    goNext();
                  }
            }
            noValidate
          >
            {error && (
              <div className="mb-5">
                <Alert type="error" title="Check this step">
                  {error}
                </Alert>
              </div>
            )}

            {step === 0 && (
              <div className="space-y-4 animate-fade-up">
                <Input label="Event Name" required placeholder="e.g. Anu Anniversary" value={form.name} onChange={e => set('name', e.target.value)} />
                <Select label="Event Type" required options={eventTypes} value={form.type} onChange={e => set('type', e.target.value)} />
                <Input label="Event Date" required type="date" value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
            )}

            {step === 1 && (
              <div className="grid sm:grid-cols-2 gap-4 animate-fade-up">
                <Input
                  label="Guest Count"
                  required
                  type="number"
                  min="1"
                  placeholder="200"
                  value={form.guestCount}
                  onChange={e => set('guestCount', e.target.value)}
                />
                <Input
                  label="Duration (hours)"
                  type="number"
                  min="1"
                  placeholder="6"
                  hint="Defaults to 4 hours if left blank"
                  value={form.duration}
                  onChange={e => set('duration', e.target.value)}
                />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-up">
                <Select label="Food Type" options={foodTypes} value={form.foodType} onChange={e => set('foodType', e.target.value)} />
                <Select label="Catering Type" options={cateringTypes} value={form.cateringType} onChange={e => set('cateringType', e.target.value)} />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-fade-up">
                <Select
                  label="Decoration Type"
                  options={decorationTypes}
                  value={form.decorationType}
                  onChange={e => set('decorationType', e.target.value)}
                  hint="This affects flower and fabric waste estimates"
                />
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4 animate-fade-up">
                <Input label="Location / City" required placeholder="e.g. Vijayawada" value={form.location} onChange={e => set('location', e.target.value)} />
              </div>
            )}

            {step === 5 && (
              <div className="space-y-3 animate-fade-up">
                <p className="text-body-sm text-text-muted mb-2">Review your event details before creating it.</p>
                {[
                  ['Event name', form.name],
                  ['Type', form.type],
                  ['Date', form.date],
                  ['Guests', form.guestCount],
                  ['Duration', form.duration ? `${form.duration}h` : '4h (default)'],
                  ['Food type', form.foodType || 'Mixed (default)'],
                  ['Catering', form.cateringType || 'External Caterer (default)'],
                  ['Decoration', form.decorationType || 'Flowers + Fabric (default)'],
                  ['Location', form.location],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border-subtle last:border-0">
                    <span className="text-body-sm text-text-muted">{label}</span>
                    <span className="text-body-sm font-semibold text-text-primary">{value || '—'}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-3 pt-6 mt-2">
              {step > 0 ? (
                <Button type="button" variant="outline" onClick={goBack} icon={<ArrowLeft size={15} />}>
                  Back
                </Button>
              ) : (
                <Button type="button" variant="outline" onClick={() => navigate('/events')}>
                  Cancel
                </Button>
              )}
              <Button type="submit" className="flex-1" loading={loading} icon={isLastStep ? <Check size={15} /> : <ArrowRight size={15} />} iconPosition="right">
                {isLastStep ? 'Create Event' : 'Continue'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}

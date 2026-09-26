import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { Alert } from '../components/feedback/Alert';
import { SkeletonCard } from '../components/feedback/Skeleton';
import { ArrowLeft, Sparkles, Handshake, Users, CalendarDays, MapPin, UtensilsCrossed, Flower2, CheckCircle2, Scale } from 'lucide-react';
import { getEvent, updateEvent } from '../lib/firestore';
import type { Event } from '../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  // Actual waste recording state
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [actualFoodKg, setActualFoodKg] = useState('');
  const [actualPlasticKg, setActualPlasticKg] = useState('');
  const [actualPaperKg, setActualPaperKg] = useState('');
  const [actualFlowerKg, setActualFlowerKg] = useState('');
  const [actualTotalKg, setActualTotalKg] = useState('');
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordSuccess, setRecordSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    if (id.startsWith('local_')) {
      try {
        const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
        setEvent(all.find((e: any) => e.id === id) || null);
      } catch { setEvent(null); }
      setLoading(false);
      return;
    }
    getEvent(id)
      .then(ev => {
        if (ev) { setEvent(ev); setLoading(false); return; }
        const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
        setEvent(all.find((e: any) => e.id === id) || null);
        setLoading(false);
      })
      .catch(() => {
        try {
          const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
          setEvent(all.find((e: any) => e.id === id) || null);
        } catch { setEvent(null); }
        setLoading(false);
      });
  }, [id]);

  async function handleActivate() {
    if (!event?.id) return;
    setActivating(true);
    try {
      await updateEvent(event.id, { status: 'ACTIVE' });
    } catch { /* local fallback */ }
    setEvent(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
    setActivating(false);
  }

  async function handleRecordActualWaste(e: React.FormEvent) {
    e.preventDefault();
    if (!event?.id || !actualTotalKg) return;
    setRecordLoading(true);

    const food = parseFloat(actualFoodKg) || 0;
    const plastic = parseFloat(actualPlasticKg) || 0;
    const paper = parseFloat(actualPaperKg) || 0;
    const flower = parseFloat(actualFlowerKg) || 0;
    const total = parseFloat(actualTotalKg) || (food + plastic + paper + flower);

    const actualWasteData = {
      foodWasteKg: food,
      plasticWasteKg: plastic,
      paperWasteKg: paper,
      flowerWasteKg: flower,
      totalWasteKg: total,
      recordedAt: new Date().toISOString()
    };

    try {
      await updateEvent(event.id, {
        status: 'COMPLETED',
        actualWaste: actualWasteData as any
      });
    } catch { /* ignore */ }

    setEvent(prev => prev ? {
      ...prev,
      status: 'COMPLETED',
      actualWaste: actualWasteData as any
    } : prev);

    setRecordLoading(false);
    setShowRecordModal(false);
    setRecordSuccess('Actual waste outcomes recorded successfully. ML feedback loop updated.');
  }

  if (loading) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-4">
        <SkeletonCard /><SkeletonCard />
      </div>
    </AppLayout>
  );

  if (!event) return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <Card>
          <EmptyState
            icon={<CalendarDays size={22} />}
            title="Event not found"
            description="This event may have been removed, or the link is out of date."
            action={<Link to="/events"><Button variant="outline">Back to Events</Button></Link>}
          />
        </Card>
      </div>
    </AppLayout>
  );

  const infoRows = [
    { label: 'Guests', value: `${event.guestCount}`, icon: <Users size={15} /> },
    { label: 'Duration', value: `${event.duration}h`, icon: <CalendarDays size={15} /> },
    { label: 'Food', value: event.foodType || '—', icon: <UtensilsCrossed size={15} /> },
    { label: 'Decoration', value: event.decorationType || '—', icon: <Flower2 size={15} /> },
  ];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-start gap-3 mb-6">
          <Link to="/events" aria-label="Back to events" className="text-text-muted hover:text-brand-primary mt-1.5 shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-h1 text-text-primary">{event.name}</h1>
            <p className="text-body-sm text-text-muted mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{event.type}</span>·<span>{event.date}</span>·
              <span className="flex items-center gap-1"><MapPin size={13} />{event.location}</span>
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        {recordSuccess && (
          <div className="mb-4">
            <Alert type="success">{recordSuccess}</Alert>
          </div>
        )}

        {/* Overview */}
        <Card className="mb-5">
          <h2 className="text-h4 mb-4">Event Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {infoRows.map(row => (
              <div key={row.label}>
                <p className="text-caption text-text-muted flex items-center gap-1.5 mb-1">{row.icon}{row.label}</p>
                <p className="font-semibold text-body-sm text-text-primary">{row.value}</p>
              </div>
            ))}
          </div>
          {event.status === 'DRAFT' && (
            <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
              <p className="text-body-sm text-text-muted">This event is still a draft — activate it once details are final.</p>
              <Button size="sm" onClick={handleActivate} loading={activating} icon={<CheckCircle2 size={14} />}>Activate Event</Button>
            </div>
          )}
          {event.status === 'ACTIVE' && !showRecordModal && (
            <div className="mt-5 pt-4 border-t border-border-subtle flex items-center justify-between gap-3 flex-wrap">
              <p className="text-body-sm text-text-muted">Event is active. Record actual waste generation after completion.</p>
              <Button size="sm" onClick={() => setShowRecordModal(true)} icon={<Scale size={14} />}>Record Actual Waste</Button>
            </div>
          )}
        </Card>

        {/* Record Actual Waste Form */}
        {showRecordModal && (
          <Card className="mb-5 border-2 border-brand-primary">
            <h3 className="text-h4 mb-3 flex items-center gap-2">
              <Scale size={18} className="text-brand-primary" /> Record Actual Waste Generated (Post-Event Outcome)
            </h3>
            <p className="text-body-sm text-text-muted mb-4">
              Recording actual waste collected allows EcoSetu to track prediction accuracy and continuously retrain ML models.
            </p>
            <form onSubmit={handleRecordActualWaste} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Actual Food Waste (kg)" type="number" step="0.1" placeholder="e.g. 180" value={actualFoodKg} onChange={e => setActualFoodKg(e.target.value)} />
                <Input label="Actual Plastic Waste (kg)" type="number" step="0.1" placeholder="e.g. 45" value={actualPlasticKg} onChange={e => setActualPlasticKg(e.target.value)} />
                <Input label="Actual Paper Waste (kg)" type="number" step="0.1" placeholder="e.g. 30" value={actualPaperKg} onChange={e => setActualPaperKg(e.target.value)} />
                <Input label="Actual Flower Waste (kg)" type="number" step="0.1" placeholder="e.g. 60" value={actualFlowerKg} onChange={e => setActualFlowerKg(e.target.value)} />
              </div>
              <Input label="Total Actual Waste (kg)" required type="number" step="0.1" placeholder="e.g. 315" value={actualTotalKg} onChange={e => setActualTotalKg(e.target.value)} />
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowRecordModal(false)}>Cancel</Button>
                <Button type="submit" loading={recordLoading} icon={<CheckCircle2 size={14} />}>Save Actual Outcomes</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Command center actions */}
        <div className="grid sm:grid-cols-2 gap-5">
          <Card hover>
            <Link to="/predict" className="block">
              <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4"><Sparkles size={20} /></div>
              <h3 className="text-h4 mb-1.5">Predict Waste</h3>
              <p className="text-body-sm text-text-muted leading-relaxed">Get an AI forecast of food, flower, plastic, paper and fabric waste for this event.</p>
            </Link>
          </Card>
          <Card hover>
            <Link to="/partners" className="block">
              <div className="w-11 h-11 rounded-xl bg-brand-accent/15 text-brand-accent-strong flex items-center justify-center mb-4"><Handshake size={20} /></div>
              <h3 className="text-h4 mb-1.5">Find Recovery Partners</h3>
              <p className="text-body-sm text-text-muted leading-relaxed">Match this event's waste with a suitable recovery partner and request a pickup.</p>
            </Link>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}

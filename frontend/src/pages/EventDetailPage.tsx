import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonCard } from '../components/feedback/Skeleton';
import { ArrowLeft, Sparkles, Handshake, Users, CalendarDays, MapPin, UtensilsCrossed, Flower2, CheckCircle2 } from 'lucide-react';
import { getEvent, updateEvent } from '../lib/firestore';
import type { Event } from '../types';

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

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
    } catch { /* local-only event — update state anyway */ }
    setEvent(prev => prev ? { ...prev, status: 'ACTIVE' } : prev);
    setActivating(false);
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
        </Card>

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

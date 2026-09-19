import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, ArrowRight, Search, PartyPopper, Building2 } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/feedback/Skeleton';
import { Input } from '../components/ui/Input';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByOrganizer } from '../lib/firestore';
import type { Event } from '../types';

function getLocalEvents(uid: string): Event[] {
  try {
    const all = JSON.parse(localStorage.getItem('uc_events') || '[]');
    return all.filter((e: any) => e.organizerUid === uid);
  } catch { return []; }
}

function eventIcon(type: string) {
  if (type === 'Wedding') return <PartyPopper size={18} />;
  if (type === 'Corporate') return <Building2 size={18} />;
  return <Calendar size={18} />;
}

export default function EventsPage() {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const local = getLocalEvents(currentUser.uid);
    if (local.length > 0) setEvents(local);

    getEventsByOrganizer(currentUser.uid)
      .then(firestoreEvents => {
        const firestoreIds = new Set(firestoreEvents.map(e => e.id));
        const localOnly = getLocalEvents(currentUser.uid).filter(e => !firestoreIds.has(e.id));
        setEvents([...firestoreEvents, ...localOnly]);
      })
      .catch(() => setEvents(getLocalEvents(currentUser.uid)))
      .finally(() => setLoading(false));
  }, [currentUser]);

  const filtered = events.filter(ev =>
    !query.trim() || ev.name.toLowerCase().includes(query.toLowerCase()) || ev.location?.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="My Events"
          description={`${events.length} event${events.length !== 1 ? 's' : ''} created`}
          actions={<Link to="/events/new"><Button icon={<Plus size={16} />}>New Event</Button></Link>}
        />

        {events.length > 0 && (
          <div className="mb-5 max-w-xs">
            <Input placeholder="Search events…" icon={<Search size={15} />} value={query} onChange={e => setQuery(e.target.value)} aria-label="Search events" />
          </div>
        )}

        {loading ? (
          <SkeletonRows count={4} />
        ) : events.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Calendar size={22} />}
              title="Your sustainability journey starts with an event"
              description="Create your first event and let EcoSetu AI help estimate its waste."
              action={<Link to="/events/new"><Button>Create Event</Button></Link>}
            />
          </Card>
        ) : filtered.length === 0 ? (
          <Card><EmptyState icon={<Search size={22} />} title="No matching events" description="Try a different search term." /></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(ev => (
              <Link key={ev.id} to={`/events/${ev.id}`}>
                <Card hover className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
                      {eventIcon(ev.type)}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{ev.name}</p>
                      <p className="text-body-sm text-text-muted">{ev.type} · {ev.guestCount} guests · {ev.date}</p>
                      <p className="text-caption text-text-muted">{ev.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={ev.status} />
                    <ArrowRight size={16} className="text-text-muted" />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, Plus, ArrowRight, Calendar, Sparkles, Handshake, MessageCircle, TrendingUp, Heart, TreePine } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/feedback/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByOrganizer, getPickupRequestsByOrganizer } from '../lib/firestore';
import type { Event, PickupRequest } from '../types';

const QUICK_ACTIONS = [
  { to: '/events/new', icon: <Calendar size={20} />, label: 'Create Event', sub: 'Add a new event' },
  { to: '/predict', icon: <Sparkles size={20} />, label: 'Predict Waste', sub: 'AI-powered analysis' },
  { to: '/partners', icon: <Handshake size={20} />, label: 'Find Partners', sub: 'Match waste to partners' },
  { to: '/assistant', icon: <MessageCircle size={20} />, label: 'AI Assistant', sub: 'Get sustainability advice' },
];

export default function OrganizerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    try {
      const localAll = JSON.parse(localStorage.getItem('uc_events') || '[]');
      const localEvs = localAll.filter((e: any) => e.organizerUid === uid);
      if (localEvs.length > 0) setEvents(localEvs);
    } catch { /* ignore */ }

    Promise.all([
      getEventsByOrganizer(uid),
      getPickupRequestsByOrganizer(uid),
    ]).then(([firestoreEvs, pk]) => {
      try {
        const localAll = JSON.parse(localStorage.getItem('uc_events') || '[]');
        const fsIds = new Set(firestoreEvs.map((e: any) => e.id));
        const localOnly = localAll.filter((e: any) => e.organizerUid === uid && !fsIds.has(e.id));
        setEvents([...firestoreEvs, ...localOnly]);
      } catch {
        setEvents(firestoreEvs);
      }
      setPickups(pk);
    }).catch(() => { /* Firestore unavailable — keep local */ })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const completedPickups = pickups.filter(p => p.status === 'COMPLETED').length;
  const totalWaste = pickups.reduce((s, p) => s + (p.totalKg || 0), 0);
  const co2Saved = Math.round(totalWaste * 0.7);
  const mealsRescued = Math.round(totalWaste * 0.3);
  const treesEquivalent = Math.round(co2Saved / 21);
  const firstName = userProfile?.name?.split(' ')[0] || 'there';

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-h2 lg:text-h1 text-text-primary">Good to see you, {firstName}</h1>
            <p className="text-body-sm text-text-muted mt-1">Your celebrations are becoming more circular.</p>
          </div>
          <div className="flex gap-2.5">
            <Link to="/predict"><Button variant="outline" icon={<Sparkles size={16} />}>Predict Waste</Button></Link>
            <Link to="/events/new"><Button icon={<Plus size={16} />}>Create Event</Button></Link>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Events" value={events.length} icon={<Calendar size={18} />} tone="primary" />
          <StatCard label="Waste Diverted" value={`${totalWaste} kg`} icon={<Leaf size={18} />} tone="primary" />
          <StatCard label="CO₂ Prevented" value={`${co2Saved} kg`} icon={<TrendingUp size={18} />} tone="info" />
          <StatCard label="Completed Pickups" value={completedPickups} icon={<Truck size={18} />} tone="accent" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.to} to={a.to}>
              <Card hover className="text-center h-full">
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">{a.icon}</div>
                <p className="font-semibold text-body-sm text-text-primary">{a.label}</p>
                <p className="text-caption text-text-muted mt-0.5">{a.sub}</p>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <SectionHeader
              title="Recent Events"
              actions={<Link to="/events" className="text-caption font-semibold text-brand-primary hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>}
            />
            {loading ? (
              <SkeletonRows count={3} />
            ) : events.length === 0 ? (
              <EmptyState
                icon={<Calendar size={22} />}
                title="Your sustainability journey starts here"
                description="Create your first event and let EcoSetu AI help estimate its waste."
                action={<Link to="/events/new"><Button size="sm">Create Event</Button></Link>}
                className="py-8"
              />
            ) : (
              <div className="space-y-1">
                {events.slice(0, 4).map(ev => (
                  <Link key={ev.id} to={`/events/${ev.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-sunken transition-colors">
                    <div className="min-w-0">
                      <p className="font-semibold text-body-sm text-text-primary truncate">{ev.name}</p>
                      <p className="text-caption text-text-muted">{ev.type} · {ev.guestCount} guests · {ev.date}</p>
                    </div>
                    <StatusBadge status={ev.status} />
                  </Link>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <SectionHeader
              title="Pickup Activity"
              actions={<Link to="/pickups" className="text-caption font-semibold text-brand-primary hover:underline flex items-center gap-1">View all <ArrowRight size={12} /></Link>}
            />
            {loading ? (
              <SkeletonRows count={2} />
            ) : pickups.length === 0 ? (
              <EmptyState
                icon={<Truck size={22} />}
                title="No pickup requests yet"
                description="Once you connect with a recovery partner, your requests will appear here."
                action={<Link to="/partners"><Button size="sm" variant="outline">Find Partners</Button></Link>}
                className="py-8"
              />
            ) : (
              <div className="space-y-1">
                {pickups.slice(0, 4).map(pk => (
                  <div key={pk.id} className="flex items-center justify-between p-3 rounded-lg bg-surface-sunken">
                    <div className="min-w-0">
                      <p className="font-semibold text-body-sm text-text-primary truncate">{pk.wasteTypes?.join(', ')}</p>
                      <p className="text-caption text-text-muted">{pk.totalKg} kg · {pk.pickupDate}</p>
                    </div>
                    <StatusBadge status={pk.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card>
          <SectionHeader title="Your Impact Summary" actions={<Link to="/impact" className="text-caption font-semibold text-brand-primary hover:underline flex items-center gap-1">Full report <ArrowRight size={12} /></Link>} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Waste Diverted', value: `${totalWaste} kg`, icon: <Leaf size={18} /> },
              { label: 'CO₂ Prevented', value: `${co2Saved} kg`, icon: <TrendingUp size={18} /> },
              { label: 'Meals Rescued', value: mealsRescued, icon: <Heart size={18} /> },
              { label: 'Trees Equivalent', value: treesEquivalent, icon: <TreePine size={18} /> },
            ].map(item => (
              <div key={item.label} className="p-4 bg-surface-sunken rounded-xl text-center">
                <div className="w-9 h-9 rounded-lg bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-2">{item.icon}</div>
                <p className="font-bold text-text-primary tabular-nums">{item.value}</p>
                <p className="text-caption text-text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

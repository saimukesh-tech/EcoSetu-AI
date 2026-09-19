import { useEffect, useState } from 'react';
import { Truck, CheckCircle2, Clock, Scale, MapPin, CalendarClock, ShieldCheck } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/feedback/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByPartner, updatePickupStatus } from '../lib/firestore';
import type { PickupRequest } from '../types';

const LS_KEY = 'uc_pickups';

function getLocalPickupsForPartner(partnerUid: string): PickupRequest[] {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    return all.filter((p: any) => p.partnerUid === partnerUid || p.partnerUid?.startsWith('p-') || p.status === 'PENDING' || p.status === 'MATCHED');
  } catch {
    return [];
  }
}

function updateLocalPickupStatus(id: string, newStatus: string) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    const updated = all.map((p: any) => (p.id === id ? { ...p, status: newStatus, updatedAt: new Date().toISOString() } : p));
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  } catch {
    /* ignore */
  }
}

export default function PartnerDashboard() {
  const { currentUser, userProfile } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    const localList = getLocalPickupsForPartner(uid);
    setPickups(localList);

    getPickupRequestsByPartner(uid)
      .then(fsPickups => {
        const fsIds = new Set(fsPickups.map(p => p.id));
        const combined = [...fsPickups, ...localList.filter(p => !fsIds.has(p.id))];
        setPickups(combined);
      })
      .catch(() => {
        /* keep local list */
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  async function handleAccept(id: string) {
    if (!currentUser) return;
    setUpdatingId(id);
    try {
      await updatePickupStatus(id, 'ACCEPTED', currentUser.uid);
    } catch {
      /* fallback */
    }
    updateLocalPickupStatus(id, 'ACCEPTED');
    setPickups(prev => prev.map(p => (p.id === id ? { ...p, status: 'ACCEPTED' } : p)));
    setUpdatingId(null);
  }

  async function handleComplete(id: string) {
    if (!currentUser) return;
    setUpdatingId(id);
    try {
      await updatePickupStatus(id, 'COMPLETED', currentUser.uid);
    } catch {
      /* fallback */
    }
    updateLocalPickupStatus(id, 'COMPLETED');
    setPickups(prev => prev.map(p => (p.id === id ? { ...p, status: 'COMPLETED' } : p)));
    setUpdatingId(null);
  }

  const pending = pickups.filter(p => p.status === 'PENDING' || p.status === 'MATCHED').length;
  const confirmed = pickups.filter(p => p.status === 'ACCEPTED' || p.status === 'CONFIRMED' || p.status === 'IN_PROGRESS' || p.status === 'SCHEDULED').length;
  const completed = pickups.filter(p => p.status === 'COMPLETED').length;
  const totalKg = pickups.filter(p => p.status === 'COMPLETED').reduce((s, p) => s + (p.totalKg || 0), 0);

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        {/* Partner Hero Header */}
        <div className="rounded-2xl bg-brand-forest text-white p-6 sm:p-8 mb-8 relative overflow-hidden shadow-natural">
          <div aria-hidden="true" className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-white/5" />
          <p className="text-caption text-white/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-brand-accent-strong" /> Recovery Partner Workspace
          </p>
          <h1 className="font-display-serif text-h1 text-white mb-2">Recovery Operations & Active Pickups</h1>
          <p className="text-body-sm text-white/75 max-w-lg">
            {userProfile?.name ? `Welcome back, ${userProfile.name}.` : 'Welcome back.'} Accept incoming pickup requests from event organizers and manage waste diversion operations.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Pending Requests" value={pending} icon={<Clock size={18} />} tone="accent" />
          <StatCard label="Active / Scheduled" value={confirmed} icon={<Truck size={18} />} tone="info" />
          <StatCard label="Completed" value={completed} icon={<CheckCircle2 size={18} />} tone="primary" />
          <StatCard label="Total Diverted" value={`${totalKg} kg`} icon={<Scale size={18} />} tone="neutral" />
        </div>

        <Card>
          <h2 className="text-h4 mb-5">Pickup Requests Assigned to Your Organization</h2>
          {loading ? (
            <SkeletonRows count={3} />
          ) : pickups.length === 0 ? (
            <EmptyState
              icon={<Truck size={22} />}
              title="No pickup requests yet"
              description="Once organizers match with your organization, pickup requests will appear here for acceptance."
            />
          ) : (
            <div className="space-y-3">
              {pickups.map(pk => (
                <div
                  key={pk.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border-subtle hover:bg-surface-sunken transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-semibold text-body-sm text-text-primary">
                        {Array.isArray(pk.wasteTypes) ? pk.wasteTypes.join(', ') : pk.wasteTypes || 'General Waste'}
                      </p>
                      <StatusBadge status={pk.status} />
                    </div>
                    <p className="text-caption text-text-muted flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Scale size={12} />
                        {pk.totalKg} kg requested
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {pk.pickupAddress || 'Vijayawada Venue'}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarClock size={12} />
                        Date: {pk.pickupDate || 'Flexible'}
                      </span>
                    </p>
                    {pk.notes && <p className="text-caption text-text-secondary mt-1 italic">{pk.notes}</p>}
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {(pk.status === 'PENDING' || pk.status === 'MATCHED') && (
                      <Button size="sm" onClick={() => handleAccept(pk.id)} loading={updatingId === pk.id}>
                        Accept Pickup
                      </Button>
                    )}
                    {(pk.status === 'ACCEPTED' || pk.status === 'CONFIRMED' || pk.status === 'IN_PROGRESS' || pk.status === 'SCHEDULED') && (
                      <Button size="sm" variant="secondary" onClick={() => handleComplete(pk.id)} loading={updatingId === pk.id}>
                        Mark Complete
                      </Button>
                    )}
                    {pk.status === 'COMPLETED' && (
                      <span className="text-caption font-bold text-success flex items-center gap-1 px-3 py-1 bg-success/10 rounded-lg">
                        <CheckCircle2 size={14} /> Recovered
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

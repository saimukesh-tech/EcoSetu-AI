import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusBadge, Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Tabs } from '../components/ui/Tabs';
import { Input, Textarea } from '../components/ui/Input';
import { Alert } from '../components/feedback/Alert';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/feedback/Skeleton';
import { Truck, Plus, CheckCircle2, CalendarClock, MapPin, StickyNote } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByOrganizer, createPickupRequest } from '../lib/firestore';
import type { PickupRequest } from '../types';
import { clsx } from 'clsx';

const LS_KEY = 'uc_pickups';
const STAGE_ORDER = ['PENDING', 'MATCHED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
const FILTER_TABS = [
  { key: 'ALL', label: 'All' }, { key: 'PENDING', label: 'Pending' }, { key: 'MATCHED', label: 'Matched' },
  { key: 'CONFIRMED', label: 'Confirmed' }, { key: 'IN_PROGRESS', label: 'In Progress' }, { key: 'COMPLETED', label: 'Completed' },
];

function localId() { return 'local_' + Math.random().toString(36).slice(2, 10); }
function getLocalPickups(uid: string): PickupRequest[] {
  try { return (JSON.parse(localStorage.getItem(LS_KEY) || '[]')).filter((p: any) => p.organizerUid === uid); } catch { return []; }
}
function saveLocalPickup(pickup: PickupRequest) {
  try {
    const all = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    all.unshift(pickup);
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

function MiniStageTrack({ status }: { status: string }) {
  if (status === 'CANCELLED') return <Badge color="error" dot>Cancelled</Badge>;
  const idx = STAGE_ORDER.indexOf(status);
  return (
    <div className="flex items-center gap-1" aria-hidden="true">
      {STAGE_ORDER.map((s, i) => (
        <span key={s} className={clsx('w-5 h-1.5 rounded-full', i <= idx ? 'bg-brand-primary' : 'bg-surface-sunken')} />
      ))}
    </div>
  );
}

export default function PickupRequestsPage() {
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [form, setForm] = useState({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    setPickups(getLocalPickups(uid));
    getPickupRequestsByOrganizer(uid)
      .then(firestorePickups => {
        const fsIds = new Set(firestorePickups.map(p => p.id));
        const localOnly = getLocalPickups(uid).filter(p => !fsIds.has(p.id));
        setPickups([...firestorePickups, ...localOnly]);
      })
      .catch(() => { /* keep local */ })
      .finally(() => setLoading(false));
  }, [currentUser]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');
    setSuccess(false);
    if (!form.wasteTypes.trim()) { setFormError('Please enter waste types.'); return; }
    if (!form.totalKg || parseInt(form.totalKg) < 1) { setFormError('Please enter a valid weight.'); return; }
    if (!form.pickupDate) { setFormError('Please select a pickup date.'); return; }
    if (!form.pickupAddress.trim()) { setFormError('Please enter a pickup address.'); return; }
    if (!currentUser) return;

    setSubmitting(true);
    const wasteTypesList = form.wasteTypes.split(',').map(s => s.trim()).filter(Boolean);
    const pickupData = {
      eventId: '', organizerUid: currentUser.uid, wasteTypes: wasteTypesList,
      totalKg: parseInt(form.totalKg) || 0, pickupDate: form.pickupDate,
      pickupAddress: form.pickupAddress.trim(), status: 'PENDING' as const, notes: form.notes,
    };

    try {
      const id = await createPickupRequest(pickupData);
      const newPickup: PickupRequest = { id, ...pickupData, createdAt: new Date(), updatedAt: new Date() };
      setPickups(prev => [newPickup, ...prev]);
      setShowForm(false);
      setSuccess(true);
      setForm({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
    } catch (err: any) {
      const isPermission = err?.code === 'permission-denied' || err?.message?.includes('permission');
      if (isPermission) {
        const id = localId();
        const newPickup: PickupRequest = { id, ...pickupData, createdAt: new Date(), updatedAt: new Date() };
        saveLocalPickup(newPickup);
        setPickups(prev => [newPickup, ...prev]);
        setShowForm(false);
        setSuccess(true);
        setForm({ wasteTypes: '', totalKg: '', pickupDate: '', pickupAddress: '', notes: '' });
      } else {
        setFormError('Failed to create request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = filter === 'ALL' ? pickups : pickups.filter(p => p.status === filter);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Pickup Requests"
          description={`${pickups.length} request${pickups.length !== 1 ? 's' : ''}`}
          actions={<Button icon={<Plus size={16} />} onClick={() => { setShowForm(!showForm); setSuccess(false); }}>{showForm ? 'Cancel' : 'New Request'}</Button>}
        />

        {success && <div className="mb-4"><Alert type="success">Pickup request created successfully.</Alert></div>}

        {showForm && (
          <Card className="mb-6">
            <h3 className="text-h4 mb-4">New Pickup Request</h3>
            {formError && <div className="mb-3"><Alert type="error">{formError}</Alert></div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Waste Types" required hint="Comma-separated, e.g. Food, Flowers, Plastic" placeholder="Food, Flowers, Plastic" value={form.wasteTypes} onChange={e => setForm(p => ({ ...p, wasteTypes: e.target.value }))} />
                <Input label="Total Weight (kg)" required type="number" min="1" placeholder="150" value={form.totalKg} onChange={e => setForm(p => ({ ...p, totalKg: e.target.value }))} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Pickup Date" required type="date" value={form.pickupDate} onChange={e => setForm(p => ({ ...p, pickupDate: e.target.value }))} />
                <Input label="Pickup Address" required placeholder="Event venue address" value={form.pickupAddress} onChange={e => setForm(p => ({ ...p, pickupAddress: e.target.value }))} />
              </div>
              <Textarea label="Notes (optional)" rows={2} placeholder="Additional instructions for the partner" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              <Button type="submit" loading={submitting}>Submit Request</Button>
            </form>
          </Card>
        )}

        {pickups.length > 0 && (
          <div className="mb-5 overflow-x-auto">
            <Tabs tabs={FILTER_TABS} active={filter} onChange={setFilter} />
          </div>
        )}

        {loading ? (
          <SkeletonRows count={3} />
        ) : pickups.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Truck size={22} />}
              title="No pickup requests yet"
              description="Create a request, or use Find Partners to match and schedule a pickup."
              action={<Button onClick={() => setShowForm(true)}>Create First Request</Button>}
            />
          </Card>
        ) : filtered.length === 0 ? (
          <Card><EmptyState icon={<Truck size={22} />} title="No requests in this status" description="Try a different filter." /></Card>
        ) : (
          <div className="space-y-3">
            {filtered.map(pk => (
              <Card key={pk.id}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <p className="font-semibold text-text-primary">{pk.wasteTypes?.join(', ')}</p>
                      <StatusBadge status={pk.status} />
                      {(pk as any)._local && <Badge color="warning" size="sm">Saved locally</Badge>}
                    </div>
                    <p className="text-body-sm text-text-muted flex items-center gap-1.5 flex-wrap">
                      <span>{pk.totalKg} kg</span>·<span className="flex items-center gap-1"><MapPin size={12} />{pk.pickupAddress}</span>
                    </p>
                    <p className="text-caption text-text-muted mt-1 flex items-center gap-1"><CalendarClock size={12} />Pickup: {pk.pickupDate}</p>
                    {pk.notes && <p className="text-caption text-text-muted mt-1 flex items-center gap-1 italic"><StickyNote size={12} />{pk.notes}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <MiniStageTrack status={pk.status} />
                    {pk.partnerUid && <span className="text-caption font-semibold text-success flex items-center gap-1"><CheckCircle2 size={12} />Partner assigned</span>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

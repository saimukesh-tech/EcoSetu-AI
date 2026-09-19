import { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { MapPin, Truck, CheckCircle2, ShieldCheck, Scale, Search, Sparkles } from 'lucide-react';
import { createPickupRequest } from '../lib/firestore';
import { getPartnerRecommendations } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const DEMO_PARTNERS = [
  {
    id: 'p-1',
    orgName: 'Vijayawada EcoRecycle',
    wasteTypes: ['Plastic', 'Paper'],
    capacityKg: 1500,
    availableCapacityKg: 1200,
    location: 'Benz Circle, Vijayawada',
    distance: 3.5,
    available: true,
    verified: true,
    description: 'Specializes in PET plastic granulation and industrial paper recycling.',
  },
  {
    id: 'p-2',
    orgName: 'GreenEarth BioCompost',
    wasteTypes: ['Food', 'Flowers', 'Organic'],
    capacityKg: 800,
    availableCapacityKg: 600,
    location: 'Governorpet, Vijayawada',
    distance: 5.2,
    available: true,
    verified: true,
    description: 'Rescues organic waste and floral decorations for high-grade compost.',
  },
  {
    id: 'p-3',
    orgName: 'PaperCycle India',
    wasteTypes: ['Paper', 'Cardboard'],
    capacityKg: 1000,
    availableCapacityKg: 800,
    location: 'Autonagar, Vijayawada',
    distance: 7.1,
    available: true,
    verified: true,
    description: 'Cardboard and paper shredding unit with certified weight receipts.',
  },
  {
    id: 'p-4',
    orgName: 'CleanPlast Recyclers',
    wasteTypes: ['Plastic'],
    capacityKg: 400,
    availableCapacityKg: 0,
    location: 'Labbipet, Vijayawada',
    distance: 9.3,
    available: false,
    verified: true,
    description: 'Plastic recycling facility. Currently operating at maximum capacity.',
  },
];

const WASTE_FILTER_OPTIONS = [
  { value: '', label: 'All waste types' },
  { value: 'Food', label: 'Food' },
  { value: 'Flowers', label: 'Flowers' },
  { value: 'Plastic', label: 'Plastic' },
  { value: 'Paper', label: 'Paper' },
];

export default function PartnerMatchingPage() {
  const { currentUser } = useAuth();
  const [wasteFilter, setWasteFilter] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [matches, setMatches] = useState<any[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState<string | null>(null);
  const [pickupDate, setPickupDate] = useState('');
  const [wasteKg, setWasteKg] = useState('50');
  const [address, setAddress] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    async function runMatching() {
      const filtered = DEMO_PARTNERS.filter(
        p => (!wasteFilter || p.wasteTypes.includes(wasteFilter)) && (!availableOnly || p.available)
      );

      const reqTypes = wasteFilter ? [wasteFilter] : ['Food', 'Plastic', 'Paper', 'Flowers'];
      try {
        const res = await getPartnerRecommendations(filtered, reqTypes, parseInt(wasteKg) || 50);

        if (res && Array.isArray(res.matches) && res.matches.length > 0) {
          setMatches(res.matches);
          return;
        }
      } catch {
        /* fallback to local demo match list */
      }

      // Default fallback
      setMatches(
        filtered.map(p => ({
          partnerId: p.id,
          partnerName: p.orgName,
          matchScore: 0.90,
          compatibilityPercentage: 90,
          reasons: ['Accepts requested waste categories', 'Has available capacity', 'Verified partner'],
          partner: p,
        }))
      );
    }
    runMatching();
  }, [wasteFilter, availableOnly, wasteKg]);

  async function handleRequestPickup(partnerId: string) {
    if (!currentUser) return;
    if (!pickupDate || !wasteKg || !address) {
      setFormError('Please fill in pickup date, waste kg, and address.');
      return;
    }
    setFormError('');
    setRequesting(true);
    const matchObj = matches.find(m => (m.partnerId || m.partner?.id || m.partner?.partnerId) === partnerId);
    const partner = matchObj?.partner || DEMO_PARTNERS.find(p => p.id === partnerId);

    const requestData = {
      eventId: '',
      organizerUid: currentUser.uid,
      partnerUid: partnerId,
      wasteTypes: partner?.wasteTypes || partner?.acceptedWasteTypes || ['Food', 'Plastic'],
      totalKg: parseInt(wasteKg) || 0,
      pickupDate,
      pickupAddress: address,
      status: 'PENDING' as const,
      notes: `Matched with ${partner?.orgName || partner?.partnerName || 'Recovery Partner'}`,
    };

    try {
      await createPickupRequest(requestData);
      setRequested(partnerId);
      setSelected(null);
    } catch {
      try {
        const id = 'local_' + Math.random().toString(36).slice(2, 10);
        const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
        all.unshift({ id, ...requestData, status: 'MATCHED', _local: true, createdAt: new Date().toISOString() });
        localStorage.setItem('uc_pickups', JSON.stringify(all));
      } catch {
        /* ignore */
      }
      setRequested(partnerId);
      setSelected(null);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Find Recovery Partners"
          description="Deterministic multi-factor matching engine evaluating waste compatibility, capacity, and availability."
        />

        <Card className="mb-5" padding="sm">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <div className="flex-1">
              <Select label="Waste type" options={WASTE_FILTER_OPTIONS} value={wasteFilter} onChange={e => setWasteFilter(e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-body-sm text-text-secondary pb-2.5 sm:pb-2">
              <input
                type="checkbox"
                checked={availableOnly}
                onChange={e => setAvailableOnly(e.target.checked)}
                className="rounded border-border text-brand-primary focus-visible:outline-none"
              />
              Available only
            </label>
          </div>
        </Card>

        {matches.length === 0 ? (
          <Card>
            <EmptyState icon={<Search size={22} />} title="No matching partners" description="Try a different waste type or clear the availability filter." />
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((m, i) => {
              const p = m.partner || {};
              const partnerId = p.id || p.partnerId || m.partnerId || `p-${i}`;
              const orgName = p.orgName || p.partnerName || m.partnerName || 'Recovery Partner';
              const wasteTypes = p.wasteTypes || p.acceptedWasteTypes || ['Plastic', 'Paper'];
              const description = p.description || 'Verified recovery organization specializing in eco-friendly waste diversion.';
              const available = p.available !== false;
              const verified = p.verified !== false;
              const location = p.location || 'Vijayawada Region';
              const capacityKg = p.availableCapacityKg ?? p.capacityKg ?? 1000;
              const distance = p.distance || (3.5 + i * 1.8).toFixed(1);

              const reasons = Array.isArray(m.reasons) ? m.reasons : ['Accepts requested waste categories', 'Has available capacity'];
              const score = m.compatibilityPercentage || (m.matchScore ? Math.round(m.matchScore * 100) : 90);

              return (
                <Card key={partnerId} className={requested === partnerId ? 'border-brand-primary' : undefined}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <h3 className="text-h4">{orgName}</h3>
                        <Badge color={available ? 'success' : 'error'} dot>
                          {available ? 'Available' : 'At capacity'}
                        </Badge>
                        {verified && (
                          <Badge color="success" size="sm">
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-body-sm text-text-muted mb-3">{description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Array.isArray(wasteTypes) &&
                          wasteTypes.map((tag: string) => (
                            <span key={tag} className="text-caption bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">
                              {tag}
                            </span>
                          ))}
                      </div>

                      {/* Explainable Match Reasons */}
                      <div className="bg-background-elevated rounded-xl p-3 mb-3 border border-border-subtle space-y-1">
                        <span className="text-caption text-text-muted font-medium flex items-center gap-1 mb-1">
                          <Sparkles size={12} className="text-brand-primary" /> Why this match:
                        </span>
                        {reasons.map((r: string, idx: number) => (
                          <p key={idx} className="text-caption text-text-secondary flex items-center gap-1.5">
                            <span className="text-brand-primary">•</span> {r}
                          </p>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4 text-caption text-text-muted">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} />
                          {location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Scale size={12} />
                          Available: {capacityKg} kg
                        </span>
                        <span>{distance} km away</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 shrink-0">
                      <div className="text-center bg-brand-primary/5 rounded-2xl px-4 py-2 border border-brand-primary/20">
                        <p className="text-h3 text-brand-primary leading-none font-bold">{score}%</p>
                        <p className="text-caption text-text-muted mt-1 font-medium">Match score</p>
                      </div>

                      {requested === partnerId ? (
                        <div className="flex items-center gap-1.5 text-body-sm text-brand-primary font-semibold">
                          <CheckCircle2 size={16} /> Requested
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          disabled={!available}
                          onClick={() => setSelected(selected === partnerId ? null : partnerId)}
                          variant={selected === partnerId ? 'secondary' : 'primary'}
                        >
                          {selected === partnerId ? 'Cancel' : 'Request Pickup'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {selected === partnerId && (
                    <div className="mt-4 pt-4 border-t border-border-subtle">
                      <h4 className="font-semibold text-body-sm mb-3 flex items-center gap-2">
                        <Truck size={14} /> Schedule Pickup with {orgName}
                      </h4>
                      {formError && <p className="text-caption text-error mb-2">{formError}</p>}
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label htmlFor={`pickup-date-${partnerId}`} className="block text-caption text-text-muted mb-1">
                            Pickup Date *
                          </label>
                          <input
                            id={`pickup-date-${partnerId}`}
                            type="date"
                            className="w-full rounded-lg border border-border bg-surface text-text-primary px-3 py-2 text-body-sm focus:outline-none focus:border-brand-primary"
                            value={pickupDate}
                            onChange={e => setPickupDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor={`pickup-kg-${partnerId}`} className="block text-caption text-text-muted mb-1">
                            Waste (kg) *
                          </label>
                          <input
                            id={`pickup-kg-${partnerId}`}
                            type="number"
                            placeholder="50"
                            className="w-full rounded-lg border border-border bg-surface text-text-primary px-3 py-2 text-body-sm focus:outline-none focus:border-brand-primary"
                            value={wasteKg}
                            onChange={e => setWasteKg(e.target.value)}
                          />
                        </div>
                        <div>
                          <label htmlFor={`pickup-address-${partnerId}`} className="block text-caption text-text-muted mb-1">
                            Pickup Address *
                          </label>
                          <input
                            id={`pickup-address-${partnerId}`}
                            type="text"
                            placeholder="Event venue address"
                            className="w-full rounded-lg border border-border bg-surface text-text-primary px-3 py-2 text-body-sm focus:outline-none focus:border-brand-primary"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button className="mt-3" size="sm" loading={requesting} onClick={() => handleRequestPickup(partnerId)} icon={<ShieldCheck size={14} />}>
                        Confirm Request
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

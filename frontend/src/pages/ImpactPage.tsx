import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, StatCard } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { SkeletonRows } from '../components/feedback/Skeleton';
import { ImpactTrend } from '../components/charts/WasteCharts';
import { Leaf, TrendingUp, Heart, TreePine, BarChart2, Droplets } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getPickupRequestsByOrganizer } from '../lib/firestore';
import { calculateImpact } from '../lib/api';
import type { PickupRequest } from '../types';

function mergeLocalPickups(firestorePickups: PickupRequest[], uid: string): PickupRequest[] {
  try {
    const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
    const local = all.filter((p: any) => p.organizerUid === uid);
    const fsIds = new Set(firestorePickups.map(p => p.id));
    const localOnly = local.filter((p: any) => !fsIds.has(p.id));
    return [...firestorePickups, ...localOnly];
  } catch {
    return firestorePickups;
  }
}

export default function ImpactPage() {
  const { currentUser } = useAuth();
  const [pickups, setPickups] = useState<PickupRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [impactMetrics, setImpactMetrics] = useState<any>({
    totalWasteDivertedKg: 0,
    co2eAvoidedKg: 0,
    mealsRescued: 0,
    treesEquivalent: 0,
  });

  useEffect(() => {
    if (!currentUser) return;
    const uid = currentUser.uid;
    try {
      const all = JSON.parse(localStorage.getItem('uc_pickups') || '[]');
      setPickups(all.filter((p: any) => p.organizerUid === uid));
    } catch {
      /* ignore */
    }

    getPickupRequestsByOrganizer(uid)
      .then(fp => setPickups(mergeLocalPickups(fp, uid)))
      .catch(() => {
        /* keep local */
      })
      .finally(() => setLoading(false));
  }, [currentUser]);

  const completed = pickups.filter(p => p.status === 'COMPLETED' || p.status === 'CONFIRMED' || p.status === 'IN_PROGRESS');
  const totalKg = completed.reduce((s, p) => s + (p.totalKg || 0), 0);

  useEffect(() => {
    async function runImpactCalculation() {
      const foodKg = completed.filter(p => p.wasteTypes?.some(t => t.toLowerCase().includes('food'))).reduce((s, p) => s + p.totalKg, 0);
      const plasticKg = completed.filter(p => p.wasteTypes?.some(t => t.toLowerCase().includes('plastic'))).reduce((s, p) => s + p.totalKg, 0);
      const paperKg = completed.filter(p => p.wasteTypes?.some(t => t.toLowerCase().includes('paper'))).reduce((s, p) => s + p.totalKg, 0);

      const res = await calculateImpact({
        foodKg: foodKg || totalKg * 0.5,
        plasticKg: plasticKg || totalKg * 0.3,
        paperKg: paperKg || totalKg * 0.2,
      });

      if (res && res.data) {
        setImpactMetrics(res.data);
      }
    }
    if (completed.length > 0 || totalKg > 0) {
      runImpactCalculation();
    }
  }, [completed, totalKg]);

  const trendPoints = useMemo(() => {
    const byMonth = new Map<string, { value: number; date: Date }>();
    let undated = 0;
    completed.forEach(p => {
      const d = p.pickupDate ? new Date(p.pickupDate) : null;
      if (!d || isNaN(d.getTime())) {
        undated += p.totalKg || 0;
        return;
      }
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const existing = byMonth.get(key);
      byMonth.set(key, { value: (existing?.value || 0) + (p.totalKg || 0), date: d });
    });
    const sortedKeys = Array.from(byMonth.keys()).sort();
    const years = new Set(sortedKeys.map(k => k.slice(0, 4)));
    const points = sortedKeys.map(key => {
      const { value, date } = byMonth.get(key)!;
      const label = years.size > 1 ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : date.toLocaleDateString('en-US', { month: 'short' });
      return { label, value };
    });
    if (undated > 0) points.push({ label: 'Other', value: undated });
    return points;
  }, [completed]);

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          eyebrow="Sustainability Engine"
          title="Your Environmental Impact"
          description="Quantified environmental metrics based on EPA WARM and IPCC lifecycle conversion factors."
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Waste Diverted" value={`${impactMetrics.totalWasteDivertedKg || totalKg} kg`} icon={<Leaf size={18} />} tone="primary" />
          <StatCard label="CO₂e Avoided" value={`${impactMetrics.co2eAvoidedKg || Math.round(totalKg * 2.14)} kg`} icon={<TrendingUp size={18} />} tone="info" />
          <StatCard label="Meals Rescued" value={impactMetrics.mealsRescued || Math.round(totalKg * 1.5)} icon={<Heart size={18} />} tone="accent" />
          <StatCard label="Trees Equivalent" value={impactMetrics.treesEquivalent || Math.round(totalKg * 0.1)} icon={<TreePine size={18} />} tone="neutral" />
        </div>

        {trendPoints.length > 1 && (
          <Card className="mb-6">
            <h2 className="text-h4 mb-4">Impact Over Time</h2>
            <ImpactTrend points={trendPoints} />
          </Card>
        )}

        <Card className="mb-6">
          <h2 className="text-h4 mb-5">Completed & Active Pickups</h2>
          {loading ? (
            <SkeletonRows count={2} />
          ) : completed.length === 0 ? (
            <EmptyState
              icon={<BarChart2 size={22} />}
              title="Your impact will appear here"
              description="Complete a pickup to see its environmental impact reflected in this report."
            />
          ) : (
            <div className="space-y-2.5">
              {completed.map(pk => (
                <div key={pk.id} className="flex items-center justify-between p-4 bg-brand-primary/5 rounded-xl">
                  <div className="min-w-0">
                    <p className="font-medium text-body-sm text-text-primary">{pk.wasteTypes?.join(', ')}</p>
                    <p className="text-caption text-text-muted">
                      {pk.pickupDate} · {pk.pickupAddress}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-brand-primary tabular-nums">{pk.totalKg} kg</p>
                    <p className="text-caption text-text-muted">diverted</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <h2 className="text-h4 mb-4">Scientific Conversion Methodology</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                icon: <TreePine size={22} />,
                title: 'Carbon Equivalent',
                value: `${impactMetrics.treesEquivalent || 1.2} trees planted`,
                desc: 'EPA WARM v15 conversion: Avoided landfill methane emissions per kg waste.',
              },
              {
                icon: <Heart size={22} />,
                title: 'Food Rescued',
                value: `${impactMetrics.mealsRescued || 0} meals`,
                desc: 'Estimated 0.5 kg per meal equivalent rescued and redirected to urban food banks.',
              },
              {
                icon: <Droplets size={22} />,
                title: 'Water Saved',
                value: `${Math.round(totalKg * 3.2)} L`,
                desc: 'Avoided water footprint of virgin material manufacturing through circular recycling.',
              },
            ].map(item => (
              <div key={item.title} className="bg-surface-sunken rounded-xl p-5 text-center">
                <div className="w-11 h-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto mb-3">
                  {item.icon}
                </div>
                <p className="font-bold text-text-primary mb-1">{item.value}</p>
                <p className="text-caption font-semibold text-brand-primary mb-1">{item.title}</p>
                <p className="text-caption text-text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}

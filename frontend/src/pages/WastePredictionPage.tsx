import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { Input, Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { Alert } from '../components/feedback/Alert';
import { AIBadge, AIProcessing, useStagedProcessing } from '../components/ai/AIComponents';
import { WasteDonut } from '../components/charts/WasteCharts';
import { useAuth } from '../contexts/AuthContext';
import { saveWastePrediction } from '../lib/firestore';
import { fetchEventWastePrediction, classifyWasteImage } from '../lib/api';
import { Sparkles, CheckCircle2, Lightbulb, Leaf, Upload, Camera } from 'lucide-react';
import type { WastePredictionResult } from '../types';

const PROCESSING_STAGES = [
  'Understanding event details',
  'Estimating waste streams',
  'Analyzing recovery potential',
  'Generating recommendations',
];

interface PredictionForm {
  event_type: string;
  guest_count: string;
  duration: string;
  food_type: string;
  catering_type: string;
  decoration_type: string;
  location: string;
}

const initialForm: PredictionForm = {
  event_type: '',
  guest_count: '',
  duration: '',
  food_type: '',
  catering_type: '',
  decoration_type: '',
  location: '',
};

const CATEGORY_COLORS: Record<string, string> = {
  food_waste_kg: '#EDA82A',
  flower_waste_kg: '#8DBB3A',
  plastic_waste_kg: '#3F7A2C',
  paper_waste_kg: '#1E4A30',
  fabric_waste_kg: '#6B9C2F',
};
const CATEGORY_LABELS: Record<string, string> = {
  food_waste_kg: 'Food',
  flower_waste_kg: 'Flowers',
  plastic_waste_kg: 'Plastic',
  paper_waste_kg: 'Paper',
  fabric_waste_kg: 'Fabric',
};

export default function WastePredictionPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'PREDICT' | 'SCAN'>('PREDICT');
  const [form, setForm] = useState<PredictionForm>(initialForm);
  const [result, setResult] = useState<WastePredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  
  // Image Scanner State
  const [scanImage, setScanImage] = useState<File | null>(null);
  const [scanPreview, setScanPreview] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');

  const stageIndex = useStagedProcessing(PROCESSING_STAGES.length, loading, 1800);

  function set(field: keyof PredictionForm, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handlePredict(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResult(null);
    setSaved(false);

    if (!form.event_type || !form.guest_count || !form.location) {
      setError('Please fill in the required fields.');
      return;
    }

    setLoading(true);
    try {
      const data = await fetchEventWastePrediction({
        event_type: form.event_type,
        guest_count: parseInt(form.guest_count) || 100,
        duration: parseInt(form.duration) || 4,
        food_type: form.food_type,
        catering_type: form.catering_type,
        decoration_type: form.decoration_type,
        location: form.location,
      });

      setResult(data);

      if (currentUser) {
        await saveWastePrediction({
          uid: currentUser.uid,
          input: {
            event_type: form.event_type,
            guest_count: parseInt(form.guest_count),
            duration: parseInt(form.duration) || 4,
            food_type: form.food_type,
            catering_type: form.catering_type,
            decoration_type: form.decoration_type,
            location: form.location,
          },
          result: data,
        });
        setSaved(true);
      }
    } catch (err: any) {
      setError(err.message || 'Prediction failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScanImage(file);
      setScanPreview(URL.createObjectURL(file));
      setScanResult(null);
      setScanError('');
    }
  }

  async function handleScanSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!scanImage) {
      setScanError('Please select a waste image to classify.');
      return;
    }

    setScanLoading(true);
    setScanError('');
    try {
      const res = await classifyWasteImage(scanImage);
      setScanResult(res);
    } catch (err: any) {
      setScanError(err.message || 'Failed to classify waste image.');
    } finally {
      setScanLoading(false);
    }
  }

  const categories = result
    ? (['food_waste_kg', 'flower_waste_kg', 'plastic_waste_kg', 'paper_waste_kg', 'fabric_waste_kg'] as const).map(key => ({
        key,
        label: CATEGORY_LABELS[key],
        value: result[key] as number,
        color: CATEGORY_COLORS[key],
      }))
    : [];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">
        <PageHeader
          eyebrow="AI workflow"
          title="AI Waste Prediction & Image Scanner"
          description="Predict waste generation before your event or upload an image to identify waste categories with trained AI models."
        />

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6 border-b border-border-subtle pb-3">
          <button
            onClick={() => setActiveTab('PREDICT')}
            className={`px-4 py-2 text-button font-medium rounded-xl transition-all ${
              activeTab === 'PREDICT'
                ? 'bg-brand-primary text-white shadow-natural'
                : 'text-text-secondary hover:bg-background-elevated'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={16} /> Event Waste Prediction
            </span>
          </button>

          <button
            onClick={() => setActiveTab('SCAN')}
            className={`px-4 py-2 text-button font-medium rounded-xl transition-all ${
              activeTab === 'SCAN'
                ? 'bg-brand-primary text-white shadow-natural'
                : 'text-text-secondary hover:bg-background-elevated'
            }`}
          >
            <span className="flex items-center gap-2">
              <Camera size={16} /> Waste Image Scanner
            </span>
          </button>
        </div>

        {activeTab === 'PREDICT' ? (
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            {/* Form */}
            <Card>
              <h2 className="text-h4 mb-5">Event Details</h2>
              <form onSubmit={handlePredict} className="space-y-5">
                {error && <Alert type="warning">{error}</Alert>}

                <fieldset className="space-y-4">
                  <legend className="text-label text-text-muted uppercase tracking-wide mb-1">Event</legend>
                  <Select
                    label="Event Type"
                    required
                    options={[
                      { value: '', label: 'Select event type' },
                      { value: 'Wedding', label: 'Wedding' },
                      { value: 'Corporate', label: 'Corporate Event' },
                      { value: 'Festival', label: 'Festival / Mela' },
                      { value: 'Puja', label: 'Puja / Religious Event' },
                      { value: 'Birthday', label: 'Birthday Party' },
                      { value: 'Conference', label: 'Conference' },
                    ]}
                    value={form.event_type}
                    onChange={e => set('event_type', e.target.value)}
                  />
                  <Input
                    label="Location / City"
                    required
                    placeholder="e.g. Vijayawada"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                  />
                </fieldset>

                <fieldset className="grid grid-cols-2 gap-4">
                  <legend className="sr-only">Attendance</legend>
                  <Input
                    label="Guest Count"
                    required
                    type="number"
                    placeholder="200"
                    value={form.guest_count}
                    onChange={e => set('guest_count', e.target.value)}
                  />
                  <Input
                    label="Duration (hrs)"
                    type="number"
                    placeholder="6"
                    value={form.duration}
                    onChange={e => set('duration', e.target.value)}
                  />
                </fieldset>

                <fieldset className="space-y-4">
                  <legend className="text-label text-text-muted uppercase tracking-wide mb-1">Food & Catering</legend>
                  <Select
                    label="Food Type"
                    options={[
                      { value: '', label: 'Select food type' },
                      { value: 'Vegetarian', label: 'Vegetarian' },
                      { value: 'Non-Veg', label: 'Non-Vegetarian' },
                      { value: 'Mixed', label: 'Mixed' },
                    ]}
                    value={form.food_type}
                    onChange={e => set('food_type', e.target.value)}
                  />
                  <Select
                    label="Catering Type"
                    options={[
                      { value: '', label: 'Select catering type' },
                      { value: 'In-house', label: 'In-house' },
                      { value: 'External Caterer', label: 'External Caterer' },
                      { value: 'Buffet', label: 'Buffet' },
                      { value: 'Sit-down', label: 'Sit-down' },
                    ]}
                    value={form.catering_type}
                    onChange={e => set('catering_type', e.target.value)}
                  />
                </fieldset>

                <fieldset>
                  <legend className="text-label text-text-muted uppercase tracking-wide mb-1">Decoration</legend>
                  <Select
                    label="Decoration Type"
                    options={[
                      { value: '', label: 'Select decoration type' },
                      { value: 'Flowers', label: 'Fresh Flowers Only' },
                      { value: 'Flowers + Fabric', label: 'Flowers + Fabric' },
                      { value: 'Flowers + Plastic', label: 'Flowers + Plastic' },
                      { value: 'Minimal', label: 'Minimal' },
                      { value: 'Elaborate', label: 'Elaborate' },
                    ]}
                    value={form.decoration_type}
                    onChange={e => set('decoration_type', e.target.value)}
                  />
                </fieldset>

                <Button type="submit" fullWidth loading={loading} icon={<Sparkles size={16} />}>
                  Predict Waste with AI Model
                </Button>
              </form>
            </Card>

            {/* Results */}
            <div className="space-y-4">
              {loading ? (
                <Card className="py-10">
                  <AIProcessing stages={PROCESSING_STAGES} activeIndex={stageIndex} />
                </Card>
              ) : !result ? (
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                    <Leaf size={28} />
                  </div>
                  <h3 className="text-h4 mb-1.5">Ready to predict</h3>
                  <p className="text-body-sm text-text-muted">Fill in event details and click "Predict Waste with AI Model".</p>
                </Card>
              ) : (
                <>
                  {saved && <Alert type="success">Prediction saved to your account.</Alert>}

                  <div className="rounded-2xl p-6 text-white shadow-natural bg-brand-gradient">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-white">Waste Summary</h3>
                      <AIBadge label="ML Random Forest Model" tone="inverted" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-display leading-none font-black text-white">{result.total_waste_kg}</p>
                        <p className="text-body-sm mt-1.5 text-white/75">Total predicted waste (kg)</p>
                      </div>
                      <div>
                        <p className="text-display leading-none font-black text-white">{result.diversion_percentage}%</p>
                        <p className="text-body-sm mt-1.5 text-white/75">Divertible from landfill</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-white/90" />
                      <p className="text-body-sm text-white">
                        <span className="font-bold">{result.recoverable_waste_kg} kg</span> <span className="text-white/75">recoverable</span>
                      </p>
                    </div>
                  </div>

                  <Card>
                    <h3 className="text-h4 mb-4">Waste Breakdown</h3>
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <WasteDonut categories={categories} />
                      <div className="flex-1 w-full space-y-2.5">
                        {categories.map(cat => (
                          <div key={cat.key} className="flex items-center justify-between text-body-sm">
                            <span className="flex items-center gap-2 text-text-secondary">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: cat.color }} />
                              {cat.label}
                            </span>
                            <span className="font-semibold tabular-nums">{cat.value} kg</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <h3 className="text-h4 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-brand-accent-strong" /> Recommendations
                    </h3>
                    <ul className="space-y-2.5">
                      {result.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                          <CheckCircle2 size={15} className="text-brand-primary mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                    {result.explanation && (
                      <p className="mt-4 text-caption text-text-muted italic border-t border-border-subtle pt-3">{result.explanation}</p>
                    )}
                  </Card>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Waste Image Classifier Tab */
          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <Card>
              <h2 className="text-h4 mb-4">Upload Waste Photo</h2>
              <p className="text-body-sm text-text-muted mb-5">
                Upload a photo of waste items to run real-time AI classification trained on 64,000 images.
              </p>

              <form onSubmit={handleScanSubmit} className="space-y-5">
                {scanError && <Alert type="warning">{scanError}</Alert>}

                <div className="border-2 border-dashed border-border-subtle rounded-2xl p-6 text-center hover:border-brand-primary transition-all">
                  {scanPreview ? (
                    <div className="space-y-4">
                      <img src={scanPreview} alt="Waste Scan Preview" className="max-h-60 max-w-full mx-auto rounded-xl object-contain shadow-natural" />
                      <label className="inline-flex items-center gap-2 text-button text-brand-primary cursor-pointer hover:underline">
                        <Upload size={16} /> Choose another photo
                        <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center cursor-pointer py-8">
                      <Camera size={36} className="text-brand-primary mb-3" />
                      <span className="font-semibold text-text-primary mb-1">Click to upload waste photo</span>
                      <span className="text-caption text-text-muted">Supports JPG, PNG, WEBP (Max 10MB)</span>
                      <input type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
                    </label>
                  )}
                </div>

                <Button type="submit" fullWidth loading={scanLoading} disabled={!scanImage} icon={<Camera size={16} />}>
                  Classify Waste Image
                </Button>
              </form>
            </Card>

            <div>
              {scanLoading ? (
                <Card className="py-12 text-center">
                  <div className="animate-spin text-brand-primary text-2xl mb-3">⚙️</div>
                  <h3 className="text-h4 mb-1">Analyzing Waste Image...</h3>
                  <p className="text-body-sm text-text-muted">Running inference through trained Waste Classifier model.</p>
                </Card>
              ) : !scanResult ? (
                <Card className="py-16 text-center">
                  <Camera size={32} className="text-text-muted mx-auto mb-3" />
                  <h3 className="text-h4 mb-1">No Image Scanned</h3>
                  <p className="text-body-sm text-text-muted">Upload an image and click "Classify Waste Image" to see AI classification.</p>
                </Card>
              ) : (
                <Card className="space-y-5">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                    <div>
                      <span className="text-caption text-text-muted uppercase tracking-wide">Predicted Category</span>
                      <h3 className="text-h3 capitalize text-brand-primary font-bold">{scanResult.prediction.class.replace('_', ' ')}</h3>
                    </div>
                    <AIBadge label={`Confidence ${(scanResult.prediction.confidence * 100).toFixed(1)}%`} tone="inverted" />
                  </div>

                  {/* Top Predictions */}
                  <div>
                    <h4 className="text-label text-text-muted uppercase tracking-wide mb-3">Top Probabilities</h4>
                    <div className="space-y-2">
                      {scanResult.topPredictions.map((tp: any, idx: number) => (
                        <div key={idx} className="flex items-center justify-between text-body-sm">
                          <span className="capitalize text-text-secondary">{tp.class.replace('_', ' ')}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-background-elevated rounded-full overflow-hidden">
                              <div className="h-full bg-brand-primary rounded-full" style={{ width: `${tp.confidence * 100}%` }} />
                            </div>
                            <span className="font-mono text-caption text-text-muted w-12 text-right">{(tp.confidence * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="border-t border-border-subtle pt-4">
                    <h4 className="text-h4 mb-3 flex items-center gap-2">
                      <Lightbulb size={16} className="text-brand-accent-strong" /> Handling & Recovery Guidance
                    </h4>
                    <ul className="space-y-2">
                      {scanResult.recommendations.map((rec: string, i: number) => (
                        <li key={i} className="flex items-start gap-2.5 text-body-sm text-text-secondary">
                          <CheckCircle2 size={15} className="text-brand-primary mt-0.5 shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

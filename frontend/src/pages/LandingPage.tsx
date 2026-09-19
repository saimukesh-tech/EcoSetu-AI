import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Sparkles, Handshake, Truck, BarChart2, ChevronDown, Menu,
  ShieldCheck, Users, Building2, Leaf, MessageCircle,
} from 'lucide-react';
import { Button, IconButton } from '../components/ui/Button';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Drawer } from '../components/ui/Modal';
import { BrandLogo } from '../components/brand/BrandLogo';
import { CircularJourney } from '../components/brand/CircularJourney';
import { WasteDonut } from '../components/charts/WasteCharts';
import { Timeline } from '../components/ui/Timeline';
import { AIBadge, AIMessage } from '../components/ai/AIComponents';
import { useAuth } from '../contexts/AuthContext';

const NAV_LINKS = [
  { href: '#platform', label: 'Platform' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#organizers', label: 'For Organizers' },
  { href: '#partners', label: 'For Recovery Partners' },
  { href: '#impact', label: 'Impact' },
];

// Sample output of the platform's own waste-estimation model (same coefficients
// as the fallback engine in src/pages/WastePredictionPage.tsx), shown as a
// clearly-labeled example — not a real event or fabricated statistic.
const SAMPLE_PREDICTION = {
  guests: 250, hours: 6,
  categories: [
    { key: 'food', label: 'Food', value: 158, color: '#EDA82A' },
    { key: 'flowers', label: 'Flowers', value: 68, color: '#8DBB3A' },
    { key: 'fabric', label: 'Fabric', value: 56, color: '#6B9C2F' },
    { key: 'plastic', label: 'Plastic', value: 38, color: '#3F7A2C' },
    { key: 'paper', label: 'Paper', value: 30, color: '#1E4A30' },
  ],
  total: 350,
  recoverable: 252,
  diversion: 72,
};

const PILLARS = [
  { icon: <Sparkles size={22} />, title: 'Predict', desc: 'AI-powered forecasting of food, flower, plastic, paper and fabric waste before your event happens.' },
  { icon: <Handshake size={22} />, title: 'Recover', desc: 'Get matched with verified recovery partners suited to your waste types, capacity and location.' },
  { icon: <Truck size={22} />, title: 'Track', desc: 'Schedule pickups and follow every request from request through completion.' },
  { icon: <BarChart2 size={22} />, title: 'Measure', desc: 'See waste diverted, CO₂ prevented and meals rescued translated into plain environmental impact.' },
];

const PARTNER_EXAMPLE = {
  orgName: 'FlowerLoop Recycling',
  accepts: ['Flowers', 'Fabric'],
  capacity: '500 kg',
  distance: '4.2 km away',
};

const PICKUP_STEPS = [
  { key: 'pending', label: 'Requested' },
  { key: 'matched', label: 'Matched' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'progress', label: 'In Progress' },
  { key: 'done', label: 'Completed' },
];

const FAQS = [
  { q: 'What types of events does EcoSetu AI support?', a: 'Weddings, corporate events, festivals, conferences, pujas, birthdays, and other gatherings that generate meaningful amounts of waste.' },
  { q: 'How does the waste prediction work?', a: 'You enter event details — guest count, duration, food and decoration style — and the AI (with a transparent formula-based fallback when the AI service is unavailable) estimates waste by category and how much of it is recoverable.' },
  { q: 'Are recovery partners verified?', a: 'Partner listings show a verification badge where a partner has been verified; unverified or demo listings are labeled clearly so you always know what you’re looking at.' },
  { q: 'Can I use EcoSetu AI as a recovery partner, not an organizer?', a: 'Yes — choose "Recovery Partner" during onboarding to receive and manage incoming pickup requests instead of the organizer tools.' },
];

export default function LandingPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const [menuOpen, setMenuOpen] = useState(false);

  function handleGetStarted() {
    if (currentUser) navigate('/dashboard');
    else navigate('/signup');
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/90 backdrop-blur border-b border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2">
            <BrandLogo size={32} className="shrink-0" />
            <div className="hidden lg:flex items-center gap-7 text-body-sm text-text-secondary">
              {NAV_LINKS.map(link => (
                <a key={link.href} href={link.href} className="nav-underline">{link.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              <div className="hidden lg:block"><ThemeToggle /></div>
              <div className="hidden lg:flex items-center gap-2.5">
                {currentUser ? (
                  <Button onClick={() => navigate('/dashboard')} size="sm">Go to Dashboard</Button>
                ) : (
                  <>
                    <Link to="/login" className="text-body-sm text-text-secondary hover:text-brand-primary font-semibold transition-colors">Sign in</Link>
                    <Button onClick={() => navigate('/signup')} size="sm">Start Your Event</Button>
                  </>
                )}
              </div>
              <div className="lg:hidden">
                <Button onClick={handleGetStarted} size="sm">
                  <span className="hidden sm:inline">Start Your Event</span>
                  <span className="sm:hidden">Start Free</span>
                </Button>
              </div>
              <IconButton
                icon={<Menu size={20} />}
                label="Open menu"
                onClick={() => setMenuOpen(true)}
                className="lg:hidden"
              />
            </div>
          </div>
        </div>
      </nav>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu">
        <nav className="flex flex-col p-2" aria-label="Primary">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="px-3.5 py-3 rounded-lg text-body-sm font-medium text-text-secondary hover:bg-surface-sunken hover:text-text-primary transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-2 p-4 border-t border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-body-sm text-text-secondary">Theme</span>
            <ThemeToggle />
          </div>
          {currentUser ? (
            <Button fullWidth onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}>Go to Dashboard</Button>
          ) : (
            <>
              <Button fullWidth onClick={() => { setMenuOpen(false); navigate('/signup'); }}>Start Your Event</Button>
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block text-center text-body-sm font-semibold text-text-secondary hover:text-brand-primary transition-colors py-2"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </Drawer>

      {/* Hero */}
      <section className="relative overflow-hidden bg-background-subtle pt-16 pb-20 sm:pt-20 sm:pb-28">
        <div aria-hidden="true" className="absolute -top-24 -right-40 w-[480px] h-[480px] rounded-full bg-brand-primary/[0.06] blur-2xl" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-brand-accent/[0.08] blur-2xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary text-caption font-semibold px-3 py-1.5 rounded-full mb-6">
                <Leaf size={12} /> AI-powered circular-economy platform
              </div>
              <h1 className="font-display-serif text-h1 sm:text-display text-text-primary leading-[1.08] mb-6">
                Turn celebrations into <span className="text-brand-primary">circular impact.</span>
              </h1>
              <p className="text-body-lg text-text-secondary mb-8 max-w-lg leading-relaxed">
                EcoSetu AI predicts what your event will waste, connects you with the right recovery partners, and tracks the environmental impact of every pickup — from weddings and festivals to corporate gatherings.
              </p>
              <div className="flex flex-wrap gap-3.5">
                <Button size="lg" onClick={handleGetStarted} icon={<ArrowRight size={18} />} iconPosition="right">
                  Start Your Event
                </Button>
                <Button size="lg" variant="outline" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                  See How It Works
                </Button>
              </div>
              <p className="mt-4 text-caption text-text-muted">Free for event organizers · No credit card required</p>
            </div>

            {/* Product composition visual — real dashboard structure, not stock art */}
            <div className="relative">
              <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-elevated p-5 sm:p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-caption text-text-muted">Sharma Wedding · 250 guests</p>
                    <p className="text-h4">AI Waste Prediction</p>
                  </div>
                  <AIBadge />
                </div>
                <div className="flex items-center gap-6">
                  <WasteDonut categories={SAMPLE_PREDICTION.categories} />
                  <div className="flex-1 space-y-2.5">
                    {SAMPLE_PREDICTION.categories.slice(0, 3).map(c => (
                      <div key={c.key} className="flex items-center justify-between text-body-sm">
                        <span className="flex items-center gap-2 text-text-secondary">
                          <span className="w-2 h-2 rounded-full" style={{ background: c.color }} />{c.label}
                        </span>
                        <span className="font-semibold tabular-nums">{c.value} kg</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-border-subtle grid grid-cols-2 gap-3 text-center">
                  <div className="bg-brand-primary/10 rounded-lg py-2.5">
                    <p className="text-h4 text-brand-primary leading-none">{SAMPLE_PREDICTION.diversion}%</p>
                    <p className="text-caption text-text-muted mt-1">Recoverable</p>
                  </div>
                  <div className="bg-surface-sunken rounded-lg py-2.5">
                    <p className="text-h4 leading-none">{SAMPLE_PREDICTION.total} kg</p>
                    <p className="text-caption text-text-muted mt-1">Total forecast</p>
                  </div>
                </div>
                <p className="text-[11px] text-text-muted mt-3 italic">Example output from EcoSetu AI's estimation model — not a real event.</p>
              </div>

              {/* floating matched-partner card — anchored just below the main card, never overlapping its text */}
              <div className="hidden sm:block absolute top-full right-6 mt-4 bg-surface-elevated rounded-xl shadow-elevated border border-border-subtle p-3.5 w-56 animate-fade-up">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-brand-primary" />
                  <p className="text-caption font-semibold">Verified partner matched</p>
                </div>
                <p className="text-body-sm font-semibold text-text-primary">{PARTNER_EXAMPLE.orgName}</p>
                <p className="text-caption text-text-muted">{PARTNER_EXAMPLE.accepts.join(' · ')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Designed for — replaces unverifiable stats/testimonials */}
      <section className="py-10 bg-surface-elevated border-y border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-caption text-text-muted uppercase tracking-wide mb-6">Designed for</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Building2 size={18} />, label: 'Event Organizers' },
              { icon: <Handshake size={18} />, label: 'Recovery Partners' },
              { icon: <Users size={18} />, label: 'Communities' },
              { icon: <ShieldCheck size={18} />, label: 'Sustainability Teams' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-center gap-2 text-body-sm font-medium text-text-secondary py-2">
                <span className="text-brand-primary">{item.icon}</span>{item.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value pillars: Predict -> Recover -> Track -> Measure */}
      <section id="platform" className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display-serif text-h1 mb-4">One workflow, start to finish</h2>
            <p className="text-body-lg text-text-secondary">Everything you need to manage event waste responsibly, in a single connected flow.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className="group relative bg-surface-elevated rounded-2xl border border-border-subtle p-6 transition-all duration-200 ease-out hover:shadow-elevated hover:-translate-y-1 hover:border-brand-primary/25"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center mb-4 transition-transform duration-200 ease-out group-hover:scale-110">
                  {p.icon}
                </div>
                <h3 className="text-h4 mb-2">{p.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">{p.desc}</p>
                {i < PILLARS.length - 1 && (
                  <ArrowRight size={16} className="hidden lg:block absolute top-8 -right-3 text-border-strong" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Signature circular economy section */}
      <section id="how-it-works" className="py-20 sm:py-24 bg-background-subtle overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-label text-brand-primary uppercase tracking-wide mb-2">How it works</p>
            <h2 className="font-display-serif text-h1 mb-5">From celebration to circular impact</h2>
            <p className="text-body-lg text-text-secondary mb-6 leading-relaxed">
              Every event follows the same journey: what's celebrated becomes waste, AI turns that waste into a plan, recovery partners and communities carry it forward, and the result is measurable impact that feeds back into how you plan the next event.
            </p>
            <ol className="space-y-4">
              {['Create your event and describe it in a few short steps', 'Get an AI-generated waste forecast with a clear breakdown', 'Get matched with recovery partners suited to your waste', 'Track pickups on a simple status timeline', 'See the environmental impact once it’s complete'].map((step, i) => (
                <li key={step} className="group flex items-start gap-3.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary text-caption font-bold shrink-0 mt-0.5 transition-all duration-200 ease-out group-hover:bg-brand-primary group-hover:text-text-on-brand group-hover:scale-110">
                    {i + 1}
                  </span>
                  <span className="text-body-sm text-text-secondary pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <CircularJourney size={380} />
        </div>
      </section>

      {/* Partner matching preview */}
      <section id="organizers" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-surface-elevated rounded-2xl border border-border-subtle shadow-natural p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-h4">Recommended partner</h3>
              <span className="inline-flex items-center gap-1 text-caption font-semibold text-success"><ShieldCheck size={13} /> Verified</span>
            </div>
            <p className="font-bold text-text-primary mb-1">{PARTNER_EXAMPLE.orgName}</p>
            <p className="text-body-sm text-text-muted mb-4">Converts floral waste into compost, potpourri and organic dyes.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {PARTNER_EXAMPLE.accepts.map(t => <span key={t} className="text-caption bg-brand-primary/10 text-brand-primary px-2.5 py-1 rounded-full">{t}</span>)}
            </div>
            <div className="grid grid-cols-2 gap-3 text-body-sm text-text-secondary mb-5">
              <p><span className="text-text-muted">Capacity:</span> {PARTNER_EXAMPLE.capacity}</p>
              <p><span className="text-text-muted">Distance:</span> {PARTNER_EXAMPLE.distance}</p>
            </div>
            <Button fullWidth>Request Pickup</Button>
          </div>
          <div className="order-1 lg:order-2">
            <p className="text-label text-brand-primary uppercase tracking-wide mb-2">Smart matching</p>
            <h2 className="font-display-serif text-h1 mb-5">The right partner for every waste type</h2>
            <p className="text-body-lg text-text-secondary leading-relaxed mb-6">
              EcoSetu AI matches your predicted waste against partner capacity, accepted materials, availability and distance — so you're never guessing who to call.
            </p>
            <div className="space-y-2.5 text-body-sm text-text-secondary">
              {['What waste do I have?', 'Who can accept it?', 'Who is available, and how much capacity do they have?', 'How do I request a pickup?'].map((q, i) => (
                <div key={q} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-surface-sunken text-caption font-bold flex items-center justify-center shrink-0">{i + 1}</span>{q}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pickup tracking */}
      <section id="partners" className="py-20 sm:py-24 bg-background-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-label text-brand-primary uppercase tracking-wide mb-2">For recovery partners</p>
            <h2 className="font-display-serif text-h1 mb-4">Every pickup, tracked end to end</h2>
            <p className="text-body-lg text-text-secondary">From the moment a request comes in to the moment it's completed — both sides always know where things stand.</p>
          </div>
          <div className="bg-surface-elevated rounded-2xl border border-border-subtle p-6 sm:p-8">
            <Timeline steps={PICKUP_STEPS} currentIndex={3} />
          </div>
        </div>
      </section>

      {/* Impact */}
      <section id="impact" className="py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display-serif text-h1 mb-4">Impact you can see</h2>
            <p className="text-body-lg text-text-secondary">Every completed pickup adds to a running picture of waste diverted, CO₂ prevented and meals rescued.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              { icon: <Leaf size={20} />, title: 'Waste Diverted', desc: 'Total kilograms recovered instead of sent to landfill, from every completed pickup.' },
              { icon: <BarChart2 size={20} />, title: 'CO₂ Prevented', desc: 'Estimated using the platform’s published impact model (waste diverted × 0.7).' },
              { icon: <Handshake size={20} />, title: 'Meals Rescued', desc: 'Portion of diverted food waste redirected to shelters and food banks (× 0.3).' },
            ].map(card => (
              <div key={card.title} className="bg-surface-elevated rounded-2xl border border-border-subtle p-6">
                <div className="w-11 h-11 rounded-xl bg-brand-accent/15 text-brand-accent-strong flex items-center justify-center mb-4">{card.icon}</div>
                <h3 className="text-h4 mb-2">{card.title}</h3>
                <p className="text-body-sm text-text-secondary leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI assistant */}
      <section className="py-20 sm:py-24 bg-background-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-label text-brand-primary uppercase tracking-wide mb-2">AI sustainability assistant</p>
            <h2 className="font-display-serif text-h1 mb-5">Practical answers, not gimmicks</h2>
            <p className="text-body-lg text-text-secondary leading-relaxed mb-6">
              Ask about waste segregation, composting, food recovery or sustainable decorations, and get concise, practical guidance grounded in what the platform can actually do for you.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Waste segregation', 'Composting', 'Food recovery', 'Sustainable decorations'].map(t => (
                <span key={t} className="text-caption bg-surface-elevated border border-border-subtle px-3 py-1.5 rounded-full text-text-secondary">{t}</span>
              ))}
            </div>
          </div>
          <div className="bg-surface-elevated rounded-2xl border border-border-subtle shadow-natural p-5 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <MessageCircle size={16} className="text-brand-primary" />
              <p className="text-body-sm font-semibold">EcoSetu AI Assistant</p>
            </div>
            <AIMessage role="assistant">How can I help make your event more sustainable?</AIMessage>
            <AIMessage role="user">How do I reduce flower waste at a wedding?</AIMessage>
            <AIMessage role="assistant">Partner with a floral recycler for post-event pickup, and consider donating fresh arrangements to a temple or shelter before they wilt.</AIMessage>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display-serif text-h1 text-center mb-12">Frequently asked questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={faq.q} className="border border-border-subtle rounded-xl overflow-hidden bg-surface-elevated">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-body-sm font-semibold text-text-primary hover:bg-surface-sunken transition-colors duration-200 focus-visible:outline-none focus-visible:shadow-focus-ring"
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  aria-expanded={faqOpen === i}
                  aria-controls={`faq-answer-${i}`}
                  id={`faq-question-${i}`}
                >
                  {faq.q}
                  <ChevronDown size={16} className={`shrink-0 text-text-muted transition-transform duration-200 ${faqOpen === i ? 'rotate-180' : ''}`} />
                </button>
                {faqOpen === i && (
                  <div
                    id={`faq-answer-${i}`}
                    role="region"
                    aria-labelledby={`faq-question-${i}`}
                    className="px-5 pb-4 text-body-sm text-text-secondary leading-relaxed border-t border-border-subtle pt-3 animate-fade-up"
                  >
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-24 bg-brand-forest">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display-serif text-h1 text-white mb-4">Ready to make your next event circular?</h2>
          <p className="text-body-lg text-white/75 mb-8">Free for event organizers — start with your first event today.</p>
          <Button size="lg" className="bg-white text-brand-forest hover:bg-cream" onClick={handleGetStarted} icon={<ArrowRight size={18} />} iconPosition="right">
            Start Your Event
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-charcoal text-white/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <BrandLogo size={32} wordmarkClassName="text-white" className="mb-3" />
              <p className="text-caption">Bridging Celebrations to a Circular Future.</p>
            </div>
            <div>
              <p className="text-caption font-semibold text-white mb-3">Platform</p>
              <ul className="space-y-2 text-caption">
                <li><Link to="/events" className="hover:text-white transition-colors">Events</Link></li>
                <li><Link to="/predict" className="hover:text-white transition-colors">Waste Prediction</Link></li>
                <li><Link to="/partners" className="hover:text-white transition-colors">Recovery Partners</Link></li>
                <li><Link to="/impact" className="hover:text-white transition-colors">Impact</Link></li>
                <li><Link to="/assistant" className="hover:text-white transition-colors">AI Assistant</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-caption font-semibold text-white mb-3">Company</p>
              <ul className="space-y-2 text-caption">
                <li><a href="#platform" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <p className="text-caption font-semibold text-white mb-3">Get started</p>
              <ul className="space-y-2 text-caption">
                <li><Link to="/signup" className="hover:text-white transition-colors">Create an account</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Sign in</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-caption">
            <p>© {new Date().getFullYear()} EcoSetu AI</p>
            <p>Bridging Celebrations to a Circular Future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

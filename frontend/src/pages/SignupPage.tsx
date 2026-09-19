import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Alert } from '../components/feedback/Alert';
import { BrandLogo } from '../components/brand/BrandLogo';
import { CircularJourney } from '../components/brand/CircularJourney';
import { useAuth } from '../contexts/AuthContext';

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
    <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
    <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
  </svg>
);

function getFirebaseError(code: string): string {
  const errors: Record<string, string> = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups.',
    'auth/unauthorized-domain': 'This domain isn’t authorized in Firebase yet — continuing in demo mode.',
    'auth/operation-not-allowed': 'Google Sign-In isn’t enabled in Firebase yet — continuing in demo mode.',
  };
  return errors[code] || 'Sign-up ran into an issue — continuing in demo mode.';
}

export default function SignupPage() {
  const { signInWithGoogle, signUpWithEmail, signInAsDemoUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate('/onboarding');
    } catch (e: any) {
      setError(getFirebaseError(e.code || ''));
      await signInAsDemoUser(name || 'Demo Event Organizer', email || 'organizer@ecosetu.ai');
      navigate('/onboarding');
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (!email) { setError('Please enter your email.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await signUpWithEmail(email, password, name);
      navigate('/onboarding');
    } catch (e: any) {
      setError(getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 bg-brand-forest text-white flex-col justify-between p-12 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
        <Link to="/"><BrandLogo size={36} wordmarkClassName="text-white" /></Link>
        <div className="relative z-10">
          <h2 className="font-display-serif text-h1 text-white mb-4 leading-tight">Bridging celebrations to a circular future.</h2>
          <p className="text-body-lg text-white/70 max-w-md">Create an account to start predicting event waste and connecting with recovery partners near you.</p>
        </div>
        <div className="relative z-10 flex justify-center py-6">
          <CircularJourney size={260} labels={false} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="lg:hidden"><BrandLogo size={32} /></Link>
          <div className="lg:ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login" className="text-body-sm text-text-secondary hover:text-brand-primary font-semibold transition-colors">Already have an account? Sign in</Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-h1 text-text-primary mb-1.5">Create your account</h1>
              <p className="text-body-sm text-text-muted">Join EcoSetu AI — free for event organizers</p>
            </div>

            <Button variant="outline" fullWidth className="mb-6" onClick={handleGoogle} loading={googleLoading} icon={!googleLoading ? GOOGLE_ICON : undefined}>
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-background text-caption text-text-muted">or sign up with email</span></div>
            </div>

            {error && <div className="mb-4"><Alert type="warning" title="Heads up">{error}</Alert></div>}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input label="Full name" required type="text" autoComplete="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} icon={<User size={16} />} />
              <Input label="Email address" required type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
              <Input label="Password" required type="password" autoComplete="new-password" hint="Minimum 6 characters" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} icon={<Lock size={16} />} />
              <Button type="submit" fullWidth loading={loading}>Create Account</Button>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-caption text-text-muted mt-6">
              <ShieldCheck size={13} /> Secured with Firebase Authentication
            </p>
            <p className="text-center text-body-sm text-text-muted mt-3">
              Already have an account? <Link to="/login" className="text-brand-primary font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

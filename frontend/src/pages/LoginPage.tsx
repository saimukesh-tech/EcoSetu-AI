import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Google sign-in popup was closed.',
    'auth/popup-blocked': 'Sign-in popup was blocked by your browser. Please allow popups.',
    'auth/unauthorized-domain': 'This domain isn’t authorized in Firebase yet — continuing in demo mode.',
    'auth/operation-not-allowed': 'Google Sign-In isn’t enabled in Firebase yet — continuing in demo mode.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return errors[code] || 'Sign-in ran into an issue — continuing in demo mode.';
}

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, signInAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(getFirebaseError(e.code || ''));
      await signInAsDemoUser('Demo Event Organizer', 'organizer@ecosetu.ai');
      navigate(from, { replace: true });
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      navigate(from, { replace: true });
    } catch (e: any) {
      setError(getFirebaseError(e.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-forest text-white flex-col justify-between p-12 relative overflow-hidden">
        <div aria-hidden="true" className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-white/5" />
        <Link to="/"><BrandLogo size={36} wordmarkClassName="text-white" /></Link>
        <div className="relative z-10">
          <h2 className="font-display-serif text-h1 text-white mb-4 leading-tight">Every celebration can leave a lighter footprint.</h2>
          <p className="text-body-lg text-white/70 max-w-md">Sign in to keep predicting waste, matching with recovery partners, and tracking your impact.</p>
        </div>
        <div className="relative z-10 flex justify-center py-6">
          <CircularJourney size={260} labels={false} />
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4">
          <Link to="/" className="lg:hidden"><BrandLogo size={32} /></Link>
          <div className="lg:ml-auto flex items-center gap-3">
            <ThemeToggle />
            <Link to="/signup" className="text-body-sm text-text-secondary hover:text-brand-primary font-semibold transition-colors">Create account →</Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h1 className="text-h1 text-text-primary mb-1.5">Welcome back</h1>
              <p className="text-body-sm text-text-muted">Sign in to your EcoSetu AI account</p>
            </div>

            <Button
              variant="outline"
              fullWidth
              className="mb-6"
              onClick={handleGoogle}
              loading={googleLoading}
              icon={!googleLoading ? GOOGLE_ICON : undefined}
            >
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center"><span className="px-3 bg-background text-caption text-text-muted">or sign in with email</span></div>
            </div>

            {error && (
              <div className="mb-4">
                <Alert type="warning" title="Heads up">{error}</Alert>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input label="Email address" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} icon={<Mail size={16} />} />
              <div className="relative">
                <Input
                  label="Password" required autoComplete="current-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  icon={<Lock size={16} />}
                />
                <button
                  type="button"
                  className="absolute right-3 bottom-2.5 text-text-muted hover:text-text-primary"
                  onClick={() => setShowPw(!showPw)}
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <Button type="submit" fullWidth loading={loading}>Sign In</Button>
            </form>

            <p className="flex items-center justify-center gap-1.5 text-caption text-text-muted mt-6">
              <ShieldCheck size={13} /> Secured with Firebase Authentication
            </p>
            <p className="text-center text-body-sm text-text-muted mt-3">
              Don't have an account? <Link to="/signup" className="text-brand-primary font-semibold hover:underline">Sign up free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

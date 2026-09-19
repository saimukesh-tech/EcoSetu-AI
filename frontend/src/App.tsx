import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ToastProvider } from './components/feedback/Toast';

// Landing is the most common first paint — keep it in the main bundle.
import LandingPage from './pages/LandingPage';

// Every other route is lazy-loaded so authenticated-app code doesn't
// weigh down the public landing page's first load.
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const OrganizerDashboard = lazy(() => import('./pages/OrganizerDashboard'));
const PartnerDashboard = lazy(() => import('./pages/PartnerDashboard'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const NewEventPage = lazy(() => import('./pages/NewEventPage'));
const WastePredictionPage = lazy(() => import('./pages/WastePredictionPage'));
const AIAssistantPage = lazy(() => import('./pages/AIAssistantPage'));
const PartnerMatchingPage = lazy(() => import('./pages/PartnerMatchingPage'));
const PickupRequestsPage = lazy(() => import('./pages/PickupRequestsPage'));
const ImpactPage = lazy(() => import('./pages/ImpactPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <img src="/ecosetu-logo.png" alt="" className="w-14 h-14 rounded-full object-cover animate-pulse-soft" />
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
      <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<RouteFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Onboarding — protected but no role check */}
          <Route path="/onboarding" element={
            <ProtectedRoute><OnboardingPage /></ProtectedRoute>
          } />

          {/* Protected app routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute><OrganizerDashboard /></ProtectedRoute>
          } />
          <Route path="/partner-dashboard" element={
            <ProtectedRoute><PartnerDashboard /></ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute><EventsPage /></ProtectedRoute>
          } />
          <Route path="/events/new" element={
            <ProtectedRoute><NewEventPage /></ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <ProtectedRoute><EventDetailPage /></ProtectedRoute>
          } />
          <Route path="/predict" element={
            <ProtectedRoute><WastePredictionPage /></ProtectedRoute>
          } />
          <Route path="/partners" element={
            <ProtectedRoute><PartnerMatchingPage /></ProtectedRoute>
          } />
          <Route path="/pickups" element={
            <ProtectedRoute><PickupRequestsPage /></ProtectedRoute>
          } />
          <Route path="/partner-pickups" element={
            <ProtectedRoute><PickupRequestsPage /></ProtectedRoute>
          } />
          <Route path="/assistant" element={
            <ProtectedRoute><AIAssistantPage /></ProtectedRoute>
          } />
          <Route path="/impact" element={
            <ProtectedRoute><ImpactPage /></ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute><SettingsPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </ToastProvider>
      </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

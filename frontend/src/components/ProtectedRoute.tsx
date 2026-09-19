import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
      <div className="text-center">
        <img
          src="/ecosetu-logo.png"
          alt=""
          className="w-16 h-16 rounded-full object-cover mx-auto mb-4 animate-pulse-soft"
        />
        <p className="text-brand-primary font-semibold text-body-sm">Loading EcoSetu AI…</p>
      </div>
    </div>
  );
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

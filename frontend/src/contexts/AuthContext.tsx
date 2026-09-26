import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  createUserWithEmailAndPassword, signOut, updateProfile,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile, setUserRole } from '../lib/firestore';
import { ENV } from '../config/environment';
import type { UserProfile } from '../types';

interface AuthContextValue {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInAsDemoUser: (name?: string, email?: string) => Promise<void>;
  updateUserRole: (role: 'ORGANIZER' | 'RECOVERY_PARTNER') => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function withTimeout<T>(promise: Promise<T>, timeoutMs = 5000): Promise<T | null> {
  return Promise.race([
    promise.catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), timeoutMs)),
  ]);
}

function getStoredDemoData() {
  if (!ENV.ENABLE_DEMO_MODE) return null;
  try {
    const raw = localStorage.getItem('uc_demo_user');
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo user is active in localStorage (development only)
    if (ENV.ENABLE_DEMO_MODE) {
      const storedDemo = getStoredDemoData();
      if (storedDemo?.user && storedDemo?.profile) {
        setCurrentUser(storedDemo.user);
        setUserProfile(storedDemo.profile);
      }
    }

    if (!auth) {
      setLoading(false);
      return;
    }

    let unsub = () => {};
    try {
      unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setCurrentUser(user);
          // Get ID Token & store for backend auth headers
          try {
            const token = await user.getIdToken();
            localStorage.setItem('ecosetu_auth_token', `Bearer ${token}`);
          } catch { /* ignore */ }
          try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
          const profile = await withTimeout(getUserProfile(user.uid));
          setUserProfile(profile);
        } else if (!getStoredDemoData()) {
          setCurrentUser(null);
          setUserProfile(null);
          localStorage.removeItem('ecosetu_auth_token');
        }
        setLoading(false);
      });
    } catch {
      setLoading(false);
    }

    const safetyTimer = setTimeout(() => setLoading(false), 3000);

    return () => {
      try { unsub(); } catch { /* ignore */ }
      clearTimeout(safetyTimer);
    };
  }, []);

  async function signInAsDemoUser(name = 'Demo Event Organizer', email = 'organizer@ecosetu.ai') {
    if (!ENV.ENABLE_DEMO_MODE) {
      throw new Error('Demo authentication mode is disabled in production environments.');
    }
    const demoUser: any = {
      uid: 'demo_organizer_123',
      email,
      displayName: name,
      photoURL: '',
    };
    const demoProfile: UserProfile = {
      uid: 'demo_organizer_123',
      name,
      email,
      photoURL: '',
      role: 'ORGANIZER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentUser(demoUser);
    setUserProfile(demoProfile);
    localStorage.setItem('ecosetu_auth_token', 'Bearer demo_token_organizer');
    try {
      localStorage.setItem('uc_demo_user', JSON.stringify({ user: demoUser, profile: demoProfile }));
    } catch { /* ignore */ }
  }

  async function signInWithGoogle() {
    if (!auth) {
      if (ENV.ENABLE_DEMO_MODE) {
        await signInAsDemoUser();
        return;
      }
      throw new Error('Firebase Authentication service is not initialized.');
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      const token = await user.getIdToken();
      localStorage.setItem('ecosetu_auth_token', `Bearer ${token}`);
      try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
      try {
        await createUserProfile({
          uid: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || '',
          role: 'ORGANIZER',
        });
        const profile = await withTimeout(getUserProfile(user.uid));
        setUserProfile(profile);
      } catch {
        // Non-fatal
      }
    } catch (err: any) {
      if (ENV.ENABLE_DEMO_MODE) {
        const isDomainOrConfigError =
          err?.code === 'auth/unauthorized-domain' ||
          err?.code === 'auth/operation-not-allowed' ||
          err?.code === 'auth/unauthorized-origin' ||
          err?.code === 'auth/internal-error' ||
          err?.code === 'auth/popup-blocked' ||
          !err?.code;

        if (isDomainOrConfigError) {
          console.warn('Google Auth domain/config restriction detected. Activating Demo Session fallback in dev mode.', err);
          await signInAsDemoUser('Demo Event Organizer', 'organizer@ecosetu.ai');
          return;
        }
      }
      throw err;
    }
  }

  async function signInWithEmail(email: string, password: string) {
    if (!auth) {
      if (ENV.ENABLE_DEMO_MODE) {
        await signInAsDemoUser('Demo User', email);
        return;
      }
      throw new Error('Firebase Authentication service is not initialized.');
    }
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      localStorage.setItem('ecosetu_auth_token', `Bearer ${token}`);
      try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
    } catch (err: any) {
      if (ENV.ENABLE_DEMO_MODE && (err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/operation-not-allowed')) {
        await signInAsDemoUser('Demo User', email);
        return;
      }
      throw err;
    }
  }

  async function signUpWithEmail(email: string, password: string, name: string) {
    if (!auth) {
      if (ENV.ENABLE_DEMO_MODE) {
        await signInAsDemoUser(name, email);
        return;
      }
      throw new Error('Firebase Authentication service is not initialized.');
    }
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      const token = await result.user.getIdToken();
      localStorage.setItem('ecosetu_auth_token', `Bearer ${token}`);
      try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
      try {
        await createUserProfile({
          uid: result.user.uid,
          name,
          email,
          photoURL: '',
          role: 'ORGANIZER',
        });
        const profile = await withTimeout(getUserProfile(result.user.uid));
        setUserProfile(profile);
      } catch {
        // Non-fatal
      }
    } catch (err: any) {
      if (ENV.ENABLE_DEMO_MODE && (err?.code === 'auth/unauthorized-domain' || err?.code === 'auth/operation-not-allowed')) {
        await signInAsDemoUser(name, email);
        return;
      }
      throw err;
    }
  }

  async function updateUserRole(role: 'ORGANIZER' | 'RECOVERY_PARTNER') {
    if (currentUser?.uid) {
      try {
        await setUserRole(currentUser.uid, role);
      } catch { /* ignore */ }
    }
    setUserProfile(prev => prev ? { ...prev, role } : {
      uid: currentUser?.uid || 'demo_organizer_123',
      name: currentUser?.displayName || 'User',
      email: currentUser?.email || 'user@ecosetu.ai',
      photoURL: currentUser?.photoURL || '',
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    if (ENV.ENABLE_DEMO_MODE) {
      const stored = getStoredDemoData();
      if (stored) {
        stored.profile.role = role;
        try { localStorage.setItem('uc_demo_user', JSON.stringify(stored)); } catch { /* ignore */ }
      }
    }
  }

  async function logout() {
    try { localStorage.removeItem('uc_demo_user'); } catch { /* ignore */ }
    localStorage.removeItem('ecosetu_auth_token');
    if (auth) {
      try { await signOut(auth); } catch { /* ignore */ }
    }
    setCurrentUser(null);
    setUserProfile(null);
  }

  async function refreshProfile() {
    if (currentUser && currentUser.uid !== 'demo_organizer_123') {
      const profile = await withTimeout(getUserProfile(currentUser.uid));
      setUserProfile(profile);
    }
  }

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsDemoUser, updateUserRole,
      logout, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

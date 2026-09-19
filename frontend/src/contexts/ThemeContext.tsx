import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LS_KEY = 'uc_theme';

function systemIsDark() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(t: Theme): ResolvedTheme {
  if (t === 'light') return 'light';
  if (t === 'dark') return 'dark';
  return systemIsDark() ? 'dark' : 'light';
}

function commitToDOM(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.style.colorScheme = resolved;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
    // Belt-and-suspenders: remove any inline dark bg the browser may have set
    root.style.backgroundColor = '';
    document.body.style.backgroundColor = '';
  }
}

function readLS(): Theme {
  try {
    const v = localStorage.getItem(LS_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
  } catch { /* ignore */ }
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readLS);
  const [resolvedTheme, setResolved] = useState<ResolvedTheme>(() => resolveTheme(readLS()));
  const mountedRef = useRef(false);

  // Apply theme to DOM when theme changes
  useEffect(() => {
    const resolved = resolveTheme(theme);
    commitToDOM(resolved);
    setResolved(resolved);
    mountedRef.current = true;
  }, [theme]);

  // Watch system preference when theme === 'system'
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const r = resolveTheme('system');
      commitToDOM(r);
      setResolved(r);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  function setTheme(t: Theme) {
    try { localStorage.setItem(LS_KEY, t); } catch { /* ignore */ }
    const resolved = resolveTheme(t);
    commitToDOM(resolved);   // immediate — no waiting for effects
    setResolved(resolved);
    setThemeState(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

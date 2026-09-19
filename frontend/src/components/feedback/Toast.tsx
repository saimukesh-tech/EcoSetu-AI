import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { clsx } from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem { id: number; type: ToastType; message: string; }

const ToastContext = createContext<{ push: (type: ToastType, message: string) => void } | null>(null);

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertTriangle size={18} />,
  info: <Info size={18} />,
};

const TONES: Record<ToastType, string> = {
  success: 'border-success/30 text-success',
  error: 'border-error/30 text-error',
  warning: 'border-warning/30 text-warning',
  info: 'border-info/30 text-info',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const push = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      {createPortal(
        <div role="status" aria-live="polite" className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
          {toasts.map(t => (
            <div key={t.id} className={clsx('flex items-start gap-2.5 bg-surface-elevated border rounded-xl shadow-elevated px-4 py-3 animate-fade-up', TONES[t.type])}>
              <span className="mt-0.5 shrink-0">{ICONS[t.type]}</span>
              <p className="text-body-sm text-text-primary flex-1">{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} aria-label="Dismiss notification" className="text-text-muted hover:text-text-primary transition-all duration-200 hover:scale-110 active:scale-90 focus-visible:outline-none focus-visible:shadow-focus-ring rounded">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

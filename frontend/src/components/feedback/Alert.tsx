import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';

type AlertType = 'success' | 'error' | 'warning' | 'info';

const CONFIG: Record<AlertType, { icon: React.ReactNode; classes: string }> = {
  success: { icon: <CheckCircle2 size={16} />, classes: 'bg-success-subtle text-success border-success/20' },
  error: { icon: <XCircle size={16} />, classes: 'bg-error-subtle text-error border-error/20' },
  warning: { icon: <AlertTriangle size={16} />, classes: 'bg-warning-subtle text-warning border-warning/20' },
  info: { icon: <Info size={16} />, classes: 'bg-info-subtle text-info border-info/20' },
};

export function Alert({ type = 'info', title, children }: { type?: AlertType; title?: string; children: React.ReactNode }) {
  const cfg = CONFIG[type];
  return (
    <div role={type === 'error' ? 'alert' : 'status'} className={clsx('flex items-start gap-2.5 rounded-lg border px-4 py-3', cfg.classes)}>
      <span className="mt-0.5 shrink-0">{cfg.icon}</span>
      <div className="text-body-sm leading-relaxed">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}

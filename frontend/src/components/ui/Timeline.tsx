import { Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface TimelineStep {
  key: string;
  label: string;
  description?: string;
}

/**
 * Pickup / event status timeline. Horizontal on desktop, vertical on mobile.
 * Status is never conveyed by color alone — completed steps show a check icon,
 * the current step is labeled "Current", and every step keeps a text label.
 */
export function Timeline({ steps, currentIndex }: { steps: TimelineStep[]; currentIndex: number }) {
  return (
    <ol className="flex flex-col sm:flex-row sm:items-start gap-0" aria-label="Progress">
      {steps.map((step, i) => {
        const done = i < currentIndex;
        const current = i === currentIndex;
        return (
          <li key={step.key} className="flex sm:flex-col flex-1 items-start sm:items-center gap-3 sm:gap-2 relative">
            <div className="flex sm:flex-col items-center gap-0 sm:w-full">
              <span
                className={clsx(
                  'flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 z-10 bg-surface-elevated',
                  done && 'bg-brand-primary border-brand-primary text-text-on-brand',
                  current && !done && 'border-brand-primary text-brand-primary',
                  !done && !current && 'border-border text-text-muted'
                )}
                aria-hidden="true"
              >
                {done ? <Check size={16} /> : <span className="text-caption font-bold">{i + 1}</span>}
              </span>
              {i < steps.length - 1 && (
                <span
                  className={clsx(
                    'sm:flex-1 sm:h-0.5 w-0.5 h-8 sm:w-full sm:mt-0 ml-4 sm:ml-0',
                    done ? 'bg-brand-primary' : 'bg-border'
                  )}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="sm:text-center sm:mt-1 pb-4 sm:pb-0">
              <p className={clsx('text-body-sm font-semibold', current ? 'text-brand-primary' : 'text-text-primary')}>
                {step.label} {current && <span className="sr-only">(current step)</span>}
              </p>
              {step.description && <p className="text-caption text-text-muted mt-0.5 max-w-[10rem] sm:mx-auto">{step.description}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import React, { useEffect, useState } from 'react';
import { Sparkles, User, Check } from 'lucide-react';
import { clsx } from 'clsx';

/** Small "AI is involved here" indicator — restrained, no giant glowing brains. */
export function AIBadge({ label = 'AI-powered', tone = 'default' }: { label?: string; tone?: 'default' | 'inverted' }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full',
        tone === 'inverted'
          ? 'text-white bg-white/20'
          : 'text-brand-accent-strong bg-brand-accent/15'
      )}
    >
      <Sparkles size={11} /> {label}
    </span>
  );
}

export function AIMessage({ role, children }: { role: 'user' | 'assistant'; children: React.ReactNode }) {
  const isUser = role === 'user';
  return (
    <div className={clsx('flex gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}>
      <div
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          isUser ? 'bg-brand-primary text-text-on-brand' : 'bg-brand-accent/20 text-brand-accent-strong'
        )}
        aria-hidden="true"
      >
        {isUser ? <User size={14} /> : <Sparkles size={14} />}
      </div>
      <div
        className={clsx(
          'max-w-[82%] rounded-2xl px-4 py-3 text-body-sm leading-relaxed',
          isUser
            ? 'bg-brand-primary text-text-on-brand rounded-tr-sm'
            : 'bg-surface-sunken text-text-primary rounded-tl-sm border border-border-subtle'
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function AITypingIndicator() {
  return (
    <div className="flex gap-2.5" aria-live="polite">
      <div className="w-8 h-8 rounded-full bg-brand-accent/20 text-brand-accent-strong flex items-center justify-center shrink-0" aria-hidden="true">
        <Sparkles size={14} />
      </div>
      <div className="bg-surface-sunken border border-border-subtle rounded-2xl rounded-tl-sm px-4 py-3">
        <span className="sr-only">EcoSetu AI is typing…</span>
        <div className="flex gap-1" aria-hidden="true">
          {[0, 1, 2].map(i => (
            <span key={i} className="w-1.5 h-1.5 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Meaningful multi-stage "AI is working" experience — not a spinner. */
export function AIProcessing({ stages, activeIndex }: { stages: string[]; activeIndex: number }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">{stages[activeIndex]}</span>
      {stages.map((stage, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={stage} className="flex items-center gap-3" aria-hidden="true">
            <span
              className={clsx(
                'flex items-center justify-center w-6 h-6 rounded-full shrink-0 border-2 transition-colors duration-240',
                done && 'bg-brand-primary border-brand-primary text-text-on-brand',
                active && 'border-brand-primary text-brand-primary',
                !done && !active && 'border-border text-transparent'
              )}
            >
              {done ? <Check size={13} /> : active ? <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse-soft" /> : null}
            </span>
            <span className={clsx('text-body-sm', active ? 'text-text-primary font-semibold' : done ? 'text-text-muted' : 'text-text-muted/60')}>
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/** Drives an AIProcessing sequence through a list of stages over a total duration. */
export function useStagedProcessing(stageCount: number, active: boolean, totalMs = 2200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) { setIndex(0); return; }
    const per = totalMs / stageCount;
    const timers = Array.from({ length: stageCount }).map((_, i) =>
      setTimeout(() => setIndex(i), per * i)
    );
    return () => timers.forEach(clearTimeout);
  }, [active, stageCount, totalMs]);
  return index;
}

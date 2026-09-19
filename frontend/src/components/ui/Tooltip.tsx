import React, { useId, useState } from 'react';
import { clsx } from 'clsx';

export function Tooltip({ label, children, side = 'top' }: { label: string; children: React.ReactElement<{ 'aria-describedby'?: string }>; side?: 'top' | 'bottom' }) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {React.cloneElement(children, { 'aria-describedby': visible ? id : undefined })}
      {visible && (
        <span
          id={id}
          role="tooltip"
          className={clsx(
            'absolute left-1/2 -translate-x-1/2 z-50 whitespace-nowrap px-2.5 py-1.5 rounded-md bg-charcoal text-white text-[11px] font-medium shadow-elevated animate-fade-up',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}

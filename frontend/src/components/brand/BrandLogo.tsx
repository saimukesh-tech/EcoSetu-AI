import { clsx } from 'clsx';

interface BrandLogoProps {
  size?: number;
  withWordmark?: boolean;
  wordmarkClassName?: string;
  taglineClassName?: string;
  showTagline?: boolean;
  className?: string;
}

/**
 * Official EcoSetu AI logo mark. Never distorted, stretched, or recolored —
 * always rendered at 1:1 aspect ratio with consistent surrounding whitespace.
 */
export function BrandLogo({
  size = 40,
  withWordmark = true,
  wordmarkClassName,
  taglineClassName,
  showTagline = false,
  className,
}: BrandLogoProps) {
  return (
    <span className={clsx('inline-flex items-center gap-2.5', className)}>
      <img
        src="/ecosetu-logo.png"
        alt="EcoSetu AI"
        width={size}
        height={size}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size }}
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className={clsx('font-display font-extrabold tracking-tight text-text-primary', wordmarkClassName)}>
            Eco<span className="text-brand-primary">Setu</span>
            <span className="ml-1 align-top text-[0.55em] font-bold text-brand-accent-strong">AI</span>
          </span>
          {showTagline && (
            <span className={clsx('text-caption text-text-muted mt-0.5', taglineClassName)}>
              Bridging Celebrations to a Circular Future
            </span>
          )}
        </span>
      )}
    </span>
  );
}

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BadgePremiumProps {
  label?: string;
  variant?: 'pill' | 'scalloped' | 'minimal';
  className?: string;
}

export function BadgePremium({
  label = 'PREMIUM',
  variant = 'pill',
  className,
}: BadgePremiumProps) {
  if (variant === 'scalloped') {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center p-2 text-center select-none',
          className
        )}
      >
        <svg
          className="absolute inset-0 h-full w-full text-hk-champagne/80"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="50" cy="50" r="44" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="38" />
        </svg>
        <div className="relative px-3 py-1 flex flex-col items-center">
          <Sparkles className="h-3 w-3 text-hk-taupe mb-0.5" />
          <span className="font-editorial text-xs font-semibold tracking-widest text-hk-taupe">
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
        'border border-hk-champagne/80 bg-hk-ivory text-hk-taupe shadow-sm',
        'font-manrope text-[11px] font-bold tracking-widest uppercase select-none',
        className
      )}
    >
      <Sparkles className="h-3 w-3 text-hk-champagne" />
      <span>{label}</span>
    </span>
  );
}

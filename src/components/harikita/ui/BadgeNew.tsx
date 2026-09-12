import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeNewProps {
  label?: string;
  variant?: 'octagonal' | 'pill';
  className?: string;
}

export function BadgeNew({
  label = 'NEW',
  variant = 'octagonal',
  className,
}: BadgeNewProps) {
  if (variant === 'octagonal') {
    return (
      <div
        className={cn(
          'relative inline-flex items-center justify-center select-none px-2.5 py-1',
          className
        )}
      >
        <svg
          className="absolute inset-0 h-full w-full text-hk-taupe"
          viewBox="0 0 60 28"
          fill="currentColor"
        >
          <polygon points="6,0 54,0 60,6 60,22 54,28 6,28 0,22 0,6" />
        </svg>
        <span className="relative z-10 font-manrope text-[10px] font-bold tracking-widest text-white uppercase">
          {label}
        </span>
      </div>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5',
        'bg-hk-taupe text-white',
        'font-manrope text-[10px] font-bold tracking-widest uppercase select-none',
        className
      )}
    >
      {label}
    </span>
  );
}

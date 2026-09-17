import React from 'react';
import { cn } from '@/lib/utils';

export interface DecorativeDividerProps {
  variant?: 'diamond' | 'botanical' | 'minimal' | 'loop';
  color?: 'taupe' | 'champagne' | 'charcoal';
  className?: string;
}

export function DecorativeDivider({
  variant = 'diamond',
  color = 'champagne',
  className,
}: DecorativeDividerProps) {
  const colorClasses = {
    taupe: 'text-hk-taupe',
    champagne: 'text-hk-champagne',
    charcoal: 'text-hk-charcoal',
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('relative flex items-center justify-center w-full py-4', colorClasses[color], className)}>
        <div className="h-[1px] w-full bg-current opacity-30" />
        <div className="absolute h-1.5 w-1.5 rotate-45 border border-current bg-white" />
      </div>
    );
  }

  if (variant === 'loop') {
    return (
      <div className={cn('flex items-center justify-center w-full py-4', colorClasses[color], className)}>
        <svg className="h-6 w-48 max-w-full" viewBox="0 0 200 40" fill="none">
          <line x1="10" y1="20" x2="80" y2="20" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          <circle cx="100" cy="20" r="8" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="20" r="3" fill="currentColor" />
          <line x1="120" y1="20" x2="190" y2="20" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    );
  }

  if (variant === 'botanical') {
    return (
      <div className={cn('flex items-center justify-center w-full py-4', colorClasses[color], className)}>
        <div className="h-[1px] w-20 bg-current opacity-40" />
        <svg className="mx-3 h-5 w-10 shrink-0" viewBox="0 0 40 20" fill="none">
          <path
            d="M5 10 C15 5 25 15 35 10 M20 5 C20 15 20 15 20 15"
            stroke="currentColor"
            strokeWidth="1.2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <div className="h-[1px] w-20 bg-current opacity-40" />
      </div>
    );
  }

  // default 'diamond'
  return (
    <div className={cn('flex items-center justify-center w-full py-4', colorClasses[color], className)}>
      <svg className="h-5 w-64 max-w-full" viewBox="0 0 200 40" fill="none">
        <line x1="5" y1="20" x2="88" y2="20" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polygon points="100,14 106,20 100,26 94,20" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="100" cy="20" r="1.5" fill="currentColor" />
        <line x1="112" y1="20" x2="195" y2="20" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}

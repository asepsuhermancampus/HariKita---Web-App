import React from 'react';
import { cn } from '@/lib/utils';

export interface VintageStampBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  date?: string;
  location?: string;
  rotation?: number;
  className?: string;
}

export function VintageStampBadge({
  size = 'md',
  date = 'EST. 2026',
  location = 'KEBUMEN',
  rotation = -6,
  className,
}: VintageStampBadgeProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-[10px]',
    md: 'w-24 h-24 text-xs',
    lg: 'w-32 h-32 text-sm',
  };

  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 select-none p-1 transition-transform',
        'text-hk-taupe/80 hover:text-hk-taupe',
        sizeClasses[size],
        className
      )}
    >
      <svg
        className="h-full w-full"
        viewBox="0 0 120 120"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="60" cy="60" r="56" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="60" cy="60" r="50" strokeWidth="1" />
        <text
          x="60"
          y="44"
          textAnchor="middle"
          className="font-editorial font-bold uppercase tracking-widest text-[11px] fill-current stroke-none"
        >
          {location}
        </text>
        <text
          x="60"
          y="62"
          textAnchor="middle"
          className="font-editorial font-semibold italic text-[15px] fill-current stroke-none"
        >
          HariKita
        </text>
        <text
          x="60"
          y="78"
          textAnchor="middle"
          className="font-manrope font-semibold tracking-widest text-[8px] fill-current stroke-none"
        >
          {date}
        </text>
        <line x1="28" y1="86" x2="92" y2="86" strokeWidth="0.8" strokeDasharray="2 2" />
      </svg>
    </div>
  );
}
